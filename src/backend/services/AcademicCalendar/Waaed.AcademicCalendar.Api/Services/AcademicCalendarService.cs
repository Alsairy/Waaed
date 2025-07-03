using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Waaed.AcademicCalendar.Api.Data;
using Waaed.AcademicCalendar.Api.DTOs;
using Waaed.AcademicCalendar.Api.Entities;

namespace Waaed.AcademicCalendar.Api.Services
{
    public class AcademicCalendarService : IAcademicCalendarService
    {
        private readonly AcademicCalendarDbContext _context;
        private readonly IMapper _mapper;
        private readonly ILogger<AcademicCalendarService> _logger;

        public AcademicCalendarService(
            AcademicCalendarDbContext context,
            IMapper mapper,
            ILogger<AcademicCalendarService> logger)
        {
            _context = context;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<IEnumerable<AcademicYearDto>> GetAcademicYearsAsync(Guid tenantId)
        {
            var academicYears = await _context.AcademicYears
                .Where(ay => ay.TenantId == tenantId)
                .Include(ay => ay.Semesters)
                .Include(ay => ay.AcademicEvents)
                .Include(ay => ay.Holidays)
                .OrderByDescending(ay => ay.StartDate)
                .ToListAsync();

            return _mapper.Map<IEnumerable<AcademicYearDto>>(academicYears);
        }

        public async Task<AcademicYearDto?> GetAcademicYearByIdAsync(Guid id, Guid tenantId)
        {
            var academicYear = await _context.AcademicYears
                .Where(ay => ay.Id == id && ay.TenantId == tenantId)
                .Include(ay => ay.Semesters)
                .Include(ay => ay.AcademicEvents)
                .Include(ay => ay.Holidays)
                .FirstOrDefaultAsync();

            return academicYear != null ? _mapper.Map<AcademicYearDto>(academicYear) : null;
        }

        public async Task<AcademicYearDto> CreateAcademicYearAsync(CreateAcademicYearDto dto, Guid tenantId)
        {
            var academicYear = _mapper.Map<AcademicYear>(dto);
            academicYear.TenantId = tenantId;

            _context.AcademicYears.Add(academicYear);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Created academic year {Name} for tenant {TenantId}", dto.Name, tenantId);

            return _mapper.Map<AcademicYearDto>(academicYear);
        }

        public async Task<AcademicYearDto?> UpdateAcademicYearAsync(Guid id, UpdateAcademicYearDto dto, Guid tenantId)
        {
            var academicYear = await _context.AcademicYears
                .FirstOrDefaultAsync(ay => ay.Id == id && ay.TenantId == tenantId);

            if (academicYear == null)
                return null;

            _mapper.Map(dto, academicYear);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Updated academic year {Id} for tenant {TenantId}", id, tenantId);

            return _mapper.Map<AcademicYearDto>(academicYear);
        }

        public async Task<bool> DeleteAcademicYearAsync(Guid id, Guid tenantId)
        {
            var academicYear = await _context.AcademicYears
                .FirstOrDefaultAsync(ay => ay.Id == id && ay.TenantId == tenantId);

            if (academicYear == null)
                return false;

            _context.AcademicYears.Remove(academicYear);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Deleted academic year {Id} for tenant {TenantId}", id, tenantId);

            return true;
        }

        public async Task<IEnumerable<SemesterDto>> GetSemestersAsync(Guid tenantId, Guid? academicYearId = null)
        {
            var query = _context.Semesters
                .Where(s => s.TenantId == tenantId)
                .Include(s => s.AcademicYear)
                .Include(s => s.AcademicEvents);

            if (academicYearId.HasValue)
                query = query.Where(s => s.AcademicYearId == academicYearId.Value);

            var semesters = await query
                .OrderBy(s => s.StartDate)
                .ToListAsync();

            return _mapper.Map<IEnumerable<SemesterDto>>(semesters);
        }

        public async Task<SemesterDto?> GetSemesterByIdAsync(Guid id, Guid tenantId)
        {
            var semester = await _context.Semesters
                .Where(s => s.Id == id && s.TenantId == tenantId)
                .Include(s => s.AcademicYear)
                .Include(s => s.AcademicEvents)
                .FirstOrDefaultAsync();

            return semester != null ? _mapper.Map<SemesterDto>(semester) : null;
        }

        public async Task<SemesterDto> CreateSemesterAsync(CreateSemesterDto dto, Guid tenantId)
        {
            var semester = _mapper.Map<Semester>(dto);
            semester.TenantId = tenantId;

            _context.Semesters.Add(semester);
            await _context.SaveChangesAsync();

            await _context.Entry(semester)
                .Reference(s => s.AcademicYear)
                .LoadAsync();

            _logger.LogInformation("Created semester {Name} for tenant {TenantId}", dto.Name, tenantId);

            return _mapper.Map<SemesterDto>(semester);
        }

        public async Task<SemesterDto?> UpdateSemesterAsync(Guid id, UpdateSemesterDto dto, Guid tenantId)
        {
            var semester = await _context.Semesters
                .Include(s => s.AcademicYear)
                .FirstOrDefaultAsync(s => s.Id == id && s.TenantId == tenantId);

            if (semester == null)
                return null;

            _mapper.Map(dto, semester);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Updated semester {Id} for tenant {TenantId}", id, tenantId);

            return _mapper.Map<SemesterDto>(semester);
        }

        public async Task<bool> DeleteSemesterAsync(Guid id, Guid tenantId)
        {
            var semester = await _context.Semesters
                .FirstOrDefaultAsync(s => s.Id == id && s.TenantId == tenantId);

            if (semester == null)
                return false;

            _context.Semesters.Remove(semester);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Deleted semester {Id} for tenant {TenantId}", id, tenantId);

            return true;
        }

        public async Task<IEnumerable<AcademicEventDto>> GetAcademicEventsAsync(Guid tenantId, DateTime? startDate = null, DateTime? endDate = null, EventType? type = null)
        {
            var query = _context.AcademicEvents
                .Where(ae => ae.TenantId == tenantId)
                .Include(ae => ae.AcademicYear)
                .Include(ae => ae.Semester);

            if (startDate.HasValue)
                query = query.Where(ae => ae.StartDate >= startDate.Value);

            if (endDate.HasValue)
                query = query.Where(ae => ae.StartDate <= endDate.Value);

            if (type.HasValue)
                query = query.Where(ae => ae.Type == type.Value);

            var events = await query
                .OrderBy(ae => ae.StartDate)
                .ToListAsync();

            return _mapper.Map<IEnumerable<AcademicEventDto>>(events);
        }

        public async Task<AcademicEventDto?> GetAcademicEventByIdAsync(Guid id, Guid tenantId)
        {
            var academicEvent = await _context.AcademicEvents
                .Where(ae => ae.Id == id && ae.TenantId == tenantId)
                .Include(ae => ae.AcademicYear)
                .Include(ae => ae.Semester)
                .FirstOrDefaultAsync();

            return academicEvent != null ? _mapper.Map<AcademicEventDto>(academicEvent) : null;
        }

        public async Task<AcademicEventDto> CreateAcademicEventAsync(CreateAcademicEventDto dto, Guid tenantId, Guid userId)
        {
            var academicEvent = _mapper.Map<AcademicEvent>(dto);
            academicEvent.TenantId = tenantId;
            academicEvent.CreatedBy = userId;

            _context.AcademicEvents.Add(academicEvent);
            await _context.SaveChangesAsync();

            await _context.Entry(academicEvent)
                .Reference(ae => ae.AcademicYear)
                .LoadAsync();

            await _context.Entry(academicEvent)
                .Reference(ae => ae.Semester)
                .LoadAsync();

            _logger.LogInformation("Created academic event {Title} for tenant {TenantId}", dto.Title, tenantId);

            return _mapper.Map<AcademicEventDto>(academicEvent);
        }

        public async Task<AcademicEventDto?> UpdateAcademicEventAsync(Guid id, UpdateAcademicEventDto dto, Guid tenantId)
        {
            var academicEvent = await _context.AcademicEvents
                .Include(ae => ae.AcademicYear)
                .Include(ae => ae.Semester)
                .FirstOrDefaultAsync(ae => ae.Id == id && ae.TenantId == tenantId);

            if (academicEvent == null)
                return null;

            _mapper.Map(dto, academicEvent);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Updated academic event {Id} for tenant {TenantId}", id, tenantId);

            return _mapper.Map<AcademicEventDto>(academicEvent);
        }

        public async Task<bool> DeleteAcademicEventAsync(Guid id, Guid tenantId)
        {
            var academicEvent = await _context.AcademicEvents
                .FirstOrDefaultAsync(ae => ae.Id == id && ae.TenantId == tenantId);

            if (academicEvent == null)
                return false;

            _context.AcademicEvents.Remove(academicEvent);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Deleted academic event {Id} for tenant {TenantId}", id, tenantId);

            return true;
        }

        public async Task<IEnumerable<HolidayDto>> GetHolidaysAsync(Guid tenantId, DateTime? startDate = null, DateTime? endDate = null)
        {
            var query = _context.Holidays
                .Where(h => h.TenantId == tenantId)
                .Include(h => h.AcademicYear);

            if (startDate.HasValue)
                query = query.Where(h => h.Date >= startDate.Value);

            if (endDate.HasValue)
                query = query.Where(h => h.Date <= endDate.Value);

            var holidays = await query
                .OrderBy(h => h.Date)
                .ToListAsync();

            return _mapper.Map<IEnumerable<HolidayDto>>(holidays);
        }

        public async Task<HolidayDto?> GetHolidayByIdAsync(Guid id, Guid tenantId)
        {
            var holiday = await _context.Holidays
                .Where(h => h.Id == id && h.TenantId == tenantId)
                .Include(h => h.AcademicYear)
                .FirstOrDefaultAsync();

            return holiday != null ? _mapper.Map<HolidayDto>(holiday) : null;
        }

        public async Task<HolidayDto> CreateHolidayAsync(CreateHolidayDto dto, Guid tenantId)
        {
            var holiday = _mapper.Map<Holiday>(dto);
            holiday.TenantId = tenantId;

            _context.Holidays.Add(holiday);
            await _context.SaveChangesAsync();

            await _context.Entry(holiday)
                .Reference(h => h.AcademicYear)
                .LoadAsync();

            _logger.LogInformation("Created holiday {Name} for tenant {TenantId}", dto.Name, tenantId);

            return _mapper.Map<HolidayDto>(holiday);
        }

        public async Task<HolidayDto?> UpdateHolidayAsync(Guid id, UpdateHolidayDto dto, Guid tenantId)
        {
            var holiday = await _context.Holidays
                .Include(h => h.AcademicYear)
                .FirstOrDefaultAsync(h => h.Id == id && h.TenantId == tenantId);

            if (holiday == null)
                return null;

            _mapper.Map(dto, holiday);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Updated holiday {Id} for tenant {TenantId}", id, tenantId);

            return _mapper.Map<HolidayDto>(holiday);
        }

        public async Task<bool> DeleteHolidayAsync(Guid id, Guid tenantId)
        {
            var holiday = await _context.Holidays
                .FirstOrDefaultAsync(h => h.Id == id && h.TenantId == tenantId);

            if (holiday == null)
                return false;

            _context.Holidays.Remove(holiday);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Deleted holiday {Id} for tenant {TenantId}", id, tenantId);

            return true;
        }
    }
}
