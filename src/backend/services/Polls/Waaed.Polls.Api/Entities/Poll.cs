using Waaed.Shared.Domain.Entities;

namespace Waaed.Polls.Api.Entities;

public class Poll : BaseEntity
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
    public bool IsActive { get; set; } = true;
    public Guid CreatedBy { get; set; }
    
    public virtual ICollection<PollOption> Options { get; set; } = new List<PollOption>();
    public virtual ICollection<PollVote> Votes { get; set; } = new List<PollVote>();
}

public class PollOption : BaseEntity
{
    public string Text { get; set; } = string.Empty;
    public int Order { get; set; }
    public Guid PollId { get; set; }
    
    public virtual Poll Poll { get; set; } = null!;
    public virtual ICollection<PollVote> Votes { get; set; } = new List<PollVote>();
}

public class PollVote : BaseEntity
{
    public Guid PollId { get; set; }
    public Guid PollOptionId { get; set; }
    public Guid UserId { get; set; }
    public string? UserName { get; set; }
    public DateTime VotedAt { get; set; } = DateTime.UtcNow;
    
    public virtual Poll Poll { get; set; } = null!;
    public virtual PollOption PollOption { get; set; } = null!;
}
