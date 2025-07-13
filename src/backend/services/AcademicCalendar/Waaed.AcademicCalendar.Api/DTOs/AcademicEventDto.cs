using System.ComponentModel.DataAnnotations;

namespace Waaed.AcademicCalendar.Api.DTOs;

public class AcademicEventDto
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
    public int? SemesterId { get; set; }
    public string TenantId { get; set; } = string.Empty;
    public string? CreatedBy { get; set; }
}

public class CreateAcademicEventDto
{
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
    public int? SemesterId { get; set; }
}

public class UpdateAcademicEventDto
{
    [StringLength(200)]
    public string? Title { get; set; }
    
    [StringLength(1000)]
    public string? Description { get; set; }
    
    public DateTime? StartDate { get; set; }
    
    public DateTime? EndDate { get; set; }
    
    public bool? IsAllDay { get; set; }
    
    [StringLength(50)]
    public string? EventType { get; set; }
    
    [StringLength(200)]
    public string? Location { get; set; }
    
    public bool? IsRecurring { get; set; }
    
    [StringLength(100)]
    public string? RecurrencePattern { get; set; }
}
