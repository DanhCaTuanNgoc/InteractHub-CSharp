using InteractHub.API.DTOs.Request;
using InteractHub.API.DTOs.Response;
using InteractHub.API.Entities;
using InteractHub.API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace InteractHub.API.Services;

public class AdminService : IAdminService
{
    private readonly IRepository<PostReport> _reportsRepository;
    private readonly IRepository<Post> _postsRepository;

    public AdminService(IRepository<PostReport> reportsRepository, IRepository<Post> postsRepository)
    {
        _reportsRepository = reportsRepository;
        _postsRepository = postsRepository;
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
        var post = await _postsRepository.Query().FirstOrDefaultAsync(p => p.Id == postId);
        if (post is null)
        {
            return false;
        }

        _postsRepository.Delete(post);
        await _postsRepository.SaveChangesAsync();
        return true;
    }
}
