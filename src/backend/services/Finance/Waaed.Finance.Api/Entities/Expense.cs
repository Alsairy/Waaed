using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AttendancePlatform.Finance.Api.Entities;

public class Expense
{
    [Key]
    public int Id { get; set; }
    
    [Required]
    [MaxLength(100)]
    public string Title { get; set; } = string.Empty;
    
    [MaxLength(500)]
    public string? Description { get; set; }
    
    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal Amount { get; set; }
    
    [Required]
    [MaxLength(50)]
    public string Category { get; set; } = string.Empty; // Salary, Utilities, Maintenance, Supplies, etc.
    
    [MaxLength(50)]
    public string? SubCategory { get; set; }
    
    [Required]
    public DateTime ExpenseDate { get; set; }
    
    [MaxLength(100)]
    public string? Vendor { get; set; }
    
    [MaxLength(50)]
    public string? InvoiceNumber { get; set; }
    
    [MaxLength(20)]
    public string PaymentMethod { get; set; } = "Cash"; // Cash, Cheque, Bank Transfer, Card
    
    [MaxLength(100)]
    public string? PaymentReference { get; set; }
    
    [Required]
    [MaxLength(20)]
    public string Status { get; set; } = "Pending"; // Pending, Approved, Paid, Rejected
    
    [MaxLength(100)]
    public string? ApprovedBy { get; set; }
    
    public DateTime? ApprovalDate { get; set; }
    
    [MaxLength(100)]
    public string? PaidBy { get; set; }
    
    public DateTime? PaymentDate { get; set; }
    
    [MaxLength(500)]
    public string? Remarks { get; set; }
    
    [MaxLength(50)]
    public string? Department { get; set; }
    
    public int? BudgetId { get; set; }
    
    [Required]
    public bool IsRecurring { get; set; } = false;
    
    [MaxLength(20)]
    public string? RecurrencePattern { get; set; } // Monthly, Quarterly, Annually
    
    public DateTime? NextDueDate { get; set; }
    
    [MaxLength(500)]
    public string? AttachmentPath { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    [ForeignKey("BudgetId")]
    public virtual Budget? Budget { get; set; }
}
