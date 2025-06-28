using System.ComponentModel.DataAnnotations;

namespace Waaed.HR.Api.Entities;

public class Department
{
    public int Id { get; set; }
    
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;
    
    [MaxLength(500)]
    public string? Description { get; set; }
    
    [Required]
    [MaxLength(20)]
    public string Code { get; set; } = string.Empty;
    
    public int? ParentDepartmentId { get; set; }
    public Department? ParentDepartment { get; set; }
    
    public int? HeadOfDepartmentId { get; set; }
    public Employee? HeadOfDepartment { get; set; }
    
    [MaxLength(500)]
    public string? Location { get; set; }
    
    [MaxLength(15)]
    public string? Phone { get; set; }
    
    [MaxLength(200)]
    public string? Email { get; set; }
    
    public decimal? Budget { get; set; }
    
    [MaxLength(50)]
    public string? CostCenter { get; set; }
    
    public bool IsActive { get; set; } = true;
    
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    
    public ICollection<Department> SubDepartments { get; set; } = new List<Department>();
    public ICollection<Employee> Employees { get; set; } = new List<Employee>();
    public ICollection<Position> Positions { get; set; } = new List<Position>();
}
