using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using AttendancePlatform.Shared.Domain.Entities;
using AttendancePlatform.Shared.Domain.Interfaces;
using AttendancePlatform.Shared.Infrastructure.Data;
using AttendancePlatform.Shared.Infrastructure.Services;

namespace AttendancePlatform.Shared.Infrastructure.Services
{
    public interface IQueryOptimizationService
    {
        Task<IEnumerable<AttendanceRecord>> GetUserAttendanceOptimizedAsync(Guid userId, DateTime startDate, DateTime endDate);
        Task<IEnumerable<User>> GetActiveUsersOptimizedAsync(Guid tenantId);
        Task<Dictionary<string, object>> GetDashboardDataOptimizedAsync(Guid tenantId, Guid userId);
    }

    public class QueryOptimizationService : IQueryOptimizationService
    {
        private readonly AttendancePlatformDbContext _context;
        private readonly ICacheService _cacheService;
        private readonly ILogger<QueryOptimizationService> _logger;

        public QueryOptimizationService(
            AttendancePlatformDbContext context,
            ICacheService cacheService,
            ILogger<QueryOptimizationService> logger)
        {
            _context = context;
            _cacheService = cacheService;
            _logger = logger;
        }

        public async Task<IEnumerable<AttendanceRecord>> GetUserAttendanceOptimizedAsync(Guid userId, DateTime startDate, DateTime endDate)
        {
            var cacheKey = $"user_attendance_{userId}_{startDate:yyyyMMdd}_{endDate:yyyyMMdd}";
            
            var cached = await _cacheService.GetAsync<List<AttendanceRecord>>(cacheKey);
            if (cached != null)
            {
                return cached;
            }

            var attendance = await _context.AttendanceRecords
                .Where(a => a.UserId == userId && 
                           a.Timestamp >= startDate && 
                           a.Timestamp <= endDate)
                .OrderByDescending(a => a.Timestamp)
                .AsNoTracking()
                .ToListAsync();

            await _cacheService.SetAsync(cacheKey, attendance, TimeSpan.FromMinutes(15));
            
            return attendance;
        }

        public async Task<IEnumerable<User>> GetActiveUsersOptimizedAsync(Guid tenantId)
        {
            var cacheKey = $"active_users_{tenantId}";
            
            var cached = await _cacheService.GetAsync<List<User>>(cacheKey);
            if (cached != null)
            {
                return cached;
            }

            var users = await _context.Users
                .Where(u => u.TenantId == tenantId && u.Status == UserStatus.Active)
                .Select(u => new User
                {
                    Id = u.Id,
                    FirstName = u.FirstName,
                    LastName = u.LastName,
                    Email = u.Email,
                    Department = u.Department,
                    Position = u.Position,
                    Status = u.Status,
                    TenantId = u.TenantId
                })
                .AsNoTracking()
                .ToListAsync();

            await _cacheService.SetAsync(cacheKey, users, TimeSpan.FromMinutes(30));
            
            return users;
        }

        public async Task<Dictionary<string, object>> GetDashboardDataOptimizedAsync(Guid tenantId, Guid userId)
        {
            var cacheKey = $"dashboard_data_{tenantId}_{userId}_{DateTime.UtcNow:yyyyMMddHH}";
            
            var cached = await _cacheService.GetAsync<Dictionary<string, object>>(cacheKey);
            if (cached != null)
            {
                return cached;
            }

            var today = DateTime.UtcNow.Date;
            var thisMonth = new DateTime(today.Year, today.Month, 1);

            var tasks = new List<Task>
            {
                GetTodayAttendanceCountAsync(tenantId),
                GetMonthlyAttendanceStatsAsync(tenantId, thisMonth),
                GetUserTodayAttendanceAsync(userId),
                GetPendingLeaveRequestsCountAsync(tenantId)
            };

            await Task.WhenAll(tasks);

            var dashboardData = new Dictionary<string, object>
            {
                ["todayAttendanceCount"] = ((Task<int>)tasks[0]).Result,
                ["monthlyStats"] = ((Task<object>)tasks[1]).Result,
                ["userTodayAttendance"] = ((Task<AttendanceRecord?>)tasks[2]).Result ?? new object(),
                ["pendingLeaveRequests"] = ((Task<int>)tasks[3]).Result
            };

            await _cacheService.SetAsync(cacheKey, dashboardData, TimeSpan.FromMinutes(10));
            
            return dashboardData;
        }

        private async Task<int> GetTodayAttendanceCountAsync(Guid tenantId)
        {
            var today = DateTime.UtcNow.Date;
            return await _context.AttendanceRecords
                .Where(a => a.TenantId == tenantId && 
                           a.Timestamp >= today && 
                           a.Timestamp < today.AddDays(1))
                .CountAsync();
        }

        private async Task<object> GetMonthlyAttendanceStatsAsync(Guid tenantId, DateTime monthStart)
        {
            var monthEnd = monthStart.AddMonths(1);
            
            var stats = await _context.AttendanceRecords
                .Where(a => a.TenantId == tenantId && 
                           a.Timestamp >= monthStart && 
                           a.Timestamp < monthEnd)
                .GroupBy(a => a.Timestamp.Date)
                .Select(g => new { Date = g.Key, Count = g.Count() })
                .AsNoTracking()
                .ToListAsync();

            return new
            {
                TotalDays = stats.Count,
                TotalAttendance = stats.Sum(s => s.Count),
                AverageDaily = stats.Any() ? stats.Average(s => s.Count) : 0,
                DailyBreakdown = stats
            };
        }

        private async Task<AttendanceRecord?> GetUserTodayAttendanceAsync(Guid userId)
        {
            var today = DateTime.UtcNow.Date;
            return await _context.AttendanceRecords
                .Where(a => a.UserId == userId && 
                           a.Timestamp >= today && 
                           a.Timestamp < today.AddDays(1))
                .OrderByDescending(a => a.Timestamp)
                .AsNoTracking()
                .FirstOrDefaultAsync();
        }

        private async Task<int> GetPendingLeaveRequestsCountAsync(Guid tenantId)
        {
            return await _context.LeaveRequests
                .Where(l => l.TenantId == tenantId && l.Status == LeaveRequestStatus.Pending)
                .CountAsync();
        }
    }
}
