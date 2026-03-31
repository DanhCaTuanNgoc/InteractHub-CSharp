using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using InteractHub.API.Entities;
using InteractHub.API.Interfaces;
using Microsoft.IdentityModel.Tokens;

namespace InteractHub.API.Services;

public class JwtTokenService : IJwtTokenService
{
    private readonly IConfiguration _configuration;

    public JwtTokenService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public string CreateToken(User user, IList<string> roles)
    {
        var jwt = _configuration.GetSection("Jwt");
        var secret = jwt["Secret"] ?? throw new InvalidOperationException("Missing Jwt:Secret");
        var issuer = jwt["Issuer"] ?? throw new InvalidOperationException("Missing Jwt:Issuer");
        var audience = jwt["Audience"] ?? throw new InvalidOperationException("Missing Jwt:Audience");
        var expiryMinutes = int.Parse(jwt["ExpiryMinutes"] ?? "120");

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id),
            new(JwtRegisteredClaimNames.Email, user.Email ?? string.Empty),
            new(JwtRegisteredClaimNames.UniqueName, user.UserName ?? string.Empty),
            new(ClaimTypes.NameIdentifier, user.Id),
            new(ClaimTypes.Name, user.UserName ?? string.Empty)
        };

        claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer,
            audience,
            claims,
            expires: DateTime.UtcNow.AddMinutes(expiryMinutes),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public int GetExpirySeconds()
    {
        var expiryMinutes = int.Parse(_configuration["Jwt:ExpiryMinutes"] ?? "120");
        return expiryMinutes * 60;
    }
}
