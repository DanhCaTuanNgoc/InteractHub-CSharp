namespace InteractHub.API.DTOs.Response;

public class CommentResponse
{
    public Guid Id { get; set; }
    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public UserSummaryResponse User { get; set; } = new();
}
