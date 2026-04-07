namespace InteractHub.API.DTOs.Response;

public class FriendshipRelationshipResponse
{
    public string Status { get; set; } = "NotFriends";
    public string? FriendshipId { get; set; }
    public string? SenderId { get; set; }
    public string? ReceiverId { get; set; }
}