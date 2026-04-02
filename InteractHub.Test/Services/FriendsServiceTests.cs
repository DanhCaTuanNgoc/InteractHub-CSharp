using InteractHub.API.Entities;
using InteractHub.API.Interfaces;
using InteractHub.API.Repositories;
using InteractHub.API.Services;
using InteractHub.Test.Helpers;
using Moq;

namespace InteractHub.Test.Services;

public class FriendsServiceTests
{
    [Fact]
    public async Task SendRequestAsync_ShouldCreatePendingFriendship_AndNotify()
    {
        using var db = TestDbFactory.CreateInMemoryContext();
        await SeedUsersAsync(db, "alice", "bob");

        var service = CreateService(db, out var notifications);

        var result = await service.SendRequestAsync("alice", "bob");

        Assert.Equal("Pending", result.Status);
        Assert.Single(db.Friendships);
        notifications.Verify(n => n.CreateAsync(
            "alice",
            "bob",
            "FriendRequest",
            It.IsAny<string>()), Times.Once);
    }

    [Fact]
    public async Task SendRequestAsync_ShouldThrow_WhenSendingToSelf()
    {
        using var db = TestDbFactory.CreateInMemoryContext();
        await SeedUsersAsync(db, "alice");

        var service = CreateService(db, out _);

        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.SendRequestAsync("alice", "alice"));
    }

    [Fact]
    public async Task SendRequestAsync_ShouldThrow_WhenPendingRequestExists()
    {
        using var db = TestDbFactory.CreateInMemoryContext();
        await SeedUsersAsync(db, "alice", "bob");

        db.Friendships.Add(new Friendship
        {
            SenderId = "alice",
            ReceiverId = "bob",
            Status = FriendshipStatus.Pending,
            CreatedAt = DateTime.UtcNow
        });
        await db.SaveChangesAsync();

        var service = CreateService(db, out _);

        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.SendRequestAsync("alice", "bob"));
    }

    [Fact]
    public async Task AcceptRequestAsync_ShouldUpdateStatusToAccepted_AndNotify()
    {
        using var db = TestDbFactory.CreateInMemoryContext();
        await SeedUsersAsync(db, "alice", "bob");

        db.Friendships.Add(new Friendship
        {
            SenderId = "alice",
            ReceiverId = "bob",
            Status = FriendshipStatus.Pending,
            CreatedAt = DateTime.UtcNow
        });
        await db.SaveChangesAsync();

        var service = CreateService(db, out var notifications);

        var result = await service.AcceptRequestAsync("bob", "alice");

        Assert.NotNull(result);
        Assert.Equal("Accepted", result.Status);
        notifications.Verify(n => n.CreateAsync(
            "bob",
            "alice",
            "FriendRequestAccepted",
            It.IsAny<string>()), Times.Once);
    }

    [Fact]
    public async Task DeclineRequestAsync_ShouldUpdateStatusToDeclined()
    {
        using var db = TestDbFactory.CreateInMemoryContext();
        await SeedUsersAsync(db, "alice", "bob");

        db.Friendships.Add(new Friendship
        {
            SenderId = "alice",
            ReceiverId = "bob",
            Status = FriendshipStatus.Pending,
            CreatedAt = DateTime.UtcNow
        });
        await db.SaveChangesAsync();

        var service = CreateService(db, out _);

        var result = await service.DeclineRequestAsync("bob", "alice");

        Assert.NotNull(result);
        Assert.Equal("Declined", result.Status);
    }

    [Fact]
    public async Task RemoveFriendAsync_ShouldRemoveAcceptedFriendship()
    {
        using var db = TestDbFactory.CreateInMemoryContext();
        await SeedUsersAsync(db, "alice", "bob");

        db.Friendships.Add(new Friendship
        {
            SenderId = "alice",
            ReceiverId = "bob",
            Status = FriendshipStatus.Accepted,
            CreatedAt = DateTime.UtcNow
        });
        await db.SaveChangesAsync();

        var service = CreateService(db, out _);

        var removed = await service.RemoveFriendAsync("alice", "bob");

        Assert.True(removed);
        Assert.Empty(db.Friendships);
    }

    private static FriendsService CreateService(
        InteractHub.API.Data.AppDbContext db,
        out Mock<INotificationsService> notifications)
    {
        notifications = new Mock<INotificationsService>();
        return new FriendsService(new Repository<Friendship>(db), notifications.Object);
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
