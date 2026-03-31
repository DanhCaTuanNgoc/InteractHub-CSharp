using System.ComponentModel.DataAnnotations;

namespace InteractHub.API.DTOs.Request;

public class CreateStoryRequest
{
    [Required]
    [Url]
    [StringLength(512)]
    public string MediaUrl { get; set; } = string.Empty;
}
