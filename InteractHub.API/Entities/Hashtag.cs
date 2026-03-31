using System.ComponentModel.DataAnnotations;

namespace InteractHub.API.Entities;

public class Hashtag
{
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [MaxLength(80)]
    public string Name { get; set; } = string.Empty;

    public ICollection<PostHashtag> PostHashtags { get; set; } = new List<PostHashtag>();
}
