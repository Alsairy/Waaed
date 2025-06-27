using System.ComponentModel.DataAnnotations;

namespace AttendancePlatform.Tasks.Api.Entities;

public class Task
{
    public int Id { get; set; }
    
    [Required]
    [MaxLength(200)]
    public string Title { get; set; }
    
    [Required]
    public string Description { get; set; }
    
    public int AssignedById { get; set; }
    
    public int AssignedToId { get; set; }
    
    [Required]
    [MaxLength(20)]
    public string Status { get; set; } = "Pending"; // Pending, InProgress, Completed, Cancelled
    
    [Required]
    [MaxLength(20)]
    public string Priority { get; set; } = "Medium"; // Low, Medium, High, Critical
    
    public DateTime CreatedAt { get; set; }
    
    public DateTime? UpdatedAt { get; set; }
    
    public DateTime? DueDate { get; set; }
    
    public DateTime? CompletedAt { get; set; }
    
    [MaxLength(20)]
    public string Category { get; set; } = "General"; // General, Academic, Administrative, Maintenance
    
    [MaxLength(500)]
    public string Tags { get; set; }
    
    public int? EstimatedHours { get; set; }
    
    public int? ActualHours { get; set; }
    
    public int ProgressPercentage { get; set; } = 0;
    
    [MaxLength(1000)]
    public string Notes { get; set; }
    
    public bool IsRecurring { get; set; } = false;
    
    [MaxLength(50)]
    public string RecurrencePattern { get; set; } // Daily, Weekly, Monthly, Yearly
    
    public int? ParentTaskId { get; set; }
    
    [MaxLength(100)]
    public string AssignedByName { get; set; }
    
    [MaxLength(100)]
    public string AssignedToName { get; set; }
    
    [MaxLength(100)]
    public string AssignedByRole { get; set; }
    
    [MaxLength(100)]
    public string AssignedToRole { get; set; }
    
    public Task ParentTask { get; set; }
    public ICollection<Task> SubTasks { get; set; } = new List<Task>();
    public ICollection<TaskComment> Comments { get; set; } = new List<TaskComment>();
    public ICollection<TaskAttachment> Attachments { get; set; } = new List<TaskAttachment>();
}
