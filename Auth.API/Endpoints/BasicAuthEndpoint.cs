using Auth.API.Models.Dtos;
using Auth.API.Services;

namespace Auth.API.Endpoints;

public static class BasicAuthEndpoints
{
    public static void MapBasicAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1");

        group.MapPost("/auth/register", async (RegisterDtoV1 dto, AuthService auth) =>
        {
            if (auth.IsExistingUser(dto.Email))
            {
                return Results.BadRequest("Existing user");
            }

            var result = await auth.RegisterAsync(dto);
            return Results.Ok(result);
        });

        group.MapPost("/auth/login", async (LoginDtoV1 dto, AuthService auth) =>
        {
            var user = await auth.GetUserByEmailAsync(dto.Email);
            if (user == null)
            {
                return Results.BadRequest("Non-existing user");
            }
            if (!auth.IsCorrectPassword(dto.Password, user.PasswordHash))
            {
                return Results.Unauthorized();
            }

            var result = await auth.CreateV1Response(user);
            return Results.Ok(result);
        });
    }
}
