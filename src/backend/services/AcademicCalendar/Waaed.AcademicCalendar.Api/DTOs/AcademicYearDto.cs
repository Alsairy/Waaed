using System.ComponentModel.DataAnnotations;

namespace Waaed.AcademicCalendar.Api.DTOs;

public class AcademicYearDto
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
    
    public string TenantId { get; set; } = string.Empty;
}

public class CreateAcademicYearDto
{
    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;
    
    [Required]
    public DateTime StartDate { get; set; }
    
    [Required]
    public DateTime EndDate { get; set; }
    
    [StringLength(500)]
    public string? Description { get; set; }
}

public class UpdateAcademicYearDto
{
    [StringLength(100)]
    public string? Name { get; set; }
    
    public DateTime? StartDate { get; set; }
    
    public DateTime? EndDate { get; set; }
    
    public bool? IsActive { get; set; }
    
    [StringLength(500)]
    public string? Description { get; set; }
}
