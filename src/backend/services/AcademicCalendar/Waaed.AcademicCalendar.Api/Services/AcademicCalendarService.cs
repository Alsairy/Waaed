using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Waaed.AcademicCalendar.Api.Data;
using Waaed.AcademicCalendar.Api.DTOs;
using Waaed.AcademicCalendar.Api.Entities;
using Waaed.Shared.Domain.Interfaces;

namespace Waaed.AcademicCalendar.Api.Services;

public class AcademicCalendarService : IAcademicCalendarService
{
    private readonly AcademicCalendarDbContext _context;
    private readonly IMapper _mapper;
    private readonly ICurrentUserService _currentUserService;
    private readonly ITenantContext _tenantContext;
    private readonly ILogger<AcademicCalendarService> _logger;

    public AcademicCalendarService(
        AcademicCalendarDbContext context,
        IMapper mapper,
        ICurrentUserService currentUserService,
        ITenantContext tenantContext,
        ILogger<AcademicCalendarService> logger)
    {
        _context = context;
        _mapper = mapper;
        _currentUserService = currentUserService;
        _tenantContext = tenantContext;
        _logger = logger;
    }

    public async Task<IEnumerable<AcademicYearDto>> GetAcademicYearsAsync()
    {
        var tenantId = _tenantContext.TenantId?.ToString();
        var academicYears = await _context.AcademicYears
            .Where(ay => ay.TenantId == tenantId)
            .OrderByDescending(ay => ay.StartDate)
            .ToListAsync();

        return _mapper.Map<IEnumerable<AcademicYearDto>>(academicYears);
    }

    public async Task<AcademicYearDto?> GetAcademicYearByIdAsync(int id)
    {
        var tenantId = _tenantContext.TenantId?.ToString();
        var academicYear = await _context.AcademicYears
            .FirstOrDefaultAsync(ay => ay.Id == id && ay.TenantId == tenantId);

        return academicYear != null ? _mapper.Map<AcademicYearDto>(academicYear) : null;
    }

    public async Task<AcademicYearDto> CreateAcademicYearAsync(CreateAcademicYearDto dto)
    {
        var tenantId = _tenantContext.TenantId?.ToString();
        var academicYear = _mapper.Map<AcademicYear>(dto);
        academicYear.TenantId = tenantId ?? string.Empty;
        academicYear.CreatedAt = DateTime.UtcNow;
        academicYear.UpdatedAt = DateTime.UtcNow;

        _context.AcademicYears.Add(academicYear);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Academic year {Name} created for tenant {TenantId}", dto.Name, tenantId);
        return _mapper.Map<AcademicYearDto>(academicYear);
    }

    public async Task<AcademicYearDto?> UpdateAcademicYearAsync(int id, UpdateAcademicYearDto dto)
    {
        var tenantId = _tenantContext.TenantId?.ToString();
        var academicYear = await _context.AcademicYears
            .FirstOrDefaultAsync(ay => ay.Id == id && ay.TenantId == tenantId);

        if (academicYear == null) return null;

        _mapper.Map(dto, academicYear);
        academicYear.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return _mapper.Map<AcademicYearDto>(academicYear);
    }

