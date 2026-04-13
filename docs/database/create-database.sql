IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;
GO

BEGIN TRANSACTION;
GO

CREATE TABLE [AspNetRoles] (
    [Id] nvarchar(450) NOT NULL,
    [Name] nvarchar(256) NULL,
    [NormalizedName] nvarchar(256) NULL,
    [ConcurrencyStamp] nvarchar(max) NULL,
    CONSTRAINT [PK_AspNetRoles] PRIMARY KEY ([Id])
);
GO

CREATE TABLE [AspNetUsers] (
    [Id] nvarchar(450) NOT NULL,
    [FullName] nvarchar(100) NOT NULL,
    [AvatarUrl] nvarchar(512) NULL,
    [Bio] nvarchar(280) NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UserName] nvarchar(256) NULL,
    [NormalizedUserName] nvarchar(256) NULL,
    [Email] nvarchar(256) NULL,
    [NormalizedEmail] nvarchar(256) NULL,
    [EmailConfirmed] bit NOT NULL,
    [PasswordHash] nvarchar(max) NULL,
    [SecurityStamp] nvarchar(max) NULL,
    [ConcurrencyStamp] nvarchar(max) NULL,
    [PhoneNumber] nvarchar(max) NULL,
    [PhoneNumberConfirmed] bit NOT NULL,
    [TwoFactorEnabled] bit NOT NULL,
    [LockoutEnd] datetimeoffset NULL,
    [LockoutEnabled] bit NOT NULL,
    [AccessFailedCount] int NOT NULL,
    CONSTRAINT [PK_AspNetUsers] PRIMARY KEY ([Id])
);
GO

CREATE TABLE [Hashtags] (
    [Id] uniqueidentifier NOT NULL,
    [Name] nvarchar(80) NOT NULL,
    CONSTRAINT [PK_Hashtags] PRIMARY KEY ([Id])
);
GO

CREATE TABLE [AspNetRoleClaims] (
    [Id] int NOT NULL IDENTITY,
    [RoleId] nvarchar(450) NOT NULL,
    [ClaimType] nvarchar(max) NULL,
    [ClaimValue] nvarchar(max) NULL,
    CONSTRAINT [PK_AspNetRoleClaims] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_AspNetRoleClaims_AspNetRoles_RoleId] FOREIGN KEY ([RoleId]) REFERENCES [AspNetRoles] ([Id]) ON DELETE CASCADE
);
GO

CREATE TABLE [AspNetUserClaims] (
    [Id] int NOT NULL IDENTITY,
    [UserId] nvarchar(450) NOT NULL,
    [ClaimType] nvarchar(max) NULL,
    [ClaimValue] nvarchar(max) NULL,
    CONSTRAINT [PK_AspNetUserClaims] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_AspNetUserClaims_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE CASCADE
);
GO

