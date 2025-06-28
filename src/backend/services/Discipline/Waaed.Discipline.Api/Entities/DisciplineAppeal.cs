using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Waaed.Shared.Domain.Entities;

namespace Waaed.Discipline.Api.Entities;

[Table("DisciplineAppeals")]
public class DisciplineAppeal : BaseEntity
{
    [Key]
    public new Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public int IncidentId { get; set; }

    public int? ActionId { get; set; }

    public int? HearingId { get; set; }

    [Required]
    public int StudentId { get; set; }

    [Required]
    [StringLength(200)]
    public string AppealTitle { get; set; } = string.Empty;

    [Required]
    [StringLength(2000)]
    public string AppealReason { get; set; } = string.Empty;

    [Required]
    [StringLength(2000)]
    public string AppealGrounds { get; set; } = string.Empty;

    [Required]
    public DateTime AppealDate { get; set; }

    [StringLength(100)]
    public string AppealedBy { get; set; } = string.Empty;

    [StringLength(100)]
    public string? AppellantRelation { get; set; }

    [StringLength(50)]
    public string Status { get; set; } = "Submitted";

    public DateTime? ReviewStartDate { get; set; }

    [StringLength(100)]
    public string? ReviewedBy { get; set; }

    [StringLength(100)]
    public string? AppealPanelChair { get; set; }

    [StringLength(1000)]
    public string? AppealPanelMembers { get; set; }

    public DateTime? HearingDate { get; set; }

    [StringLength(200)]
    public string? HearingLocation { get; set; }

    [StringLength(2000)]
    public string? NewEvidencePresented { get; set; }

    [StringLength(2000)]
    public string? AppellantStatement { get; set; }

    [StringLength(2000)]
    public string? InstitutionResponse { get; set; }

    [StringLength(2000)]
    public string? PanelDeliberations { get; set; }

    [StringLength(50)]
    public string? Decision { get; set; }

    public DateTime? DecisionDate { get; set; }

    [StringLength(2000)]
    public string? DecisionRationale { get; set; }

    [StringLength(2000)]
    public string? RevisedActions { get; set; }

    public bool OriginalDecisionUpheld { get; set; } = false;

    public bool OriginalDecisionModified { get; set; } = false;

    public bool OriginalDecisionOverturned { get; set; } = false;

    [StringLength(2000)]
    public string? ImplementationInstructions { get; set; }

    public bool IsFinalDecision { get; set; } = true;

    [StringLength(1000)]
    public string? FurtherAppealRights { get; set; }

    [StringLength(500)]
    public string? DocumentUrls { get; set; }

    [StringLength(1000)]
    public string? InternalNotes { get; set; }

    public DateTime? NotificationSentDate { get; set; }

    [StringLength(100)]
    public string? NotificationSentBy { get; set; }

    [ForeignKey("IncidentId")]
    public virtual DisciplineIncident Incident { get; set; } = null!;

    [ForeignKey("ActionId")]
    public virtual DisciplineAction? Action { get; set; }

    [ForeignKey("HearingId")]
    public virtual DisciplineHearing? Hearing { get; set; }
}
