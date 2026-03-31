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
public class FriendsController : ControllerBase
{
    private readonly IFriendsService _friendsService;

    public FriendsController(IFriendsService friendsService)
    {
        _friendsService = friendsService;
    }

    [HttpPost("request/{userId}")]
    public async Task<IActionResult> SendRequest(string userId)
    {
        var result = await _friendsService.SendRequestAsync(GetCurrentUserId(), userId);
        return StatusCode(StatusCodes.Status201Created, ApiResponse<FriendshipResponse>.Ok(result, "Đã gửi lời mời kết bạn."));
    }

    [HttpPut("accept/{userId}")]
    public async Task<IActionResult> Accept(string userId)
    {
        var result = await _friendsService.AcceptRequestAsync(GetCurrentUserId(), userId);
        if (result is null)
        {
            return NotFound(ApiResponse<FriendshipResponse>.Fail("Không tìm thấy lời mời kết bạn."));
        }

        return Ok(ApiResponse<FriendshipResponse>.Ok(result, "Đã chấp nhận lời mời kết bạn."));
    }

    [HttpPut("decline/{userId}")]
    public async Task<IActionResult> Decline(string userId)
    {
        var result = await _friendsService.DeclineRequestAsync(GetCurrentUserId(), userId);
        if (result is null)
        {
            return NotFound(ApiResponse<FriendshipResponse>.Fail("Không tìm thấy lời mời kết bạn."));
        }

        return Ok(ApiResponse<FriendshipResponse>.Ok(result, "Đã từ chối lời mời kết bạn."));
    }

    [HttpDelete("{userId}")]
    public async Task<IActionResult> RemoveFriend(string userId)
    {
        var deleted = await _friendsService.RemoveFriendAsync(GetCurrentUserId(), userId);
        if (!deleted)
        {
            return NotFound(ApiResponse<object>.Fail("Không tìm thấy quan hệ bạn bè."));
        }

        return Ok(ApiResponse<object>.Ok(null, "Đã hủy kết bạn."));
    }

    [HttpGet]
    public async Task<IActionResult> GetFriends()
    {
        var friends = await _friendsService.GetFriendsAsync(GetCurrentUserId());
        return Ok(ApiResponse<List<UserSummaryResponse>>.Ok(friends));
    }

    private string GetCurrentUserId()
    {
        return User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue(ClaimTypes.Name)
            ?? throw new UnauthorizedAccessException("Không xác định được người dùng hiện tại.");
    }
}
