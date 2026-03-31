namespace InteractHub.API.DTOs.Response;

public class PostReportResponse
{
    public Guid Id { get; set; }
    public Guid PostId { get; set; }
    public string Reason { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public UserSummaryResponse Reporter { get; set; } = new();
}
