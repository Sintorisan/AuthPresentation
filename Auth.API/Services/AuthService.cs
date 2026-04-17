using Auth.API.Models.Dtos;
using Auth.API.Models.Entities;
using Auth.API.Infrastructure.Repositories;


namespace Auth.API.Services;

public class AuthService
{
    private readonly UserRepository _userRepository;

    public AuthService(UserRepository userRepository)
    {
        _userRepository = userRepository;
    }


    public async Task<User?> GetUserByEmailAsync(string email)
    {
        return await _userRepository.GetUserByEmailAsync(email);
    }

    public async Task<bool> RegisterAsync(RegisterDto dto)
    {
        var user = new User
        {
            Email = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Password = dto.Password
        };

        await _userRepository.RegisterUserAsync(user);
        return true;
    }

    public async Task<User?> ValidateUser(LoginDto dto)
    {
        var user = await _userRepository.GetUserByEmailAsync(dto.Email);

        if (user == null)
            return null;

        return IsCorrectPassword(dto.Password, user.PasswordHash) ? user : null;
    }

    public async Task<V1Response> CreateV1Response(User user)
    {
        return new V1Response(user.Email, user.Password, user.PasswordHash);
    }


    public bool IsExistingUser(string email) => _userRepository.IsExistingEmail(email);

    public bool IsCorrectPassword(string password, string hash) => BCrypt.Net.BCrypt.Verify(password, hash);
}
