using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Waaed.Finance.Api.Entities;

public class PayrollEntry
{
    [Key]
    public int Id { get; set; }
    
    [Required]
    [MaxLength(50)]
    public string EmployeeId { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(100)]
    public string EmployeeName { get; set; } = string.Empty;
    
    [MaxLength(50)]
    public string? Department { get; set; }
    
    [MaxLength(50)]
    public string? Designation { get; set; }
    
    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal BasicSalary { get; set; }
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal? HouseRentAllowance { get; set; }
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal? MedicalAllowance { get; set; }
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal? TransportAllowance { get; set; }
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal? OtherAllowances { get; set; }
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal GrossSalary { get; set; }
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal? ProvidentFund { get; set; }
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal? IncomeTax { get; set; }
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal? ProfessionalTax { get; set; }
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal? LoanDeduction { get; set; }
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal? OtherDeductions { get; set; }
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal TotalDeductions { get; set; }
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal NetSalary { get; set; }
    
    [Required]
    public DateTime PayrollMonth { get; set; }
    
    [Required]
    public int WorkingDays { get; set; }
    
    [Required]
    public int PresentDays { get; set; }
    
    public int AbsentDays => WorkingDays - PresentDays;
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal? OvertimeHours { get; set; }
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal? OvertimeAmount { get; set; }
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal? Bonus { get; set; }
    
    [Required]
    [MaxLength(20)]
    public string Status { get; set; } = "Draft"; // Draft, Approved, Paid
    
    public DateTime? ApprovalDate { get; set; }
    
    [MaxLength(100)]
    public string? ApprovedBy { get; set; }
    
    public DateTime? PaymentDate { get; set; }
    
    [MaxLength(50)]
    public string? PaymentMethod { get; set; }
    
    [MaxLength(100)]
    public string? PaymentReference { get; set; }
    
    [MaxLength(500)]
    public string? Remarks { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
