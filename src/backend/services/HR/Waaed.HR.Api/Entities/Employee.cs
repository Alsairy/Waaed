using System.ComponentModel.DataAnnotations;

namespace Waaed.HR.Api.Entities;

public class Employee
{
    public int Id { get; set; }
    
    [Required]
    [MaxLength(50)]
    public string EmployeeId { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(100)]
    public string FirstName { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(100)]
    public string LastName { get; set; } = string.Empty;
    
    public string FullName => $"{FirstName} {LastName}";
    
    [Required]
    [EmailAddress]
    [MaxLength(200)]
    public string Email { get; set; } = string.Empty;
    
    [MaxLength(15)]
    public string? Phone { get; set; }
    
    [MaxLength(500)]
    public string? Address { get; set; }
    
    public DateTime DateOfBirth { get; set; }
    
    [Required]
    [MaxLength(10)]
    public string Gender { get; set; } = string.Empty;
    
    [MaxLength(20)]
    public string? MaritalStatus { get; set; }
    
    [MaxLength(50)]
    public string? Nationality { get; set; }
    
    [MaxLength(50)]
    public string? NationalId { get; set; }
    
    [MaxLength(50)]
    public string? PassportNumber { get; set; }
    
    public DateTime? PassportExpiry { get; set; }
    
    public DateTime HireDate { get; set; }
    
    public DateTime? TerminationDate { get; set; }
    
    [Required]
    [MaxLength(20)]
    public string EmploymentStatus { get; set; } = "Active";
    
    [Required]
    [MaxLength(20)]
    public string EmploymentType { get; set; } = "Full-Time";
    
    public int DepartmentId { get; set; }
    public Department Department { get; set; } = null!;
    
    public int PositionId { get; set; }
    public Position Position { get; set; } = null!;
    
    public int? ManagerId { get; set; }
    public Employee? Manager { get; set; }
    
    public decimal BasicSalary { get; set; }
    
    [MaxLength(20)]
    public string? PayrollFrequency { get; set; }
    
    [MaxLength(50)]
    public string? BankAccount { get; set; }
    
    [MaxLength(100)]
    public string? BankName { get; set; }
    
    [MaxLength(20)]
    public string? TaxId { get; set; }
    
    [MaxLength(20)]
    public string? SocialSecurityNumber { get; set; }
    
    [MaxLength(500)]
    public string? EmergencyContactName { get; set; }
    
    [MaxLength(15)]
    public string? EmergencyContactPhone { get; set; }
    
    [MaxLength(100)]
    public string? EmergencyContactRelation { get; set; }
    
    [MaxLength(500)]
    public string? ProfilePicturePath { get; set; }
    
    [MaxLength(1000)]
    public string? Notes { get; set; }
    
    public bool IsActive { get; set; } = true;
    
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    
    public ICollection<Employee> Subordinates { get; set; } = new List<Employee>();
    public ICollection<LeaveRequest> LeaveRequests { get; set; } = new List<LeaveRequest>();
    public ICollection<PerformanceReview> PerformanceReviews { get; set; } = new List<PerformanceReview>();
    public ICollection<PerformanceReview> ConductedReviews { get; set; } = new List<PerformanceReview>();
}
