using System.ComponentModel.DataAnnotations;

namespace InteractHub.API.Entities;

public class Comment
{
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [MaxLength(1000)]
    public string Content { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public string UserId { get; set; } = string.Empty;
    public User User { get; set; } = null!;

    public Guid PostId { get; set; }
    public Post Post { get; set; } = null!;

    public ICollection<Like> Likes { get; set; } = new List<Like>();
}
