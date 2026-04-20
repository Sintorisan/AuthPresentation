using Auth.API.Models.Dtos;
using Auth.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace Auth.API.Endpoints;

public static class RefreshAuthEndpoints
{
    public static void MapRefreshAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("api/v3");

        group.MapPost("/auth/login", async (LoginDto dto, [FromServices] AuthService auth, [FromServices] TokenService tokenService) =>
        {
            var user = await auth.ValidateUser(dto);
            if (user == null)
            {
                return Results.Unauthorized();
            }

            var refreshToken = await tokenService.GenerateRefresh(user.Id);
            var accessToken = tokenService.GenerateToken(user.Id);

            return Results.Ok(new { refreshToken, accessToken });
        });

        group.MapGet("/auth/protected", (HttpContext ctx, TokenService tokenService) =>
        {
            var authHeader = ctx.Request.Headers["Authorization"].FirstOrDefault();
            if (authHeader == null)
            {
                return Results.Unauthorized();
            }

            var token = authHeader.Split(" ").Last();
            var isValid = tokenService.ValidateToken(token);

            return isValid ? Results.Ok() : Results.Unauthorized();
        });

        group.MapPost("auth/refresh", async (RefreshDto dto, TokenService tokenService) =>
        {
            var existingRefreshToken = await tokenService.ValidateRefreshToken(dto.RefreshToken);
            if (existingRefreshToken == null)
            {
                return Results.Unauthorized();
            }

            var accessToken = tokenService.GenerateToken(existingRefreshToken.UserId);
            var newRefreshToken = tokenService.GenerateRefresh(existingRefreshToken.UserId);

            return Results.Ok(new { accessToken, newRefreshToken });
        });
    }
}
