namespace InteractHub.API.DTOs.Response;

public class FriendshipResponse
{
    public Guid Id { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public UserSummaryResponse Sender { get; set; } = new();
    public UserSummaryResponse Receiver { get; set; } = new();
}
