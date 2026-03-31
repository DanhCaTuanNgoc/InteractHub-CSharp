using System.ComponentModel.DataAnnotations;

namespace InteractHub.API.DTOs.Request;

public class AddCommentRequest
{
    [Required]
    [StringLength(1000, MinimumLength = 1)]
    public string Content { get; set; } = string.Empty;
}
