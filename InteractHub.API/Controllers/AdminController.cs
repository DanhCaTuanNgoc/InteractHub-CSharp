using InteractHub.API.DTOs.Common;
using InteractHub.API.DTOs.Request;
using InteractHub.API.DTOs.Response;
using InteractHub.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InteractHub.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly IAdminService _adminService;

    public AdminController(IAdminService adminService)
    {
        _adminService = adminService;
    }

    [HttpGet("reports")]
    public async Task<IActionResult> GetReports()
    {
        var data = await _adminService.GetReportsAsync();
        return Ok(ApiResponse<List<PostReportResponse>>.Ok(data));
    }

    [HttpPut("reports/{id:guid}/resolve")]
    public async Task<IActionResult> ResolveReport(Guid id, [FromBody] ResolveReportRequest request)
    {
        var report = await _adminService.ResolveReportAsync(id, request);
        if (report is null)
        {
            return NotFound(ApiResponse<PostReportResponse>.Fail("Không tìm thấy report."));
        }

        return Ok(ApiResponse<PostReportResponse>.Ok(report, "Đã xử lý report."));
    }

    [HttpDelete("posts/{id:guid}")]
    public async Task<IActionResult> DeletePost(Guid id)
    {
        var deleted = await _adminService.DeletePostAsync(id);
        if (!deleted)
        {
            return NotFound(ApiResponse<object>.Fail("Không tìm thấy bài viết."));
        }

        return Ok(ApiResponse<object>.Ok(null, "Admin đã xóa bài viết."));
    }
}
