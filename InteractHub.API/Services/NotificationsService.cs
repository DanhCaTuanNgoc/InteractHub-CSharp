using InteractHub.API.DTOs.Response;
using InteractHub.API.Entities;
using InteractHub.API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace InteractHub.API.Services;

public class NotificationsService : INotificationsService
{
    private readonly IRepository<Notification> _notificationsRepository;

    public NotificationsService(IRepository<Notification> notificationsRepository)
    {
        _notificationsRepository = notificationsRepository;
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
}
