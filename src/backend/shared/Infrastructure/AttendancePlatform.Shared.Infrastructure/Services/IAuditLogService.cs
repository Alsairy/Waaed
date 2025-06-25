using AttendancePlatform.Shared.Domain.Entities;

namespace AttendancePlatform.Shared.Infrastructure.Services;

public interface IAuditLogService
{
    Task LogAsync(AuditLogEntry entry);
    Task LogAsync(string action, string entityType, string entityId, object? oldValues = null, object? newValues = null, string? userId = null, string? tenantId = null);
    Task<IEnumerable<AuditLogEntry>> GetAuditLogsAsync(string? entityType = null, string? entityId = null, DateTime? fromDate = null, DateTime? toDate = null, int page = 1, int pageSize = 50);
    Task<IEnumerable<AuditLogEntry>> GetUserAuditLogsAsync(string userId, DateTime? fromDate = null, DateTime? toDate = null, int page = 1, int pageSize = 50);
    Task<IEnumerable<AuditLogEntry>> GetTenantAuditLogsAsync(string tenantId, DateTime? fromDate = null, DateTime? toDate = null, int page = 1, int pageSize = 50);
    Task PurgeOldLogsAsync(DateTime cutoffDate);
}
