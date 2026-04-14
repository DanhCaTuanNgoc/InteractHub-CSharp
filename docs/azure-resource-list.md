# InteractHub Azure Resource List and Configuration

This document provides a concise Azure resource inventory and required configuration values for deployment submission.

## 1. Azure Resource List (Actual Provisioned Resources)

Based on the Azure Portal resource list you shared.
Subscription entries are intentionally excluded.

1. Resource Group: InteractHub
2. Azure SQL Server: interacthub-sv
3. Azure SQL Database: free-sql-db-9142269
4. Storage Account: interacthubstorage
5. App Service Plan: ASP-InteractHub-9ab5
6. App Service (API): InteracthubSocial
7. Static Web App (Frontend): interacthub-client
8. Application Insights: InteracthubSocial
9. Log Analytics Workspace: DefaultWorkspace-e6483367-c937-472e-8408-...

Note:
- The screenshot also contains "Azure subscription 1" (type: Subscription).
- This item is not included in the project deliverable resource list per your request.

## 2. Resource Configuration Summary

## 2.1 API App Service (Environment Variables)

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

## 2.2 Frontend Static Web App

Build variable:

- VITE_API_BASE_URL=https://<api-app-name>.azurewebsites.net/api

## 2.3 Azure SQL

- Allow API App Service outbound IPs/firewall access.
- Ensure production connection string points to Azure SQL.
- Apply EF migrations during deployment.

## 2.4 Azure Blob Storage

- Create a container for media uploads.
- Validate connection string and container name in API settings.

## 3. CI/CD Secrets (GitHub Actions)

Set repository secrets:

- AZURE_WEBAPP_PUBLISH_PROFILE
- AZURE_STATIC_WEB_APPS_API_TOKEN
- VITE_API_BASE_URL

Optional:

- AZURE_WEBAPP_NAME

## 4. Related Files

- CI/CD pipeline: [.github/workflows/azure-deploy.yml](../.github/workflows/azure-deploy.yml)
- Deployment guide: [deployment/deployment-azure.md](deployment/deployment-azure.md)
