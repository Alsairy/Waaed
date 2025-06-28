using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Waaed.Finance.Api.Entities;

public class FeeCollectionSchedule
{
    [Key]
    public int Id { get; set; }
    
    [Required]
    public int FeeCategoryId { get; set; }
    
    [Required]
    [MaxLength(100)]
    public string CollectionName { get; set; } = string.Empty;
    
    [MaxLength(500)]
    public string? Description { get; set; }
    
    [Required]
    public DateTime StartDate { get; set; }
    
    [Required]
    public DateTime DueDate { get; set; }
    
    public DateTime? EndDate { get; set; }
    
    [Required]
    [MaxLength(20)]
    public string Status { get; set; } = "Scheduled"; // Scheduled, Active, Closed, Cancelled
    
    public bool HasLateFee { get; set; } = false;
    
    [MaxLength(20)]
    public string? LateFeeType { get; set; } // FlatOneTime, FlatRecurring, PercentageOneTime, PercentageRecurring
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal? LateFeeAmount { get; set; }
    
    [Column(TypeName = "decimal(5,2)")]
    public decimal? LateFeePercentage { get; set; }
    
    [MaxLength(20)]
    public string? LateFeeRecurrenceType { get; set; } // Daily, Weekly, Monthly
    
    public int? LateFeeRecurrenceInterval { get; set; } // Every X days/weeks/months
    
    public bool SendNotifications { get; set; } = true;
    
    public bool NotifyOnStart { get; set; } = true;
    
    public bool NotifyBeforeDue { get; set; } = true;
    
    public int? NotifyDaysBefore { get; set; } = 3;
    
    public bool NotifyOnOverdue { get; set; } = true;
    
    [Required]
    public bool IsActive { get; set; } = true;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    [ForeignKey("FeeCategoryId")]
    public virtual FeeCategory FeeCategory { get; set; } = null!;
    
    public virtual ICollection<StudentFeeAssignment> StudentFeeAssignments { get; set; } = new List<StudentFeeAssignment>();
    public virtual ICollection<FeePayment> FeePayments { get; set; } = new List<FeePayment>();
}

public class StudentFeeAssignment
{
    [Key]
    public int Id { get; set; }
    
    [Required]
    public int FeeCollectionScheduleId { get; set; }
    
    [Required]
    public int StudentId { get; set; }
    
    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal BaseAmount { get; set; }
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal DiscountAmount { get; set; } = 0;
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal TaxAmount { get; set; } = 0;
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal LateFeeAmount { get; set; } = 0;
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal TotalAmount { get; set; }
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal PaidAmount { get; set; } = 0;
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal BalanceAmount { get; set; }
    
    [Required]
    [MaxLength(20)]
    public string PaymentStatus { get; set; } = "Pending"; // Pending, Partial, Paid, Overdue, Waived
    
    public DateTime? LastPaymentDate { get; set; }
    
    public DateTime? OverdueDate { get; set; }
    
    public bool IsWaived { get; set; } = false;
    
    [MaxLength(500)]
    public string? WaiverReason { get; set; }
    
    [MaxLength(100)]
    public string? WaivedBy { get; set; }
    
    public DateTime? WaivedAt { get; set; }
    
    [MaxLength(500)]
    public string? Remarks { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    [ForeignKey("FeeCollectionScheduleId")]
    public virtual FeeCollectionSchedule FeeCollectionSchedule { get; set; } = null!;
    
    [ForeignKey("StudentId")]
    public virtual Student Student { get; set; } = null!;
    
    public virtual ICollection<FeePayment> FeePayments { get; set; } = new List<FeePayment>();
}

public class FeePayment
{
    [Key]
    public int Id { get; set; }
    
    [Required]
    public int StudentFeeAssignmentId { get; set; }
    
    public int? FeeCollectionScheduleId { get; set; }
    
    [Required]
    [MaxLength(50)]
    public string ReceiptNumber { get; set; } = string.Empty;
    
    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal Amount { get; set; }
    
    [Required]
    [MaxLength(20)]
    public string PaymentMethod { get; set; } = string.Empty; // Cash, Card, BankTransfer, Cheque, Online, UPI
    
    [MaxLength(100)]
    public string? TransactionReference { get; set; }
    
    [MaxLength(100)]
    public string? ChequeNumber { get; set; }
    
    [MaxLength(100)]
    public string? BankName { get; set; }
    
    public DateTime? ChequeDate { get; set; }
    
    [Required]
    public DateTime PaymentDate { get; set; }
    
    [Required]
    [MaxLength(20)]
    public string PaymentStatus { get; set; } = "Completed"; // Pending, Completed, Failed, Cancelled, Refunded
    
    [MaxLength(500)]
    public string? Remarks { get; set; }
    
    [Required]
    [MaxLength(100)]
    public string CollectedBy { get; set; } = string.Empty;
    
    public bool IsAdvancePayment { get; set; } = false;
    
    public bool IsRefunded { get; set; } = false;
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal? RefundAmount { get; set; }
    
    public DateTime? RefundDate { get; set; }
    
    [MaxLength(500)]
    public string? RefundReason { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    [ForeignKey("StudentFeeAssignmentId")]
    public virtual StudentFeeAssignment StudentFeeAssignment { get; set; } = null!;
    
    [ForeignKey("FeeCollectionScheduleId")]
    public virtual FeeCollectionSchedule? FeeCollectionSchedule { get; set; }
}
