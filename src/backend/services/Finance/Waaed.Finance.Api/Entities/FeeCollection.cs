using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AttendancePlatform.Finance.Api.Entities;

public class FeeCollection
{
    [Key]
    public int Id { get; set; }
    
    [Required]
    [MaxLength(50)]
    public string ReceiptNumber { get; set; } = string.Empty;
    
    [Required]
    public int StudentId { get; set; }
    
    [Required]
    public int FeeStructureId { get; set; }
    
    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal AmountDue { get; set; }
    
    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal AmountPaid { get; set; }
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal? Discount { get; set; }
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal? LateFee { get; set; }
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal Balance => AmountDue - AmountPaid;
    
    [Required]
    public DateTime DueDate { get; set; }
    
    public DateTime? PaymentDate { get; set; }
    
    [Required]
    [MaxLength(20)]
    public string PaymentStatus { get; set; } = "Pending"; // Pending, Partial, Paid, Overdue
    
    [MaxLength(50)]
    public string? PaymentMethod { get; set; } // Cash, Card, Bank Transfer, Cheque, Online
    
    [MaxLength(100)]
    public string? TransactionReference { get; set; }
    
    [MaxLength(500)]
    public string? Remarks { get; set; }
    
    [Required]
    [MaxLength(20)]
    public string FeeType { get; set; } = string.Empty; // Monthly, Quarterly, Annual, Admission, Examination
    
    [Required]
    public DateTime ForMonth { get; set; } // Which month/period this fee is for
    
    [Required]
    public DateTime AcademicYear { get; set; }
    
    [MaxLength(100)]
    public string? CollectedBy { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    [ForeignKey("StudentId")]
    public virtual Student Student { get; set; } = null!;
    
    [ForeignKey("FeeStructureId")]
    public virtual FeeStructure FeeStructure { get; set; } = null!;
}
