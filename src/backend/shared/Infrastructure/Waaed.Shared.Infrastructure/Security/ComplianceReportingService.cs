using AttendancePlatform.Shared.Domain.Entities;
using AttendancePlatform.Shared.Infrastructure.Data;
using AttendancePlatform.Shared.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Text.Json;

namespace AttendancePlatform.Shared.Infrastructure.Security;

public interface IComplianceReportingService
{
    Task<ComplianceReport> GenerateDataPrivacyReportAsync(string tenantId, DateTime fromDate, DateTime toDate);
    Task<ComplianceReport> GenerateLaborLawComplianceReportAsync(string tenantId, DateTime fromDate, DateTime toDate);
    Task<ComplianceReport> GenerateSecurityAuditReportAsync(string tenantId, DateTime fromDate, DateTime toDate);
    Task<IEnumerable<ComplianceViolation>> DetectComplianceViolationsAsync(string tenantId);
    Task LogComplianceEventAsync(ComplianceEvent complianceEvent);
}

public class ComplianceReportingService : IComplianceReportingService
{
    private readonly AttendancePlatformDbContext _context;
    private readonly IAuditLogService _auditLogService;
    private readonly ILogger<ComplianceReportingService> _logger;

    public ComplianceReportingService(
        AttendancePlatformDbContext context,
        IAuditLogService auditLogService,
        ILogger<ComplianceReportingService> logger)
    {
        _context = context;
        _auditLogService = auditLogService;
        _logger = logger;
    }

    public async Task<ComplianceReport> GenerateDataPrivacyReportAsync(string tenantId, DateTime fromDate, DateTime toDate)
    {
        var auditLogs = await _auditLogService.GetTenantAuditLogsAsync(tenantId, fromDate, toDate, 1, 10000);
        
        var dataAccessEvents = auditLogs.Where(log => 
            log.EntityType == "USER" || 
            log.EntityType == "BIOMETRIC" || 
            log.EntityType == "ATTENDANCE").ToList();

        var report = new ComplianceReport
        {
            Id = Guid.NewGuid().ToString(),
            TenantId = tenantId,
            ReportType = "DATA_PRIVACY",
            GeneratedAt = DateTime.UtcNow,
            FromDate = fromDate,
            ToDate = toDate,
            Summary = new Dictionary<string, object>
            {
                ["TotalDataAccessEvents"] = dataAccessEvents.Count,
                ["UniqueUsersAccessed"] = dataAccessEvents.Select(e => e.UserId).Distinct().Count(),
                ["BiometricDataAccess"] = dataAccessEvents.Count(e => e.EntityType == "BIOMETRIC"),
                ["PersonalDataModifications"] = dataAccessEvents.Count(e => e.Action.Contains("PUT") || e.Action.Contains("POST")),
                ["DataDeletions"] = dataAccessEvents.Count(e => e.Action.Contains("DELETE"))
            },
            Details = JsonSerializer.Serialize(dataAccessEvents.Take(100))
        };

        await SaveComplianceReportAsync(report);
        return report;
    }

