using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Waaed.Shared.Domain.Entities;

namespace Waaed.Discipline.Api.Entities;

[Table("DisciplinePolicyViolations")]
public class DisciplinePolicyViolation : BaseEntity
{
    [Key]
    public new Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public int IncidentId { get; set; }

    [Required]
    public int PolicyId { get; set; }

    [Required]
    public int StudentId { get; set; }

    [Required]
    public DateTime ViolationDate { get; set; }

    [StringLength(50)]
    public string ViolationSeverity { get; set; } = "Medium";

    [StringLength(2000)]
    public string? ViolationDescription { get; set; }

    [StringLength(2000)]
    public string? CircumstancesDescription { get; set; }

    public bool IsFirstOffense { get; set; } = true;

    public bool IsRepeatOffense { get; set; } = false;

    public int? PreviousViolationCount { get; set; }

    public DateTime? LastViolationDate { get; set; }

    [StringLength(50)]
    public string Status { get; set; } = "Active";

    [StringLength(100)]
    public string RecordedBy { get; set; } = string.Empty;

    public DateTime RecordedDate { get; set; } = DateTime.UtcNow;

    [StringLength(100)]
    public string? ReviewedBy { get; set; }

    public DateTime? ReviewedDate { get; set; }

    [StringLength(1000)]
    public string? ReviewNotes { get; set; }

    [StringLength(2000)]
    public string? MitigatingFactors { get; set; }

    [StringLength(2000)]
    public string? AggravatingFactors { get; set; }

    [StringLength(1000)]
    public string? RecommendedActions { get; set; }

    [StringLength(1000)]
    public string? InternalNotes { get; set; }

    [ForeignKey("IncidentId")]
    public virtual DisciplineIncident Incident { get; set; } = null!;

    [ForeignKey("PolicyId")]
    public virtual DisciplinePolicy Policy { get; set; } = null!;
}
