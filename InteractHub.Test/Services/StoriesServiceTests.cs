using InteractHub.API.DTOs.Request;
using InteractHub.API.Entities;
using InteractHub.API.Repositories;
using InteractHub.API.Services;
using InteractHub.Test.Helpers;

namespace InteractHub.Test.Services;

public class StoriesServiceTests
{
    [Fact]
    public async Task GetActiveStoriesAsync_ShouldReturnOnlyNonExpiredStoriesForUser()
    {
        using var db = TestDbFactory.CreateInMemoryContext();
        await SeedUsersAsync(db, "u1", "u2");

        db.Stories.AddRange(
            new Story
            {
                UserId = "u1",
                MediaUrl = "https://cdn/active.jpg",
                CreatedAt = DateTime.UtcNow.AddMinutes(-10),
                ExpiresAt = DateTime.UtcNow.AddHours(1)
            },
            new Story
            {
                UserId = "u1",
                MediaUrl = "https://cdn/expired.jpg",
                CreatedAt = DateTime.UtcNow.AddDays(-1),
                ExpiresAt = DateTime.UtcNow.AddMinutes(-1)
            },
            new Story
            {
                UserId = "u2",
                MediaUrl = "https://cdn/other.jpg",
                CreatedAt = DateTime.UtcNow,
                ExpiresAt = DateTime.UtcNow.AddHours(2)
            });
        await db.SaveChangesAsync();

        var service = new StoriesService(new Repository<Story>(db), new Repository<Friendship>(db));
        var result = await service.GetActiveStoriesAsync("u1");

        Assert.Single(result);
        Assert.Equal("https://cdn/active.jpg", result[0].MediaUrl);
    }

    [Fact]
    public async Task CreateAsync_ShouldCreateStoryWith24HourExpiry()
    {
        using var db = TestDbFactory.CreateInMemoryContext();
        await SeedUsersAsync(db, "u1");

        var service = new StoriesService(new Repository<Story>(db), new Repository<Friendship>(db));
        var before = DateTime.UtcNow;

        var result = await service.CreateAsync("u1", new CreateStoryRequest { MediaUrl = "https://cdn/new.jpg" });

        var after = DateTime.UtcNow;
        Assert.Equal("u1", result.User.Id);
        Assert.Equal("https://cdn/new.jpg", result.MediaUrl);
        Assert.InRange(result.ExpiresAt, before.AddHours(24).AddSeconds(-5), after.AddHours(24).AddSeconds(5));
    }

    [Fact]
    public async Task DeleteAsync_ShouldThrow_WhenUserIsNotOwnerOrAdmin()
    {
        using var db = TestDbFactory.CreateInMemoryContext();
        await SeedUsersAsync(db, "owner", "other");

        var story = new Story
        {
            UserId = "owner",
            MediaUrl = "https://cdn/story.jpg",
            ExpiresAt = DateTime.UtcNow.AddHours(2)
        };
        db.Stories.Add(story);
        await db.SaveChangesAsync();

        var service = new StoriesService(new Repository<Story>(db), new Repository<Friendship>(db));

        await Assert.ThrowsAsync<UnauthorizedAccessException>(() => service.DeleteAsync(story.Id, "other", false));
    }

    private static async Task SeedUsersAsync(InteractHub.API.Data.AppDbContext db, params string[] userIds)
    {
        foreach (var id in userIds)
        {
            db.Users.Add(new User
            {
                Id = id,
                UserName = id,
                Email = $"{id}@interacthub.dev",
                FullName = id
            });
        }

        await db.SaveChangesAsync();
    }
}
