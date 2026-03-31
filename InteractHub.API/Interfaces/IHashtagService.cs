using InteractHub.API.DTOs.Response;

namespace InteractHub.API.Interfaces;

public interface IHashtagService
{
    Task<List<HashtagResponse>> GetTrendingAsync(int top = 10);
}
