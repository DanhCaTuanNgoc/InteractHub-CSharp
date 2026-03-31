namespace InteractHub.API.DTOs.Response;

public class StoryResponse
{
    public Guid Id { get; set; }
    public string MediaUrl { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime ExpiresAt { get; set; }
    public UserSummaryResponse User { get; set; } = new();
}
