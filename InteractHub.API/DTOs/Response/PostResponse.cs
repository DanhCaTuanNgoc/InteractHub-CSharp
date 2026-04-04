namespace InteractHub.API.DTOs.Response;

public class PostResponse
{
    public Guid Id { get; set; }
    public string Content { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public DateTime CreatedAt { get; set; }
    public Guid? OriginalPostId { get; set; }
    public PostResponse? OriginalPost { get; set; }
    public int LikeCount { get; set; }
    public int CommentCount { get; set; }
    public UserSummaryResponse User { get; set; } = new();
    public List<string> Hashtags { get; set; } = new();
    public List<CommentResponse> RecentComments { get; set; } = new();
}
