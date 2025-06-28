using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Waaed.Shared.Domain.Entities;

namespace Waaed.Hostel.Api.Entities;

[Table("HostelRooms")]
public class HostelRoom : BaseEntity
{
    [Key]
    public new Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public int BuildingId { get; set; }

    [Required]
    [StringLength(50)]
    public string RoomNumber { get; set; } = string.Empty;

    [Required]
    public int FloorNumber { get; set; }

    [Required]
    [StringLength(50)]
    public string RoomType { get; set; } = string.Empty;

    [Required]
    public int Capacity { get; set; }

    public int CurrentOccupancy { get; set; } = 0;

    [StringLength(50)]
    public string Status { get; set; } = "Available";

    [Column(TypeName = "decimal(18,2)")]
    public decimal RentAmount { get; set; }

    [StringLength(50)]
    public string? RentFrequency { get; set; }

    [Column(TypeName = "decimal(10,2)")]
    public decimal? RoomArea { get; set; }

    public bool HasAttachedBathroom { get; set; } = true;

    public bool HasBalcony { get; set; } = false;

    public bool HasAC { get; set; } = false;

    public bool HasFan { get; set; } = true;

    public bool HasStudyTable { get; set; } = true;

    public bool HasWardrobe { get; set; } = true;

    public bool HasBed { get; set; } = true;

    public bool HasChair { get; set; } = true;

    public bool HasWifi { get; set; } = true;

    [StringLength(1000)]
    public string? Furnishing { get; set; }

    [StringLength(1000)]
    public string? Amenities { get; set; }

    [StringLength(1000)]
    public string? Description { get; set; }

    [StringLength(1000)]
    public string? Notes { get; set; }

    public DateTime? LastCleaningDate { get; set; }

    public DateTime? LastMaintenanceDate { get; set; }

    [StringLength(500)]
    public string? ImageUrl { get; set; }

    public bool IsActive { get; set; } = true;

    [ForeignKey("BuildingId")]
    public virtual HostelBuilding Building { get; set; } = null!;

    public virtual ICollection<HostelAllocation> Allocations { get; set; } = new List<HostelAllocation>();
    public virtual ICollection<HostelMaintenance> MaintenanceRecords { get; set; } = new List<HostelMaintenance>();
    public virtual ICollection<HostelComplaint> Complaints { get; set; } = new List<HostelComplaint>();
}
