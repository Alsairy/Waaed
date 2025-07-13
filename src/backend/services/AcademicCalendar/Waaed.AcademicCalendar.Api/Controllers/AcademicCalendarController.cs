using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Waaed.AcademicCalendar.Api.DTOs;
using Waaed.AcademicCalendar.Api.Services;

namespace Waaed.AcademicCalendar.Api.Controllers;

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

    [HttpGet("academic-years")]
    public async Task<ActionResult<IEnumerable<AcademicYearDto>>> GetAcademicYears()
    {
        try
        {
            var academicYears = await _academicCalendarService.GetAcademicYearsAsync();
            return Ok(academicYears);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving academic years");
            return StatusCode(500, "An error occurred while retrieving academic years");
        }
    }

    [HttpGet("academic-years/{id}")]
    public async Task<ActionResult<AcademicYearDto>> GetAcademicYear(int id)
    {
        try
        {
            var academicYear = await _academicCalendarService.GetAcademicYearByIdAsync(id);
            if (academicYear == null)
            {
                return NotFound($"Academic year with ID {id} not found");
            }
            return Ok(academicYear);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving academic year {Id}", id);
            return StatusCode(500, "An error occurred while retrieving the academic year");
        }
    }

    [HttpPost("academic-years")]
    public async Task<ActionResult<AcademicYearDto>> CreateAcademicYear([FromBody] CreateAcademicYearDto dto)
    {
        try
        {
            var academicYear = await _academicCalendarService.CreateAcademicYearAsync(dto);
            return CreatedAtAction(nameof(GetAcademicYear), new { id = academicYear.Id }, academicYear);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating academic year");
            return StatusCode(500, "An error occurred while creating the academic year");
        }
    }

    [HttpPut("academic-years/{id}")]
    public async Task<ActionResult<AcademicYearDto>> UpdateAcademicYear(int id, [FromBody] UpdateAcademicYearDto dto)
    {
        try
        {
            var academicYear = await _academicCalendarService.UpdateAcademicYearAsync(id, dto);
            if (academicYear == null)
            {
                return NotFound($"Academic year with ID {id} not found");
            }
            return Ok(academicYear);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating academic year {Id}", id);
            return StatusCode(500, "An error occurred while updating the academic year");
        }
    }

    [HttpDelete("academic-years/{id}")]
    public async Task<IActionResult> DeleteAcademicYear(int id)
    {
        try
        {
            var result = await _academicCalendarService.DeleteAcademicYearAsync(id);
            if (!result)
            {
                return NotFound($"Academic year with ID {id} not found");
            }
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting academic year {Id}", id);
            return StatusCode(500, "An error occurred while deleting the academic year");
        }
    }

    [HttpGet("semesters")]
    public async Task<ActionResult<IEnumerable<SemesterDto>>> GetSemesters([FromQuery] int? academicYearId = null)
    {
        try
        {
            var semesters = await _academicCalendarService.GetSemestersAsync(academicYearId);
            return Ok(semesters);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving semesters");
            return StatusCode(500, "An error occurred while retrieving semesters");
        }
    }

    [HttpGet("semesters/{id}")]
    public async Task<ActionResult<SemesterDto>> GetSemester(int id)
    {
        try
        {
            var semester = await _academicCalendarService.GetSemesterByIdAsync(id);
            if (semester == null)
            {
                return NotFound($"Semester with ID {id} not found");
            }
            return Ok(semester);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving semester {Id}", id);
            return StatusCode(500, "An error occurred while retrieving the semester");
        }
    }

    [HttpPost("semesters")]
    public async Task<ActionResult<SemesterDto>> CreateSemester([FromBody] CreateSemesterDto dto)
    {
        try
        {
            var semester = await _academicCalendarService.CreateSemesterAsync(dto);
            return CreatedAtAction(nameof(GetSemester), new { id = semester.Id }, semester);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating semester");
            return StatusCode(500, "An error occurred while creating the semester");
        }
    }

    [HttpPut("semesters/{id}")]
    public async Task<ActionResult<SemesterDto>> UpdateSemester(int id, [FromBody] UpdateSemesterDto dto)
    {
        try
        {
            var semester = await _academicCalendarService.UpdateSemesterAsync(id, dto);
            if (semester == null)
            {
                return NotFound($"Semester with ID {id} not found");
            }
            return Ok(semester);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating semester {Id}", id);
            return StatusCode(500, "An error occurred while updating the semester");
        }
    }

    [HttpDelete("semesters/{id}")]
    public async Task<IActionResult> DeleteSemester(int id)
    {
        try
        {
            var result = await _academicCalendarService.DeleteSemesterAsync(id);
            if (!result)
            {
                return NotFound($"Semester with ID {id} not found");
            }
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
        [FromQuery] string? eventType = null)
    {
        try
        {
            var events = await _academicCalendarService.GetAcademicEventsAsync(startDate, endDate, eventType);
            return Ok(events);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving academic events");
            return StatusCode(500, "An error occurred while retrieving academic events");
        }
    }

    [HttpGet("events/{id}")]
    public async Task<ActionResult<AcademicEventDto>> GetAcademicEvent(int id)
    {
        try
        {
            var academicEvent = await _academicCalendarService.GetAcademicEventByIdAsync(id);
            if (academicEvent == null)
            {
                return NotFound($"Academic event with ID {id} not found");
            }
            return Ok(academicEvent);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving academic event {Id}", id);
            return StatusCode(500, "An error occurred while retrieving the academic event");
        }
    }

    [HttpPost("events")]
    public async Task<ActionResult<AcademicEventDto>> CreateAcademicEvent([FromBody] CreateAcademicEventDto dto)
    {
        try
        {
            var academicEvent = await _academicCalendarService.CreateAcademicEventAsync(dto);
            return CreatedAtAction(nameof(GetAcademicEvent), new { id = academicEvent.Id }, academicEvent);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating academic event");
            return StatusCode(500, "An error occurred while creating the academic event");
        }
    }

    [HttpPut("events/{id}")]
    public async Task<ActionResult<AcademicEventDto>> UpdateAcademicEvent(int id, [FromBody] UpdateAcademicEventDto dto)
    {
        try
        {
            var academicEvent = await _academicCalendarService.UpdateAcademicEventAsync(id, dto);
            if (academicEvent == null)
            {
                return NotFound($"Academic event with ID {id} not found");
            }
            return Ok(academicEvent);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating academic event {Id}", id);
            return StatusCode(500, "An error occurred while updating the academic event");
        }
    }

    [HttpDelete("events/{id}")]
    public async Task<IActionResult> DeleteAcademicEvent(int id)
    {
        try
        {
            var result = await _academicCalendarService.DeleteAcademicEventAsync(id);
            if (!result)
            {
                return NotFound($"Academic event with ID {id} not found");
            }
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
        [FromQuery] DateTime? endDate = null,
        [FromQuery] string? holidayType = null)
    {
        try
        {
            var holidays = await _academicCalendarService.GetHolidaysAsync(startDate, endDate, holidayType);
            return Ok(holidays);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving holidays");
            return StatusCode(500, "An error occurred while retrieving holidays");
        }
    }

    [HttpGet("holidays/{id}")]
    public async Task<ActionResult<HolidayDto>> GetHoliday(int id)
    {
        try
        {
            var holiday = await _academicCalendarService.GetHolidayByIdAsync(id);
            if (holiday == null)
            {
                return NotFound($"Holiday with ID {id} not found");
            }
            return Ok(holiday);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving holiday {Id}", id);
            return StatusCode(500, "An error occurred while retrieving the holiday");
        }
    }

    [HttpPost("holidays")]
    public async Task<ActionResult<HolidayDto>> CreateHoliday([FromBody] CreateHolidayDto dto)
    {
        try
        {
            var holiday = await _academicCalendarService.CreateHolidayAsync(dto);
            return CreatedAtAction(nameof(GetHoliday), new { id = holiday.Id }, holiday);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating holiday");
            return StatusCode(500, "An error occurred while creating the holiday");
        }
    }

    [HttpPut("holidays/{id}")]
    public async Task<ActionResult<HolidayDto>> UpdateHoliday(int id, [FromBody] UpdateHolidayDto dto)
    {
        try
        {
            var holiday = await _academicCalendarService.UpdateHolidayAsync(id, dto);
            if (holiday == null)
            {
                return NotFound($"Holiday with ID {id} not found");
            }
            return Ok(holiday);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating holiday {Id}", id);
            return StatusCode(500, "An error occurred while updating the holiday");
        }
    }

    [HttpDelete("holidays/{id}")]
    public async Task<IActionResult> DeleteHoliday(int id)
    {
        try
        {
            var result = await _academicCalendarService.DeleteHolidayAsync(id);
            if (!result)
            {
                return NotFound($"Holiday with ID {id} not found");
            }
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting holiday {Id}", id);
            return StatusCode(500, "An error occurred while deleting the holiday");
        }
    }
}
