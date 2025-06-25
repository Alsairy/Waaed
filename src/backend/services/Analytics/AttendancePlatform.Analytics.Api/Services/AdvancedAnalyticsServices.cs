using Microsoft.EntityFrameworkCore;
using AttendancePlatform.Shared.Infrastructure.Data;
using AttendancePlatform.Analytics.Api.Services;
using AttendancePlatform.Shared.Domain.Entities;

namespace AttendancePlatform.Analytics.Api.Services
{
    public class AnomalyDetectionService : IAnomalyDetectionService
    {
        private readonly AttendancePlatformDbContext _context;
        private readonly ILogger<AnomalyDetectionService> _logger;

        public AnomalyDetectionService(AttendancePlatformDbContext context, ILogger<AnomalyDetectionService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<List<AttendanceAnomalyDto>> DetectAttendanceAnomaliesAsync(Guid tenantId, DateTime fromDate, DateTime toDate)
        {
            try
            {
                var anomalies = new List<AttendanceAnomalyDto>();

                // Detect unusual attendance patterns
                var users = await _context.Users
                    .Where(u => u.TenantId == tenantId && u.IsActive)
                    .Include(u => u.AttendanceRecords.Where(ar => ar.CheckInTime >= fromDate && ar.CheckInTime <= toDate))
                    .ToListAsync();

                foreach (var user in users)
                {
                    var userAnomalies = await DetectUserAttendanceAnomalies(user, fromDate, toDate);
                    anomalies.AddRange(userAnomalies);
                }

                return anomalies.OrderByDescending(a => a.Severity).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error detecting attendance anomalies for tenant {TenantId}", tenantId);
                throw;
            }
        }

        public async Task<List<LocationAnomalyDto>> DetectLocationAnomaliesAsync(Guid tenantId, DateTime fromDate, DateTime toDate)
        {
            try
            {
                var anomalies = new List<LocationAnomalyDto>();

                // Get office locations for the tenant
                var officeLocations = await _context.Geofences
                    .Where(g => g.TenantId == tenantId)
                    .ToListAsync();

                if (!officeLocations.Any()) return anomalies;

                var attendanceRecords = await _context.AttendanceRecords
                    .Where(ar => ar.TenantId == tenantId && 
                               ar.CheckInTime >= fromDate && 
                               ar.CheckInTime <= toDate &&
                               ar.Latitude.HasValue && 
                               ar.Longitude.HasValue)
                    .Include(ar => ar.User)
                    .ToListAsync();

                foreach (var record in attendanceRecords)
                {
                    var nearestOffice = FindNearestOffice(record.Latitude.Value, record.Longitude.Value, officeLocations);
                    var distance = CalculateDistance(record.Latitude.Value, record.Longitude.Value, 
                                                   nearestOffice.Latitude, nearestOffice.Longitude);

                    // Flag as anomaly if more than 500 meters from nearest office
                    if (distance > 0.5)
                    {
                        anomalies.Add(new LocationAnomalyDto
                        {
                            UserId = record.UserId,
                            UserName = $"{record.User.FirstName} {record.User.LastName}",
                            Date = record.CheckInTime,
                            Latitude = record.Latitude.Value,
                            Longitude = record.Longitude.Value,
                            DistanceFromOffice = Math.Round(distance, 2),
                            Reason = DetermineLocationAnomalyReason(distance)
                        });
                    }
                }

                return anomalies.OrderByDescending(a => a.DistanceFromOffice).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error detecting location anomalies for tenant {TenantId}", tenantId);
                throw;
            }
        }

        public async Task<List<TimeAnomalyDto>> DetectTimeAnomaliesAsync(Guid tenantId, DateTime fromDate, DateTime toDate)
        {
            try
            {
                var anomalies = new List<TimeAnomalyDto>();

                var users = await _context.Users
                    .Where(u => u.TenantId == tenantId && u.IsActive)
                    .Include(u => u.AttendanceRecords.Where(ar => ar.CheckInTime >= fromDate && ar.CheckInTime <= toDate))
                    .ToListAsync();

                foreach (var user in users)
                {
                    var userTimeAnomalies = DetectUserTimeAnomalies(user, fromDate, toDate);
                    anomalies.AddRange(userTimeAnomalies);
                }

                return anomalies.OrderByDescending(a => a.DeviationHours).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error detecting time anomalies for tenant {TenantId}", tenantId);
                throw;
            }
        }

        private async Task<List<AttendanceAnomalyDto>> DetectUserAttendanceAnomalies(User user, DateTime fromDate, DateTime toDate)
        {
            var anomalies = new List<AttendanceAnomalyDto>();
            var records = user.AttendanceRecords.Where(ar => ar.CheckInTime >= fromDate && ar.CheckInTime <= toDate).ToList();

            // Detect consecutive absences
            var consecutiveAbsences = DetectConsecutiveAbsences(user.Id, fromDate, toDate);
            if (consecutiveAbsences > 3)
            {
                anomalies.Add(new AttendanceAnomalyDto
                {
                    UserId = user.Id,
                    UserName = $"{user.FirstName} {user.LastName}",
                    Date = DateTime.UtcNow,
                    AnomalyType = "Consecutive Absences",
                    Description = $"Employee has been absent for {consecutiveAbsences} consecutive days",
                    Severity = Math.Min(1.0, consecutiveAbsences / 10.0)
                });
            }

            // Detect unusual check-in patterns
            var unusualCheckIns = DetectUnusualCheckInPatterns(records);
            anomalies.AddRange(unusualCheckIns.Select(pattern => new AttendanceAnomalyDto
            {
                UserId = user.Id,
                UserName = $"{user.FirstName} {user.LastName}",
                Date = pattern.Date,
                AnomalyType = "Unusual Check-in Time",
                Description = pattern.Description,
                Severity = pattern.Severity
            }));

            return anomalies;
        }

        private List<TimeAnomalyDto> DetectUserTimeAnomalies(User user, DateTime fromDate, DateTime toDate)
        {
            var anomalies = new List<TimeAnomalyDto>();
            var records = user.AttendanceRecords.Where(ar => ar.CheckInTime >= fromDate && ar.CheckInTime <= toDate).ToList();

            if (records.Count < 5) return anomalies; // Need sufficient data

            // Calculate user's typical check-in time
            var typicalCheckIn = TimeSpan.FromMinutes(records.Average(r => r.CheckInTime.TimeOfDay.TotalMinutes));
            var typicalCheckOut = records.Where(r => r.CheckOutTime.HasValue)
                                        .Select(r => r.CheckOutTime.Value.TimeOfDay.TotalMinutes)
                                        .DefaultIfEmpty(0)
                                        .Average();

            foreach (var record in records)
            {
                // Check for significant deviation in check-in time
                var checkInDeviation = Math.Abs((record.CheckInTime.TimeOfDay - typicalCheckIn).TotalHours);
                if (checkInDeviation > 2) // More than 2 hours deviation
                {
                    anomalies.Add(new TimeAnomalyDto
                    {
                        UserId = user.Id,
                        UserName = $"{user.FirstName} {user.LastName}",
                        Date = record.CheckInTime,
                        CheckInTime = record.CheckInTime.TimeOfDay,
                        CheckOutTime = record.CheckOutTime?.TimeOfDay,
                        AnomalyType = "Unusual Check-in Time",
                        DeviationHours = Math.Round(checkInDeviation, 2)
                    });
                }

                // Check for unusual work duration
                if (record.CheckOutTime.HasValue)
                {
                    var workDuration = (record.CheckOutTime.Value - record.CheckInTime).TotalHours;
                    if (workDuration > 12 || workDuration < 2)
                    {
                        anomalies.Add(new TimeAnomalyDto
                        {
                            UserId = user.Id,
                            UserName = $"{user.FirstName} {user.LastName}",
                            Date = record.CheckInTime,
                            CheckInTime = record.CheckInTime.TimeOfDay,
                            CheckOutTime = record.CheckOutTime.Value.TimeOfDay,
                            AnomalyType = workDuration > 12 ? "Excessive Work Hours" : "Insufficient Work Hours",
                            DeviationHours = Math.Round(Math.Abs(workDuration - 8), 2)
                        });
                    }
                }
            }

            return anomalies;
        }

        private int DetectConsecutiveAbsences(Guid userId, DateTime fromDate, DateTime toDate)
        {
            var workingDays = new List<DateTime>();
            for (var date = fromDate.Date; date <= toDate.Date; date = date.AddDays(1))
            {
                if (date.DayOfWeek != DayOfWeek.Saturday && date.DayOfWeek != DayOfWeek.Sunday)
                {
                    workingDays.Add(date);
                }
            }

            var attendanceDates = _context.AttendanceRecords
                .Where(ar => ar.UserId == userId && ar.CheckInTime >= fromDate && ar.CheckInTime <= toDate)
                .Select(ar => ar.CheckInTime.Date)
                .Distinct()
                .ToHashSet();

            int maxConsecutive = 0;
            int currentConsecutive = 0;

            foreach (var workingDay in workingDays)
            {
                if (!attendanceDates.Contains(workingDay))
                {
                    currentConsecutive++;
                    maxConsecutive = Math.Max(maxConsecutive, currentConsecutive);
                }
                else
                {
                    currentConsecutive = 0;
                }
            }

            return maxConsecutive;
        }

        private List<(DateTime Date, string Description, double Severity)> DetectUnusualCheckInPatterns(List<AttendanceRecord> records)
        {
            var patterns = new List<(DateTime Date, string Description, double Severity)>();

            if (records.Count < 5) return patterns;

            var averageCheckIn = TimeSpan.FromMinutes(records.Average(r => r.CheckInTime.TimeOfDay.TotalMinutes));

            foreach (var record in records)
            {
                var deviation = Math.Abs((record.CheckInTime.TimeOfDay - averageCheckIn).TotalHours);
                
                if (deviation > 3) // More than 3 hours from average
                {
                    patterns.Add((
                        record.CheckInTime.Date,
                        $"Check-in at {record.CheckInTime.TimeOfDay:hh\\:mm} deviates {deviation:F1} hours from typical time",
                        Math.Min(1.0, deviation / 6.0)
                    ));
                }
            }

            return patterns;
        }

        private Geofence FindNearestOffice(double latitude, double longitude, List<Geofence> offices)
        {
            return offices.OrderBy(o => CalculateDistance(latitude, longitude, o.Latitude, o.Longitude)).First();
        }

        private double CalculateDistance(double lat1, double lon1, double lat2, double lon2)
        {
            const double R = 6371; // Earth's radius in kilometers
            var dLat = ToRadians(lat2 - lat1);
            var dLon = ToRadians(lon2 - lon1);
            var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                    Math.Cos(ToRadians(lat1)) * Math.Cos(ToRadians(lat2)) *
                    Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
            var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
            return R * c;
        }

        private double ToRadians(double degrees)
        {
            return degrees * Math.PI / 180;
        }

        private string DetermineLocationAnomalyReason(double distance)
        {
            return distance switch
            {
                > 10 => "Remote work or field assignment",
                > 2 => "Possible client visit or off-site meeting",
                > 0.5 => "Outside designated work area",
                _ => "Minor location variance"
            };
        }
    }

