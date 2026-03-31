using InteractHub.API.DTOs.Common;
using InteractHub.API.DTOs.Response;
using InteractHub.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InteractHub.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class HashtagsController : ControllerBase
{
    private readonly IHashtagService _hashtagService;

    public HashtagsController(IHashtagService hashtagService)
    {
        _hashtagService = hashtagService;
    }

    [HttpGet("trending")]
    public async Task<IActionResult> Trending([FromQuery] int top = 10)
    {
        var data = await _hashtagService.GetTrendingAsync(top);
        return Ok(ApiResponse<List<HashtagResponse>>.Ok(data));
    }
}
