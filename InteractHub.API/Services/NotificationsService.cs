using InteractHub.API.DTOs.Response;
using InteractHub.API.Entities;
using InteractHub.API.Hubs;
using InteractHub.API.Interfaces;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace InteractHub.API.Services;

public class NotificationsService : INotificationsService
{
    private readonly IRepository<Notification> _notificationsRepository;
    private readonly IHubContext<NotificationHub> _hubContext;

    public NotificationsService(IRepository<Notification> notificationsRepository, IHubContext<NotificationHub> hubContext)
    {
        _notificationsRepository = notificationsRepository;
        _hubContext = hubContext;
    }

    public async Task<List<NotificationResponse>> GetAllAsync(string userId)
    {
        var items = await _notificationsRepository.Query()
            .Include(n => n.Sender)
            .Where(n => n.ReceiverId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .ToListAsync();

        return items.Select(n => n.ToNotificationResponse()).ToList();
    }

    public async Task<bool> MarkReadAsync(Guid id, string userId)
    {
        var notification = await _notificationsRepository.Query()
            .FirstOrDefaultAsync(n => n.Id == id && n.ReceiverId == userId);

        if (notification is null)
        {
            return false;
        }

        notification.IsRead = true;
        _notificationsRepository.Update(notification);
        await _notificationsRepository.SaveChangesAsync();
        return true;
    }

    public async Task<int> MarkAllReadAsync(string userId)
    {
        var unread = await _notificationsRepository.Query()
            .Where(n => n.ReceiverId == userId && !n.IsRead)
            .ToListAsync();

        foreach (var notification in unread)
        {
            notification.IsRead = true;
            _notificationsRepository.Update(notification);
        }

        await _notificationsRepository.SaveChangesAsync();
        return unread.Count;
    }

    public async Task<NotificationResponse?> CreateAsync(string senderId, string receiverId, string type, string content)
    {
        if (senderId == receiverId)
        {
            return null;
        }

        var notification = new Notification
        {
            SenderId = senderId,
            ReceiverId = receiverId,
            Type = type,
            Content = content,
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        };

        await _notificationsRepository.AddAsync(notification);
        await _notificationsRepository.SaveChangesAsync();

        var created = await _notificationsRepository.Query()
            .Include(n => n.Sender)
            .FirstAsync(n => n.Id == notification.Id);

        var payload = created.ToNotificationResponse();
        await _hubContext.Clients.Group(receiverId).SendAsync("ReceiveNotification", payload);
        return payload;
    }
}
