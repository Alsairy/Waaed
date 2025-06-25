using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using AttendancePlatform.Shared.Infrastructure.Data;
using AttendancePlatform.Shared.Domain.DTOs;
using AttendancePlatform.Shared.Domain.Entities;

namespace AttendancePlatform.Compliance.Api.Services
{
    public interface IComplianceService
    {
        Task<ApiResponse<ComplianceReportDto>> GenerateComplianceReportAsync(Guid tenantId, string region, DateTime startDate, DateTime endDate, string language = "en");
        Task<ApiResponse<List<RegionalRequirementDto>>> GetRegionalRequirementsAsync(string countryCode);
        Task<ApiResponse<bool>> ValidateAttendanceComplianceAsync(Guid tenantId, string region);
        Task<ApiResponse<ComplianceStatusDto>> GetComplianceStatusAsync(Guid tenantId, string region);
        Task<ApiResponse<List<ComplianceViolationDto>>> GetComplianceViolationsAsync(Guid tenantId, string region, DateTime startDate, DateTime endDate);
        Task<ApiResponse<bool>> UpdateRegionalSettingsAsync(Guid tenantId, RegionalSettingsDto settings);
        Task<ApiResponse<List<LocalizedStringDto>>> GetLocalizedStringsAsync(string language, string module);
    }

    public class ComplianceService : IComplianceService
    {
        private readonly AttendancePlatformDbContext _context;
        private readonly ILogger<ComplianceService> _logger;
        private readonly ILocalizationService _localizationService;
        private readonly Dictionary<string, RegionalComplianceRules> _regionalRules;

        public ComplianceService(
            AttendancePlatformDbContext context,
            ILogger<ComplianceService> logger,
            ILocalizationService localizationService)
        {
            _context = context;
            _logger = logger;
            _localizationService = localizationService;
            _regionalRules = InitializeRegionalRules();
        }

        public async Task<ApiResponse<ComplianceReportDto>> GenerateComplianceReportAsync(
            Guid tenantId, string region, DateTime startDate, DateTime endDate, string language = "en")
        {
            try
            {
                _logger.LogInformation("Generating compliance report for tenant {TenantId}, region {Region}", tenantId, region);

                var tenant = await _context.Tenants.FirstOrDefaultAsync(t => t.Id == tenantId);
                if (tenant == null)
                {
                    return ApiResponse<ComplianceReportDto>.ErrorResult("Tenant not found");
                }

                var attendanceRecords = await _context.AttendanceRecords
                    .Where(a => a.User.TenantId == tenantId && 
                               a.CheckInTime >= startDate && 
                               a.CheckInTime <= endDate)
                    .Include(a => a.User)
                    .ToListAsync();

                var violations = await GetComplianceViolationsInternalAsync(tenantId, region, startDate, endDate);
                var regionalRequirements = await GetRegionalRequirementsInternalAsync(region);

                var report = new ComplianceReportDto
                {
                    TenantId = tenantId,
                    Region = region,
                    Language = language,
                    StartDate = startDate,
                    EndDate = endDate,
                    GeneratedAt = DateTime.UtcNow,
                    TotalEmployees = attendanceRecords.Select(a => a.UserId).Distinct().Count(),
                    TotalWorkingDays = CalculateWorkingDays(startDate, endDate, region),
                    ComplianceScore = CalculateComplianceScore(attendanceRecords, violations, regionalRequirements),
                    Violations = violations,
                    RegionalRequirements = regionalRequirements,
                    Summary = await GenerateLocalizedSummaryAsync(attendanceRecords, violations, language),
                    Recommendations = await GenerateLocalizedRecommendationsAsync(violations, language)
                };

                var reportEntity = new ComplianceReport
                {
                    Id = Guid.NewGuid(),
                    TenantId = tenantId,
                    Region = region,
                    Language = language,
                    StartDate = startDate,
                    EndDate = endDate,
                    ReportData = System.Text.Json.JsonSerializer.Serialize(report),
                    GeneratedAt = DateTime.UtcNow,
                    CreatedAt = DateTime.UtcNow
                };

                _context.ComplianceReports.Add(reportEntity);
                await _context.SaveChangesAsync();

                return ApiResponse<ComplianceReportDto>.SuccessResult(report);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating compliance report for tenant {TenantId}", tenantId);
                return ApiResponse<ComplianceReportDto>.ErrorResult("Failed to generate compliance report");
            }
        }

