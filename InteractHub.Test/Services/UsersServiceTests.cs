using InteractHub.API.DTOs.Request;
using InteractHub.API.Entities;
using InteractHub.API.Repositories;
using InteractHub.API.Services;
using InteractHub.Test.Helpers;

namespace InteractHub.Test.Services;

public class UsersServiceTests
{
    [Fact]
    public async Task GetProfileAsync_ShouldReturnNull_WhenUserMissing()
    {
        using var db = TestDbFactory.CreateInMemoryContext();
        var service = new UsersService(new Repository<User>(db));

        var result = await service.GetProfileAsync("missing");

        Assert.Null(result);
    }

    [Fact]
    public async Task UpdateProfileAsync_ShouldPersistChanges_WhenUserExists()
    {
        using var db = TestDbFactory.CreateInMemoryContext();
        db.Users.Add(new User
        {
            Id = "u1",
            UserName = "demo",
            Email = "demo@interacthub.dev",
            FullName = "Demo User"
        });
        await db.SaveChangesAsync();

        var service = new UsersService(new Repository<User>(db));
        var request = new UpdateProfileRequest
        {
            FullName = "Updated User",
            Bio = "New bio",
            AvatarUrl = "https://cdn.example/avatar.png"
        };

        var result = await service.UpdateProfileAsync("u1", request);

        Assert.NotNull(result);
        Assert.Equal("Updated User", result!.FullName);
        Assert.Equal("New bio", result.Bio);
        Assert.Equal("https://cdn.example/avatar.png", result.AvatarUrl);
    }

    [Fact]
    public async Task SearchAsync_ShouldClampPaging_AndReturnMatchingUsers()
    {
        using var db = TestDbFactory.CreateInMemoryContext();
        db.Users.AddRange(
            new User { Id = "u1", UserName = "alice", Email = "alice@interacthub.dev", FullName = "Alice" },
            new User { Id = "u2", UserName = "alex", Email = "alex@interacthub.dev", FullName = "Alex" },
            new User { Id = "u3", UserName = "bob", Email = "bob@interacthub.dev", FullName = "Bob" });
        await db.SaveChangesAsync();

        var service = new UsersService(new Repository<User>(db));

        var result = await service.SearchAsync(" al ", 0, 999);

        Assert.Equal(1, result.Page);
        Assert.Equal(50, result.PageSize);
        Assert.Equal(2, result.TotalCount);
        Assert.All(result.Items, u => Assert.Contains("al", u.UserName, StringComparison.OrdinalIgnoreCase));
    }
}
