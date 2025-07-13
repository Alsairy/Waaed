using System.ComponentModel.DataAnnotations;

namespace Waaed.AcademicCalendar.Api.DTOs;

public class HolidayDto
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
    
    public string TenantId { get; set; } = string.Empty;
}

public class CreateHolidayDto
{
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
}

public class UpdateHolidayDto
{
    [StringLength(200)]
    public string? Name { get; set; }
    
    [StringLength(1000)]
    public string? Description { get; set; }
    
    public DateTime? Date { get; set; }
    
    public DateTime? EndDate { get; set; }
    
    public bool? IsRecurring { get; set; }
    
    [StringLength(50)]
    public string? HolidayType { get; set; }
    
    [StringLength(100)]
    public string? Country { get; set; }
    
    [StringLength(100)]
    public string? Region { get; set; }
}
