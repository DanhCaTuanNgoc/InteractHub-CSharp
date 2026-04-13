using InteractHub.API.DTOs.Response;
using InteractHub.API.Entities;

namespace InteractHub.API.Services;

public static class MappingExtensions
{
    public static UserSummaryResponse ToUserSummary(this User user)
    {
        return new UserSummaryResponse
        {
            Id = user.Id,
            UserName = user.UserName ?? string.Empty,
            Email = user.Email ?? string.Empty,
            FullName = user.FullName,
            AvatarUrl = user.AvatarUrl,
            Bio = user.Bio
        };
    }

    public static CommentResponse ToCommentResponse(this Comment comment)
    {
        return new CommentResponse
        {
            Id = comment.Id,
            Content = comment.Content,
            CreatedAt = comment.CreatedAt,
            User = comment.User.ToUserSummary()
        };
    }

    public static PostResponse ToPostResponse(this Post post, string? currentUserId = null, bool includeOriginalPost = true)
    {
        return new PostResponse
        {
            Id = post.Id,
            Content = post.Content,
            ImageUrl = post.ImageUrl,
            CreatedAt = post.CreatedAt,
            OriginalPostId = post.OriginalPostId,
            OriginalPost = includeOriginalPost && post.OriginalPost is not null
                ? post.OriginalPost.ToPostResponse(currentUserId, false)
                : null,
            LikeCount = post.Likes.Count,
            IsLikedByCurrentUser = !string.IsNullOrWhiteSpace(currentUserId)
                && post.Likes.Any(l => l.UserId == currentUserId),
            CommentCount = post.Comments.Count,
            User = post.User.ToUserSummary(),
            Hashtags = post.PostHashtags.Select(x => x.Hashtag.Name).ToList(),
            RecentComments = post.Comments
                .OrderByDescending(c => c.CreatedAt)
                .Take(3)
                .Select(c => c.ToCommentResponse())
                .ToList()
        };
    }

    public static FriendshipResponse ToFriendshipResponse(this Friendship friendship)
    {
        return new FriendshipResponse
        {
            Id = friendship.Id,
            Status = friendship.Status.ToString(),
            CreatedAt = friendship.CreatedAt,
            Sender = friendship.Sender.ToUserSummary(),
            Receiver = friendship.Receiver.ToUserSummary()
        };
    }

    public static NotificationResponse ToNotificationResponse(this Notification notification)
    {
        return new NotificationResponse
        {
            Id = notification.Id,
            Type = notification.Type,
            Content = notification.Content,
            IsRead = notification.IsRead,
            CreatedAt = notification.CreatedAt,
            Sender = notification.Sender.ToUserSummary()
        };
    }

    public static StoryResponse ToStoryResponse(this Story story)
    {
        return new StoryResponse
        {
            Id = story.Id,
            MediaUrl = story.MediaUrl,
            CreatedAt = story.CreatedAt,
            ExpiresAt = story.ExpiresAt,
            User = story.User.ToUserSummary()
        };
    }

    public static PostReportResponse ToPostReportResponse(this PostReport report)
    {
        return new PostReportResponse
        {
            Id = report.Id,
            PostId = report.PostId,
            Reason = report.Reason,
            Status = report.Status,
            CreatedAt = report.CreatedAt,
            Reporter = report.User.ToUserSummary()
        };
    }
}
