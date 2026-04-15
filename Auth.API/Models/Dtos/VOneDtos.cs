namespace Auth.API.Models.Dtos;

public record RegisterDtoV1(
    string Email,
    string Password
    );

public record LoginDtoV1(
    string Email,
    string Password
    );

public record V1Response(
    string Email,
    string Password,
    string HashedPassword
    );
