using InteractHub.API.DTOs.Request;
using InteractHub.API.Entities;
using InteractHub.API.Interfaces;
using InteractHub.API.Repositories;
using InteractHub.API.Services;
using InteractHub.Test.Helpers;
using Moq;

namespace InteractHub.Test.Services;

public class PostsServiceTests
{
    [Fact]
    public async Task CreateAsync_ShouldCreatePost_AndReturnResponse()
    {
        using var db = TestDbFactory.CreateInMemoryContext();
        await SeedUsersAsync(db, "author", "reader");

        var service = CreateService(db, out _);

        var result = await service.CreateAsync("author", new CreatePostRequest
        {
            Content = "Hello #dotnet",
            ImageUrl = "https://cdn/image.png"
        });

        Assert.Equal("author", result.User.Id);
        Assert.Equal("Hello #dotnet", result.Content);
        Assert.Single(db.Posts);
        Assert.Single(db.Hashtags);
        Assert.Single(db.PostHashtags);
    }

    [Fact]
    public async Task DeleteAsync_ShouldThrow_WhenDeletingOthersPostAsNonAdmin()
    {
        using var db = TestDbFactory.CreateInMemoryContext();
        await SeedUsersAsync(db, "owner", "other");

        db.Posts.Add(new Post
        {
            UserId = "owner",
            Content = "Post from owner",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        });
        await db.SaveChangesAsync();

        var postId = db.Posts.Single().Id;
        var service = CreateService(db, out _);

        await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
            service.DeleteAsync(postId, "other", false));
    }

    [Fact]
    public async Task ToggleLikeAsync_ShouldAddLike_AndCreateNotification()
    {
        using var db = TestDbFactory.CreateInMemoryContext();
        await SeedUsersAsync(db, "owner", "liker");

        db.Posts.Add(new Post
        {
            UserId = "owner",
            Content = "A cool post",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        });
        await db.SaveChangesAsync();

        var postId = db.Posts.Single().Id;
        var service = CreateService(db, out var notifications);

        var result = await service.ToggleLikeAsync(postId, "liker");

        Assert.NotNull(result);
        Assert.Equal(1, db.Likes.Count());
        notifications.Verify(n => n.CreateAsync(
            "liker",
            "owner",
            "PostLiked",
            It.IsAny<string>()), Times.Once);
    }

    [Fact]
    public async Task ToggleLikeAsync_ShouldRemoveLike_WhenAlreadyLiked()
    {
        using var db = TestDbFactory.CreateInMemoryContext();
        await SeedUsersAsync(db, "owner", "liker");

        var post = new Post
        {
            UserId = "owner",
            Content = "A cool post",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        db.Posts.Add(post);
        await db.SaveChangesAsync();

        db.Likes.Add(new Like
        {
            PostId = post.Id,
            UserId = "liker",
            CreatedAt = DateTime.UtcNow
        });
        await db.SaveChangesAsync();

        var service = CreateService(db, out var notifications);

        var result = await service.ToggleLikeAsync(post.Id, "liker");

        Assert.NotNull(result);
        Assert.Empty(db.Likes);
        notifications.Verify(n => n.CreateAsync(
            It.IsAny<string>(),
            It.IsAny<string>(),
            It.IsAny<string>(),
            It.IsAny<string>()), Times.Never);
    }

    [Fact]
    public async Task ToggleLikeAsync_ShouldAllowSelfLike_AndToggleWithoutNotification()
    {
        using var db = TestDbFactory.CreateInMemoryContext();
        await SeedUsersAsync(db, "owner");

        db.Posts.Add(new Post
        {
            UserId = "owner",
            Content = "My own post",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        });
        await db.SaveChangesAsync();

        var postId = db.Posts.Single().Id;
        var service = CreateService(db, out var notifications);

        var firstResult = await service.ToggleLikeAsync(postId, "owner");

        Assert.NotNull(firstResult);
        Assert.Single(db.Likes);

        var secondResult = await service.ToggleLikeAsync(postId, "owner");

        Assert.NotNull(secondResult);
        Assert.Empty(db.Likes);
        notifications.Verify(n => n.CreateAsync(
            It.IsAny<string>(),
            It.IsAny<string>(),
            It.IsAny<string>(),
            It.IsAny<string>()), Times.Never);
    }

    [Fact]
    public async Task AddCommentAsync_ShouldCreateComment_AndNotifyOwner()
    {
        using var db = TestDbFactory.CreateInMemoryContext();
        await SeedUsersAsync(db, "owner", "commenter");

        db.Posts.Add(new Post
        {
            UserId = "owner",
            Content = "Post to comment",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        });
        await db.SaveChangesAsync();

        var postId = db.Posts.Single().Id;
        var service = CreateService(db, out var notifications);

        var result = await service.AddCommentAsync(postId, "commenter", new AddCommentRequest
        {
            Content = "Nice post"
        });

        Assert.NotNull(result);
        Assert.Equal("Nice post", result.Content);
        Assert.Single(db.Comments);
        notifications.Verify(n => n.CreateAsync(
            "commenter",
            "owner",
            "PostCommented",
            It.IsAny<string>()), Times.Once);
    }

    [Fact]
    public async Task ReportAsync_ShouldThrow_WhenOpenReportAlreadyExists()
    {
        using var db = TestDbFactory.CreateInMemoryContext();
        await SeedUsersAsync(db, "owner", "reporter");

        var post = new Post
        {
            UserId = "owner",
            Content = "Post to report",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        db.Posts.Add(post);
        await db.SaveChangesAsync();

        db.PostReports.Add(new PostReport
        {
            PostId = post.Id,
            UserId = "reporter",
            Reason = "Spam content",
            Status = "Open",
            CreatedAt = DateTime.UtcNow
        });
        await db.SaveChangesAsync();

        var service = CreateService(db, out _);

        await Assert.ThrowsAsync<InvalidOperationException>(() => service.ReportAsync(
            post.Id,
            "reporter",
            new CreateReportRequest { Reason = "Spam content" }));
    }

    private static PostsService CreateService(
        InteractHub.API.Data.AppDbContext db,
        out Mock<INotificationsService> notifications)
    {
        notifications = new Mock<INotificationsService>();

        return new PostsService(
            new Repository<Post>(db),
            new Repository<Like>(db),
            new Repository<Comment>(db),
            new Repository<Hashtag>(db),
            new Repository<PostHashtag>(db),
            new Repository<PostReport>(db),
            notifications.Object);
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