        public async Task<ApiResponse<List<RegionalRequirementDto>>> GetRegionalRequirementsAsync(string countryCode)
        {
            try
            {
                _logger.LogInformation("Getting regional requirements for country {CountryCode}", countryCode);

                var requirements = await GetRegionalRequirementsInternalAsync(countryCode);
                return ApiResponse<List<RegionalRequirementDto>>.SuccessResult(requirements);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting regional requirements for country {CountryCode}", countryCode);
                return ApiResponse<List<RegionalRequirementDto>>.ErrorResult("Failed to get regional requirements");
            }
        }

        public async Task<ApiResponse<bool>> ValidateAttendanceComplianceAsync(Guid tenantId, string region)
        {
            try
            {
                _logger.LogInformation("Validating attendance compliance for tenant {TenantId}, region {Region}", tenantId, region);

                if (!_regionalRules.ContainsKey(region))
                {
                    return ApiResponse<bool>.ErrorResult($"No compliance rules found for region {region}");
                }

                var rules = _regionalRules[region];
                var currentMonth = DateTime.UtcNow.AddDays(-30);
                var now = DateTime.UtcNow;

                var attendanceRecords = await _context.AttendanceRecords
                    .Where(a => a.User.TenantId == tenantId && 
                               a.CheckInTime >= currentMonth && 
                               a.CheckInTime <= now)
                    .Include(a => a.User)
                    .ToListAsync();

                var violations = await GetComplianceViolationsInternalAsync(tenantId, region, currentMonth, now);
                var isCompliant = violations.Count == 0;

                return ApiResponse<bool>.SuccessResult(isCompliant);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating compliance for tenant {TenantId}", tenantId);
                return ApiResponse<bool>.ErrorResult("Failed to validate compliance");
            }
        }

        public async Task<ApiResponse<ComplianceStatusDto>> GetComplianceStatusAsync(Guid tenantId, string region)
        {
            try
            {
                _logger.LogInformation("Getting compliance status for tenant {TenantId}, region {Region}", tenantId, region);

                var currentMonth = DateTime.UtcNow.AddDays(-30);
                var now = DateTime.UtcNow;

                var violations = await GetComplianceViolationsInternalAsync(tenantId, region, currentMonth, now);
                var requirements = await GetRegionalRequirementsInternalAsync(region);

                var status = new ComplianceStatusDto
                {
                    TenantId = tenantId,
                    Region = region,
                    IsCompliant = violations.Count == 0,
                    ComplianceScore = CalculateComplianceScore(new List<AttendanceRecord>(), violations, requirements),
                    LastChecked = DateTime.UtcNow,
                    ViolationCount = violations.Count,
                    CriticalViolationCount = violations.Count(v => v.Severity == "Critical"),
                    NextReviewDate = CalculateNextReviewDate(region),
                    Status = violations.Count == 0 ? "Compliant" : violations.Any(v => v.Severity == "Critical") ? "Critical" : "Warning"
                };

                return ApiResponse<ComplianceStatusDto>.SuccessResult(status);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting compliance status for tenant {TenantId}", tenantId);
                return ApiResponse<ComplianceStatusDto>.ErrorResult("Failed to get compliance status");
            }
        }

        public async Task<ApiResponse<List<ComplianceViolationDto>>> GetComplianceViolationsAsync(
            Guid tenantId, string region, DateTime startDate, DateTime endDate)
        {
            try
            {
                _logger.LogInformation("Getting compliance violations for tenant {TenantId}, region {Region}", tenantId, region);

                var violations = await GetComplianceViolationsInternalAsync(tenantId, region, startDate, endDate);
                return ApiResponse<List<ComplianceViolationDto>>.SuccessResult(violations);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting compliance violations for tenant {TenantId}", tenantId);
                return ApiResponse<List<ComplianceViolationDto>>.ErrorResult("Failed to get compliance violations");
            }
        }

