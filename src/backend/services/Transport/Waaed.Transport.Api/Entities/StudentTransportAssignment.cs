using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Waaed.Shared.Domain.Entities;

namespace Waaed.Transport.Api.Entities;

[Table("StudentTransportAssignments")]
public class StudentTransportAssignment : BaseEntity
{
    [Key]
    public new Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public int StudentId { get; set; }

    [Required]
    public int RouteId { get; set; }

    [Required]
    public int PickupStopId { get; set; }

    [Required]
    public int DropStopId { get; set; }

    [Required]
    public DateTime AssignmentDate { get; set; }

    public DateTime? UnassignmentDate { get; set; }

    [StringLength(50)]
    public string Status { get; set; } = "Active";

    [Column(TypeName = "decimal(18,2)")]
    public decimal MonthlyFee { get; set; }

    [StringLength(50)]
    public string PaymentStatus { get; set; } = "Pending";

    public DateTime? LastPaymentDate { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal? PaidAmount { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal? PendingAmount { get; set; }

    [StringLength(200)]
    public string? ParentContactName { get; set; }

    [StringLength(20)]
    public string? ParentContactPhone { get; set; }

    [StringLength(200)]
    public string? EmergencyContactName { get; set; }

    [StringLength(20)]
    public string? EmergencyContactPhone { get; set; }

    [StringLength(1000)]
    public string? SpecialInstructions { get; set; }

    [StringLength(1000)]
    public string? MedicalConditions { get; set; }

    public bool RequiresSpecialAssistance { get; set; } = false;

    public bool IsActive { get; set; } = true;

    [StringLength(1000)]
    public string? Notes { get; set; }

    [StringLength(100)]
    public string AssignedBy { get; set; } = string.Empty;

    public DateTime? LastModified { get; set; }

    [StringLength(100)]
    public string? ModifiedBy { get; set; }

    [ForeignKey("RouteId")]
    public virtual Route Route { get; set; } = null!;

    [ForeignKey("PickupStopId")]
    public virtual RouteStop PickupStop { get; set; } = null!;

    [ForeignKey("DropStopId")]
    public virtual RouteStop DropStop { get; set; } = null!;

    public virtual ICollection<StudentAttendanceRecord> AttendanceRecords { get; set; } = new List<StudentAttendanceRecord>();
}
