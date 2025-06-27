using AutoMapper;
using AttendancePlatform.Polls.Api.Entities;
using AttendancePlatform.Polls.Api.DTOs;

namespace AttendancePlatform.Polls.Api.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<Poll, PollDto>().ReverseMap();
        CreateMap<CreatePollDto, Poll>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => "Draft"))
            .ForMember(dest => dest.TotalVotes, opt => opt.MapFrom(src => 0));
        CreateMap<UpdatePollDto, Poll>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedBy, opt => opt.Ignore())
            .ForMember(dest => dest.Status, opt => opt.Ignore())
            .ForMember(dest => dest.TotalVotes, opt => opt.Ignore())
            .ForMember(dest => dest.LastModified, opt => opt.MapFrom(src => DateTime.UtcNow));

        CreateMap<PollOption, PollOptionDto>().ReverseMap();
        CreateMap<CreatePollOptionDto, PollOption>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.PollId, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
            .ForMember(dest => dest.VoteCount, opt => opt.MapFrom(src => 0))
            .ForMember(dest => dest.IsActive, opt => opt.MapFrom(src => true));
        CreateMap<UpdatePollOptionDto, PollOption>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.PollId, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.VoteCount, opt => opt.Ignore());

        CreateMap<PollVote, PollVoteDto>().ReverseMap();
        CreateMap<CreateVoteDto, PollVote>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.VotedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
            .ForMember(dest => dest.IsAnonymous, opt => opt.Ignore())
            .ForMember(dest => dest.UserId, opt => opt.Ignore())
            .ForMember(dest => dest.IpAddress, opt => opt.Ignore())
            .ForMember(dest => dest.UserAgent, opt => opt.Ignore())
            .ForMember(dest => dest.SessionId, opt => opt.Ignore());
    }
}
