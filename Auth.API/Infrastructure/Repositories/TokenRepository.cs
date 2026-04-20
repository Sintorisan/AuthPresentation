using Auth.API.Infrastructure.Data;
using Auth.API.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace Auth.API.Infrastructure.Repositories;

public class TokenRepository
{
    private readonly UserDbContext _context;

    public TokenRepository(UserDbContext context)
    {
        _context = context;
    }

    public async Task AddTokenAsync(RefreshToken token)
    {
        await _context.RefreshTokens.AddAsync(token);
        await _context.SaveChangesAsync();
    }

    public async Task<RefreshToken?> GetRefreshTokenAsync(string refreshToken)
    {
        return await _context.RefreshTokens.FirstOrDefaultAsync(rt => rt.Token == refreshToken);
    }
}
