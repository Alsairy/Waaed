using AutoMapper;
using Waaed.AcademicCalendar.Api.DTOs;
using Waaed.AcademicCalendar.Api.Entities;

namespace Waaed.AcademicCalendar.Api.Mappings
{
    public class AcademicCalendarMappingProfile : Profile
    {
        public AcademicCalendarMappingProfile()
        {
            CreateMap<AcademicYear, AcademicYearDto>()
                .ForMember(dest => dest.Semesters, opt => opt.MapFrom(src => src.Semesters))
                .ForMember(dest => dest.AcademicEvents, opt => opt.MapFrom(src => src.AcademicEvents))
                .ForMember(dest => dest.Holidays, opt => opt.MapFrom(src => src.Holidays));

            CreateMap<CreateAcademicYearDto, AcademicYear>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.TenantId, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.Semesters, opt => opt.Ignore())
                .ForMember(dest => dest.AcademicEvents, opt => opt.Ignore())
                .ForMember(dest => dest.Holidays, opt => opt.Ignore());

            CreateMap<UpdateAcademicYearDto, AcademicYear>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.TenantId, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.Semesters, opt => opt.Ignore())
                .ForMember(dest => dest.AcademicEvents, opt => opt.Ignore())
                .ForMember(dest => dest.Holidays, opt => opt.Ignore())
                .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));

            CreateMap<Semester, SemesterDto>()
                .ForMember(dest => dest.AcademicYearName, opt => opt.MapFrom(src => src.AcademicYear != null ? src.AcademicYear.Name : string.Empty))
                .ForMember(dest => dest.AcademicEvents, opt => opt.MapFrom(src => src.AcademicEvents));

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
                .ForMember(dest => dest.AcademicEvents, opt => opt.Ignore())
                .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));

            CreateMap<AcademicEvent, AcademicEventDto>()
                .ForMember(dest => dest.AcademicYearName, opt => opt.MapFrom(src => src.AcademicYear != null ? src.AcademicYear.Name : null))
                .ForMember(dest => dest.SemesterName, opt => opt.MapFrom(src => src.Semester != null ? src.Semester.Name : null));

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
                .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));

            CreateMap<Holiday, HolidayDto>()
                .ForMember(dest => dest.AcademicYearName, opt => opt.MapFrom(src => src.AcademicYear != null ? src.AcademicYear.Name : null));

            CreateMap<CreateHolidayDto, Holiday>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.TenantId, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.AcademicYear, opt => opt.Ignore());

            CreateMap<UpdateHolidayDto, Holiday>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.TenantId, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.AcademicYear, opt => opt.Ignore())
                .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));
        }
    }
}
