using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Waaed.Shared.Domain.Entities;

namespace Waaed.Discipline.Api.Entities;

[Table("DisciplineHearings")]
public class DisciplineHearing : BaseEntity
{
    [Key]
    public new Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public int IncidentId { get; set; }

    [Required]
    public int StudentId { get; set; }

    [Required]
    [StringLength(200)]
    public string HearingTitle { get; set; } = string.Empty;

    [Required]
    public DateTime ScheduledDate { get; set; }

    public TimeSpan? ScheduledTime { get; set; }

    [StringLength(200)]
    public string? Location { get; set; }

    [StringLength(50)]
    public string HearingType { get; set; } = "Formal";

    [StringLength(50)]
    public string Status { get; set; } = "Scheduled";

    [StringLength(100)]
    public string ChairpersonName { get; set; } = string.Empty;

    [StringLength(1000)]
    public string? PanelMembers { get; set; }

    [StringLength(1000)]
    public string? AttendeesRequired { get; set; }

    [StringLength(1000)]
    public string? AttendeesPresent { get; set; }

    public bool StudentPresent { get; set; } = false;

    public bool ParentGuardianPresent { get; set; } = false;

    [StringLength(200)]
    public string? StudentRepresentative { get; set; }

    [StringLength(200)]
    public string? ParentGuardianName { get; set; }

    public DateTime? ActualStartTime { get; set; }

    public DateTime? ActualEndTime { get; set; }

    [StringLength(2000)]
    public string? HearingProcedure { get; set; }

    [StringLength(2000)]
    public string? EvidencePresented { get; set; }

    [StringLength(2000)]
    public string? StudentStatement { get; set; }

    [StringLength(2000)]
    public string? ParentStatement { get; set; }

    [StringLength(2000)]
    public string? WitnessTestimonies { get; set; }

    [StringLength(2000)]
    public string? HearingMinutes { get; set; }

    [StringLength(2000)]
    public string? Decision { get; set; }

    [StringLength(2000)]
    public string? DecisionRationale { get; set; }

    [StringLength(2000)]
    public string? RecommendedActions { get; set; }

    public bool DecisionAppealed { get; set; } = false;

    public DateTime? AppealDeadline { get; set; }

    [StringLength(500)]
    public string? RecordingUrl { get; set; }

    [StringLength(500)]
    public string? DocumentUrls { get; set; }

    [StringLength(1000)]
    public string? FollowUpRequired { get; set; }

    public DateTime? FollowUpDate { get; set; }

    [StringLength(1000)]
    public string? InternalNotes { get; set; }

    [ForeignKey("IncidentId")]
    public virtual DisciplineIncident Incident { get; set; } = null!;
}
