using System.ComponentModel.DataAnnotations;

namespace InteractHub.API.Entities;

public class PostReport
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid PostId { get; set; }
    public Post Post { get; set; } = null!;

    public string UserId { get; set; } = string.Empty;
    public User User { get; set; } = null!;

    [Required]
    [MaxLength(300)]
    public string Reason { get; set; } = string.Empty;

    [MaxLength(60)]
    public string Status { get; set; } = "Open";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
