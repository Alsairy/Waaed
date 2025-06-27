using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AttendancePlatform.Finance.Api.Entities;

public class FinancialReport
{
    [Key]
    public int Id { get; set; }
    
    [Required]
    [MaxLength(100)]
    public string ReportName { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(50)]
    public string ReportType { get; set; } = string.Empty; // Income Statement, Balance Sheet, Cash Flow, Fee Collection, Expense Report
    
    [MaxLength(500)]
    public string? Description { get; set; }
    
    [Required]
    public DateTime StartDate { get; set; }
    
    [Required]
    public DateTime EndDate { get; set; }
    
    [Required]
    public DateTime GeneratedDate { get; set; } = DateTime.UtcNow;
    
    [Required]
    [MaxLength(100)]
    public string GeneratedBy { get; set; } = string.Empty;
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal? TotalIncome { get; set; }
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal? TotalExpenses { get; set; }
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal? NetProfit { get; set; }
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal? FeeCollected { get; set; }
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal? FeePending { get; set; }
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal? SalaryPaid { get; set; }
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal? OperationalExpenses { get; set; }
    
    [MaxLength(500)]
    public string? FilePath { get; set; }
    
    [Required]
    [MaxLength(20)]
    public string Status { get; set; } = "Generated"; // Generated, Reviewed, Approved, Archived
    
    [MaxLength(100)]
    public string? ReviewedBy { get; set; }
    
    public DateTime? ReviewDate { get; set; }
    
    [MaxLength(500)]
    public string? Comments { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
