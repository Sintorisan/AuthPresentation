using Auth.API.Models.Dtos;
using Auth.API.Services;

namespace Auth.API.Endpoints;

public static class RolesAuthEndpoints
{
    public static void MapRolesAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v4");

        group.MapPost("auth/register", async (RegisterDto dto, AuthService auth) =>
        {
            if (auth.IsExistingUser(dto.Email))
            {
                return Results.BadRequest("Email already exisists.");
            }

            var result = await auth.RegisterAsync(dto);

            return Results.Ok(result);
        });

        group.MapPost("/auth/login", async (LoginDto dto, AuthService auth, TokenService tokenService) =>
        {
            var user = await auth.ValidateUser(dto);
            if (user == null)
            {
                return Results.Unauthorized();
            }

            var refreshToken = await tokenService.GenerateRefresh(user.Id);
            var accessToken = tokenService.GenerateTokenWithRole(user);

            return Results.Ok(new { refreshToken, accessToken });
        });

        group.MapGet("/auth/public", () =>
        {
            return Results.Ok("Publik API alla kan nå.");
        });

        group.MapGet("/auth/user", (HttpContext ctx, AuthService auth, TokenService tokenService) =>
        {

            var authHeader = ctx.Request.Headers["Authorization"].FirstOrDefault();
            if (authHeader == null)
            {
                return Results.Unauthorized();
            }

            var token = authHeader.Split(" ").Last();

            var isValidToken = tokenService.ValidateToken(token);
            if (!isValidToken)
            {
                return Results.Unauthorized();
            }

            var isValid = tokenService.HasRoleOf(token, ["user", "admin"]);

            return isValid ? Results.Ok("En inloggad användare och admin kan nå.") : Results.Unauthorized();
        });

        group.MapGet("/auth/admin", (HttpContext ctx, AuthService auth, TokenService tokenService) =>
        {

            var authHeader = ctx.Request.Headers["Authorization"].FirstOrDefault();
            if (authHeader == null)
            {
                return Results.Unauthorized();
            }

            var token = authHeader.Split(" ").Last();
            var isValid = tokenService.HasRoleOf(token, ["admin"]);

            return isValid ? Results.Ok("Bara andmin har tillgång") : Results.Unauthorized();
        });

    }
}
