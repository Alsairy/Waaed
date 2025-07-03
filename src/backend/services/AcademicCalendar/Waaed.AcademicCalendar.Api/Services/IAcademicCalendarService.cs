using Waaed.AcademicCalendar.Api.DTOs;
using Waaed.AcademicCalendar.Api.Entities;

namespace Waaed.AcademicCalendar.Api.Services
{
    public interface IAcademicCalendarService
    {
        Task<IEnumerable<AcademicYearDto>> GetAcademicYearsAsync(Guid tenantId);
        Task<AcademicYearDto?> GetAcademicYearByIdAsync(Guid id, Guid tenantId);
        Task<AcademicYearDto> CreateAcademicYearAsync(CreateAcademicYearDto dto, Guid tenantId);
        Task<AcademicYearDto?> UpdateAcademicYearAsync(Guid id, UpdateAcademicYearDto dto, Guid tenantId);
        Task<bool> DeleteAcademicYearAsync(Guid id, Guid tenantId);

        Task<IEnumerable<SemesterDto>> GetSemestersAsync(Guid tenantId, Guid? academicYearId = null);
        Task<SemesterDto?> GetSemesterByIdAsync(Guid id, Guid tenantId);
        Task<SemesterDto> CreateSemesterAsync(CreateSemesterDto dto, Guid tenantId);
        Task<SemesterDto?> UpdateSemesterAsync(Guid id, UpdateSemesterDto dto, Guid tenantId);
        Task<bool> DeleteSemesterAsync(Guid id, Guid tenantId);

        Task<IEnumerable<AcademicEventDto>> GetAcademicEventsAsync(Guid tenantId, DateTime? startDate = null, DateTime? endDate = null, EventType? type = null);
        Task<AcademicEventDto?> GetAcademicEventByIdAsync(Guid id, Guid tenantId);
        Task<AcademicEventDto> CreateAcademicEventAsync(CreateAcademicEventDto dto, Guid tenantId, Guid userId);
        Task<AcademicEventDto?> UpdateAcademicEventAsync(Guid id, UpdateAcademicEventDto dto, Guid tenantId);
        Task<bool> DeleteAcademicEventAsync(Guid id, Guid tenantId);

        Task<IEnumerable<HolidayDto>> GetHolidaysAsync(Guid tenantId, DateTime? startDate = null, DateTime? endDate = null);
        Task<HolidayDto?> GetHolidayByIdAsync(Guid id, Guid tenantId);
        Task<HolidayDto> CreateHolidayAsync(CreateHolidayDto dto, Guid tenantId);
        Task<HolidayDto?> UpdateHolidayAsync(Guid id, UpdateHolidayDto dto, Guid tenantId);
        Task<bool> DeleteHolidayAsync(Guid id, Guid tenantId);
    }
}
