using Waaed.Shared.Domain.Entities;

namespace Waaed.Tasks.Api.Entities;

public class Task : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = "Not Started"; // Not Started, In Progress, Completed, Cancelled
    public string Priority { get; set; } = "Normal"; // Low, Normal, High, Critical
    public DateTime DueDate { get; set; }
    public Guid CreatedBy { get; set; }
    public Guid AssignedTo { get; set; }
    public DateTime? CompletedAt { get; set; }
    public string Category { get; set; } = string.Empty;
    public int Progress { get; set; } = 0; // 0-100
    public string? Notes { get; set; }
    
    public virtual ICollection<TaskComment> Comments { get; set; } = new List<TaskComment>();
    public virtual ICollection<TaskAttachment> Attachments { get; set; } = new List<TaskAttachment>();
}

public class TaskComment : BaseEntity
{
    public string Content { get; set; } = string.Empty;
    public Guid TaskId { get; set; }
    public Guid AuthorId { get; set; }
    public Guid? ParentCommentId { get; set; }
    
    public virtual Task Task { get; set; } = null!;
    public virtual TaskComment? ParentComment { get; set; }
    public virtual ICollection<TaskComment> Replies { get; set; } = new List<TaskComment>();
}

public class TaskAttachment : BaseEntity
{
    public string FileName { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
    public string FileType { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public Guid TaskId { get; set; }
    public Guid UploadedBy { get; set; }
    
    public virtual Task Task { get; set; } = null!;
}
