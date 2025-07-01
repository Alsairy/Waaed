using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Waaed.Shared.Domain.Entities;

namespace Waaed.Transport.Api.Entities;

[Table("Routes")]
public class Route : BaseEntity
{
    [Key]
    public new Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [StringLength(100)]
    public string RouteName { get; set; } = string.Empty;

    [Required]
    [StringLength(50)]
    public string RouteCode { get; set; } = string.Empty;

    [StringLength(1000)]
    public string? Description { get; set; }

    [Required]
    [StringLength(200)]
    public string StartLocation { get; set; } = string.Empty;

    [Required]
    [StringLength(200)]
    public string EndLocation { get; set; } = string.Empty;

    [Column(TypeName = "decimal(10,2)")]
    public decimal TotalDistance { get; set; }

    [Column(TypeName = "decimal(5,2)")]
    public decimal EstimatedDuration { get; set; }

    [Required]
    public TimeSpan MorningStartTime { get; set; }

    [Required]
    public TimeSpan MorningEndTime { get; set; }

    public TimeSpan? EveningStartTime { get; set; }

    public TimeSpan? EveningEndTime { get; set; }

    [StringLength(50)]
    public string Status { get; set; } = "Active";

    [StringLength(50)]
    public string RouteType { get; set; } = "Regular";

    public int MaxCapacity { get; set; } = 0;

    public int CurrentOccupancy { get; set; } = 0;

    [Column(TypeName = "decimal(18,2)")]
    public decimal? FeeAmount { get; set; }

    [StringLength(50)]
    public string? FeeFrequency { get; set; }

    public bool IsActive { get; set; } = true;

    public bool RequiresEscort { get; set; } = false;

    [StringLength(1000)]
    public string? SafetyInstructions { get; set; }

    [StringLength(1000)]
    public string? Notes { get; set; }

    [StringLength(2000)]
    public string? GPSCoordinates { get; set; }

    public DateTime? LastUpdated { get; set; }

    [StringLength(100)]
    public new string? UpdatedBy { get; set; }

    public virtual ICollection<RouteStop> RouteStops { get; set; } = new List<RouteStop>();
    public virtual ICollection<RouteAssignment> RouteAssignments { get; set; } = new List<RouteAssignment>();
    public virtual ICollection<StudentTransportAssignment> StudentAssignments { get; set; } = new List<StudentTransportAssignment>();
    public virtual ICollection<TripRecord> TripRecords { get; set; } = new List<TripRecord>();
}
