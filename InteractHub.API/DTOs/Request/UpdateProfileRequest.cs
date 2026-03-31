using System.ComponentModel.DataAnnotations;

namespace InteractHub.API.DTOs.Request;

public class UpdateProfileRequest
{
    [Required]
    [StringLength(100, MinimumLength = 2)]
    public string FullName { get; set; } = string.Empty;

    [StringLength(280)]
    public string? Bio { get; set; }

    [Url]
    [StringLength(512)]
    public string? AvatarUrl { get; set; }
}
