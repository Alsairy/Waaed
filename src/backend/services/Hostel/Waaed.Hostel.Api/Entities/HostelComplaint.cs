using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Waaed.Shared.Domain.Entities;

namespace Waaed.Hostel.Api.Entities;

[Table("HostelComplaints")]
public class HostelComplaint : BaseEntity
{
    [Key]
    public new Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public int AllocationId { get; set; }

    public int? RoomId { get; set; }

    public int? BuildingId { get; set; }

    [Required]
    [StringLength(200)]
    public string Subject { get; set; } = string.Empty;

    [Required]
    [StringLength(2000)]
    public string Description { get; set; } = string.Empty;

    [Required]
    [StringLength(50)]
    public string Category { get; set; } = string.Empty;

    [Required]
    [StringLength(50)]
    public string Priority { get; set; } = "Medium";

    [Required]
    public DateTime ComplaintDate { get; set; }

    [StringLength(50)]
    public string Status { get; set; } = "Open";

    public DateTime? AssignedDate { get; set; }

    [StringLength(100)]
    public string? AssignedTo { get; set; }

    public DateTime? ResolvedDate { get; set; }

    [StringLength(100)]
    public string? ResolvedBy { get; set; }

    [StringLength(2000)]
    public string? Resolution { get; set; }

    [StringLength(2000)]
    public string? ResolutionRemarks { get; set; }

    public DateTime? ClosedDate { get; set; }

    [StringLength(100)]
    public string? ClosedBy { get; set; }

    [StringLength(1000)]
    public string? ClosingRemarks { get; set; }

    public int? SatisfactionRating { get; set; }

    [StringLength(1000)]
    public string? StudentFeedback { get; set; }

    [StringLength(500)]
    public string? AttachmentUrl { get; set; }

    [StringLength(1000)]
    public string? InternalNotes { get; set; }

    public bool IsAnonymous { get; set; } = false;

    public bool RequiresFollowUp { get; set; } = false;

    public DateTime? FollowUpDate { get; set; }

    [ForeignKey("AllocationId")]
    public virtual HostelAllocation Allocation { get; set; } = null!;

    [ForeignKey("RoomId")]
    public virtual HostelRoom? Room { get; set; }

    [ForeignKey("BuildingId")]
    public virtual HostelBuilding? Building { get; set; }
}
