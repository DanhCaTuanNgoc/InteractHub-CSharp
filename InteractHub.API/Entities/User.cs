using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Identity;

namespace InteractHub.API.Entities;

public class User : IdentityUser
{
    [MaxLength(100)]
    public string FullName { get; set; } = string.Empty;

    [MaxLength(512)]
    public string? AvatarUrl { get; set; }

    [MaxLength(280)]
    public string? Bio { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Post> Posts { get; set; } = new List<Post>();
    public ICollection<Comment> Comments { get; set; } = new List<Comment>();
    public ICollection<Like> Likes { get; set; } = new List<Like>();
    public ICollection<Story> Stories { get; set; } = new List<Story>();
}