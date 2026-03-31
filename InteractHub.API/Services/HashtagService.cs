using InteractHub.API.DTOs.Response;
using InteractHub.API.Entities;
using InteractHub.API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace InteractHub.API.Services;

public class HashtagService : IHashtagService
{
    private readonly IRepository<Hashtag> _hashtagsRepository;

    public HashtagService(IRepository<Hashtag> hashtagsRepository)
    {
        _hashtagsRepository = hashtagsRepository;
    }

    public async Task<List<HashtagResponse>> GetTrendingAsync(int top = 10)
    {
        return await _hashtagsRepository.Query()
            .Select(h => new HashtagResponse
            {
                Id = h.Id,
                Name = h.Name,
                UsageCount = h.PostHashtags.Count
            })
            .OrderByDescending(h => h.UsageCount)
            .ThenBy(h => h.Name)
            .Take(top)
            .ToListAsync();
    }
}
