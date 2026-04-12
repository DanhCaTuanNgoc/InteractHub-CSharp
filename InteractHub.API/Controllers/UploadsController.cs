using System.Security.Claims;
using InteractHub.API.DTOs.Common;
using InteractHub.API.DTOs.Request;
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
    private readonly ILogger<UploadsController> _logger;

    public UploadsController(IFileUploadService fileUploadService, ILogger<UploadsController> logger)
    {
        _fileUploadService = fileUploadService;
        _logger = logger;
    }

    [HttpPost("image")]
    [Consumes("multipart/form-data")]
    [RequestSizeLimit(5 * 1024 * 1024)]
    public async Task<IActionResult> UploadImage([FromForm] UploadImageRequest request, CancellationToken cancellationToken)
    {
        var file = request.File;
        var traceId = Request.Headers["X-Upload-Trace-Id"].ToString();
        if (string.IsNullOrWhiteSpace(traceId))
        {
            traceId = HttpContext.TraceIdentifier;
        }

        _logger.LogInformation(
            "[UPLOAD][API_START] TraceId={TraceId}, Scheme={Scheme}, Host={Host}, Path={Path}, ContentLength={ContentLength}, HasAuthHeader={HasAuthHeader}, FileName={FileName}, FileSize={FileSize}, ContentType={ContentType}",
            traceId,
            Request.Scheme,
            Request.Host.Value,
            Request.Path.Value,
            Request.ContentLength,
            Request.Headers.ContainsKey("Authorization"),
            file?.FileName,
            file?.Length,
            file?.ContentType);

        if (file is null)
        {
            _logger.LogWarning("[UPLOAD][API_BAD_REQUEST] TraceId={TraceId}, Reason=Missing file", traceId);
            return BadRequest(ApiResponse<FileUploadResponse>.Fail("Thiếu file upload."));
        }

        try
        {
            var userId = GetCurrentUserId();
            var uploaded = await _fileUploadService.UploadImageAsync(file, userId, cancellationToken);
            _logger.LogInformation(
                "[UPLOAD][API_SUCCESS] TraceId={TraceId}, UserId={UserId}, Url={Url}, Size={Size}, ContentType={ContentType}",
                traceId,
                userId,
                uploaded.Url,
                uploaded.Size,
                uploaded.ContentType);

            return Ok(ApiResponse<FileUploadResponse>.Ok(uploaded, "Upload ảnh thành công."));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[UPLOAD][API_ERROR] TraceId={TraceId}, Message={Message}", traceId, ex.Message);
            throw;
        }
    }

    private string GetCurrentUserId()
    {
        return User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue(ClaimTypes.Name)
            ?? throw new UnauthorizedAccessException("Không xác định được người dùng hiện tại.");
    }
}
