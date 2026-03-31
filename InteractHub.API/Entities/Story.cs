using System.ComponentModel.DataAnnotations;

namespace InteractHub.API.Entities;

public class Story
{
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [MaxLength(512)]
    public string MediaUrl { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime ExpiresAt { get; set; } = DateTime.UtcNow.AddHours(24);

    public string UserId { get; set; } = string.Empty;
    public User User { get; set; } = null!;
}
