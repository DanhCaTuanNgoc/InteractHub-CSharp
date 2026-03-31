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
public class PostsController : ControllerBase
{
    private readonly IPostsService _postsService;

    public PostsController(IPostsService postsService)
    {
        _postsService = postsService;
    }

    [HttpGet]
    public async Task<IActionResult> GetFeed()
    {
        var data = await _postsService.GetFeedAsync();
        return Ok(ApiResponse<List<PostResponse>>.Ok(data));
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var post = await _postsService.GetByIdAsync(id);
        if (post is null)
        {
            return NotFound(ApiResponse<PostResponse>.Fail("Không tìm thấy bài viết."));
        }

        return Ok(ApiResponse<PostResponse>.Ok(post));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreatePostRequest request)
    {
        var post = await _postsService.CreateAsync(GetCurrentUserId(), request);
        return StatusCode(StatusCodes.Status201Created, ApiResponse<PostResponse>.Ok(post, "Tạo bài viết thành công."));
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdatePostRequest request)
    {
        var post = await _postsService.UpdateAsync(id, GetCurrentUserId(), User.IsInRole("Admin"), request);
        if (post is null)
        {
            return NotFound(ApiResponse<PostResponse>.Fail("Không tìm thấy bài viết."));
        }

        return Ok(ApiResponse<PostResponse>.Ok(post, "Cập nhật bài viết thành công."));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var deleted = await _postsService.DeleteAsync(id, GetCurrentUserId(), User.IsInRole("Admin"));
        if (!deleted)
        {
            return NotFound(ApiResponse<object>.Fail("Không tìm thấy bài viết."));
        }

        return Ok(ApiResponse<object>.Ok(null, "Xóa bài viết thành công."));
    }

    [HttpPost("{id:guid}/like")]
    public async Task<IActionResult> ToggleLike(Guid id)
    {
        var post = await _postsService.ToggleLikeAsync(id, GetCurrentUserId());
        if (post is null)
        {
            return NotFound(ApiResponse<PostResponse>.Fail("Không tìm thấy bài viết."));
        }

        return Ok(ApiResponse<PostResponse>.Ok(post, "Cập nhật like thành công."));
    }

    [HttpPost("{id:guid}/comments")]
    public async Task<IActionResult> AddComment(Guid id, [FromBody] AddCommentRequest request)
    {
        var comment = await _postsService.AddCommentAsync(id, GetCurrentUserId(), request);
        if (comment is null)
        {
            return NotFound(ApiResponse<CommentResponse>.Fail("Không tìm thấy bài viết."));
        }

        return StatusCode(StatusCodes.Status201Created, ApiResponse<CommentResponse>.Ok(comment, "Đã thêm bình luận."));
    }

    [HttpPost("{id:guid}/share")]
    public async Task<IActionResult> Share(Guid id)
    {
        var shared = await _postsService.ShareAsync(id, GetCurrentUserId());
        if (shared is null)
        {
            return NotFound(ApiResponse<PostResponse>.Fail("Không tìm thấy bài viết."));
        }

        return StatusCode(StatusCodes.Status201Created, ApiResponse<PostResponse>.Ok(shared, "Đã chia sẻ bài viết."));
    }

    [HttpPost("{id:guid}/report")]
    public async Task<IActionResult> Report(Guid id, [FromBody] CreateReportRequest request)
    {
        var success = await _postsService.ReportAsync(id, GetCurrentUserId(), request);
        if (!success)
        {
            return NotFound(ApiResponse<object>.Fail("Không tìm thấy bài viết."));
        }

        return StatusCode(StatusCodes.Status201Created, ApiResponse<object>.Ok(null, "Đã gửi report."));
    }

    private string GetCurrentUserId()
    {
        return User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue(ClaimTypes.Name)
            ?? throw new UnauthorizedAccessException("Không xác định được người dùng hiện tại.");
    }
}
