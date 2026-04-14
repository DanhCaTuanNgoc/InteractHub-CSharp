# InteractHub Setup and Installation Instructions

This document provides a clean setup flow for running InteractHub locally.

## 1. Prerequisites

- .NET SDK 8.0 or newer
- Node.js 20 or newer
- SQL Server or LocalDB
- Git

## 2. Clone Repository

```bash
git clone <your-repository-url>
cd InteractHub
```

## 3. Backend Setup (InteractHub.API)

1. Open [InteractHub.API/appsettings.json](../InteractHub.API/appsettings.json).
2. Update ConnectionStrings.DefaultConnection for your SQL Server.
3. Restore dependencies and run API:

```bash
cd InteractHub.API
dotnet restore
dotnet run
```

Default local endpoints:
- http://localhost:5191
- https://localhost:7298

Swagger:
- http://localhost:5191/swagger
- https://localhost:7298/swagger

## 4. Frontend Setup (interacthub-client)

Open a second terminal:

```bash
cd interacthub-client
npm install
npm run dev
```

Default frontend URL:
- http://localhost:5173

Optional environment file:
- Create [interacthub-client/.env](../interacthub-client/.env)
- Add:

```env
VITE_API_BASE_URL=http://localhost:5191/api
```

## 5. Database Migration and Seed

From project root, run:

```bash
cd InteractHub.API
dotnet ef database update
```

On startup, seed logic creates default roles and demo users if missing.

## 6. Run Tests

```bash
dotnet test InteractHub.Test/InteractHub.Test.csproj -c Release --collect:"XPlat Code Coverage"
```

## 7. Production Build (Optional)

Frontend:

```bash
cd interacthub-client
npm run build
```

Backend publish:

```bash
cd InteractHub.API
dotnet publish -c Release
```

## 8. Quick Troubleshooting

- API fails to start: verify SQL connection string and existing database access.
- Frontend cannot call API: verify CORS and VITE_API_BASE_URL value.
- 401 Unauthorized: ensure JWT token is included in Authorization header.
- Upload errors: verify upload storage settings in API configuration.
