using Microsoft.AspNetCore.Http;

namespace InteractHub.API.DTOs.Request;

public class UploadImageRequest
{
    public IFormFile File { get; set; } = default!;
}