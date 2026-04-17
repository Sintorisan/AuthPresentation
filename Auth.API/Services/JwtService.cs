using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;


namespace Auth.API.Services;

public class JwtService
{
    private readonly string _issuer = "authDemo";
    private readonly string _key = "mysupersecretsuperkeyfornoonetofigureout";

    public string GenerateToken(string userId, bool includeExp)
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
}


