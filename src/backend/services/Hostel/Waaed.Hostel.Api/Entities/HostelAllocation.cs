using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Waaed.Shared.Domain.Entities;

namespace Waaed.Hostel.Api.Entities;

[Table("HostelAllocations")]
public class HostelAllocation : BaseEntity
{
    [Key]
    public new Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public int StudentId { get; set; }

    [Required]
    public int BuildingId { get; set; }

    [Required]
    public int RoomId { get; set; }

    [Required]
    public DateTime AllocationDate { get; set; }

    public DateTime? CheckInDate { get; set; }

    public DateTime? CheckOutDate { get; set; }

    public DateTime? ExpectedCheckOutDate { get; set; }

    [StringLength(50)]
    public string Status { get; set; } = "Allocated";

    [StringLength(50)]
    public string AllocationType { get; set; } = "Regular";

    [Column(TypeName = "decimal(18,2)")]
    public decimal SecurityDeposit { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal? SecurityDepositPaid { get; set; }

    public DateTime? SecurityDepositPaidDate { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal MonthlyRent { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal? LastRentPaid { get; set; }

    public DateTime? LastRentPaidDate { get; set; }

    public DateTime? NextRentDueDate { get; set; }

    [StringLength(50)]
    public string PaymentStatus { get; set; } = "Pending";

    [StringLength(200)]
    public string? ParentContactName { get; set; }

    [StringLength(20)]
    public string? ParentContactPhone { get; set; }

    [StringLength(200)]
    public string? EmergencyContactName { get; set; }

    [StringLength(20)]
    public string? EmergencyContactPhone { get; set; }

    [StringLength(100)]
    public string? EmergencyContactRelation { get; set; }

    [StringLength(500)]
    public string? LocalGuardianName { get; set; }

    [StringLength(20)]
    public string? LocalGuardianPhone { get; set; }

    [StringLength(500)]
    public string? LocalGuardianAddress { get; set; }

    [StringLength(1000)]
    public string? SpecialRequirements { get; set; }

    [StringLength(1000)]
    public string? MedicalConditions { get; set; }

    [StringLength(1000)]
    public string? AllocationRemarks { get; set; }

    [StringLength(1000)]
    public string? CheckInRemarks { get; set; }

    [StringLength(1000)]
    public string? CheckOutRemarks { get; set; }

    [StringLength(100)]
    public string AllocatedBy { get; set; } = string.Empty;

    [StringLength(100)]
    public string? CheckedInBy { get; set; }

    [StringLength(100)]
    public string? CheckedOutBy { get; set; }

    public bool IsActive { get; set; } = true;

    [ForeignKey("BuildingId")]
    public virtual HostelBuilding Building { get; set; } = null!;

    [ForeignKey("RoomId")]
    public virtual HostelRoom Room { get; set; } = null!;

    public virtual ICollection<HostelFeePayment> FeePayments { get; set; } = new List<HostelFeePayment>();
    public virtual ICollection<HostelComplaint> Complaints { get; set; } = new List<HostelComplaint>();
}
