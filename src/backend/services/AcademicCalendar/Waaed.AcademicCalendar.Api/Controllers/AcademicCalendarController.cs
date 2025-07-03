using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Waaed.AcademicCalendar.Api.DTOs;
using Waaed.AcademicCalendar.Api.Entities;
using Waaed.AcademicCalendar.Api.Services;

namespace Waaed.AcademicCalendar.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AcademicCalendarController : ControllerBase
    {
        private readonly IAcademicCalendarService _academicCalendarService;
        private readonly ILogger<AcademicCalendarController> _logger;

        public AcademicCalendarController(
            IAcademicCalendarService academicCalendarService,
            ILogger<AcademicCalendarController> logger)
        {
            _academicCalendarService = academicCalendarService;
            _logger = logger;
        }

        private Guid GetTenantId()
        {
            var tenantIdClaim = User.FindFirst("tenant_id")?.Value;
            return Guid.TryParse(tenantIdClaim, out var tenantId) ? tenantId : Guid.Empty;
        }

        private Guid GetUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return Guid.TryParse(userIdClaim, out var userId) ? userId : Guid.Empty;
        }

        [HttpGet("academic-years")]
        public async Task<ActionResult<IEnumerable<AcademicYearDto>>> GetAcademicYears()
        {
            try
            {
                var tenantId = GetTenantId();
                var academicYears = await _academicCalendarService.GetAcademicYearsAsync(tenantId);
                return Ok(academicYears);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving academic years");
                return StatusCode(500, "An error occurred while retrieving academic years");
            }
        }

        [HttpGet("academic-years/{id}")]
        public async Task<ActionResult<AcademicYearDto>> GetAcademicYear(Guid id)
        {
            try
            {
                var tenantId = GetTenantId();
                var academicYear = await _academicCalendarService.GetAcademicYearByIdAsync(id, tenantId);
                
                if (academicYear == null)
                    return NotFound();

                return Ok(academicYear);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving academic year {Id}", id);
                return StatusCode(500, "An error occurred while retrieving the academic year");
            }
        }

        [HttpPost("academic-years")]
        public async Task<ActionResult<AcademicYearDto>> CreateAcademicYear(CreateAcademicYearDto dto)
        {
            try
            {
                var tenantId = GetTenantId();
                var academicYear = await _academicCalendarService.CreateAcademicYearAsync(dto, tenantId);
                return CreatedAtAction(nameof(GetAcademicYear), new { id = academicYear.Id }, academicYear);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating academic year");
                return StatusCode(500, "An error occurred while creating the academic year");
            }
        }

        [HttpPut("academic-years/{id}")]
        public async Task<ActionResult<AcademicYearDto>> UpdateAcademicYear(Guid id, UpdateAcademicYearDto dto)
        {
            try
            {
                var tenantId = GetTenantId();
                var academicYear = await _academicCalendarService.UpdateAcademicYearAsync(id, dto, tenantId);
                
                if (academicYear == null)
                    return NotFound();

                return Ok(academicYear);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating academic year {Id}", id);
                return StatusCode(500, "An error occurred while updating the academic year");
            }
        }

        [HttpDelete("academic-years/{id}")]
        public async Task<IActionResult> DeleteAcademicYear(Guid id)
        {
            try
            {
                var tenantId = GetTenantId();
                var deleted = await _academicCalendarService.DeleteAcademicYearAsync(id, tenantId);
                
                if (!deleted)
                    return NotFound();

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting academic year {Id}", id);
                return StatusCode(500, "An error occurred while deleting the academic year");
            }
        }

        [HttpGet("semesters")]
        public async Task<ActionResult<IEnumerable<SemesterDto>>> GetSemesters([FromQuery] Guid? academicYearId = null)
        {
            try
            {
                var tenantId = GetTenantId();
                var semesters = await _academicCalendarService.GetSemestersAsync(tenantId, academicYearId);
                return Ok(semesters);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving semesters");
                return StatusCode(500, "An error occurred while retrieving semesters");
            }
        }

        [HttpGet("semesters/{id}")]
        public async Task<ActionResult<SemesterDto>> GetSemester(Guid id)
        {
            try
            {
                var tenantId = GetTenantId();
                var semester = await _academicCalendarService.GetSemesterByIdAsync(id, tenantId);
                
                if (semester == null)
                    return NotFound();

                return Ok(semester);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving semester {Id}", id);
                return StatusCode(500, "An error occurred while retrieving the semester");
            }
        }

        [HttpPost("semesters")]
        public async Task<ActionResult<SemesterDto>> CreateSemester(CreateSemesterDto dto)
        {
            try
            {
                var tenantId = GetTenantId();
                var semester = await _academicCalendarService.CreateSemesterAsync(dto, tenantId);
                return CreatedAtAction(nameof(GetSemester), new { id = semester.Id }, semester);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating semester");
                return StatusCode(500, "An error occurred while creating the semester");
            }
        }

        [HttpPut("semesters/{id}")]
        public async Task<ActionResult<SemesterDto>> UpdateSemester(Guid id, UpdateSemesterDto dto)
        {
            try
            {
                var tenantId = GetTenantId();
                var semester = await _academicCalendarService.UpdateSemesterAsync(id, dto, tenantId);
                
                if (semester == null)
                    return NotFound();

                return Ok(semester);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating semester {Id}", id);
                return StatusCode(500, "An error occurred while updating the semester");
            }
        }

        [HttpDelete("semesters/{id}")]
        public async Task<IActionResult> DeleteSemester(Guid id)
        {
            try
            {
                var tenantId = GetTenantId();
                var deleted = await _academicCalendarService.DeleteSemesterAsync(id, tenantId);
                
                if (!deleted)
                    return NotFound();

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting semester {Id}", id);
                return StatusCode(500, "An error occurred while deleting the semester");
            }
        }

        [HttpGet("events")]
        public async Task<ActionResult<IEnumerable<AcademicEventDto>>> GetAcademicEvents(
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null,
            [FromQuery] EventType? type = null)
        {
            try
            {
                var tenantId = GetTenantId();
                var events = await _academicCalendarService.GetAcademicEventsAsync(tenantId, startDate, endDate, type);
                return Ok(events);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving academic events");
                return StatusCode(500, "An error occurred while retrieving academic events");
            }
        }

        [HttpGet("events/{id}")]
        public async Task<ActionResult<AcademicEventDto>> GetAcademicEvent(Guid id)
        {
            try
            {
                var tenantId = GetTenantId();
                var academicEvent = await _academicCalendarService.GetAcademicEventByIdAsync(id, tenantId);
                
                if (academicEvent == null)
                    return NotFound();

                return Ok(academicEvent);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving academic event {Id}", id);
                return StatusCode(500, "An error occurred while retrieving the academic event");
            }
        }

        [HttpPost("events")]
        public async Task<ActionResult<AcademicEventDto>> CreateAcademicEvent(CreateAcademicEventDto dto)
        {
            try
            {
                var tenantId = GetTenantId();
                var userId = GetUserId();
                var academicEvent = await _academicCalendarService.CreateAcademicEventAsync(dto, tenantId, userId);
                return CreatedAtAction(nameof(GetAcademicEvent), new { id = academicEvent.Id }, academicEvent);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating academic event");
                return StatusCode(500, "An error occurred while creating the academic event");
            }
        }

        [HttpPut("events/{id}")]
        public async Task<ActionResult<AcademicEventDto>> UpdateAcademicEvent(Guid id, UpdateAcademicEventDto dto)
        {
            try
            {
                var tenantId = GetTenantId();
                var academicEvent = await _academicCalendarService.UpdateAcademicEventAsync(id, dto, tenantId);
                
                if (academicEvent == null)
                    return NotFound();

                return Ok(academicEvent);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating academic event {Id}", id);
                return StatusCode(500, "An error occurred while updating the academic event");
            }
        }

        [HttpDelete("events/{id}")]
        public async Task<IActionResult> DeleteAcademicEvent(Guid id)
        {
            try
            {
                var tenantId = GetTenantId();
                var deleted = await _academicCalendarService.DeleteAcademicEventAsync(id, tenantId);
                
                if (!deleted)
                    return NotFound();

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting academic event {Id}", id);
                return StatusCode(500, "An error occurred while deleting the academic event");
            }
        }

        [HttpGet("holidays")]
        public async Task<ActionResult<IEnumerable<HolidayDto>>> GetHolidays(
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            try
            {
                var tenantId = GetTenantId();
                var holidays = await _academicCalendarService.GetHolidaysAsync(tenantId, startDate, endDate);
                return Ok(holidays);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving holidays");
                return StatusCode(500, "An error occurred while retrieving holidays");
            }
        }

        [HttpGet("holidays/{id}")]
        public async Task<ActionResult<HolidayDto>> GetHoliday(Guid id)
        {
            try
            {
                var tenantId = GetTenantId();
                var holiday = await _academicCalendarService.GetHolidayByIdAsync(id, tenantId);
                
                if (holiday == null)
                    return NotFound();

                return Ok(holiday);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving holiday {Id}", id);
                return StatusCode(500, "An error occurred while retrieving the holiday");
            }
        }

        [HttpPost("holidays")]
        public async Task<ActionResult<HolidayDto>> CreateHoliday(CreateHolidayDto dto)
        {
            try
            {
                var tenantId = GetTenantId();
                var holiday = await _academicCalendarService.CreateHolidayAsync(dto, tenantId);
                return CreatedAtAction(nameof(GetHoliday), new { id = holiday.Id }, holiday);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating holiday");
                return StatusCode(500, "An error occurred while creating the holiday");
            }
        }

        [HttpPut("holidays/{id}")]
        public async Task<ActionResult<HolidayDto>> UpdateHoliday(Guid id, UpdateHolidayDto dto)
        {
            try
            {
                var tenantId = GetTenantId();
                var holiday = await _academicCalendarService.UpdateHolidayAsync(id, dto, tenantId);
                
                if (holiday == null)
                    return NotFound();

                return Ok(holiday);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating holiday {Id}", id);
                return StatusCode(500, "An error occurred while updating the holiday");
            }
        }

        [HttpDelete("holidays/{id}")]
        public async Task<IActionResult> DeleteHoliday(Guid id)
        {
            try
            {
                var tenantId = GetTenantId();
                var deleted = await _academicCalendarService.DeleteHolidayAsync(id, tenantId);
                
                if (!deleted)
                    return NotFound();

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting holiday {Id}", id);
                return StatusCode(500, "An error occurred while deleting the holiday");
            }
        }
    }
}