    public async Task<bool> DeleteAcademicYearAsync(int id)
    {
        var tenantId = _tenantContext.TenantId?.ToString();
        var academicYear = await _context.AcademicYears
            .FirstOrDefaultAsync(ay => ay.Id == id && ay.TenantId == tenantId);

        if (academicYear == null) return false;

        _context.AcademicYears.Remove(academicYear);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<IEnumerable<SemesterDto>> GetSemestersAsync(int? academicYearId = null)
    {
        var tenantId = _tenantContext.TenantId?.ToString();
        var query = _context.Semesters
            .Where(s => s.TenantId == tenantId);

        if (academicYearId.HasValue)
        {
            query = query.Where(s => s.AcademicYearId == academicYearId.Value);
        }

        var semesters = await query
            .OrderBy(s => s.StartDate)
            .ToListAsync();

        return _mapper.Map<IEnumerable<SemesterDto>>(semesters);
    }

    public async Task<SemesterDto?> GetSemesterByIdAsync(int id)
    {
        var tenantId = _tenantContext.TenantId?.ToString();
        var semester = await _context.Semesters
            .FirstOrDefaultAsync(s => s.Id == id && s.TenantId == tenantId);

        return semester != null ? _mapper.Map<SemesterDto>(semester) : null;
    }

    public async Task<SemesterDto> CreateSemesterAsync(CreateSemesterDto dto)
    {
        var tenantId = _tenantContext.TenantId?.ToString();
        var semester = _mapper.Map<Semester>(dto);
        semester.TenantId = tenantId ?? string.Empty;
        semester.CreatedAt = DateTime.UtcNow;
        semester.UpdatedAt = DateTime.UtcNow;

        _context.Semesters.Add(semester);
        await _context.SaveChangesAsync();

        return _mapper.Map<SemesterDto>(semester);
    }

    public async Task<SemesterDto?> UpdateSemesterAsync(int id, UpdateSemesterDto dto)
    {
        var tenantId = _tenantContext.TenantId?.ToString();
        var semester = await _context.Semesters
            .FirstOrDefaultAsync(s => s.Id == id && s.TenantId == tenantId);

        if (semester == null) return null;

        _mapper.Map(dto, semester);
        semester.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return _mapper.Map<SemesterDto>(semester);
    }

    public async Task<bool> DeleteSemesterAsync(int id)
    {
        var tenantId = _tenantContext.TenantId?.ToString();
        var semester = await _context.Semesters
            .FirstOrDefaultAsync(s => s.Id == id && s.TenantId == tenantId);

        if (semester == null) return false;

        _context.Semesters.Remove(semester);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<IEnumerable<AcademicEventDto>> GetAcademicEventsAsync(DateTime? startDate = null, DateTime? endDate = null, string? eventType = null)
    {
        var tenantId = _tenantContext.TenantId?.ToString();
        var query = _context.AcademicEvents
            .Where(ae => ae.TenantId == tenantId);

        if (startDate.HasValue)
        {
            query = query.Where(ae => ae.StartDate >= startDate.Value);
        }

        if (endDate.HasValue)
        {
            query = query.Where(ae => ae.StartDate <= endDate.Value);
        }

        if (!string.IsNullOrEmpty(eventType))
        {
            query = query.Where(ae => ae.EventType == eventType);
        }

        var events = await query
            .OrderBy(ae => ae.StartDate)
            .ToListAsync();

        return _mapper.Map<IEnumerable<AcademicEventDto>>(events);
    }

    public async Task<AcademicEventDto?> GetAcademicEventByIdAsync(int id)
    {
        var tenantId = _tenantContext.TenantId?.ToString();
        var academicEvent = await _context.AcademicEvents
            .FirstOrDefaultAsync(ae => ae.Id == id && ae.TenantId == tenantId);

        return academicEvent != null ? _mapper.Map<AcademicEventDto>(academicEvent) : null;
    }

    public async Task<AcademicEventDto> CreateAcademicEventAsync(CreateAcademicEventDto dto)
    {
        var tenantId = _tenantContext.TenantId?.ToString();
        var userId = _currentUserService.UserId;
        var academicEvent = _mapper.Map<AcademicEvent>(dto);
        academicEvent.TenantId = tenantId ?? string.Empty;
        academicEvent.CreatedBy = userId?.ToString();
        academicEvent.CreatedAt = DateTime.UtcNow;
        academicEvent.UpdatedAt = DateTime.UtcNow;

        _context.AcademicEvents.Add(academicEvent);
        await _context.SaveChangesAsync();

        return _mapper.Map<AcademicEventDto>(academicEvent);
    }

    public async Task<AcademicEventDto?> UpdateAcademicEventAsync(int id, UpdateAcademicEventDto dto)
    {
        var tenantId = _tenantContext.TenantId?.ToString();
        var academicEvent = await _context.AcademicEvents
            .FirstOrDefaultAsync(ae => ae.Id == id && ae.TenantId == tenantId);

        if (academicEvent == null) return null;

        _mapper.Map(dto, academicEvent);
        academicEvent.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return _mapper.Map<AcademicEventDto>(academicEvent);
    }

    public async Task<bool> DeleteAcademicEventAsync(int id)
    {
        var tenantId = _tenantContext.TenantId?.ToString();
        var academicEvent = await _context.AcademicEvents
            .FirstOrDefaultAsync(ae => ae.Id == id && ae.TenantId == tenantId);

        if (academicEvent == null) return false;

        _context.AcademicEvents.Remove(academicEvent);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<IEnumerable<HolidayDto>> GetHolidaysAsync(DateTime? startDate = null, DateTime? endDate = null, string? holidayType = null)
    {
        var tenantId = _tenantContext.TenantId?.ToString();
        var query = _context.Holidays
            .Where(h => h.TenantId == tenantId);

        if (startDate.HasValue)
        {
            query = query.Where(h => h.Date >= startDate.Value);
        }

        if (endDate.HasValue)
        {
            query = query.Where(h => h.Date <= endDate.Value);
        }

        if (!string.IsNullOrEmpty(holidayType))
        {
            query = query.Where(h => h.HolidayType == holidayType);
        }

        var holidays = await query
            .OrderBy(h => h.Date)
            .ToListAsync();

        return _mapper.Map<IEnumerable<HolidayDto>>(holidays);
    }

    public async Task<HolidayDto?> GetHolidayByIdAsync(int id)
    {
        var tenantId = _tenantContext.TenantId?.ToString();
        var holiday = await _context.Holidays
            .FirstOrDefaultAsync(h => h.Id == id && h.TenantId == tenantId);

        return holiday != null ? _mapper.Map<HolidayDto>(holiday) : null;
    }

    public async Task<HolidayDto> CreateHolidayAsync(CreateHolidayDto dto)
    {
        var tenantId = _tenantContext.TenantId?.ToString();
        var holiday = _mapper.Map<Holiday>(dto);
        holiday.TenantId = tenantId ?? string.Empty;
        holiday.CreatedAt = DateTime.UtcNow;
        holiday.UpdatedAt = DateTime.UtcNow;

        _context.Holidays.Add(holiday);
        await _context.SaveChangesAsync();

        return _mapper.Map<HolidayDto>(holiday);
    }

    public async Task<HolidayDto?> UpdateHolidayAsync(int id, UpdateHolidayDto dto)
    {
        var tenantId = _tenantContext.TenantId?.ToString();
        var holiday = await _context.Holidays
            .FirstOrDefaultAsync(h => h.Id == id && h.TenantId == tenantId);

        if (holiday == null) return null;

        _mapper.Map(dto, holiday);
        holiday.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return _mapper.Map<HolidayDto>(holiday);
    }

    public async Task<bool> DeleteHolidayAsync(int id)
    {
        var tenantId = _tenantContext.TenantId?.ToString();
        var holiday = await _context.Holidays
            .FirstOrDefaultAsync(h => h.Id == id && h.TenantId == tenantId);

        if (holiday == null) return false;

        _context.Holidays.Remove(holiday);
        await _context.SaveChangesAsync();
        return true;
    }
}
