using System.ComponentModel.DataAnnotations;

namespace AttendancePlatform.Polls.Api.Entities;

public class PollVote
{
    public int Id { get; set; }
    
    public int PollId { get; set; }
    
    public int PollOptionId { get; set; }
    
    public int? UserId { get; set; } // Nullable for anonymous polls
    
    [MaxLength(100)]
    public string UserRole { get; set; } // Student, Teacher, Parent, Staff
    
    public DateTime VotedAt { get; set; }
    
    [MaxLength(45)]
    public string IpAddress { get; set; }
    
    [MaxLength(500)]
    public string UserAgent { get; set; }
    
    public bool IsAnonymous { get; set; }
    
    [MaxLength(100)]
    public string SessionId { get; set; }
    
    public Poll Poll { get; set; }
    public PollOption PollOption { get; set; }
}
