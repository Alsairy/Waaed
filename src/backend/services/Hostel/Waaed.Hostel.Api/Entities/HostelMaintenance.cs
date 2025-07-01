using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Waaed.Shared.Domain.Entities;

namespace Waaed.Hostel.Api.Entities;

[Table("HostelMaintenance")]
public class HostelMaintenance : BaseEntity
{
    [Key]
    public new Guid Id { get; set; } = Guid.NewGuid();

    public int? BuildingId { get; set; }

    public int? RoomId { get; set; }

    [Required]
    [StringLength(200)]
    public string MaintenanceType { get; set; } = string.Empty;

    [Required]
    [StringLength(2000)]
    public string Description { get; set; } = string.Empty;

    [Required]
    [StringLength(50)]
    public string Priority { get; set; } = "Medium";

    [Required]
    public DateTime RequestDate { get; set; }

    public DateTime? ScheduledDate { get; set; }

    public DateTime? StartDate { get; set; }

    public DateTime? CompletionDate { get; set; }

    [StringLength(50)]
    public string Status { get; set; } = "Requested";

    [StringLength(200)]
    public string? ServiceProvider { get; set; }

    [StringLength(100)]
    public string? ContactPerson { get; set; }

    [StringLength(20)]
    public string? ContactPhone { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal? EstimatedCost { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal? ActualCost { get; set; }

    [StringLength(100)]
    public string? InvoiceNumber { get; set; }

    public DateTime? InvoiceDate { get; set; }

    [StringLength(2000)]
    public string? WorkPerformed { get; set; }

    [StringLength(1000)]
    public string? MaterialsUsed { get; set; }

    [StringLength(2000)]
    public string? Remarks { get; set; }

    [StringLength(100)]
    public string RequestedBy { get; set; } = string.Empty;

    [StringLength(100)]
    public string? ApprovedBy { get; set; }

    public DateTime? ApprovedDate { get; set; }

    [StringLength(100)]
    public string? CompletedBy { get; set; }

    [StringLength(500)]
    public string? AttachmentUrl { get; set; }

    public bool RequiresApproval { get; set; } = false;

    public bool IsRecurring { get; set; } = false;

    [StringLength(50)]
    public string? RecurrenceFrequency { get; set; }

    public DateTime? NextMaintenanceDate { get; set; }

    [ForeignKey("BuildingId")]
    public virtual HostelBuilding? Building { get; set; }

    [ForeignKey("RoomId")]
    public virtual HostelRoom? Room { get; set; }
}
