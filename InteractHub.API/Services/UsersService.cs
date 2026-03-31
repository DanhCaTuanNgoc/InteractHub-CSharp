using InteractHub.API.DTOs.Common;
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

    public async Task<PagedResult<UserSummaryResponse>> SearchAsync(string keyword, int page, int pageSize)
    {
        keyword = keyword.Trim();
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 50);

        var query = _usersRepository.Query()
            .Where(u =>
                u.UserName!.Contains(keyword) ||
                u.FullName.Contains(keyword) ||
                u.Email!.Contains(keyword))
            .OrderBy(u => u.UserName);

        var totalCount = await query.CountAsync();

        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(u => u.ToUserSummary())
            .ToListAsync();

        return PagedResult<UserSummaryResponse>.Create(items, page, pageSize, totalCount);
    }
}
