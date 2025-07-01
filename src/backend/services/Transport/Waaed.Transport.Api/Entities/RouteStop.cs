using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Waaed.Shared.Domain.Entities;

namespace Waaed.Transport.Api.Entities;

[Table("RouteStops")]
public class RouteStop : BaseEntity
{
    [Key]
    public new Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public int RouteId { get; set; }

    [Required]
    [StringLength(200)]
    public string StopName { get; set; } = string.Empty;

    [StringLength(500)]
    public string? StopAddress { get; set; }

    [StringLength(100)]
    public string? Landmark { get; set; }

    [Required]
    public int StopOrder { get; set; }

    [Column(TypeName = "decimal(10,6)")]
    public decimal? Latitude { get; set; }

    [Column(TypeName = "decimal(10,6)")]
    public decimal? Longitude { get; set; }

    [Column(TypeName = "decimal(10,2)")]
    public decimal? DistanceFromPrevious { get; set; }

    [Required]
    public TimeSpan MorningArrivalTime { get; set; }

    [Required]
    public TimeSpan MorningDepartureTime { get; set; }

    public TimeSpan? EveningArrivalTime { get; set; }

    public TimeSpan? EveningDepartureTime { get; set; }

    public int WaitingTimeMinutes { get; set; } = 2;

    public bool IsPickupPoint { get; set; } = true;

    public bool IsDropPoint { get; set; } = true;

    public bool IsActive { get; set; } = true;

    [StringLength(1000)]
    public string? SpecialInstructions { get; set; }

    [StringLength(1000)]
    public string? Notes { get; set; }

    [ForeignKey("RouteId")]
    public virtual Route Route { get; set; } = null!;

    public virtual ICollection<StudentTransportAssignment> StudentAssignments { get; set; } = new List<StudentTransportAssignment>();
}
