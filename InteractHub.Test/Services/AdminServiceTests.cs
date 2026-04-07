using InteractHub.API.DTOs.Request;
using InteractHub.API.Entities;
using InteractHub.API.Repositories;
using InteractHub.API.Services;
using InteractHub.Test.Helpers;

namespace InteractHub.Test.Services;

public class AdminServiceTests
{
    [Fact]
    public async Task GetReportsAsync_ShouldReturnReportsInDescendingCreatedAtOrder()
    {
        using var db = TestDbFactory.CreateInMemoryContext();
        await SeedUserAsync(db, "reporter");

        var post = new Post { UserId = "reporter", Content = "Reported post" };
        db.Posts.Add(post);
        await db.SaveChangesAsync();

        db.PostReports.AddRange(
            new PostReport
            {
                PostId = post.Id,
                UserId = "reporter",
                Reason = "first",
                Status = "Open",
                CreatedAt = DateTime.UtcNow.AddMinutes(-10)
            },
            new PostReport
            {
                PostId = post.Id,
                UserId = "reporter",
                Reason = "second",
                Status = "Open",
                CreatedAt = DateTime.UtcNow
            });
        await db.SaveChangesAsync();

        var service = new AdminService(new Repository<PostReport>(db), new Repository<Post>(db));
        var result = await service.GetReportsAsync();

        Assert.Equal(2, result.Count);
        Assert.Equal("second", result[0].Reason);
    }

    [Fact]
    public async Task ResolveReportAsync_ShouldReturnNull_WhenMissingReport()
    {
        using var db = TestDbFactory.CreateInMemoryContext();
        var service = new AdminService(new Repository<PostReport>(db), new Repository<Post>(db));

        var result = await service.ResolveReportAsync(Guid.NewGuid(), new ResolveReportRequest { Status = "Resolved" });

        Assert.Null(result);
    }

    [Fact]
    public async Task ResolveReportAsync_ShouldUpdateStatus_WhenReportExists()
    {
        using var db = TestDbFactory.CreateInMemoryContext();
        await SeedUserAsync(db, "reporter");

        var post = new Post { UserId = "reporter", Content = "Reported post" };
        db.Posts.Add(post);
        await db.SaveChangesAsync();

        var report = new PostReport
        {
            PostId = post.Id,
            UserId = "reporter",
            Reason = "spam",
            Status = "Open"
        };
        db.PostReports.Add(report);
        await db.SaveChangesAsync();

        var service = new AdminService(new Repository<PostReport>(db), new Repository<Post>(db));
        var result = await service.ResolveReportAsync(report.Id, new ResolveReportRequest { Status = "Rejected" });

        Assert.NotNull(result);
        Assert.Equal("Rejected", result!.Status);
    }

    [Fact]
    public async Task DeletePostAsync_ShouldReturnFalse_WhenPostNotFound()
    {
        using var db = TestDbFactory.CreateInMemoryContext();
        var service = new AdminService(new Repository<PostReport>(db), new Repository<Post>(db));

        var deleted = await service.DeletePostAsync(Guid.NewGuid());

        Assert.False(deleted);
    }

    private static async Task SeedUserAsync(InteractHub.API.Data.AppDbContext db, string id)
    {
        db.Users.Add(new User
        {
            Id = id,
            UserName = id,
            Email = $"{id}@interacthub.dev",
            FullName = id
        });

        await db.SaveChangesAsync();
    }
}
