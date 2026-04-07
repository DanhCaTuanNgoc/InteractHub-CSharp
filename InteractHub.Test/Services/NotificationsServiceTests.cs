using InteractHub.API.Entities;
using InteractHub.API.Hubs;
using InteractHub.API.Repositories;
using InteractHub.API.Services;
using InteractHub.Test.Helpers;
using Microsoft.AspNetCore.SignalR;
using Moq;

namespace InteractHub.Test.Services;

public class NotificationsServiceTests
{
    [Fact]
    public async Task MarkAllReadAsync_ShouldReturnNumberOfUnreadItems()
    {
        using var db = TestDbFactory.CreateInMemoryContext();
        await SeedUsersAsync(db, "sender", "receiver");

        db.Notifications.AddRange(
            new Notification { SenderId = "sender", ReceiverId = "receiver", Type = "A", Content = "1", IsRead = false },
            new Notification { SenderId = "sender", ReceiverId = "receiver", Type = "B", Content = "2", IsRead = false },
            new Notification { SenderId = "sender", ReceiverId = "receiver", Type = "C", Content = "3", IsRead = true });
        await db.SaveChangesAsync();

        var service = new NotificationsService(new Repository<Notification>(db), CreateHubContextMock().Object);

        var count = await service.MarkAllReadAsync("receiver");

        Assert.Equal(2, count);
        Assert.All(db.Notifications.Where(n => n.ReceiverId == "receiver"), n => Assert.True(n.IsRead));
    }

    [Fact]
    public async Task CreateAsync_ShouldReturnNull_WhenSenderEqualsReceiver()
    {
        using var db = TestDbFactory.CreateInMemoryContext();
        await SeedUsersAsync(db, "u1");

        var service = new NotificationsService(new Repository<Notification>(db), CreateHubContextMock().Object);
        var result = await service.CreateAsync("u1", "u1", "Test", "No-op");

        Assert.Null(result);
    }

    [Fact]
    public async Task CreateAsync_ShouldPersistAndPushRealtimeEvent()
    {
        using var db = TestDbFactory.CreateInMemoryContext();
        await SeedUsersAsync(db, "sender", "receiver");

        var hubContext = CreateHubContextMock();
        var proxy = new Mock<IClientProxy>();

        var clients = new Mock<IHubClients>();
        clients.Setup(c => c.Group("receiver")).Returns(proxy.Object);
        hubContext.SetupGet(h => h.Clients).Returns(clients.Object);

        var service = new NotificationsService(new Repository<Notification>(db), hubContext.Object);

        var result = await service.CreateAsync("sender", "receiver", "FriendRequest", "New request");

        Assert.NotNull(result);
        Assert.Equal("FriendRequest", result!.Type);
        Assert.Equal(1, db.Notifications.Count());
        proxy.Verify(
            p => p.SendCoreAsync("ReceiveNotification", It.IsAny<object?[]>(), It.IsAny<CancellationToken>()),
            Times.Once);
    }

    private static Mock<IHubContext<NotificationHub>> CreateHubContextMock()
    {
        var hubContext = new Mock<IHubContext<NotificationHub>>();
        var clients = new Mock<IHubClients>();
        var proxy = new Mock<IClientProxy>();

        clients.Setup(c => c.Group(It.IsAny<string>())).Returns(proxy.Object);
        hubContext.SetupGet(h => h.Clients).Returns(clients.Object);

        return hubContext;
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
