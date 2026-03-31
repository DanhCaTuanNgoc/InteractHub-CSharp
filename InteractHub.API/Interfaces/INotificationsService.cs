using InteractHub.API.DTOs.Response;

namespace InteractHub.API.Interfaces;

public interface INotificationsService
{
    Task<List<NotificationResponse>> GetAllAsync(string userId);
    Task<bool> MarkReadAsync(Guid id, string userId);
    Task<int> MarkAllReadAsync(string userId);
    Task<NotificationResponse?> CreateAsync(string senderId, string receiverId, string type, string content);
}
