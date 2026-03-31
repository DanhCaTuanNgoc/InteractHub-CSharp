using InteractHub.API.DTOs.Request;
using InteractHub.API.DTOs.Response;

namespace InteractHub.API.Interfaces;

public interface IStoriesService
{
    Task<List<StoryResponse>> GetActiveStoriesAsync(string userId);
    Task<StoryResponse> CreateAsync(string userId, CreateStoryRequest request);
    Task<bool> DeleteAsync(Guid storyId, string userId, bool isAdmin);
}
