using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Waaed.Shared.Domain.Entities;

namespace Waaed.Transport.Api.Entities;

[Table("VehicleMaintenanceRecords")]
public class VehicleMaintenanceRecord : BaseEntity
{
    [Key]
    public new Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public int VehicleId { get; set; }

    [Required]
    [StringLength(100)]
    public string MaintenanceType { get; set; } = string.Empty;

    [StringLength(1000)]
    public string? Description { get; set; }

    [Required]
    public DateTime MaintenanceDate { get; set; }

    [Column(TypeName = "decimal(10,2)")]
    public decimal? MileageAtMaintenance { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal Cost { get; set; }

    [StringLength(200)]
    public string? ServiceProvider { get; set; }

    [StringLength(100)]
    public string? InvoiceNumber { get; set; }

    [StringLength(50)]
    public string Status { get; set; } = "Completed";

    public DateTime? NextServiceDate { get; set; }

    [Column(TypeName = "decimal(10,2)")]
    public decimal? NextServiceMileage { get; set; }

    [StringLength(1000)]
    public string? PartsReplaced { get; set; }

    [StringLength(1000)]
    public string? WorkPerformed { get; set; }

    [StringLength(1000)]
    public string? Recommendations { get; set; }

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
