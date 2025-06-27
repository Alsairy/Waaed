namespace AttendancePlatform.Tasks.Api.DTOs;

public class TaskDto
{
    public int Id { get; set; }
    public string Title { get; set; }
    public string Description { get; set; }
    public int AssignedById { get; set; }
    public int AssignedToId { get; set; }
    public string Status { get; set; }
    public string Priority { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public DateTime? DueDate { get; set; }
    public DateTime? CompletedAt { get; set; }
    public string Category { get; set; }
    public string Tags { get; set; }
    public int? EstimatedHours { get; set; }
    public int? ActualHours { get; set; }
    public int ProgressPercentage { get; set; }
    public string Notes { get; set; }
    public bool IsRecurring { get; set; }
    public string RecurrencePattern { get; set; }
    public int? ParentTaskId { get; set; }
    public string AssignedByName { get; set; }
    public string AssignedToName { get; set; }
    public string AssignedByRole { get; set; }
    public string AssignedToRole { get; set; }
    public List<TaskDto> SubTasks { get; set; } = new List<TaskDto>();
    public List<TaskCommentDto> Comments { get; set; } = new List<TaskCommentDto>();
    public List<TaskAttachmentDto> Attachments { get; set; } = new List<TaskAttachmentDto>();
}

public class CreateTaskDto
{
    public string Title { get; set; }
    public string Description { get; set; }
    public int AssignedToId { get; set; }
    public string Priority { get; set; } = "Medium";
    public DateTime? DueDate { get; set; }
    public string Category { get; set; } = "General";
    public string Tags { get; set; }
    public int? EstimatedHours { get; set; }
    public string Notes { get; set; }
    public bool IsRecurring { get; set; } = false;
    public string RecurrencePattern { get; set; }
    public int? ParentTaskId { get; set; }
}

public class UpdateTaskDto
{
    public string Title { get; set; }
    public string Description { get; set; }
    public int? AssignedToId { get; set; }
    public string Status { get; set; }
    public string Priority { get; set; }
    public DateTime? DueDate { get; set; }
    public string Category { get; set; }
    public string Tags { get; set; }
    public int? EstimatedHours { get; set; }
    public int? ActualHours { get; set; }
    public int? ProgressPercentage { get; set; }
    public string Notes { get; set; }
    public bool? IsRecurring { get; set; }
    public string RecurrencePattern { get; set; }
}
