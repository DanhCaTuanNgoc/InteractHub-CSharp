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
public class StoriesController : ControllerBase
{
    private readonly IStoriesService _storiesService;

    public StoriesController(IStoriesService storiesService)
    {
        _storiesService = storiesService;
    }

    [HttpGet]
    public async Task<IActionResult> GetStories()
    {
        var data = await _storiesService.GetActiveStoriesAsync(GetCurrentUserId());
        return Ok(ApiResponse<List<StoryResponse>>.Ok(data));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateStoryRequest request)
    {
        var story = await _storiesService.CreateAsync(GetCurrentUserId(), request);
        return StatusCode(StatusCodes.Status201Created, ApiResponse<StoryResponse>.Ok(story, "Đăng story thành công."));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var deleted = await _storiesService.DeleteAsync(id, GetCurrentUserId(), User.IsInRole("Admin"));
        if (!deleted)
        {
            return NotFound(ApiResponse<object>.Fail("Không tìm thấy story."));
        }

        return Ok(ApiResponse<object>.Ok(null, "Xóa story thành công."));
    }

    private string GetCurrentUserId()
    {
        return User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue(ClaimTypes.Name)
            ?? throw new UnauthorizedAccessException("Không xác định được người dùng hiện tại.");
    }
}
