using System.Text.RegularExpressions;
using InteractHub.API.DTOs.Request;
using InteractHub.API.DTOs.Response;
using InteractHub.API.Entities;
using InteractHub.API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace InteractHub.API.Services;

public class PostsService : IPostsService
{
    private readonly IRepository<Post> _postsRepository;
    private readonly IRepository<Like> _likesRepository;
    private readonly IRepository<Comment> _commentsRepository;
    private readonly IRepository<Hashtag> _hashtagsRepository;
    private readonly IRepository<PostHashtag> _postHashtagsRepository;
    private readonly IRepository<PostReport> _postReportsRepository;

    public PostsService(
        IRepository<Post> postsRepository,
        IRepository<Like> likesRepository,
        IRepository<Comment> commentsRepository,
        IRepository<Hashtag> hashtagsRepository,
        IRepository<PostHashtag> postHashtagsRepository,
        IRepository<PostReport> postReportsRepository)
    {
        _postsRepository = postsRepository;
        _likesRepository = likesRepository;
        _commentsRepository = commentsRepository;
        _hashtagsRepository = hashtagsRepository;
        _postHashtagsRepository = postHashtagsRepository;
        _postReportsRepository = postReportsRepository;
    }

    public async Task<List<PostResponse>> GetFeedAsync()
    {
        var posts = await BuildPostQuery()
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();

        return posts.Select(p => p.ToPostResponse()).ToList();
    }

    public async Task<PostResponse?> GetByIdAsync(Guid id)
    {
        var post = await BuildPostQuery().FirstOrDefaultAsync(p => p.Id == id);
        return post?.ToPostResponse();
    }

