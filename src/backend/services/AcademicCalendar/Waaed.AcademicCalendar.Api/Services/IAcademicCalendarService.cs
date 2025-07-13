using Waaed.AcademicCalendar.Api.DTOs;
using Waaed.AcademicCalendar.Api.Entities;

namespace Waaed.AcademicCalendar.Api.Services;

public interface IAcademicCalendarService
{
    Task<IEnumerable<AcademicYearDto>> GetAcademicYearsAsync();
    Task<AcademicYearDto?> GetAcademicYearByIdAsync(int id);
    Task<AcademicYearDto> CreateAcademicYearAsync(CreateAcademicYearDto dto);
    Task<AcademicYearDto?> UpdateAcademicYearAsync(int id, UpdateAcademicYearDto dto);
    Task<bool> DeleteAcademicYearAsync(int id);
    
    Task<IEnumerable<SemesterDto>> GetSemestersAsync(int? academicYearId = null);
    Task<SemesterDto?> GetSemesterByIdAsync(int id);
    Task<SemesterDto> CreateSemesterAsync(CreateSemesterDto dto);
    Task<SemesterDto?> UpdateSemesterAsync(int id, UpdateSemesterDto dto);
    Task<bool> DeleteSemesterAsync(int id);
    
    Task<IEnumerable<AcademicEventDto>> GetAcademicEventsAsync(DateTime? startDate = null, DateTime? endDate = null, string? eventType = null);
    Task<AcademicEventDto?> GetAcademicEventByIdAsync(int id);
    Task<AcademicEventDto> CreateAcademicEventAsync(CreateAcademicEventDto dto);
    Task<AcademicEventDto?> UpdateAcademicEventAsync(int id, UpdateAcademicEventDto dto);
    Task<bool> DeleteAcademicEventAsync(int id);
    
    Task<IEnumerable<HolidayDto>> GetHolidaysAsync(DateTime? startDate = null, DateTime? endDate = null, string? holidayType = null);
    Task<HolidayDto?> GetHolidayByIdAsync(int id);
    Task<HolidayDto> CreateHolidayAsync(CreateHolidayDto dto);
    Task<HolidayDto?> UpdateHolidayAsync(int id, UpdateHolidayDto dto);
    Task<bool> DeleteHolidayAsync(int id);
}
