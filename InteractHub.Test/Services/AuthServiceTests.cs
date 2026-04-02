using InteractHub.API.DTOs.Request;
using InteractHub.API.Entities;
using InteractHub.API.Interfaces;
using InteractHub.API.Services;
using Microsoft.AspNetCore.Identity;
using MockQueryable.Moq;
using Moq;

namespace InteractHub.Test.Services;

public class AuthServiceTests
{
    [Fact]
    public async Task RegisterAsync_ShouldReturnAuthResponse_WhenRequestValid()
    {
        var request = new RegisterRequest
        {
            UserName = "newuser",
            Email = "new@interacthub.dev",
            Password = "P@ssw0rd123",
            FullName = "New User"
        };

        var userManager = CreateUserManagerMock(Array.Empty<User>());
        userManager
            .Setup(m => m.CreateAsync(It.IsAny<User>(), request.Password))
            .ReturnsAsync(IdentityResult.Success);
        userManager
            .Setup(m => m.AddToRoleAsync(It.IsAny<User>(), "User"))
            .ReturnsAsync(IdentityResult.Success);
        userManager
            .Setup(m => m.GetRolesAsync(It.IsAny<User>()))
            .ReturnsAsync(new List<string> { "User" });

        var jwtService = new Mock<IJwtTokenService>();
        jwtService.Setup(s => s.CreateToken(It.IsAny<User>(), It.IsAny<IList<string>>())).Returns("jwt-token");
        jwtService.Setup(s => s.GetExpirySeconds()).Returns(3600);

        var service = new AuthService(userManager.Object, jwtService.Object);

        var result = await service.RegisterAsync(request);

        Assert.Equal("jwt-token", result.Token);
        Assert.Equal(3600, result.ExpiresIn);
        Assert.Equal(request.Email, result.User.Email);
        Assert.Equal(request.UserName, result.User.UserName);

        userManager.Verify(m => m.CreateAsync(It.IsAny<User>(), request.Password), Times.Once);
        userManager.Verify(m => m.AddToRoleAsync(It.IsAny<User>(), "User"), Times.Once);
    }

    [Fact]
    public async Task RegisterAsync_ShouldThrow_WhenEmailOrUsernameExists()
    {
        var request = new RegisterRequest
        {
            UserName = "existing",
            Email = "existing@interacthub.dev",
            Password = "P@ssw0rd123",
            FullName = "Existing User"
        };

        var existingUsers = new List<User>
        {
            new() { Id = "u1", UserName = "existing", Email = "other@interacthub.dev", FullName = "User 1" }
        };

        var userManager = CreateUserManagerMock(existingUsers);
        var jwtService = new Mock<IJwtTokenService>();
        var service = new AuthService(userManager.Object, jwtService.Object);

        await Assert.ThrowsAsync<InvalidOperationException>(() => service.RegisterAsync(request));
        userManager.Verify(m => m.CreateAsync(It.IsAny<User>(), It.IsAny<string>()), Times.Never);
    }

    [Fact]
    public async Task RegisterAsync_ShouldThrow_WhenCreateFails()
    {
        var request = new RegisterRequest
        {
            UserName = "newuser",
            Email = "new@interacthub.dev",
            Password = "weak",
            FullName = "New User"
        };

        var userManager = CreateUserManagerMock(Array.Empty<User>());
        userManager
            .Setup(m => m.CreateAsync(It.IsAny<User>(), request.Password))
            .ReturnsAsync(IdentityResult.Failed(new IdentityError { Description = "Password too weak" }));

        var jwtService = new Mock<IJwtTokenService>();
        var service = new AuthService(userManager.Object, jwtService.Object);

        var ex = await Assert.ThrowsAsync<InvalidOperationException>(() => service.RegisterAsync(request));
        Assert.Contains("Password too weak", ex.Message);
    }

    [Fact]
    public async Task LoginAsync_ShouldReturnAuthResponse_WhenCredentialsValid()
    {
        var request = new LoginRequest
        {
            Email = "user@interacthub.dev",
            Password = "P@ssw0rd123"
        };

        var user = new User
        {
            Id = "u1",
            UserName = "user1",
            Email = request.Email,
            FullName = "User One"
        };

        var userManager = CreateUserManagerMock(new[] { user });
        userManager.Setup(m => m.CheckPasswordAsync(user, request.Password)).ReturnsAsync(true);
        userManager.Setup(m => m.GetRolesAsync(user)).ReturnsAsync(new List<string> { "User" });

        var jwtService = new Mock<IJwtTokenService>();
        jwtService.Setup(s => s.CreateToken(user, It.IsAny<IList<string>>())).Returns("jwt-login");
        jwtService.Setup(s => s.GetExpirySeconds()).Returns(1800);

        var service = new AuthService(userManager.Object, jwtService.Object);
        var result = await service.LoginAsync(request);

        Assert.Equal("jwt-login", result.Token);
        Assert.Equal(1800, result.ExpiresIn);
        Assert.Equal(user.Email, result.User.Email);
    }

    [Fact]
    public async Task LoginAsync_ShouldThrowUnauthorized_WhenUserNotFound()
    {
        var request = new LoginRequest
        {
            Email = "missing@interacthub.dev",
            Password = "secret"
        };

        var userManager = CreateUserManagerMock(Array.Empty<User>());
        var jwtService = new Mock<IJwtTokenService>();
        var service = new AuthService(userManager.Object, jwtService.Object);

        await Assert.ThrowsAsync<UnauthorizedAccessException>(() => service.LoginAsync(request));
    }

    [Fact]
    public async Task LoginAsync_ShouldThrowUnauthorized_WhenPasswordInvalid()
    {
        var request = new LoginRequest
        {
            Email = "user@interacthub.dev",
            Password = "wrong-pass"
        };

        var user = new User
        {
            Id = "u1",
            UserName = "user1",
            Email = request.Email,
            FullName = "User One"
        };

        var userManager = CreateUserManagerMock(new[] { user });
        userManager.Setup(m => m.CheckPasswordAsync(user, request.Password)).ReturnsAsync(false);

        var jwtService = new Mock<IJwtTokenService>();
        var service = new AuthService(userManager.Object, jwtService.Object);

        await Assert.ThrowsAsync<UnauthorizedAccessException>(() => service.LoginAsync(request));
    }

    private static Mock<UserManager<User>> CreateUserManagerMock(IEnumerable<User> users)
    {
        var store = new Mock<IUserStore<User>>();
        var manager = new Mock<UserManager<User>>(
            store.Object,
            null!,
            null!,
            null!,
            null!,
            null!,
            null!,
            null!,
            null!);

        var mockUsers = users.AsQueryable().BuildMock();
        manager.SetupGet(m => m.Users).Returns(mockUsers);

        return manager;
    }
}
