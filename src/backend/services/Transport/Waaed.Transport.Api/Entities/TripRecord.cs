using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Waaed.Shared.Domain.Entities;

namespace Waaed.Transport.Api.Entities;

[Table("TripRecords")]
public class TripRecord : BaseEntity
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
    public DateTime TripDate { get; set; }

    [Required]
    [StringLength(50)]
    public string TripType { get; set; } = string.Empty;

    public DateTime? StartTime { get; set; }

    public DateTime? EndTime { get; set; }

    [Column(TypeName = "decimal(10,2)")]
    public decimal? StartMileage { get; set; }

    [Column(TypeName = "decimal(10,2)")]
    public decimal? EndMileage { get; set; }

    [Column(TypeName = "decimal(10,2)")]
    public decimal? TotalDistance { get; set; }

    [StringLength(50)]
    public string Status { get; set; } = "Scheduled";

    public int StudentsPickedUp { get; set; } = 0;

    public int StudentsDropped { get; set; } = 0;

    [Column(TypeName = "decimal(5,2)")]
    public decimal? FuelConsumed { get; set; }

    [StringLength(1000)]
    public string? Incidents { get; set; }

    [StringLength(1000)]
    public string? Delays { get; set; }

    [StringLength(1000)]
    public string? Notes { get; set; }

    public bool IsCompleted { get; set; } = false;

    public DateTime? CompletedAt { get; set; }

    [StringLength(100)]
    public string? CompletedBy { get; set; }

    [ForeignKey("RouteId")]
    public virtual Route Route { get; set; } = null!;

    [ForeignKey("VehicleId")]
    public virtual Vehicle Vehicle { get; set; } = null!;

    [ForeignKey("DriverId")]
    public virtual Driver Driver { get; set; } = null!;

    [ForeignKey("EscortId")]
    public virtual Driver? Escort { get; set; }

    public virtual ICollection<StudentAttendanceRecord> AttendanceRecords { get; set; } = new List<StudentAttendanceRecord>();
}
