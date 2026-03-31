using InteractHub.API.DTOs.Request;
using InteractHub.API.DTOs.Response;
using InteractHub.API.Entities;
using InteractHub.API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace InteractHub.API.Services;

public class UsersService : IUsersService
{
    private readonly IRepository<User> _usersRepository;

    public UsersService(IRepository<User> usersRepository)
    {
        _usersRepository = usersRepository;
    }

    public async Task<UserSummaryResponse?> GetProfileAsync(string userId)
    {
        var user = await _usersRepository.Query().FirstOrDefaultAsync(u => u.Id == userId);
        return user?.ToUserSummary();
    }

    public async Task<UserSummaryResponse?> UpdateProfileAsync(string userId, UpdateProfileRequest request)
    {
        var user = await _usersRepository.Query().FirstOrDefaultAsync(u => u.Id == userId);
        if (user is null)
        {
            return null;
        }

        user.FullName = request.FullName;
        user.Bio = request.Bio;
        user.AvatarUrl = request.AvatarUrl;

        _usersRepository.Update(user);
        await _usersRepository.SaveChangesAsync();

        return user.ToUserSummary();
    }

    public async Task<List<UserSummaryResponse>> SearchAsync(string keyword)
    {
        keyword = keyword.Trim();

        return await _usersRepository.Query()
            .Where(u =>
                u.UserName!.Contains(keyword) ||
                u.FullName.Contains(keyword) ||
                u.Email!.Contains(keyword))
            .OrderBy(u => u.UserName)
            .Take(20)
            .Select(u => u.ToUserSummary())
            .ToListAsync();
    }
}
