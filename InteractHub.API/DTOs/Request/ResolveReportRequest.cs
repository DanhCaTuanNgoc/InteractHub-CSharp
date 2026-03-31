using System.ComponentModel.DataAnnotations;

namespace InteractHub.API.DTOs.Request;

public class ResolveReportRequest
{
    [Required]
    [StringLength(50)]
    public string Status { get; set; } = "Resolved";
}
