using InteractHub.API.DTOs.Request;
using InteractHub.API.DTOs.Response;

namespace InteractHub.API.Interfaces;

public interface IUsersService
{
    Task<UserSummaryResponse?> GetProfileAsync(string userId);
    Task<UserSummaryResponse?> UpdateProfileAsync(string userId, UpdateProfileRequest request);
    Task<List<UserSummaryResponse>> SearchAsync(string keyword);
}
