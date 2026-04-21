using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Auth.API.Infrastructure.Repositories;
using Auth.API.Models.Entities;
using Microsoft.IdentityModel.Tokens;


namespace Auth.API.Services;

public class TokenService
{
    private readonly TokenRepository _tokenRepository;


    private readonly string _issuer = "authDemo";
    private readonly string _key = "mysupersecretsuperkeyfornoonetofigureout";


    public TokenService(TokenRepository tokenRepository)
    {
        _tokenRepository = tokenRepository;
    }


    public string GenerateToken(string userId, bool includeExp = true)
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, userId.ToString())
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_key));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var tokenDescriptor = new JwtSecurityToken(
            issuer: _issuer,
            audience: _issuer,
            claims: claims,
            signingCredentials: creds,
            expires: includeExp
                ? DateTime.UtcNow.AddSeconds(10)
                : null
        );

        return new JwtSecurityTokenHandler().WriteToken(tokenDescriptor);
    }

    public bool ValidateToken(string token, bool validateLifetime = true)
    {
        var handler = new JwtSecurityTokenHandler();

        try
        {
            var key = Encoding.UTF8.GetBytes(_key);

            handler.ValidateToken(token, new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidIssuer = _issuer,
                ValidAudience = _issuer,
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ClockSkew = TimeSpan.Zero,
                ValidateLifetime = validateLifetime
            }, out _);

            return true;
        }
        catch
        {
            return false;
        }
    }

    public async Task<string> GenerateRefresh(string userId)
    {
        var randomBytes = new byte[64];

        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomBytes);

        var token = Convert.ToBase64String(randomBytes);

        await RegisterRefreshToken(token, userId);

        return token;
    }

    private async Task RegisterRefreshToken(string token, string userId)
    {
        var refreshToken = new RefreshToken
        {
            Token = token,
            UserId = userId,
            ExpTime = DateTime.UtcNow.AddDays(7)
        };

        await _tokenRepository.AddTokenAsync(refreshToken);
    }

    public async Task<RefreshToken?> ValidateRefreshToken(string refreshToken)
    {
        var existingRefreshToken = await _tokenRepository.GetRefreshTokenAsync(refreshToken);
        if (existingRefreshToken == null)
        {
            return null;
        }
        if (existingRefreshToken.ExpTime < DateTime.UtcNow)
        {
            return null;
        }
        return existingRefreshToken;
    }

    public string GenerateTokenWithRole(User user)
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Role, user.Role)
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_key));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var tokenDescriptor = new JwtSecurityToken(
            issuer: _issuer,
            audience: _issuer,
            claims: claims,
            signingCredentials: creds,
            expires: DateTime.UtcNow.AddDays(1)
        );

        return new JwtSecurityTokenHandler().WriteToken(tokenDescriptor);
    }

    public bool HasRoleOf(string token, params string[] roles)
    {
        var handler = new JwtSecurityTokenHandler();
        var jsonToken = handler.ReadToken(token) as JwtSecurityToken;
        var role = jsonToken.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Role).Value;

        return roles.Contains(role.ToLower());
    }
}