CREATE TABLE [AspNetUserLogins] (
    [LoginProvider] nvarchar(450) NOT NULL,
    [ProviderKey] nvarchar(450) NOT NULL,
    [ProviderDisplayName] nvarchar(max) NULL,
    [UserId] nvarchar(450) NOT NULL,
    CONSTRAINT [PK_AspNetUserLogins] PRIMARY KEY ([LoginProvider], [ProviderKey]),
    CONSTRAINT [FK_AspNetUserLogins_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE CASCADE
);
GO

CREATE TABLE [AspNetUserRoles] (
    [UserId] nvarchar(450) NOT NULL,
    [RoleId] nvarchar(450) NOT NULL,
    CONSTRAINT [PK_AspNetUserRoles] PRIMARY KEY ([UserId], [RoleId]),
    CONSTRAINT [FK_AspNetUserRoles_AspNetRoles_RoleId] FOREIGN KEY ([RoleId]) REFERENCES [AspNetRoles] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_AspNetUserRoles_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE CASCADE
);
GO

CREATE TABLE [AspNetUserTokens] (
    [UserId] nvarchar(450) NOT NULL,
    [LoginProvider] nvarchar(450) NOT NULL,
    [Name] nvarchar(450) NOT NULL,
    [Value] nvarchar(max) NULL,
    CONSTRAINT [PK_AspNetUserTokens] PRIMARY KEY ([UserId], [LoginProvider], [Name]),
    CONSTRAINT [FK_AspNetUserTokens_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE CASCADE
);
GO

CREATE TABLE [Friendships] (
    [Id] uniqueidentifier NOT NULL,
    [SenderId] nvarchar(450) NOT NULL,
    [ReceiverId] nvarchar(450) NOT NULL,
    [Status] int NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NULL,
    CONSTRAINT [PK_Friendships] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Friendships_AspNetUsers_ReceiverId] FOREIGN KEY ([ReceiverId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_Friendships_AspNetUsers_SenderId] FOREIGN KEY ([SenderId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE NO ACTION
);
GO

CREATE TABLE [Notifications] (
    [Id] uniqueidentifier NOT NULL,
    [Type] nvarchar(60) NOT NULL,
    [Content] nvarchar(512) NOT NULL,
    [IsRead] bit NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [SenderId] nvarchar(450) NOT NULL,
    [ReceiverId] nvarchar(450) NOT NULL,
    CONSTRAINT [PK_Notifications] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Notifications_AspNetUsers_ReceiverId] FOREIGN KEY ([ReceiverId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_Notifications_AspNetUsers_SenderId] FOREIGN KEY ([SenderId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE NO ACTION
);
GO

CREATE TABLE [Posts] (
    [Id] uniqueidentifier NOT NULL,
    [Content] nvarchar(2000) NOT NULL,
    [ImageUrl] nvarchar(512) NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NOT NULL,
    [UserId] nvarchar(450) NOT NULL,
    [OriginalPostId] uniqueidentifier NULL,
    CONSTRAINT [PK_Posts] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Posts_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_Posts_Posts_OriginalPostId] FOREIGN KEY ([OriginalPostId]) REFERENCES [Posts] ([Id]) ON DELETE NO ACTION
);
GO

CREATE TABLE [Stories] (
    [Id] uniqueidentifier NOT NULL,
    [MediaUrl] nvarchar(512) NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [ExpiresAt] datetime2 NOT NULL,
    [UserId] nvarchar(450) NOT NULL,
    CONSTRAINT [PK_Stories] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Stories_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE CASCADE
);
GO

CREATE TABLE [Comments] (
    [Id] uniqueidentifier NOT NULL,
    [Content] nvarchar(1000) NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UserId] nvarchar(450) NOT NULL,
    [PostId] uniqueidentifier NOT NULL,
    CONSTRAINT [PK_Comments] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Comments_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_Comments_Posts_PostId] FOREIGN KEY ([PostId]) REFERENCES [Posts] ([Id]) ON DELETE NO ACTION
);
GO

CREATE TABLE [PostHashtags] (
    [PostId] uniqueidentifier NOT NULL,
    [HashtagId] uniqueidentifier NOT NULL,
    CONSTRAINT [PK_PostHashtags] PRIMARY KEY ([PostId], [HashtagId]),
    CONSTRAINT [FK_PostHashtags_Hashtags_HashtagId] FOREIGN KEY ([HashtagId]) REFERENCES [Hashtags] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_PostHashtags_Posts_PostId] FOREIGN KEY ([PostId]) REFERENCES [Posts] ([Id]) ON DELETE CASCADE
);
GO

CREATE TABLE [PostReports] (
    [Id] uniqueidentifier NOT NULL,
    [PostId] uniqueidentifier NOT NULL,
    [UserId] nvarchar(450) NOT NULL,
    [Reason] nvarchar(300) NOT NULL,
    [Status] nvarchar(60) NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_PostReports] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_PostReports_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_PostReports_Posts_PostId] FOREIGN KEY ([PostId]) REFERENCES [Posts] ([Id]) ON DELETE CASCADE
);
GO

CREATE TABLE [Likes] (
    [Id] uniqueidentifier NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UserId] nvarchar(450) NOT NULL,
    [PostId] uniqueidentifier NULL,
    [CommentId] uniqueidentifier NULL,
    CONSTRAINT [PK_Likes] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Likes_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_Likes_Comments_CommentId] FOREIGN KEY ([CommentId]) REFERENCES [Comments] ([Id]),
    CONSTRAINT [FK_Likes_Posts_PostId] FOREIGN KEY ([PostId]) REFERENCES [Posts] ([Id])
);
GO

CREATE INDEX [IX_AspNetRoleClaims_RoleId] ON [AspNetRoleClaims] ([RoleId]);
GO

CREATE UNIQUE INDEX [RoleNameIndex] ON [AspNetRoles] ([NormalizedName]) WHERE [NormalizedName] IS NOT NULL;
GO

CREATE INDEX [IX_AspNetUserClaims_UserId] ON [AspNetUserClaims] ([UserId]);
GO

CREATE INDEX [IX_AspNetUserLogins_UserId] ON [AspNetUserLogins] ([UserId]);
GO

CREATE INDEX [IX_AspNetUserRoles_RoleId] ON [AspNetUserRoles] ([RoleId]);
GO

