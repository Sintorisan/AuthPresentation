using Auth.API.Models.Dtos;
using Auth.API.Services;

namespace Auth.API.Endpoints;

public static class BasicAuthEndpoints
{
    public static void MapBasicAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1");

        group.MapPost("/auth/register", async (RegisterDto dto, AuthService auth) =>
        {
            if (auth.IsExistingUser(dto.Email))
            {
                return Results.BadRequest("Existing user");
            }

            var result = await auth.RegisterAsync(dto);
            return Results.Ok(result);
        });

        group.MapPost("/auth/login", async (LoginDto dto, AuthService auth) =>
        {
            var user = await auth.ValidateUser(dto);
            if (user == null)
            {
                return Results.Unauthorized();
            }

            var result = await auth.CreateV1Response(user);
            return Results.Ok(result);
        });
    }
}
