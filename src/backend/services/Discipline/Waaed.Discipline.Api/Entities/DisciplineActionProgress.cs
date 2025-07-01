using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Waaed.Shared.Domain.Entities;

namespace Waaed.Discipline.Api.Entities;

[Table("DisciplineActionProgress")]
public class DisciplineActionProgress : BaseEntity
{
    [Key]
    public new Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public int ActionId { get; set; }

    [Required]
    public DateTime ProgressDate { get; set; }

    [Required]
    [StringLength(100)]
    public string ProgressType { get; set; } = string.Empty;

    [StringLength(2000)]
    public string? Description { get; set; }

    [StringLength(50)]
    public string Status { get; set; } = "In Progress";

    [Column(TypeName = "decimal(5,2)")]
    public decimal? CompletionPercentage { get; set; }

    [StringLength(100)]
    public string RecordedBy { get; set; } = string.Empty;

    [StringLength(1000)]
    public string? Notes { get; set; }

    [StringLength(500)]
    public string? AttachmentUrls { get; set; }

    public bool RequiresVerification { get; set; } = false;

    public bool IsVerified { get; set; } = false;

    [StringLength(100)]
    public string? VerifiedBy { get; set; }

    public DateTime? VerifiedDate { get; set; }

    [StringLength(1000)]
    public string? VerificationNotes { get; set; }

    [ForeignKey("ActionId")]
    public virtual DisciplineAction Action { get; set; } = null!;
}