    public async Task<ComplianceReport> GenerateLaborLawComplianceReportAsync(string tenantId, DateTime fromDate, DateTime toDate)
    {
        var attendanceRecords = await _context.AttendanceRecords
            .Where(r => r.TenantId.ToString() == tenantId && r.Timestamp >= fromDate && r.Timestamp <= toDate)
            .ToListAsync();

        var overtimeViolations = new List<object>();
        var breakViolations = new List<object>();
        var maxHoursViolations = new List<object>();

        var userWorkHours = attendanceRecords
            .GroupBy(r => r.UserId)
            .Select(g => new
            {
                UserId = g.Key,
                TotalHours = CalculateWorkingHours(g.ToList()),
                DaysWorked = g.Select(r => r.Timestamp.Date).Distinct().Count(),
                Records = g.ToList()
            });

        foreach (var userHours in userWorkHours)
        {
            if (userHours.TotalHours > 40 * (toDate - fromDate).Days / 7)
            {
                overtimeViolations.Add(new
                {
                    UserId = userHours.UserId,
                    TotalHours = userHours.TotalHours,
                    ExcessHours = userHours.TotalHours - 40 * (toDate - fromDate).Days / 7
                });
            }

            if (userHours.TotalHours / userHours.DaysWorked > 12)
            {
                maxHoursViolations.Add(new
                {
                    UserId = userHours.UserId,
                    AverageDailyHours = userHours.TotalHours / userHours.DaysWorked
                });
            }
        }

        var report = new ComplianceReport
        {
            Id = Guid.NewGuid().ToString(),
            TenantId = tenantId,
            ReportType = "LABOR_LAW_COMPLIANCE",
            GeneratedAt = DateTime.UtcNow,
            FromDate = fromDate,
            ToDate = toDate,
            Summary = new Dictionary<string, object>
            {
                ["TotalEmployees"] = userWorkHours.Count(),
                ["OvertimeViolations"] = overtimeViolations.Count,
                ["MaxHoursViolations"] = maxHoursViolations.Count,
                ["BreakViolations"] = breakViolations.Count,
                ["ComplianceScore"] = CalculateComplianceScore(overtimeViolations.Count, maxHoursViolations.Count, userWorkHours.Count())
            },
            Details = JsonSerializer.Serialize(new
            {
                OvertimeViolations = overtimeViolations,
                MaxHoursViolations = maxHoursViolations,
                BreakViolations = breakViolations
            })
        };

        await SaveComplianceReportAsync(report);
        return report;
    }

    public async Task<ComplianceReport> GenerateSecurityAuditReportAsync(string tenantId, DateTime fromDate, DateTime toDate)
    {
        var auditLogs = await _auditLogService.GetTenantAuditLogsAsync(tenantId, fromDate, toDate, 1, 10000);
        
        var securityEvents = auditLogs.Where(log => 
            log.Action.Contains("LOGIN") || 
            log.Action.Contains("LOGOUT") || 
            log.Action.Contains("AUTH") ||
            log.Severity == "Warning" ||
            log.Severity == "Error").ToList();

        var failedLogins = securityEvents.Count(e => e.Action.Contains("LOGIN") && e.Severity == "Warning");
        var suspiciousActivities = securityEvents.Count(e => e.Severity == "Warning" || e.Severity == "Error");
        var uniqueIpAddresses = securityEvents.Select(e => e.IpAddress).Distinct().Count();

        var report = new ComplianceReport
        {
            Id = Guid.NewGuid().ToString(),
            TenantId = tenantId,
            ReportType = "SECURITY_AUDIT",
            GeneratedAt = DateTime.UtcNow,
            FromDate = fromDate,
            ToDate = toDate,
            Summary = new Dictionary<string, object>
            {
                ["TotalSecurityEvents"] = securityEvents.Count,
                ["FailedLoginAttempts"] = failedLogins,
                ["SuspiciousActivities"] = suspiciousActivities,
                ["UniqueIpAddresses"] = uniqueIpAddresses,
                ["SecurityScore"] = CalculateSecurityScore(failedLogins, suspiciousActivities, securityEvents.Count)
            },
            Details = JsonSerializer.Serialize(securityEvents.Take(100))
        };

        await SaveComplianceReportAsync(report);
        return report;
    }

    public async Task<IEnumerable<ComplianceViolation>> DetectComplianceViolationsAsync(string tenantId)
    {
        var violations = new List<ComplianceViolation>();
        var now = DateTime.UtcNow;
        var thirtyDaysAgo = now.AddDays(-30);

        var recentAttendance = await _context.AttendanceRecords
            .Where(r => r.TenantId.ToString() == tenantId && r.Timestamp >= thirtyDaysAgo)
            .ToListAsync();

        var userWorkPatterns = recentAttendance
            .GroupBy(r => r.UserId)
            .Select(g => new
            {
                UserId = g.Key,
                Records = g.OrderBy(r => r.Timestamp).ToList()
            });

        foreach (var pattern in userWorkPatterns)
        {
            var consecutiveWorkDays = 0;
            var maxConsecutiveDays = 0;
            DateTime? lastWorkDate = null;

            foreach (var record in pattern.Records)
            {
                if (lastWorkDate.HasValue && (record.Timestamp.Date - lastWorkDate.Value.Date).Days == 1)
                {
                    consecutiveWorkDays++;
                }
                else
                {
                    maxConsecutiveDays = Math.Max(maxConsecutiveDays, consecutiveWorkDays);
                    consecutiveWorkDays = 1;
                }
                lastWorkDate = record.Timestamp.Date;
            }

            if (maxConsecutiveDays > 6)
            {
                violations.Add(new ComplianceViolation
                {
                    Id = Guid.NewGuid().ToString(),
                    TenantId = tenantId,
                    ViolationType = "EXCESSIVE_CONSECUTIVE_WORK_DAYS",
                    Severity = "High",
                    Description = $"Employee worked {maxConsecutiveDays} consecutive days without rest",
                    UserId = pattern.UserId.ToString(),
                    DetectedAt = now,
                    Status = "Active"
                });
            }
        }

        return violations;
    }

