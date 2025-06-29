using AutoMapper;
using Waaed.SIS.Api.Entities;
using Waaed.SIS.Api.DTOs;

namespace Waaed.SIS.Api.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<Student, StudentDto>().ReverseMap();
    }
}
