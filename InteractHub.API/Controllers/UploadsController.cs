using System.Security.Claims;
using InteractHub.API.DTOs.Common;
using InteractHub.API.DTOs.Response;
using InteractHub.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InteractHub.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UploadsController : ControllerBase
{
    private readonly IFileUploadService _fileUploadService;

    public UploadsController(IFileUploadService fileUploadService)
    {
        _fileUploadService = fileUploadService;
    }

    [HttpPost("image")]
    [RequestSizeLimit(5 * 1024 * 1024)]
    public async Task<IActionResult> UploadImage([FromForm] IFormFile file, CancellationToken cancellationToken)
    {
        if (file is null)
        {
            return BadRequest(ApiResponse<FileUploadResponse>.Fail("Thiếu file upload."));
        }

        var uploaded = await _fileUploadService.UploadImageAsync(file, GetCurrentUserId(), cancellationToken);
        return Ok(ApiResponse<FileUploadResponse>.Ok(uploaded, "Upload ảnh thành công."));
    }

    private string GetCurrentUserId()
    {
        return User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue(ClaimTypes.Name)
            ?? throw new UnauthorizedAccessException("Không xác định được người dùng hiện tại.");
    }
}
