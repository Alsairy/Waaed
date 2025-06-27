using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using AttendancePlatform.Shared.Domain.DTOs;
using AttendancePlatform.Shared.Domain.Entities;
using AttendancePlatform.Attendance.Api.Services;
using System.Security.Claims;

namespace AttendancePlatform.Attendance.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class KioskController : ControllerBase
    {
        private readonly IAttendanceService _attendanceService;
        private readonly IKioskService _kioskService;
        private readonly ILogger<KioskController> _logger;

        public KioskController(
            IAttendanceService attendanceService,
            IKioskService kioskService,
            ILogger<KioskController> logger)
        {
            _attendanceService = attendanceService;
            _kioskService = kioskService;
            _logger = logger;
        }

        [HttpPost("register")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> RegisterKiosk([FromBody] RegisterKioskRequest request)
        {
            try
            {
                var kiosk = await _kioskService.RegisterKioskAsync(request);
                return Ok(kiosk);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error registering kiosk");
                return BadRequest(new { message = "Failed to register kiosk" });
            }
        }

        [HttpPost("authenticate")]
        public async Task<IActionResult> AuthenticateKiosk([FromBody] KioskAuthRequest request)
        {
            try
            {
                var result = await _kioskService.AuthenticateKioskAsync(request.KioskId, request.AccessCode);
                if (result.IsSuccess)
                {
                    return Ok(result);
                }
                return Unauthorized(new { message = "Invalid kiosk credentials" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error authenticating kiosk");
                return BadRequest(new { message = "Authentication failed" });
            }
        }

        [HttpPost("employee-lookup")]
        [Authorize]
        public async Task<IActionResult> LookupEmployee([FromBody] EmployeeLookupRequest request)
        {
            try
            {
                var employee = await _kioskService.LookupEmployeeAsync(request.EmployeeId, request.BiometricData);
                if (employee != null)
                {
                    return Ok(employee);
                }
                return NotFound(new { message = "Employee not found" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error looking up employee");
                return BadRequest(new { message = "Employee lookup failed" });
            }
        }

        [HttpPost("check-in")]
        [Authorize]
        public async Task<IActionResult> CheckIn([FromBody] KioskAttendanceRequest request)
        {
            try
            {
                var kioskId = GetKioskId();
                var result = await _attendanceService.CheckInAsync(new CheckInRequest
                {
                    UserId = request.EmployeeId,
                    Method = AttendanceMethod.Kiosk,
                    Location = request.Location,
                    KioskId = kioskId,
                    BiometricData = request.BiometricData,
                    Timestamp = DateTime.UtcNow
                }, Guid.Parse(request.EmployeeId));

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing kiosk check-in");
                return BadRequest(new { message = "Check-in failed" });
            }
        }

        [HttpPost("check-out")]
        [Authorize]
        public async Task<IActionResult> CheckOut([FromBody] KioskAttendanceRequest request)
        {
            try
            {
                var kioskId = GetKioskId();
                var result = await _attendanceService.CheckOutAsync(new CheckOutRequest
                {
                    UserId = request.EmployeeId,
                    Method = AttendanceMethod.Kiosk,
                    Location = request.Location,
                    KioskId = kioskId,
                    BiometricData = request.BiometricData,
                    Timestamp = DateTime.UtcNow
                }, Guid.Parse(request.EmployeeId));

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing kiosk check-out");
                return BadRequest(new { message = "Check-out failed" });
            }
        }

        [HttpGet("status")]
        [Authorize]
        public async Task<IActionResult> GetKioskStatus()
        {
            try
            {
                var kioskId = GetKioskId();
                var status = await _kioskService.GetKioskStatusAsync(kioskId);
                return Ok(status);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting kiosk status");
                return BadRequest(new { message = "Failed to get kiosk status" });
            }
        }

        [HttpGet("recent-activity")]
        [Authorize]
        public async Task<IActionResult> GetRecentActivity([FromQuery] int limit = 10)
        {
            try
            {
                var kioskId = GetKioskId();
                var activities = await _kioskService.GetRecentActivityAsync(kioskId, limit);
                return Ok(activities);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting recent activity");
                return BadRequest(new { message = "Failed to get recent activity" });
            }
        }

        private string GetKioskId()
        {
            return User.FindFirst("kiosk_id")?.Value ?? 
                   throw new UnauthorizedAccessException("Kiosk ID not found in token");
        }
    }

    public class RegisterKioskRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public List<string> AllowedGeofences { get; set; } = new();
    }

    public class KioskAuthRequest
    {
        public string KioskId { get; set; } = string.Empty;
        public string AccessCode { get; set; } = string.Empty;
    }

    public class EmployeeLookupRequest
    {
        public string EmployeeId { get; set; } = string.Empty;
        public string? BiometricData { get; set; }
    }

    public class KioskAttendanceRequest
    {
        public string EmployeeId { get; set; } = string.Empty;
        public LocationInfo Location { get; set; } = new();
        public string? BiometricData { get; set; }
    }
}