    public async Task LogComplianceEventAsync(ComplianceEvent complianceEvent)
    {
        try
        {
            _context.ComplianceEvents.Add(complianceEvent);
            await _context.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to log compliance event {EventType} for tenant {TenantId}", 
                complianceEvent.EventType, complianceEvent.TenantId);
        }
    }

    private async Task SaveComplianceReportAsync(ComplianceReport report)
    {
        try
        {
            var domainReport = new AttendancePlatform.Shared.Domain.Entities.ComplianceReport
            {
                Id = Guid.NewGuid(),
                TenantId = Guid.Parse(report.TenantId),
                Region = "US", // Default region, should be configurable
                Language = "en", // Default language, should be configurable
                StartDate = report.FromDate,
                EndDate = report.ToDate,
                GeneratedAt = report.GeneratedAt,
                ReportData = JsonSerializer.Serialize(report)
            };
            _context.ComplianceReports.Add(domainReport);
            await _context.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to save compliance report {ReportId}", report.Id);
        }
    }

    private double CalculateComplianceScore(int violations, int totalChecks, int totalEmployees)
    {
        if (totalChecks == 0) return 100.0;
        return Math.Max(0, 100.0 - (violations * 100.0 / totalChecks));
    }

    private double CalculateSecurityScore(int failedLogins, int suspiciousActivities, int totalEvents)
    {
        if (totalEvents == 0) return 100.0;
        var riskScore = (failedLogins + suspiciousActivities * 2) * 100.0 / totalEvents;
        return Math.Max(0, 100.0 - riskScore);
    }

    private double CalculateWorkingHours(List<AttendanceRecord> records)
    {
        var totalHours = 0.0;
        var sortedRecords = records.OrderBy(r => r.Timestamp).ToList();
        
        DateTime? checkInTime = null;
        
        foreach (var record in sortedRecords)
        {
            if (record.Type == AttendanceType.CheckIn)
            {
                checkInTime = record.Timestamp;
            }
            else if (record.Type == AttendanceType.CheckOut && checkInTime.HasValue)
            {
                totalHours += (record.Timestamp - checkInTime.Value).TotalHours;
                checkInTime = null;
            }
        }
        
        return totalHours;
    }
}

public class ComplianceReport
{
    public string Id { get; set; } = string.Empty;
    public string TenantId { get; set; } = string.Empty;
    public string ReportType { get; set; } = string.Empty;
    public DateTime GeneratedAt { get; set; }
    public DateTime FromDate { get; set; }
    public DateTime ToDate { get; set; }
    public Dictionary<string, object> Summary { get; set; } = new();
    public string Details { get; set; } = string.Empty;
}

public class ComplianceViolation
{
    public string Id { get; set; } = string.Empty;
    public string TenantId { get; set; } = string.Empty;
    public string ViolationType { get; set; } = string.Empty;
    public string Severity { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? UserId { get; set; }
    public DateTime DetectedAt { get; set; }
    public string Status { get; set; } = string.Empty;
}

public class ComplianceEvent
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string TenantId { get; set; } = string.Empty;
    public string EventType { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public string? UserId { get; set; }
    public Dictionary<string, object> Metadata { get; set; } = new();
}
