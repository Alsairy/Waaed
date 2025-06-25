using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using AttendancePlatform.LeaveManagement.Api.Services;
using AttendancePlatform.Shared.Domain.DTOs;
using System.Security.Claims;

namespace AttendancePlatform.LeaveManagement.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class LeaveManagementController : ControllerBase
    {
        private readonly ILeaveManagementService _leaveManagementService;
        private readonly ILogger<LeaveManagementController> _logger;

        public LeaveManagementController(
            ILeaveManagementService leaveManagementService,
            ILogger<LeaveManagementController> logger)
        {
            _leaveManagementService = leaveManagementService;
            _logger = logger;
        }

        /// <summary>
        /// Create a new leave request
        /// </summary>
        [HttpPost("leave-requests")]
        public async Task<ActionResult<ApiResponse<LeaveRequestDto>>> CreateLeaveRequest([FromBody] CreateLeaveRequestDto request)
        {
            var userId = GetCurrentUserId();
            if (!userId.HasValue)
            {
                return Unauthorized(ApiResponse<LeaveRequestDto>.ErrorResult("User not authenticated"));
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<LeaveRequestDto>.ErrorResult("Invalid request data"));
            }

            var result = await _leaveManagementService.CreateLeaveRequestAsync(request, userId.Value);
            
            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        /// <summary>
        /// Create a new permission request
        /// </summary>
        [HttpPost("permission-requests")]
        public async Task<ActionResult<ApiResponse<PermissionRequestDto>>> CreatePermissionRequest([FromBody] CreatePermissionRequestDto request)
        {
            var userId = GetCurrentUserId();
            if (!userId.HasValue)
            {
                return Unauthorized(ApiResponse<PermissionRequestDto>.ErrorResult("User not authenticated"));
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<PermissionRequestDto>.ErrorResult("Invalid request data"));
            }

            var result = await _leaveManagementService.CreatePermissionRequestAsync(request, userId.Value);
            
            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        /// <summary>
        /// Approve or reject a leave request (Manager/Admin only)
        /// </summary>
        [HttpPut("leave-requests/{requestId}/approve")]
        [Authorize(Roles = "Manager,Admin")]
        public async Task<ActionResult<ApiResponse<bool>>> ApproveLeaveRequest(Guid requestId, [FromBody] ApprovalDto approval)
        {
            var approverId = GetCurrentUserId();
            if (!approverId.HasValue)
            {
                return Unauthorized(ApiResponse<bool>.ErrorResult("User not authenticated"));
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<bool>.ErrorResult("Invalid approval data"));
            }

            var result = await _leaveManagementService.ApproveLeaveRequestAsync(requestId, approval, approverId.Value);
            
            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        /// <summary>
        /// Approve or reject a permission request (Manager/Admin only)
        /// </summary>
        [HttpPut("permission-requests/{requestId}/approve")]
        [Authorize(Roles = "Manager,Admin")]
        public async Task<ActionResult<ApiResponse<bool>>> ApprovePermissionRequest(Guid requestId, [FromBody] ApprovalDto approval)
        {
            var approverId = GetCurrentUserId();
            if (!approverId.HasValue)
            {
                return Unauthorized(ApiResponse<bool>.ErrorResult("User not authenticated"));
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<bool>.ErrorResult("Invalid approval data"));
            }

            var result = await _leaveManagementService.ApprovePermissionRequestAsync(requestId, approval, approverId.Value);
            
            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        /// <summary>
        /// Cancel a leave request
        /// </summary>
        [HttpPut("leave-requests/{requestId}/cancel")]
        public async Task<ActionResult<ApiResponse<bool>>> CancelLeaveRequest(Guid requestId)
        {
            var userId = GetCurrentUserId();
            if (!userId.HasValue)
            {
                return Unauthorized(ApiResponse<bool>.ErrorResult("User not authenticated"));
            }

            var result = await _leaveManagementService.CancelLeaveRequestAsync(requestId, userId.Value);
            
            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        /// <summary>
        /// Cancel a permission request
        /// </summary>
        [HttpPut("permission-requests/{requestId}/cancel")]
        public async Task<ActionResult<ApiResponse<bool>>> CancelPermissionRequest(Guid requestId)
        {
            var userId = GetCurrentUserId();
            if (!userId.HasValue)
            {
                return Unauthorized(ApiResponse<bool>.ErrorResult("User not authenticated"));
            }

            var result = await _leaveManagementService.CancelPermissionRequestAsync(requestId, userId.Value);
            
            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        /// <summary>
        /// Get user's leave requests
        /// </summary>
        [HttpGet("leave-requests")]
        public async Task<ActionResult<ApiResponse<IEnumerable<LeaveRequestDto>>>> GetMyLeaveRequests([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            var userId = GetCurrentUserId();
            if (!userId.HasValue)
            {
                return Unauthorized(ApiResponse<IEnumerable<LeaveRequestDto>>.ErrorResult("User not authenticated"));
            }

            var result = await _leaveManagementService.GetUserLeaveRequestsAsync(userId.Value, page, pageSize);
            return Ok(result);
        }

        /// <summary>
        /// Get user's permission requests
        /// </summary>
        [HttpGet("permission-requests")]
        public async Task<ActionResult<ApiResponse<IEnumerable<PermissionRequestDto>>>> GetMyPermissionRequests([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            var userId = GetCurrentUserId();
            if (!userId.HasValue)
            {
                return Unauthorized(ApiResponse<IEnumerable<PermissionRequestDto>>.ErrorResult("User not authenticated"));
            }

            var result = await _leaveManagementService.GetUserPermissionRequestsAsync(userId.Value, page, pageSize);
            return Ok(result);
        }

        /// <summary>
        /// Get pending leave requests for approval (Manager/Admin only)
        /// </summary>
        [HttpGet("leave-requests/pending")]
        [Authorize(Roles = "Manager,Admin")]
        public async Task<ActionResult<ApiResponse<IEnumerable<LeaveRequestDto>>>> GetPendingLeaveRequests([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            var managerId = GetCurrentUserId();
            if (!managerId.HasValue)
            {
                return Unauthorized(ApiResponse<IEnumerable<LeaveRequestDto>>.ErrorResult("User not authenticated"));
            }

            var result = await _leaveManagementService.GetPendingLeaveRequestsAsync(managerId.Value, page, pageSize);
            return Ok(result);
        }

        /// <summary>
        /// Get pending permission requests for approval (Manager/Admin only)
        /// </summary>
        [HttpGet("permission-requests/pending")]
        [Authorize(Roles = "Manager,Admin")]
        public async Task<ActionResult<ApiResponse<IEnumerable<PermissionRequestDto>>>> GetPendingPermissionRequests([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            var managerId = GetCurrentUserId();
            if (!managerId.HasValue)
            {
                return Unauthorized(ApiResponse<IEnumerable<PermissionRequestDto>>.ErrorResult("User not authenticated"));
            }

            var result = await _leaveManagementService.GetPendingPermissionRequestsAsync(managerId.Value, page, pageSize);
            return Ok(result);
        }

        /// <summary>
        /// Get user's leave balance
        /// </summary>
        [HttpGet("leave-balance")]
        public async Task<ActionResult<ApiResponse<UserLeaveBalanceDto>>> GetMyLeaveBalance()
        {
            var userId = GetCurrentUserId();
            if (!userId.HasValue)
            {
                return Unauthorized(ApiResponse<UserLeaveBalanceDto>.ErrorResult("User not authenticated"));
            }

            var result = await _leaveManagementService.GetUserLeaveBalanceAsync(userId.Value);
            return Ok(result);
        }

        /// <summary>
        /// Get leave balance for a specific user (Manager/Admin only)
        /// </summary>
        [HttpGet("users/{userId}/leave-balance")]
        [Authorize(Roles = "Manager,Admin")]
        public async Task<ActionResult<ApiResponse<UserLeaveBalanceDto>>> GetUserLeaveBalance(Guid userId)
        {
            var result = await _leaveManagementService.GetUserLeaveBalanceAsync(userId);
            return Ok(result);
        }

        /// <summary>
        /// Get available leave types
        /// </summary>
        [HttpGet("leave-types")]
        public async Task<ActionResult<ApiResponse<IEnumerable<LeaveTypeDto>>>> GetLeaveTypes()
        {
            var result = await _leaveManagementService.GetLeaveTypesAsync();
            return Ok(result);
        }

        /// <summary>
        /// Get leave calendar
        /// </summary>
        [HttpGet("calendar")]
        public async Task<ActionResult<ApiResponse<LeaveCalendarDto>>> GetLeaveCalendar(
            [FromQuery] DateTime startDate, 
            [FromQuery] DateTime endDate, 
            [FromQuery] Guid? userId = null)
        {
            // If not admin/manager, only allow viewing own calendar
            if (userId.HasValue && !User.IsInRole("Admin") && !User.IsInRole("Manager"))
            {
                var currentUserId = GetCurrentUserId();
                if (currentUserId != userId)
                {
                    return Forbid();
                }
            }

            var result = await _leaveManagementService.GetLeaveCalendarAsync(startDate, endDate, userId);
            return Ok(result);
        }

        /// <summary>
        /// Update user leave balance (Admin only)
        /// </summary>
        [HttpPut("users/{userId}/leave-balance")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ApiResponse<bool>>> UpdateLeaveBalance(Guid userId, [FromBody] UpdateLeaveBalanceDto request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<bool>.ErrorResult("Invalid request data"));
            }

            var result = await _leaveManagementService.UpdateLeaveBalanceAsync(userId, request);
            
            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        /// <summary>
        /// Generate leave report (Manager/Admin only)
        /// </summary>
        [HttpPost("reports")]
        [Authorize(Roles = "Manager,Admin")]
        public async Task<ActionResult<ApiResponse<LeaveReportDto>>> GenerateLeaveReport([FromBody] LeaveReportRequestDto request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<LeaveReportDto>.ErrorResult("Invalid request data"));
            }

            var result = await _leaveManagementService.GenerateLeaveReportAsync(request);
            
            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        /// <summary>
        /// Health check endpoint
        /// </summary>
        [HttpGet("health")]
        [AllowAnonymous]
        public ActionResult<object> Health()
        {
            return Ok(new { status = "healthy", timestamp = DateTime.UtcNow });
        }

        private Guid? GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ??
                             User.FindFirst("sub")?.Value ??
                             User.FindFirst("userId")?.Value;
            
            if (userIdClaim != null && Guid.TryParse(userIdClaim, out var userId))
            {
                return userId;
            }
            
            return null;
        }
    }
}

