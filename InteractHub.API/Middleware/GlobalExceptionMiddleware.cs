using System.Net;
using System.Text.Json;
using InteractHub.API.DTOs.Common;

namespace InteractHub.API.Middleware;

public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;

    public GlobalExceptionMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private static async Task HandleExceptionAsync(HttpContext context, Exception ex)
    {
        var (status, message) = ex switch
        {
            UnauthorizedAccessException => (HttpStatusCode.Unauthorized, ex.Message),
            InvalidOperationException => (HttpStatusCode.BadRequest, ex.Message),
            _ => (HttpStatusCode.InternalServerError, "Đã có lỗi xảy ra trong quá trình xử lý.")
        };

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)status;

        var response = ApiResponse<object>.Fail(message, ex.Message);
        await context.Response.WriteAsync(JsonSerializer.Serialize(response));
    }
}
