using InteractHub.API.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace InteractHub.API.Data;

public class AppDbContext : IdentityDbContext<User>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Post> Posts => Set<Post>();
    public DbSet<Comment> Comments => Set<Comment>();
    public DbSet<Like> Likes => Set<Like>();
    public DbSet<Friendship> Friendships => Set<Friendship>();
    public DbSet<Story> Stories => Set<Story>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<Hashtag> Hashtags => Set<Hashtag>();
    public DbSet<PostHashtag> PostHashtags => Set<PostHashtag>();
    public DbSet<PostReport> PostReports => Set<PostReport>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<Post>()
            .HasOne(p => p.OriginalPost)
            .WithMany(p => p.SharedPosts)
            .HasForeignKey(p => p.OriginalPostId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<Post>()
            .HasOne(p => p.User)
            .WithMany(u => u.Posts)
            .HasForeignKey(p => p.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<Comment>()
            .HasOne(c => c.User)
            .WithMany(u => u.Comments)
            .HasForeignKey(c => c.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<Comment>()
            .HasOne(c => c.Post)
            .WithMany(p => p.Comments)
            .HasForeignKey(c => c.PostId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<Like>()
            .HasOne(l => l.User)
            .WithMany(u => u.Likes)
            .HasForeignKey(l => l.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<Like>()
            .HasOne(l => l.Post)
            .WithMany(p => p.Likes)
            .HasForeignKey(l => l.PostId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<Like>()
            .HasOne(l => l.Comment)
            .WithMany(c => c.Likes)
            .HasForeignKey(l => l.CommentId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<PostHashtag>()
            .HasKey(ph => new { ph.PostId, ph.HashtagId });

        builder.Entity<Like>()
            .HasIndex(l => new { l.UserId, l.PostId })
            .IsUnique()
            .HasFilter("[PostId] IS NOT NULL");

        builder.Entity<Like>()
            .HasIndex(l => new { l.UserId, l.CommentId })
            .IsUnique()
            .HasFilter("[CommentId] IS NOT NULL");

        builder.Entity<Friendship>()
            .HasIndex(f => new { f.SenderId, f.ReceiverId })
            .IsUnique();

        builder.Entity<Friendship>()
            .HasOne(f => f.Sender)
            .WithMany()
            .HasForeignKey(f => f.SenderId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<Friendship>()
            .HasOne(f => f.Receiver)
            .WithMany()
            .HasForeignKey(f => f.ReceiverId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<Notification>()
            .HasOne(n => n.Sender)
            .WithMany()
            .HasForeignKey(n => n.SenderId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<Notification>()
            .HasOne(n => n.Receiver)
            .WithMany()
            .HasForeignKey(n => n.ReceiverId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<Hashtag>()
            .HasIndex(h => h.Name)
            .IsUnique();

        builder.Entity<Post>()
            .HasIndex(p => p.CreatedAt);

        builder.Entity<Story>()
            .HasIndex(s => s.ExpiresAt);

        builder.Entity<Notification>()
            .HasIndex(n => new { n.ReceiverId, n.IsRead });

        builder.Entity<PostReport>()
            .HasIndex(r => r.Status);
    }
}