CREATE INDEX [EmailIndex] ON [AspNetUsers] ([NormalizedEmail]);
GO

CREATE UNIQUE INDEX [UserNameIndex] ON [AspNetUsers] ([NormalizedUserName]) WHERE [NormalizedUserName] IS NOT NULL;
GO

CREATE INDEX [IX_Comments_PostId] ON [Comments] ([PostId]);
GO

CREATE INDEX [IX_Comments_UserId] ON [Comments] ([UserId]);
GO

CREATE INDEX [IX_Friendships_ReceiverId] ON [Friendships] ([ReceiverId]);
GO

CREATE UNIQUE INDEX [IX_Friendships_SenderId_ReceiverId] ON [Friendships] ([SenderId], [ReceiverId]);
GO

CREATE UNIQUE INDEX [IX_Hashtags_Name] ON [Hashtags] ([Name]);
GO

CREATE INDEX [IX_Likes_CommentId] ON [Likes] ([CommentId]);
GO

CREATE INDEX [IX_Likes_PostId] ON [Likes] ([PostId]);
GO

CREATE UNIQUE INDEX [IX_Likes_UserId_CommentId] ON [Likes] ([UserId], [CommentId]) WHERE [CommentId] IS NOT NULL;
GO

CREATE UNIQUE INDEX [IX_Likes_UserId_PostId] ON [Likes] ([UserId], [PostId]) WHERE [PostId] IS NOT NULL;
GO

CREATE INDEX [IX_Notifications_ReceiverId_IsRead] ON [Notifications] ([ReceiverId], [IsRead]);
GO

CREATE INDEX [IX_Notifications_SenderId] ON [Notifications] ([SenderId]);
GO

CREATE INDEX [IX_PostHashtags_HashtagId] ON [PostHashtags] ([HashtagId]);
GO

CREATE INDEX [IX_PostReports_PostId] ON [PostReports] ([PostId]);
GO

CREATE INDEX [IX_PostReports_Status] ON [PostReports] ([Status]);
GO

CREATE INDEX [IX_PostReports_UserId] ON [PostReports] ([UserId]);
GO

CREATE INDEX [IX_Posts_CreatedAt] ON [Posts] ([CreatedAt]);
GO

CREATE INDEX [IX_Posts_OriginalPostId] ON [Posts] ([OriginalPostId]);
GO

CREATE INDEX [IX_Posts_UserId] ON [Posts] ([UserId]);
GO

CREATE INDEX [IX_Stories_ExpiresAt] ON [Stories] ([ExpiresAt]);
GO

CREATE INDEX [IX_Stories_UserId] ON [Stories] ([UserId]);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260331040119_InitialCreate', N'8.0.12');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260331040134_SeedRoles', N'8.0.12');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260331040146_AddIndexes', N'8.0.12');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

ALTER TABLE [Comments] DROP CONSTRAINT [FK_Comments_AspNetUsers_UserId];
GO

ALTER TABLE [Comments] DROP CONSTRAINT [FK_Comments_Posts_PostId];
GO

ALTER TABLE [Likes] DROP CONSTRAINT [FK_Likes_AspNetUsers_UserId];
GO

ALTER TABLE [Likes] DROP CONSTRAINT [FK_Likes_Comments_CommentId];
GO

ALTER TABLE [Likes] DROP CONSTRAINT [FK_Likes_Posts_PostId];
GO

ALTER TABLE [Posts] DROP CONSTRAINT [FK_Posts_AspNetUsers_UserId];
GO

ALTER TABLE [Comments] ADD CONSTRAINT [FK_Comments_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE NO ACTION;
GO

ALTER TABLE [Comments] ADD CONSTRAINT [FK_Comments_Posts_PostId] FOREIGN KEY ([PostId]) REFERENCES [Posts] ([Id]) ON DELETE NO ACTION;
GO

ALTER TABLE [Likes] ADD CONSTRAINT [FK_Likes_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE NO ACTION;
GO

ALTER TABLE [Likes] ADD CONSTRAINT [FK_Likes_Comments_CommentId] FOREIGN KEY ([CommentId]) REFERENCES [Comments] ([Id]) ON DELETE NO ACTION;
GO

ALTER TABLE [Likes] ADD CONSTRAINT [FK_Likes_Posts_PostId] FOREIGN KEY ([PostId]) REFERENCES [Posts] ([Id]) ON DELETE NO ACTION;
GO

ALTER TABLE [Posts] ADD CONSTRAINT [FK_Posts_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE NO ACTION;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260331040235_FixCascadeDeletePaths', N'8.0.12');
GO

COMMIT;
GO

