using System.ComponentModel.DataAnnotations;

namespace AttendancePlatform.Tasks.Api.Entities;

public class TaskAttachment
{
    public int Id { get; set; }
    
    public int TaskId { get; set; }
    
    public int UploadedById { get; set; }
    
    [Required]
    [MaxLength(255)]
    public string FileName { get; set; }
    
    [Required]
    [MaxLength(500)]
    public string FilePath { get; set; }
    
    [MaxLength(100)]
    public string FileType { get; set; }
    
    public long FileSize { get; set; }
    
    public DateTime UploadedAt { get; set; }
    
    [MaxLength(500)]
    public string Description { get; set; }
    
    public bool IsDeleted { get; set; } = false;
    
    [MaxLength(100)]
    public string UploadedByName { get; set; }
    
    [MaxLength(100)]
    public string UploadedByRole { get; set; }
    
    public Task Task { get; set; }
}
