using System.ComponentModel.DataAnnotations;

namespace InteractHub.API.DTOs.Request;

public class CreateReportRequest
{
    [Required]
    [StringLength(300, MinimumLength = 5)]
    public string Reason { get; set; } = string.Empty;
}
