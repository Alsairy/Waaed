using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Waaed.Shared.Domain.Entities;

namespace Waaed.Transport.Api.Entities;

[Table("VehicleFuelRecords")]
public class VehicleFuelRecord : BaseEntity
{
    [Key]
    public new Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public int VehicleId { get; set; }

    [Required]
    public DateTime FuelDate { get; set; }

    [Required]
    [Column(TypeName = "decimal(10,2)")]
    public decimal FuelQuantity { get; set; }

    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal FuelCost { get; set; }

    [Required]
    [Column(TypeName = "decimal(10,2)")]
    public decimal FuelPricePerLiter { get; set; }

    [Required]
    [Column(TypeName = "decimal(10,2)")]
    public decimal MileageAtFueling { get; set; }

    [StringLength(200)]
    public string? FuelStation { get; set; }

    [StringLength(100)]
    public string? ReceiptNumber { get; set; }

    [StringLength(50)]
    public string FuelType { get; set; } = "Petrol";

    [Column(TypeName = "decimal(5,2)")]
    public decimal? FuelEfficiency { get; set; }

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
