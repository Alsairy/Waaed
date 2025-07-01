namespace Waaed.Polls.Api.DTOs;

public class PollDto
{
    public Guid Id { get; set; }
    public string Question { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string TargetAudience { get; set; } = "all";
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool ShowResultsAfterVoting { get; set; }
    public bool ShowResultsAfterClose { get; set; }
    public bool AllowMultipleVotes { get; set; }
    public bool IsAnonymous { get; set; }
    public bool IsActive { get; set; }
    public Guid CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    
    public List<PollOptionDto> Options { get; set; } = new();
    public List<PollVoteDto> Votes { get; set; } = new();
    public int TotalVotes { get; set; }
}

public class PollOptionDto
{
    public Guid Id { get; set; }
    public string Text { get; set; } = string.Empty;
    public int Order { get; set; }
    public Guid PollId { get; set; }
    public int VoteCount { get; set; }
    public double VotePercentage { get; set; }
}

public class PollVoteDto
{
    public Guid Id { get; set; }
    public Guid PollId { get; set; }
    public Guid PollOptionId { get; set; }
    public Guid UserId { get; set; }
    public string? UserName { get; set; }
    public DateTime VotedAt { get; set; }
}

public class CreatePollDto
{
    public string Question { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string TargetAudience { get; set; } = "all";
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool ShowResultsAfterVoting { get; set; }
    public bool ShowResultsAfterClose { get; set; } = true;
    public bool AllowMultipleVotes { get; set; }
    public bool IsAnonymous { get; set; } = true;
    
    public List<CreatePollOptionDto> Options { get; set; } = new();
}

public class CreatePollOptionDto
{
    public string Text { get; set; } = string.Empty;
    public int Order { get; set; }
}

public class VotePollDto
{
    public Guid PollOptionId { get; set; }
}
