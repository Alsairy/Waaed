using AutoMapper;
using AttendancePlatform.Blogs.Api.Entities;
using AttendancePlatform.Blogs.Api.DTOs;

namespace AttendancePlatform.Blogs.Api.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<BlogPost, BlogPostDto>().ReverseMap();
        CreateMap<CreateBlogPostDto, BlogPost>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.AuthorId, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => "Draft"))
            .ForMember(dest => dest.ViewCount, opt => opt.MapFrom(src => 0))
            .ForMember(dest => dest.LikeCount, opt => opt.MapFrom(src => 0));
        CreateMap<UpdateBlogPostDto, BlogPost>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.AuthorId, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.Status, opt => opt.Ignore())
            .ForMember(dest => dest.ViewCount, opt => opt.Ignore())
            .ForMember(dest => dest.LikeCount, opt => opt.Ignore())
            .ForMember(dest => dest.PublishedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => DateTime.UtcNow));

        CreateMap<BlogComment, BlogCommentDto>().ReverseMap();
        CreateMap<CreateBlogCommentDto, BlogComment>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CommenterId, opt => opt.Ignore())
            .ForMember(dest => dest.CommenterName, opt => opt.Ignore())
            .ForMember(dest => dest.CommenterRole, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
            .ForMember(dest => dest.IsApproved, opt => opt.MapFrom(src => true))
            .ForMember(dest => dest.IsDeleted, opt => opt.MapFrom(src => false))
            .ForMember(dest => dest.LikeCount, opt => opt.MapFrom(src => 0));
        CreateMap<UpdateBlogCommentDto, BlogComment>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.PostId, opt => opt.Ignore())
            .ForMember(dest => dest.CommenterId, opt => opt.Ignore())
            .ForMember(dest => dest.CommenterName, opt => opt.Ignore())
            .ForMember(dest => dest.CommenterRole, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.IsApproved, opt => opt.Ignore())
            .ForMember(dest => dest.IsDeleted, opt => opt.Ignore())
            .ForMember(dest => dest.ParentCommentId, opt => opt.Ignore())
            .ForMember(dest => dest.LikeCount, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => DateTime.UtcNow));

        CreateMap<BlogCategory, BlogCategoryDto>().ReverseMap();
        CreateMap<CreateBlogCategoryDto, BlogCategory>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedBy, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
            .ForMember(dest => dest.PostCount, opt => opt.MapFrom(src => 0))
            .ForMember(dest => dest.IsActive, opt => opt.MapFrom(src => true));
        CreateMap<UpdateBlogCategoryDto, BlogCategory>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedBy, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.PostCount, opt => opt.Ignore());
    }
}
