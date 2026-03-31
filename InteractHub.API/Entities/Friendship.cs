namespace InteractHub.API.Entities;

public class Friendship
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string SenderId { get; set; } = string.Empty;
    public User Sender { get; set; } = null!;

    public string ReceiverId { get; set; } = string.Empty;
    public User Receiver { get; set; } = null!;

    public FriendshipStatus Status { get; set; } = FriendshipStatus.Pending;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
