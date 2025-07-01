using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Waaed.Shared.Domain.Entities;

namespace Waaed.Alumni.Api.Entities;

[Table("AlumniJobApplications")]
public class AlumniJobApplication : BaseEntity
{
    [Key]
    public new Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public int JobPostingId { get; set; }

    [Required]
    public int ApplicantAlumniId { get; set; }

    [Required]
    public DateTime ApplicationDate { get; set; }

    [StringLength(50)]
    public string Status { get; set; } = "Applied";

    [StringLength(2000)]
    public string? CoverLetter { get; set; }

    [StringLength(500)]
    public string? ResumeUrl { get; set; }

    [StringLength(500)]
    public string? PortfolioUrl { get; set; }

    [StringLength(1000)]
    public string? AdditionalDocuments { get; set; }

    [StringLength(1000)]
    public string? Notes { get; set; }

    public DateTime? ReviewedAt { get; set; }

    [StringLength(100)]
    public string? ReviewedBy { get; set; }

    [StringLength(1000)]
    public string? ReviewerNotes { get; set; }

    public DateTime? InterviewScheduledAt { get; set; }

    [StringLength(500)]
    public string? InterviewLocation { get; set; }

    [StringLength(500)]
    public string? InterviewMeetingLink { get; set; }

    public DateTime? InterviewCompletedAt { get; set; }

    [StringLength(2000)]
    public string? InterviewFeedback { get; set; }

    public int? InterviewRating { get; set; }

    public DateTime? OfferMadeAt { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal? OfferAmount { get; set; }

    [StringLength(10)]
    public string? OfferCurrency { get; set; }

    public DateTime? OfferExpiresAt { get; set; }

    public DateTime? OfferAcceptedAt { get; set; }

    public DateTime? OfferDeclinedAt { get; set; }

    [StringLength(1000)]
    public string? DeclineReason { get; set; }

    public DateTime? StartDate { get; set; }

    [ForeignKey("JobPostingId")]
    public virtual AlumniJobPosting JobPosting { get; set; } = null!;

    [ForeignKey("ApplicantAlumniId")]
    public virtual Alumni ApplicantAlumni { get; set; } = null!;
}
