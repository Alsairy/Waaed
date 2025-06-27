using Microsoft.EntityFrameworkCore;
using AttendancePlatform.Shared.Infrastructure.Data;
using System.Text.Json;
using System.Dynamic;

namespace AttendancePlatform.BI.Api.Services
{
    public interface IReportBuilderService
    {
        Task<CustomReportDto> CreateCustomReportAsync(CreateReportRequestDto request);
        Task<List<ReportTemplateDto>> GetReportTemplatesAsync(Guid tenantId);
        Task<CustomReportDto> ExecuteReportAsync(Guid reportId, Dictionary<string, object> parameters);
        Task<List<CustomReportDto>> GetUserReportsAsync(Guid tenantId, Guid userId);
        Task<bool> DeleteReportAsync(Guid reportId);
        Task<CustomReportDto> UpdateReportAsync(Guid reportId, UpdateReportRequestDto request);
    }

    public interface IDashboardService
    {
        Task<DashboardDto> CreateDashboardAsync(CreateDashboardRequestDto request);
        Task<List<DashboardDto>> GetUserDashboardsAsync(Guid tenantId, Guid userId);
        Task<DashboardDto> GetDashboardAsync(Guid dashboardId);
        Task<DashboardDto> UpdateDashboardAsync(Guid dashboardId, UpdateDashboardRequestDto request);
        Task<bool> DeleteDashboardAsync(Guid dashboardId);
        Task<List<WidgetDto>> GetAvailableWidgetsAsync();
    }

    public interface IDataVisualizationService
    {
        Task<ChartDataDto> GenerateChartDataAsync(ChartConfigurationDto config);
        Task<List<ChartTypeDto>> GetAvailableChartTypesAsync();
        Task<byte[]> ExportChartAsync(Guid chartId, string format);
        Task<DrillDownDataDto> GetDrillDownDataAsync(string chartType, Dictionary<string, object> filters);
    }

    public interface IKPIService
    {
        Task<List<KPIDto>> GetKPIsAsync(Guid tenantId, DateTime fromDate, DateTime toDate);
        Task<KPIDto> CreateCustomKPIAsync(CreateKPIRequestDto request);
        Task<List<KPITrendDto>> GetKPITrendsAsync(Guid tenantId, string kpiType, int days);
        Task<KPIBenchmarkDto> GetKPIBenchmarksAsync(Guid tenantId);
    }

    public interface IAdvancedReportingService
    {
        Task<ScheduledReportDto> ScheduleReportAsync(ScheduleReportRequestDto request);
        Task<List<ScheduledReportDto>> GetScheduledReportsAsync(Guid tenantId);
        Task<ReportExecutionResultDto> ExecuteScheduledReportAsync(Guid scheduledReportId);
        Task<byte[]> GenerateAdvancedReportAsync(AdvancedReportRequestDto request);
        Task<List<ReportExecutionHistoryDto>> GetReportExecutionHistoryAsync(Guid reportId);
    }

    public interface IDataExportService
    {
        Task<byte[]> ExportToExcelAsync(ExportRequestDto request);
        Task<byte[]> ExportToPdfAsync(ExportRequestDto request);
        Task<byte[]> ExportToCsvAsync(ExportRequestDto request);
        Task<string> ExportToJsonAsync(ExportRequestDto request);
        Task<ExportJobDto> CreateExportJobAsync(ExportRequestDto request);
        Task<ExportJobDto> GetExportJobStatusAsync(Guid jobId);
    }

    public class ReportBuilderService : IReportBuilderService
    {
        private readonly AttendancePlatformDbContext _context;
        private readonly ILogger<ReportBuilderService> _logger;

