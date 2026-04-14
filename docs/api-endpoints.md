# InteractHub API Endpoints List

Base URL: /api

Authentication:
- Public endpoints do not require JWT.
- Endpoints marked "Authorized" require Bearer token.
- Admin endpoints require Admin role.

## Auth (Public)

Controller: [InteractHub.API/Controllers/AuthController.cs](../InteractHub.API/Controllers/AuthController.cs)

- POST /api/auth/register
- POST /api/auth/login

## Users (Authorized)

Controller: [InteractHub.API/Controllers/UsersController.cs](../InteractHub.API/Controllers/UsersController.cs)

- GET /api/users/{id}
- PUT /api/users/{id}
- GET /api/users/search

## Posts (Authorized)

Controller: [InteractHub.API/Controllers/PostsController.cs](../InteractHub.API/Controllers/PostsController.cs)

- GET /api/posts
- GET /api/posts/{id:guid}
- POST /api/posts
- PUT /api/posts/{id:guid}
- DELETE /api/posts/{id:guid}
- POST /api/posts/{id:guid}/like
- POST /api/posts/{id:guid}/comments
- POST /api/posts/{id:guid}/share
- POST /api/posts/{id:guid}/report

## Friends (Authorized)

Controller: [InteractHub.API/Controllers/FriendsController.cs](../InteractHub.API/Controllers/FriendsController.cs)

- POST /api/friends/request/{userId}
- PUT /api/friends/accept/{userId}
- PUT /api/friends/decline/{userId}
- DELETE /api/friends/{userId}
- GET /api/friends
- GET /api/friends/status/{userId}

## Stories (Authorized)

Controller: [InteractHub.API/Controllers/StoriesController.cs](../InteractHub.API/Controllers/StoriesController.cs)

- GET /api/stories
- POST /api/stories
- DELETE /api/stories/{id:guid}

## Notifications (Authorized)

Controller: [InteractHub.API/Controllers/NotificationsController.cs](../InteractHub.API/Controllers/NotificationsController.cs)

- GET /api/notifications
- PUT /api/notifications/{id:guid}/read
- PUT /api/notifications/read-all

## Hashtags (Authorized)

Controller: [InteractHub.API/Controllers/HashtagsController.cs](../InteractHub.API/Controllers/HashtagsController.cs)

- GET /api/hashtags/trending

## Uploads (Authorized)

Controller: [InteractHub.API/Controllers/UploadsController.cs](../InteractHub.API/Controllers/UploadsController.cs)

- POST /api/uploads/image

## Admin (Admin Role)

Controller: [InteractHub.API/Controllers/AdminController.cs](../InteractHub.API/Controllers/AdminController.cs)

- GET /api/admin/reports
- PUT /api/admin/reports/{id:guid}/resolve
- DELETE /api/admin/posts/{id:guid}

## Endpoint Count Summary

- Total controllers documented: 9
- Total endpoints documented: 30

For request/response schemas and status codes, open Swagger:
- /swagger