    public async Task<PostResponse> CreateAsync(string userId, CreatePostRequest request)
    {
        var post = new Post
        {
            Content = request.Content,
            ImageUrl = request.ImageUrl,
            UserId = userId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _postsRepository.AddAsync(post);
        await _postsRepository.SaveChangesAsync();
        await SyncHashtagsAsync(post.Id, post.Content);

        var created = await BuildPostQuery().FirstAsync(p => p.Id == post.Id);
        return created.ToPostResponse();
    }

    public async Task<PostResponse?> UpdateAsync(Guid id, string userId, bool isAdmin, UpdatePostRequest request)
    {
        var post = await _postsRepository.Query().FirstOrDefaultAsync(p => p.Id == id);
        if (post is null)
        {
            return null;
        }

        if (!isAdmin && post.UserId != userId)
        {
            throw new UnauthorizedAccessException("Bạn không có quyền sửa bài viết này.");
        }

        post.Content = request.Content;
        post.ImageUrl = request.ImageUrl;
        post.UpdatedAt = DateTime.UtcNow;

        _postsRepository.Update(post);
        await _postsRepository.SaveChangesAsync();
        await SyncHashtagsAsync(post.Id, post.Content);

        var updated = await BuildPostQuery().FirstAsync(p => p.Id == post.Id);
        return updated.ToPostResponse();
    }

    public async Task<bool> DeleteAsync(Guid id, string userId, bool isAdmin)
    {
        var post = await _postsRepository.Query().FirstOrDefaultAsync(p => p.Id == id);
        if (post is null)
        {
            return false;
        }

        if (!isAdmin && post.UserId != userId)
        {
            throw new UnauthorizedAccessException("Bạn không có quyền xóa bài viết này.");
        }

        _postsRepository.Delete(post);
        await _postsRepository.SaveChangesAsync();
        return true;
    }

    public async Task<PostResponse?> ToggleLikeAsync(Guid id, string userId)
    {
        var post = await _postsRepository.Query().FirstOrDefaultAsync(p => p.Id == id);
        if (post is null)
        {
            return null;
        }

        if (post.UserId == userId)
        {
            throw new InvalidOperationException("Không thể like bài viết của chính mình.");
        }

        var existing = await _likesRepository.Query()
            .FirstOrDefaultAsync(l => l.PostId == id && l.UserId == userId);

        if (existing is null)
        {
            await _likesRepository.AddAsync(new Like
            {
                PostId = id,
                UserId = userId,
                CreatedAt = DateTime.UtcNow
            });
        }
        else
        {
            _likesRepository.Delete(existing);
        }

        await _likesRepository.SaveChangesAsync();
        var updated = await BuildPostQuery().FirstAsync(p => p.Id == id);
        return updated.ToPostResponse();
    }

    public async Task<CommentResponse?> AddCommentAsync(Guid id, string userId, AddCommentRequest request)
    {
        var postExists = await _postsRepository.AnyAsync(p => p.Id == id);
        if (!postExists)
        {
            return null;
        }

        var comment = new Comment
        {
            Content = request.Content,
            UserId = userId,
            PostId = id,
            CreatedAt = DateTime.UtcNow
        };

        await _commentsRepository.AddAsync(comment);
        await _commentsRepository.SaveChangesAsync();

        var created = await _commentsRepository.Query()
            .Include(c => c.User)
            .FirstAsync(c => c.Id == comment.Id);

        return created.ToCommentResponse();
    }

    public async Task<PostResponse?> ShareAsync(Guid id, string userId)
    {
        var originalPost = await _postsRepository.Query().FirstOrDefaultAsync(p => p.Id == id);
        if (originalPost is null)
        {
            return null;
        }

        var sharedPost = new Post
        {
            Content = originalPost.Content,
            ImageUrl = originalPost.ImageUrl,
            UserId = userId,
            OriginalPostId = id,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _postsRepository.AddAsync(sharedPost);
        await _postsRepository.SaveChangesAsync();

        var created = await BuildPostQuery().FirstAsync(p => p.Id == sharedPost.Id);
        return created.ToPostResponse();
    }

    public async Task<bool> ReportAsync(Guid id, string userId, CreateReportRequest request)
    {
        var postExists = await _postsRepository.AnyAsync(p => p.Id == id);
        if (!postExists)
        {
            return false;
        }

        var existed = await _postReportsRepository.AnyAsync(r => r.PostId == id && r.UserId == userId && r.Status == "Open");
        if (existed)
        {
            throw new InvalidOperationException("Bạn đã report bài viết này rồi.");
        }

        await _postReportsRepository.AddAsync(new PostReport
        {
            PostId = id,
            UserId = userId,
            Reason = request.Reason,
            Status = "Open",
            CreatedAt = DateTime.UtcNow
        });

        await _postReportsRepository.SaveChangesAsync();
        return true;
    }

    private IQueryable<Post> BuildPostQuery()
    {
        return _postsRepository.Query()
            .Include(p => p.User)
            .Include(p => p.Likes)
            .Include(p => p.Comments)
                .ThenInclude(c => c.User)
            .Include(p => p.PostHashtags)
                .ThenInclude(ph => ph.Hashtag);
    }

    private async Task SyncHashtagsAsync(Guid postId, string content)
    {
        var tags = Regex.Matches(content, "#\\w+")
            .Select(m => m.Value.ToLowerInvariant())
            .Distinct()
            .ToList();

        var existing = await _postHashtagsRepository.Query()
            .Where(ph => ph.PostId == postId)
            .ToListAsync();

        foreach (var item in existing)
        {
            _postHashtagsRepository.Delete(item);
        }

        await _postHashtagsRepository.SaveChangesAsync();

        foreach (var tag in tags)
        {
            var hashtag = await _hashtagsRepository.Query().FirstOrDefaultAsync(h => h.Name == tag);
            if (hashtag is null)
            {
                hashtag = new Hashtag { Name = tag };
                await _hashtagsRepository.AddAsync(hashtag);
                await _hashtagsRepository.SaveChangesAsync();
            }

            await _postHashtagsRepository.AddAsync(new PostHashtag
            {
                PostId = postId,
                HashtagId = hashtag.Id
            });
        }

        await _postHashtagsRepository.SaveChangesAsync();
    }
}
