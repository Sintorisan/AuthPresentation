namespace Auth.API.Models.Dtos;


public record V1Response(
    string Email,
    string Password,
    string HashedPassword
    );
