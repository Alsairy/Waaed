using Microsoft.EntityFrameworkCore;
using AttendancePlatform.Shared.Infrastructure.Data;
using AttendancePlatform.Shared.Domain.Entities;
using AttendancePlatform.Shared.Domain.DTOs;

namespace AttendancePlatform.LeaveManagement.Api.Services
{
    public interface ILeaveManagementService
    {
        Task<ApiResponse<LeaveRequestDto>> CreateLeaveRequestAsync(CreateLeaveRequestDto request, Guid userId);
        Task<ApiResponse<PermissionRequestDto>> CreatePermissionRequestAsync(CreatePermissionRequestDto request, Guid userId);
        Task<ApiResponse<bool>> ApproveLeaveRequestAsync(Guid requestId, ApprovalDto approval, Guid approverId);
        Task<ApiResponse<bool>> ApprovePermissionRequestAsync(Guid requestId, ApprovalDto approval, Guid approverId);
        Task<ApiResponse<bool>> CancelLeaveRequestAsync(Guid requestId, Guid userId);
        Task<ApiResponse<bool>> CancelPermissionRequestAsync(Guid requestId, Guid userId);
        Task<ApiResponse<IEnumerable<LeaveRequestDto>>> GetUserLeaveRequestsAsync(Guid userId, int page, int pageSize);
        Task<ApiResponse<IEnumerable<PermissionRequestDto>>> GetUserPermissionRequestsAsync(Guid userId, int page, int pageSize);
        Task<ApiResponse<IEnumerable<LeaveRequestDto>>> GetPendingLeaveRequestsAsync(Guid managerId, int page, int pageSize);
        Task<ApiResponse<IEnumerable<PermissionRequestDto>>> GetPendingPermissionRequestsAsync(Guid managerId, int page, int pageSize);
        Task<ApiResponse<UserLeaveBalanceDto>> GetUserLeaveBalanceAsync(Guid userId);
        Task<ApiResponse<IEnumerable<LeaveTypeDto>>> GetLeaveTypesAsync();
        Task<ApiResponse<LeaveCalendarDto>> GetLeaveCalendarAsync(DateTime startDate, DateTime endDate, Guid? userId = null);
        Task<ApiResponse<bool>> UpdateLeaveBalanceAsync(Guid userId, UpdateLeaveBalanceDto request);
        Task<ApiResponse<LeaveReportDto>> GenerateLeaveReportAsync(LeaveReportRequestDto request);
    }

    public class LeaveManagementService : ILeaveManagementService
    {
        private readonly AttendancePlatformDbContext _context;

        public LeaveManagementService(AttendancePlatformDbContext context)
        {
            _context = context;
        }

