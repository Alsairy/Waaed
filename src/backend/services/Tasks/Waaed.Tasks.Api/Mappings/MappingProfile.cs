using AutoMapper;
using Waaed.Tasks.Api.Entities;
using Waaed.Tasks.Api.DTOs;

namespace Waaed.Tasks.Api.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<Entities.Task, TaskDto>();
        CreateMap<CreateTaskDto, Entities.Task>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => Guid.NewGuid()));

        CreateMap<TaskComment, TaskCommentDto>();
        CreateMap<CreateTaskCommentDto, TaskComment>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => Guid.NewGuid()));

        CreateMap<TaskAttachment, TaskAttachmentDto>();
    }
}
