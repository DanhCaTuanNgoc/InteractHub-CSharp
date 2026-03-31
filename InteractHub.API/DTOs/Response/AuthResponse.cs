namespace InteractHub.API.DTOs.Response;

public class AuthResponse
{
    public string Token { get; set; } = string.Empty;
    public int ExpiresIn { get; set; }
    public UserSummaryResponse User { get; set; } = new();
}
