using InteractHub.API.Entities;

namespace InteractHub.API.Interfaces;

public interface IJwtTokenService
{
    string CreateToken(User user, IList<string> roles);
    int GetExpirySeconds();
}
