using System.ComponentModel.DataAnnotations;

namespace AttendancePlatform.Polls.Api.Entities;

public class PollOption
{
    public int Id { get; set; }
    
    public int PollId { get; set; }
    
    [Required]
    [MaxLength(300)]
    public string OptionText { get; set; }
    
    public int DisplayOrder { get; set; }
    
    public int VoteCount { get; set; } = 0;
    
    public DateTime CreatedAt { get; set; }
    
    public bool IsActive { get; set; } = true;
    
    [MaxLength(500)]
    public string Description { get; set; }
    
    public Poll Poll { get; set; }
    public ICollection<PollVote> Votes { get; set; } = new List<PollVote>();
}
