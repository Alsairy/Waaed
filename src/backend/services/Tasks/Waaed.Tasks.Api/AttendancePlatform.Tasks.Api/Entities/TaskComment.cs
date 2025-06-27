using System.ComponentModel.DataAnnotations;

namespace AttendancePlatform.Tasks.Api.Entities;

public class TaskComment
{
    public int Id { get; set; }
    
    public int TaskId { get; set; }
    
    public int CommenterId { get; set; }
    
    [Required]
    [MaxLength(1000)]
    public string Content { get; set; }
    
    public DateTime CreatedAt { get; set; }
    
    public DateTime? UpdatedAt { get; set; }
    
    public bool IsDeleted { get; set; } = false;
    
    [MaxLength(100)]
    public string CommenterName { get; set; }
    
    [MaxLength(100)]
    public string CommenterRole { get; set; }
    
    [MaxLength(20)]
    public string CommentType { get; set; } = "General"; // General, StatusUpdate, Question, Solution
    
    public bool IsInternal { get; set; } = false; // Internal comments visible only to assigners
    
    public Task Task { get; set; }
}
