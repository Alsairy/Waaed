using System.ComponentModel.DataAnnotations;

namespace Waaed.AcademicCalendar.Api.Entities;

public class Semester
{
    public int Id { get; set; }
    
    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;
    
    [Required]
    public DateTime StartDate { get; set; }
    
    [Required]
    public DateTime EndDate { get; set; }
    
    public bool IsActive { get; set; }
    
    [StringLength(500)]
    public string? Description { get; set; }
    
    public int AcademicYearId { get; set; }
    public virtual AcademicYear AcademicYear { get; set; } = null!;
    
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    
    [Required]
    [StringLength(50)]
    public string TenantId { get; set; } = string.Empty;
    
    public virtual ICollection<AcademicEvent> AcademicEvents { get; set; } = new List<AcademicEvent>();
}
