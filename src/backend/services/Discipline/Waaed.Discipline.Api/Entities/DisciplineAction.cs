using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Waaed.Shared.Domain.Entities;

namespace Waaed.Discipline.Api.Entities;

[Table("DisciplineActions")]
public class DisciplineAction : BaseEntity
{
    [Key]
    public new Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public int IncidentId { get; set; }

    [Required]
    public int StudentId { get; set; }

    [Required]
    [StringLength(100)]
    public string ActionType { get; set; } = string.Empty;

    [Required]
    [StringLength(2000)]
    public string Description { get; set; } = string.Empty;

    [Required]
    [StringLength(50)]
    public string Severity { get; set; } = "Medium";

    [Required]
    public DateTime ActionDate { get; set; }

    public DateTime? StartDate { get; set; }

    public DateTime? EndDate { get; set; }

    [StringLength(50)]
    public string Status { get; set; } = "Active";

    [StringLength(100)]
    public string IssuedBy { get; set; } = string.Empty;

    [StringLength(100)]
    public string? ApprovedBy { get; set; }

    public DateTime? ApprovedDate { get; set; }

    public bool RequiresParentMeeting { get; set; } = false;

    public DateTime? ParentMeetingDate { get; set; }

    public bool ParentMeetingCompleted { get; set; } = false;

    [StringLength(1000)]
    public string? ParentMeetingNotes { get; set; }

    public bool RequiresCounseling { get; set; } = false;

    public int? CounselingSessionsRequired { get; set; }

    public int? CounselingSessionsCompleted { get; set; }

    public bool RequiresCommunityService { get; set; } = false;

    public int? CommunityServiceHours { get; set; }

    public int? CommunityServiceHoursCompleted { get; set; }

    public bool RequiresDetention { get; set; } = false;

    public int? DetentionDays { get; set; }

    public int? DetentionDaysServed { get; set; }

    public bool RequiresSuspension { get; set; } = false;

    public int? SuspensionDays { get; set; }

    public DateTime? SuspensionStartDate { get; set; }

    public DateTime? SuspensionEndDate { get; set; }

    public bool IsExpulsion { get; set; } = false;

    public DateTime? ExpulsionDate { get; set; }

    [StringLength(1000)]
    public string? ExpulsionReason { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal? FineAmount { get; set; }

    public bool FinePaid { get; set; } = false;

    public DateTime? FinePaidDate { get; set; }

    [StringLength(1000)]
    public string? Conditions { get; set; }

    [StringLength(2000)]
    public string? CompletionCriteria { get; set; }

    public bool IsCompleted { get; set; } = false;

    public DateTime? CompletedDate { get; set; }

    [StringLength(100)]
    public string? CompletedBy { get; set; }

    [StringLength(1000)]
    public string? CompletionNotes { get; set; }

    [StringLength(1000)]
    public string? InternalNotes { get; set; }

    public bool CanBeAppealed { get; set; } = true;

    public DateTime? AppealDeadline { get; set; }

    [ForeignKey("IncidentId")]
    public virtual DisciplineIncident Incident { get; set; } = null!;

    public virtual ICollection<DisciplineActionProgress> ActionProgress { get; set; } = new List<DisciplineActionProgress>();
}
