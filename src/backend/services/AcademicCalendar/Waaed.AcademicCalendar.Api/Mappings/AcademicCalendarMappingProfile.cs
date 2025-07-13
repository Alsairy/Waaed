using AutoMapper;
using Waaed.AcademicCalendar.Api.DTOs;
using Waaed.AcademicCalendar.Api.Entities;

namespace Waaed.AcademicCalendar.Api.Mappings;

public class AcademicCalendarMappingProfile : Profile
{
    public AcademicCalendarMappingProfile()
    {
        CreateMap<AcademicYear, AcademicYearDto>();
        CreateMap<CreateAcademicYearDto, AcademicYear>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.TenantId, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.Semesters, opt => opt.Ignore())
            .ForMember(dest => dest.AcademicEvents, opt => opt.Ignore());

        CreateMap<UpdateAcademicYearDto, AcademicYear>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.TenantId, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.Semesters, opt => opt.Ignore())
            .ForMember(dest => dest.AcademicEvents, opt => opt.Ignore())
            .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));

        CreateMap<Semester, SemesterDto>();
        CreateMap<CreateSemesterDto, Semester>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.TenantId, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.AcademicYear, opt => opt.Ignore())
            .ForMember(dest => dest.AcademicEvents, opt => opt.Ignore());

        CreateMap<UpdateSemesterDto, Semester>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.TenantId, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.AcademicYear, opt => opt.Ignore())
            .ForMember(dest => dest.AcademicYearId, opt => opt.Ignore())
            .ForMember(dest => dest.AcademicEvents, opt => opt.Ignore())
            .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));

        CreateMap<AcademicEvent, AcademicEventDto>();
        CreateMap<CreateAcademicEventDto, AcademicEvent>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.TenantId, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedBy, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.AcademicYear, opt => opt.Ignore())
            .ForMember(dest => dest.Semester, opt => opt.Ignore());

        CreateMap<UpdateAcademicEventDto, AcademicEvent>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.TenantId, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedBy, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.AcademicYear, opt => opt.Ignore())
            .ForMember(dest => dest.Semester, opt => opt.Ignore())
            .ForMember(dest => dest.AcademicYearId, opt => opt.Ignore())
            .ForMember(dest => dest.SemesterId, opt => opt.Ignore())
            .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));

        CreateMap<Holiday, HolidayDto>();
        CreateMap<CreateHolidayDto, Holiday>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.TenantId, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore());

        CreateMap<UpdateHolidayDto, Holiday>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.TenantId, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
            .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));
    }
}
