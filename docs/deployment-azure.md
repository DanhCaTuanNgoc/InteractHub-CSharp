# InteractHub Deployment Guide (Azure)

## 1) Objective

This document describes the deployment setup for InteractHub on Azure and provides evidence-oriented checkpoints for project submission.

Required outcomes:
- Live application URL
- CI/CD pipeline configuration
- Deployment documentation
- Azure resource list and configuration

## 2) Live Application URL

- Frontend production URL (historical):
	- https://nice-wave-00bd20700.7.azurestaticapps.net/

Status note:
- The domain is currently no longer active because the Azure free trial has ended.
- The deployment was previously successful and verified when the environment was active.

## 3) Production Architecture

- Frontend: Azure Static Web Apps
- Backend API: Azure App Service (.NET 8)
- Database: Azure SQL Database
- File storage: Azure Blob Storage
- Monitoring: Application Insights

## 4) CI/CD Pipeline Configuration

Pipeline file:
- .github/workflows/azure-deploy.yml

Workflow jobs:
- build-and-test
	- Restore and build API + test project
	- Run test project
	- Build frontend with VITE_API_BASE_URL
- deploy-api
	- Publish API
	- Deploy to Azure App Service using publish profile
- deploy-frontend
	- Deploy frontend to Azure Static Web Apps

Pipeline trigger:
- push on branches main/master
- manual trigger via workflow_dispatch

## 5) Azure Resource List

Create resources in this order:
1. Resource Group
2. Azure SQL logical server
3. Azure SQL Database
4. Storage Account
5. Blob Container (uploads)
6. App Service Plan
7. Web App (API)
8. Application Insights
9. Azure Static Web App (Frontend)

## 6) Azure Resource Configuration

### 6.1 API App Service - Environment Variables

Configure in App Service -> Settings -> Environment variables:
- ConnectionStrings__DefaultConnection
- BlobStorage__ConnectionString
- BlobStorage__ContainerName
- BlobStorage__BaseFolder
- Jwt__Secret
- Jwt__Issuer
- Jwt__Audience
- FileStorage__PublicBaseUrl
- FileStorage__RequestPath
- Cors__AllowedOrigins__0
- ASPNETCORE_ENVIRONMENT=Production

Security note:
- Never commit production secrets into source control.

### 6.2 Frontend Static Web App - Build Variables

- VITE_API_BASE_URL=https://<api-app-name>.azurewebsites.net/api

### 6.3 Azure SQL

- Allow App Service outbound access through firewall/network rules.
- Ensure DB connection string in production points to Azure SQL.
- Apply migrations before/after first deploy.

### 6.4 Azure Blob Storage

- Create container for media uploads.
- Ensure API has valid connection string + container name.

## 7) GitHub Secrets Configuration

In GitHub repository -> Settings -> Secrets and variables -> Actions:
- AZURE_WEBAPP_PUBLISH_PROFILE
- AZURE_STATIC_WEB_APPS_API_TOKEN
- VITE_API_BASE_URL

Optional:
- AZURE_WEBAPP_NAME (if needed by custom deployment logic)

## 8) Database Migration for Production

Run migration against production connection settings:

```bash
dotnet tool install --global dotnet-ef
dotnet ef database update --project InteractHub.API --startup-project InteractHub.API
```

## 9) Deployment Validation (Smoke Test)

1. Open frontend production URL.
2. Open API Swagger:
	 - https://<api-app-name>.azurewebsites.net/swagger
3. Validate register/login.
4. Validate authorized endpoints.
5. Validate image upload and blob object creation.
6. Validate realtime notifications flow.

## 10) Submission Evidence Checklist

- Successful GitHub Actions workflow run.
- Live frontend URL was accessible during the active Azure subscription period.
- API Swagger in production is accessible.
- Azure SQL database is provisioned.
- Blob container contains uploaded file objects.
- Deployment variables/secrets are configured.

## 11) Deployment Evidence (Screenshots)

The screenshots below were captured from the successful Azure deployment stage before the free trial expired.

- Azure Static Web App deployment evidence:

	![Azure Static Web App Deployment](../interacthub-client/src/assets/staticweb_azure_screenshot.png)

- Azure App Service (Web App API) deployment evidence:

	![Azure App Service Deployment](../interacthub-client/src/assets/webapp_azure_screenshot.png)

Important note:
- The previous production domain has now stopped due to subscription limits.
- This does not change the fact that deployment was completed and working before expiration.

## 12) Deliverable Mapping

- Live application URL: section 2
- CI/CD pipeline configuration: section 4
- Deployment documentation: this document
- Azure resource list and configuration: sections 5 and 6
