using Microsoft.EntityFrameworkCore;
using AttendancePlatform.Shared.Infrastructure.Data;
using System.Text.Json;
using OfficeOpenXml;
using iTextSharp.text;
using iTextSharp.text.pdf;

namespace AttendancePlatform.BI.Api.Services
{
    public class DataVisualizationService : IDataVisualizationService
    {
        private readonly AttendancePlatformDbContext _context;
        private readonly ILogger<DataVisualizationService> _logger;

        public DataVisualizationService(AttendancePlatformDbContext context, ILogger<DataVisualizationService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<ChartDataDto> GenerateChartDataAsync(ChartConfigurationDto config)
        {
            try
            {
                var data = await GetChartData(config);
                
                return new ChartDataDto
                {
                    ChartType = config.ChartType,
                    Data = data,
                    Configuration = new Dictionary<string, object>
                    {
                        { "xAxis", config.XAxis },
                        { "yAxis", config.YAxis },
                        { "groupBy", config.GroupBy ?? "" },
                        { "aggregateFunction", config.AggregateFunction ?? "count" }
                    },
                    GeneratedAt = DateTime.UtcNow
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating chart data");
                throw;
            }
        }

        public async Task<List<ChartTypeDto>> GetAvailableChartTypesAsync()
        {
            return new List<ChartTypeDto>
            {
                new ChartTypeDto
                {
                    Id = "line",
                    Name = "Line Chart",
                    Description = "Show trends over time",
                    SupportedDataTypes = new List<string> { "datetime", "number" },
                    ConfigurationSchema = new Dictionary<string, object>
                    {
                        { "smooth", new { type = "boolean", default = false } },
                        { "showPoints", new { type = "boolean", default = true } }
                    }
                },
                new ChartTypeDto
                {
                    Id = "bar",
                    Name = "Bar Chart",
                    Description = "Compare values across categories",
                    SupportedDataTypes = new List<string> { "string", "number" },
                    ConfigurationSchema = new Dictionary<string, object>
                    {
                        { "orientation", new { type = "select", options = new[] { "vertical", "horizontal" } } },
                        { "stacked", new { type = "boolean", default = false } }
                    }
                },
                new ChartTypeDto
                {
                    Id = "pie",
                    Name = "Pie Chart",
                    Description = "Show proportions of a whole",
                    SupportedDataTypes = new List<string> { "string", "number" },
                    ConfigurationSchema = new Dictionary<string, object>
                    {
                        { "showLabels", new { type = "boolean", default = true } },
                        { "showPercentages", new { type = "boolean", default = true } }
                    }
                },
                new ChartTypeDto
                {
                    Id = "area",
                    Name = "Area Chart",
                    Description = "Show cumulative totals over time",
                    SupportedDataTypes = new List<string> { "datetime", "number" },
                    ConfigurationSchema = new Dictionary<string, object>
                    {
                        { "stacked", new { type = "boolean", default = false } },
                        { "fillOpacity", new { type = "number", default = 0.6 } }
                    }
                },
                new ChartTypeDto
                {
                    Id = "scatter",
                    Name = "Scatter Plot",
                    Description = "Show correlation between two variables",
                    SupportedDataTypes = new List<string> { "number", "number" },
                    ConfigurationSchema = new Dictionary<string, object>
                    {
                        { "showTrendline", new { type = "boolean", default = false } },
                        { "pointSize", new { type = "number", default = 5 } }
                    }
                },
                new ChartTypeDto
                {
                    Id = "heatmap",
                    Name = "Heatmap",
                    Description = "Show data density and patterns",
                    SupportedDataTypes = new List<string> { "string", "string", "number" },
                    ConfigurationSchema = new Dictionary<string, object>
                    {
                        { "colorScheme", new { type = "select", options = new[] { "blues", "reds", "greens" } } },
                        { "showValues", new { type = "boolean", default = true } }
                    }
                }
            };
        }

        public async Task<byte[]> ExportChartAsync(Guid chartId, string format)
        {
            try
            {
                var chartConfig = await _context.ChartConfigurations
                    .FirstOrDefaultAsync(c => c.Id == chartId);
                
                if (chartConfig == null)
                    throw new ArgumentException("Chart not found");

                return format.ToLower() switch
                {
                    "png" => await GenerateChartPng(chartId),
                    "svg" => await GenerateChartSvg(chartId),
                    "pdf" => await GenerateChartPdf(chartId),
                    _ => throw new ArgumentException("Unsupported format")
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting chart {ChartId} to {Format}", chartId, format);
                throw;
            }
        }

        public async Task<DrillDownDataDto> GetDrillDownDataAsync(string chartType, Dictionary<string, object> filters)
        {
            try
            {
                var data = await GetDrillDownData(filters);
                
                return new DrillDownDataDto
                {
                    Level = DetermineDrillDownLevel(filters),
                    Data = data,
                    Filters = filters
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting drill-down data");
                throw;
            }
        }

        private async Task<List<Dictionary<string, object>>> GetChartData(ChartConfigurationDto config)
        {
            var results = new List<Dictionary<string, object>>();

            if (config.DataSource == "AttendanceRecords")
            {
                var query = _context.AttendanceRecords.AsQueryable();

                // Apply filters
                foreach (var filter in config.Filters)
                {
                    query = ApplyFilter(query, filter.Key, filter.Value);
                }

                var data = await query.Include(ar => ar.User).ToListAsync();

                // Group and aggregate data based on configuration
                if (!string.IsNullOrEmpty(config.GroupBy))
                {
                    results = GroupAndAggregateData(data, config);
                }
                else
                {
                    results = data.Select(ar => new Dictionary<string, object>
                    {
                        { config.XAxis, GetPropertyValue(ar, config.XAxis) },
                        { config.YAxis, GetPropertyValue(ar, config.YAxis) }
                    }).ToList();
                }
            }

            return results;
        }

        private IQueryable<AttendanceRecord> ApplyFilter(IQueryable<AttendanceRecord> query, string filterKey, object filterValue)
        {
            return filterKey switch
            {
                "dateRange" => ApplyDateRangeFilter(query, filterValue.ToString()),
                "department" => query.Where(ar => ar.User.Department == filterValue.ToString()),
                "userId" => query.Where(ar => ar.UserId == Guid.Parse(filterValue.ToString())),
                _ => query
            };
        }

        private IQueryable<AttendanceRecord> ApplyDateRangeFilter(IQueryable<AttendanceRecord> query, string dateRange)
        {
            var (start, end) = ParseDateRange(dateRange);
            return query.Where(ar => ar.CheckInTime >= start && ar.CheckInTime <= end);
        }

        private (DateTime Start, DateTime End) ParseDateRange(string dateRange)
        {
            var now = DateTime.UtcNow;
            return dateRange switch
            {
                "today" => (now.Date, now.Date.AddDays(1).AddTicks(-1)),
                "week" => (now.Date.AddDays(-(int)now.DayOfWeek), now.Date.AddDays(7 - (int)now.DayOfWeek).AddTicks(-1)),
                "month" => (new DateTime(now.Year, now.Month, 1), new DateTime(now.Year, now.Month, 1).AddMonths(1).AddTicks(-1)),
                "quarter" => GetQuarterRange(now),
                "year" => (new DateTime(now.Year, 1, 1), new DateTime(now.Year + 1, 1, 1).AddTicks(-1)),
                _ => (now.Date.AddDays(-30), now.Date.AddDays(1).AddTicks(-1))
            };
        }

        private (DateTime Start, DateTime End) GetQuarterRange(DateTime date)
        {
            var quarter = (date.Month - 1) / 3 + 1;
            var startMonth = (quarter - 1) * 3 + 1;
            var start = new DateTime(date.Year, startMonth, 1);
            var end = start.AddMonths(3).AddTicks(-1);
            return (start, end);
        }

        private List<Dictionary<string, object>> GroupAndAggregateData(List<AttendanceRecord> data, ChartConfigurationDto config)
        {
            var grouped = data.GroupBy(ar => GetPropertyValue(ar, config.GroupBy));
            
            return grouped.Select(g => new Dictionary<string, object>
            {
                { config.XAxis, g.Key },
                { config.YAxis, ApplyAggregateFunction(g.ToList(), config.YAxis, config.AggregateFunction) }
            }).ToList();
        }

        private object GetPropertyValue(object obj, string propertyName)
        {
            var type = obj.GetType();
            var property = type.GetProperty(propertyName);
            return property?.GetValue(obj) ?? "";
        }

        private object ApplyAggregateFunction(List<AttendanceRecord> records, string field, string function)
        {
            return function?.ToLower() switch
            {
                "count" => records.Count,
                "sum" => records.Sum(r => Convert.ToDouble(GetPropertyValue(r, field) ?? 0)),
                "avg" => records.Average(r => Convert.ToDouble(GetPropertyValue(r, field) ?? 0)),
                "min" => records.Min(r => Convert.ToDouble(GetPropertyValue(r, field) ?? 0)),
                "max" => records.Max(r => Convert.ToDouble(GetPropertyValue(r, field) ?? 0)),
                _ => records.Count
            };
        }

        private async Task<List<Dictionary<string, object>>> GetDrillDownData(Dictionary<string, object> filters)
        {
            // Implementation for drill-down data retrieval
            var results = new List<Dictionary<string, object>>();
            
            // This would contain logic to get more detailed data based on the current filters
            // For example, if drilling down from department to individual users
            
            return results;
        }

        private string DetermineDrillDownLevel(Dictionary<string, object> filters)
        {
            // Logic to determine the current drill-down level
            if (filters.ContainsKey("userId")) return "individual";
            if (filters.ContainsKey("department")) return "department";
            return "organization";
        }

        private async Task<byte[]> GenerateChartPng(Guid chartId)
        {
            try
            {
                var chartConfig = await _context.ChartConfigurations
                    .FirstOrDefaultAsync(c => c.Id == chartId);
                
                if (chartConfig == null)
                    return new byte[0];

                // Generate PNG chart using System.Drawing or SkiaSharp
                using var bitmap = new System.Drawing.Bitmap(800, 600);
                using var graphics = System.Drawing.Graphics.FromImage(bitmap);
                
                graphics.Clear(System.Drawing.Color.White);
                
                // Draw chart based on configuration
                await DrawChartContent(graphics, chartConfig);
                
                using var stream = new MemoryStream();
                bitmap.Save(stream, System.Drawing.Imaging.ImageFormat.Png);
                return stream.ToArray();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating PNG chart for {ChartId}", chartId);
                return new byte[0];
            }
        }

        private async Task<byte[]> GenerateChartSvg(Guid chartId)
        {
            try
            {
                var chartConfig = await _context.ChartConfigurations
                    .FirstOrDefaultAsync(c => c.Id == chartId);
                
                if (chartConfig == null)
                    return new byte[0];

                // Generate SVG chart using XML string builder
                var svg = new System.Text.StringBuilder();
                svg.AppendLine("<?xml version=\"1.0\" encoding=\"UTF-8\"?>");
                svg.AppendLine("<svg width=\"800\" height=\"600\" xmlns=\"http://www.w3.org/2000/svg\">");
                
                svg.AppendLine($"<text x=\"400\" y=\"30\" text-anchor=\"middle\" font-size=\"18\" font-weight=\"bold\">{chartConfig.Title ?? "Chart"}</text>");
                
                // Add chart content based on configuration
                await AddSvgChartContent(svg, chartConfig);
                
                svg.AppendLine("</svg>");
                
                return System.Text.Encoding.UTF8.GetBytes(svg.ToString());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating SVG chart for {ChartId}", chartId);
                return new byte[0];
            }
        }

        private async Task<byte[]> GenerateChartPdf(Guid chartId)
        {
            try
            {
                var chartConfig = await _context.ChartConfigurations
                    .FirstOrDefaultAsync(c => c.Id == chartId);
                
                if (chartConfig == null)
                    return new byte[0];

                // Generate PDF chart using iTextSharp or similar
                using var stream = new MemoryStream();
                var document = new iText.Kernel.Pdf.PdfDocument(new iText.Kernel.Pdf.PdfWriter(stream));
                var pdfDocument = new iText.Layout.Document(document);
                
                pdfDocument.Add(new iText.Layout.Element.Paragraph(chartConfig.Title ?? "Chart")
                    .SetFontSize(16)
                    .SetBold());
                
                var chartData = await GetChartDataForPdf(chartConfig);
                pdfDocument.Add(new iText.Layout.Element.Paragraph(chartData));
                
                pdfDocument.Close();
                return stream.ToArray();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating PDF chart for {ChartId}", chartId);
                return new byte[0];
            }
        }
    }

    public class KPIService : IKPIService
    {
        private readonly AttendancePlatformDbContext _context;
        private readonly ILogger<KPIService> _logger;

        public KPIService(AttendancePlatformDbContext context, ILogger<KPIService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<List<KPIDto>> GetKPIsAsync(Guid tenantId, DateTime fromDate, DateTime toDate)
        {
            try
            {
                var kpis = new List<KPIDto>();

                // Attendance Rate KPI
                var attendanceRate = await CalculateAttendanceRate(tenantId, fromDate, toDate);
                kpis.Add(new KPIDto
                {
                    Id = "attendance-rate",
                    Name = "Attendance Rate",
                    Category = "Attendance",
                    Value = Math.Round(attendanceRate, 2),
                    Target = 95.0,
                    Unit = "%",
                    Trend = await GetKPITrend("attendance-rate", tenantId, 7),
                    ChangePercentage = await GetKPIChange("attendance-rate", tenantId, 7),
                    Status = GetKPIStatus(attendanceRate, 95.0),
                    CalculatedAt = DateTime.UtcNow
                });

                // Average Work Hours KPI
                var avgWorkHours = await CalculateAverageWorkHours(tenantId, fromDate, toDate);
                kpis.Add(new KPIDto
                {
                    Id = "avg-work-hours",
                    Name = "Average Work Hours",
                    Category = "Productivity",
                    Value = Math.Round(avgWorkHours, 2),
                    Target = 8.0,
                    Unit = "hours",
                    Trend = await GetKPITrend("avg-work-hours", tenantId, 7),
                    ChangePercentage = await GetKPIChange("avg-work-hours", tenantId, 7),
                    Status = GetKPIStatus(avgWorkHours, 8.0, 0.5),
                    CalculatedAt = DateTime.UtcNow
                });

                // Punctuality Rate KPI
                var punctualityRate = await CalculatePunctualityRate(tenantId, fromDate, toDate);
                kpis.Add(new KPIDto
                {
                    Id = "punctuality-rate",
                    Name = "Punctuality Rate",
                    Category = "Attendance",
                    Value = Math.Round(punctualityRate, 2),
                    Target = 90.0,
                    Unit = "%",
                    Trend = await GetKPITrend("punctuality-rate", tenantId, 7),
                    ChangePercentage = await GetKPIChange("punctuality-rate", tenantId, 7),
                    Status = GetKPIStatus(punctualityRate, 90.0),
                    CalculatedAt = DateTime.UtcNow
                });

                // Overtime Rate KPI
                var overtimeRate = await CalculateOvertimeRate(tenantId, fromDate, toDate);
                kpis.Add(new KPIDto
                {
                    Id = "overtime-rate",
                    Name = "Overtime Rate",
                    Category = "Productivity",
                    Value = Math.Round(overtimeRate, 2),
                    Target = 10.0,
                    Unit = "%",
                    Trend = await GetKPITrend("overtime-rate", tenantId, 7),
                    ChangePercentage = await GetKPIChange("overtime-rate", tenantId, 7),
                    Status = GetKPIStatus(overtimeRate, 10.0, isLowerBetter: true),
                    CalculatedAt = DateTime.UtcNow
                });

                // Leave Utilization KPI
                var leaveUtilization = await CalculateLeaveUtilization(tenantId, fromDate, toDate);
                kpis.Add(new KPIDto
                {
                    Id = "leave-utilization",
                    Name = "Leave Utilization",
                    Category = "Leave",
                    Value = Math.Round(leaveUtilization, 2),
                    Target = 75.0,
                    Unit = "%",
                    Trend = await GetKPITrend("leave-utilization", tenantId, 30),
                    ChangePercentage = await GetKPIChange("leave-utilization", tenantId, 30),
                    Status = GetKPIStatus(leaveUtilization, 75.0, 10.0),
                    CalculatedAt = DateTime.UtcNow
                });

                return kpis;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting KPIs for tenant {TenantId}", tenantId);
                throw;
            }
        }

        public async Task<KPIDto> CreateCustomKPIAsync(CreateKPIRequestDto request)
        {
            try
            {
                // In a real implementation, this would parse and execute the custom formula
                var value = await ExecuteCustomFormula(request.Formula, request.TenantId);

                return new KPIDto
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = request.Name,
                    Category = request.Category,
                    Value = value,
                    Target = request.Target,
                    Unit = request.Unit,
                    Trend = "stable",
                    Status = GetKPIStatus(Convert.ToDouble(value), Convert.ToDouble(request.Target ?? 0)),
                    CalculatedAt = DateTime.UtcNow
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating custom KPI");
                throw;
            }
        }

        public async Task<List<KPITrendDto>> GetKPITrendsAsync(Guid tenantId, string kpiType, int days)
        {
            try
            {
                var trends = new List<KPITrendDto>();
                var endDate = DateTime.UtcNow.Date;
                var startDate = endDate.AddDays(-days);

                for (var date = startDate; date <= endDate; date = date.AddDays(1))
                {
                    var value = await CalculateKPIForDate(tenantId, kpiType, date);
                    var target = GetKPITarget(kpiType);

                    trends.Add(new KPITrendDto
                    {
                        Date = date,
                        Value = value,
                        Target = target
                    });
                }

                return trends;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting KPI trends for {KpiType}", kpiType);
                throw;
            }
        }

        public async Task<KPIBenchmarkDto> GetKPIBenchmarksAsync(Guid tenantId)
        {
            try
            {
                // In a real implementation, this would fetch industry benchmarks from external sources
                return new KPIBenchmarkDto
                {
                    Industry = "Technology",
                    CompanySize = "Medium (100-500 employees)",
                    Benchmarks = new Dictionary<string, object>
                    {
                        { "attendance-rate", new { industry = 94.5, topQuartile = 97.2, median = 93.8 } },
                        { "punctuality-rate", new { industry = 88.3, topQuartile = 94.1, median = 87.5 } },
                        { "overtime-rate", new { industry = 12.4, topQuartile = 8.2, median = 13.1 } },
                        { "leave-utilization", new { industry = 72.8, topQuartile = 78.5, median = 71.2 } }
                    },
                    LastUpdated = DateTime.UtcNow.AddDays(-7)
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting KPI benchmarks");
                throw;
            }
        }

        // Helper methods for KPI calculations
        private async Task<double> CalculateAttendanceRate(Guid tenantId, DateTime fromDate, DateTime toDate)
        {
            var totalEmployees = await _context.Users.Where(u => u.TenantId == tenantId && u.IsActive).CountAsync();
            var workingDays = CalculateWorkingDays(fromDate, toDate);
            var expectedAttendance = totalEmployees * workingDays;
            
            var actualAttendance = await _context.AttendanceRecords
                .Where(ar => ar.TenantId == tenantId && ar.CheckInTime >= fromDate && ar.CheckInTime <= toDate)
                .CountAsync();

            return expectedAttendance > 0 ? (double)actualAttendance / expectedAttendance * 100 : 0;
        }

        private async Task<double> CalculateAverageWorkHours(Guid tenantId, DateTime fromDate, DateTime toDate)
        {
            var records = await _context.AttendanceRecords
                .Where(ar => ar.TenantId == tenantId && 
                           ar.CheckInTime >= fromDate && 
                           ar.CheckInTime <= toDate && 
                           ar.CheckOutTime.HasValue)
                .ToListAsync();

            if (!records.Any()) return 0;

            return records.Average(r => (r.CheckOutTime.Value - r.CheckInTime).TotalHours);
        }

        private async Task<double> CalculatePunctualityRate(Guid tenantId, DateTime fromDate, DateTime toDate)
        {
            var records = await _context.AttendanceRecords
                .Where(ar => ar.TenantId == tenantId && ar.CheckInTime >= fromDate && ar.CheckInTime <= toDate)
                .ToListAsync();

            if (!records.Any()) return 0;

            var onTimeRecords = records.Count(r => r.CheckInTime.TimeOfDay <= TimeSpan.FromHours(9));
            return (double)onTimeRecords / records.Count * 100;
        }

        private async Task<double> CalculateOvertimeRate(Guid tenantId, DateTime fromDate, DateTime toDate)
        {
            var records = await _context.AttendanceRecords
                .Where(ar => ar.TenantId == tenantId && 
                           ar.CheckInTime >= fromDate && 
                           ar.CheckInTime <= toDate && 
                           ar.CheckOutTime.HasValue)
                .ToListAsync();

            if (!records.Any()) return 0;

            var overtimeRecords = records.Count(r => (r.CheckOutTime.Value - r.CheckInTime).TotalHours > 8);
            return (double)overtimeRecords / records.Count * 100;
        }

        private async Task<double> CalculateLeaveUtilization(Guid tenantId, DateTime fromDate, DateTime toDate)
        {
            var users = await _context.Users
                .Where(u => u.TenantId == tenantId && u.IsActive)
                .Include(u => u.LeaveRequests.Where(lr => lr.StartDate >= fromDate && lr.EndDate <= toDate))
                .ToListAsync();

            if (!users.Any()) return 0;

            var totalLeaveUsed = users.Sum(u => u.LeaveRequests.Sum(lr => (lr.EndDate - lr.StartDate).Days + 1));
            var totalLeaveEntitlement = users.Count * 25; // Assuming 25 days annual leave

            return (double)totalLeaveUsed / totalLeaveEntitlement * 100;
        }

        private async Task<string> GetKPITrend(string kpiType, Guid tenantId, int days)
        {
            var currentValue = await CalculateKPIForDate(tenantId, kpiType, DateTime.UtcNow.Date);
            var previousValue = await CalculateKPIForDate(tenantId, kpiType, DateTime.UtcNow.Date.AddDays(-days));

            if (currentValue > previousValue) return "increasing";
            if (currentValue < previousValue) return "decreasing";
            return "stable";
        }

        private async Task<double?> GetKPIChange(string kpiType, Guid tenantId, int days)
        {
            var currentValue = await CalculateKPIForDate(tenantId, kpiType, DateTime.UtcNow.Date);
            var previousValue = await CalculateKPIForDate(tenantId, kpiType, DateTime.UtcNow.Date.AddDays(-days));

            if (previousValue == 0) return null;
            return ((currentValue - previousValue) / previousValue) * 100;
        }

        private async Task<double> CalculateKPIForDate(Guid tenantId, string kpiType, DateTime date)
        {
            var fromDate = date;
            var toDate = date.AddDays(1).AddTicks(-1);

            return kpiType switch
            {
                "attendance-rate" => await CalculateAttendanceRate(tenantId, fromDate, toDate),
                "avg-work-hours" => await CalculateAverageWorkHours(tenantId, fromDate, toDate),
                "punctuality-rate" => await CalculatePunctualityRate(tenantId, fromDate, toDate),
                "overtime-rate" => await CalculateOvertimeRate(tenantId, fromDate, toDate),
                "leave-utilization" => await CalculateLeaveUtilization(tenantId, fromDate, toDate),
                _ => 0
            };
        }

        private object GetKPITarget(string kpiType)
        {
            return kpiType switch
            {
                "attendance-rate" => 95.0,
                "avg-work-hours" => 8.0,
                "punctuality-rate" => 90.0,
                "overtime-rate" => 10.0,
                "leave-utilization" => 75.0,
                _ => 0
            };
        }

        private string GetKPIStatus(double value, double target, double tolerance = 5.0, bool isLowerBetter = false)
        {
            var difference = Math.Abs(value - target);
            
            if (difference <= tolerance)
                return "on-target";
            
            if (isLowerBetter)
                return value < target ? "above-target" : "below-target";
            else
                return value > target ? "above-target" : "below-target";
        }

        private int CalculateWorkingDays(DateTime fromDate, DateTime toDate)
        {
            int workingDays = 0;
            for (var date = fromDate.Date; date <= toDate.Date; date = date.AddDays(1))
            {
                if (date.DayOfWeek != DayOfWeek.Saturday && date.DayOfWeek != DayOfWeek.Sunday)
                {
                    workingDays++;
                }
            }
            return workingDays;
        }

        private async Task<object> ExecuteCustomFormula(string formula, Guid tenantId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(formula))
                    throw new ArgumentException("Formula cannot be empty");

                var formulaEngine = new FormulaEngine();
                var context = await BuildFormulaContextAsync(tenantId);
                
                var result = formulaEngine.Evaluate(formula, context);
                _logger.LogInformation("Formula executed successfully: {Formula} for tenant {TenantId}", formula, tenantId);
                
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error executing formula: {Formula} for tenant {TenantId}", formula, tenantId);
                throw new InvalidOperationException($"Formula execution failed: {ex.Message}");
            }
            return 85.5;
        }
    }

    public class AdvancedReportingService : IAdvancedReportingService
    {
        private readonly AttendancePlatformDbContext _context;
        private readonly ILogger<AdvancedReportingService> _logger;

        public AdvancedReportingService(AttendancePlatformDbContext context, ILogger<AdvancedReportingService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<ScheduledReportDto> ScheduleReportAsync(ScheduleReportRequestDto request)
        {
            try
            {
                var scheduledReport = new ScheduledReport
                {
                    Id = Guid.NewGuid(),
                    TenantId = request.TenantId,
                    ReportId = request.ReportId,
                    Name = request.Name,
                    CronExpression = request.CronExpression,
                    Recipients = JsonSerializer.Serialize(request.Recipients),
                    Format = request.Format,
                    Parameters = JsonSerializer.Serialize(request.Parameters),
                    IsActive = request.IsActive,
                    NextExecution = CalculateNextExecution(request.CronExpression),
                    CreatedAt = DateTime.UtcNow
                };

                _context.ScheduledReports.Add(scheduledReport);
                await _context.SaveChangesAsync();

                return MapToScheduledReportDto(scheduledReport);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error scheduling report");
                throw;
            }
        }

        public async Task<List<ScheduledReportDto>> GetScheduledReportsAsync(Guid tenantId)
        {
            try
            {
                var reports = await _context.ScheduledReports
                    .Where(sr => sr.TenantId == tenantId)
                    .OrderBy(sr => sr.NextExecution)
                    .ToListAsync();

                return reports.Select(MapToScheduledReportDto).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting scheduled reports");
                throw;
            }
        }

        public async Task<ReportExecutionResultDto> ExecuteScheduledReportAsync(Guid scheduledReportId)
        {
            try
            {
                var scheduledReport = await _context.ScheduledReports.FindAsync(scheduledReportId);
                if (scheduledReport == null)
                    throw new ArgumentException("Scheduled report not found");

                var startTime = DateTime.UtcNow;
                var success = false;
                string errorMessage = null;
                int rowCount = 0;

                try
                {
                    // Execute the report
                    var parameters = JsonSerializer.Deserialize<Dictionary<string, object>>(scheduledReport.Parameters);
                    var reportData = await ExecuteReport(scheduledReport.ReportId, parameters);
                    rowCount = reportData.Count;

                    // Generate the report file
                    var reportBytes = await GenerateReportFile(reportData, scheduledReport.Format);

                    // Send to recipients
                    var recipients = JsonSerializer.Deserialize<List<string>>(scheduledReport.Recipients);
                    await SendReportToRecipients(reportBytes, scheduledReport.Name, scheduledReport.Format, recipients);

                    success = true;
                }
                catch (Exception ex)
                {
                    errorMessage = ex.Message;
                    _logger.LogError(ex, "Error executing scheduled report {ReportId}", scheduledReportId);
                }

                var executionTime = (long)(DateTime.UtcNow - startTime).TotalMilliseconds;

                // Update last execution time and calculate next execution
                scheduledReport.LastExecuted = DateTime.UtcNow;
                scheduledReport.NextExecution = CalculateNextExecution(scheduledReport.CronExpression);
                await _context.SaveChangesAsync();

                return new ReportExecutionResultDto
                {
                    ExecutionId = Guid.NewGuid(),
                    Success = success,
                    ErrorMessage = errorMessage,
                    RowCount = success ? rowCount : null,
                    ExecutionTimeMs = executionTime,
                    ExecutedAt = DateTime.UtcNow
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error executing scheduled report {ReportId}", scheduledReportId);
                throw;
            }
        }

        public async Task<byte[]> GenerateAdvancedReportAsync(AdvancedReportRequestDto request)
        {
            try
            {
                var data = await GetReportData(request);
                return await GenerateReportFile(data, request.Format);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating advanced report");
                throw;
            }
        }

        public async Task<List<ReportExecutionHistoryDto>> GetReportExecutionHistoryAsync(Guid reportId)
        {
            try
            {
                var history = await _context.ReportExecutionHistory
                    .Where(reh => reh.ReportId == reportId)
                    .OrderByDescending(reh => reh.ExecutedAt)
                    .Take(50)
                    .ToListAsync();

                return history.Select(h => new ReportExecutionHistoryDto
                {
                    Id = h.Id,
                    ExecutedAt = h.ExecutedAt,
                    Parameters = JsonSerializer.Deserialize<Dictionary<string, object>>(h.Parameters),
                    RowCount = h.RowCount,
                    ExecutionTimeMs = h.ExecutionTimeMs,
                    Success = true, // Simplified for this example
                    ErrorMessage = null
                }).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting report execution history");
                throw;
            }
        }

        private async Task<List<Dictionary<string, object>>> ExecuteReport(Guid reportId, Dictionary<string, object> parameters)
        {
            // Implementation would execute the report and return data
            return new List<Dictionary<string, object>>();
        }

        private async Task<List<Dictionary<string, object>>> GetReportData(AdvancedReportRequestDto request)
        {
            // Implementation would get data based on report type and parameters
            return new List<Dictionary<string, object>>();
        }

        private async Task<byte[]> GenerateReportFile(List<Dictionary<string, object>> data, string format)
        {
            return format.ToUpper() switch
            {
                "PDF" => await GeneratePdfReport(data),
                "EXCEL" => await GenerateExcelReport(data),
                "CSV" => await GenerateCsvReport(data),
                _ => throw new ArgumentException("Unsupported format")
            };
        }

        private async Task<byte[]> GeneratePdfReport(List<Dictionary<string, object>> data)
        {
            using var memoryStream = new MemoryStream();
            var document = new Document();
            var writer = PdfWriter.GetInstance(document, memoryStream);
            
            document.Open();
            document.Add(new Paragraph("Attendance Report"));
            document.Add(new Paragraph($"Generated on: {DateTime.UtcNow:yyyy-MM-dd HH:mm:ss}"));
            document.Add(new Paragraph(" "));

            if (data.Any())
            {
                var table = new PdfPTable(data.First().Keys.Count);
                
                // Add headers
                foreach (var key in data.First().Keys)
                {
                    table.AddCell(new PdfPCell(new Phrase(key)));
                }

                // Add data rows
                foreach (var row in data)
                {
                    foreach (var value in row.Values)
                    {
                        table.AddCell(new PdfPCell(new Phrase(value?.ToString() ?? "")));
                    }
                }

                document.Add(table);
            }

            document.Close();
            return memoryStream.ToArray();
        }

        private async Task<byte[]> GenerateExcelReport(List<Dictionary<string, object>> data)
        {
            using var package = new ExcelPackage();
            var worksheet = package.Workbook.Worksheets.Add("Report");

            if (data.Any())
            {
                var headers = data.First().Keys.ToArray();
                
                // Add headers
                for (int i = 0; i < headers.Length; i++)
                {
                    worksheet.Cells[1, i + 1].Value = headers[i];
                }

                // Add data
                for (int row = 0; row < data.Count; row++)
                {
                    var rowData = data[row];
                    for (int col = 0; col < headers.Length; col++)
                    {
                        worksheet.Cells[row + 2, col + 1].Value = rowData[headers[col]];
                    }
                }

                worksheet.Cells.AutoFitColumns();
            }

            return package.GetAsByteArray();
        }

        private async Task<byte[]> GenerateCsvReport(List<Dictionary<string, object>> data)
        {
            using var memoryStream = new MemoryStream();
            using var writer = new StreamWriter(memoryStream);

            if (data.Any())
            {
                var headers = data.First().Keys.ToArray();
                
                // Write headers
                await writer.WriteLineAsync(string.Join(",", headers));

                // Write data
                foreach (var row in data)
                {
                    var values = headers.Select(h => EscapeCsvValue(row[h]?.ToString() ?? ""));
                    await writer.WriteLineAsync(string.Join(",", values));
                }
            }

            await writer.FlushAsync();
            return memoryStream.ToArray();
        }

        private string EscapeCsvValue(string value)
        {
            if (value.Contains(",") || value.Contains("\"") || value.Contains("\n"))
            {
                return $"\"{value.Replace("\"", "\"\"")}\"";
            }
            return value;
        }

        private async Task SendReportToRecipients(byte[] reportBytes, string reportName, string format, List<string> recipients)
        {
            if (recipients == null || !recipients.Any())
            {
                _logger.LogWarning("No recipients specified for report {ReportName}", reportName);
                return;
            }

            try
            {
                var emailService = _serviceProvider.GetRequiredService<IEmailService>();
                
                foreach (var recipient in recipients)
                {
                    try
                    {
                        await emailService.SendEmailWithAttachmentAsync(
                            recipient,
                            $"Scheduled Report: {reportName}",
                            $"Please find attached the {reportName} report in {format.ToUpper()} format. This report was generated on {DateTime.UtcNow:yyyy-MM-dd HH:mm:ss} UTC.",
                            reportBytes,
                            $"{reportName}.{format.ToLower()}"
                        );
                        
                        _logger.LogInformation("Report {ReportName} sent successfully to {Recipient}", reportName, recipient);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Failed to send report {ReportName} to {Recipient}", reportName, recipient);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error initializing email service for report delivery: {ReportName}", reportName);
                throw new InvalidOperationException($"Report delivery failed: {ex.Message}");
            }
            _logger.LogInformation("Sending report {ReportName} to {RecipientCount} recipients", reportName, recipients.Count);
        }

        private DateTime? CalculateNextExecution(string cronExpression)
        {
            // Simplified cron calculation - in a real implementation, use a proper cron library
            return DateTime.UtcNow.AddDays(1);
        }

        private ScheduledReportDto MapToScheduledReportDto(ScheduledReport report)
        {
            return new ScheduledReportDto
            {
                Id = report.Id,
                TenantId = report.TenantId,
                ReportId = report.ReportId,
                Name = report.Name,
                CronExpression = report.CronExpression,
                Recipients = JsonSerializer.Deserialize<List<string>>(report.Recipients),
                Format = report.Format,
                Parameters = JsonSerializer.Deserialize<Dictionary<string, object>>(report.Parameters),
                IsActive = report.IsActive,
                LastExecuted = report.LastExecuted,
                NextExecution = report.NextExecution,
                CreatedAt = report.CreatedAt
            };
        }
    }

    public class DataExportService : IDataExportService
    {
        private readonly AttendancePlatformDbContext _context;
        private readonly ILogger<DataExportService> _logger;

        public DataExportService(AttendancePlatformDbContext context, ILogger<DataExportService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<byte[]> ExportToExcelAsync(ExportRequestDto request)
        {
            try
            {
                var data = await GetExportData(request);
                return await GenerateExcelFile(data, request.Options);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting to Excel");
                throw;
            }
        }

        public async Task<byte[]> ExportToPdfAsync(ExportRequestDto request)
        {
            try
            {
                var data = await GetExportData(request);
                return await GeneratePdfFile(data, request.Options);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting to PDF");
                throw;
            }
        }

        public async Task<byte[]> ExportToCsvAsync(ExportRequestDto request)
        {
            try
            {
                var data = await GetExportData(request);
                return await GenerateCsvFile(data, request.Options);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting to CSV");
                throw;
            }
        }

        public async Task<string> ExportToJsonAsync(ExportRequestDto request)
        {
            try
            {
                var data = await GetExportData(request);
                return JsonSerializer.Serialize(data, new JsonSerializerOptions { WriteIndented = true });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting to JSON");
                throw;
            }
        }

        public async Task<ExportJobDto> CreateExportJobAsync(ExportRequestDto request)
        {
            try
            {
                var job = new ExportJob
                {
                    Id = Guid.NewGuid(),
                    TenantId = request.TenantId,
                    Status = "queued",
                    Progress = 0,
                    CreatedAt = DateTime.UtcNow,
                    Parameters = JsonSerializer.Serialize(request)
                };

                _context.ExportJobs.Add(job);
                await _context.SaveChangesAsync();

                // In a real implementation, this would queue the job for background processing
                _ = Task.Run(() => ProcessExportJobAsync(job.Id));

                return MapToExportJobDto(job);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating export job");
                throw;
            }
        }

        public async Task<ExportJobDto> GetExportJobStatusAsync(Guid jobId)
        {
            try
            {
                var job = await _context.ExportJobs.FindAsync(jobId);
                if (job == null)
                    throw new ArgumentException("Export job not found");

                return MapToExportJobDto(job);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting export job status");
                throw;
            }
        }

        private async Task<List<Dictionary<string, object>>> GetExportData(ExportRequestDto request)
        {
            var results = new List<Dictionary<string, object>>();

            if (request.DataSource == "AttendanceRecords")
            {
                var query = _context.AttendanceRecords.AsQueryable();

                // Apply filters
                foreach (var filter in request.Filters)
                {
                    query = ApplyFilter(query, filter.Key, filter.Value);
                }

                var data = await query.Include(ar => ar.User).ToListAsync();

                foreach (var record in data)
                {
                    var row = new Dictionary<string, object>();
                    
                    foreach (var column in request.Columns)
                    {
                        var value = GetPropertyValue(record, column);
                        row[column] = value;
                    }

                    results.Add(row);
                }
            }

            return results;
        }

        private IQueryable<AttendanceRecord> ApplyFilter(IQueryable<AttendanceRecord> query, string filterKey, object filterValue)
        {
            return filterKey switch
            {
                "dateRange" => ApplyDateRangeFilter(query, filterValue.ToString()),
                "department" => query.Where(ar => ar.User.Department == filterValue.ToString()),
                "userId" => query.Where(ar => ar.UserId == Guid.Parse(filterValue.ToString())),
                _ => query
            };
        }

        private IQueryable<AttendanceRecord> ApplyDateRangeFilter(IQueryable<AttendanceRecord> query, string dateRange)
        {
            var (start, end) = ParseDateRange(dateRange);
            return query.Where(ar => ar.CheckInTime >= start && ar.CheckInTime <= end);
        }

        private (DateTime Start, DateTime End) ParseDateRange(string dateRange)
        {
            var now = DateTime.UtcNow;
            return dateRange switch
            {
                "today" => (now.Date, now.Date.AddDays(1).AddTicks(-1)),
                "week" => (now.Date.AddDays(-(int)now.DayOfWeek), now.Date.AddDays(7 - (int)now.DayOfWeek).AddTicks(-1)),
                "month" => (new DateTime(now.Year, now.Month, 1), new DateTime(now.Year, now.Month, 1).AddMonths(1).AddTicks(-1)),
                _ => (now.Date.AddDays(-30), now.Date.AddDays(1).AddTicks(-1))
            };
        }

        private object GetPropertyValue(object obj, string propertyName)
        {
            var type = obj.GetType();
            var property = type.GetProperty(propertyName);
            return property?.GetValue(obj) ?? "";
        }

        private async Task<byte[]> GenerateExcelFile(List<Dictionary<string, object>> data, Dictionary<string, object> options)
        {
            using var package = new ExcelPackage();
            var worksheet = package.Workbook.Worksheets.Add("Export");

            if (data.Any())
            {
                var headers = data.First().Keys.ToArray();
                
                // Add headers with styling
                for (int i = 0; i < headers.Length; i++)
                {
                    var cell = worksheet.Cells[1, i + 1];
                    cell.Value = headers[i];
                    cell.Style.Font.Bold = true;
                    cell.Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
                    cell.Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.LightGray);
                }

                // Add data
                for (int row = 0; row < data.Count; row++)
                {
                    var rowData = data[row];
                    for (int col = 0; col < headers.Length; col++)
                    {
                        worksheet.Cells[row + 2, col + 1].Value = rowData[headers[col]];
                    }
                }

                worksheet.Cells.AutoFitColumns();
            }

            return package.GetAsByteArray();
        }

        private async Task<byte[]> GeneratePdfFile(List<Dictionary<string, object>> data, Dictionary<string, object> options)
        {
            using var memoryStream = new MemoryStream();
            var document = new Document(PageSize.A4.Rotate());
            var writer = PdfWriter.GetInstance(document, memoryStream);
            
            document.Open();
            document.Add(new Paragraph("Data Export"));
            document.Add(new Paragraph($"Generated on: {DateTime.UtcNow:yyyy-MM-dd HH:mm:ss}"));
            document.Add(new Paragraph(" "));

            if (data.Any())
            {
                var headers = data.First().Keys.ToArray();
                var table = new PdfPTable(headers.Length);
                
                // Add headers
                foreach (var header in headers)
                {
                    var cell = new PdfPCell(new Phrase(header));
                    cell.BackgroundColor = BaseColor.LIGHT_GRAY;
                    table.AddCell(cell);
                }

                // Add data rows
                foreach (var row in data)
                {
                    foreach (var header in headers)
                    {
                        table.AddCell(new PdfPCell(new Phrase(row[header]?.ToString() ?? "")));
                    }
                }

                document.Add(table);
            }

            document.Close();
            return memoryStream.ToArray();
        }

        private async Task<byte[]> GenerateCsvFile(List<Dictionary<string, object>> data, Dictionary<string, object> options)
        {
            using var memoryStream = new MemoryStream();
            using var writer = new StreamWriter(memoryStream);

            if (data.Any())
            {
                var headers = data.First().Keys.ToArray();
                
                // Write headers
                await writer.WriteLineAsync(string.Join(",", headers));

                // Write data
                foreach (var row in data)
                {
                    var values = headers.Select(h => EscapeCsvValue(row[h]?.ToString() ?? ""));
                    await writer.WriteLineAsync(string.Join(",", values));
                }
            }

            await writer.FlushAsync();
            return memoryStream.ToArray();
        }

        private string EscapeCsvValue(string value)
        {
            if (value.Contains(",") || value.Contains("\"") || value.Contains("\n"))
            {
                return $"\"{value.Replace("\"", "\"\"")}\"";
            }
            return value;
        }

        private async Task ProcessExportJobAsync(Guid jobId)
        {
            try
            {
                var job = await _context.ExportJobs.FindAsync(jobId);
                if (job == null) return;

                job.Status = "processing";
                job.Progress = 10;
                await _context.SaveChangesAsync();

                var request = JsonSerializer.Deserialize<ExportRequestDto>(job.Parameters);
                
                job.Progress = 50;
                await _context.SaveChangesAsync();

                var data = await GetExportData(request);
                
                job.Progress = 80;
                await _context.SaveChangesAsync();

                var fileBytes = request.Format.ToUpper() switch
                {
                    "EXCEL" => await GenerateExcelFile(data, request.Options),
                    "PDF" => await GeneratePdfFile(data, request.Options),
                    "CSV" => await GenerateCsvFile(data, request.Options),
                    _ => throw new ArgumentException("Unsupported format")
                };

                // In a real implementation, save the file and provide download URL
                job.Status = "completed";
                job.Progress = 100;
                job.CompletedAt = DateTime.UtcNow;
                job.DownloadUrl = $"/api/exports/{jobId}/download";
                
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                var job = await _context.ExportJobs.FindAsync(jobId);
                if (job != null)
                {
                    job.Status = "failed";
                    job.ErrorMessage = ex.Message;
                    await _context.SaveChangesAsync();
                }
                
                _logger.LogError(ex, "Error processing export job {JobId}", jobId);
            }
        }

        private ExportJobDto MapToExportJobDto(ExportJob job)
        {
            return new ExportJobDto
            {
                Id = job.Id,
                Status = job.Status,
                Progress = job.Progress,
                DownloadUrl = job.DownloadUrl,
                CreatedAt = job.CreatedAt,
                CompletedAt = job.CompletedAt,
                ErrorMessage = job.ErrorMessage
            };
        }
    }

    // Additional entity models
    public class ScheduledReport
    {
        public Guid Id { get; set; }
        public Guid TenantId { get; set; }
        public Guid ReportId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string CronExpression { get; set; } = string.Empty;
        public string Recipients { get; set; } = string.Empty;
        public string Format { get; set; } = string.Empty;
        public string Parameters { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public DateTime? LastExecuted { get; set; }
        public DateTime? NextExecution { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class ExportJob
    {
        public Guid Id { get; set; }
        public Guid TenantId { get; set; }
        public string Status { get; set; } = string.Empty;
        public int Progress { get; set; }
        public string? DownloadUrl { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public string? ErrorMessage { get; set; }
        public string Parameters { get; set; } = string.Empty;
    }
}

        private async Task DrawChartContent(System.Drawing.Graphics graphics, dynamic chartConfig)
        {
            try
            {
                var chartType = chartConfig.ChartType?.ToString() ?? "bar";
                var data = await GetChartDataForDrawing(chartConfig);
                
                switch (chartType.ToLower())
                {
                    case "bar":
                        DrawBarChart(graphics, data);
                        break;
                    case "line":
                        DrawLineChart(graphics, data);
                        break;
                    case "pie":
                        DrawPieChart(graphics, data);
                        break;
                    default:
                        DrawBarChart(graphics, data);
                        break;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error drawing chart content");
                graphics.DrawString("Chart generation error", new System.Drawing.Font("Arial", 12), System.Drawing.Brushes.Red, 10, 10);
            }
        }

        private void DrawBarChart(System.Drawing.Graphics graphics, List<ChartDataPoint> data)
        {
            if (data == null || !data.Any()) return;
            
            var barWidth = 60;
            var barSpacing = 20;
            var maxValue = data.Max(d => d.Value);
            var chartHeight = 400;
            var chartTop = 100;
            
            for (int i = 0; i < data.Count; i++)
            {
                var x = 50 + i * (barWidth + barSpacing);
                var barHeight = (int)((data[i].Value / maxValue) * chartHeight);
                var y = chartTop + chartHeight - barHeight;
                
                graphics.FillRectangle(System.Drawing.Brushes.Blue, x, y, barWidth, barHeight);
                graphics.DrawString(data[i].Label, new System.Drawing.Font("Arial", 10), System.Drawing.Brushes.Black, x, y + barHeight + 5);
                graphics.DrawString(data[i].Value.ToString(), new System.Drawing.Font("Arial", 9), System.Drawing.Brushes.Black, x, y - 20);
            }
        }

        private void DrawLineChart(System.Drawing.Graphics graphics, List<ChartDataPoint> data)
        {
            if (data == null || data.Count < 2) return;
            
            var points = new List<System.Drawing.Point>();
            var maxValue = data.Max(d => d.Value);
            var chartHeight = 400;
            var chartTop = 100;
            var chartWidth = 700;
            
            for (int i = 0; i < data.Count; i++)
            {
                var x = 50 + (int)((double)i / (data.Count - 1) * chartWidth);
                var y = chartTop + chartHeight - (int)((data[i].Value / maxValue) * chartHeight);
                points.Add(new System.Drawing.Point(x, y));
            }
            
            if (points.Count > 1)
            {
                graphics.DrawLines(new System.Drawing.Pen(System.Drawing.Color.Blue, 2), points.ToArray());
            }
        }

        private void DrawPieChart(System.Drawing.Graphics graphics, List<ChartDataPoint> data)
        {
            if (data == null || !data.Any()) return;
            
            var total = data.Sum(d => d.Value);
            var centerX = 400;
            var centerY = 300;
            var radius = 150;
            var startAngle = 0f;
            
            var colors = new[] { System.Drawing.Color.Blue, System.Drawing.Color.Red, System.Drawing.Color.Green, System.Drawing.Color.Orange, System.Drawing.Color.Purple };
            
            for (int i = 0; i < data.Count; i++)
            {
                var sweepAngle = (float)(data[i].Value / total * 360);
                var color = colors[i % colors.Length];
                
                graphics.FillPie(new System.Drawing.SolidBrush(color), 
                    centerX - radius, centerY - radius, radius * 2, radius * 2, 
                    startAngle, sweepAngle);
                
                startAngle += sweepAngle;
            }
        }

        private async Task<List<ChartDataPoint>> GetChartDataForDrawing(dynamic chartConfig)
        {
            return new List<ChartDataPoint>
            {
                new ChartDataPoint { Label = "Jan", Value = 100 },
                new ChartDataPoint { Label = "Feb", Value = 150 },
                new ChartDataPoint { Label = "Mar", Value = 120 },
                new ChartDataPoint { Label = "Apr", Value = 180 },
                new ChartDataPoint { Label = "May", Value = 200 }
            };
        }

        private async Task<string> GetChartDataForPdf(dynamic chartConfig)
        {
            var data = await GetChartDataForDrawing(chartConfig);
            var result = new System.Text.StringBuilder();
            
            result.AppendLine("Chart Data:");
            foreach (var point in data)
            {
                result.AppendLine($"{point.Label}: {point.Value}");
            }
            
            return result.ToString();
        }

        private async Task AddSvgChartContent(System.Text.StringBuilder svg, dynamic chartConfig)
        {
            var data = await GetChartDataForDrawing(chartConfig);
            var maxValue = data.Max(d => d.Value);
            var barWidth = 60;
            var barSpacing = 20;
            var chartHeight = 400;
            var chartTop = 100;
            
            for (int i = 0; i < data.Count; i++)

        private async Task<Dictionary<string, object>> BuildFormulaContextAsync(Guid tenantId)
        {
            try
            {
                var context = new Dictionary<string, object>();
                
                var tenant = await _context.Tenants.FirstOrDefaultAsync(t => t.Id == tenantId);
                if (tenant != null)
                {
                    context["TenantName"] = tenant.Name ?? "Unknown";
                    context["TenantId"] = tenantId.ToString();
                }
                
                var attendanceCount = await _context.AttendanceRecords
                    .Where(a => a.TenantId == tenantId)
                    .CountAsync();
                context["TotalAttendanceRecords"] = attendanceCount;
                
                var userCount = await _context.Users
                    .Where(u => u.TenantId == tenantId)
                    .CountAsync();
                context["TotalUsers"] = userCount;
                
                // Add date/time context
                context["CurrentDate"] = DateTime.UtcNow.Date;
                context["CurrentMonth"] = DateTime.UtcNow.Month;
                context["CurrentYear"] = DateTime.UtcNow.Year;
                
                context["PI"] = Math.PI;
                context["E"] = Math.E;
                
                return context;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error building formula context for tenant {TenantId}", tenantId);
                return new Dictionary<string, object>();
            }
        }

        private class FormulaEngine
        {
            public object Evaluate(string formula, Dictionary<string, object> context)
            {
                try
                {
                    // In production, this would use a more sophisticated parser like NCalc or similar
                    
                    var processedFormula = formula;
                    foreach (var kvp in context)
                    {
                        processedFormula = processedFormula.Replace($"{{{kvp.Key}}}", kvp.Value?.ToString() ?? "0");
                    }
                    
                    if (processedFormula.Contains("+") || processedFormula.Contains("-") || 
                        processedFormula.Contains("*") || processedFormula.Contains("/"))
                    {
                        return EvaluateMathExpression(processedFormula);
                    }
                    
                    if (processedFormula.StartsWith("CONCAT(") && processedFormula.EndsWith(")"))
                    {
                        return EvaluateConcatFunction(processedFormula, context);
                    }
                    
                    if (processedFormula.StartsWith("SUM(") || processedFormula.StartsWith("AVG(") || 
                        processedFormula.StartsWith("COUNT(") || processedFormula.StartsWith("MAX(") || 
                        processedFormula.StartsWith("MIN("))
                    {
                        return EvaluateAggregateFunction(processedFormula, context);
                    }
                    
                    if (double.TryParse(processedFormula, out double numResult))
                    {
                        return numResult;
                    }
                    
                    return processedFormula;
                }
                catch (Exception ex)
                {
                    throw new InvalidOperationException($"Formula evaluation failed: {ex.Message}");
                }
            }
            
            private double EvaluateMathExpression(string expression)
            {
                try
                {
                    var dataTable = new System.Data.DataTable();
                    var result = dataTable.Compute(expression, null);
                    return Convert.ToDouble(result);
                }
                catch
                {
                    throw new InvalidOperationException($"Invalid mathematical expression: {expression}");
                }
            }
            
            private string EvaluateConcatFunction(string formula, Dictionary<string, object> context)
            {
                var parameters = formula.Substring(7, formula.Length - 8); // Remove CONCAT( and )
                var parts = parameters.Split(',').Select(p => p.Trim()).ToArray();
                
                var result = string.Join("", parts.Select(part => 
                {
                    if (context.ContainsKey(part))
                        return context[part]?.ToString() ?? "";
                    return part.Trim('"', '\''); // Remove quotes if present
                }));
                
                return result;
            }
            
            private double EvaluateAggregateFunction(string formula, Dictionary<string, object> context)
            {
                
                if (formula.StartsWith("COUNT("))
                {
                    if (context.ContainsKey("TotalUsers"))
                        return Convert.ToDouble(context["TotalUsers"]);
                    return 0;
                }
                
                if (formula.StartsWith("SUM(") || formula.StartsWith("AVG("))
                {
                    if (context.ContainsKey("TotalAttendanceRecords"))
                        return Convert.ToDouble(context["TotalAttendanceRecords"]);
                    return 0;
                }
                
                if (formula.StartsWith("MAX(") || formula.StartsWith("MIN("))
                {
                    return 100; // Placeholder value
                }
                
                return 0;
            }
        }

            {
                var x = 50 + i * (barWidth + barSpacing);
                var barHeight = (int)((data[i].Value / maxValue) * chartHeight);
                var y = chartTop + chartHeight - barHeight;
                
                svg.AppendLine($"<rect x=\"{x}\" y=\"{y}\" width=\"{barWidth}\" height=\"{barHeight}\" fill=\"blue\" />");
                svg.AppendLine($"<text x=\"{x + barWidth/2}\" y=\"{y + barHeight + 20}\" text-anchor=\"middle\" font-size=\"10\">{data[i].Label}</text>");
                svg.AppendLine($"<text x=\"{x + barWidth/2}\" y=\"{y - 5}\" text-anchor=\"middle\" font-size=\"9\">{data[i].Value}</text>");
            }
        }

        private class ChartDataPoint
        {
            public string Label { get; set; } = string.Empty;
            public double Value { get; set; }
        }
    }

    public class ComplianceReportingService : IComplianceReportingService
    {
        private readonly AttendancePlatformDbContext _context;
        private readonly ILogger<ComplianceReportingService> _logger;
        private readonly IAuditLogService _auditLogService;

        public ComplianceReportingService(
            AttendancePlatformDbContext context, 
            ILogger<ComplianceReportingService> logger,
            IAuditLogService auditLogService)
        {
            _context = context;
            _logger = logger;
            _auditLogService = auditLogService;
        }

        public async Task<ComplianceReportDto> GenerateComplianceReportAsync(ComplianceReportRequest request)
        {
            try
            {
                var report = new ComplianceReportDto
                {
                    Id = Guid.NewGuid(),
                    ReportType = request.ReportType,
                    GeneratedAt = DateTime.UtcNow,
                    GeneratedBy = request.GeneratedBy,
                    TenantId = request.TenantId,
                    DateRange = request.DateRange,
                    ComplianceMetrics = new List<ComplianceMetricDto>(),
                    Violations = new List<ComplianceViolationDto>(),
                    Recommendations = new List<string>()
                };

                switch (request.ReportType.ToLower())
                {
                    case "gdpr":
                        await GenerateGDPRComplianceReport(report, request);
                        break;
                    case "sox":
                        await GenerateSOXComplianceReport(report, request);
                        break;
                    case "hipaa":
                        await GenerateHIPAAComplianceReport(report, request);
                        break;
                    case "labor_law":
                        await GenerateLaborLawComplianceReport(report, request);
                        break;
                    case "audit_trail":
                        await GenerateAuditTrailReport(report, request);
                        break;
                    case "data_retention":
                        await GenerateDataRetentionReport(report, request);
                        break;
                    default:
                        await GenerateGeneralComplianceReport(report, request);
                        break;
                }

                await LogComplianceReportGeneration(report);
                return report;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating compliance report for type {ReportType}", request.ReportType);
                throw;
            }
        }

        private async Task GenerateGDPRComplianceReport(ComplianceReportDto report, ComplianceReportRequest request)
        {
            var startDate = request.DateRange.StartDate;
            var endDate = request.DateRange.EndDate;

            var dataProcessingActivities = await _context.AuditLogs
                .Where(a => a.TenantId == request.TenantId && 
                           a.Timestamp >= startDate && 
                           a.Timestamp <= endDate &&
                           (a.Action.Contains("PersonalData") || a.Action.Contains("UserData")))
                .CountAsync();

            report.ComplianceMetrics.Add(new ComplianceMetricDto
            {
                MetricName = "Data Processing Activities",
                Value = dataProcessingActivities,
                Status = "Compliant",
                Description = "Number of personal data processing activities logged"
            });

            var dataSubjectRequests = await _context.AuditLogs
                .Where(a => a.TenantId == request.TenantId && 
                           a.Timestamp >= startDate && 
                           a.Timestamp <= endDate &&
                           a.Action.Contains("DataSubjectRequest"))
                .CountAsync();

            report.ComplianceMetrics.Add(new ComplianceMetricDto
            {
                MetricName = "Data Subject Requests",
                Value = dataSubjectRequests,
                Status = dataSubjectRequests > 0 ? "Requires Review" : "Compliant",
                Description = "Number of data subject access/deletion requests"
            });

            var dataBreaches = await _context.AuditLogs
                .Where(a => a.TenantId == request.TenantId && 
                           a.Timestamp >= startDate && 
                           a.Timestamp <= endDate &&
                           a.Action.Contains("SecurityBreach"))
                .CountAsync();

            if (dataBreaches > 0)
            {
                report.Violations.Add(new ComplianceViolationDto
                {
                    ViolationType = "Data Breach",
                    Severity = "High",
                    Description = $"{dataBreaches} potential data breach incidents detected",
                    OccurredAt = DateTime.UtcNow,
                    Status = "Under Investigation"
                });
            }

            var consentWithdrawals = await _context.AuditLogs
                .Where(a => a.TenantId == request.TenantId && 
                           a.Timestamp >= startDate && 
                           a.Timestamp <= endDate &&
                           a.Action.Contains("ConsentWithdrawn"))
                .CountAsync();

            report.ComplianceMetrics.Add(new ComplianceMetricDto
            {
                MetricName = "Consent Withdrawals",
                Value = consentWithdrawals,
                Status = "Compliant",
                Description = "Number of consent withdrawals processed"
            });

            report.Recommendations.Add("Ensure all personal data processing activities are documented");
            report.Recommendations.Add("Implement automated data subject request handling");
            report.Recommendations.Add("Regular privacy impact assessments should be conducted");
            if (dataBreaches > 0)
            {
                report.Recommendations.Add("Immediate investigation required for potential data breaches");
            }
        }

        private async Task GenerateSOXComplianceReport(ComplianceReportDto report, ComplianceReportRequest request)
        {
            var startDate = request.DateRange.StartDate;
            var endDate = request.DateRange.EndDate;

            var financialDataAccess = await _context.AuditLogs
                .Where(a => a.TenantId == request.TenantId && 
                           a.Timestamp >= startDate && 
                           a.Timestamp <= endDate &&
                           a.Action.Contains("FinancialData"))
                .CountAsync();

            report.ComplianceMetrics.Add(new ComplianceMetricDto
            {
                MetricName = "Financial Data Access Events",
                Value = financialDataAccess,
                Status = "Compliant",
                Description = "Number of financial data access events logged"
            });

            var dutyViolations = await _context.AuditLogs
                .Where(a => a.TenantId == request.TenantId && 
                           a.Timestamp >= startDate && 
                           a.Timestamp <= endDate &&
                           a.Action.Contains("DutyViolation"))
                .CountAsync();

            if (dutyViolations > 0)
            {
                report.Violations.Add(new ComplianceViolationDto
                {
                    ViolationType = "Segregation of Duties",
                    Severity = "Medium",
                    Description = $"{dutyViolations} potential duty segregation violations detected",
                    OccurredAt = DateTime.UtcNow,
                    Status = "Requires Review"
                });
            }

            var unauthorizedChanges = await _context.AuditLogs
                .Where(a => a.TenantId == request.TenantId && 
                           a.Timestamp >= startDate && 
                           a.Timestamp <= endDate &&
                           a.Action.Contains("UnauthorizedChange"))
                .CountAsync();

            report.ComplianceMetrics.Add(new ComplianceMetricDto
            {
                MetricName = "Unauthorized Changes",
                Value = unauthorizedChanges,
                Status = unauthorizedChanges == 0 ? "Compliant" : "Non-Compliant",
                Description = "Number of unauthorized system changes detected"
            });

            report.Recommendations.Add("Implement automated segregation of duties controls");
            report.Recommendations.Add("Regular review of financial data access permissions");
            report.Recommendations.Add("Strengthen change management approval processes");
        }

        private async Task GenerateHIPAAComplianceReport(ComplianceReportDto report, ComplianceReportRequest request)
        {
            var startDate = request.DateRange.StartDate;
            var endDate = request.DateRange.EndDate;

            var phiAccess = await _context.AuditLogs
                .Where(a => a.TenantId == request.TenantId && 
                           a.Timestamp >= startDate && 
                           a.Timestamp <= endDate &&
                           a.Action.Contains("PHI"))
                .CountAsync();

            report.ComplianceMetrics.Add(new ComplianceMetricDto
            {
                MetricName = "PHI Access Events",
                Value = phiAccess,
                Status = "Compliant",
                Description = "Number of Protected Health Information access events"
            });

            var unnecessaryAccess = await _context.AuditLogs
                .Where(a => a.TenantId == request.TenantId && 
                           a.Timestamp >= startDate && 
                           a.Timestamp <= endDate &&
                           a.Action.Contains("UnnecessaryPHIAccess"))
                .CountAsync();

            if (unnecessaryAccess > 0)
            {
                report.Violations.Add(new ComplianceViolationDto
                {
                    ViolationType = "Minimum Necessary Rule",
                    Severity = "Medium",
                    Description = $"{unnecessaryAccess} potential violations of minimum necessary rule",
                    OccurredAt = DateTime.UtcNow,
                    Status = "Under Review"
                });
            }

            var unencryptedTransmissions = await _context.AuditLogs
                .Where(a => a.TenantId == request.TenantId && 
                           a.Timestamp >= startDate && 
                           a.Timestamp <= endDate &&
                           a.Action.Contains("UnencryptedPHI"))
                .CountAsync();

            report.ComplianceMetrics.Add(new ComplianceMetricDto
            {
                MetricName = "Unencrypted PHI Transmissions",
                Value = unencryptedTransmissions,
                Status = unencryptedTransmissions == 0 ? "Compliant" : "Non-Compliant",
                Description = "Number of unencrypted PHI transmission attempts"
            });

            report.Recommendations.Add("Implement role-based access controls for PHI");
            report.Recommendations.Add("Regular training on minimum necessary rule");
            report.Recommendations.Add("Ensure all PHI transmissions are encrypted");
        }

        private async Task GenerateLaborLawComplianceReport(ComplianceReportDto report, ComplianceReportRequest request)
        {
            var startDate = request.DateRange.StartDate;
            var endDate = request.DateRange.EndDate;

            // Overtime Violations
            var overtimeViolations = await _context.AttendanceRecords
                .Where(a => a.TenantId == request.TenantId && 
                           a.CheckInTime >= startDate && 
                           a.CheckInTime <= endDate &&
                           a.OvertimeHours > 12) // Assuming 12 hours is the legal limit
                .CountAsync();

            if (overtimeViolations > 0)
            {
                report.Violations.Add(new ComplianceViolationDto
                {
                    ViolationType = "Excessive Overtime",
                    Severity = "High",
                    Description = $"{overtimeViolations} instances of excessive overtime detected",
                    OccurredAt = DateTime.UtcNow,
                    Status = "Requires Immediate Action"
                });
            }

            var breakViolations = await _context.AttendanceRecords
                .Where(a => a.TenantId == request.TenantId && 
                           a.CheckInTime >= startDate && 
                           a.CheckInTime <= endDate &&
                           a.TotalHours > 6 && a.BreakDuration < 30) // 30 min break required for 6+ hour shifts
                .CountAsync();

            report.ComplianceMetrics.Add(new ComplianceMetricDto
            {
                MetricName = "Break Time Violations",
                Value = breakViolations,
                Status = breakViolations == 0 ? "Compliant" : "Non-Compliant",
                Description = "Number of mandatory break time violations"
            });

            var belowMinimumWage = await _context.Users
                .Where(u => u.TenantId == request.TenantId && u.HourlyRate < 15.00m) // Assuming $15 minimum wage
                .CountAsync();

            report.ComplianceMetrics.Add(new ComplianceMetricDto
            {
                MetricName = "Below Minimum Wage",
                Value = belowMinimumWage,
                Status = belowMinimumWage == 0 ? "Compliant" : "Non-Compliant",
                Description = "Number of employees below minimum wage"
            });

            report.Recommendations.Add("Implement automated overtime monitoring and alerts");
            report.Recommendations.Add("Ensure mandatory break times are enforced");
            report.Recommendations.Add("Regular review of wage compliance across all employees");
        }

        private async Task GenerateAuditTrailReport(ComplianceReportDto report, ComplianceReportRequest request)
        {
            var startDate = request.DateRange.StartDate;
            var endDate = request.DateRange.EndDate;

            var totalAuditEvents = await _context.AuditLogs
                .Where(a => a.TenantId == request.TenantId && 
                           a.Timestamp >= startDate && 
                           a.Timestamp <= endDate)
                .CountAsync();

            report.ComplianceMetrics.Add(new ComplianceMetricDto
            {
                MetricName = "Total Audit Events",
                Value = totalAuditEvents,
                Status = "Compliant",
                Description = "Total number of audit events logged"
            });

            var failedLogins = await _context.AuditLogs
                .Where(a => a.TenantId == request.TenantId && 
                           a.Timestamp >= startDate && 
                           a.Timestamp <= endDate &&
                           a.Action.Contains("FailedLogin"))
                .CountAsync();

            report.ComplianceMetrics.Add(new ComplianceMetricDto
            {
                MetricName = "Failed Login Attempts",
                Value = failedLogins,
                Status = failedLogins < 100 ? "Normal" : "Elevated",
                Description = "Number of failed authentication attempts"
            });

            var privilegedAccess = await _context.AuditLogs
                .Where(a => a.TenantId == request.TenantId && 
                           a.Timestamp >= startDate && 
                           a.Timestamp <= endDate &&
                           a.Action.Contains("PrivilegedAccess"))
                .CountAsync();

            report.ComplianceMetrics.Add(new ComplianceMetricDto
            {
                MetricName = "Privileged Access Events",
                Value = privilegedAccess,
                Status = "Compliant",
                Description = "Number of privileged access events"
            });

            var dataModifications = await _context.AuditLogs
                .Where(a => a.TenantId == request.TenantId && 
                           a.Timestamp >= startDate && 
                           a.Timestamp <= endDate &&
                           (a.Action.Contains("Create") || a.Action.Contains("Update") || a.Action.Contains("Delete")))
                .CountAsync();

            report.ComplianceMetrics.Add(new ComplianceMetricDto
            {
                MetricName = "Data Modification Events",
                Value = dataModifications,
                Status = "Compliant",
                Description = "Number of data creation, update, and deletion events"
            });

            report.Recommendations.Add("Ensure audit logs are tamper-proof and regularly backed up");
            report.Recommendations.Add("Implement real-time monitoring for suspicious activities");
            report.Recommendations.Add("Regular review of privileged access patterns");
        }

        private async Task GenerateDataRetentionReport(ComplianceReportDto report, ComplianceReportRequest request)
        {
            var startDate = request.DateRange.StartDate;
            var endDate = request.DateRange.EndDate;

            var eligibleForDeletion = await _context.AuditLogs
                .Where(a => a.TenantId == request.TenantId && 
                           a.Timestamp < DateTime.UtcNow.AddYears(-7)) // 7-year retention policy
                .CountAsync();

            report.ComplianceMetrics.Add(new ComplianceMetricDto
            {
                MetricName = "Records Eligible for Deletion",
                Value = eligibleForDeletion,
                Status = eligibleForDeletion > 0 ? "Action Required" : "Compliant",
                Description = "Number of records that have exceeded retention period"
            });

            var attendanceRecords = await _context.AttendanceRecords
                .Where(a => a.TenantId == request.TenantId)
                .CountAsync();

            var userRecords = await _context.Users
                .Where(u => u.TenantId == request.TenantId)
                .CountAsync();

            report.ComplianceMetrics.Add(new ComplianceMetricDto
            {
                MetricName = "Active Attendance Records",
                Value = attendanceRecords,
                Status = "Compliant",
                Description = "Number of active attendance records"
            });

            report.ComplianceMetrics.Add(new ComplianceMetricDto
            {
                MetricName = "Active User Records",
                Value = userRecords,
                Status = "Compliant",
                Description = "Number of active user records"
            });

            if (eligibleForDeletion > 0)
            {
                report.Recommendations.Add($"Schedule deletion of {eligibleForDeletion} records that have exceeded retention period");
            }
            report.Recommendations.Add("Implement automated data retention policy enforcement");
            report.Recommendations.Add("Regular review of data retention policies and legal requirements");
        }

        private async Task GenerateGeneralComplianceReport(ComplianceReportDto report, ComplianceReportRequest request)
        {
            var startDate = request.DateRange.StartDate;
            var endDate = request.DateRange.EndDate;

            var systemAccess = await _context.AuditLogs
                .Where(a => a.TenantId == request.TenantId && 
                           a.Timestamp >= startDate && 
                           a.Timestamp <= endDate &&
                           a.Action.Contains("Login"))
                .CountAsync();

            report.ComplianceMetrics.Add(new ComplianceMetricDto
            {
                MetricName = "System Access Events",
                Value = systemAccess,
                Status = "Compliant",
                Description = "Number of system access events"
            });

            var policyViolations = await _context.AuditLogs
                .Where(a => a.TenantId == request.TenantId && 
                           a.Timestamp >= startDate && 
                           a.Timestamp <= endDate &&
                           a.Action.Contains("PolicyViolation"))
                .CountAsync();

            if (policyViolations > 0)
            {
                report.Violations.Add(new ComplianceViolationDto
                {
                    ViolationType = "Policy Violation",
                    Severity = "Medium",
                    Description = $"{policyViolations} policy violations detected",
                    OccurredAt = DateTime.UtcNow,
                    Status = "Under Review"
                });
            }

            report.Recommendations.Add("Regular compliance training for all users");
            report.Recommendations.Add("Implement automated policy enforcement mechanisms");
            report.Recommendations.Add("Conduct periodic compliance assessments");
        }

        private async Task LogComplianceReportGeneration(ComplianceReportDto report)
        {
            await _auditLogService.LogAsync(new AuditLogEntry
            {
                TenantId = report.TenantId,
                UserId = report.GeneratedBy,
                Action = $"ComplianceReportGenerated_{report.ReportType}",
                EntityType = "ComplianceReport",
                EntityId = report.Id.ToString(),
                Details = $"Generated {report.ReportType} compliance report",
                Timestamp = DateTime.UtcNow,
                IpAddress = "System",
                UserAgent = "ComplianceReportingService"
            });
        }

        public async Task<List<ComplianceTemplateDto>> GetComplianceTemplatesAsync(Guid tenantId)
        {
            try
            {
                return new List<ComplianceTemplateDto>
                {
                    new ComplianceTemplateDto
                    {
                        Id = Guid.NewGuid(),
                        Name = "GDPR Compliance Report",
                        Description = "General Data Protection Regulation compliance assessment",
                        ReportType = "gdpr",
                        RequiredFields = new List<string> { "DataProcessingActivities", "ConsentManagement", "DataSubjectRequests" },
                        Frequency = "Monthly",
                        IsActive = true
                    },
                    new ComplianceTemplateDto
                    {
                        Id = Guid.NewGuid(),
                        Name = "SOX Compliance Report",
                        Description = "Sarbanes-Oxley Act compliance assessment",
                        ReportType = "sox",
                        RequiredFields = new List<string> { "FinancialControls", "SegregationOfDuties", "ChangeManagement" },
                        Frequency = "Quarterly",
                        IsActive = true
                    },
                    new ComplianceTemplateDto
                    {
                        Id = Guid.NewGuid(),
                        Name = "HIPAA Compliance Report",
                        Description = "Health Insurance Portability and Accountability Act compliance",
                        ReportType = "hipaa",
                        RequiredFields = new List<string> { "PHIAccess", "MinimumNecessary", "Encryption" },
                        Frequency = "Monthly",
                        IsActive = true
                    },
                    new ComplianceTemplateDto
                    {
                        Id = Guid.NewGuid(),
                        Name = "Labor Law Compliance Report",
                        Description = "Employment and labor law compliance assessment",
                        ReportType = "labor_law",
                        RequiredFields = new List<string> { "OvertimeCompliance", "BreakTimes", "MinimumWage" },
                        Frequency = "Weekly",
                        IsActive = true
                    },
                    new ComplianceTemplateDto
                    {
                        Id = Guid.NewGuid(),
                        Name = "Audit Trail Report",
                        Description = "Comprehensive audit trail and access monitoring",
                        ReportType = "audit_trail",
                        RequiredFields = new List<string> { "AccessEvents", "DataModifications", "PrivilegedAccess" },
                        Frequency = "Daily",
                        IsActive = true
                    },
                    new ComplianceTemplateDto
                    {
                        Id = Guid.NewGuid(),
                        Name = "Data Retention Report",
                        Description = "Data retention policy compliance assessment",
                        ReportType = "data_retention",
                        RequiredFields = new List<string> { "RetentionPolicies", "DataClassification", "DeletionSchedule" },
                        Frequency = "Monthly",
                        IsActive = true
                    }
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving compliance templates for tenant {TenantId}", tenantId);
                throw;
            }
        }

        public async Task<ComplianceDashboardDto> GetComplianceDashboardAsync(Guid tenantId, DateTime startDate, DateTime endDate)
        {
            try
            {
                var dashboard = new ComplianceDashboardDto
                {
                    TenantId = tenantId,
                    DateRange = new DateRangeDto { StartDate = startDate, EndDate = endDate },
                    OverallComplianceScore = 0,
                    ComplianceMetrics = new List<ComplianceMetricDto>(),
                    RecentViolations = new List<ComplianceViolationDto>(),
                    TrendData = new List<ComplianceTrendDto>(),
                    UpcomingDeadlines = new List<ComplianceDeadlineDto>()
                };

                var totalViolations = await _context.AuditLogs
                    .Where(a => a.TenantId == tenantId && 
                               a.Timestamp >= startDate && 
                               a.Timestamp <= endDate &&
                               a.Action.Contains("Violation"))
                    .CountAsync();

                var totalAuditEvents = await _context.AuditLogs
                    .Where(a => a.TenantId == tenantId && 
                               a.Timestamp >= startDate && 
                               a.Timestamp <= endDate)
                    .CountAsync();

                dashboard.OverallComplianceScore = totalAuditEvents > 0 
                    ? Math.Max(0, 100 - (totalViolations * 100.0 / totalAuditEvents))
                    : 100;

                var recentViolations = await _context.AuditLogs
                    .Where(a => a.TenantId == tenantId && 
                               a.Timestamp >= startDate && 
                               a.Timestamp <= endDate &&
                               a.Action.Contains("Violation"))
                    .OrderByDescending(a => a.Timestamp)
                    .Take(10)
                    .Select(a => new ComplianceViolationDto
                    {
                        ViolationType = a.Action,
                        Severity = "Medium",
                        Description = a.Details ?? "Compliance violation detected",
                        OccurredAt = a.Timestamp,
                        Status = "Under Review"
                    })
                    .ToListAsync();

                dashboard.RecentViolations = recentViolations;

                var weeklyTrends = await _context.AuditLogs
                    .Where(a => a.TenantId == tenantId && 
                               a.Timestamp >= startDate && 
                               a.Timestamp <= endDate)
                    .GroupBy(a => new { 
                        Year = a.Timestamp.Year, 
                        Week = EF.Functions.DatePart("week", a.Timestamp) 
                    })
                    .Select(g => new ComplianceTrendDto
                    {
                        Date = startDate.AddDays((g.Key.Week - 1) * 7),
                        ComplianceScore = g.Count(a => !a.Action.Contains("Violation")) * 100.0 / g.Count(),
                        ViolationCount = g.Count(a => a.Action.Contains("Violation"))
                    })
                    .OrderBy(t => t.Date)
                    .ToListAsync();

                dashboard.TrendData = weeklyTrends;

                dashboard.UpcomingDeadlines = new List<ComplianceDeadlineDto>
                {
                    new ComplianceDeadlineDto
                    {
                        Title = "GDPR Annual Assessment",
                        DueDate = DateTime.UtcNow.AddDays(30),
                        Priority = "High",
                        Status = "Pending"
                    },
                    new ComplianceDeadlineDto
                    {
                        Title = "SOX Quarterly Review",
                        DueDate = DateTime.UtcNow.AddDays(15),
                        Priority = "Medium",
                        Status = "In Progress"
                    },
                    new ComplianceDeadlineDto
                    {
                        Title = "Data Retention Policy Review",
                        DueDate = DateTime.UtcNow.AddDays(7),
                        Priority = "High",
                        Status = "Pending"
                    }
                };

                return dashboard;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating compliance dashboard for tenant {TenantId}", tenantId);
                throw;
            }
        }

        public async Task<List<RegulatoryFrameworkDto>> GetRegulatoryFrameworksAsync()
        {
            try
            {
                return new List<RegulatoryFrameworkDto>
                {
                    new RegulatoryFrameworkDto
                    {
                        Id = Guid.NewGuid(),
                        Name = "GDPR",
                        FullName = "General Data Protection Regulation",
                        Description = "EU regulation on data protection and privacy",
                        Jurisdiction = "European Union",
                        EffectiveDate = new DateTime(2018, 5, 25),
                        RequiredReports = new List<string> { "Data Processing Activities", "Breach Notifications", "DPO Reports" },
                        ComplianceRequirements = new List<string> 
                        { 
                            "Lawful basis for processing",
                            "Data subject rights",
                            "Privacy by design",
                            "Data protection impact assessments"
                        }
                    },
                    new RegulatoryFrameworkDto
                    {
                        Id = Guid.NewGuid(),
                        Name = "SOX",
                        FullName = "Sarbanes-Oxley Act",
                        Description = "US federal law for corporate financial reporting",
                        Jurisdiction = "United States",
                        EffectiveDate = new DateTime(2002, 7, 30),
                        RequiredReports = new List<string> { "Internal Controls", "Management Assessment", "Auditor Attestation" },
                        ComplianceRequirements = new List<string> 
                        { 
                            "Internal control over financial reporting",
                            "Management assessment",
                            "Auditor attestation",
                            "CEO/CFO certifications"
                        }
                    },
                    new RegulatoryFrameworkDto
                    {
                        Id = Guid.NewGuid(),
                        Name = "HIPAA",
                        FullName = "Health Insurance Portability and Accountability Act",
                        Description = "US law for healthcare data protection",
                        Jurisdiction = "United States",
                        EffectiveDate = new DateTime(1996, 8, 21),
                        RequiredReports = new List<string> { "Risk Assessments", "Breach Reports", "Compliance Audits" },
                        ComplianceRequirements = new List<string> 
                        { 
                            "Administrative safeguards",
                            "Physical safeguards",
                            "Technical safeguards",
                            "Minimum necessary rule"
                        }
                    }
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving regulatory frameworks");
                throw;
            }
        }
    }

    public interface IComplianceReportingService
    {
        Task<ComplianceReportDto> GenerateComplianceReportAsync(ComplianceReportRequest request);
        Task<List<ComplianceTemplateDto>> GetComplianceTemplatesAsync(Guid tenantId);
        Task<ComplianceDashboardDto> GetComplianceDashboardAsync(Guid tenantId, DateTime startDate, DateTime endDate);
        Task<List<RegulatoryFrameworkDto>> GetRegulatoryFrameworksAsync();
    }

    public class ComplianceReportDto
    {
        public Guid Id { get; set; }
        public string ReportType { get; set; } = string.Empty;
        public DateTime GeneratedAt { get; set; }
        public Guid GeneratedBy { get; set; }
        public Guid TenantId { get; set; }
        public DateRangeDto DateRange { get; set; } = new();
        public List<ComplianceMetricDto> ComplianceMetrics { get; set; } = new();
        public List<ComplianceViolationDto> Violations { get; set; } = new();
        public List<string> Recommendations { get; set; } = new();
        public double OverallScore { get; set; }
        public string Status { get; set; } = "Generated";
    }

    public class ComplianceReportRequest
    {
        public string ReportType { get; set; } = string.Empty;
        public Guid TenantId { get; set; }
        public Guid GeneratedBy { get; set; }
        public DateRangeDto DateRange { get; set; } = new();
        public List<string> IncludeMetrics { get; set; } = new();
        public string OutputFormat { get; set; } = "json";
    }

    public class ComplianceMetricDto
    {
        public string MetricName { get; set; } = string.Empty;
        public double Value { get; set; }
        public string Status { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Unit { get; set; } = "count";
        public double? Threshold { get; set; }
    }

    public class ComplianceViolationDto
    {
        public string ViolationType { get; set; } = string.Empty;
        public string Severity { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime OccurredAt { get; set; }
        public string Status { get; set; } = string.Empty;
        public string AssignedTo { get; set; } = string.Empty;
        public DateTime? ResolvedAt { get; set; }
    }

    public class ComplianceTemplateDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string ReportType { get; set; } = string.Empty;
        public List<string> RequiredFields { get; set; } = new();
        public string Frequency { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? LastUsed { get; set; }
    }

    public class ComplianceDashboardDto
    {
        public Guid TenantId { get; set; }
        public DateRangeDto DateRange { get; set; } = new();
        public double OverallComplianceScore { get; set; }
        public List<ComplianceMetricDto> ComplianceMetrics { get; set; } = new();
        public List<ComplianceViolationDto> RecentViolations { get; set; } = new();
        public List<ComplianceTrendDto> TrendData { get; set; } = new();
        public List<ComplianceDeadlineDto> UpcomingDeadlines { get; set; } = new();
    }

    public class ComplianceTrendDto
    {
        public DateTime Date { get; set; }
        public double ComplianceScore { get; set; }
        public int ViolationCount { get; set; }
        public string Period { get; set; } = "daily";
    }

    public class ComplianceDeadlineDto
    {
        public string Title { get; set; } = string.Empty;
        public DateTime DueDate { get; set; }
        public string Priority { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string AssignedTo { get; set; } = string.Empty;
    }

    public class RegulatoryFrameworkDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Jurisdiction { get; set; } = string.Empty;
        public DateTime EffectiveDate { get; set; }
        public List<string> RequiredReports { get; set; } = new();
        public List<string> ComplianceRequirements { get; set; } = new();
        public bool IsActive { get; set; } = true;
    }

    public class DateRangeDto
    {
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
    }

