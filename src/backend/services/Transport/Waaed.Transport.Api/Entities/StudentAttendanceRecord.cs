using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Waaed.Shared.Domain.Entities;

namespace Waaed.Transport.Api.Entities;

[Table("StudentAttendanceRecords")]
public class StudentAttendanceRecord : BaseEntity
{
    [Key]
    public new Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public int TripRecordId { get; set; }

    [Required]
    public int StudentTransportAssignmentId { get; set; }

    [Required]
    public DateTime AttendanceDate { get; set; }

    [StringLength(50)]
    public string AttendanceType { get; set; } = string.Empty;

    public DateTime? PickupTime { get; set; }

    public DateTime? DropTime { get; set; }

    [StringLength(50)]
    public string Status { get; set; } = "Present";

    public bool WasPickedUp { get; set; } = false;

    public bool WasDropped { get; set; } = false;

    [StringLength(1000)]
    public string? Remarks { get; set; }

    [StringLength(100)]
    public string? RecordedBy { get; set; }

    public DateTime? LastModified { get; set; }

    [StringLength(100)]
    public string? ModifiedBy { get; set; }

    [ForeignKey("TripRecordId")]
    public virtual TripRecord TripRecord { get; set; } = null!;

    [ForeignKey("StudentTransportAssignmentId")]
    public virtual StudentTransportAssignment StudentTransportAssignment { get; set; } = null!;
}
