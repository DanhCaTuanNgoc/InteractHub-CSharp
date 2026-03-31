using System.ComponentModel.DataAnnotations;

namespace InteractHub.API.Entities;

public class Post
{
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [MaxLength(2000)]
    public string Content { get; set; } = string.Empty;

    [MaxLength(512)]
    public string? ImageUrl { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public string UserId { get; set; } = string.Empty;
    public User User { get; set; } = null!;

    public Guid? OriginalPostId { get; set; }
    public Post? OriginalPost { get; set; }
    public ICollection<Post> SharedPosts { get; set; } = new List<Post>();

    public ICollection<Comment> Comments { get; set; } = new List<Comment>();
    public ICollection<Like> Likes { get; set; } = new List<Like>();
    public ICollection<PostHashtag> PostHashtags { get; set; } = new List<PostHashtag>();
    public ICollection<PostReport> Reports { get; set; } = new List<PostReport>();
}
