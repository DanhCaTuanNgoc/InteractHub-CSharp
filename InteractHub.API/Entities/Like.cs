namespace InteractHub.API.Entities;

public class Like
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public string UserId { get; set; } = string.Empty;
    public User User { get; set; } = null!;

    public Guid? PostId { get; set; }
    public Post? Post { get; set; }

    public Guid? CommentId { get; set; }
    public Comment? Comment { get; set; }
}
