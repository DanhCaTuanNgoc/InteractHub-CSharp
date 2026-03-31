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
        "image/png",
        "image/webp",
        "image/gif"
    };

    private const long MaxFileSizeBytes = 5 * 1024 * 1024;

    private readonly BlobContainerClient _containerClient;
    private readonly string _baseFolder;

    public FileUploadService(IConfiguration configuration)
    {
        var connectionString = configuration["BlobStorage:ConnectionString"];
        var containerName = configuration["BlobStorage:ContainerName"];
        _baseFolder = configuration["BlobStorage:BaseFolder"] ?? "uploads";

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

        if (!AllowedContentTypes.Contains(file.ContentType))
        {
            throw new InvalidOperationException("Unsupported file type. Allowed types: jpeg, png, webp, gif.");
        }

        await _containerClient.CreateIfNotExistsAsync(PublicAccessType.None, cancellationToken: cancellationToken);

        var extension = Path.GetExtension(file.FileName);
        var safeExtension = string.IsNullOrWhiteSpace(extension) ? ".bin" : extension.ToLowerInvariant();
        var blobName = $"{_baseFolder.Trim('/')}/{DateTime.UtcNow:yyyy/MM}/{userId}/{Guid.NewGuid():N}{safeExtension}";

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
}
