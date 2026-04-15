using Auth.API.Infrastructure.Data;
using Auth.API.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace Auth.API.Infrastructure.Repositories;

public class UserRepository
{

    private readonly UserDbContext _context;

    public UserRepository(UserDbContext context)
    {
        _context = context;
    }


    public async Task RegisterUserAsync(User user)
    {
        await _context.Users.AddAsync(user);
        await _context.SaveChangesAsync();
    }

    public bool IsExistingEmail(string email)
    {
        return _context.Users.Any(u => u.Email == email);
    }

    public async Task<User?> GetUserByEmailAsync(string email)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);

        return user;
    }
}
