# InteractHub Deployment Guide (Azure)

## 1) Muc tieu
Tai lieu nay huong dan deploy InteractHub len Azure theo quy trinh chuan de dat D1:
- App live tren Azure URL
- Co CI/CD pipeline YAML
- Azure SQL va Blob duoc cau hinh dung
- Co tai lieu trien khai co bang chung

## 2) Kien truc production
- Backend API: Azure App Service
- Frontend React: Azure Static Web Apps (khuyen nghi)
- Database: Azure SQL Database
- File upload: Azure Blob Storage
- Monitoring: Application Insights

## 3) Tao tai nguyen Azure
Tao theo thu tu:
1. Resource Group
2. SQL Server + SQL Database
3. Storage Account + Blob container uploads
4. App Service Plan + Web App (.NET 8)
5. Application Insights
6. Static Web App cho frontend

## 4) Cau hinh cho API (App Service)
Them cac bien moi truong trong App Service > Settings > Environment variables:
- ConnectionStrings__DefaultConnection
- AzureBlob__ConnectionString
- AzureBlob__ContainerName=uploads
- Jwt__Secret
- Jwt__Issuer
- Jwt__Audience
- ASPNETCORE_ENVIRONMENT=Production
- Cors__AllowedOrigins__0=<frontend-production-url>

Khong commit cac gia tri nay vao git.

## 5) Cau hinh GitHub Secrets
Trong GitHub repository > Settings > Secrets and variables > Actions, tao:
- AZURE_WEBAPP_NAME
- AZURE_WEBAPP_PUBLISH_PROFILE
- AZURE_STATIC_WEB_APPS_API_TOKEN
- VITE_API_BASE_URL

Pipeline da duoc dat tai .github/workflows/azure-deploy.yml

## 6) Chay migration len Azure SQL
Tren may local (hoac pipeline release), dam bao bien moi truong trung voi production roi chay:

```bash
dotnet tool install --global dotnet-ef
dotnet ef database update --project InteractHub.API --startup-project InteractHub.API
```

## 7) Kich hoat pipeline
- Push code vao nhanh main
- Vao tab Actions kiem tra workflow CI-CD Azure Deploy
- Dam bao 3 jobs pass: build-and-test, deploy-api, deploy-frontend

## 8) Smoke test production
1. Truy cap Swagger: https://<api-app-name>.azurewebsites.net/swagger
2. Kiem tra login/register
3. Kiem tra endpoint can Authorize
4. Kiem tra upload anh va file da len Blob
5. Kiem tra frontend goi dung API production

## 9) Bang chung can chup man hinh
- Workflow run thanh cong
- App Service URL dang running
- SQL Database Overview
- Blob container co file that upload
- Swagger production va frontend production

## 10) Tieu chi hoan thanh D1
Danh dau hoan thanh khi du 4 muc:
- App live tren Azure URL
- CI/CD pipeline YAML
- Azure SQL + Blob configured
- Deployment documentation
