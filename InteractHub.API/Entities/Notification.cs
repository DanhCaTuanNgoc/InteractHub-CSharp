using System.ComponentModel.DataAnnotations;

namespace InteractHub.API.Entities;

public class Notification
{
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [MaxLength(60)]
    public string Type { get; set; } = string.Empty;

    [Required]
    [MaxLength(512)]
    public string Content { get; set; } = string.Empty;

    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public string SenderId { get; set; } = string.Empty;
    public User Sender { get; set; } = null!;

    public string ReceiverId { get; set; } = string.Empty;
    public User Receiver { get; set; } = null!;
}
