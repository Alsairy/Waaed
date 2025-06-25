using Microsoft.EntityFrameworkCore;
using Microsoft.ML;
using Microsoft.ML.Data;
using AttendancePlatform.Shared.Infrastructure.Data;
using AttendancePlatform.Shared.Domain.Entities;

namespace AttendancePlatform.Analytics.Api.Services
{
    public interface IAnalyticsService
    {
        Task<AnalyticsOverviewDto> GetAnalyticsOverviewAsync(Guid tenantId, DateTime fromDate, DateTime toDate);
        Task<List<AttendanceTrendDto>> GetAttendanceTrendsAsync(Guid tenantId, int days);
        Task<List<ProductivityMetricDto>> GetProductivityMetricsAsync(Guid tenantId, DateTime fromDate, DateTime toDate);
        Task<List<DepartmentAnalyticsDto>> GetDepartmentAnalyticsAsync(Guid tenantId, DateTime fromDate, DateTime toDate);
    }

    public interface IPredictiveAnalyticsService
    {
        Task<List<AttendancePredictionDto>> PredictAttendanceAsync(Guid tenantId, int futureDays);
        Task<List<AbsenteeismRiskDto>> IdentifyAbsenteeismRiskAsync(Guid tenantId);
        Task<List<TurnoverRiskDto>> PredictTurnoverRiskAsync(Guid tenantId);
        Task<WorkforceCapacityForecastDto> ForecastWorkforceCapacityAsync(Guid tenantId, int futureDays);
    }

    public interface IAnomalyDetectionService
    {
        Task<List<AttendanceAnomalyDto>> DetectAttendanceAnomaliesAsync(Guid tenantId, DateTime fromDate, DateTime toDate);
        Task<List<LocationAnomalyDto>> DetectLocationAnomaliesAsync(Guid tenantId, DateTime fromDate, DateTime toDate);
        Task<List<TimeAnomalyDto>> DetectTimeAnomaliesAsync(Guid tenantId, DateTime fromDate, DateTime toDate);
    }

    public interface IWorkforceInsightsService
    {
        Task<WorkforceHealthScoreDto> CalculateWorkforceHealthScoreAsync(Guid tenantId);
        Task<List<EngagementInsightDto>> GetEngagementInsightsAsync(Guid tenantId);
        Task<List<PerformanceCorrelationDto>> GetPerformanceCorrelationsAsync(Guid tenantId);
        Task<WorkLifeBalanceInsightDto> GetWorkLifeBalanceInsightsAsync(Guid tenantId);
    }

    public interface IAttendancePatternService
    {
        Task<List<AttendancePatternDto>> AnalyzeAttendancePatternsAsync(Guid tenantId, Guid userId);
        Task<List<SeasonalTrendDto>> IdentifySeasonalTrendsAsync(Guid tenantId);
        Task<List<BehavioralInsightDto>> GetBehavioralInsightsAsync(Guid tenantId, Guid userId);
    }

    public class AnalyticsService : IAnalyticsService
    {
        private readonly AttendancePlatformDbContext _context;
        private readonly ILogger<AnalyticsService> _logger;

