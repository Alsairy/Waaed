using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Waaed.Shared.Domain.Entities;

namespace Waaed.Hostel.Api.Entities;

[Table("HostelBuildings")]
public class HostelBuilding : BaseEntity
{
    [Key]
    public new Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [StringLength(100)]
    public string BuildingName { get; set; } = string.Empty;

    [Required]
    [StringLength(50)]
    public string BuildingCode { get; set; } = string.Empty;

    [StringLength(500)]
    public string? Address { get; set; }

    [StringLength(1000)]
    public string? Description { get; set; }

    [Required]
    public int TotalFloors { get; set; }

    [Required]
    public int TotalRooms { get; set; }

    [Required]
    public int TotalCapacity { get; set; }

    public int CurrentOccupancy { get; set; } = 0;

    [StringLength(50)]
    public string BuildingType { get; set; } = "Mixed";

    [StringLength(50)]
    public string Status { get; set; } = "Active";

    [Required]
    public DateTime ConstructionDate { get; set; }

    public DateTime? LastRenovationDate { get; set; }

    [StringLength(100)]
    public string? WardenName { get; set; }

    [StringLength(20)]
    public string? WardenPhone { get; set; }

    [StringLength(200)]
    public string? WardenEmail { get; set; }

    [StringLength(100)]
    public string? AssistantWardenName { get; set; }

    [StringLength(20)]
    public string? AssistantWardenPhone { get; set; }

    [StringLength(200)]
    public string? AssistantWardenEmail { get; set; }

    public bool HasWifi { get; set; } = true;

    public bool HasLaundry { get; set; } = true;

    public bool HasCanteen { get; set; } = false;

    public bool HasLibrary { get; set; } = false;

    public bool HasGym { get; set; } = false;

    public bool HasCommonRoom { get; set; } = true;

    public bool HasSecurity { get; set; } = true;

    public bool HasCCTV { get; set; } = true;

    public bool HasGenerator { get; set; } = true;

    public bool HasElevator { get; set; } = false;

    [StringLength(1000)]
    public string? Facilities { get; set; }

    [StringLength(1000)]
    public string? Rules { get; set; }

    [StringLength(1000)]
    public string? Notes { get; set; }

    [StringLength(500)]
    public string? ImageUrl { get; set; }

    public bool IsActive { get; set; } = true;

    public virtual ICollection<HostelRoom> Rooms { get; set; } = new List<HostelRoom>();
    public virtual ICollection<HostelAllocation> Allocations { get; set; } = new List<HostelAllocation>();
    public virtual ICollection<HostelMaintenance> MaintenanceRecords { get; set; } = new List<HostelMaintenance>();
    public virtual ICollection<HostelVisitor> Visitors { get; set; } = new List<HostelVisitor>();
}
