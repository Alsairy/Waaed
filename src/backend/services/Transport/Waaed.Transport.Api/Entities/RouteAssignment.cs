using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Waaed.Shared.Domain.Entities;

namespace Waaed.Transport.Api.Entities;

[Table("RouteAssignments")]
public class RouteAssignment : BaseEntity
{
    [Key]
    public new Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public int RouteId { get; set; }

    [Required]
    public int VehicleId { get; set; }

    [Required]
    public int DriverId { get; set; }

    public int? EscortId { get; set; }

    [Required]
    public DateTime AssignmentDate { get; set; }

    public DateTime? UnassignmentDate { get; set; }

    [StringLength(50)]
    public string Status { get; set; } = "Active";

    [StringLength(50)]
    public string AssignmentType { get; set; } = "Regular";

    public bool IsPrimary { get; set; } = true;

    [StringLength(1000)]
    public string? Notes { get; set; }

    [StringLength(100)]
    public string AssignedBy { get; set; } = string.Empty;

    public DateTime? LastModified { get; set; }

    [StringLength(100)]
    public string? ModifiedBy { get; set; }

    [ForeignKey("RouteId")]
    public virtual Route Route { get; set; } = null!;

    [ForeignKey("VehicleId")]
    public virtual Vehicle Vehicle { get; set; } = null!;

    [ForeignKey("DriverId")]
    public virtual Driver Driver { get; set; } = null!;

    [ForeignKey("EscortId")]
    public virtual Driver? Escort { get; set; }
}
