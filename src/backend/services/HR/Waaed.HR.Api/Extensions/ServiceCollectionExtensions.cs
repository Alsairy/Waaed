using Microsoft.EntityFrameworkCore;
using Waaed.HR.Api.Data;
using System.Reflection;

namespace Waaed.HR.Api.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddHRServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<HRDbContext>(options =>
        {
            var connectionString = configuration.GetConnectionString("DefaultConnection");
            options.UseSqlite(connectionString);
        });

        services.AddAutoMapper(Assembly.GetExecutingAssembly());

        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(Assembly.GetExecutingAssembly()));

        services.AddScoped<IHRService, HRService>();

        return services;
    }
}

public interface IHRService
{
    Task<bool> ValidateEmployeeExistsAsync(int employeeId);
    Task<bool> ValidateDepartmentExistsAsync(int departmentId);
    Task<bool> ValidatePositionExistsAsync(int positionId);
    Task<bool> ValidateManagerHierarchyAsync(int employeeId, int? managerId);
    Task<decimal> CalculateLeaveBalanceAsync(int employeeId, string leaveType, int year);
    Task<bool> HasOverlappingLeaveAsync(int employeeId, DateTime startDate, DateTime endDate, int? excludeRequestId = null);
    Task<List<int>> GetEmployeeSubordinatesAsync(int managerId);
    Task<bool> CanApproveLeaveAsync(int approverId, int employeeId);
    Task<bool> CanConductPerformanceReviewAsync(int reviewerId, int employeeId);
    Task<decimal> GetAveragePerformanceRatingAsync(int employeeId);
    Task<bool> IsEligibleForPromotionAsync(int employeeId);
    Task<List<string>> GetRecommendedTrainingAsync(int employeeId);
    Task<bool> ValidateRecruitmentPermissionsAsync(int userId, int recruitmentId);
    Task<bool> CanScheduleInterviewAsync(int interviewerId, int applicationId);
    Task<Dictionary<string, object>> GetHRDashboardDataAsync();
    Task<List<object>> GetUpcomingReviewsAsync(int managerId);
    Task<List<object>> GetPendingLeaveRequestsAsync(int managerId);
}

public class HRService : IHRService
{
    private readonly HRDbContext _context;

    public HRService(HRDbContext context)
    {
        _context = context;
    }

    public async Task<bool> ValidateEmployeeExistsAsync(int employeeId)
    {
        return await _context.Employees.AnyAsync(e => e.Id == employeeId && e.IsActive);
    }

    public async Task<bool> ValidateDepartmentExistsAsync(int departmentId)
    {
        return await _context.Departments.AnyAsync(d => d.Id == departmentId && d.IsActive);
    }

    public async Task<bool> ValidatePositionExistsAsync(int positionId)
    {
        return await _context.Positions.AnyAsync(p => p.Id == positionId && p.IsActive);
    }

    public async Task<bool> ValidateManagerHierarchyAsync(int employeeId, int? managerId)
    {
        if (!managerId.HasValue) return true;

        var employee = await _context.Employees.FindAsync(employeeId);
        if (employee == null) return false;

        var currentManagerId = managerId.Value;
        var visited = new HashSet<int> { employeeId };

        while (currentManagerId != 0)
        {
            if (visited.Contains(currentManagerId))
                return false;

            visited.Add(currentManagerId);

            var manager = await _context.Employees.FindAsync(currentManagerId);
            if (manager?.ManagerId == null) break;

            currentManagerId = manager.ManagerId.Value;
        }

        return true;
    }

    public async Task<decimal> CalculateLeaveBalanceAsync(int employeeId, string leaveType, int year)
    {
        var totalEntitlement = leaveType switch
        {
            "Annual Leave" => 21,
            "Sick Leave" => 10,
            "Emergency Leave" => 5,
            _ => 0
        };

        var usedDays = await _context.LeaveRequests
            .Where(lr => lr.EmployeeId == employeeId &&
                        lr.LeaveType == leaveType &&
                        lr.Status == "Approved" &&
                        lr.StartDate.Year == year)
            .SumAsync(lr => lr.TotalDays);

        return totalEntitlement - usedDays;
    }

    public async Task<bool> HasOverlappingLeaveAsync(int employeeId, DateTime startDate, DateTime endDate, int? excludeRequestId = null)
    {
        var query = _context.LeaveRequests
            .Where(lr => lr.EmployeeId == employeeId &&
                        lr.Status != "Rejected" &&
                        ((lr.StartDate <= endDate && lr.EndDate >= startDate)));

        if (excludeRequestId.HasValue)
        {
            query = query.Where(lr => lr.Id != excludeRequestId.Value);
        }

        return await query.AnyAsync();
    }

