using InteractHub.API.DTOs.Request;
using InteractHub.API.DTOs.Response;
using InteractHub.API.Entities;
using InteractHub.API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace InteractHub.API.Services;

public class StoriesService : IStoriesService
{
    private readonly IRepository<Story> _storiesRepository;
    private readonly IRepository<Friendship> _friendshipsRepository;

    public StoriesService(IRepository<Story> storiesRepository, IRepository<Friendship> friendshipsRepository)
    {
        _storiesRepository = storiesRepository;
        _friendshipsRepository = friendshipsRepository;
    }

    public async Task<List<StoryResponse>> GetActiveStoriesAsync(string userId)
    {
        var friendIds = await _friendshipsRepository.Query()
            .Where(f =>
                f.Status == FriendshipStatus.Accepted &&
                (f.SenderId == userId || f.ReceiverId == userId))
            .Select(f => f.SenderId == userId ? f.ReceiverId : f.SenderId)
            .Distinct()
            .ToListAsync();

        friendIds.Add(userId);

        var stories = await _storiesRepository.Query()
            .Include(s => s.User)
            .Where(s => s.ExpiresAt > DateTime.UtcNow && friendIds.Contains(s.UserId))
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync();

        return stories.Select(s => s.ToStoryResponse()).ToList();
    }

    public async Task<StoryResponse> CreateAsync(string userId, CreateStoryRequest request)
    {
        var story = new Story
        {
            UserId = userId,
            MediaUrl = request.MediaUrl,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddHours(24)
        };

        await _storiesRepository.AddAsync(story);
        await _storiesRepository.SaveChangesAsync();

        var created = await _storiesRepository.Query()
            .Include(s => s.User)
            .FirstAsync(s => s.Id == story.Id);

        return created.ToStoryResponse();
    }

    public async Task<bool> DeleteAsync(Guid storyId, string userId, bool isAdmin)
    {
        var story = await _storiesRepository.Query().FirstOrDefaultAsync(s => s.Id == storyId);
        if (story is null)
        {
            return false;
        }

        if (!isAdmin && story.UserId != userId)
        {
            throw new UnauthorizedAccessException("Bạn không có quyền xóa story này.");
        }

        _storiesRepository.Delete(story);
        await _storiesRepository.SaveChangesAsync();
        return true;
    }
}
