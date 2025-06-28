using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Waaed.Shared.Domain.Entities;

namespace Waaed.Alumni.Api.Entities;

[Table("AlumniEvents")]
public class AlumniEvent : BaseEntity
{
    [Key]
    public new Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [StringLength(200)]
    public string Title { get; set; } = string.Empty;

    [StringLength(2000)]
    public string? Description { get; set; }

    [Required]
    public DateTime StartDate { get; set; }

    public DateTime? EndDate { get; set; }

    [StringLength(500)]
    public string? Location { get; set; }

    [StringLength(500)]
    public string? VirtualMeetingLink { get; set; }

    [StringLength(50)]
    public string EventType { get; set; } = "General";

    [StringLength(50)]
    public string Status { get; set; } = "Planned";

    public int MaxAttendees { get; set; } = 0;

    public int CurrentAttendees { get; set; } = 0;

    [Column(TypeName = "decimal(18,2)")]
    public decimal? RegistrationFee { get; set; }

    public DateTime? RegistrationDeadline { get; set; }

    public bool RequiresApproval { get; set; } = false;

    public bool IsPublic { get; set; } = true;

    public bool IsFeatured { get; set; } = false;

    [StringLength(500)]
    public string? ImageUrl { get; set; }

    [StringLength(2000)]
    public string? Agenda { get; set; }

    [StringLength(1000)]
    public string? Prerequisites { get; set; }

    [StringLength(1000)]
    public string? ContactInfo { get; set; }

    [StringLength(100)]
    public string? OrganizedBy { get; set; }

    public int OrganizerId { get; set; }

    [StringLength(50)]
    public string? Category { get; set; }

    [StringLength(1000)]
    public string? Tags { get; set; }

    public bool SendReminders { get; set; } = true;

    public DateTime? ReminderSentAt { get; set; }

    public virtual ICollection<AlumniEventRegistration> EventRegistrations { get; set; } = new List<AlumniEventRegistration>();
}
