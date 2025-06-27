using System.ComponentModel.DataAnnotations;

namespace AttendancePlatform.Polls.Api.Entities;

public class Poll
{
    public int Id { get; set; }
    
    [Required]
    [MaxLength(200)]
    public string Title { get; set; }
    
    [MaxLength(1000)]
    public string Description { get; set; }
    
    public int CreatedBy { get; set; }
    
    public DateTime CreatedAt { get; set; }
    
    public DateTime? StartDate { get; set; }
    
    public DateTime? EndDate { get; set; }
    
    [Required]
    public string Status { get; set; } = "Draft"; // Draft, Active, Closed
    
    public bool IsAnonymous { get; set; } = true;
    
    public bool AllowMultipleVotes { get; set; } = false;
    
    public bool ShowResultsAfterVoting { get; set; } = false;
    
    public bool ShowResultsAfterClose { get; set; } = true;
    
    [MaxLength(100)]
    public string TargetAudience { get; set; } = "All"; // All, Students, Teachers, Parents, Staff
    
    public int? TargetBatchId { get; set; }
    
    public int? TargetClassId { get; set; }
    
    public bool RequireAuthentication { get; set; } = true;
    
    public int TotalVotes { get; set; } = 0;
    
    public DateTime? LastModified { get; set; }
    
    public ICollection<PollOption> Options { get; set; } = new List<PollOption>();
    public ICollection<PollVote> Votes { get; set; } = new List<PollVote>();
}
