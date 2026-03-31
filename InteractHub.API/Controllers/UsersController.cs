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
public class UsersController : ControllerBase
{
    private readonly IUsersService _usersService;

    public UsersController(IUsersService usersService)
    {
        _usersService = usersService;
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetProfile(string id)
    {
        var user = await _usersService.GetProfileAsync(id);
        if (user is null)
        {
            return NotFound(ApiResponse<UserSummaryResponse>.Fail("Không tìm thấy người dùng."));
        }

        return Ok(ApiResponse<UserSummaryResponse>.Ok(user));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateProfile(string id, [FromBody] UpdateProfileRequest request)
    {
        var currentUserId = GetCurrentUserId();
        if (currentUserId != id && !User.IsInRole("Admin"))
        {
            return StatusCode(StatusCodes.Status403Forbidden, ApiResponse<UserSummaryResponse>.Fail("Bạn không có quyền cập nhật hồ sơ này."));
        }

        var user = await _usersService.UpdateProfileAsync(id, request);
        if (user is null)
        {
            return NotFound(ApiResponse<UserSummaryResponse>.Fail("Không tìm thấy người dùng."));
        }

        return Ok(ApiResponse<UserSummaryResponse>.Ok(user, "Cập nhật hồ sơ thành công."));
    }

    [HttpGet("search")]
    public async Task<IActionResult> Search([FromQuery] string q)
    {
        if (string.IsNullOrWhiteSpace(q))
        {
            return BadRequest(ApiResponse<List<UserSummaryResponse>>.Fail("Query không hợp lệ."));
        }

        var users = await _usersService.SearchAsync(q);
        return Ok(ApiResponse<List<UserSummaryResponse>>.Ok(users));
    }

    private string GetCurrentUserId()
    {
        return User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue(ClaimTypes.Name)
            ?? throw new UnauthorizedAccessException("Không xác định được người dùng hiện tại.");
    }
}
