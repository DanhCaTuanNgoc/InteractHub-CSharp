using InteractHub.API.Entities;
using InteractHub.API.Repositories;
using InteractHub.API.Services;
using InteractHub.Test.Helpers;

namespace InteractHub.Test.Services;

public class HashtagServiceTests
{
    [Fact]
    public async Task GetTrendingAsync_ShouldOrderByUsageCountThenName()
    {
        using var db = TestDbFactory.CreateInMemoryContext();

        var h1 = new Hashtag { Name = "dotnet" };
        var h2 = new Hashtag { Name = "azure" };
        var h3 = new Hashtag { Name = "react" };

        h1.PostHashtags.Add(new PostHashtag { Hashtag = h1, Post = new Post { UserId = "u1", Content = "p1" } });
        h1.PostHashtags.Add(new PostHashtag { Hashtag = h1, Post = new Post { UserId = "u1", Content = "p2" } });
        h2.PostHashtags.Add(new PostHashtag { Hashtag = h2, Post = new Post { UserId = "u1", Content = "p3" } });
        h3.PostHashtags.Add(new PostHashtag { Hashtag = h3, Post = new Post { UserId = "u1", Content = "p4" } });

        db.Hashtags.AddRange(h1, h2, h3);
        await db.SaveChangesAsync();

        var service = new HashtagService(new Repository<Hashtag>(db));
        var result = await service.GetTrendingAsync(2);

        Assert.Equal(2, result.Count);
        Assert.Equal("dotnet", result[0].Name);
        Assert.True(result[0].UsageCount >= result[1].UsageCount);
    }
}
