using AttendancePlatform.Shared.Domain.Entities;
using AttendancePlatform.Shared.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Text.Json;

namespace AttendancePlatform.Shared.Infrastructure.Services;

public class AuditLogService : IAuditLogService
{
    private readonly AttendancePlatformDbContext _context;
    private readonly ILogger<AuditLogService> _logger;

    public AuditLogService(AttendancePlatformDbContext context, ILogger<AuditLogService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task LogAsync(AuditLogEntry entry)
    {
        try
        {
            _context.AuditLogEntries.Add(entry);
            await _context.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to save audit log entry for action {Action} on {EntityType} {EntityId}", 
                entry.Action, entry.EntityType, entry.EntityId);
        }
    }

    public async Task LogAsync(string action, string entityType, string entityId, object? oldValues = null, object? newValues = null, string? userId = null, string? tenantId = null)
    {
        var entry = new AuditLogEntry
        {
            Action = action,
            EntityType = entityType,
            EntityId = entityId,
            UserId = userId,
            TenantId = tenantId,
            OldValues = oldValues != null ? JsonSerializer.Serialize(oldValues) : null,
            NewValues = newValues != null ? JsonSerializer.Serialize(newValues) : null,
            Timestamp = DateTime.UtcNow,
            CorrelationId = Guid.NewGuid().ToString(),
            Source = "System"
        };

        await LogAsync(entry);
    }

    public async Task<IEnumerable<AuditLogEntry>> GetAuditLogsAsync(string? entityType = null, string? entityId = null, DateTime? fromDate = null, DateTime? toDate = null, int page = 1, int pageSize = 50)
    {
        var query = _context.AuditLogEntries.AsQueryable();

        if (!string.IsNullOrEmpty(entityType))
            query = query.Where(x => x.EntityType == entityType);

        if (!string.IsNullOrEmpty(entityId))
            query = query.Where(x => x.EntityId == entityId);

        if (fromDate.HasValue)
            query = query.Where(x => x.Timestamp >= fromDate.Value);

        if (toDate.HasValue)
            query = query.Where(x => x.Timestamp <= toDate.Value);

        return await query
            .OrderByDescending(x => x.Timestamp)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task<IEnumerable<AuditLogEntry>> GetUserAuditLogsAsync(string userId, DateTime? fromDate = null, DateTime? toDate = null, int page = 1, int pageSize = 50)
    {
        var query = _context.AuditLogEntries.Where(x => x.UserId == userId);

        if (fromDate.HasValue)
            query = query.Where(x => x.Timestamp >= fromDate.Value);

        if (toDate.HasValue)
            query = query.Where(x => x.Timestamp <= toDate.Value);

        return await query
            .OrderByDescending(x => x.Timestamp)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task<IEnumerable<AuditLogEntry>> GetTenantAuditLogsAsync(string tenantId, DateTime? fromDate = null, DateTime? toDate = null, int page = 1, int pageSize = 50)
    {
        var query = _context.AuditLogEntries.Where(x => x.TenantId == tenantId);

        if (fromDate.HasValue)
            query = query.Where(x => x.Timestamp >= fromDate.Value);

        if (toDate.HasValue)
            query = query.Where(x => x.Timestamp <= toDate.Value);

        return await query
            .OrderByDescending(x => x.Timestamp)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task PurgeOldLogsAsync(DateTime cutoffDate)
    {
        try
        {
            var oldLogs = await _context.AuditLogEntries
                .Where(x => x.Timestamp < cutoffDate)
                .ToListAsync();

            if (oldLogs.Any())
            {
                _context.AuditLogEntries.RemoveRange(oldLogs);
                await _context.SaveChangesAsync();
                
                _logger.LogInformation("Purged {Count} audit log entries older than {CutoffDate}", 
                    oldLogs.Count, cutoffDate);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to purge old audit logs");
        }
    }
}