        public async Task<ApiResponse<bool>> UpdateRegionalSettingsAsync(Guid tenantId, RegionalSettingsDto settings)
        {
            try
            {
                _logger.LogInformation("Updating regional settings for tenant {TenantId}", tenantId);

                var tenant = await _context.Tenants.FirstOrDefaultAsync(t => t.Id == tenantId);
                if (tenant == null)
                {
                    return ApiResponse<bool>.ErrorResult("Tenant not found");
                }

                var existingSettings = await _context.RegionalSettings
                    .FirstOrDefaultAsync(rs => rs.TenantId == tenantId);

                if (existingSettings == null)
                {
                    existingSettings = new RegionalSettings
                    {
                        Id = Guid.NewGuid(),
                        TenantId = tenantId,
                        CreatedAt = DateTime.UtcNow
                    };
                    _context.RegionalSettings.Add(existingSettings);
                }

                existingSettings.CountryCode = settings.CountryCode;
                existingSettings.TimeZone = settings.TimeZone;
                existingSettings.Language = settings.Language;
                existingSettings.Currency = settings.Currency;
                existingSettings.DateFormat = settings.DateFormat;
                existingSettings.TimeFormat = settings.TimeFormat;
                existingSettings.WorkingDaysPerWeek = settings.WorkingDaysPerWeek;
                existingSettings.StandardWorkingHours = settings.StandardWorkingHours;
                existingSettings.OvertimeThreshold = settings.OvertimeThreshold;
                existingSettings.ComplianceLevel = settings.ComplianceLevel;
                existingSettings.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return ApiResponse<bool>.SuccessResult(true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating regional settings for tenant {TenantId}", tenantId);
                return ApiResponse<bool>.ErrorResult("Failed to update regional settings");
            }
        }

        public async Task<ApiResponse<List<LocalizedStringDto>>> GetLocalizedStringsAsync(string language, string module)
        {
            try
            {
                _logger.LogInformation("Getting localized strings for language {Language}, module {Module}", language, module);

                var localizedStrings = await _context.LocalizedStrings
                    .Where(ls => ls.Language == language && ls.Module == module)
                    .Select(ls => new LocalizedStringDto
                    {
                        Key = ls.Key,
                        Value = ls.Value,
                        Language = ls.Language,
                        Module = ls.Module
                    })
                    .ToListAsync();

                return ApiResponse<List<LocalizedStringDto>>.SuccessResult(localizedStrings);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting localized strings for language {Language}", language);
                return ApiResponse<List<LocalizedStringDto>>.ErrorResult("Failed to get localized strings");
            }
        }

        private async Task<List<ComplianceViolationDto>> GetComplianceViolationsInternalAsync(
            Guid tenantId, string region, DateTime startDate, DateTime endDate)
        {
            var violations = new List<ComplianceViolationDto>();

            if (!_regionalRules.ContainsKey(region))
            {
                return violations;
            }

            var rules = _regionalRules[region];
            var attendanceRecords = await _context.AttendanceRecords
                .Where(a => a.User.TenantId == tenantId && 
                           a.CheckInTime >= startDate && 
                           a.CheckInTime <= endDate)
                .Include(a => a.User)
                .ToListAsync();

            foreach (var userGroup in attendanceRecords.GroupBy(a => a.UserId))
            {
                var userRecords = userGroup.ToList();
                var totalHours = userRecords.Sum(r => r.CheckOutTime.HasValue 
                    ? (r.CheckOutTime.Value - r.CheckInTime).TotalHours 
                    : 0);

                var weeklyHours = CalculateWeeklyHours(userRecords);
                
                if (weeklyHours > rules.MaxWeeklyHours)
                {
                    violations.Add(new ComplianceViolationDto
                    {
                        Id = Guid.NewGuid(),
                        TenantId = tenantId,
                        UserId = userGroup.Key,
                        ViolationType = "Overtime",
                        Severity = "Warning",
                        Description = $"Employee exceeded maximum weekly hours: {weeklyHours:F1}h > {rules.MaxWeeklyHours}h",
                        DetectedAt = DateTime.UtcNow,
                        Status = "Active",
                        Region = region
                    });
                }

                if (totalHours > rules.MaxMonthlyHours)
                {
                    violations.Add(new ComplianceViolationDto
                    {
                        Id = Guid.NewGuid(),
                        TenantId = tenantId,
                        UserId = userGroup.Key,
                        ViolationType = "Overtime",
                        Severity = "Critical",
                        Description = $"Employee exceeded maximum monthly hours: {totalHours:F1}h > {rules.MaxMonthlyHours}h",
                        DetectedAt = DateTime.UtcNow,
                        Status = "Active",
                        Region = region
                    });
                }
            }

            foreach (var record in attendanceRecords)
            {
                var workingHours = record.CheckOutTime.HasValue 
                    ? (record.CheckOutTime.Value - record.CheckInTime).TotalHours 
                    : 0;

                if (workingHours > rules.MinBreakAfterHours && !HasRequiredBreaks(record, rules))
                {
                    violations.Add(new ComplianceViolationDto
                    {
                        Id = Guid.NewGuid(),
                        TenantId = tenantId,
                        UserId = record.UserId,
                        ViolationType = "Break",
                        Severity = "Warning",
                        Description = $"Employee did not take required breaks during {workingHours:F1}h shift",
                        DetectedAt = DateTime.UtcNow,
                        Status = "Active",
                        Region = region
                    });
                }
            }

            return violations;
        }

        private async Task<List<RegionalRequirementDto>> GetRegionalRequirementsInternalAsync(string region)
        {
            var requirements = new List<RegionalRequirementDto>();

            if (_regionalRules.ContainsKey(region))
            {
                var rules = _regionalRules[region];
                
                requirements.Add(new RegionalRequirementDto
                {
                    Category = "Working Hours",
                    Requirement = $"Maximum {rules.MaxWeeklyHours} hours per week",
                    Description = "Legal limit for weekly working hours",
                    Mandatory = true,
                    Region = region
                });

                requirements.Add(new RegionalRequirementDto
                {
                    Category = "Working Hours",
                    Requirement = $"Maximum {rules.MaxMonthlyHours} hours per month",
                    Description = "Legal limit for monthly working hours",
                    Mandatory = true,
                    Region = region
                });

                requirements.Add(new RegionalRequirementDto
                {
                    Category = "Breaks",
                    Requirement = $"Minimum {rules.MinBreakDuration} minute break after {rules.MinBreakAfterHours} hours",
                    Description = "Mandatory break requirements",
                    Mandatory = true,
                    Region = region
                });

                requirements.Add(new RegionalRequirementDto
                {
                    Category = "Rest Period",
                    Requirement = $"Minimum {rules.MinRestBetweenShifts} hours between shifts",
                    Description = "Required rest period between work shifts",
                    Mandatory = true,
                    Region = region
                });
            }

            return requirements;
        }

        private Dictionary<string, RegionalComplianceRules> InitializeRegionalRules()
        {
            return new Dictionary<string, RegionalComplianceRules>
            {
                ["US"] = new RegionalComplianceRules
                {
                    MaxWeeklyHours = 40,
                    MaxMonthlyHours = 160,
                    MinBreakAfterHours = 6,
                    MinBreakDuration = 30,
                    MinRestBetweenShifts = 8,
                    OvertimeRate = 1.5,
                    RequiredRecordRetention = 3 // years
                },
                ["EU"] = new RegionalComplianceRules
                {
                    MaxWeeklyHours = 48,
                    MaxMonthlyHours = 192,
                    MinBreakAfterHours = 6,
                    MinBreakDuration = 20,
                    MinRestBetweenShifts = 11,
                    OvertimeRate = 1.25,
                    RequiredRecordRetention = 5
                },
                ["UK"] = new RegionalComplianceRules
                {
                    MaxWeeklyHours = 48,
                    MaxMonthlyHours = 192,
                    MinBreakAfterHours = 6,
                    MinBreakDuration = 20,
                    MinRestBetweenShifts = 11,
                    OvertimeRate = 1.5,
                    RequiredRecordRetention = 2
                },
                ["CA"] = new RegionalComplianceRules
                {
                    MaxWeeklyHours = 44,
                    MaxMonthlyHours = 176,
                    MinBreakAfterHours = 5,
                    MinBreakDuration = 30,
                    MinRestBetweenShifts = 8,
                    OvertimeRate = 1.5,
                    RequiredRecordRetention = 3
                },
                ["AU"] = new RegionalComplianceRules
                {
                    MaxWeeklyHours = 38,
                    MaxMonthlyHours = 152,
                    MinBreakAfterHours = 5,
                    MinBreakDuration = 30,
                    MinRestBetweenShifts = 10,
                    OvertimeRate = 1.5,
                    RequiredRecordRetention = 7
                },
                ["SA"] = new RegionalComplianceRules // Saudi Arabia
                {
                    MaxWeeklyHours = 48,
                    MaxMonthlyHours = 192,
                    MinBreakAfterHours = 5,
                    MinBreakDuration = 30,
                    MinRestBetweenShifts = 8,
                    OvertimeRate = 1.5,
                    RequiredRecordRetention = 5
                }
            };
        }

        private double CalculateComplianceScore(List<AttendanceRecord> records, List<ComplianceViolationDto> violations, List<RegionalRequirementDto> requirements)
        {
            if (requirements.Count == 0) return 100.0;

            var criticalViolations = violations.Count(v => v.Severity == "Critical");
            var warningViolations = violations.Count(v => v.Severity == "Warning");

            var score = 100.0;
            score -= (criticalViolations * 20); // -20 points per critical violation
            score -= (warningViolations * 5);   // -5 points per warning violation

            return Math.Max(0, score);
        }

        private int CalculateWorkingDays(DateTime startDate, DateTime endDate, string region)
        {
            var workingDays = 0;
            var current = startDate.Date;

            while (current <= endDate.Date)
            {
                if (current.DayOfWeek != DayOfWeek.Saturday && current.DayOfWeek != DayOfWeek.Sunday)
                {
                    workingDays++;
                }
                current = current.AddDays(1);
            }

            return workingDays;
        }

        private double CalculateWeeklyHours(List<AttendanceRecord> userRecords)
        {
            var weeklyHours = 0.0;
            var currentWeek = DateTime.UtcNow.StartOfWeek();

            foreach (var record in userRecords.Where(r => r.CheckInTime >= currentWeek))
            {
                if (record.CheckOutTime.HasValue)
                {
                    weeklyHours += (record.CheckOutTime.Value - record.CheckInTime).TotalHours;
                }
            }

            return weeklyHours;
        }

        private bool HasRequiredBreaks(AttendanceRecord record, RegionalComplianceRules rules)
        {
            var workingHours = record.CheckOutTime.HasValue 
                ? (record.CheckOutTime.Value - record.CheckInTime).TotalHours 
                : 0;

            return workingHours <= rules.MinBreakAfterHours;
        }

        private DateTime CalculateNextReviewDate(string region)
        {
            return region switch
            {
                "EU" => DateTime.UtcNow.AddMonths(1),
                "US" => DateTime.UtcNow.AddMonths(3),
                "UK" => DateTime.UtcNow.AddMonths(1),
                "CA" => DateTime.UtcNow.AddMonths(2),
                "AU" => DateTime.UtcNow.AddMonths(1),
                "SA" => DateTime.UtcNow.AddMonths(1),
                _ => DateTime.UtcNow.AddMonths(3)
            };
        }

        private async Task<string> GenerateLocalizedSummaryAsync(List<AttendanceRecord> records, List<ComplianceViolationDto> violations, string language)
        {
            var totalEmployees = records.Select(r => r.UserId).Distinct().Count();
            var totalViolations = violations.Count;
            var criticalViolations = violations.Count(v => v.Severity == "Critical");

            // In a real implementation, this would use proper localization
            return language switch
            {
                "es" => $"Resumen: {totalEmployees} empleados, {totalViolations} violaciones ({criticalViolations} críticas)",
                "fr" => $"Résumé: {totalEmployees} employés, {totalViolations} violations ({criticalViolations} critiques)",
                "de" => $"Zusammenfassung: {totalEmployees} Mitarbeiter, {totalViolations} Verstöße ({criticalViolations} kritisch)",
                "ar" => $"ملخص: {totalEmployees} موظف، {totalViolations} مخالفة ({criticalViolations} حرجة)",
                _ => $"Summary: {totalEmployees} employees, {totalViolations} violations ({criticalViolations} critical)"
            };
        }

        private async Task<List<string>> GenerateLocalizedRecommendationsAsync(List<ComplianceViolationDto> violations, string language)
        {
            var recommendations = new List<string>();

            if (violations.Any(v => v.ViolationType == "Overtime"))
            {
                recommendations.Add(language switch
                {
                    "es" => "Revisar y ajustar los horarios de trabajo para cumplir con los límites de horas extras",
                    "fr" => "Réviser et ajuster les horaires de travail pour respecter les limites d'heures supplémentaires",
                    "de" => "Arbeitszeiten überprüfen und anpassen, um Überstundengrenzen einzuhalten",
                    "ar" => "مراجعة وتعديل جداول العمل للامتثال لحدود العمل الإضافي",
                    _ => "Review and adjust work schedules to comply with overtime limits"
                });
            }

            if (violations.Any(v => v.ViolationType == "Break"))
            {
                recommendations.Add(language switch
                {
                    "es" => "Implementar políticas de descanso obligatorio y sistemas de seguimiento",
                    "fr" => "Mettre en place des politiques de pause obligatoire et des systèmes de suivi",
                    "de" => "Obligatorische Pausenrichtlinien und Überwachungssysteme implementieren",
                    "ar" => "تنفيذ سياسات الاستراحة الإجبارية وأنظمة المتابعة",
                    _ => "Implement mandatory break policies and tracking systems"
                });
            }

            return recommendations;
        }
    }

