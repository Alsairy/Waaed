using AutoMapper;
using Waaed.Polls.Api.Entities;
using Waaed.Polls.Api.DTOs;

namespace Waaed.Polls.Api.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<Poll, PollDto>()
            .ForMember(dest => dest.TotalVotes, opt => opt.MapFrom(src => src.Votes.Count));
        
        CreateMap<CreatePollDto, Poll>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => Guid.NewGuid()))
            .ForMember(dest => dest.Options, opt => opt.MapFrom(src => src.Options));

        CreateMap<PollOption, PollOptionDto>()
            .ForMember(dest => dest.VoteCount, opt => opt.MapFrom(src => src.Votes.Count))
            .ForMember(dest => dest.VotePercentage, opt => opt.Ignore());

        CreateMap<CreatePollOptionDto, PollOption>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => Guid.NewGuid()));

        CreateMap<PollVote, PollVoteDto>();
    }
}
