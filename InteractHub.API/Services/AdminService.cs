using InteractHub.API.DTOs.Request;
using InteractHub.API.DTOs.Response;
using InteractHub.API.Entities;
using InteractHub.API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace InteractHub.API.Services;

public class AdminService : IAdminService
{
    private readonly IRepository<PostReport> _reportsRepository;
    private readonly IPostsService _postsService;

    public AdminService(IRepository<PostReport> reportsRepository, IPostsService postsService)
    {
        _reportsRepository = reportsRepository;
        _postsService = postsService;
    }

    public async Task<List<PostReportResponse>> GetReportsAsync()
    {
        var reports = await _reportsRepository.Query()
            .Include(r => r.User)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        return reports.Select(r => r.ToPostReportResponse()).ToList();
    }

    public async Task<PostReportResponse?> ResolveReportAsync(Guid id, ResolveReportRequest request)
    {
        var report = await _reportsRepository.Query()
            .Include(r => r.User)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (report is null)
        {
            return null;
        }

        report.Status = request.Status;
        _reportsRepository.Update(report);
        await _reportsRepository.SaveChangesAsync();

        return report.ToPostReportResponse();
    }

    public async Task<bool> DeletePostAsync(Guid postId)
    {
        // Reuse the main post deletion flow so related likes/comments/reports/share links
        // are handled consistently and do not violate restrict foreign keys.
        return await _postsService.DeleteAsync(postId, string.Empty, true);
    }
}
