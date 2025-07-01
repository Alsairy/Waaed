using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Waaed.Shared.Domain.Entities;

namespace Waaed.Alumni.Api.Entities;

[Table("AlumniDonations")]
public class AlumniDonation : BaseEntity
{
    [Key]
    public new Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public Guid AlumniId { get; set; }

    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal Amount { get; set; }

    [Required]
    [StringLength(10)]
    public string Currency { get; set; } = "USD";

    [Required]
    public DateTime DonationDate { get; set; }

    [StringLength(100)]
    public string? Purpose { get; set; }

    [StringLength(100)]
    public string? Campaign { get; set; }

    [StringLength(50)]
    public string PaymentMethod { get; set; } = string.Empty;

    [StringLength(200)]
    public string? TransactionReference { get; set; }

    [StringLength(50)]
    public string Status { get; set; } = "Completed";

    public bool IsRecurring { get; set; } = false;

    [StringLength(50)]
    public string? RecurrenceFrequency { get; set; }

    public DateTime? NextDonationDate { get; set; }

    public bool IsAnonymous { get; set; } = false;

    public bool IsMatchingGift { get; set; } = false;

    [StringLength(200)]
    public string? MatchingCompany { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal? MatchingAmount { get; set; }

    public bool TaxReceiptSent { get; set; } = false;

    public DateTime? TaxReceiptSentAt { get; set; }

    [StringLength(200)]
    public string? TaxReceiptNumber { get; set; }

    public bool ThankYouSent { get; set; } = false;

    public DateTime? ThankYouSentAt { get; set; }

    [StringLength(1000)]
    public string? DonorComments { get; set; }

    [StringLength(1000)]
    public string? InternalNotes { get; set; }

    [StringLength(200)]
    public string? DedicatedTo { get; set; }

    [StringLength(500)]
    public string? DedicationMessage { get; set; }

    [StringLength(200)]
    public string? ProcessedBy { get; set; }

    [ForeignKey("AlumniId")]
    public virtual Alumni Alumni { get; set; } = null!;
}
