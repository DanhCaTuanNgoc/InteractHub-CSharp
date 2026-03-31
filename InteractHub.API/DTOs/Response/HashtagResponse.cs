namespace InteractHub.API.DTOs.Response;

public class HashtagResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int UsageCount { get; set; }
}
