using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Waaed.Shared.Domain.Entities;

namespace Waaed.Hostel.Api.Entities;

[Table("HostelVisitors")]
public class HostelVisitor : BaseEntity
{
    [Key]
    public new Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public int BuildingId { get; set; }

    [Required]
    public int AllocationId { get; set; }

    [Required]
    [StringLength(100)]
    public string VisitorName { get; set; } = string.Empty;

    [StringLength(20)]
    public string? VisitorPhone { get; set; }

    [StringLength(200)]
    public string? VisitorEmail { get; set; }

    [StringLength(100)]
    public string? RelationToStudent { get; set; }

    [StringLength(500)]
    public string? VisitorAddress { get; set; }

    [StringLength(50)]
    public string? IdentificationType { get; set; }

    [StringLength(100)]
    public string? IdentificationNumber { get; set; }

    [Required]
    public DateTime VisitDate { get; set; }

    [Required]
    public DateTime CheckInTime { get; set; }

    public DateTime? CheckOutTime { get; set; }

    [StringLength(50)]
    public string Status { get; set; } = "CheckedIn";

    [StringLength(1000)]
    public string? PurposeOfVisit { get; set; }

    [StringLength(1000)]
    public string? ItemsCarried { get; set; }

    [StringLength(100)]
    public string? VehicleNumber { get; set; }

    [StringLength(50)]
    public string? VehicleType { get; set; }

    [StringLength(100)]
    public string CheckedInBy { get; set; } = string.Empty;

    [StringLength(100)]
    public string? CheckedOutBy { get; set; }

    [StringLength(1000)]
    public string? Remarks { get; set; }

    [StringLength(500)]
    public string? PhotoUrl { get; set; }

    public bool IsApproved { get; set; } = false;

    [StringLength(100)]
    public string? ApprovedBy { get; set; }

    public DateTime? ApprovedDate { get; set; }

    public bool RequiresEscort { get; set; } = false;

    [StringLength(100)]
    public string? EscortedBy { get; set; }

    public bool IsOvernight { get; set; } = false;

    public DateTime? ExpectedCheckOutTime { get; set; }

    [ForeignKey("BuildingId")]
    public virtual HostelBuilding Building { get; set; } = null!;

    [ForeignKey("AllocationId")]
    public virtual HostelAllocation Allocation { get; set; } = null!;
}