        public AnalyticsService(AttendancePlatformDbContext context, ILogger<AnalyticsService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<AnalyticsOverviewDto> GetAnalyticsOverviewAsync(Guid tenantId, DateTime fromDate, DateTime toDate)
        {
            try
            {
                var attendanceRecords = await _context.AttendanceRecords
                    .Where(ar => ar.TenantId == tenantId && ar.CheckInTime >= fromDate && ar.CheckInTime <= toDate)
                    .Include(ar => ar.User)
                    .ToListAsync();

                var totalEmployees = await _context.Users
                    .Where(u => u.TenantId == tenantId && u.IsActive)
                    .CountAsync();

                var workingDays = CalculateWorkingDays(fromDate, toDate);
                var expectedAttendance = totalEmployees * workingDays;
                var actualAttendance = attendanceRecords.Count;
                var attendanceRate = expectedAttendance > 0 ? (double)actualAttendance / expectedAttendance * 100 : 0;

                var averageHoursWorked = attendanceRecords
                    .Where(ar => ar.CheckOutTime.HasValue)
                    .Average(ar => (ar.CheckOutTime.Value - ar.CheckInTime).TotalHours);

                var lateArrivals = attendanceRecords
                    .Count(ar => ar.CheckInTime.TimeOfDay > TimeSpan.FromHours(9)); // Assuming 9 AM start time

                var earlyDepartures = attendanceRecords
                    .Where(ar => ar.CheckOutTime.HasValue)
                    .Count(ar => ar.CheckOutTime.Value.TimeOfDay < TimeSpan.FromHours(17)); // Assuming 5 PM end time

                return new AnalyticsOverviewDto
                {
                    TotalEmployees = totalEmployees,
                    AttendanceRate = Math.Round(attendanceRate, 2),
                    AverageHoursWorked = Math.Round(averageHoursWorked, 2),
                    LateArrivals = lateArrivals,
                    EarlyDepartures = earlyDepartures,
                    TotalWorkingDays = workingDays,
                    PresentDays = actualAttendance,
                    AbsentDays = expectedAttendance - actualAttendance
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting analytics overview for tenant {TenantId}", tenantId);
                throw;
            }
        }

        public async Task<List<AttendanceTrendDto>> GetAttendanceTrendsAsync(Guid tenantId, int days)
        {
            try
            {
                var fromDate = DateTime.UtcNow.AddDays(-days);
                var attendanceData = await _context.AttendanceRecords
                    .Where(ar => ar.TenantId == tenantId && ar.CheckInTime >= fromDate)
                    .GroupBy(ar => ar.CheckInTime.Date)
                    .Select(g => new AttendanceTrendDto
                    {
                        Date = g.Key,
                        AttendanceCount = g.Count(),
                        AverageCheckInTime = g.Average(ar => ar.CheckInTime.TimeOfDay.TotalMinutes),
                        AverageHoursWorked = g.Where(ar => ar.CheckOutTime.HasValue)
                                           .Average(ar => (ar.CheckOutTime.Value - ar.CheckInTime).TotalHours)
                    })
                    .OrderBy(t => t.Date)
                    .ToListAsync();

                return attendanceData;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting attendance trends for tenant {TenantId}", tenantId);
                throw;
            }
        }

        public async Task<List<ProductivityMetricDto>> GetProductivityMetricsAsync(Guid tenantId, DateTime fromDate, DateTime toDate)
        {
            try
            {
                var productivityData = await _context.AttendanceRecords
                    .Where(ar => ar.TenantId == tenantId && ar.CheckInTime >= fromDate && ar.CheckInTime <= toDate)
                    .Include(ar => ar.User)
                    .GroupBy(ar => ar.User.Department)
                    .Select(g => new ProductivityMetricDto
                    {
                        Department = g.Key,
                        AverageHoursWorked = g.Where(ar => ar.CheckOutTime.HasValue)
                                           .Average(ar => (ar.CheckOutTime.Value - ar.CheckInTime).TotalHours),
                        AttendanceRate = (double)g.Count() / g.Select(ar => ar.UserId).Distinct().Count(),
                        PunctualityScore = CalculatePunctualityScore(g.ToList()),
                        OverTimeHours = g.Where(ar => ar.CheckOutTime.HasValue)
                                       .Sum(ar => Math.Max(0, (ar.CheckOutTime.Value - ar.CheckInTime).TotalHours - 8))
                    })
                    .ToListAsync();

                return productivityData;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting productivity metrics for tenant {TenantId}", tenantId);
                throw;
            }
        }

        public async Task<List<DepartmentAnalyticsDto>> GetDepartmentAnalyticsAsync(Guid tenantId, DateTime fromDate, DateTime toDate)
        {
            try
            {
                var departmentData = await _context.Users
                    .Where(u => u.TenantId == tenantId && u.IsActive)
                    .GroupBy(u => u.Department)
                    .Select(g => new DepartmentAnalyticsDto
                    {
                        Department = g.Key,
                        TotalEmployees = g.Count(),
                        AttendanceRecords = g.SelectMany(u => u.AttendanceRecords
                            .Where(ar => ar.CheckInTime >= fromDate && ar.CheckInTime <= toDate)).Count(),
                        AverageHoursWorked = g.SelectMany(u => u.AttendanceRecords
                            .Where(ar => ar.CheckInTime >= fromDate && ar.CheckInTime <= toDate && ar.CheckOutTime.HasValue))
                            .Average(ar => (ar.CheckOutTime.Value - ar.CheckInTime).TotalHours),
                        LeaveRequests = g.SelectMany(u => u.LeaveRequests
                            .Where(lr => lr.StartDate >= fromDate && lr.StartDate <= toDate)).Count()
                    })
                    .ToListAsync();

                return departmentData;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting department analytics for tenant {TenantId}", tenantId);
                throw;
            }
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

        private double CalculatePunctualityScore(List<AttendanceRecord> records)
        {
            if (!records.Any()) return 0;

            var onTimeRecords = records.Count(r => r.CheckInTime.TimeOfDay <= TimeSpan.FromHours(9));
            return (double)onTimeRecords / records.Count * 100;
        }
    }

    public class PredictiveAnalyticsService : IPredictiveAnalyticsService
    {
        private readonly AttendancePlatformDbContext _context;
        private readonly MLContext _mlContext;
        private readonly ILogger<PredictiveAnalyticsService> _logger;

        public PredictiveAnalyticsService(AttendancePlatformDbContext context, MLContext mlContext, ILogger<PredictiveAnalyticsService> logger)
        {
            _context = context;
            _mlContext = mlContext;
            _logger = logger;
        }

        public async Task<List<AttendancePredictionDto>> PredictAttendanceAsync(Guid tenantId, int futureDays)
        {
            try
            {
                // Get historical attendance data
                var historicalData = await GetHistoricalAttendanceData(tenantId, 90); // Last 90 days

                // Prepare training data
                var trainingData = historicalData.Select(h => new AttendanceTrainingData
                {
                    DayOfWeek = (float)h.Date.DayOfWeek,
                    Month = h.Date.Month,
                    IsHoliday = IsHoliday(h.Date) ? 1f : 0f,
                    WeatherScore = GetWeatherScore(h.Date), // Simplified weather impact
                    AttendanceCount = h.AttendanceCount
                }).ToList();

                var dataView = _mlContext.Data.LoadFromEnumerable(trainingData);

                // Create ML pipeline
                var pipeline = _mlContext.Transforms.Concatenate("Features", "DayOfWeek", "Month", "IsHoliday", "WeatherScore")
                    .Append(_mlContext.Regression.Trainers.Sdca(labelColumnName: "AttendanceCount", maximumNumberOfIterations: 100));

                // Train the model
                var model = pipeline.Fit(dataView);

                // Make predictions
                var predictions = new List<AttendancePredictionDto>();
                for (int i = 1; i <= futureDays; i++)
                {
                    var futureDate = DateTime.UtcNow.AddDays(i);
                    var predictionInput = new AttendanceTrainingData
                    {
                        DayOfWeek = (float)futureDate.DayOfWeek,
                        Month = futureDate.Month,
                        IsHoliday = IsHoliday(futureDate) ? 1f : 0f,
                        WeatherScore = 0.5f // Default weather score
                    };

                    var predictionEngine = _mlContext.Model.CreatePredictionEngine<AttendanceTrainingData, AttendancePrediction>(model);
                    var prediction = predictionEngine.Predict(predictionInput);

                    predictions.Add(new AttendancePredictionDto
                    {
                        Date = futureDate,
                        PredictedAttendance = Math.Max(0, (int)Math.Round(prediction.PredictedAttendance)),
                        ConfidenceLevel = CalculateConfidenceLevel(prediction.Score)
                    });
                }

                return predictions;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error predicting attendance for tenant {TenantId}", tenantId);
                throw;
            }
        }

        public async Task<List<AbsenteeismRiskDto>> IdentifyAbsenteeismRiskAsync(Guid tenantId)
        {
            try
            {
                var users = await _context.Users
                    .Where(u => u.TenantId == tenantId && u.IsActive)
                    .Include(u => u.AttendanceRecords)
                    .Include(u => u.LeaveRequests)
                    .ToListAsync();

                var riskAnalysis = users.Select(user =>
                {
                    var recentAttendance = user.AttendanceRecords
                        .Where(ar => ar.CheckInTime >= DateTime.UtcNow.AddDays(-30))
                        .ToList();

                    var expectedDays = CalculateWorkingDays(DateTime.UtcNow.AddDays(-30), DateTime.UtcNow);
                    var actualDays = recentAttendance.Count;
                    var attendanceRate = expectedDays > 0 ? (double)actualDays / expectedDays : 0;

                    var lateArrivals = recentAttendance.Count(ar => ar.CheckInTime.TimeOfDay > TimeSpan.FromHours(9));
                    var recentLeaveRequests = user.LeaveRequests.Count(lr => lr.StartDate >= DateTime.UtcNow.AddDays(-90));

                    var riskScore = CalculateAbsenteeismRisk(attendanceRate, lateArrivals, recentLeaveRequests);

                    return new AbsenteeismRiskDto
                    {
                        UserId = user.Id,
                        UserName = $"{user.FirstName} {user.LastName}",
                        Department = user.Department,
                        RiskScore = riskScore,
                        RiskLevel = GetRiskLevel(riskScore),
                        AttendanceRate = Math.Round(attendanceRate * 100, 2),
                        RecentLateArrivals = lateArrivals,
                        RecentLeaveRequests = recentLeaveRequests,
                        Recommendations = GenerateAbsenteeismRecommendations(riskScore, attendanceRate, lateArrivals)
                    };
                }).Where(r => r.RiskScore > 0.3).OrderByDescending(r => r.RiskScore).ToList();

                return riskAnalysis;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error identifying absenteeism risk for tenant {TenantId}", tenantId);
                throw;
            }
        }

        public async Task<List<TurnoverRiskDto>> PredictTurnoverRiskAsync(Guid tenantId)
        {
            try
            {
                var users = await _context.Users
                    .Where(u => u.TenantId == tenantId && u.IsActive)
                    .Include(u => u.AttendanceRecords)
                    .Include(u => u.LeaveRequests)
                    .ToListAsync();

                var turnoverRisk = users.Select(user =>
                {
                    var tenure = (DateTime.UtcNow - user.CreatedAt).TotalDays;
                    var recentAttendance = user.AttendanceRecords
                        .Where(ar => ar.CheckInTime >= DateTime.UtcNow.AddDays(-60))
                        .ToList();

                    var attendanceVariability = CalculateAttendanceVariability(recentAttendance);
                    var leaveFrequency = user.LeaveRequests.Count(lr => lr.StartDate >= DateTime.UtcNow.AddDays(-180));
                    var overtimeHours = recentAttendance
                        .Where(ar => ar.CheckOutTime.HasValue)
                        .Sum(ar => Math.Max(0, (ar.CheckOutTime.Value - ar.CheckInTime).TotalHours - 8));

                    var riskScore = CalculateTurnoverRisk(tenure, attendanceVariability, leaveFrequency, overtimeHours);

                    return new TurnoverRiskDto
                    {
                        UserId = user.Id,
                        UserName = $"{user.FirstName} {user.LastName}",
                        Department = user.Department,
                        TenureMonths = Math.Round(tenure / 30, 1),
                        RiskScore = riskScore,
                        RiskLevel = GetRiskLevel(riskScore),
                        AttendanceVariability = attendanceVariability,
                        RecentLeaveFrequency = leaveFrequency,
                        RecentOvertimeHours = Math.Round(overtimeHours, 1),
                        Recommendations = GenerateTurnoverRecommendations(riskScore, tenure, overtimeHours)
                    };
                }).Where(r => r.RiskScore > 0.4).OrderByDescending(r => r.RiskScore).ToList();

                return turnoverRisk;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error predicting turnover risk for tenant {TenantId}", tenantId);
                throw;
            }
        }

        public async Task<WorkforceCapacityForecastDto> ForecastWorkforceCapacityAsync(Guid tenantId, int futureDays)
        {
            try
            {
                var totalEmployees = await _context.Users
                    .Where(u => u.TenantId == tenantId && u.IsActive)
                    .CountAsync();

                var attendancePredictions = await PredictAttendanceAsync(tenantId, futureDays);
                var scheduledLeave = await GetScheduledLeave(tenantId, futureDays);

                var capacityForecast = attendancePredictions.Select(prediction =>
                {
                    var scheduledLeaveForDate = scheduledLeave
                        .Where(sl => sl.Date.Date == prediction.Date.Date)
                        .Sum(sl => sl.EmployeesOnLeave);

                    var availableCapacity = prediction.PredictedAttendance - scheduledLeaveForDate;
                    var capacityUtilization = totalEmployees > 0 ? (double)availableCapacity / totalEmployees * 100 : 0;

                    return new DailyCapacityForecastDto
                    {
                        Date = prediction.Date,
                        TotalEmployees = totalEmployees,
                        PredictedAttendance = prediction.PredictedAttendance,
                        ScheduledLeave = scheduledLeaveForDate,
                        AvailableCapacity = Math.Max(0, availableCapacity),
                        CapacityUtilization = Math.Round(capacityUtilization, 2),
                        CapacityStatus = GetCapacityStatus(capacityUtilization)
                    };
                }).ToList();

                return new WorkforceCapacityForecastDto
                {
                    TenantId = tenantId,
                    ForecastPeriod = futureDays,
                    TotalEmployees = totalEmployees,
                    DailyForecasts = capacityForecast,
                    AverageCapacityUtilization = capacityForecast.Average(cf => cf.CapacityUtilization),
                    PeakCapacityDate = capacityForecast.OrderByDescending(cf => cf.CapacityUtilization).First().Date,
                    LowCapacityDate = capacityForecast.OrderBy(cf => cf.CapacityUtilization).First().Date
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error forecasting workforce capacity for tenant {TenantId}", tenantId);
                throw;
            }
        }

        // Helper methods
        private async Task<List<HistoricalAttendanceDto>> GetHistoricalAttendanceData(Guid tenantId, int days)
        {
            var fromDate = DateTime.UtcNow.AddDays(-days);
            return await _context.AttendanceRecords
                .Where(ar => ar.TenantId == tenantId && ar.CheckInTime >= fromDate)
                .GroupBy(ar => ar.CheckInTime.Date)
                .Select(g => new HistoricalAttendanceDto
                {
                    Date = g.Key,
                    AttendanceCount = g.Count()
                })
                .OrderBy(h => h.Date)
                .ToListAsync();
        }

        private bool IsHoliday(DateTime date)
        {
            // Simplified holiday detection - in real implementation, use a holiday API or database
            var holidays = new[]
            {
                new DateTime(date.Year, 1, 1),   // New Year
                new DateTime(date.Year, 7, 4),   // Independence Day
                new DateTime(date.Year, 12, 25)  // Christmas
            };
            return holidays.Contains(date.Date);
        }

        private float GetWeatherScore(DateTime date)
        {
            // Simplified weather impact - in real implementation, integrate with weather API
            return 0.5f; // Neutral weather impact
        }

        private double CalculateConfidenceLevel(float score)
        {
            return Math.Min(95, Math.Max(60, 80 + (score * 10))); // Confidence between 60-95%
        }

        private double CalculateAbsenteeismRisk(double attendanceRate, int lateArrivals, int recentLeaveRequests)
        {
            var attendanceRisk = 1 - attendanceRate;
            var lateArrivalRisk = Math.Min(1, lateArrivals / 10.0);
            var leaveRisk = Math.Min(1, recentLeaveRequests / 5.0);

            return (attendanceRisk * 0.5) + (lateArrivalRisk * 0.3) + (leaveRisk * 0.2);
        }

        private double CalculateTurnoverRisk(double tenure, double attendanceVariability, int leaveFrequency, double overtimeHours)
        {
            var tenureRisk = tenure < 365 ? 0.8 : Math.Max(0, 1 - (tenure / 1095)); // Higher risk in first year
            var variabilityRisk = Math.Min(1, attendanceVariability / 0.5);
            var leaveRisk = Math.Min(1, leaveFrequency / 8.0);
            var overtimeRisk = Math.Min(1, overtimeHours / 40.0);

            return (tenureRisk * 0.3) + (variabilityRisk * 0.25) + (leaveRisk * 0.2) + (overtimeRisk * 0.25);
        }

        private double CalculateAttendanceVariability(List<AttendanceRecord> records)
        {
            if (records.Count < 2) return 0;

            var checkInTimes = records.Select(r => r.CheckInTime.TimeOfDay.TotalMinutes).ToList();
            var mean = checkInTimes.Average();
            var variance = checkInTimes.Sum(t => Math.Pow(t - mean, 2)) / checkInTimes.Count;
            return Math.Sqrt(variance) / 60; // Convert to hours
        }

        private string GetRiskLevel(double riskScore)
        {
            return riskScore switch
            {
                >= 0.8 => "Critical",
                >= 0.6 => "High",
                >= 0.4 => "Medium",
                >= 0.2 => "Low",
                _ => "Minimal"
            };
        }

        private List<string> GenerateAbsenteeismRecommendations(double riskScore, double attendanceRate, int lateArrivals)
        {
            var recommendations = new List<string>();

            if (attendanceRate < 0.8)
                recommendations.Add("Schedule one-on-one meeting to discuss attendance concerns");

            if (lateArrivals > 5)
                recommendations.Add("Implement flexible start time or discuss commute challenges");

            if (riskScore > 0.7)
                recommendations.Add("Consider employee assistance program referral");

            return recommendations;
        }

        private List<string> GenerateTurnoverRecommendations(double riskScore, double tenure, double overtimeHours)
        {
            var recommendations = new List<string>();

            if (tenure < 180)
                recommendations.Add("Enhance onboarding and mentorship program");

            if (overtimeHours > 20)
                recommendations.Add("Review workload distribution and consider additional resources");

            if (riskScore > 0.6)
                recommendations.Add("Conduct stay interview to understand retention factors");

            return recommendations;
        }

        private async Task<List<ScheduledLeaveDto>> GetScheduledLeave(Guid tenantId, int futureDays)
        {
            var fromDate = DateTime.UtcNow;
            var toDate = fromDate.AddDays(futureDays);

            return await _context.LeaveRequests
                .Where(lm => lm.TenantId == tenantId && 
                           lm.Status == LeaveRequestStatus.Approved && 
                           lm.StartDate <= toDate && 
                           lm.EndDate >= fromDate)
                .GroupBy(lm => lm.StartDate.Date)
                .Select(g => new ScheduledLeaveDto
                {
                    Date = g.Key,
                    EmployeesOnLeave = g.Count()
                })
                .ToListAsync();
        }

        private string GetCapacityStatus(double utilization)
        {
            return utilization switch
            {
                >= 90 => "Optimal",
                >= 75 => "Good",
                >= 60 => "Adequate",
                >= 40 => "Low",
                _ => "Critical"
            };
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
    }

    // ML.NET Training Data Models
    public class AttendanceTrainingData
    {
        public float DayOfWeek { get; set; }
        public float Month { get; set; }
        public float IsHoliday { get; set; }
        public float WeatherScore { get; set; }
        public float AttendanceCount { get; set; }
    }

    public class AttendancePrediction
    {
        [ColumnName("Score")]
        public float PredictedAttendance { get; set; }
        public float Score { get; set; }
    }

    // DTOs
    public class AnalyticsOverviewDto
    {
        public int TotalEmployees { get; set; }
        public double AttendanceRate { get; set; }
        public double AverageHoursWorked { get; set; }
        public int LateArrivals { get; set; }
        public int EarlyDepartures { get; set; }
        public int TotalWorkingDays { get; set; }
        public int PresentDays { get; set; }
        public int AbsentDays { get; set; }
    }

    public class AttendanceTrendDto
    {
        public DateTime Date { get; set; }
        public int AttendanceCount { get; set; }
        public double AverageCheckInTime { get; set; }
        public double AverageHoursWorked { get; set; }
    }

    public class ProductivityMetricDto
    {
        public string Department { get; set; } = string.Empty;
        public double AverageHoursWorked { get; set; }
        public double AttendanceRate { get; set; }
        public double PunctualityScore { get; set; }
        public double OverTimeHours { get; set; }
    }

    public class DepartmentAnalyticsDto
    {
        public string Department { get; set; } = string.Empty;
        public int TotalEmployees { get; set; }
        public int AttendanceRecords { get; set; }
        public double AverageHoursWorked { get; set; }
        public int LeaveRequests { get; set; }
    }

    public class AttendancePredictionDto
    {
        public DateTime Date { get; set; }
        public int PredictedAttendance { get; set; }
        public double ConfidenceLevel { get; set; }
    }

    public class AbsenteeismRiskDto
    {
        public Guid UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public double RiskScore { get; set; }
        public string RiskLevel { get; set; } = string.Empty;
        public double AttendanceRate { get; set; }
        public int RecentLateArrivals { get; set; }
        public int RecentLeaveRequests { get; set; }
        public List<string> Recommendations { get; set; } = new();
    }

    public class TurnoverRiskDto
    {
        public Guid UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public double TenureMonths { get; set; }
        public double RiskScore { get; set; }
        public string RiskLevel { get; set; } = string.Empty;
        public double AttendanceVariability { get; set; }
        public int RecentLeaveFrequency { get; set; }
        public double RecentOvertimeHours { get; set; }
        public List<string> Recommendations { get; set; } = new();
    }

    public class WorkforceCapacityForecastDto
    {
        public Guid TenantId { get; set; }
        public int ForecastPeriod { get; set; }
        public int TotalEmployees { get; set; }
        public List<DailyCapacityForecastDto> DailyForecasts { get; set; } = new();
        public double AverageCapacityUtilization { get; set; }
        public DateTime PeakCapacityDate { get; set; }
        public DateTime LowCapacityDate { get; set; }
    }

    public class DailyCapacityForecastDto
    {
        public DateTime Date { get; set; }
        public int TotalEmployees { get; set; }
        public int PredictedAttendance { get; set; }
        public int ScheduledLeave { get; set; }
        public int AvailableCapacity { get; set; }
        public double CapacityUtilization { get; set; }
        public string CapacityStatus { get; set; } = string.Empty;
    }

    public class HistoricalAttendanceDto
    {
        public DateTime Date { get; set; }
        public int AttendanceCount { get; set; }
    }

    public class ScheduledLeaveDto
    {
        public DateTime Date { get; set; }
        public int EmployeesOnLeave { get; set; }
    }

    public class AttendanceAnomalyDto
    {
        public Guid UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public string AnomalyType { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public double Severity { get; set; }
    }

    public class LocationAnomalyDto
    {
        public Guid UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public double DistanceFromOffice { get; set; }
        public string Reason { get; set; } = string.Empty;
    }

    public class TimeAnomalyDto
    {
        public Guid UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public TimeSpan CheckInTime { get; set; }
        public TimeSpan? CheckOutTime { get; set; }
        public string AnomalyType { get; set; } = string.Empty;
        public double DeviationHours { get; set; }
    }

    public class WorkforceHealthScoreDto
    {
        public double OverallScore { get; set; }
        public double AttendanceScore { get; set; }
        public double EngagementScore { get; set; }
        public double ProductivityScore { get; set; }
        public double RetentionScore { get; set; }
        public List<string> Recommendations { get; set; } = new();
    }

    public class EngagementInsightDto
    {
        public string Category { get; set; } = string.Empty;
        public double Score { get; set; }
        public string Trend { get; set; } = string.Empty;
        public List<string> Factors { get; set; } = new();
    }

    public class PerformanceCorrelationDto
    {
        public string Factor { get; set; } = string.Empty;
        public double CorrelationStrength { get; set; }
        public string Impact { get; set; } = string.Empty;
        public string Recommendation { get; set; } = string.Empty;
    }

    public class WorkLifeBalanceInsightDto
    {
        public double OverallScore { get; set; }
        public double AverageWorkHours { get; set; }
        public double OvertimeFrequency { get; set; }
        public double FlexibilityScore { get; set; }
        public List<string> Recommendations { get; set; } = new();
    }

    public class AttendancePatternDto
    {
        public string PatternType { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public double Frequency { get; set; }
        public List<string> Recommendations { get; set; } = new();
    }

    public class SeasonalTrendDto
    {
        public string Season { get; set; } = string.Empty;
        public double AttendanceRate { get; set; }
        public string Trend { get; set; } = string.Empty;
        public List<string> Factors { get; set; } = new();
    }

    public class BehavioralInsightDto
    {
        public string Behavior { get; set; } = string.Empty;
        public double Frequency { get; set; }
        public string Impact { get; set; } = string.Empty;
        public List<string> Suggestions { get; set; } = new();
    }
}

