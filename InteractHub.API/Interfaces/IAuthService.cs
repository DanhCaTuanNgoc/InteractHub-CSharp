using InteractHub.API.DTOs.Request;
using InteractHub.API.DTOs.Response;

namespace InteractHub.API.Interfaces;

public interface IAuthService
{
    Task<AuthResponse> RegisterAsync(RegisterRequest request);
    Task<AuthResponse> LoginAsync(LoginRequest request);
}
