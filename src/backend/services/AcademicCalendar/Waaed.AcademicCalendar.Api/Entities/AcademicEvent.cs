using System.ComponentModel.DataAnnotations;

namespace Waaed.AcademicCalendar.Api.Entities;

public class AcademicEvent
{
    public int Id { get; set; }
    
    [Required]
    [StringLength(200)]
    public string Title { get; set; } = string.Empty;
    
    [StringLength(1000)]
    public string? Description { get; set; }
    
    [Required]
    public DateTime StartDate { get; set; }
    
    public DateTime? EndDate { get; set; }
    
    public bool IsAllDay { get; set; }
    
    [Required]
    [StringLength(50)]
    public string EventType { get; set; } = string.Empty;
    
    [StringLength(200)]
    public string? Location { get; set; }
    
    public bool IsRecurring { get; set; }
    
    [StringLength(100)]
    public string? RecurrencePattern { get; set; }
    
    public int? AcademicYearId { get; set; }
    public virtual AcademicYear? AcademicYear { get; set; }
    
    public int? SemesterId { get; set; }
    public virtual Semester? Semester { get; set; }
    
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    
    [Required]
    [StringLength(50)]
    public string TenantId { get; set; } = string.Empty;
    
    [StringLength(50)]
    public string? CreatedBy { get; set; }
}
