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
public class NotificationsController : ControllerBase
{
    private readonly INotificationsService _notificationsService;

    public NotificationsController(INotificationsService notificationsService)
    {
        _notificationsService = notificationsService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var data = await _notificationsService.GetAllAsync(GetCurrentUserId());
        return Ok(ApiResponse<List<NotificationResponse>>.Ok(data));
    }

    [HttpPut("{id:guid}/read")]
    public async Task<IActionResult> MarkRead(Guid id)
    {
        var ok = await _notificationsService.MarkReadAsync(id, GetCurrentUserId());
        if (!ok)
        {
            return NotFound(ApiResponse<object>.Fail("Không tìm thấy thông báo."));
        }

        return Ok(ApiResponse<object>.Ok(null, "Đã đánh dấu đã đọc."));
    }

    [HttpPut("read-all")]
    public async Task<IActionResult> MarkAllRead()
    {
        var count = await _notificationsService.MarkAllReadAsync(GetCurrentUserId());
        return Ok(ApiResponse<int>.Ok(count, "Đã đánh dấu tất cả đã đọc."));
    }

    private string GetCurrentUserId()
    {
        return User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue(ClaimTypes.Name)
            ?? throw new UnauthorizedAccessException("Không xác định được người dùng hiện tại.");
    }
}