    public interface ILocalizationService
    {
        Task<string> GetLocalizedStringAsync(string key, string language, params object[] args);
        Task<Dictionary<string, string>> GetLocalizedStringsAsync(string language, string module);
    }

    public class LocalizationService : ILocalizationService
    {
        private readonly AttendancePlatformDbContext _context;
        private readonly ILogger<LocalizationService> _logger;

        public LocalizationService(AttendancePlatformDbContext context, ILogger<LocalizationService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<string> GetLocalizedStringAsync(string key, string language, params object[] args)
        {
            try
            {
                var localizedString = await _context.LocalizedStrings
                    .FirstOrDefaultAsync(ls => ls.Key == key && ls.Language == language);

                if (localizedString != null)
                {
                    return args.Length > 0 ? string.Format(localizedString.Value, args) : localizedString.Value;
                }

                var fallback = await _context.LocalizedStrings
                    .FirstOrDefaultAsync(ls => ls.Key == key && ls.Language == "en");

                return fallback?.Value ?? key;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting localized string for key {Key}, language {Language}", key, language);
                return key;
            }
        }

        public async Task<Dictionary<string, string>> GetLocalizedStringsAsync(string language, string module)
        {
            try
            {
                var strings = await _context.LocalizedStrings
                    .Where(ls => ls.Language == language && ls.Module == module)
                    .ToDictionaryAsync(ls => ls.Key, ls => ls.Value);

                return strings;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting localized strings for language {Language}, module {Module}", language, module);
                return new Dictionary<string, string>();
            }
        }
    }

    public class RegionalComplianceRules
    {
        public double MaxWeeklyHours { get; set; }
        public double MaxMonthlyHours { get; set; }
        public double MinBreakAfterHours { get; set; }
        public int MinBreakDuration { get; set; }
        public double MinRestBetweenShifts { get; set; }
        public double OvertimeRate { get; set; }
        public int RequiredRecordRetention { get; set; }
    }
}

public static class DateTimeExtensions
{
    public static DateTime StartOfWeek(this DateTime dt, DayOfWeek startOfWeek = DayOfWeek.Monday)
    {
        int diff = (7 + (dt.DayOfWeek - startOfWeek)) % 7;
        return dt.AddDays(-1 * diff).Date;
    }
}
