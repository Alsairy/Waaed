using AutoMapper;
using Waaed.Blogs.Api.Entities;
using Waaed.Blogs.Api.DTOs;

namespace Waaed.Blogs.Api.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<BlogPost, BlogPostDto>();
        CreateMap<CreateBlogPostDto, BlogPost>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => Guid.NewGuid()));

        CreateMap<BlogCategory, BlogCategoryDto>();
        CreateMap<CreateBlogCategoryDto, BlogCategory>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => Guid.NewGuid()));

        CreateMap<BlogComment, BlogCommentDto>();
        CreateMap<CreateBlogCommentDto, BlogComment>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => Guid.NewGuid()));
    }
}
