using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using InteractHub.API.Entities;
using InteractHub.API.Services;
using Microsoft.Extensions.Configuration;

namespace InteractHub.Test.Services;

public class JwtTokenServiceTests
{
    [Fact]
    public void CreateToken_ShouldIncludeIdentityAndRoleClaims()
    {
        var configuration = BuildConfiguration();
        var service = new JwtTokenService(configuration);

        var token = service.CreateToken(
            new User
            {
                Id = "u1",
                UserName = "demo",
                Email = "demo@interacthub.dev",
                FullName = "Demo"
            },
            new List<string> { "User", "Admin" });

        var payload = new JwtSecurityTokenHandler().ReadJwtToken(token);

        Assert.Contains(payload.Claims, c => c.Type == ClaimTypes.NameIdentifier && c.Value == "u1");
        Assert.Contains(payload.Claims, c => c.Type == ClaimTypes.Name && c.Value == "demo");
        Assert.Contains(payload.Claims, c => c.Type == ClaimTypes.Role && c.Value == "User");
        Assert.Contains(payload.Claims, c => c.Type == ClaimTypes.Role && c.Value == "Admin");
    }

    [Fact]
    public void GetExpirySeconds_ShouldUseConfiguredMinutes()
    {
        var configuration = BuildConfiguration();
        var service = new JwtTokenService(configuration);

        var expires = service.GetExpirySeconds();

        Assert.Equal(5400, expires);
    }

    private static IConfiguration BuildConfiguration()
    {
        var settings = new Dictionary<string, string?>
        {
            ["Jwt:Secret"] = "this-is-a-very-long-test-secret-key-12345",
            ["Jwt:Issuer"] = "interacthub-tests",
            ["Jwt:Audience"] = "interacthub-tests-client",
            ["Jwt:ExpiryMinutes"] = "90"
        };

        return new ConfigurationBuilder()
            .AddInMemoryCollection(settings)
            .Build();
    }
}
