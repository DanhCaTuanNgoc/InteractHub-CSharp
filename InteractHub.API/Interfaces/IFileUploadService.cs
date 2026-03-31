using InteractHub.API.DTOs.Response;
using Microsoft.AspNetCore.Http;

namespace InteractHub.API.Interfaces;

public interface IFileUploadService
{
    Task<FileUploadResponse> UploadImageAsync(IFormFile file, string userId, CancellationToken cancellationToken = default);
}