        public async Task<ApiResponse<LeaveRequestDto>> CreateLeaveRequestAsync(CreateLeaveRequestDto request, Guid userId)
        {
            try
            {
                var totalDays = (int)(request.EndDate - request.StartDate).TotalDays + 1;
                var leaveRequest = new LeaveRequest
                {
                    Id = Guid.NewGuid(),
                    UserId = userId,
                    LeaveTypeId = request.LeaveTypeId,
                    StartDate = request.StartDate,
                    EndDate = request.EndDate,
                    TotalDays = totalDays,
                    Reason = request.Reason,
                    Status = LeaveRequestStatus.Pending,
                    RequestedAt = DateTime.UtcNow,
                    IsEmergency = request.IsEmergency,
                    ContactDuringLeave = request.ContactDuringLeave,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.LeaveRequests.Add(leaveRequest);
                await _context.SaveChangesAsync();

                var dto = new LeaveRequestDto
                {
                    Id = leaveRequest.Id,
                    UserId = leaveRequest.UserId,
                    UserName = string.Empty,
                    LeaveTypeName = string.Empty,
                    StartDate = leaveRequest.StartDate,
                    EndDate = leaveRequest.EndDate,
                    TotalDays = leaveRequest.TotalDays,
                    Reason = leaveRequest.Reason,
                    Status = leaveRequest.Status.ToString(),
                    RequestedAt = leaveRequest.RequestedAt,
                    IsEmergency = leaveRequest.IsEmergency
                };

                return ApiResponse<LeaveRequestDto>.SuccessResult(dto, "Leave request created successfully");
            }
            catch (Exception ex)
            {
                return ApiResponse<LeaveRequestDto>.ErrorResult($"Failed to create leave request: {ex.Message}");
            }
        }

        public async Task<ApiResponse<PermissionRequestDto>> CreatePermissionRequestAsync(CreatePermissionRequestDto request, Guid userId)
        {
            try
            {
                var durationMinutes = (int)(request.EndTime - request.StartTime).TotalMinutes;
                var permissionRequest = new PermissionRequest
                {
                    Id = Guid.NewGuid(),
                    UserId = userId,
                    StartTime = request.StartTime,
                    EndTime = request.EndTime,
                    DurationMinutes = durationMinutes,
                    Reason = request.Reason,
                    Status = PermissionRequestStatus.Pending,
                    RequestedAt = DateTime.UtcNow,
                    IsEmergency = request.IsEmergency,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.PermissionRequests.Add(permissionRequest);
                await _context.SaveChangesAsync();

                var dto = new PermissionRequestDto
                {
                    Id = permissionRequest.Id,
                    UserId = permissionRequest.UserId,
                    StartTime = permissionRequest.StartTime,
                    EndTime = permissionRequest.EndTime,
                    DurationMinutes = permissionRequest.DurationMinutes,
                    Reason = permissionRequest.Reason,
                    Status = permissionRequest.Status.ToString(),
                    RequestedAt = permissionRequest.RequestedAt
                };

                return ApiResponse<PermissionRequestDto>.SuccessResult(dto, "Permission request created successfully");
            }
            catch (Exception ex)
            {
                return ApiResponse<PermissionRequestDto>.ErrorResult($"Failed to create permission request: {ex.Message}");
            }
        }

        public async Task<ApiResponse<bool>> ApproveLeaveRequestAsync(Guid requestId, ApprovalDto approval, Guid approverId)
        {
            try
            {
                var leaveRequest = await _context.LeaveRequests
                    .FirstOrDefaultAsync(lr => lr.Id == requestId);

                if (leaveRequest == null)
                    return ApiResponse<bool>.ErrorResult("Leave request not found");

                if (leaveRequest.Status != LeaveRequestStatus.Pending)
                    return ApiResponse<bool>.ErrorResult("Leave request is not pending");

                leaveRequest.Status = approval.IsApproved ? LeaveRequestStatus.Approved : LeaveRequestStatus.Rejected;
                
                if (approval.IsApproved)
                {
                    leaveRequest.ApprovedBy = approverId;
                    leaveRequest.ApprovedAt = DateTime.UtcNow;
                    leaveRequest.ApprovalNotes = approval.Comments;
                }
                else
                {
                    leaveRequest.RejectedBy = approverId;
                    leaveRequest.RejectedAt = DateTime.UtcNow;
                    leaveRequest.RejectionReason = approval.Comments;
                }

                leaveRequest.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                return ApiResponse<bool>.SuccessResult(true, "Leave request processed successfully");
            }
            catch (Exception ex)
            {
                return ApiResponse<bool>.ErrorResult($"Failed to process leave request: {ex.Message}");
            }
        }

        public async Task<ApiResponse<bool>> ApprovePermissionRequestAsync(Guid requestId, ApprovalDto approval, Guid approverId)
        {
            try
            {
                var permissionRequest = await _context.PermissionRequests
                    .FirstOrDefaultAsync(pr => pr.Id == requestId);

                if (permissionRequest == null)
                    return ApiResponse<bool>.ErrorResult("Permission request not found");

                if (permissionRequest.Status != PermissionRequestStatus.Pending)
                    return ApiResponse<bool>.ErrorResult("Permission request is not pending");

                permissionRequest.Status = approval.IsApproved ? PermissionRequestStatus.Approved : PermissionRequestStatus.Rejected;
                
                if (approval.IsApproved)
                {
                    permissionRequest.ApprovedBy = approverId;
                    permissionRequest.ApprovedAt = DateTime.UtcNow;
                    permissionRequest.ApprovalNotes = approval.Comments;
                }
                else
                {
                    permissionRequest.RejectedBy = approverId;
                    permissionRequest.RejectedAt = DateTime.UtcNow;
                    permissionRequest.RejectionReason = approval.Comments;
                }

                permissionRequest.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                return ApiResponse<bool>.SuccessResult(true, "Permission request processed successfully");
            }
            catch (Exception ex)
            {
                return ApiResponse<bool>.ErrorResult($"Failed to process permission request: {ex.Message}");
            }
        }

        public async Task<ApiResponse<bool>> CancelLeaveRequestAsync(Guid requestId, Guid userId)
        {
            try
            {
                var leaveRequest = await _context.LeaveRequests
                    .FirstOrDefaultAsync(lr => lr.Id == requestId && lr.UserId == userId);

                if (leaveRequest == null)
                    return ApiResponse<bool>.ErrorResult("Leave request not found");

                if (leaveRequest.Status != LeaveRequestStatus.Pending)
                    return ApiResponse<bool>.ErrorResult("Only pending requests can be cancelled");

                leaveRequest.Status = LeaveRequestStatus.Cancelled;
                leaveRequest.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                return ApiResponse<bool>.SuccessResult(true, "Leave request cancelled successfully");
            }
            catch (Exception ex)
            {
                return ApiResponse<bool>.ErrorResult($"Failed to cancel leave request: {ex.Message}");
            }
        }

        public async Task<ApiResponse<bool>> CancelPermissionRequestAsync(Guid requestId, Guid userId)
        {
            try
            {
                var permissionRequest = await _context.PermissionRequests
                    .FirstOrDefaultAsync(pr => pr.Id == requestId && pr.UserId == userId);

                if (permissionRequest == null)
                    return ApiResponse<bool>.ErrorResult("Permission request not found");

                if (permissionRequest.Status != PermissionRequestStatus.Pending)
                    return ApiResponse<bool>.ErrorResult("Only pending requests can be cancelled");

                permissionRequest.Status = PermissionRequestStatus.Cancelled;
                permissionRequest.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                return ApiResponse<bool>.SuccessResult(true, "Permission request cancelled successfully");
            }
            catch (Exception ex)
            {
                return ApiResponse<bool>.ErrorResult($"Failed to cancel permission request: {ex.Message}");
            }
        }

        public async Task<ApiResponse<IEnumerable<LeaveRequestDto>>> GetUserLeaveRequestsAsync(Guid userId, int page, int pageSize)
        {
            try
            {
                var requests = await _context.LeaveRequests
                    .Where(lr => lr.UserId == userId)
                    .Include(lr => lr.LeaveType)
                    .OrderByDescending(lr => lr.RequestedAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(lr => new LeaveRequestDto
                    {
                        Id = lr.Id,
                        UserId = lr.UserId,
                        UserName = $"{lr.User.FirstName} {lr.User.LastName}",
                        LeaveTypeName = lr.LeaveType.Name,
                        StartDate = lr.StartDate,
                        EndDate = lr.EndDate,
                        TotalDays = lr.TotalDays,
                        Reason = lr.Reason,
                        Status = lr.Status.ToString(),
                        RequestedAt = lr.RequestedAt,
                        IsEmergency = lr.IsEmergency
                    })
                    .ToListAsync();

                return ApiResponse<IEnumerable<LeaveRequestDto>>.SuccessResult(requests, "Leave requests retrieved successfully");
            }
            catch (Exception ex)
            {
                return ApiResponse<IEnumerable<LeaveRequestDto>>.ErrorResult($"Failed to retrieve leave requests: {ex.Message}");
            }
        }

        public async Task<ApiResponse<IEnumerable<PermissionRequestDto>>> GetUserPermissionRequestsAsync(Guid userId, int page, int pageSize)
        {
            try
            {
                var requests = await _context.PermissionRequests
                    .Where(pr => pr.UserId == userId)
                    .OrderByDescending(pr => pr.RequestedAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(pr => new PermissionRequestDto
                    {
                        Id = pr.Id,
                        UserId = pr.UserId,
                        StartTime = pr.StartTime,
                        EndTime = pr.EndTime,
                        DurationMinutes = pr.DurationMinutes,
                        Reason = pr.Reason,
                        Status = pr.Status.ToString(),
                        RequestedAt = pr.RequestedAt
                    })
                    .ToListAsync();

                return ApiResponse<IEnumerable<PermissionRequestDto>>.SuccessResult(requests, "Permission requests retrieved successfully");
            }
            catch (Exception ex)
            {
                return ApiResponse<IEnumerable<PermissionRequestDto>>.ErrorResult($"Failed to retrieve permission requests: {ex.Message}");
            }
        }

        public async Task<ApiResponse<IEnumerable<LeaveRequestDto>>> GetPendingLeaveRequestsAsync(Guid managerId, int page, int pageSize)
        {
            try
            {
                var requests = await _context.LeaveRequests
                    .Where(lr => lr.Status == LeaveRequestStatus.Pending)
                    .Include(lr => lr.LeaveType)
                    .Include(lr => lr.User)
                    .OrderByDescending(lr => lr.RequestedAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(lr => new LeaveRequestDto
                    {
                        Id = lr.Id,
                        UserId = lr.UserId,
                        UserName = $"{lr.User.FirstName} {lr.User.LastName}",
                        LeaveTypeName = lr.LeaveType.Name,
                        StartDate = lr.StartDate,
                        EndDate = lr.EndDate,
                        TotalDays = lr.TotalDays,
                        Reason = lr.Reason,
                        Status = lr.Status.ToString(),
                        RequestedAt = lr.RequestedAt,
                        IsEmergency = lr.IsEmergency
                    })
                    .ToListAsync();

                return ApiResponse<IEnumerable<LeaveRequestDto>>.SuccessResult(requests, "Pending leave requests retrieved successfully");
            }
            catch (Exception ex)
            {
                return ApiResponse<IEnumerable<LeaveRequestDto>>.ErrorResult($"Failed to retrieve pending leave requests: {ex.Message}");
            }
        }

        public async Task<ApiResponse<IEnumerable<PermissionRequestDto>>> GetPendingPermissionRequestsAsync(Guid managerId, int page, int pageSize)
        {
            try
            {
                var requests = await _context.PermissionRequests
                    .Where(pr => pr.Status == PermissionRequestStatus.Pending)
                    .Include(pr => pr.User)
                    .OrderByDescending(pr => pr.RequestedAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(pr => new PermissionRequestDto
                    {
                        Id = pr.Id,
                        UserId = pr.UserId,
                        StartTime = pr.StartTime,
                        EndTime = pr.EndTime,
                        DurationMinutes = pr.DurationMinutes,
                        Reason = pr.Reason,
                        Status = pr.Status.ToString(),
                        RequestedAt = pr.RequestedAt
                    })
                    .ToListAsync();

                return ApiResponse<IEnumerable<PermissionRequestDto>>.SuccessResult(requests, "Pending permission requests retrieved successfully");
            }
            catch (Exception ex)
            {
                return ApiResponse<IEnumerable<PermissionRequestDto>>.ErrorResult($"Failed to retrieve pending permission requests: {ex.Message}");
            }
        }

        public async Task<ApiResponse<UserLeaveBalanceDto>> GetUserLeaveBalanceAsync(Guid userId)
        {
            try
            {
                var currentYear = DateTime.UtcNow.Year;
                var balances = await _context.UserLeaveBalances
                    .Where(ulb => ulb.UserId == userId && ulb.Year == currentYear)
                    .Include(ulb => ulb.LeaveType)
                    .ToListAsync();

                var dto = new UserLeaveBalanceDto
                {
                    UserId = userId,
                    Year = currentYear,
                    LeaveBalances = balances.Select(b => new LeaveBalanceDto
                    {
                        LeaveTypeId = b.LeaveTypeId,
                        LeaveTypeName = b.LeaveType.Name,
                        AllocatedDays = b.AllocatedDays,
                        UsedDays = b.UsedDays,
                        RemainingDays = b.RemainingDays,
                        CarryForwardDays = b.CarriedOverDays,
                        Year = b.Year
                    }).ToList()
                };

                return ApiResponse<UserLeaveBalanceDto>.SuccessResult(dto, "Leave balance retrieved successfully");
            }
            catch (Exception ex)
            {
                return ApiResponse<UserLeaveBalanceDto>.ErrorResult($"Failed to retrieve leave balance: {ex.Message}");
            }
        }

        public async Task<ApiResponse<IEnumerable<LeaveTypeDto>>> GetLeaveTypesAsync()
        {
            try
            {
                var leaveTypes = await _context.LeaveTypes
                    .Where(lt => lt.IsActive)
                    .Select(lt => new LeaveTypeDto
                    {
                        Id = lt.Id,
                        Name = lt.Name,
                        Description = lt.Description,
                        MaxDaysPerYear = lt.MaxDaysPerYear,
                        IsCarryForwardAllowed = false,
                        MaxCarryForwardDays = 0,
                        RequiresApproval = lt.RequiresApproval,
                        IsActive = lt.IsActive
                    })
                    .ToListAsync();

                return ApiResponse<IEnumerable<LeaveTypeDto>>.SuccessResult(leaveTypes, "Leave types retrieved successfully");
            }
            catch (Exception ex)
            {
                return ApiResponse<IEnumerable<LeaveTypeDto>>.ErrorResult($"Failed to retrieve leave types: {ex.Message}");
            }
        }

        public async Task<ApiResponse<LeaveCalendarDto>> GetLeaveCalendarAsync(DateTime startDate, DateTime endDate, Guid? userId = null)
        {
            try
            {
                var query = _context.LeaveRequests
                    .Where(lr => lr.Status == LeaveRequestStatus.Approved &&
                                lr.StartDate <= endDate && lr.EndDate >= startDate);

                if (userId.HasValue)
                    query = query.Where(lr => lr.UserId == userId.Value);

                var leaveRequests = await query
                    .Include(lr => lr.User)
                    .Include(lr => lr.LeaveType)
                    .ToListAsync();

                var calendarItems = leaveRequests.Select(lr => new LeaveCalendarItemDto
                {
                    Id = lr.Id,
                    UserId = lr.UserId,
                    UserName = $"{lr.User.FirstName} {lr.User.LastName}",
                    LeaveTypeName = lr.LeaveType.Name,
                    StartDate = lr.StartDate,
                    EndDate = lr.EndDate,
                    DaysRequested = lr.TotalDays,
                    Reason = lr.Reason
                }).ToList();

                var dto = new LeaveCalendarDto
                {
                    StartDate = startDate,
                    EndDate = endDate,
                    LeaveItems = calendarItems
                };

                return ApiResponse<LeaveCalendarDto>.SuccessResult(dto, "Leave calendar retrieved successfully");
            }
            catch (Exception ex)
            {
                return ApiResponse<LeaveCalendarDto>.ErrorResult($"Failed to retrieve leave calendar: {ex.Message}");
            }
        }

        public async Task<ApiResponse<bool>> UpdateLeaveBalanceAsync(Guid userId, UpdateLeaveBalanceDto request)
        {
            try
            {
                var balance = await _context.UserLeaveBalances
                    .FirstOrDefaultAsync(ulb => ulb.UserId == userId && 
                                              ulb.LeaveTypeId == request.LeaveTypeId && 
                                              ulb.Year == request.Year);

                if (balance == null)
                {
                    balance = new UserLeaveBalance
                    {
                        Id = Guid.NewGuid(),
                        UserId = userId,
                        LeaveTypeId = request.LeaveTypeId,
                        Year = request.Year,
                        CreatedAt = DateTime.UtcNow
                    };
                    _context.UserLeaveBalances.Add(balance);
                }

                balance.AllocatedDays = request.AllocatedDays;
                balance.CarriedOverDays = request.CarryForwardDays;
                balance.RemainingDays = balance.AllocatedDays + balance.CarriedOverDays - balance.UsedDays;
                balance.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                return ApiResponse<bool>.SuccessResult(true, "Leave balance updated successfully");
            }
            catch (Exception ex)
            {
                return ApiResponse<bool>.ErrorResult($"Failed to update leave balance: {ex.Message}");
            }
        }

        public async Task<ApiResponse<LeaveReportDto>> GenerateLeaveReportAsync(LeaveReportRequestDto request)
        {
            try
            {
                var query = _context.LeaveRequests
                    .Where(lr => lr.StartDate >= request.StartDate && lr.EndDate <= request.EndDate);

                if (request.UserId.HasValue)
                    query = query.Where(lr => lr.UserId == request.UserId.Value);

                if (request.LeaveTypeId.HasValue)
                    query = query.Where(lr => lr.LeaveTypeId == request.LeaveTypeId.Value);

                var leaveRequests = await query
                    .Include(lr => lr.User)
                    .Include(lr => lr.LeaveType)
                    .ToListAsync();

                var reportItems = leaveRequests.Select(lr => new LeaveReportItemDto
                {
                    UserId = lr.UserId,
                    UserName = $"{lr.User.FirstName} {lr.User.LastName}",
                    EmployeeId = lr.User.EmployeeId,
                    LeaveTypeName = lr.LeaveType.Name,
                    StartDate = lr.StartDate,
                    EndDate = lr.EndDate,
                    DaysRequested = lr.TotalDays,
                    Status = lr.Status.ToString(),
                    RequestDate = lr.RequestedAt,
                    Reason = lr.Reason
                }).ToList();

                var dto = new LeaveReportDto
                {
                    StartDate = request.StartDate,
                    EndDate = request.EndDate,
                    GeneratedAt = DateTime.UtcNow,
                    TotalRequests = leaveRequests.Count,
                    TotalDaysRequested = leaveRequests.Sum(lr => lr.TotalDays),
                    ReportItems = reportItems
                };

                return ApiResponse<LeaveReportDto>.SuccessResult(dto, "Leave report generated successfully");
            }
            catch (Exception ex)
            {
                return ApiResponse<LeaveReportDto>.ErrorResult($"Failed to generate leave report: {ex.Message}");
            }
        }
    }
}
