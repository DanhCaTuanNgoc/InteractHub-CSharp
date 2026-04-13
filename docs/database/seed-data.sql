SET NOCOUNT ON;

-- InteractHub seed data script for SQL Server.
-- Notes:
-- 1) This script is idempotent (safe to run multiple times).
-- 2) PasswordHash values are intentionally left NULL for SQL-only seeded users.
--    For login-ready seeded accounts, run the API so DbSeeder creates users via UserManager.

BEGIN TRY
    BEGIN TRAN;

    DECLARE @AdminRoleId NVARCHAR(450) = N'role-admin';
    DECLARE @UserRoleId NVARCHAR(450) = N'role-user';

    IF NOT EXISTS (SELECT 1 FROM AspNetRoles WHERE Id = @AdminRoleId)
    BEGIN
        INSERT INTO AspNetRoles (Id, Name, NormalizedName, ConcurrencyStamp)
        VALUES (@AdminRoleId, N'Admin', N'ADMIN', NEWID());
    END;

    IF NOT EXISTS (SELECT 1 FROM AspNetRoles WHERE Id = @UserRoleId)
    BEGIN
        INSERT INTO AspNetRoles (Id, Name, NormalizedName, ConcurrencyStamp)
        VALUES (@UserRoleId, N'User', N'USER', NEWID());
    END;

    DECLARE @AdminUserId NVARCHAR(450) = N'admin-seed';
    DECLARE @DemoUserId NVARCHAR(450) = N'demo-seed';

    IF NOT EXISTS (SELECT 1 FROM AspNetUsers WHERE Email = N'admin@interacthub.local')
    BEGIN
        INSERT INTO AspNetUsers
        (
            Id, FullName, AvatarUrl, Bio, CreatedAt,
            UserName, NormalizedUserName,
            Email, NormalizedEmail, EmailConfirmed,
            PasswordHash, SecurityStamp, ConcurrencyStamp,
            PhoneNumber, PhoneNumberConfirmed,
            TwoFactorEnabled, LockoutEnd, LockoutEnabled, AccessFailedCount
        )
        VALUES
        (
            @AdminUserId, N'InteractHub Admin', NULL, N'Administrator account seeded by SQL script.', SYSUTCDATETIME(),
            N'admin', N'ADMIN',
            N'admin@interacthub.local', N'ADMIN@INTERACTHUB.LOCAL', 1,
            NULL, NEWID(), NEWID(),
            NULL, 0,
            0, NULL, 1, 0
        );
    END
    ELSE
    BEGIN
        SELECT TOP 1 @AdminUserId = Id FROM AspNetUsers WHERE Email = N'admin@interacthub.local';
    END;

    IF NOT EXISTS (SELECT 1 FROM AspNetUsers WHERE Email = N'demo@interacthub.local')
    BEGIN
        INSERT INTO AspNetUsers
        (
            Id, FullName, AvatarUrl, Bio, CreatedAt,
            UserName, NormalizedUserName,
            Email, NormalizedEmail, EmailConfirmed,
            PasswordHash, SecurityStamp, ConcurrencyStamp,
            PhoneNumber, PhoneNumberConfirmed,
            TwoFactorEnabled, LockoutEnd, LockoutEnabled, AccessFailedCount
        )
        VALUES
        (
            @DemoUserId, N'Demo User', NULL, N'Nguoi dung mau cho du an InteractHub', SYSUTCDATETIME(),
            N'demo', N'DEMO',
            N'demo@interacthub.local', N'DEMO@INTERACTHUB.LOCAL', 1,
            NULL, NEWID(), NEWID(),
            NULL, 0,
            0, NULL, 1, 0
        );
    END
    ELSE
    BEGIN
        SELECT TOP 1 @DemoUserId = Id FROM AspNetUsers WHERE Email = N'demo@interacthub.local';
    END;

    IF NOT EXISTS (SELECT 1 FROM AspNetUserRoles WHERE UserId = @AdminUserId AND RoleId = @AdminRoleId)
    BEGIN
        INSERT INTO AspNetUserRoles (UserId, RoleId)
        VALUES (@AdminUserId, @AdminRoleId);
    END;

    IF NOT EXISTS (SELECT 1 FROM AspNetUserRoles WHERE UserId = @DemoUserId AND RoleId = @UserRoleId)
    BEGIN
        INSERT INTO AspNetUserRoles (UserId, RoleId)
        VALUES (@DemoUserId, @UserRoleId);
    END;

    IF NOT EXISTS (
        SELECT 1
        FROM Posts
        WHERE UserId = @DemoUserId
          AND Content = N'Welcome to InteractHub! Day la bai viet mau duoc seed khi khoi tao he thong.'
    )
    BEGIN
        INSERT INTO Posts (Id, Content, ImageUrl, CreatedAt, UpdatedAt, UserId, OriginalPostId)
        VALUES
        (
            NEWID(),
            N'Welcome to InteractHub! Day la bai viet mau duoc seed khi khoi tao he thong.',
            NULL,
            SYSUTCDATETIME(),
            SYSUTCDATETIME(),
            @DemoUserId,
            NULL
        );
    END;

    COMMIT TRAN;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRAN;

    THROW;
END CATCH;
