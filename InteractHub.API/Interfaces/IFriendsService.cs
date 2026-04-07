using InteractHub.API.DTOs.Response;

namespace InteractHub.API.Interfaces;

public interface IFriendsService
{
    Task<FriendshipResponse> SendRequestAsync(string senderId, string receiverId);
    Task<FriendshipResponse?> AcceptRequestAsync(string receiverId, string senderId);
    Task<FriendshipResponse?> DeclineRequestAsync(string receiverId, string senderId);
    Task<bool> RemoveFriendAsync(string currentUserId, string friendUserId);
    Task<List<UserSummaryResponse>> GetFriendsAsync(string currentUserId);
    Task<FriendshipRelationshipResponse> GetRelationshipAsync(string currentUserId, string targetUserId);
}
