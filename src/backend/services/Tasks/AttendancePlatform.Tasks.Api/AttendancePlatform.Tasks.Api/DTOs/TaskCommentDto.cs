namespace AttendancePlatform.Tasks.Api.DTOs;

public class TaskCommentDto
{
    public int Id { get; set; }
    public int TaskId { get; set; }
    public int CommenterId { get; set; }
    public string Content { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public bool IsDeleted { get; set; }
    public string CommenterName { get; set; }
    public string CommenterRole { get; set; }
    public string CommentType { get; set; }
    public bool IsInternal { get; set; }
}

public class CreateTaskCommentDto
{
    public int TaskId { get; set; }
    public string Content { get; set; }
    public string CommentType { get; set; } = "General";
    public bool IsInternal { get; set; } = false;
}

public class UpdateTaskCommentDto
{
    public string Content { get; set; }
    public string CommentType { get; set; }
    public bool IsInternal { get; set; }
}
