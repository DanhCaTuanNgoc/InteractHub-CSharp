# 🚀 InteractHub — Social Media Web Application

> **Full-Stack Assignment | ASP.NET Core 8 + React 18 + Azure**  
> Tổng điểm: **10 điểm** | Deadline: *(xem đề cương môn học)*

---

## 📋 Mục lục

1. [Tổng quan kiến trúc](#1-tổng-quan-kiến-trúc)
2. [Tech Stack](#2-tech-stack)
3. [Phân tích điểm số](#3-phân-tích-điểm-số)
4. [Roadmap & Phases](#4-roadmap--phases)
5. [Cấu trúc thư mục](#5-cấu-trúc-thư-mục)
6. [Chi tiết từng Phase](#6-chi-tiết-từng-phase)
7. [Database Schema](#7-database-schema)
8. [API Endpoints](#8-api-endpoints)
9. [Checklist hoàn thành](#9-checklist-hoàn-thành)

---

## 1. Tổng quan kiến trúc

```
┌──────────────────────────────────────────────────────────┐
│                    AZURE CLOUD                            │
│  ┌────────────────┐     ┌──────────────────────────────┐ │
│  │  Azure Static  │     │     Azure App Service        │ │
│  │  Web Apps /    │────▶│   ASP.NET Core 8 Web API     │ │
│  │  React SPA     │     │   (REST + SignalR)            │ │
│  └────────────────┘     └──────────┬───────────────────┘ │
│                                    │                      │
│                         ┌──────────▼──────────┐          │
│                         │  Azure SQL Database  │          │
│                         └─────────────────────┘          │
│                                    │                      │
│                         ┌──────────▼──────────┐          │
│                         │  Azure Blob Storage  │          │
│                         │  (Images/Files)      │          │
│                         └─────────────────────┘          │
└──────────────────────────────────────────────────────────┘
        ▲
        │ CI/CD (GitHub Actions / Azure DevOps)
        │
   Git Push → Build → Test → Deploy
```

---

## 2. Tech Stack

| Layer | Công nghệ | Version |
|-------|-----------|---------|
| **Frontend** | React + TypeScript | 18+ / Strict Mode |
| **Styling** | Tailwind CSS | Latest |
| **State** | React Context API / Redux Toolkit | — |
| **Forms** | React Hook Form | — |
| **HTTP** | Axios | — |
| **Routing** | React Router | v6+ |
| **Build** | Vite | — |
| **Backend** | ASP.NET Core Web API | 8.0+ |
| **ORM** | Entity Framework Core | 8.0+ |
| **Database** | SQL Server / Azure SQL | — |
| **Auth** | JWT + ASP.NET Core Identity | — |
| **Real-time** | SignalR | — |
| **Docs** | Swagger / OpenAPI | — |
| **Cloud** | Microsoft Azure | App Service + SQL + Blob |
| **CI/CD** | GitHub Actions / Azure DevOps | — |
| **Testing** | xUnit / NUnit + Moq | — |

---

## 3. Phân tích điểm số

```
10 điểm tổng
├── F1 — React Component Architecture & Responsive Design     1đ
├── F2 — State Management & API Integration                   1đ
├── F3 — React Forms & Validation                             1đ
├── F4 — Routing, Protected Routes & Dynamic Features         1đ
├── B1 — Database Design & Entity Framework                   1đ
├── B2 — RESTful API Controllers & DTOs                       1đ
├── B3 — JWT Authentication & Authorization                   1đ
├── B4 — Business Logic & Services Layer                      1đ
├── T1 — Unit Testing                                         1đ
└── D1 — Azure Deployment & CI/CD Pipeline                    1đ
```

---

## 4. Roadmap & Phases

```
Phase 0     Phase 1        Phase 2        Phase 3       Phase 4
Setup    →  Backend Core → Frontend    → Testing    → Deployment
(1-2 ngày)  (5-7 ngày)    (5-7 ngày)   (2-3 ngày)   (2-3 ngày)
```

| Phase | Tên | Yêu cầu liên quan | Ước tính |
|-------|-----|-------------------|----------|
| **0** | Setup & Scaffolding | — | 1–2 ngày |
| **1** | Backend Core (DB + API + Auth + Services) | B1, B2, B3, B4 | 5–7 ngày |
| **2** | Frontend (Components + State + Forms + Routing) | F1, F2, F3, F4 | 5–7 ngày |
| **3** | Testing | T1 | 2–3 ngày |
| **4** | Deployment & CI/CD | D1 | 2–3 ngày |

> ⚠️ **Lưu ý quan trọng:** Backend phải làm trước Frontend vì Frontend gọi API từ Backend.

---

## 5. Cấu trúc thư mục

```
InteractHub/
│
├── 📁 InteractHub.API/                  ← ASP.NET Core Web API
│   ├── Controllers/
│   │   ├── AuthController.cs
│   │   ├── PostsController.cs
│   │   ├── UsersController.cs
│   │   ├── FriendsController.cs
│   │   ├── StoriesController.cs
│   │   └── NotificationsController.cs
│   ├── Data/
│   │   ├── AppDbContext.cs
│   │   └── Migrations/
│   ├── DTOs/
│   │   ├── Request/
│   │   └── Response/
│   ├── Entities/
│   │   ├── User.cs
│   │   ├── Post.cs
│   │   ├── Comment.cs
│   │   ├── Like.cs
│   │   ├── Friendship.cs
│   │   ├── Story.cs
│   │   ├── Notification.cs
│   │   ├── Hashtag.cs
│   │   └── PostReport.cs
│   ├── Interfaces/
│   ├── Services/
│   │   ├── AuthService.cs
│   │   ├── PostsService.cs
│   │   ├── FriendsService.cs
│   │   ├── NotificationService.cs
│   │   ├── StoriesService.cs
│   │   └── FileUploadService.cs
│   ├── Hubs/
│   │   └── NotificationHub.cs           ← SignalR
│   ├── Helpers/
│   └── Program.cs
│
├── 📁 InteractHub.Tests/                ← xUnit Test Project
│   ├── Services/
│   │   ├── AuthServiceTests.cs
│   │   ├── PostsServiceTests.cs
│   │   └── FriendsServiceTests.cs
│   └── Helpers/
│
├── 📁 interacthub-client/               ← React + TypeScript
│   ├── src/
│   │   ├── components/                  ← ≥15 reusable components
│   │   │   ├── common/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── TextInput.tsx
│   │   │   │   ├── FileInput.tsx
│   │   │   │   ├── Avatar.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   ├── LoadingSkeleton.tsx
│   │   │   │   └── Pagination.tsx
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.tsx
│   │   │   │   └── Sidebar.tsx
│   │   │   ├── posts/
│   │   │   │   ├── PostCard.tsx
│   │   │   │   ├── PostForm.tsx
│   │   │   │   └── CommentSection.tsx
│   │   │   ├── auth/
│   │   │   │   └── ProtectedRoute.tsx
│   │   │   └── notifications/
│   │   │       └── NotificationBell.tsx
│   │   ├── pages/
│   │   │   ├── HomePage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── ProfilePage.tsx
│   │   │   └── StoriesPage.tsx
│   │   ├── context/                     ← hoặc redux/
│   │   │   └── AuthContext.tsx
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── usePosts.ts
│   │   │   └── useDebounce.ts
│   │   ├── services/
│   │   │   ├── api.ts                   ← Axios instance
│   │   │   ├── authService.ts
│   │   │   └── postService.ts
│   │   ├── types/
│   │   │   └── index.ts                 ← TypeScript interfaces
│   │   ├── router/
│   │   │   └── AppRouter.tsx
│   │   └── App.tsx
│   └── package.json
│
├── 📁 .github/workflows/
│   └── azure-deploy.yml                 ← CI/CD pipeline
│
└── README.md
```

---

## 6. Chi tiết từng Phase

---

### ⚙️ Phase 0 — Setup & Scaffolding *(1–2 ngày)*

**Mục tiêu:** Cài đặt môi trường, tạo solution, init project

#### Bước thực hiện:

```bash
# 1. Tạo solution
dotnet new sln -n InteractHub

# 2. Tạo Web API project
dotnet new webapi -n InteractHub.API --framework net8.0
dotnet sln add InteractHub.API

# 3. Tạo Test project
dotnet new xunit -n InteractHub.Tests
dotnet sln add InteractHub.Tests

# 4. Cài packages cho API
cd InteractHub.API
dotnet add package Microsoft.EntityFrameworkCore.SqlServer
dotnet add package Microsoft.EntityFrameworkCore.Tools
dotnet add package Microsoft.AspNetCore.Identity.EntityFrameworkCore
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer
dotnet add package Swashbuckle.AspNetCore
dotnet add package Azure.Storage.Blobs
dotnet add package Microsoft.AspNetCore.SignalR

# 5. Tạo React app
npm create vite@latest interacthub-client -- --template react-ts
cd interacthub-client
npm install axios react-router-dom react-hook-form @microsoft/signalr
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

---

### 🗄️ Phase 1 — Backend Core *(5–7 ngày)*

> Covers: **B1, B2, B3, B4**

#### B1 — Database Design & Entity Framework *(1.5 ngày)*

**Các entity cần tạo (≥ 8):**

| Entity | Quan hệ chính |
|--------|--------------|
| `User` (extends IdentityUser) | 1-N với Post, Comment, Like |
| `Post` | N-1 User; 1-N Comment, Like; N-N Hashtag | (Có thêm Self-reference cho Share (OriginalPostId))
| `Comment` | N-1 Post, User |
| `Like` | N-1 Post/Comment, User |
| `Friendship` | N-N User (self-referencing) |
| `Story` | N-1 User |
| `Notification` | N-1 User (sender + receiver) |
| `Hashtag` | N-N Post |
| `PostReport` | N-1 Post, User |

**Checklist B1:**
- [x] Tạo tất cả entity class với Data Annotations
- [x] Cấu hình `AppDbContext` kế thừa `IdentityDbContext<User>`
- [x] Cấu hình Fluent API cho quan hệ phức tạp
- [x] Tạo ít nhất **3 migration files** (`InitialCreate`, `SeedRoles`, `AddIndexes`)
- [x] Seed data: Admin user, roles (User/Admin), sample posts
- [ ] Vẽ database diagram (dùng dbdiagram.io hoặc SSMS)
- [ ] Dọn/ghép 2 migration rỗng (`SeedRoles`, `AddIndexes`) để lịch sử migration rõ ràng hơn

#### B3 — JWT Authentication & Authorization *(1.5 ngày)*

> Làm B3 **trước B2** để có auth flow cho các endpoint.

**Checklist B3:**
- [x] `AuthController` với `POST /api/auth/register` và `POST /api/auth/login`
- [x] JWT service tạo token (secret, issuer, audience, expiry trong `appsettings.json`)
- [x] `User` entity thêm fields: `FullName`, `AvatarUrl`, `Bio`, `CreatedAt`
- [x] Seed roles: `User`, `Admin`
- [x] `[Authorize]` attribute trên các protected endpoints
- [x] Login response trả về: `{ token, expiresIn, user: {...} }`
- [x] Role-based authorization với [Authorize(Roles = "Admin")]

#### B2 — RESTful API Controllers & DTOs *(2 ngày)*

**8 Controllers cần tạo (≥ 20 endpoints):**

| Controller | Endpoints tiêu biểu |
|------------|---------------------|
| `AuthController` | Register, Login |
| `PostsController` | CRUD posts, Like, Comment, Share |
| `UsersController` | Get profile, Update profile, Search users |
| `FriendsController` | Send/Accept/Decline/Remove friend request |
| `StoriesController` | Create, Get, Delete story |
| `NotificationsController` | Get all, Mark as read |
| `HashtagsController` | Get trending hashtags |
| `AdminController` | Manage reports, moderation |

**Checklist B2:**
- [x] Tất cả controller dùng `[ApiController]` và `[Route("api/[controller]")]`
- [x] Tạo Request DTOs và Response DTOs riêng biệt
- [x] HTTP status codes chuẩn: `200`, `201`, `400`, `401`, `404`, `500`
- [x] Response format thống nhất: `{ success, data, message, errors }`
- [x] CORS config trong `Program.cs` cho phép React origin
- [x] Swagger UI hoạt động tại `/swagger`
- [x] Global Exception Middleware (handle 400, 401, 500)
- [x] Model validation với Data Annotations (Required, Email, StringLength)
- [x] Validate DTO trước khi xử lý

#### B4 — Business Logic & Services Layer *(1.5 ngày)*

**6 Service classes cần tạo:**

| Service | Trách nhiệm |
|---------|-------------|
| `AuthService` | Register, Login, Token generation |
| `PostsService` | CRUD, Like, Comment logic |
| `FriendsService` | Friend request workflow |
| `NotificationsService` | Tạo và gửi notification |
| `FileUploadService` | Upload ảnh lên Azure Blob Storage |
| `HashtagService` | Xử lý hashtag & trending |

**Checklist B4:**
- [x] Interface cho mỗi service (`IAuthService`, v.v.)
- [x] Đăng ký DI trong `Program.cs`
- [x] Repository pattern cho data access (BẮT BUỘC theo đề bài)
- [x] Business rules: không thể like bài của chính mình, không duplicate friend request, v.v.

---

### 🎨 Phase 2 — Frontend *(5–7 ngày)*

> Covers: **F1, F2, F3, F4**

**Trạng thái:** 🟢 Đang triển khai tốt (cập nhật thực tế 02/04/2026)

**Phase 2 Kickoff (Sprint 1):**
- [x] Dựng kiến trúc thư mục frontend theo modules (`components`, `pages`, `services`, `router`, `hooks`, `types`)
- [x] Thiết lập routing khung: `/`, `/login`, `/register`, `/profile/:id`, `/stories`
- [x] Tạo nền tảng auth state (`AuthContext`) + lưu/khôi phục token
- [x] Tạo Axios base client + interceptor JWT + xử lý lỗi 401 chung
- [x] Tạo UI shell responsive: `Navbar`, layout feed 2 cột, mobile menu

#### F1 — React Components & Responsive Design *(1.5 ngày)*

**Checklist F1:**
- [x] ≥ 15 React components với TypeScript interfaces đầy đủ
- [x] Tailwind CSS responsive (mobile-first: `sm:`, `md:`, `lg:`)
- [x] Responsive Navbar (hamburger menu trên mobile)
- [x] Custom hooks: `useAuth`, `usePosts`, `useDebounce`, `useLocalStorage`
- [x] Viết component hierarchy documentation (dạng tree)
- [ ] Chụp screenshot trên 3 kích thước: mobile / tablet / desktop (Tự chụp thủ công)

#### F2 — State Management & API Integration *(1.5 ngày)*

**Checklist F2:**
- [x] `AuthContext` (hoặc Redux slice) lưu: `user`, `token`, `isAuthenticated`
- [x] Axios instance với `baseURL` và interceptor tự gắn `Authorization: Bearer <token>`
- [x] Token lưu trong `localStorage`, tự load khi khởi động app
- [x] API service files riêng: `authService.ts`, `postService.ts`, v.v.
- [x] TypeScript interfaces cho tất cả API response
- [x] Loading states và error handling ở mỗi component

#### F3 — Forms & Validation *(1.5 ngày)*

**Checklist F3:**
- [x] **Register form:** username, email, password, confirm password
- [x] **Login form:** email, password, error message rõ ràng
- [x] **Post creation form:** text content + image upload với preview
- [x] **Profile update form:** fullName, bio, avatar
- [x] React Hook Form cho tất cả forms
- [x] Password strength indicator (Weak / Medium / Strong)
- [x] Reusable `<TextInput />`, `<FileInput />` với TypeScript props
- [x] Loading spinner khi đang submit

#### F4 — Routing, Protected Routes & Dynamic Features *(2 ngày)*

**Checklist F4:**
- [x] React Router v6 với nested routes
- [x] `<ProtectedRoute>` component — redirect về `/login` nếu chưa auth
- [x] Search với `useDebounce` (debounce 300ms trước khi gọi API)
- [x] Infinite scroll **hoặc** pagination cho feed
- [x] `React.lazy()` + `<Suspense>` cho route-level code splitting
- [x] Loading skeletons cho PostCard, UserCard
- [x] SignalR client kết nối để nhận notification real-time

---

### 🧪 Phase 3 — Testing *(2–3 ngày)*

> Covers: **T1** — Cần ít nhất **15 unit test methods**

**Checklist T1:**
- [x] Test project dùng xUnit + Moq
- [x] Tests cho **AuthService**: register thành công, email trùng, sai password
- [x] Tests cho **PostsService**: tạo post, xóa post của người khác (lỗi), like/unlike
- [x] Tests cho **FriendsService**: gửi request, chấp nhận, từ chối, request trùng
- [x] Mock `AppDbContext` bằng In-Memory Database
- [x] Test cả positive cases và negative/edge cases
- [x] Chạy `dotnet test --collect:"XPlat Code Coverage"` → xuất coverage report
- [x] Coverage ≥ 60% cho service layer (**71.77%** cho AuthService + PostsService + FriendsService)

```bash
# Chạy test và xem coverage
dotnet test --collect:"XPlat Code Coverage"
reportgenerator -reports:"**/coverage.cobertura.xml" -targetdir:"coveragereport" -reporttypes:Html
```

---


### ☁️ Phase 4 — Azure Deployment & CI/CD *(2–3 ngày)*

> Covers: **D1**

Mục tiêu phase này là đi từ local sang production theo thứ tự: **hạ tầng Azure → cấu hình secrets → CI/CD → xác nhận URL live → hoàn thiện tài liệu**.

#### 4.1 Chuẩn bị trước khi deploy

- [ ] Đảm bảo branch `main` build pass local: `dotnet test` và `npm run build`
- [ ] Có Azure subscription đang hoạt động
- [ ] Có quyền tạo Resource Group, App Service, SQL, Storage
- [ ] Đã tạo sẵn GitHub repository cho project

#### 4.2 Tạo Azure resources (Portal)

Tạo theo đúng thứ tự dưới đây để đỡ phải quay lại sửa cấu hình:

1. Tạo **Resource Group** (ví dụ: `rg-interacthub-prod`)
2. Tạo **Azure SQL Server + Azure SQL Database**
3. Tạo **Storage Account + Blob Container** (ví dụ container: `uploads`)
4. Tạo **App Service Plan + Web App** cho API (.NET 8)
5. Bật **Application Insights** cho Web App
6. (Khuyến nghị) Tạo **Static Web App** cho React frontend

#### 4.3 Cấu hình App Service (không hard-code secrets)

Vào App Service → **Settings → Environment variables**, thêm:

- `ConnectionStrings__DefaultConnection` = Azure SQL connection string
- `AzureBlob__ConnectionString` = storage connection string
- `AzureBlob__ContainerName` = uploads
- `Jwt__Secret`, `Jwt__Issuer`, `Jwt__Audience`
- `ASPNETCORE_ENVIRONMENT` = Production
- `Cors__AllowedOrigins__0` = URL frontend production

> Lưu ý: Tên key dùng dạng `__` để map đúng vào cấu hình .NET.

#### 4.4 Cấu hình GitHub Secrets cho CI/CD

Trong GitHub repo → **Settings → Secrets and variables → Actions**, thêm các secrets:

- `AZURE_WEBAPP_NAME`
- `AZURE_WEBAPP_PUBLISH_PROFILE`
- `AZURE_STATIC_WEB_APPS_API_TOKEN` *(nếu deploy frontend lên Static Web Apps)*
- `VITE_API_BASE_URL` *(URL API production, ví dụ `https://your-api.azurewebsites.net/api`)*

#### 4.5 CI/CD pipeline YAML

- Workflow chính đặt tại: `.github/workflows/azure-deploy.yml`
- Luồng chạy: **build + test** → **deploy API** → **deploy frontend**
- Trigger: push vào nhánh `main`

Nếu chưa có file pipeline, tạo theo mẫu trong repo ở `.github/workflows/azure-deploy.yml`.

#### 4.6 Deploy database migration lên Azure SQL

Chạy migration vào production DB trước khi smoke test:

```bash
dotnet tool install --global dotnet-ef
dotnet ef database update --project InteractHub.API --startup-project InteractHub.API
```

> Lệnh này phải chạy với connection string production (qua environment/app settings).

#### 4.7 Smoke test sau deploy

1. Mở Swagger: `https://<api-app-name>.azurewebsites.net/swagger`
2. Test `POST /api/auth/register`, `POST /api/auth/login`
3. Test endpoint có `[Authorize]`
4. Upload ảnh thử để xác nhận Blob hoạt động
5. Mở frontend URL và kiểm tra luồng login → feed

#### 4.8 Checklist D1 (nộp bài)

- [ ] App live trên Azure URL
- [ ] CI/CD pipeline YAML
- [ ] Azure SQL + Blob configured
- [ ] Deployment documentation

#### 4.9 Bằng chứng nên chụp màn hình khi nộp

- [ ] GitHub Actions run xanh (build, test, deploy)
- [ ] App Service Overview (URL + trạng thái Running)
- [ ] SQL Database Overview
- [ ] Storage container có file upload thực tế
- [ ] Swagger production và giao diện frontend production

---

## 7. Database Schema

```
┌──────────────┐     ┌──────────────┐                             ┌──────────────┐
│   AspNetUsers│     │    Post      │                             │   Comment    │
│ (User)       │─1──N│              │─1──────────────────────────N│              │
│ Id           │     │ Id           │                             │ Id           │
│ FullName     │     │ Content      │                             │ Content      │
│ AvatarUrl    │     │ ImageUrl     │                             │ CreatedAt    │
│ Bio          │     │ CreatedAt    |                             |              |
|              |     |OriginalPostId (FK - self reference)│       │ UserId (FK)  │
│ CreatedAt    │     │ UserId (FK)  │                             │ PostId (FK)  │
└──────────────┘     └──────┬───────┘                             └──────────────┘
       │                    │
       │             ┌──────▼───────┐     ┌──────────────┐
       │             │     Like     │     │   Hashtag    │
       │             │ Id           │     │ Id           │
       │             │ UserId (FK)  │     │ Name         │
       │             │ PostId (FK)  │     └──────┬───────┘
       │             └──────────────┘            │ N-N via PostHashtag
       │
       │  ┌──────────────┐     ┌──────────────┐
       ├──│  Friendship  │     │    Story     │
       │  │ Id           │     │ Id           │
       │  │ SenderId(FK) │     │ MediaUrl     │
       │  │ ReceiverId(FK)│     │ ExpiresAt   │
       │  │ Status       │     │ UserId (FK)  │
       │  └──────────────┘     └──────────────┘
       │
       │  ┌──────────────┐     ┌──────────────┐
       ├──│ Notification │     │  PostReport  │
          │ Id           │     │ Id           │
          │ Type         │     │ Reason       │
          │ Content      │     │ PostId (FK)  |
          │ IsRead       │     │ UserId (FK)  │
          │ UserId (FK)  │     └──────────────┘
          └──────────────┘
```

---

## 8. API Endpoints

### Auth
| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| POST | `/api/auth/register` | ❌ | Đăng ký tài khoản |
| POST | `/api/auth/login` | ❌ | Đăng nhập, trả JWT |

### Posts
| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| GET | `/api/posts` | ✅ | Lấy feed bài viết |
| POST | `/api/posts` | ✅ | Tạo bài viết mới |
| GET | `/api/posts/{id}` | ✅ | Chi tiết bài viết |
| PUT | `/api/posts/{id}` | ✅ | Sửa bài viết |
| DELETE | `/api/posts/{id}` | ✅ | Xóa bài viết |
| POST | `/api/posts/{id}/like` | ✅ | Like / Unlike |
| POST | `/api/posts/{id}/comments` | ✅ | Thêm comment |
| POST | `/api/posts/{id}/share` | ✅ | Share bài viết |

### Users
| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| GET | `/api/users/{id}` | ✅ | Xem profile |
| PUT | `/api/users/{id}` | ✅ | Cập nhật profile |
| GET | `/api/users/search?q=` | ✅ | Tìm kiếm user |

### Friends
| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| POST | `/api/friends/request/{userId}` | ✅ | Gửi lời mời |
| PUT | `/api/friends/accept/{userId}` | ✅ | Chấp nhận |
| PUT | `/api/friends/decline/{userId}` | ✅ | Từ chối |
| DELETE | `/api/friends/{userId}` | ✅ | Hủy kết bạn |
| GET | `/api/friends` | ✅ | Danh sách bạn bè |

### Stories
| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| GET | `/api/stories` | ✅ | Stories của bạn bè |
| POST | `/api/stories` | ✅ | Đăng story |
| DELETE | `/api/stories/{id}` | ✅ | Xóa story |

### Notifications
| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| GET | `/api/notifications` | ✅ | Tất cả notifications |
| PUT | `/api/notifications/{id}/read` | ✅ | Đánh dấu đã đọc |
| PUT | `/api/notifications/read-all` | ✅ | Đánh dấu tất cả |

### Hashtags
| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| GET | `/api/hashtags/trending` | ✅ | Lấy hashtag trending |

### Admin (Moderation)
| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| GET | `/api/admin/reports` | ✅ (Admin) | Danh sách report |
| PUT | `/api/admin/reports/{id}/resolve` | ✅ (Admin) | Xử lý report |
| DELETE | `/api/admin/posts/{id}` | ✅ (Admin) | Xóa bài vi phạm |

---

## 9. Checklist hoàn thành

### Phase 0 — Setup
- [x] Solution và projects tạo xong
- [ ] Tất cả NuGet packages đã cài
- [ ] React app với Tailwind chạy được
- [x] Git repository khởi tạo, `.gitignore` đúng

### B1 — Database (1đ)
- [x] ≥ 9 entity classes
- [x] DbContext cấu hình đúng
- [x] ≥ 3 migration files
- [x] Seed data hoạt động
- [ ] Database diagram
- [ ] Dọn/ghép migration rỗng (`SeedRoles`, `AddIndexes`)

### B2 — API Controllers (1đ)
- [x] ≥ 7 controllers
- [x] ≥ 20 endpoints
- [x] DTOs cho request & response
- [x] CORS config
- [x] Swagger hoạt động

### B3 — JWT Auth (1đ)
- [x] Register & Login endpoints
- [x] JWT token generation
- [x] Protected endpoints với `[Authorize]`
- [x] Role-based authorization (User/Admin) + Admin-only endpoints

### B4 — Services (1đ)
- [x] ≥ 6 service classes (Auth, Posts, Friends, Notifications, FileUpload, Hashtag)
- [x] Repository pattern implemented
- [x] DI đăng ký đúng
- [x] FileUploadService cho Azure Blob

### F1 — Components (1đ)
- [x] ≥ 15 components TypeScript
- [x] Tailwind responsive
- [x] Custom hooks
- [x] Component hierarchy doc

### F2 — State & API (1đ)
- [x] AuthContext / Redux store
- [x] Axios với interceptor
- [x] TypeScript interfaces cho API

### F3 — Forms (1đ)
- [x] React Hook Form cho tất cả forms
- [x] Validation đầy đủ
- [x] Image upload + preview

### F4 — Routing (1đ)
- [x] Protected routes
- [x] Search với debounce
- [x] Lazy loading
- [x] SignalR client

### T1 — Tests (1đ)
- [x] ≥ 15 test methods (hiện có 19)
- [x] 3 service classes được test (Auth, Posts, Friends)
- [x] Coverage ≥ 60% cho service layer
- [x] Cả positive và negative cases

### D1 — Deployment (1đ)
- [ ] App live trên Azure URL
- [x] CI/CD pipeline YAML (`.github/workflows/azure-deploy.yml`)
- [ ] Azure SQL + Blob configured
- [x] Deployment documentation (`docs/deployment-azure.md`)

---

## ⚡ Tips để đạt điểm cao

1. **Không commit secrets** — dùng `dotnet user-secrets` cho dev, Azure App Config cho prod
2. **Response format nhất quán** — tạo `ApiResponse<T>` wrapper dùng cho tất cả endpoints
3. **Error handling tập trung** — dùng `middleware` hoặc `exception filter` thay vì try-catch khắp nơi
4. **Swagger XML comments** — thêm `///` comments cho controllers để Swagger doc đẹp hơn
5. **TypeScript strict mode** — không dùng `any`, luôn type đầy đủ
6. **Git commits rõ ràng** — commit theo từng feature, CI/CD pipeline sẽ có lịch sử đẹp
7. **Áp dụng Repository Pattern + Service Layer** - để tách biệt data access và business logic (theo yêu cầu đề)
---

*README này được tạo dựa trên phân tích đề bài InteractHub Full-Stack Assignment.*