    public async Task<List<int>> GetEmployeeSubordinatesAsync(int managerId)
    {
        return await _context.Employees
            .Where(e => e.ManagerId == managerId && e.IsActive)
            .Select(e => e.Id)
            .ToListAsync();
    }

    public async Task<bool> CanApproveLeaveAsync(int approverId, int employeeId)
    {
        var employee = await _context.Employees.FindAsync(employeeId);
        return employee?.ManagerId == approverId;
    }

    public async Task<bool> CanConductPerformanceReviewAsync(int reviewerId, int employeeId)
    {
        var employee = await _context.Employees.FindAsync(employeeId);
        return employee?.ManagerId == reviewerId;
    }

    public async Task<decimal> GetAveragePerformanceRatingAsync(int employeeId)
    {
        var ratings = await _context.PerformanceReviews
            .Where(pr => pr.EmployeeId == employeeId && pr.Status == "Completed")
            .Select(pr => pr.OverallRating)
            .ToListAsync();

        return ratings.Any() ? ratings.Average() : 0;
    }

    public async Task<bool> IsEligibleForPromotionAsync(int employeeId)
    {
        var latestReview = await _context.PerformanceReviews
            .Where(pr => pr.EmployeeId == employeeId && pr.Status == "Completed")
            .OrderByDescending(pr => pr.ReviewDate)
            .FirstOrDefaultAsync();

        return latestReview?.RecommendForPromotion == true && latestReview.OverallRating >= 4.0m;
    }

    public async Task<List<string>> GetRecommendedTrainingAsync(int employeeId)
    {
        var recommendations = await _context.PerformanceReviews
            .Where(pr => pr.EmployeeId == employeeId &&
                        pr.Status == "Completed" &&
                        pr.RecommendForTraining &&
                        !string.IsNullOrEmpty(pr.TrainingRecommendations))
            .Select(pr => pr.TrainingRecommendations!)
            .ToListAsync();

        return recommendations;
    }

    public async Task<bool> ValidateRecruitmentPermissionsAsync(int userId, int recruitmentId)
    {
        var recruitment = await _context.Recruitments.FindAsync(recruitmentId);
        return recruitment?.RequestedById == userId || recruitment?.AssignedToId == userId;
    }

    public async Task<bool> CanScheduleInterviewAsync(int interviewerId, int applicationId)
    {
        var application = await _context.JobApplications
            .Include(ja => ja.Recruitment)
            .FirstOrDefaultAsync(ja => ja.Id == applicationId);

        return application?.Recruitment.AssignedToId == interviewerId;
    }

    public async Task<Dictionary<string, object>> GetHRDashboardDataAsync()
    {
        var totalEmployees = await _context.Employees.CountAsync(e => e.IsActive);
        var pendingLeaveRequests = await _context.LeaveRequests.CountAsync(lr => lr.Status == "Pending");
        var pendingReviews = await _context.PerformanceReviews.CountAsync(pr => pr.Status != "Completed");
        var openRecruitments = await _context.Recruitments.CountAsync(r => r.Status == "Open");

        return new Dictionary<string, object>
        {
            ["totalEmployees"] = totalEmployees,
            ["pendingLeaveRequests"] = pendingLeaveRequests,
            ["pendingReviews"] = pendingReviews,
            ["openRecruitments"] = openRecruitments
        };
    }

    public async Task<List<object>> GetUpcomingReviewsAsync(int managerId)
    {
        var subordinates = await GetEmployeeSubordinatesAsync(managerId);

        return await _context.PerformanceReviews
            .Include(pr => pr.Employee)
            .Where(pr => subordinates.Contains(pr.EmployeeId) &&
                        pr.Status != "Completed" &&
                        pr.ReviewDate <= DateTime.UtcNow.AddDays(30))
            .Select(pr => new
            {
                pr.Id,
                EmployeeName = pr.Employee.FullName,
                pr.ReviewDate,
                pr.Status
            })
            .Cast<object>()
            .ToListAsync();
    }

    public async Task<List<object>> GetPendingLeaveRequestsAsync(int managerId)
    {
        var subordinates = await GetEmployeeSubordinatesAsync(managerId);

        return await _context.LeaveRequests
            .Include(lr => lr.Employee)
            .Where(lr => subordinates.Contains(lr.EmployeeId) && lr.Status == "Pending")
            .Select(lr => new
            {
                lr.Id,
                EmployeeName = lr.Employee.FullName,
                lr.LeaveType,
                lr.StartDate,
                lr.EndDate,
                lr.TotalDays
            })
            .Cast<object>()
            .ToListAsync();
    }
}
