namespace Auth.API.Models.Dtos;

public record RegisterDto(
    string Email,
    string Password
    );

public record LoginDto(
    string Email,
    string Password
    );

public record V1Response(
    string Email,
    string Password,
    string HashedPassword
    );
