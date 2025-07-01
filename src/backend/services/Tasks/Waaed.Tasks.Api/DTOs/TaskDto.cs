namespace Waaed.Tasks.Api.DTOs;

public class TaskDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = "Not Started";
    public string Priority { get; set; } = "Normal";
    public DateTime DueDate { get; set; }
    public Guid CreatedBy { get; set; }
    public Guid AssignedTo { get; set; }
    public DateTime? CompletedAt { get; set; }
    public string Category { get; set; } = string.Empty;
    public int Progress { get; set; } = 0;
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    
    public List<TaskCommentDto> Comments { get; set; } = new();
    public List<TaskAttachmentDto> Attachments { get; set; } = new();
}

public class TaskCommentDto
{
    public Guid Id { get; set; }
    public string Content { get; set; } = string.Empty;
    public Guid TaskId { get; set; }
    public Guid AuthorId { get; set; }
    public Guid? ParentCommentId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    
    public List<TaskCommentDto> Replies { get; set; } = new();
}

public class TaskAttachmentDto
{
    public Guid Id { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
    public string FileType { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public Guid TaskId { get; set; }
    public Guid UploadedBy { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateTaskDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Priority { get; set; } = "Normal";
    public DateTime DueDate { get; set; }
    public Guid AssignedTo { get; set; }
    public string Category { get; set; } = string.Empty;
    public string? Notes { get; set; }
}

public class CreateTaskCommentDto
{
    public string Content { get; set; } = string.Empty;
    public Guid TaskId { get; set; }
    public Guid? ParentCommentId { get; set; }
}
