using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Waaed.Shared.Domain.Entities;

namespace Waaed.Discipline.Api.Entities;

[Table("StudentBehaviorRecords")]
public class StudentBehaviorRecord : BaseEntity
{
    [Key]
    public new Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public int StudentId { get; set; }

    [Required]
    public DateTime RecordDate { get; set; }

    [Required]
    [StringLength(50)]
    public string BehaviorType { get; set; } = string.Empty;

    [StringLength(50)]
    public string BehaviorCategory { get; set; } = "General";

    [StringLength(2000)]
    public string? Description { get; set; }

    [StringLength(200)]
    public string? Location { get; set; }

    [StringLength(100)]
    public string? Subject { get; set; }

    [StringLength(100)]
    public string? Teacher { get; set; }

    [StringLength(50)]
    public string Severity { get; set; } = "Low";

    [StringLength(50)]
    public string? Frequency { get; set; }

    [StringLength(1000)]
    public string? Triggers { get; set; }

    [StringLength(1000)]
    public string? Interventions { get; set; }

    [StringLength(1000)]
    public string? Outcomes { get; set; }

    [StringLength(100)]
    public string RecordedBy { get; set; } = string.Empty;

    public bool IsPositiveBehavior { get; set; } = false;

    public bool IsNegativeBehavior { get; set; } = false;

    public bool RequiresFollowUp { get; set; } = false;

    public DateTime? FollowUpDate { get; set; }

    [StringLength(1000)]
    public string? FollowUpNotes { get; set; }

    public bool ParentsNotified { get; set; } = false;

    public DateTime? ParentsNotifiedDate { get; set; }

    [StringLength(100)]
    public string? ParentsNotifiedBy { get; set; }

    [StringLength(1000)]
    public string? ParentResponse { get; set; }

    [StringLength(1000)]
    public string? RecommendedSupports { get; set; }

    [StringLength(1000)]
    public string? InternalNotes { get; set; }

    [StringLength(500)]
    public string? AttachmentUrls { get; set; }

    public bool IsConfidential { get; set; } = false;

    [StringLength(1000)]
    public string? Tags { get; set; }

    public int? RelatedIncidentId { get; set; }

    [ForeignKey("RelatedIncidentId")]
    public virtual DisciplineIncident? RelatedIncident { get; set; }
}
