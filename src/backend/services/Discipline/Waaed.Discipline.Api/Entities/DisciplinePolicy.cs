using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Waaed.Shared.Domain.Entities;

namespace Waaed.Discipline.Api.Entities;

[Table("DisciplinePolicies")]
public class DisciplinePolicy : BaseEntity
{
    [Key]
    public new Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [StringLength(200)]
    public string PolicyName { get; set; } = string.Empty;

    [Required]
    [StringLength(50)]
    public string PolicyCode { get; set; } = string.Empty;

    [StringLength(1000)]
    public string? Description { get; set; }

    [Required]
    [StringLength(50)]
    public string Category { get; set; } = string.Empty;

    [Required]
    [StringLength(50)]
    public string Severity { get; set; } = "Medium";

    [Required]
    [StringLength(2000)]
    public string PolicyText { get; set; } = string.Empty;

    [StringLength(2000)]
    public string? Violations { get; set; }

    [StringLength(2000)]
    public string? Consequences { get; set; }

    [StringLength(2000)]
    public string? ProcedureSteps { get; set; }

    [StringLength(1000)]
    public string? ApplicableGrades { get; set; }

    [StringLength(1000)]
    public string? Exceptions { get; set; }

    [Required]
    public DateTime EffectiveDate { get; set; }

    public DateTime? ExpiryDate { get; set; }

    [StringLength(50)]
    public string Status { get; set; } = "Active";

    [Required]
    [StringLength(100)]
    public new string CreatedBy { get; set; } = string.Empty;

    [StringLength(100)]
    public string? ApprovedBy { get; set; }

    public DateTime? ApprovedDate { get; set; }

    [StringLength(100)]
    public string? LastModifiedBy { get; set; }

    public DateTime? LastModifiedDate { get; set; }

    [StringLength(100)]
    public string? ReviewedBy { get; set; }

    public DateTime? LastReviewDate { get; set; }

    public DateTime? NextReviewDate { get; set; }

    [StringLength(1000)]
    public string? ReviewNotes { get; set; }

    public bool RequiresParentNotification { get; set; } = true;

    public bool RequiresDocumentation { get; set; } = true;

    public bool RequiresInvestigation { get; set; } = false;

    public bool RequiresHearing { get; set; } = false;

    public bool AllowsAppeal { get; set; } = true;

    public int? AppealTimeframeDays { get; set; }

    [StringLength(1000)]
    public string? RelatedPolicies { get; set; }

    [StringLength(1000)]
    public string? LegalReferences { get; set; }

    [StringLength(500)]
    public string? DocumentUrls { get; set; }

    [StringLength(1000)]
    public string? InternalNotes { get; set; }

    public bool IsActive { get; set; } = true;

    public virtual ICollection<DisciplinePolicyViolation> PolicyViolations { get; set; } = new List<DisciplinePolicyViolation>();
}
