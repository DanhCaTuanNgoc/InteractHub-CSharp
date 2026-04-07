using InteractHub.API.DTOs.Response;
using InteractHub.API.Entities;
using InteractHub.API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace InteractHub.API.Services;

public class FriendsService : IFriendsService
{
    private readonly IRepository<Friendship> _friendshipsRepository;
    private readonly INotificationsService _notificationsService;

    public FriendsService(IRepository<Friendship> friendshipsRepository, INotificationsService notificationsService)
    {
        _friendshipsRepository = friendshipsRepository;
        _notificationsService = notificationsService;
    }

    public async Task<FriendshipResponse> SendRequestAsync(string senderId, string receiverId)
    {
        if (senderId == receiverId)
        {
            throw new InvalidOperationException("Không thể gửi lời mời cho chính mình.");
        }

        var existing = await _friendshipsRepository.Query().FirstOrDefaultAsync(f =>
            (f.SenderId == senderId && f.ReceiverId == receiverId) ||
            (f.SenderId == receiverId && f.ReceiverId == senderId));

        if (existing is not null && existing.Status == FriendshipStatus.Accepted)
        {
            throw new InvalidOperationException("Hai người đã là bạn bè.");
        }

        if (existing is not null && existing.Status == FriendshipStatus.Pending)
        {
            throw new InvalidOperationException("Lời mời kết bạn đã tồn tại.");
        }

        var sameDirectionDeclined = await _friendshipsRepository.Query().FirstOrDefaultAsync(f =>
            f.SenderId == senderId &&
            f.ReceiverId == receiverId &&
            f.Status == FriendshipStatus.Declined);

        if (sameDirectionDeclined is not null)
        {
            sameDirectionDeclined.Status = FriendshipStatus.Pending;
            sameDirectionDeclined.CreatedAt = DateTime.UtcNow;
            sameDirectionDeclined.UpdatedAt = DateTime.UtcNow;
            _friendshipsRepository.Update(sameDirectionDeclined);
            await _friendshipsRepository.SaveChangesAsync();

            await _notificationsService.CreateAsync(
                senderId,
                receiverId,
                "FriendRequest",
                "Bạn có một lời mời kết bạn mới.");

            var refreshed = await _friendshipsRepository.Query()
                .Include(f => f.Sender)
                .Include(f => f.Receiver)
                .FirstAsync(f => f.Id == sameDirectionDeclined.Id);

            return refreshed.ToFriendshipResponse();
        }

        var friendship = new Friendship
        {
            SenderId = senderId,
            ReceiverId = receiverId,
            Status = FriendshipStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };

        await _friendshipsRepository.AddAsync(friendship);
        await _friendshipsRepository.SaveChangesAsync();

        await _notificationsService.CreateAsync(
            senderId,
            receiverId,
            "FriendRequest",
            "Bạn có một lời mời kết bạn mới.");

        var created = await _friendshipsRepository.Query()
            .Include(f => f.Sender)
            .Include(f => f.Receiver)
            .FirstAsync(f => f.Id == friendship.Id);

        return created.ToFriendshipResponse();
    }

    public async Task<FriendshipResponse?> AcceptRequestAsync(string receiverId, string senderId)
    {
        var friendship = await _friendshipsRepository.Query()
            .Include(f => f.Sender)
            .Include(f => f.Receiver)
            .FirstOrDefaultAsync(f =>
                f.SenderId == senderId &&
                f.ReceiverId == receiverId &&
                f.Status == FriendshipStatus.Pending);

        if (friendship is null)
        {
            return null;
        }

        friendship.Status = FriendshipStatus.Accepted;
        friendship.UpdatedAt = DateTime.UtcNow;
        _friendshipsRepository.Update(friendship);
        await _friendshipsRepository.SaveChangesAsync();

        await _notificationsService.CreateAsync(
            receiverId,
            senderId,
            "FriendRequestAccepted",
            "Lời mời kết bạn của bạn đã được chấp nhận.");

        return friendship.ToFriendshipResponse();
    }

    public async Task<FriendshipResponse?> DeclineRequestAsync(string receiverId, string senderId)
    {
        var friendship = await _friendshipsRepository.Query()
            .Include(f => f.Sender)
            .Include(f => f.Receiver)
            .FirstOrDefaultAsync(f =>
                f.SenderId == senderId &&
                f.ReceiverId == receiverId &&
                f.Status == FriendshipStatus.Pending);

        if (friendship is null)
        {
            return null;
        }

        friendship.Status = FriendshipStatus.Declined;
        friendship.UpdatedAt = DateTime.UtcNow;
        _friendshipsRepository.Update(friendship);
        await _friendshipsRepository.SaveChangesAsync();

        return friendship.ToFriendshipResponse();
    }

    public async Task<bool> RemoveFriendAsync(string currentUserId, string friendUserId)
    {
        var friendship = await _friendshipsRepository.Query().FirstOrDefaultAsync(f =>
            ((f.SenderId == currentUserId && f.ReceiverId == friendUserId) ||
             (f.SenderId == friendUserId && f.ReceiverId == currentUserId)) &&
            f.Status == FriendshipStatus.Accepted);

        if (friendship is null)
        {
            return false;
        }

        _friendshipsRepository.Delete(friendship);
        await _friendshipsRepository.SaveChangesAsync();
        return true;
    }

    public async Task<List<UserSummaryResponse>> GetFriendsAsync(string currentUserId)
    {
        var friendships = await _friendshipsRepository.Query()
            .Include(f => f.Sender)
            .Include(f => f.Receiver)
            .Where(f =>
                (f.SenderId == currentUserId || f.ReceiverId == currentUserId) &&
                f.Status == FriendshipStatus.Accepted)
            .ToListAsync();

        return friendships
            .Select(f => f.SenderId == currentUserId ? f.Receiver : f.Sender)
            .Select(u => u.ToUserSummary())
            .ToList();
    }

    public async Task<FriendshipRelationshipResponse> GetRelationshipAsync(string currentUserId, string targetUserId)
    {
        if (currentUserId == targetUserId)
        {
            return new FriendshipRelationshipResponse
            {
                Status = "Self"
            };
        }

        var friendships = await _friendshipsRepository.Query()
            .Where(f =>
                (f.SenderId == currentUserId && f.ReceiverId == targetUserId) ||
                (f.SenderId == targetUserId && f.ReceiverId == currentUserId))
            .OrderByDescending(f => f.Status == FriendshipStatus.Accepted)
            .ThenByDescending(f => f.UpdatedAt ?? f.CreatedAt)
            .ToListAsync();

        var latest = friendships.FirstOrDefault();

        if (latest is null || latest.Status == FriendshipStatus.Declined)
        {
            return new FriendshipRelationshipResponse
            {
                Status = "NotFriends"
            };
        }

        if (latest.Status == FriendshipStatus.Accepted)
        {
            return new FriendshipRelationshipResponse
            {
                Status = "Friends",
                FriendshipId = latest.Id.ToString(),
                SenderId = latest.SenderId,
                ReceiverId = latest.ReceiverId
            };
        }

        return new FriendshipRelationshipResponse
        {
            Status = latest.SenderId == currentUserId ? "RequestSent" : "RequestReceived",
            FriendshipId = latest.Id.ToString(),
            SenderId = latest.SenderId,
            ReceiverId = latest.ReceiverId
        };
    }
}
