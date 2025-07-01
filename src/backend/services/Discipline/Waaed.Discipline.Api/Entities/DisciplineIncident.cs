using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Waaed.Shared.Domain.Entities;

namespace Waaed.Discipline.Api.Entities;

[Table("DisciplineIncidents")]
public class DisciplineIncident : BaseEntity
{
    [Key]
    public new Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public int StudentId { get; set; }

    [Required]
    [StringLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [StringLength(2000)]
    public string Description { get; set; } = string.Empty;

    [Required]
    [StringLength(50)]
    public string IncidentType { get; set; } = string.Empty;

    [Required]
    [StringLength(50)]
    public string Severity { get; set; } = "Medium";

    [Required]
    public DateTime IncidentDate { get; set; }

    public TimeSpan? IncidentTime { get; set; }

    [StringLength(200)]
    public string? Location { get; set; }

    [Required]
    [StringLength(100)]
    public string ReportedBy { get; set; } = string.Empty;

    public DateTime ReportedDate { get; set; } = DateTime.UtcNow;

    [StringLength(50)]
    public string Status { get; set; } = "Open";

    [StringLength(1000)]
    public string? WitnessAccounts { get; set; }

    [StringLength(1000)]
    public string? EvidenceDescription { get; set; }

    [StringLength(500)]
    public string? AttachmentUrls { get; set; }

    public bool ParentsNotified { get; set; } = false;

    public DateTime? ParentsNotifiedDate { get; set; }

    [StringLength(100)]
    public string? ParentsNotifiedBy { get; set; }

    [StringLength(1000)]
    public string? ParentResponse { get; set; }

    public bool RequiresInvestigation { get; set; } = false;

    [StringLength(100)]
    public string? InvestigatedBy { get; set; }

    public DateTime? InvestigationStartDate { get; set; }

    public DateTime? InvestigationEndDate { get; set; }

    [StringLength(2000)]
    public string? InvestigationFindings { get; set; }

    [StringLength(50)]
    public string? InvestigationStatus { get; set; }

    public bool IsResolved { get; set; } = false;

    public DateTime? ResolvedDate { get; set; }

    [StringLength(100)]
    public string? ResolvedBy { get; set; }

    [StringLength(2000)]
    public string? ResolutionNotes { get; set; }

    [StringLength(1000)]
    public string? InternalNotes { get; set; }

    public bool IsAnonymousReport { get; set; } = false;

    public bool RequiresFollowUp { get; set; } = false;

    public DateTime? FollowUpDate { get; set; }

    [StringLength(1000)]
    public string? FollowUpNotes { get; set; }

    public virtual ICollection<DisciplineAction> DisciplineActions { get; set; } = new List<DisciplineAction>();
    public virtual ICollection<DisciplineHearing> DisciplineHearings { get; set; } = new List<DisciplineHearing>();
    public virtual ICollection<DisciplineAppeal> DisciplineAppeals { get; set; } = new List<DisciplineAppeal>();
}
