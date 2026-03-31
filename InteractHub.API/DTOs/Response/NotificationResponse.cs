namespace InteractHub.API.DTOs.Response;

public class NotificationResponse
{
    public Guid Id { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; }
    public UserSummaryResponse Sender { get; set; } = new();
}
