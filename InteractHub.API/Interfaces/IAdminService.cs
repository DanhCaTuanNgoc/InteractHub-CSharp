using InteractHub.API.DTOs.Request;
using InteractHub.API.DTOs.Response;

namespace InteractHub.API.Interfaces;

public interface IAdminService
{
    Task<List<PostReportResponse>> GetReportsAsync();
    Task<PostReportResponse?> ResolveReportAsync(Guid id, ResolveReportRequest request);
    Task<bool> DeletePostAsync(Guid postId);
}
