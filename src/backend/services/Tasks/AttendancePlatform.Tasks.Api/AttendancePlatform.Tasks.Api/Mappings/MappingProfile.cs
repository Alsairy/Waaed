using AutoMapper;
using AttendancePlatform.Tasks.Api.Entities;
using AttendancePlatform.Tasks.Api.DTOs;

namespace AttendancePlatform.Tasks.Api.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<Entities.Task, TaskDto>().ReverseMap();
        CreateMap<CreateTaskDto, Entities.Task>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.AssignedById, opt => opt.Ignore())
            .ForMember(dest => dest.AssignedByName, opt => opt.Ignore())
            .ForMember(dest => dest.AssignedByRole, opt => opt.Ignore())
            .ForMember(dest => dest.AssignedToName, opt => opt.Ignore())
            .ForMember(dest => dest.AssignedToRole, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => "Pending"))
            .ForMember(dest => dest.ProgressPercentage, opt => opt.MapFrom(src => 0));
        CreateMap<UpdateTaskDto, Entities.Task>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.AssignedById, opt => opt.Ignore())
            .ForMember(dest => dest.AssignedByName, opt => opt.Ignore())
            .ForMember(dest => dest.AssignedByRole, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.CompletedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
            .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));

        CreateMap<TaskComment, TaskCommentDto>().ReverseMap();
        CreateMap<CreateTaskCommentDto, TaskComment>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CommenterId, opt => opt.Ignore())
            .ForMember(dest => dest.CommenterName, opt => opt.Ignore())
            .ForMember(dest => dest.CommenterRole, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
            .ForMember(dest => dest.IsDeleted, opt => opt.MapFrom(src => false));
        CreateMap<UpdateTaskCommentDto, TaskComment>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.TaskId, opt => opt.Ignore())
            .ForMember(dest => dest.CommenterId, opt => opt.Ignore())
            .ForMember(dest => dest.CommenterName, opt => opt.Ignore())
            .ForMember(dest => dest.CommenterRole, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.IsDeleted, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => DateTime.UtcNow));

        CreateMap<TaskAttachment, TaskAttachmentDto>().ReverseMap();
        CreateMap<CreateTaskAttachmentDto, TaskAttachment>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.UploadedById, opt => opt.Ignore())
            .ForMember(dest => dest.UploadedByName, opt => opt.Ignore())
            .ForMember(dest => dest.UploadedByRole, opt => opt.Ignore())
            .ForMember(dest => dest.UploadedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
            .ForMember(dest => dest.IsDeleted, opt => opt.MapFrom(src => false));
        CreateMap<UpdateTaskAttachmentDto, TaskAttachment>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.TaskId, opt => opt.Ignore())
            .ForMember(dest => dest.UploadedById, opt => opt.Ignore())
            .ForMember(dest => dest.UploadedByName, opt => opt.Ignore())
            .ForMember(dest => dest.UploadedByRole, opt => opt.Ignore())
            .ForMember(dest => dest.FileName, opt => opt.Ignore())
            .ForMember(dest => dest.FilePath, opt => opt.Ignore())
            .ForMember(dest => dest.FileType, opt => opt.Ignore())
            .ForMember(dest => dest.FileSize, opt => opt.Ignore())
            .ForMember(dest => dest.UploadedAt, opt => opt.Ignore())
            .ForMember(dest => dest.IsDeleted, opt => opt.Ignore());
    }
}
