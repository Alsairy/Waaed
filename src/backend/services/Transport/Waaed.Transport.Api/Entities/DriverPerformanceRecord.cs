using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Waaed.Shared.Domain.Entities;

namespace Waaed.Transport.Api.Entities;

[Table("DriverPerformanceRecords")]
public class DriverPerformanceRecord : BaseEntity
{
    [Key]
    public new Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public int DriverId { get; set; }

    [Required]
    public DateTime EvaluationDate { get; set; }

    [Required]
    [StringLength(50)]
    public string EvaluationPeriod { get; set; } = string.Empty;

    public int PunctualityScore { get; set; } = 0;

    public int SafetyScore { get; set; } = 0;

    public int StudentInteractionScore { get; set; } = 0;

    public int VehicleMaintenanceScore { get; set; } = 0;

    public int OverallScore { get; set; } = 0;

    [StringLength(10)]
    public string Grade { get; set; } = string.Empty;

    public int TripsCompleted { get; set; } = 0;

    public int IncidentsReported { get; set; } = 0;

    public int ComplaintsReceived { get; set; } = 0;

    public int CommendationsReceived { get; set; } = 0;

    [Column(TypeName = "decimal(5,2)")]
    public decimal? AverageFuelEfficiency { get; set; }

    [StringLength(2000)]
    public string? Strengths { get; set; }

    [StringLength(2000)]
    public string? AreasForImprovement { get; set; }

    [StringLength(2000)]
    public string? TrainingRecommendations { get; set; }

    [StringLength(2000)]
    public string? Comments { get; set; }

    [StringLength(100)]
    public string? EvaluatedBy { get; set; }

    public DateTime? NextEvaluationDate { get; set; }

    [StringLength(1000)]
    public string? Notes { get; set; }

    [ForeignKey("DriverId")]
    public virtual Driver Driver { get; set; } = null!;
}
