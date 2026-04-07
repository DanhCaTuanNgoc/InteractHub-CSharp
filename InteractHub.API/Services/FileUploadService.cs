using Azure;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using InteractHub.API.DTOs.Response;
using InteractHub.API.Interfaces;
using Microsoft.AspNetCore.Http;

namespace InteractHub.API.Services;

public class FileUploadService : IFileUploadService
{
    private static readonly HashSet<string> AllowedContentTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "image/jpeg",
        "image/jpg",
        "image/pjpeg",
        "image/png",
        "image/webp",
        "image/gif"
    };

    private static readonly HashSet<string> AllowedExtensions = new(StringComparer.OrdinalIgnoreCase)
    {
        ".jpg",
        ".jpeg",
        ".png",
        ".webp",
        ".gif"
    };

    private const long MaxFileSizeBytes = 5 * 1024 * 1024;

    private readonly BlobContainerClient _containerClient;
    private readonly string _baseFolder;
    private readonly string _publicBaseUrl;
    private readonly string _localRequestPath;
    private readonly string _localRootPath;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly ILogger<FileUploadService> _logger;

    public FileUploadService(
        IConfiguration configuration,
        IWebHostEnvironment environment,
        IHttpContextAccessor httpContextAccessor,
        ILogger<FileUploadService> logger)
    {
        var connectionString = configuration["BlobStorage:ConnectionString"];
        var containerName = configuration["BlobStorage:ContainerName"];
        _baseFolder = configuration["BlobStorage:BaseFolder"] ?? "uploads";
        _publicBaseUrl = (configuration["FileStorage:PublicBaseUrl"] ?? "http://localhost:5191").TrimEnd('/');
        _localRequestPath = NormalizeRequestPath(configuration["FileStorage:RequestPath"] ?? "/uploads");

        var webRoot = environment.WebRootPath;
        if (string.IsNullOrWhiteSpace(webRoot))
        {
            webRoot = Path.Combine(environment.ContentRootPath, "wwwroot");
        }

        _localRootPath = Path.Combine(webRoot, _localRequestPath.Trim('/').Replace('/', Path.DirectorySeparatorChar));
        _httpContextAccessor = httpContextAccessor;
        _logger = logger;

        if (string.IsNullOrWhiteSpace(connectionString))
        {
            throw new InvalidOperationException("Missing BlobStorage:ConnectionString in configuration.");
        }

        if (string.IsNullOrWhiteSpace(containerName))
        {
            throw new InvalidOperationException("Missing BlobStorage:ContainerName in configuration.");
        }

        var blobServiceClient = new BlobServiceClient(connectionString);
        _containerClient = blobServiceClient.GetBlobContainerClient(containerName);
    }

    public async Task<FileUploadResponse> UploadImageAsync(IFormFile file, string userId, CancellationToken cancellationToken = default)
    {
        if (file.Length <= 0)
        {
            throw new InvalidOperationException("File upload is empty.");
        }

        if (file.Length > MaxFileSizeBytes)
        {
            throw new InvalidOperationException("File size exceeds the 5MB limit.");
        }

        var extension = Path.GetExtension(file.FileName);
        var hasAllowedContentType = AllowedContentTypes.Contains(file.ContentType);
        var hasAllowedExtension = !string.IsNullOrWhiteSpace(extension) && AllowedExtensions.Contains(extension);

        if (!hasAllowedContentType && !hasAllowedExtension)
        {
            throw new InvalidOperationException("Unsupported file type. Allowed types: jpeg, png, webp, gif.");
        }

        var safeExtension = string.IsNullOrWhiteSpace(extension) ? ".bin" : extension.ToLowerInvariant();
        var yearMonth = DateTime.UtcNow.ToString("yyyy/MM");
        var blobName = $"{_baseFolder.Trim('/')}/{yearMonth}/{userId}/{Guid.NewGuid():N}{safeExtension}";

        try
        {
            await _containerClient.CreateIfNotExistsAsync(PublicAccessType.None, cancellationToken: cancellationToken);

            var blobClient = _containerClient.GetBlobClient(blobName);

            await using var stream = file.OpenReadStream();
            await blobClient.UploadAsync(
                stream,
                new BlobUploadOptions
                {
                    HttpHeaders = new BlobHttpHeaders
                    {
                        ContentType = file.ContentType
                    }
                },
                cancellationToken);

            return new FileUploadResponse
            {
                FileName = Path.GetFileName(blobName),
                Url = blobClient.Uri.ToString(),
                ContentType = file.ContentType,
                Size = file.Length
            };
        }
        catch (Exception ex) when (IsStorageConnectivityIssue(ex))
        {
            _logger.LogWarning(ex, "Blob upload failed. Falling back to local file storage.");
            return await UploadToLocalAsync(file, userId, safeExtension, cancellationToken);
        }
    }

    private async Task<FileUploadResponse> UploadToLocalAsync(
        IFormFile file,
        string userId,
        string extension,
        CancellationToken cancellationToken)
    {
        var year = DateTime.UtcNow.ToString("yyyy");
        var month = DateTime.UtcNow.ToString("MM");
        var fileName = $"{Guid.NewGuid():N}{extension}";
        var relativeUrl = $"{_localRequestPath}/{year}/{month}/{userId}/{fileName}";

        var destinationDirectory = Path.Combine(_localRootPath, year, month, userId);
        Directory.CreateDirectory(destinationDirectory);

        var destinationPath = Path.Combine(destinationDirectory, fileName);
        await using (var stream = new FileStream(destinationPath, FileMode.Create, FileAccess.Write, FileShare.None))
        {
            await file.CopyToAsync(stream, cancellationToken);
        }

        return new FileUploadResponse
        {
            FileName = fileName,
            Url = BuildAbsoluteUrl(relativeUrl),
            ContentType = file.ContentType,
            Size = file.Length
        };
    }

    private string BuildAbsoluteUrl(string relativeUrl)
    {
        var request = _httpContextAccessor.HttpContext?.Request;
        if (request is not null && request.Host.HasValue)
        {
            return $"{request.Scheme}://{request.Host}{relativeUrl}";
        }

        return $"{_publicBaseUrl}{relativeUrl}";
    }

    private static bool IsStorageConnectivityIssue(Exception exception)
    {
        if (exception is RequestFailedException)
        {
            return true;
        }

        if (exception.InnerException is null)
        {
            return false;
        }

        return IsStorageConnectivityIssue(exception.InnerException);
    }

    private static string NormalizeRequestPath(string path)
    {
        var trimmed = string.IsNullOrWhiteSpace(path) ? "uploads" : path.Trim().Trim('/');
        return $"/{trimmed}";
    }
}
