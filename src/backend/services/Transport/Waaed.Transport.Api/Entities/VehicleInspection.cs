using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Waaed.Shared.Domain.Entities;

namespace Waaed.Transport.Api.Entities;

[Table("VehicleInspections")]
public class VehicleInspection : BaseEntity
{
    [Key]
    public new Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public int VehicleId { get; set; }

    [Required]
    public DateTime InspectionDate { get; set; }

    [Required]
    [StringLength(100)]
    public string InspectionType { get; set; } = string.Empty;

    [StringLength(100)]
    public string? InspectedBy { get; set; }

    [StringLength(50)]
    public string Status { get; set; } = "Passed";

    [Column(TypeName = "decimal(10,2)")]
    public decimal? MileageAtInspection { get; set; }

    [StringLength(1000)]
    public string? EngineCondition { get; set; }

    [StringLength(1000)]
    public string? BrakeCondition { get; set; }

    [StringLength(1000)]
    public string? TireCondition { get; set; }

    [StringLength(1000)]
    public string? LightsCondition { get; set; }

    [StringLength(1000)]
    public string? InteriorCondition { get; set; }

    [StringLength(1000)]
    public string? ExteriorCondition { get; set; }

    [StringLength(1000)]
    public string? SafetyEquipmentCondition { get; set; }

    [StringLength(2000)]
    public string? IssuesFound { get; set; }

    [StringLength(2000)]
    public string? Recommendations { get; set; }

    public DateTime? NextInspectionDate { get; set; }

    [StringLength(1000)]
    public string? Notes { get; set; }

    [StringLength(100)]
    public string? RecordedBy { get; set; }

    public DateTime? LastModified { get; set; }

    [StringLength(100)]
    public string? ModifiedBy { get; set; }

    [ForeignKey("VehicleId")]
    public virtual Vehicle Vehicle { get; set; } = null!;
}
