using InteractHub.API.DTOs.Request;
using InteractHub.API.DTOs.Response;
using InteractHub.API.Entities;
using InteractHub.API.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace InteractHub.API.Services;

public class AuthService : IAuthService
{
    private readonly UserManager<User> _userManager;
    private readonly IJwtTokenService _jwtTokenService;

    public AuthService(UserManager<User> userManager, IJwtTokenService jwtTokenService)
    {
        _userManager = userManager;
        _jwtTokenService = jwtTokenService;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        var exists = await _userManager.Users.AnyAsync(u => u.Email == request.Email || u.UserName == request.UserName);
        if (exists)
        {
            throw new InvalidOperationException("Email hoặc username đã tồn tại.");
        }

        var user = new User
        {
            UserName = request.UserName,
            Email = request.Email,
            FullName = request.FullName,
            EmailConfirmed = true,
            CreatedAt = DateTime.UtcNow
        };

        var result = await _userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            throw new InvalidOperationException(string.Join("; ", result.Errors.Select(e => e.Description)));
        }

        await _userManager.AddToRoleAsync(user, "User");
        var roles = await _userManager.GetRolesAsync(user);
        var token = _jwtTokenService.CreateToken(user, roles);

        return new AuthResponse
        {
            Token = token,
            ExpiresIn = _jwtTokenService.GetExpirySeconds(),
            User = user.ToUserSummary()
        };
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        var loginInput = request.Email.Trim();
        var normalizedEmail = _userManager.NormalizeEmail(loginInput);
        var normalizedUserName = _userManager.NormalizeName(loginInput);

        var user = await _userManager.Users.FirstOrDefaultAsync(
            u => u.NormalizedEmail == normalizedEmail || u.NormalizedUserName == normalizedUserName);
        if (user is null)
        {
            throw new UnauthorizedAccessException("Thông tin đăng nhập không hợp lệ.");
        }

        var validPassword = await _userManager.CheckPasswordAsync(user, request.Password);
        if (!validPassword)
        {
            throw new UnauthorizedAccessException("Thông tin đăng nhập không hợp lệ.");
        }

        var roles = await _userManager.GetRolesAsync(user);
        var token = _jwtTokenService.CreateToken(user, roles);

        return new AuthResponse
        {
            Token = token,
            ExpiresIn = _jwtTokenService.GetExpirySeconds(),
            User = user.ToUserSummary()
        };
    }
}
