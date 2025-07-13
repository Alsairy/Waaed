using System.ComponentModel.DataAnnotations;

namespace Waaed.AcademicCalendar.Api.Entities;

public class Holiday
{
    public int Id { get; set; }
    
    [Required]
    [StringLength(200)]
    public string Name { get; set; } = string.Empty;
    
    [StringLength(1000)]
    public string? Description { get; set; }
    
    [Required]
    public DateTime Date { get; set; }
    
    public DateTime? EndDate { get; set; }
    
    public bool IsRecurring { get; set; }
    
    [StringLength(50)]
    public string HolidayType { get; set; } = "National";
    
    [StringLength(100)]
    public string? Country { get; set; }
    
    [StringLength(100)]
    public string? Region { get; set; }
    
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    
    [Required]
    [StringLength(50)]
    public string TenantId { get; set; } = string.Empty;
}
