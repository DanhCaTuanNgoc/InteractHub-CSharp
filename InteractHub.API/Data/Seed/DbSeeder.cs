using InteractHub.API.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace InteractHub.API.Data.Seed;

public static class DbSeeder
{
    public static async Task SeedAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();
        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        await db.Database.MigrateAsync();

        var roles = new[] { "User", "Admin" };
        foreach (var role in roles)
        {
            if (!await roleManager.RoleExistsAsync(role))
            {
                await roleManager.CreateAsync(new IdentityRole(role));
            }
        }

        const string adminEmail = "admin@interacthub.local";
        var admin = await userManager.Users.FirstOrDefaultAsync(u => u.Email == adminEmail);
        if (admin is null)
        {
            admin = new User
            {
                UserName = "admin",
                Email = adminEmail,
                FullName = "InteractHub Admin",
                EmailConfirmed = true
            };

            var created = await userManager.CreateAsync(admin, "Admin@12345");
            if (created.Succeeded)
            {
                await userManager.AddToRoleAsync(admin, "Admin");
            }
        }

        const string demoEmail = "demo@interacthub.local";
        var demoUser = await userManager.Users.FirstOrDefaultAsync(u => u.Email == demoEmail);
        if (demoUser is null)
        {
            demoUser = new User
            {
                UserName = "demo",
                Email = demoEmail,
                FullName = "Demo User",
                EmailConfirmed = true,
                Bio = "Nguoi dung mau cho du an InteractHub"
            };

            var created = await userManager.CreateAsync(demoUser, "Demo@12345");
            if (created.Succeeded)
            {
                await userManager.AddToRoleAsync(demoUser, "User");
            }
        }

        var hasSeedPost = await db.Posts.AnyAsync();
        if (!hasSeedPost && demoUser is not null)
        {
            db.Posts.Add(new Post
            {
                Content = "Welcome to InteractHub! Day la bai viet mau duoc seed khi khoi tao he thong.",
                UserId = demoUser.Id,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });
            await db.SaveChangesAsync();
        }
    }
}
