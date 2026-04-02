using InteractHub.API.Data;
using Microsoft.EntityFrameworkCore;

namespace InteractHub.Test.Helpers;

internal static class TestDbFactory
{
    public static AppDbContext CreateInMemoryContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase($"InteractHubTestDb-{Guid.NewGuid()}")
            .Options;

        return new AppDbContext(options);
    }
}