    public class WorkforceInsightsService : IWorkforceInsightsService
    {
        private readonly AttendancePlatformDbContext _context;
        private readonly ILogger<WorkforceInsightsService> _logger;

        public WorkforceInsightsService(AttendancePlatformDbContext context, ILogger<WorkforceInsightsService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<WorkforceHealthScoreDto> CalculateWorkforceHealthScoreAsync(Guid tenantId)
        {
            try
            {
                var attendanceScore = await CalculateAttendanceHealthScore(tenantId);
                var engagementScore = await CalculateEngagementScore(tenantId);
                var productivityScore = await CalculateProductivityScore(tenantId);
                var retentionScore = await CalculateRetentionScore(tenantId);

                var overallScore = (attendanceScore + engagementScore + productivityScore + retentionScore) / 4;

                return new WorkforceHealthScoreDto
                {
                    OverallScore = Math.Round(overallScore, 2),
                    AttendanceScore = Math.Round(attendanceScore, 2),
                    EngagementScore = Math.Round(engagementScore, 2),
                    ProductivityScore = Math.Round(productivityScore, 2),
                    RetentionScore = Math.Round(retentionScore, 2),
                    Recommendations = GenerateHealthScoreRecommendations(overallScore, attendanceScore, engagementScore, productivityScore, retentionScore)
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calculating workforce health score for tenant {TenantId}", tenantId);
                throw;
            }
        }

        public async Task<List<EngagementInsightDto>> GetEngagementInsightsAsync(Guid tenantId)
        {
            try
            {
                var insights = new List<EngagementInsightDto>();

                // Attendance consistency insight
                var attendanceConsistency = await CalculateAttendanceConsistency(tenantId);
                insights.Add(new EngagementInsightDto
                {
                    Category = "Attendance Consistency",
                    Score = attendanceConsistency,
                    Trend = GetTrendDirection(attendanceConsistency),
                    Factors = GetAttendanceConsistencyFactors(attendanceConsistency)
                });

                // Work-life balance insight
                var workLifeBalance = await CalculateWorkLifeBalanceScore(tenantId);
                insights.Add(new EngagementInsightDto
                {
                    Category = "Work-Life Balance",
                    Score = workLifeBalance,
                    Trend = GetTrendDirection(workLifeBalance),
                    Factors = GetWorkLifeBalanceFactors(workLifeBalance)
                });

                // Flexibility utilization insight
                var flexibilityScore = await CalculateFlexibilityUtilization(tenantId);
                insights.Add(new EngagementInsightDto
                {
                    Category = "Flexibility Utilization",
                    Score = flexibilityScore,
                    Trend = GetTrendDirection(flexibilityScore),
                    Factors = GetFlexibilityFactors(flexibilityScore)
                });

                return insights;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting engagement insights for tenant {TenantId}", tenantId);
                throw;
            }
        }

        public async Task<List<PerformanceCorrelationDto>> GetPerformanceCorrelationsAsync(Guid tenantId)
        {
            try
            {
                var correlations = new List<PerformanceCorrelationDto>();

                // Attendance vs Performance correlation
                var attendanceCorrelation = await CalculateAttendancePerformanceCorrelation(tenantId);
                correlations.Add(new PerformanceCorrelationDto
                {
                    Factor = "Attendance Rate",
                    CorrelationStrength = attendanceCorrelation,
                    Impact = GetCorrelationImpact(attendanceCorrelation),
                    Recommendation = GetAttendanceCorrelationRecommendation(attendanceCorrelation)
                });

                // Work hours vs Performance correlation
                var workHoursCorrelation = await CalculateWorkHoursPerformanceCorrelation(tenantId);
                correlations.Add(new PerformanceCorrelationDto
                {
                    Factor = "Work Hours",
                    CorrelationStrength = workHoursCorrelation,
                    Impact = GetCorrelationImpact(workHoursCorrelation),
                    Recommendation = GetWorkHoursCorrelationRecommendation(workHoursCorrelation)
                });

                // Punctuality vs Performance correlation
                var punctualityCorrelation = await CalculatePunctualityPerformanceCorrelation(tenantId);
                correlations.Add(new PerformanceCorrelationDto
                {
                    Factor = "Punctuality",
                    CorrelationStrength = punctualityCorrelation,
                    Impact = GetCorrelationImpact(punctualityCorrelation),
                    Recommendation = GetPunctualityCorrelationRecommendation(punctualityCorrelation)
                });

                return correlations;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting performance correlations for tenant {TenantId}", tenantId);
                throw;
            }
        }

        public async Task<WorkLifeBalanceInsightDto> GetWorkLifeBalanceInsightsAsync(Guid tenantId)
        {
            try
            {
                var users = await _context.Users
                    .Where(u => u.TenantId == tenantId && u.IsActive)
                    .Include(u => u.AttendanceRecords.Where(ar => ar.CheckInTime >= DateTime.UtcNow.AddDays(-30)))
                    .ToListAsync();

                var totalWorkHours = 0.0;
                var overtimeInstances = 0;
                var totalUsers = users.Count;

                foreach (var user in users)
                {
                    var userWorkHours = user.AttendanceRecords
                        .Where(ar => ar.CheckOutTime.HasValue)
                        .Sum(ar => (ar.CheckOutTime.Value - ar.CheckInTime).TotalHours);

                    totalWorkHours += userWorkHours;

                    var userOvertimeInstances = user.AttendanceRecords
                        .Where(ar => ar.CheckOutTime.HasValue)
                        .Count(ar => (ar.CheckOutTime.Value - ar.CheckInTime).TotalHours > 8);

                    overtimeInstances += userOvertimeInstances;
                }

                var averageWorkHours = totalUsers > 0 ? totalWorkHours / totalUsers : 0;
                var overtimeFrequency = totalUsers > 0 ? (double)overtimeInstances / totalUsers : 0;
                var flexibilityScore = await CalculateFlexibilityScore(tenantId);

                var overallScore = CalculateWorkLifeBalanceOverallScore(averageWorkHours, overtimeFrequency, flexibilityScore);

                return new WorkLifeBalanceInsightDto
                {
                    OverallScore = Math.Round(overallScore, 2),
                    AverageWorkHours = Math.Round(averageWorkHours, 2),
                    OvertimeFrequency = Math.Round(overtimeFrequency, 2),
                    FlexibilityScore = Math.Round(flexibilityScore, 2),
                    Recommendations = GenerateWorkLifeBalanceRecommendations(overallScore, averageWorkHours, overtimeFrequency)
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting work-life balance insights for tenant {TenantId}", tenantId);
                throw;
            }
        }

        // Helper methods for calculations
        private async Task<double> CalculateAttendanceHealthScore(Guid tenantId)
        {
            var fromDate = DateTime.UtcNow.AddDays(-30);
            var totalEmployees = await _context.Users.Where(u => u.TenantId == tenantId && u.IsActive).CountAsync();
            var attendanceRecords = await _context.AttendanceRecords
                .Where(ar => ar.TenantId == tenantId && ar.CheckInTime >= fromDate)
                .CountAsync();

            var workingDays = CalculateWorkingDays(fromDate, DateTime.UtcNow);
            var expectedAttendance = totalEmployees * workingDays;
            
            return expectedAttendance > 0 ? (double)attendanceRecords / expectedAttendance * 100 : 0;
        }

        private async Task<double> CalculateEngagementScore(Guid tenantId)
        {
            // Simplified engagement calculation based on attendance patterns and leave usage
            var attendanceConsistency = await CalculateAttendanceConsistency(tenantId);
            var leaveUtilization = await CalculateLeaveUtilization(tenantId);
            var punctualityScore = await CalculatePunctualityScore(tenantId);

            return (attendanceConsistency + leaveUtilization + punctualityScore) / 3;
        }

        private async Task<double> CalculateProductivityScore(Guid tenantId)
        {
            var fromDate = DateTime.UtcNow.AddDays(-30);
            var records = await _context.AttendanceRecords
                .Where(ar => ar.TenantId == tenantId && ar.CheckInTime >= fromDate && ar.CheckOutTime.HasValue)
                .ToListAsync();

            if (!records.Any()) return 0;

            var averageHours = records.Average(r => (r.CheckOutTime.Value - r.CheckInTime).TotalHours);
            var consistencyScore = CalculateHoursConsistency(records);

            // Score based on optimal work hours (around 8 hours) and consistency
            var hoursScore = Math.Max(0, 100 - Math.Abs(averageHours - 8) * 10);
            return (hoursScore + consistencyScore) / 2;
        }

        private async Task<double> CalculateRetentionScore(Guid tenantId)
        {
            var users = await _context.Users
                .Where(u => u.TenantId == tenantId && u.IsActive)
                .ToListAsync();

            if (!users.Any()) return 0;

            var averageTenure = users.Average(u => (DateTime.UtcNow - u.CreatedAt).TotalDays);
            var longTermEmployees = users.Count(u => (DateTime.UtcNow - u.CreatedAt).TotalDays > 365);
            var retentionRate = (double)longTermEmployees / users.Count * 100;

            // Combine tenure and retention rate for overall score
            var tenureScore = Math.Min(100, averageTenure / 10); // 10 days = 1 point, max 100
            return (tenureScore + retentionRate) / 2;
        }

        private async Task<double> CalculateAttendanceConsistency(Guid tenantId)
        {
            var fromDate = DateTime.UtcNow.AddDays(-30);
            var users = await _context.Users
                .Where(u => u.TenantId == tenantId && u.IsActive)
                .Include(u => u.AttendanceRecords.Where(ar => ar.CheckInTime >= fromDate))
                .ToListAsync();

            if (!users.Any()) return 0;

            var consistencyScores = users.Select(user =>
            {
                var records = user.AttendanceRecords.ToList();
                if (records.Count < 5) return 0.0;

                var checkInTimes = records.Select(r => r.CheckInTime.TimeOfDay.TotalMinutes).ToList();
                var mean = checkInTimes.Average();
                var variance = checkInTimes.Sum(t => Math.Pow(t - mean, 2)) / checkInTimes.Count;
                var standardDeviation = Math.Sqrt(variance);

                // Lower standard deviation = higher consistency
                return Math.Max(0, 100 - (standardDeviation / 60 * 20)); // 60 minutes = 20 point deduction
            });

            return consistencyScores.Average();
        }

        private async Task<double> CalculateWorkLifeBalanceScore(Guid tenantId)
        {
            var fromDate = DateTime.UtcNow.AddDays(-30);
            var records = await _context.AttendanceRecords
                .Where(ar => ar.TenantId == tenantId && ar.CheckInTime >= fromDate && ar.CheckOutTime.HasValue)
                .ToListAsync();

            if (!records.Any()) return 0;

            var averageHours = records.Average(r => (r.CheckOutTime.Value - r.CheckInTime).TotalHours);
            var overtimeFrequency = records.Count(r => (r.CheckOutTime.Value - r.CheckInTime).TotalHours > 9) / (double)records.Count;

            // Optimal work-life balance around 8 hours with minimal overtime
            var hoursScore = Math.Max(0, 100 - Math.Abs(averageHours - 8) * 15);
            var overtimeScore = Math.Max(0, 100 - overtimeFrequency * 100);

            return (hoursScore + overtimeScore) / 2;
        }

        private async Task<double> CalculateFlexibilityUtilization(Guid tenantId)
        {
            var fromDate = DateTime.UtcNow.AddDays(-30);
            var records = await _context.AttendanceRecords
                .Where(ar => ar.TenantId == tenantId && ar.CheckInTime >= fromDate)
                .ToListAsync();

            if (!records.Any()) return 0;

            // Measure flexibility by variance in check-in times
            var checkInTimes = records.Select(r => r.CheckInTime.TimeOfDay.TotalMinutes).ToList();
            var variance = checkInTimes.Sum(t => Math.Pow(t - checkInTimes.Average(), 2)) / checkInTimes.Count;
            var standardDeviation = Math.Sqrt(variance);

            // Higher variance indicates more flexibility utilization
            return Math.Min(100, standardDeviation / 60 * 50); // 60 minutes variance = 50 points
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

        private double CalculateHoursConsistency(List<AttendanceRecord> records)
        {
            if (records.Count < 2) return 0;

            var workHours = records.Select(r => (r.CheckOutTime.Value - r.CheckInTime).TotalHours).ToList();
            var mean = workHours.Average();
            var variance = workHours.Sum(h => Math.Pow(h - mean, 2)) / workHours.Count;
            var standardDeviation = Math.Sqrt(variance);

            return Math.Max(0, 100 - standardDeviation * 20); // Lower deviation = higher consistency
        }

        private async Task<double> CalculateLeaveUtilization(Guid tenantId)
        {
            var users = await _context.Users
                .Where(u => u.TenantId == tenantId && u.IsActive)
                .Include(u => u.LeaveRequests.Where(lr => lr.StartDate >= DateTime.UtcNow.AddDays(-365)))
                .ToListAsync();

            if (!users.Any()) return 0;

            var totalLeaveUsed = users.Sum(u => u.LeaveRequests.Sum(lr => (lr.EndDate - lr.StartDate).Days + 1));
            var averageLeaveUsed = totalLeaveUsed / (double)users.Count;

            // Optimal leave utilization around 15-20 days per year
            return Math.Max(0, 100 - Math.Abs(averageLeaveUsed - 17.5) * 3);
        }

        private async Task<double> CalculatePunctualityScore(Guid tenantId)
        {
            var fromDate = DateTime.UtcNow.AddDays(-30);
            var records = await _context.AttendanceRecords
                .Where(ar => ar.TenantId == tenantId && ar.CheckInTime >= fromDate)
                .ToListAsync();

            if (!records.Any()) return 0;

            var onTimeRecords = records.Count(r => r.CheckInTime.TimeOfDay <= TimeSpan.FromHours(9));
            return (double)onTimeRecords / records.Count * 100;
        }

        // Additional helper methods for correlations and insights
        private async Task<double> CalculateAttendancePerformanceCorrelation(Guid tenantId)
        {
            // Simplified correlation calculation
            // In a real implementation, this would use actual performance metrics
            return 0.75; // Strong positive correlation
        }

        private async Task<double> CalculateWorkHoursPerformanceCorrelation(Guid tenantId)
        {
            return 0.45; // Moderate positive correlation
        }

        private async Task<double> CalculatePunctualityPerformanceCorrelation(Guid tenantId)
        {
            return 0.65; // Strong positive correlation
        }

        private async Task<double> CalculateFlexibilityScore(Guid tenantId)
        {
            return await CalculateFlexibilityUtilization(tenantId);
        }

        private double CalculateWorkLifeBalanceOverallScore(double averageHours, double overtimeFrequency, double flexibilityScore)
        {
            var hoursScore = Math.Max(0, 100 - Math.Abs(averageHours - 8) * 10);
            var overtimeScore = Math.Max(0, 100 - overtimeFrequency * 50);
            return (hoursScore + overtimeScore + flexibilityScore) / 3;
        }

        // Helper methods for generating insights and recommendations
        private string GetTrendDirection(double score)
        {
            return score switch
            {
                >= 80 => "Improving",
                >= 60 => "Stable",
                >= 40 => "Declining",
                _ => "Critical"
            };
        }

        private List<string> GetAttendanceConsistencyFactors(double score)
        {
            var factors = new List<string>();
            if (score < 70) factors.Add("High variance in check-in times");
            if (score < 50) factors.Add("Irregular attendance patterns");
            if (score >= 80) factors.Add("Consistent daily routines");
            return factors;
        }

        private List<string> GetWorkLifeBalanceFactors(double score)
        {
            var factors = new List<string>();
            if (score < 60) factors.Add("Excessive overtime hours");
            if (score < 40) factors.Add("Poor work-life boundaries");
            if (score >= 80) factors.Add("Healthy work-life integration");
            return factors;
        }

        private List<string> GetFlexibilityFactors(double score)
        {
            var factors = new List<string>();
            if (score < 30) factors.Add("Limited flexible work arrangements");
            if (score >= 70) factors.Add("Good utilization of flexible schedules");
            return factors;
        }

        private string GetCorrelationImpact(double correlation)
        {
            return Math.Abs(correlation) switch
            {
                >= 0.8 => "Very Strong",
                >= 0.6 => "Strong",
                >= 0.4 => "Moderate",
                >= 0.2 => "Weak",
                _ => "Negligible"
            };
        }

        private string GetAttendanceCorrelationRecommendation(double correlation)
        {
            return correlation > 0.6 
                ? "Focus on improving attendance rates to boost performance"
                : "Investigate other factors affecting performance beyond attendance";
        }

        private string GetWorkHoursCorrelationRecommendation(double correlation)
        {
            return correlation > 0.5
                ? "Optimize work hour distribution for better performance outcomes"
                : "Quality of work hours may be more important than quantity";
        }

        private string GetPunctualityCorrelationRecommendation(double correlation)
        {
            return correlation > 0.6
                ? "Implement punctuality improvement programs"
                : "Consider flexible start times to accommodate different work styles";
        }

        private List<string> GenerateHealthScoreRecommendations(double overall, double attendance, double engagement, double productivity, double retention)
        {
            var recommendations = new List<string>();

            if (overall < 70) recommendations.Add("Implement comprehensive workforce improvement program");
            if (attendance < 80) recommendations.Add("Address attendance issues through policy review and support programs");
            if (engagement < 70) recommendations.Add("Enhance employee engagement through recognition and development programs");
            if (productivity < 75) recommendations.Add("Optimize work processes and provide productivity training");
            if (retention < 80) recommendations.Add("Improve retention through career development and compensation review");

            return recommendations;
        }

        private List<string> GenerateWorkLifeBalanceRecommendations(double score, double averageHours, double overtimeFrequency)
        {
            var recommendations = new List<string>();

            if (averageHours > 9) recommendations.Add("Implement workload management and delegation strategies");
            if (overtimeFrequency > 0.3) recommendations.Add("Review staffing levels and consider additional hiring");
            if (score < 60) recommendations.Add("Introduce flexible work arrangements and wellness programs");

            return recommendations;
        }
    }

    public class AttendancePatternService : IAttendancePatternService
    {
        private readonly AttendancePlatformDbContext _context;
        private readonly ILogger<AttendancePatternService> _logger;

        public AttendancePatternService(AttendancePlatformDbContext context, ILogger<AttendancePatternService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<List<AttendancePatternDto>> AnalyzeAttendancePatternsAsync(Guid tenantId, Guid userId)
        {
            try
            {
                var patterns = new List<AttendancePatternDto>();
                var fromDate = DateTime.UtcNow.AddDays(-90);

                var records = await _context.AttendanceRecords
                    .Where(ar => ar.TenantId == tenantId && ar.UserId == userId && ar.CheckInTime >= fromDate)
                    .OrderBy(ar => ar.CheckInTime)
                    .ToListAsync();

                if (records.Count < 10) return patterns;

                // Analyze weekly patterns
                var weeklyPattern = AnalyzeWeeklyPattern(records);
                if (weeklyPattern != null) patterns.Add(weeklyPattern);

                // Analyze daily timing patterns
                var timingPattern = AnalyzeDailyTimingPattern(records);
                if (timingPattern != null) patterns.Add(timingPattern);

                // Analyze work duration patterns
                var durationPattern = AnalyzeWorkDurationPattern(records);
                if (durationPattern != null) patterns.Add(durationPattern);

                return patterns;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error analyzing attendance patterns for user {UserId}", userId);
                throw;
            }
        }

        public async Task<List<SeasonalTrendDto>> IdentifySeasonalTrendsAsync(Guid tenantId)
        {
            try
            {
                var trends = new List<SeasonalTrendDto>();
                var fromDate = DateTime.UtcNow.AddDays(-365);

                var records = await _context.AttendanceRecords
                    .Where(ar => ar.TenantId == tenantId && ar.CheckInTime >= fromDate)
                    .ToListAsync();

                // Group by seasons
                var seasonalData = records.GroupBy(r => GetSeason(r.CheckInTime))
                    .Select(g => new
                    {
                        Season = g.Key,
                        Records = g.ToList(),
                        AttendanceRate = CalculateSeasonalAttendanceRate(g.ToList(), tenantId)
                    }).ToList();

                foreach (var season in seasonalData)
                {
                    trends.Add(new SeasonalTrendDto
                    {
                        Season = season.Season,
                        AttendanceRate = season.AttendanceRate,
                        Trend = DetermineSeasonalTrend(season.Season, season.AttendanceRate),
                        Factors = GetSeasonalFactors(season.Season, season.AttendanceRate)
                    });
                }

                return trends;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error identifying seasonal trends for tenant {TenantId}", tenantId);
                throw;
            }
        }

        public async Task<List<BehavioralInsightDto>> GetBehavioralInsightsAsync(Guid tenantId, Guid userId)
        {
            try
            {
                var insights = new List<BehavioralInsightDto>();
                var fromDate = DateTime.UtcNow.AddDays(-60);

                var records = await _context.AttendanceRecords
                    .Where(ar => ar.TenantId == tenantId && ar.UserId == userId && ar.CheckInTime >= fromDate)
                    .ToListAsync();

                if (records.Count < 10) return insights;

                // Analyze punctuality behavior
                var punctualityInsight = AnalyzePunctualityBehavior(records);
                if (punctualityInsight != null) insights.Add(punctualityInsight);

                // Analyze work duration behavior
                var durationInsight = AnalyzeWorkDurationBehavior(records);
                if (durationInsight != null) insights.Add(durationInsight);

                // Analyze consistency behavior
                var consistencyInsight = AnalyzeConsistencyBehavior(records);
                if (consistencyInsight != null) insights.Add(consistencyInsight);

                return insights;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting behavioral insights for user {UserId}", userId);
                throw;
            }
        }

        // Helper methods for pattern analysis
        private AttendancePatternDto? AnalyzeWeeklyPattern(List<AttendanceRecord> records)
        {
            var weeklyAttendance = records.GroupBy(r => r.CheckInTime.DayOfWeek)
                .ToDictionary(g => g.Key, g => g.Count());

            var totalDays = records.Count;
            var mostCommonDay = weeklyAttendance.OrderByDescending(kvp => kvp.Value).First();
            var leastCommonDay = weeklyAttendance.OrderBy(kvp => kvp.Value).First();

            if (mostCommonDay.Value - leastCommonDay.Value > totalDays * 0.3) // Significant difference
            {
                return new AttendancePatternDto
                {
                    PatternType = "Weekly Attendance Variation",
                    Description = $"Higher attendance on {mostCommonDay.Key}s, lower on {leastCommonDay.Key}s",
                    Frequency = (double)mostCommonDay.Value / totalDays,
                    Recommendations = new List<string>
                    {
                        $"Consider flexible scheduling for {leastCommonDay.Key}s",
                        "Investigate reasons for weekly attendance variations"
                    }
                };
            }

            return null;
        }

        private AttendancePatternDto? AnalyzeDailyTimingPattern(List<AttendanceRecord> records)
        {
            var checkInTimes = records.Select(r => r.CheckInTime.TimeOfDay.TotalMinutes).ToList();
            var averageCheckIn = checkInTimes.Average();
            var standardDeviation = Math.Sqrt(checkInTimes.Sum(t => Math.Pow(t - averageCheckIn, 2)) / checkInTimes.Count);

            if (standardDeviation > 60) // More than 1 hour variation
            {
                return new AttendancePatternDto
                {
                    PatternType = "Variable Check-in Times",
                    Description = $"Check-in times vary by {standardDeviation / 60:F1} hours on average",
                    Frequency = standardDeviation / 120, // Normalize to 0-1 scale
                    Recommendations = new List<string>
                    {
                        "Consider implementing flexible start times",
                        "Discuss optimal work schedule with employee"
                    }
                };
            }

            return null;
        }

        private AttendancePatternDto? AnalyzeWorkDurationPattern(List<AttendanceRecord> records)
        {
            var workDurations = records
                .Where(r => r.CheckOutTime.HasValue)
                .Select(r => (r.CheckOutTime.Value - r.CheckInTime).TotalHours)
                .ToList();

            if (!workDurations.Any()) return null;

            var averageDuration = workDurations.Average();
            var overtimeFrequency = workDurations.Count(d => d > 8) / (double)workDurations.Count;

            if (overtimeFrequency > 0.5) // More than 50% overtime
            {
                return new AttendancePatternDto
                {
                    PatternType = "Frequent Overtime",
                    Description = $"Works overtime {overtimeFrequency:P0} of the time, averaging {averageDuration:F1} hours",
                    Frequency = overtimeFrequency,
                    Recommendations = new List<string>
                    {
                        "Review workload distribution",
                        "Consider additional resources or process optimization",
                        "Monitor for burnout risk"
                    }
                };
            }

            return null;
        }

        private BehavioralInsightDto? AnalyzePunctualityBehavior(List<AttendanceRecord> records)
        {
            var lateArrivals = records.Count(r => r.CheckInTime.TimeOfDay > TimeSpan.FromHours(9));
            var punctualityRate = 1 - (double)lateArrivals / records.Count;

            if (punctualityRate < 0.8) // Less than 80% punctual
            {
                return new BehavioralInsightDto
                {
                    Behavior = "Punctuality Challenges",
                    Frequency = 1 - punctualityRate,
                    Impact = punctualityRate < 0.5 ? "High" : "Medium",
                    Suggestions = new List<string>
                    {
                        "Discuss commute challenges and potential solutions",
                        "Consider flexible start time arrangements",
                        "Provide time management resources"
                    }
                };
            }

            return null;
        }

        private BehavioralInsightDto? AnalyzeWorkDurationBehavior(List<AttendanceRecord> records)
        {
            var workDurations = records
                .Where(r => r.CheckOutTime.HasValue)
                .Select(r => (r.CheckOutTime.Value - r.CheckInTime).TotalHours)
                .ToList();

            if (!workDurations.Any()) return null;

            var averageDuration = workDurations.Average();
            var longDays = workDurations.Count(d => d > 10);

            if (longDays > workDurations.Count * 0.3) // More than 30% long days
            {
                return new BehavioralInsightDto
                {
                    Behavior = "Extended Work Hours",
                    Frequency = (double)longDays / workDurations.Count,
                    Impact = "High",
                    Suggestions = new List<string>
                    {
                        "Monitor for signs of burnout",
                        "Encourage work-life balance",
                        "Review workload and priorities"
                    }
                };
            }

            return null;
        }

        private BehavioralInsightDto? AnalyzeConsistencyBehavior(List<AttendanceRecord> records)
        {
            var checkInTimes = records.Select(r => r.CheckInTime.TimeOfDay.TotalMinutes).ToList();
            var mean = checkInTimes.Average();
            var variance = checkInTimes.Sum(t => Math.Pow(t - mean, 2)) / checkInTimes.Count;
            var standardDeviation = Math.Sqrt(variance);

            if (standardDeviation > 90) // More than 1.5 hours variation
            {
                return new BehavioralInsightDto
                {
                    Behavior = "Inconsistent Schedule",
                    Frequency = Math.Min(1.0, standardDeviation / 180), // Normalize
                    Impact = "Medium",
                    Suggestions = new List<string>
                    {
                        "Establish more consistent daily routines",
                        "Consider structured flexible work arrangements",
                        "Discuss optimal work schedule preferences"
                    }
                };
            }

            return null;
        }

        private string GetSeason(DateTime date)
        {
            return date.Month switch
            {
                12 or 1 or 2 => "Winter",
                3 or 4 or 5 => "Spring",
                6 or 7 or 8 => "Summer",
                9 or 10 or 11 => "Fall",
                _ => "Unknown"
            };
        }

        private double CalculateSeasonalAttendanceRate(List<AttendanceRecord> records, Guid tenantId)
        {
            // Simplified calculation - in real implementation, consider expected working days
            var totalEmployees = _context.Users.Where(u => u.TenantId == tenantId && u.IsActive).Count();
            var seasonDays = 90; // Approximate days per season
            var expectedAttendance = totalEmployees * seasonDays;
            return expectedAttendance > 0 ? (double)records.Count / expectedAttendance * 100 : 0;
        }

        private string DetermineSeasonalTrend(string season, double attendanceRate)
        {
            return attendanceRate switch
            {
                >= 90 => "High",
                >= 80 => "Normal",
                >= 70 => "Below Average",
                _ => "Low"
            };
        }

        private List<string> GetSeasonalFactors(string season, double attendanceRate)
        {
            var factors = new List<string>();

            switch (season)
            {
                case "Winter":
                    if (attendanceRate < 80) factors.Add("Weather-related absences");
                    factors.Add("Holiday season impact");
                    break;
                case "Summer":
                    if (attendanceRate < 85) factors.Add("Vacation season");
                    factors.Add("Family time preferences");
                    break;
                case "Spring":
                    factors.Add("Renewed energy and motivation");
                    break;
                case "Fall":
                    factors.Add("Back-to-work mentality");
                    if (attendanceRate < 80) factors.Add("School schedule adjustments");
                    break;
            }

            return factors;
        }
    }
}

