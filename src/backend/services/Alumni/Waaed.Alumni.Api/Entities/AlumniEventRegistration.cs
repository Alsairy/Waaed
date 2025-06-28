using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Waaed.Shared.Domain.Entities;

namespace Waaed.Alumni.Api.Entities;

[Table("AlumniEventRegistrations")]
public class AlumniEventRegistration : BaseEntity
{
    [Key]
    public new Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public Guid AlumniId { get; set; }

    [Required]
    public Guid EventId { get; set; }

    [Required]
    public DateTime RegistrationDate { get; set; }

    [StringLength(50)]
    public string Status { get; set; } = "Registered";

    [Column(TypeName = "decimal(18,2)")]
    public decimal? AmountPaid { get; set; }

    [StringLength(100)]
    public string? PaymentMethod { get; set; }

    [StringLength(200)]
    public string? PaymentReference { get; set; }

    public DateTime? PaymentDate { get; set; }

    public bool Attended { get; set; } = false;

    public DateTime? AttendanceMarkedAt { get; set; }

    [StringLength(1000)]
    public string? SpecialRequests { get; set; }

    [StringLength(500)]
    public string? DietaryRestrictions { get; set; }

    [StringLength(1000)]
    public string? Comments { get; set; }

    public int? Rating { get; set; }

    [StringLength(2000)]
    public string? Feedback { get; set; }

    public DateTime? FeedbackSubmittedAt { get; set; }

    [StringLength(200)]
    public string? CertificateUrl { get; set; }

    public bool CertificateIssued { get; set; } = false;

    public DateTime? CertificateIssuedAt { get; set; }

    [ForeignKey("AlumniId")]
    public virtual Alumni Alumni { get; set; } = null!;

    [ForeignKey("EventId")]
    public virtual AlumniEvent Event { get; set; } = null!;
}
