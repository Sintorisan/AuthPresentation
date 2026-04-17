using Auth.API.Models.Dtos;
using Auth.API.Services;

namespace Auth.API.Endpoints;

public static class JwtAuthEndpoints
{
    public static void MapJwtAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("api/v2");

        group.MapPost("/auth/non-exp-login", async (LoginDto dto, AuthService auth, JwtService jwt) =>
        {
            var user = await auth.ValidateUser(dto);
            if (user == null)
            {
                return Results.Unauthorized();
            }

            var token = jwt.GenerateToken(user.Id, false);

            return Results.Ok(new { token });
        });

        group.MapGet("/auth/protected-no-exp", (HttpContext ctx, JwtService jwt) =>
        {
            var authHeader = ctx.Request.Headers["Authorization"].FirstOrDefault();

            if (authHeader == null)
                return Results.Unauthorized();

            var token = authHeader.Split(" ").Last();

            var isValid = jwt.ValidateToken(token, false); // 👈 ignore lifetime

            return isValid ? Results.Ok("Valid (no exp)") : Results.Unauthorized();
        });

        group.MapPost("/auth/exp-login", async (LoginDto dto, AuthService auth, JwtService jwt) =>
        {
            var user = await auth.ValidateUser(dto);
            if (user == null)
            {
                return Results.Unauthorized();
            }

            var token = jwt.GenerateToken(user.Id, true);

            return Results.Ok(new { token });
        });

        group.MapGet("/auth/protected", (HttpContext ctx, JwtService jwt) =>
        {
            var authHeader = ctx.Request.Headers["Authorization"].FirstOrDefault();

            if (authHeader == null)
                return Results.Unauthorized();

            var token = authHeader.Split(" ").Last();

            var isValid = jwt.ValidateToken(token);

            return isValid ? Results.Ok() : Results.Unauthorized();
        });
    }
}
