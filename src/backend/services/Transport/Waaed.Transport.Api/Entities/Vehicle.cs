using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Waaed.Shared.Domain.Entities;

namespace Waaed.Transport.Api.Entities;

[Table("Vehicles")]
public class Vehicle : BaseEntity
{
    [Key]
    public new Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [StringLength(50)]
    public string VehicleNumber { get; set; } = string.Empty;

    [Required]
    [StringLength(100)]
    public string VehicleType { get; set; } = string.Empty;

    [Required]
    [StringLength(100)]
    public string Make { get; set; } = string.Empty;

    [Required]
    [StringLength(100)]
    public string Model { get; set; } = string.Empty;

    [Required]
    public int Year { get; set; }

    [StringLength(50)]
    public string? Color { get; set; }

    [StringLength(50)]
    public string? EngineNumber { get; set; }

    [StringLength(50)]
    public string? ChassisNumber { get; set; }

    [Required]
    public int Capacity { get; set; }

    [StringLength(50)]
    public string FuelType { get; set; } = "Petrol";

    [Column(TypeName = "decimal(5,2)")]
    public decimal? FuelEfficiency { get; set; }

    [Required]
    public DateTime PurchaseDate { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal PurchasePrice { get; set; }

    [StringLength(100)]
    public string? Vendor { get; set; }

    [StringLength(50)]
    public string Status { get; set; } = "Active";

    public DateTime? RegistrationExpiryDate { get; set; }

    public DateTime? InsuranceExpiryDate { get; set; }

    public DateTime? PollutionCertificateExpiryDate { get; set; }

    public DateTime? FitnessExpiryDate { get; set; }

    [StringLength(100)]
    public string? InsuranceCompany { get; set; }

    [StringLength(100)]
    public string? InsurancePolicyNumber { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal? InsuranceAmount { get; set; }

    public int? CurrentDriverId { get; set; }

    public int? CurrentRouteId { get; set; }

    [Column(TypeName = "decimal(10,2)")]
    public decimal? CurrentMileage { get; set; }

    public DateTime? LastServiceDate { get; set; }

    public DateTime? NextServiceDate { get; set; }

    [Column(TypeName = "decimal(10,2)")]
    public decimal? ServiceIntervalKm { get; set; }

    [StringLength(1000)]
    public string? Notes { get; set; }

    public bool IsActive { get; set; } = true;

    public bool HasGPS { get; set; } = false;

    public bool HasCCTV { get; set; } = false;

    public bool HasFirstAid { get; set; } = false;

    public bool HasFireExtinguisher { get; set; } = false;

    [StringLength(500)]
    public string? ImageUrl { get; set; }

    [ForeignKey("CurrentDriverId")]
    public virtual Driver? CurrentDriver { get; set; }

    [ForeignKey("CurrentRouteId")]
    public virtual Route? CurrentRoute { get; set; }

    public virtual ICollection<VehicleMaintenanceRecord> MaintenanceRecords { get; set; } = new List<VehicleMaintenanceRecord>();
    public virtual ICollection<VehicleFuelRecord> FuelRecords { get; set; } = new List<VehicleFuelRecord>();
    public virtual ICollection<VehicleInspection> Inspections { get; set; } = new List<VehicleInspection>();
    public virtual ICollection<RouteAssignment> RouteAssignments { get; set; } = new List<RouteAssignment>();
}
