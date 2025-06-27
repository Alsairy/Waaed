namespace AttendancePlatform.Tasks.Api.DTOs;

public class TaskAttachmentDto
{
    public int Id { get; set; }
    public int TaskId { get; set; }
    public int UploadedById { get; set; }
    public string FileName { get; set; }
    public string FilePath { get; set; }
    public string FileType { get; set; }
    public long FileSize { get; set; }
    public DateTime UploadedAt { get; set; }
    public string Description { get; set; }
    public bool IsDeleted { get; set; }
    public string UploadedByName { get; set; }
    public string UploadedByRole { get; set; }
}

public class CreateTaskAttachmentDto
{
    public int TaskId { get; set; }
    public string FileName { get; set; }
    public string FilePath { get; set; }
    public string FileType { get; set; }
    public long FileSize { get; set; }
    public string Description { get; set; }
}

public class UpdateTaskAttachmentDto
{
    public string Description { get; set; }
}
