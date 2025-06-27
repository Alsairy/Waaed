using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using AttendancePlatform.Attendance.Api.Services;
using AttendancePlatform.Shared.Domain.DTOs;
using System.Security.Claims;

namespace AttendancePlatform.Attendance.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AttendanceController : ControllerBase
    {
        private readonly IAttendanceService _attendanceService;
        private readonly ILogger<AttendanceController> _logger;

        public AttendanceController(
            IAttendanceService attendanceService,
            ILogger<AttendanceController> logger)
        {
            _attendanceService = attendanceService;
            _logger = logger;
        }

        /// <summary>
        /// Check in user with location and biometric data
        /// </summary>
        [HttpPost("checkin")]
        public async Task<ActionResult<ApiResponse<AttendanceRecordDto>>> CheckIn([FromBody] CheckInRequest request)
        {
            var userId = GetCurrentUserId();
            if (!userId.HasValue)
            {
                return Unauthorized(ApiResponse<AttendanceRecordDto>.ErrorResult("User not authenticated"));
            }

            var result = await _attendanceService.CheckInAsync(request, userId.Value);
            
            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        /// <summary>
        /// Check out user with location and biometric data
        /// </summary>
        [HttpPost("checkout")]
        public async Task<ActionResult<ApiResponse<AttendanceRecordDto>>> CheckOut([FromBody] CheckOutRequest request)
        {
            var userId = GetCurrentUserId();
            if (!userId.HasValue)
            {
                return Unauthorized(ApiResponse<AttendanceRecordDto>.ErrorResult("User not authenticated"));
            }

            var result = await _attendanceService.CheckOutAsync(request, userId.Value);
            
            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        /// <summary>
        /// Get user's attendance records for a date range
        /// </summary>
        [HttpGet("my-attendance")]
        public async Task<ActionResult<ApiResponse<IEnumerable<AttendanceRecordDto>>>> GetMyAttendance(
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            var userId = GetCurrentUserId();
            if (!userId.HasValue)
            {
                return Unauthorized(ApiResponse<IEnumerable<AttendanceRecordDto>>.ErrorResult("User not authenticated"));
            }

            var result = await _attendanceService.GetUserAttendanceAsync(userId.Value, startDate, endDate);
            return Ok(result);
        }

        /// <summary>
        /// Get user's attendance records for today
        /// </summary>
        [HttpGet("today")]
        public async Task<ActionResult<ApiResponse<IEnumerable<AttendanceRecordDto>>>> GetTodayAttendance()
        {
            var userId = GetCurrentUserId();
            if (!userId.HasValue)
            {
                return Unauthorized(ApiResponse<IEnumerable<AttendanceRecordDto>>.ErrorResult("User not authenticated"));
            }

            var result = await _attendanceService.GetTodayAttendanceAsync(userId.Value);
            return Ok(result);
        }

        /// <summary>
        /// Get user's last attendance record
        /// </summary>
        [HttpGet("last")]
        public async Task<ActionResult<ApiResponse<AttendanceRecordDto?>>> GetLastAttendance()
        {
            var userId = GetCurrentUserId();
            if (!userId.HasValue)
            {
                return Unauthorized(ApiResponse<AttendanceRecordDto?>.ErrorResult("User not authenticated"));
            }

            var result = await _attendanceService.GetLastAttendanceAsync(userId.Value);
            return Ok(result);
        }

        /// <summary>
        /// Validate if current location is within allowed geofence
        /// </summary>
        [HttpPost("validate-geofence")]
        public async Task<ActionResult<ApiResponse<bool>>> ValidateGeofence([FromBody] LocationRequest request)
        {
            var userId = GetCurrentUserId();
            if (!userId.HasValue)
            {
                return Unauthorized(ApiResponse<bool>.ErrorResult("User not authenticated"));
            }

            var result = await _attendanceService.ValidateGeofenceAsync(request.Latitude, request.Longitude, userId.Value);
            return Ok(result);
        }

        /// <summary>
        /// Validate if beacon is authorized for user
        /// </summary>
        [HttpPost("validate-beacon")]
        public async Task<ActionResult<ApiResponse<bool>>> ValidateBeacon([FromBody] BeaconRequest request)
        {
            var userId = GetCurrentUserId();
            if (!userId.HasValue)
            {
                return Unauthorized(ApiResponse<bool>.ErrorResult("User not authenticated"));
            }

            var result = await _attendanceService.ValidateBeaconAsync(request.BeaconId, userId.Value);
            return Ok(result);
        }

        /// <summary>
        /// Get attendance reports (Admin/Manager only)
        /// </summary>
        [HttpGet("reports")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<ActionResult<ApiResponse<PagedResult<AttendanceRecordDto>>>> GetAttendanceReports(
            [FromQuery] PagedRequest request,
            [FromQuery] Guid? userId = null)
        {
            var result = await _attendanceService.GetAttendanceReportsAsync(request, userId);
            return Ok(result);
        }

        /// <summary>
        /// Get specific user's attendance (Admin/Manager only)
        /// </summary>
        [HttpGet("user/{userId}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<ActionResult<ApiResponse<IEnumerable<AttendanceRecordDto>>>> GetUserAttendance(
            Guid userId,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            var result = await _attendanceService.GetUserAttendanceAsync(userId, startDate, endDate);
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

    public class LocationRequest
    {
        public double Latitude { get; set; }
        public double Longitude { get; set; }
    }

    public class BeaconRequest
    {
        public string BeaconId { get; set; } = string.Empty;
    }
}