        public ReportBuilderService(AttendancePlatformDbContext context, ILogger<ReportBuilderService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<CustomReportDto> CreateCustomReportAsync(CreateReportRequestDto request)
        {
            try
            {
                var report = new CustomReport
                {
                    Id = Guid.NewGuid(),
                    TenantId = request.TenantId,
                    UserId = request.UserId,
                    Name = request.Name,
                    Description = request.Description,
                    ReportType = request.ReportType,
                    DataSources = JsonSerializer.Serialize(request.DataSources),
                    Filters = JsonSerializer.Serialize(request.Filters),
                    Columns = JsonSerializer.Serialize(request.Columns),
                    Grouping = JsonSerializer.Serialize(request.Grouping),
                    Sorting = JsonSerializer.Serialize(request.Sorting),
                    Formatting = JsonSerializer.Serialize(request.Formatting),
                    IsPublic = request.IsPublic,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.CustomReports.Add(report);
                await _context.SaveChangesAsync();

                return MapToCustomReportDto(report);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating custom report");
                throw;
            }
        }

        public async Task<List<ReportTemplateDto>> GetReportTemplatesAsync(Guid tenantId)
        {
            try
            {
                var templates = new List<ReportTemplateDto>
                {
                    new ReportTemplateDto
                    {
                        Id = Guid.NewGuid(),
                        Name = "Attendance Summary",
                        Description = "Comprehensive attendance overview with key metrics",
                        Category = "Attendance",
                        DataSources = new List<string> { "AttendanceRecords", "Users" },
                        DefaultFilters = new Dictionary<string, object>
                        {
                            { "DateRange", "Last30Days" },
                            { "IncludeInactive", false }
                        },
                        PreviewImageUrl = "/templates/attendance-summary.png"
                    },
                    new ReportTemplateDto
                    {
                        Id = Guid.NewGuid(),
                        Name = "Department Performance",
                        Description = "Department-wise performance analysis and comparison",
                        Category = "Performance",
                        DataSources = new List<string> { "AttendanceRecords", "Users", "LeaveManagement" },
                        DefaultFilters = new Dictionary<string, object>
                        {
                            { "DateRange", "LastQuarter" },
                            { "GroupBy", "Department" }
                        },
                        PreviewImageUrl = "/templates/department-performance.png"
                    },
                    new ReportTemplateDto
                    {
                        Id = Guid.NewGuid(),
                        Name = "Leave Analysis",
                        Description = "Detailed leave patterns and utilization analysis",
                        Category = "Leave",
                        DataSources = new List<string> { "LeaveManagement", "Users" },
                        DefaultFilters = new Dictionary<string, object>
                        {
                            { "DateRange", "CurrentYear" },
                            { "LeaveTypes", "All" }
                        },
                        PreviewImageUrl = "/templates/leave-analysis.png"
                    },
                    new ReportTemplateDto
                    {
                        Id = Guid.NewGuid(),
                        Name = "Productivity Insights",
                        Description = "Work hours, overtime, and productivity metrics",
                        Category = "Productivity",
                        DataSources = new List<string> { "AttendanceRecords", "Users" },
                        DefaultFilters = new Dictionary<string, object>
                        {
                            { "DateRange", "Last90Days" },
                            { "IncludeOvertime", true }
                        },
                        PreviewImageUrl = "/templates/productivity-insights.png"
                    },
                    new ReportTemplateDto
                    {
                        Id = Guid.NewGuid(),
                        Name = "Compliance Report",
                        Description = "Regulatory compliance and audit trail report",
                        Category = "Compliance",
                        DataSources = new List<string> { "AttendanceRecords", "AuditLogs", "Users" },
                        DefaultFilters = new Dictionary<string, object>
                        {
                            { "DateRange", "LastMonth" },
                            { "IncludeAuditTrail", true }
                        },
                        PreviewImageUrl = "/templates/compliance-report.png"
                    }
                };

                return templates;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting report templates");
                throw;
            }
        }

        public async Task<CustomReportDto> ExecuteReportAsync(Guid reportId, Dictionary<string, object> parameters)
        {
            try
            {
                var report = await _context.CustomReports.FindAsync(reportId);
                if (report == null)
                    throw new ArgumentException("Report not found");

                // Parse report configuration
                var dataSources = JsonSerializer.Deserialize<List<string>>(report.DataSources);
                var filters = JsonSerializer.Deserialize<Dictionary<string, object>>(report.Filters);
                var columns = JsonSerializer.Deserialize<List<ReportColumnDto>>(report.Columns);

                // Merge runtime parameters with saved filters
                foreach (var param in parameters)
                {
                    filters[param.Key] = param.Value;
                }

                // Execute query based on data sources and filters
                var data = await ExecuteReportQuery(dataSources, filters, columns);

                var result = MapToCustomReportDto(report);
                result.Data = data;
                result.ExecutedAt = DateTime.UtcNow;
                result.RowCount = data.Count;

                // Update execution history
                await UpdateReportExecutionHistory(reportId, parameters, data.Count);

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error executing report {ReportId}", reportId);
                throw;
            }
        }

        public async Task<List<CustomReportDto>> GetUserReportsAsync(Guid tenantId, Guid userId)
        {
            try
            {
                var reports = await _context.CustomReports
                    .Where(r => r.TenantId == tenantId && (r.UserId == userId || r.IsPublic))
                    .OrderByDescending(r => r.UpdatedAt)
                    .ToListAsync();

                return reports.Select(MapToCustomReportDto).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user reports");
                throw;
            }
        }

        public async Task<bool> DeleteReportAsync(Guid reportId)
        {
            try
            {
                var report = await _context.CustomReports.FindAsync(reportId);
                if (report == null) return false;

                _context.CustomReports.Remove(report);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting report {ReportId}", reportId);
                throw;
            }
        }

        public async Task<CustomReportDto> UpdateReportAsync(Guid reportId, UpdateReportRequestDto request)
        {
            try
            {
                var report = await _context.CustomReports.FindAsync(reportId);
                if (report == null)
                    throw new ArgumentException("Report not found");

                report.Name = request.Name ?? report.Name;
                report.Description = request.Description ?? report.Description;
                report.Filters = request.Filters != null ? JsonSerializer.Serialize(request.Filters) : report.Filters;
                report.Columns = request.Columns != null ? JsonSerializer.Serialize(request.Columns) : report.Columns;
                report.Grouping = request.Grouping != null ? JsonSerializer.Serialize(request.Grouping) : report.Grouping;
                report.Sorting = request.Sorting != null ? JsonSerializer.Serialize(request.Sorting) : report.Sorting;
                report.Formatting = request.Formatting != null ? JsonSerializer.Serialize(request.Formatting) : report.Formatting;
                report.IsPublic = request.IsPublic ?? report.IsPublic;
                report.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                return MapToCustomReportDto(report);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating report {ReportId}", reportId);
                throw;
            }
        }

        private async Task<List<Dictionary<string, object>>> ExecuteReportQuery(
            List<string> dataSources, 
            Dictionary<string, object> filters, 
            List<ReportColumnDto> columns)
        {
            var results = new List<Dictionary<string, object>>();

            try
            {
                // Build dynamic query based on data sources
                if (dataSources.Contains("AttendanceRecords"))
                {
                    var query = _context.AttendanceRecords.AsQueryable();

                    // Apply filters
                    if (filters.ContainsKey("DateRange"))
                    {
                        var dateRange = ParseDateRange(filters["DateRange"].ToString());
                        query = query.Where(ar => ar.CheckInTime >= dateRange.Start && ar.CheckInTime <= dateRange.End);
                    }

                    if (filters.ContainsKey("Department"))
                    {
                        var department = filters["Department"].ToString();
                        query = query.Where(ar => ar.User.Department == department);
                    }

                    if (filters.ContainsKey("UserId"))
                    {
                        var userId = Guid.Parse(filters["UserId"].ToString());
                        query = query.Where(ar => ar.UserId == userId);
                    }

                    // Include related data
                    query = query.Include(ar => ar.User);

                    var attendanceData = await query.ToListAsync();

                    // Transform data based on columns configuration
                    foreach (var record in attendanceData)
                    {
                        var row = new Dictionary<string, object>();
                        
                        foreach (var column in columns)
                        {
                            var value = GetColumnValue(record, column);
                            row[column.Name] = value;
                        }

                        results.Add(row);
                    }
                }

                return results;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error executing report query");
                throw;
            }
        }

        private object GetColumnValue(object record, ReportColumnDto column)
        {
            // Use reflection to get property values
            var type = record.GetType();
            var property = type.GetProperty(column.SourceField);
            
            if (property == null) return null;

            var value = property.GetValue(record);

            // Apply formatting if specified
            if (!string.IsNullOrEmpty(column.Format) && value != null)
            {
                return ApplyFormatting(value, column.Format);
            }

            return value;
        }

        private object ApplyFormatting(object value, string format)
        {
            return value switch
            {
                DateTime dt => dt.ToString(format),
                decimal dec => dec.ToString(format),
                double dbl => dbl.ToString(format),
                float flt => flt.ToString(format),
                _ => value
            };
        }

        private (DateTime Start, DateTime End) ParseDateRange(string dateRange)
        {
            var now = DateTime.UtcNow;
            return dateRange switch
            {
                "Today" => (now.Date, now.Date.AddDays(1).AddTicks(-1)),
                "Yesterday" => (now.Date.AddDays(-1), now.Date.AddTicks(-1)),
                "Last7Days" => (now.Date.AddDays(-7), now.Date.AddDays(1).AddTicks(-1)),
                "Last30Days" => (now.Date.AddDays(-30), now.Date.AddDays(1).AddTicks(-1)),
                "LastMonth" => (new DateTime(now.Year, now.Month, 1).AddMonths(-1), new DateTime(now.Year, now.Month, 1).AddTicks(-1)),
                "LastQuarter" => (now.Date.AddDays(-90), now.Date.AddDays(1).AddTicks(-1)),
                "CurrentYear" => (new DateTime(now.Year, 1, 1), new DateTime(now.Year + 1, 1, 1).AddTicks(-1)),
                _ => (now.Date.AddDays(-30), now.Date.AddDays(1).AddTicks(-1))
            };
        }

        private async Task UpdateReportExecutionHistory(Guid reportId, Dictionary<string, object> parameters, int rowCount)
        {
            var history = new ReportExecutionHistory
            {
                Id = Guid.NewGuid(),
                ReportId = reportId,
                ExecutedAt = DateTime.UtcNow,
                Parameters = JsonSerializer.Serialize(parameters),
                RowCount = rowCount,
                ExecutionTimeMs = 0 // Would be calculated in real implementation
            };

            _context.ReportExecutionHistory.Add(history);
            await _context.SaveChangesAsync();
        }

        private CustomReportDto MapToCustomReportDto(CustomReport report)
        {
            return new CustomReportDto
            {
                Id = report.Id,
                TenantId = report.TenantId,
                UserId = report.UserId,
                Name = report.Name,
                Description = report.Description,
                ReportType = report.ReportType,
                DataSources = JsonSerializer.Deserialize<List<string>>(report.DataSources),
                Filters = JsonSerializer.Deserialize<Dictionary<string, object>>(report.Filters),
                Columns = JsonSerializer.Deserialize<List<ReportColumnDto>>(report.Columns),
                Grouping = JsonSerializer.Deserialize<Dictionary<string, object>>(report.Grouping ?? "{}"),
                Sorting = JsonSerializer.Deserialize<Dictionary<string, object>>(report.Sorting ?? "{}"),
                Formatting = JsonSerializer.Deserialize<Dictionary<string, object>>(report.Formatting ?? "{}"),
                IsPublic = report.IsPublic,
                CreatedAt = report.CreatedAt,
                UpdatedAt = report.UpdatedAt
            };
        }
    }

    public class DashboardService : IDashboardService
    {
        private readonly AttendancePlatformDbContext _context;
        private readonly ILogger<DashboardService> _logger;

        public DashboardService(AttendancePlatformDbContext context, ILogger<DashboardService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<DashboardDto> CreateDashboardAsync(CreateDashboardRequestDto request)
        {
            try
            {
                var dashboard = new Dashboard
                {
                    Id = Guid.NewGuid(),
                    TenantId = request.TenantId,
                    UserId = request.UserId,
                    Name = request.Name,
                    Description = request.Description,
                    Layout = JsonSerializer.Serialize(request.Layout),
                    Widgets = JsonSerializer.Serialize(request.Widgets),
                    IsPublic = request.IsPublic,
                    RefreshInterval = request.RefreshInterval,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.Dashboards.Add(dashboard);
                await _context.SaveChangesAsync();

                return MapToDashboardDto(dashboard);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating dashboard");
                throw;
            }
        }

        public async Task<List<DashboardDto>> GetUserDashboardsAsync(Guid tenantId, Guid userId)
        {
            try
            {
                var dashboards = await _context.Dashboards
                    .Where(d => d.TenantId == tenantId && (d.UserId == userId || d.IsPublic))
                    .OrderByDescending(d => d.UpdatedAt)
                    .ToListAsync();

                return dashboards.Select(MapToDashboardDto).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user dashboards");
                throw;
            }
        }

        public async Task<DashboardDto> GetDashboardAsync(Guid dashboardId)
        {
            try
            {
                var dashboard = await _context.Dashboards.FindAsync(dashboardId);
                if (dashboard == null)
                    throw new ArgumentException("Dashboard not found");

                return MapToDashboardDto(dashboard);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting dashboard {DashboardId}", dashboardId);
                throw;
            }
        }

        public async Task<DashboardDto> UpdateDashboardAsync(Guid dashboardId, UpdateDashboardRequestDto request)
        {
            try
            {
                var dashboard = await _context.Dashboards.FindAsync(dashboardId);
                if (dashboard == null)
                    throw new ArgumentException("Dashboard not found");

                dashboard.Name = request.Name ?? dashboard.Name;
                dashboard.Description = request.Description ?? dashboard.Description;
                dashboard.Layout = request.Layout != null ? JsonSerializer.Serialize(request.Layout) : dashboard.Layout;
                dashboard.Widgets = request.Widgets != null ? JsonSerializer.Serialize(request.Widgets) : dashboard.Widgets;
                dashboard.IsPublic = request.IsPublic ?? dashboard.IsPublic;
                dashboard.RefreshInterval = request.RefreshInterval ?? dashboard.RefreshInterval;
                dashboard.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                return MapToDashboardDto(dashboard);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating dashboard {DashboardId}", dashboardId);
                throw;
            }
        }

        public async Task<bool> DeleteDashboardAsync(Guid dashboardId)
        {
            try
            {
                var dashboard = await _context.Dashboards.FindAsync(dashboardId);
                if (dashboard == null) return false;

                _context.Dashboards.Remove(dashboard);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting dashboard {DashboardId}", dashboardId);
                throw;
            }
        }

        public async Task<List<WidgetDto>> GetAvailableWidgetsAsync()
        {
            try
            {
                var widgets = new List<WidgetDto>
                {
                    new WidgetDto
                    {
                        Id = "attendance-overview",
                        Name = "Attendance Overview",
                        Description = "Key attendance metrics and statistics",
                        Category = "Attendance",
                        Type = "metric",
                        ConfigurationSchema = GetAttendanceOverviewSchema(),
                        PreviewImageUrl = "/widgets/attendance-overview.png"
                    },
                    new WidgetDto
                    {
                        Id = "attendance-chart",
                        Name = "Attendance Chart",
                        Description = "Visual attendance trends and patterns",
                        Category = "Attendance",
                        Type = "chart",
                        ConfigurationSchema = GetAttendanceChartSchema(),
                        PreviewImageUrl = "/widgets/attendance-chart.png"
                    },
                    new WidgetDto
                    {
                        Id = "department-comparison",
                        Name = "Department Comparison",
                        Description = "Compare metrics across departments",
                        Category = "Analytics",
                        Type = "comparison",
                        ConfigurationSchema = GetDepartmentComparisonSchema(),
                        PreviewImageUrl = "/widgets/department-comparison.png"
                    },
                    new WidgetDto
                    {
                        Id = "leave-calendar",
                        Name = "Leave Calendar",
                        Description = "Visual leave schedule and planning",
                        Category = "Leave",
                        Type = "calendar",
                        ConfigurationSchema = GetLeaveCalendarSchema(),
                        PreviewImageUrl = "/widgets/leave-calendar.png"
                    },
                    new WidgetDto
                    {
                        Id = "productivity-gauge",
                        Name = "Productivity Gauge",
                        Description = "Real-time productivity indicators",
                        Category = "Productivity",
                        Type = "gauge",
                        ConfigurationSchema = GetProductivityGaugeSchema(),
                        PreviewImageUrl = "/widgets/productivity-gauge.png"
                    },
                    new WidgetDto
                    {
                        Id = "alerts-notifications",
                        Name = "Alerts & Notifications",
                        Description = "Important alerts and system notifications",
                        Category = "System",
                        Type = "list",
                        ConfigurationSchema = GetAlertsNotificationsSchema(),
                        PreviewImageUrl = "/widgets/alerts-notifications.png"
                    }
                };

                return widgets;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting available widgets");
                throw;
            }
        }

        private DashboardDto MapToDashboardDto(Dashboard dashboard)
        {
            return new DashboardDto
            {
                Id = dashboard.Id,
                TenantId = dashboard.TenantId,
                UserId = dashboard.UserId,
                Name = dashboard.Name,
                Description = dashboard.Description,
                Layout = JsonSerializer.Deserialize<Dictionary<string, object>>(dashboard.Layout ?? "{}"),
                Widgets = JsonSerializer.Deserialize<List<DashboardWidgetDto>>(dashboard.Widgets ?? "[]"),
                IsPublic = dashboard.IsPublic,
                RefreshInterval = dashboard.RefreshInterval,
                CreatedAt = dashboard.CreatedAt,
                UpdatedAt = dashboard.UpdatedAt
            };
        }

        private Dictionary<string, object> GetAttendanceOverviewSchema()
        {
            return new Dictionary<string, object>
            {
                { "dateRange", new { type = "select", options = new[] { "Today", "Week", "Month" }, default = "Today" } },
                { "showComparison", new { type = "boolean", default = true } },
                { "metrics", new { type = "multiselect", options = new[] { "Total", "Present", "Absent", "Late" } } }
            };
        }

        private Dictionary<string, object> GetAttendanceChartSchema()
        {
            return new Dictionary<string, object>
            {
                { "chartType", new { type = "select", options = new[] { "line", "bar", "area" }, default = "line" } },
                { "timeframe", new { type = "select", options = new[] { "7days", "30days", "90days" }, default = "30days" } },
                { "groupBy", new { type = "select", options = new[] { "day", "week", "month" }, default = "day" } }
            };
        }

        private Dictionary<string, object> GetDepartmentComparisonSchema()
        {
            return new Dictionary<string, object>
            {
                { "metric", new { type = "select", options = new[] { "attendance", "productivity", "overtime" }, default = "attendance" } },
                { "departments", new { type = "multiselect", source = "departments" } },
                { "period", new { type = "select", options = new[] { "week", "month", "quarter" }, default = "month" } }
            };
        }

        private Dictionary<string, object> GetLeaveCalendarSchema()
        {
            return new Dictionary<string, object>
            {
                { "view", new { type = "select", options = new[] { "month", "week", "agenda" }, default = "month" } },
                { "showTypes", new { type = "multiselect", options = new[] { "Annual", "Sick", "Personal" } } },
                { "showTeam", new { type = "boolean", default = false } }
            };
        }

        private Dictionary<string, object> GetProductivityGaugeSchema()
        {
            return new Dictionary<string, object>
            {
                { "metric", new { type = "select", options = new[] { "efficiency", "utilization", "output" }, default = "efficiency" } },
                { "target", new { type = "number", default = 85 } },
                { "period", new { type = "select", options = new[] { "today", "week", "month" }, default = "today" } }
            };
        }

        private Dictionary<string, object> GetAlertsNotificationsSchema()
        {
            return new Dictionary<string, object>
            {
                { "types", new { type = "multiselect", options = new[] { "system", "attendance", "leave", "compliance" } } },
                { "priority", new { type = "select", options = new[] { "all", "high", "critical" }, default = "all" } },
                { "maxItems", new { type = "number", default = 10 } }
            };
        }
    }

    // Entity Models for BI
    public class CustomReport
    {
        public Guid Id { get; set; }
        public Guid TenantId { get; set; }
        public Guid UserId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string ReportType { get; set; } = string.Empty;
        public string DataSources { get; set; } = string.Empty;
        public string Filters { get; set; } = string.Empty;
        public string Columns { get; set; } = string.Empty;
        public string? Grouping { get; set; }
        public string? Sorting { get; set; }
        public string? Formatting { get; set; }
        public bool IsPublic { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class Dashboard
    {
        public Guid Id { get; set; }
        public Guid TenantId { get; set; }
        public Guid UserId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Layout { get; set; } = string.Empty;
        public string Widgets { get; set; } = string.Empty;
        public bool IsPublic { get; set; }
        public int RefreshInterval { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class ReportExecutionHistory
    {
        public Guid Id { get; set; }
        public Guid ReportId { get; set; }
        public DateTime ExecutedAt { get; set; }
        public string Parameters { get; set; } = string.Empty;
        public int RowCount { get; set; }
        public long ExecutionTimeMs { get; set; }
    }

    // DTOs for BI Services
    public class CreateReportRequestDto
    {
        public Guid TenantId { get; set; }
        public Guid UserId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string ReportType { get; set; } = string.Empty;
        public List<string> DataSources { get; set; } = new();
        public Dictionary<string, object> Filters { get; set; } = new();
        public List<ReportColumnDto> Columns { get; set; } = new();
        public Dictionary<string, object> Grouping { get; set; } = new();
        public Dictionary<string, object> Sorting { get; set; } = new();
        public Dictionary<string, object> Formatting { get; set; } = new();
        public bool IsPublic { get; set; }
    }

    public class UpdateReportRequestDto
    {
        public string? Name { get; set; }
        public string? Description { get; set; }
        public Dictionary<string, object>? Filters { get; set; }
        public List<ReportColumnDto>? Columns { get; set; }
        public Dictionary<string, object>? Grouping { get; set; }
        public Dictionary<string, object>? Sorting { get; set; }
        public Dictionary<string, object>? Formatting { get; set; }
        public bool? IsPublic { get; set; }
    }

    public class CustomReportDto
    {
        public Guid Id { get; set; }
        public Guid TenantId { get; set; }
        public Guid UserId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string ReportType { get; set; } = string.Empty;
        public List<string> DataSources { get; set; } = new();
        public Dictionary<string, object> Filters { get; set; } = new();
        public List<ReportColumnDto> Columns { get; set; } = new();
        public Dictionary<string, object> Grouping { get; set; } = new();
        public Dictionary<string, object> Sorting { get; set; } = new();
        public Dictionary<string, object> Formatting { get; set; } = new();
        public bool IsPublic { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public List<Dictionary<string, object>>? Data { get; set; }
        public DateTime? ExecutedAt { get; set; }
        public int? RowCount { get; set; }
    }

    public class ReportColumnDto
    {
        public string Name { get; set; } = string.Empty;
        public string SourceField { get; set; } = string.Empty;
        public string DataType { get; set; } = string.Empty;
        public string? Format { get; set; }
        public bool IsVisible { get; set; } = true;
        public int Order { get; set; }
        public string? AggregateFunction { get; set; }
    }

    public class ReportTemplateDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public List<string> DataSources { get; set; } = new();
        public Dictionary<string, object> DefaultFilters { get; set; } = new();
        public string PreviewImageUrl { get; set; } = string.Empty;
    }

    public class CreateDashboardRequestDto
    {
        public Guid TenantId { get; set; }
        public Guid UserId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public Dictionary<string, object> Layout { get; set; } = new();
        public List<DashboardWidgetDto> Widgets { get; set; } = new();
        public bool IsPublic { get; set; }
        public int RefreshInterval { get; set; } = 300; // 5 minutes default
    }

    public class UpdateDashboardRequestDto
    {
        public string? Name { get; set; }
        public string? Description { get; set; }
        public Dictionary<string, object>? Layout { get; set; }
        public List<DashboardWidgetDto>? Widgets { get; set; }
        public bool? IsPublic { get; set; }
        public int? RefreshInterval { get; set; }
    }

    public class DashboardDto
    {
        public Guid Id { get; set; }
        public Guid TenantId { get; set; }
        public Guid UserId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public Dictionary<string, object> Layout { get; set; } = new();
        public List<DashboardWidgetDto> Widgets { get; set; } = new();
        public bool IsPublic { get; set; }
        public int RefreshInterval { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class DashboardWidgetDto
    {
        public string Id { get; set; } = string.Empty;
        public string WidgetType { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public Dictionary<string, object> Configuration { get; set; } = new();
        public Dictionary<string, object> Position { get; set; } = new();
        public Dictionary<string, object> Size { get; set; } = new();
    }

    public class WidgetDto
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public Dictionary<string, object> ConfigurationSchema { get; set; } = new();
        public string PreviewImageUrl { get; set; } = string.Empty;
    }

    public class ChartConfigurationDto
    {
        public string ChartType { get; set; } = string.Empty;
        public string DataSource { get; set; } = string.Empty;
        public Dictionary<string, object> Filters { get; set; } = new();
        public string XAxis { get; set; } = string.Empty;
        public string YAxis { get; set; } = string.Empty;
        public string? GroupBy { get; set; }
        public string? AggregateFunction { get; set; }
    }

    public class ChartDataDto
    {
        public string ChartType { get; set; } = string.Empty;
        public List<Dictionary<string, object>> Data { get; set; } = new();
        public Dictionary<string, object> Configuration { get; set; } = new();
        public DateTime GeneratedAt { get; set; }
    }

    public class ChartTypeDto
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public List<string> SupportedDataTypes { get; set; } = new();
        public Dictionary<string, object> ConfigurationSchema { get; set; } = new();
    }

    public class DrillDownDataDto
    {
        public string Level { get; set; } = string.Empty;
        public List<Dictionary<string, object>> Data { get; set; } = new();
        public Dictionary<string, object> Filters { get; set; } = new();
    }

    public class KPIDto
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public object Value { get; set; } = new();
        public object? Target { get; set; }
        public string Unit { get; set; } = string.Empty;
        public string Trend { get; set; } = string.Empty;
        public double? ChangePercentage { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime CalculatedAt { get; set; }
    }

    public class CreateKPIRequestDto
    {
        public Guid TenantId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Formula { get; set; } = string.Empty;
        public object? Target { get; set; }
        public string Unit { get; set; } = string.Empty;
        public Dictionary<string, object> Configuration { get; set; } = new();
    }

    public class KPITrendDto
    {
        public DateTime Date { get; set; }
        public object Value { get; set; } = new();
        public object? Target { get; set; }
    }

    public class KPIBenchmarkDto
    {
        public string Industry { get; set; } = string.Empty;
        public string CompanySize { get; set; } = string.Empty;
        public Dictionary<string, object> Benchmarks { get; set; } = new();
        public DateTime LastUpdated { get; set; }
    }

    public class ScheduleReportRequestDto
    {
        public Guid TenantId { get; set; }
        public Guid ReportId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string CronExpression { get; set; } = string.Empty;
        public List<string> Recipients { get; set; } = new();
        public string Format { get; set; } = "PDF";
        public Dictionary<string, object> Parameters { get; set; } = new();
        public bool IsActive { get; set; } = true;
    }

    public class ScheduledReportDto
    {
        public Guid Id { get; set; }
        public Guid TenantId { get; set; }
        public Guid ReportId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string CronExpression { get; set; } = string.Empty;
        public List<string> Recipients { get; set; } = new();
        public string Format { get; set; } = string.Empty;
        public Dictionary<string, object> Parameters { get; set; } = new();
        public bool IsActive { get; set; }
        public DateTime? LastExecuted { get; set; }
        public DateTime? NextExecution { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class ReportExecutionResultDto
    {
        public Guid ExecutionId { get; set; }
        public bool Success { get; set; }
        public string? ErrorMessage { get; set; }
        public int? RowCount { get; set; }
        public long ExecutionTimeMs { get; set; }
        public DateTime ExecutedAt { get; set; }
        public string? OutputPath { get; set; }
    }

    public class AdvancedReportRequestDto
    {
        public Guid TenantId { get; set; }
        public string ReportType { get; set; } = string.Empty;
        public Dictionary<string, object> Parameters { get; set; } = new();
        public string Format { get; set; } = "PDF";
        public Dictionary<string, object> Formatting { get; set; } = new();
    }

    public class ReportExecutionHistoryDto
    {
        public Guid Id { get; set; }
        public DateTime ExecutedAt { get; set; }
        public Dictionary<string, object> Parameters { get; set; } = new();
        public int RowCount { get; set; }
        public long ExecutionTimeMs { get; set; }
        public bool Success { get; set; }
        public string? ErrorMessage { get; set; }
    }

    public class ExportRequestDto
    {
        public Guid TenantId { get; set; }
        public string DataSource { get; set; } = string.Empty;
        public Dictionary<string, object> Filters { get; set; } = new();
        public List<string> Columns { get; set; } = new();
        public string Format { get; set; } = string.Empty;
        public Dictionary<string, object> Options { get; set; } = new();
    }

    public class ExportJobDto
    {
        public Guid Id { get; set; }
        public string Status { get; set; } = string.Empty;
        public int Progress { get; set; }
        public string? DownloadUrl { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public string? ErrorMessage { get; set; }
    }
}

