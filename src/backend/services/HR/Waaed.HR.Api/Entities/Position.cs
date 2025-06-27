using System.ComponentModel.DataAnnotations;

namespace AttendancePlatform.HR.Api.Entities;

public class Position
{
    public int Id { get; set; }
    
    [Required]
    [MaxLength(100)]
    public string Title { get; set; } = string.Empty;
    
    [MaxLength(500)]
    public string? Description { get; set; }
    
    [Required]
    [MaxLength(20)]
    public string Code { get; set; } = string.Empty;
    
    public int DepartmentId { get; set; }
    public Department Department { get; set; } = null!;
    
    [Required]
    [MaxLength(20)]
    public string Level { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(20)]
    public string Grade { get; set; } = string.Empty;
    
    public decimal MinSalary { get; set; }
    public decimal MaxSalary { get; set; }
    
    [MaxLength(1000)]
    public string? Responsibilities { get; set; }
    
    [MaxLength(1000)]
    public string? Requirements { get; set; }
    
    [MaxLength(1000)]
    public string? Skills { get; set; }
    
    [MaxLength(500)]
    public string? Qualifications { get; set; }
    
    public int? ExperienceYears { get; set; }
    
    [Required]
    [MaxLength(20)]
    public string EmploymentType { get; set; } = "Full-Time";
    
    [MaxLength(500)]
    public string? ReportsTo { get; set; }
    
    public bool IsActive { get; set; } = true;
    
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    
    public ICollection<Employee> Employees { get; set; } = new List<Employee>();
    public ICollection<Recruitment> Recruitments { get; set; } = new List<Recruitment>();
}
