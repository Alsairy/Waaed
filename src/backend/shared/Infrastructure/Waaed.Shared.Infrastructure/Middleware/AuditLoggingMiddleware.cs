using AttendancePlatform.Shared.Domain.Entities;
using AttendancePlatform.Shared.Infrastructure.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.DependencyInjection;
using System.Security.Claims;
using System.Text;
using System.Text.Json;

namespace AttendancePlatform.Shared.Infrastructure.Middleware;

public class AuditLoggingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<AuditLoggingMiddleware> _logger;

    public AuditLoggingMiddleware(RequestDelegate next, ILogger<AuditLoggingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        if (ShouldAuditRequest(context))
        {
            await AuditRequestAsync(context);
        }

        await _next(context);
    }

    private bool ShouldAuditRequest(HttpContext context)
    {
        var path = context.Request.Path.Value?.ToLower();
        
        if (string.IsNullOrEmpty(path))
            return false;

        var auditablePaths = new[]
        {
            "/api/attendance",
            "/api/users",
            "/api/auth",
            "/api/leave",
            "/api/analytics",
            "/api/admin"
        };

        return auditablePaths.Any(auditPath => path.StartsWith(auditPath)) &&
               !path.Contains("/health") &&
               !path.Contains("/metrics");
    }

    private async Task AuditRequestAsync(HttpContext context)
    {
        try
        {
            var request = context.Request;
            var user = context.User;

            var auditEntry = new AuditLogEntry
            {
                Action = $"{request.Method} {request.Path}",
                EntityType = ExtractEntityTypeFromPath(request.Path),
                EntityId = ExtractEntityIdFromPath(request.Path) ?? "N/A",
                UserId = user.FindFirst(ClaimTypes.NameIdentifier)?.Value,
                TenantId = user.FindFirst("tenant_id")?.Value,
                UserName = user.FindFirst(ClaimTypes.Name)?.Value ?? user.FindFirst(ClaimTypes.Email)?.Value,
                IpAddress = GetClientIpAddress(context),
                UserAgent = request.Headers["User-Agent"].FirstOrDefault(),
                Timestamp = DateTime.UtcNow,
                CorrelationId = context.TraceIdentifier,
                SessionId = context.Session?.Id,
                Source = "API",
                Category = "HTTP_REQUEST",
                Severity = "Information"
            };

            if (request.Method == "POST" || request.Method == "PUT" || request.Method == "PATCH")
            {
                auditEntry.NewValues = await ReadRequestBodyAsync(request);
            }

            using var scope = context.RequestServices.CreateScope();
            var auditLogService = scope.ServiceProvider.GetService<IAuditLogService>();
            
            if (auditLogService != null)
            {
                await auditLogService.LogAsync(auditEntry);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to audit request {Method} {Path}", context.Request.Method, context.Request.Path);
        }
    }

    private string ExtractEntityTypeFromPath(PathString path)
    {
        var segments = path.Value?.Split('/', StringSplitOptions.RemoveEmptyEntries);
        if (segments?.Length >= 2)
        {
            return segments[1].ToUpperInvariant();
        }
        return "UNKNOWN";
    }

    private string? ExtractEntityIdFromPath(PathString path)
    {
        var segments = path.Value?.Split('/', StringSplitOptions.RemoveEmptyEntries);
        if (segments?.Length >= 3 && Guid.TryParse(segments[2], out _))
        {
            return segments[2];
        }
        return null;
    }

    private string GetClientIpAddress(HttpContext context)
    {
        var ipAddress = context.Request.Headers["X-Forwarded-For"].FirstOrDefault();
        if (string.IsNullOrEmpty(ipAddress))
        {
            ipAddress = context.Request.Headers["X-Real-IP"].FirstOrDefault();
        }
        if (string.IsNullOrEmpty(ipAddress))
        {
            ipAddress = context.Connection.RemoteIpAddress?.ToString();
        }
        return ipAddress ?? "Unknown";
    }

    private async Task<string?> ReadRequestBodyAsync(HttpRequest request)
    {
        try
        {
            request.EnableBuffering();
            var buffer = new byte[Convert.ToInt32(request.ContentLength ?? 0)];
            await request.Body.ReadAsync(buffer, 0, buffer.Length);
            var bodyAsText = Encoding.UTF8.GetString(buffer);
            request.Body.Position = 0;

            if (bodyAsText.Length > 5000)
            {
                return bodyAsText.Substring(0, 5000) + "... [TRUNCATED]";
            }

            return bodyAsText;
        }
        catch
        {
            return "[UNABLE_TO_READ_BODY]";
        }
    }
}
