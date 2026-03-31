using System.ComponentModel.DataAnnotations;

namespace InteractHub.API.DTOs.Request;

public class UpdatePostRequest
{
    [Required]
    [StringLength(2000, MinimumLength = 1)]
    public string Content { get; set; } = string.Empty;

    [StringLength(512)]
    public string? ImageUrl { get; set; }
}
