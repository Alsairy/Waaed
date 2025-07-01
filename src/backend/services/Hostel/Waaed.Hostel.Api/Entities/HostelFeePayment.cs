using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Waaed.Shared.Domain.Entities;

namespace Waaed.Hostel.Api.Entities;

[Table("HostelFeePayments")]
public class HostelFeePayment : BaseEntity
{
    [Key]
    public new Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public int AllocationId { get; set; }

    [Required]
    [StringLength(50)]
    public string PaymentType { get; set; } = string.Empty;

    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal Amount { get; set; }

    [Required]
    public DateTime PaymentDate { get; set; }

    [Required]
    [StringLength(50)]
    public string PaymentMethod { get; set; } = string.Empty;

    [StringLength(200)]
    public string? TransactionReference { get; set; }

    [StringLength(100)]
    public string? ChequeNumber { get; set; }

    [StringLength(200)]
    public string? BankName { get; set; }

    public DateTime? ChequeDate { get; set; }

    [StringLength(50)]
    public string Status { get; set; } = "Completed";

    [StringLength(100)]
    public string? ReceiptNumber { get; set; }

    public DateTime? ReceiptDate { get; set; }

    [StringLength(50)]
    public string PaymentFor { get; set; } = string.Empty;

    public DateTime? PeriodFrom { get; set; }

    public DateTime? PeriodTo { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal? LateFee { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal? Discount { get; set; }

    [StringLength(500)]
    public string? DiscountReason { get; set; }

    [StringLength(1000)]
    public string? Remarks { get; set; }

    [StringLength(100)]
    public string CollectedBy { get; set; } = string.Empty;

    public bool IsRefunded { get; set; } = false;

    [Column(TypeName = "decimal(18,2)")]
    public decimal? RefundAmount { get; set; }

    public DateTime? RefundDate { get; set; }

    [StringLength(500)]
    public string? RefundReason { get; set; }

    [ForeignKey("AllocationId")]
    public virtual HostelAllocation Allocation { get; set; } = null!;
}
