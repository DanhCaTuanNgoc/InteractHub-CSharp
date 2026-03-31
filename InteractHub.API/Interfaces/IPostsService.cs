using InteractHub.API.DTOs.Request;
using InteractHub.API.DTOs.Response;

namespace InteractHub.API.Interfaces;

public interface IPostsService
{
    Task<List<PostResponse>> GetFeedAsync();
    Task<PostResponse?> GetByIdAsync(Guid id);
    Task<PostResponse> CreateAsync(string userId, CreatePostRequest request);
    Task<PostResponse?> UpdateAsync(Guid id, string userId, bool isAdmin, UpdatePostRequest request);
    Task<bool> DeleteAsync(Guid id, string userId, bool isAdmin);
    Task<PostResponse?> ToggleLikeAsync(Guid id, string userId);
    Task<CommentResponse?> AddCommentAsync(Guid id, string userId, AddCommentRequest request);
    Task<PostResponse?> ShareAsync(Guid id, string userId);
    Task<bool> ReportAsync(Guid id, string userId, CreateReportRequest request);
}
