using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Waaed.Shared.Domain.Entities;

namespace Waaed.Alumni.Api.Entities;

[Table("AlumniMentorshipSessions")]
public class AlumniMentorshipSession : BaseEntity
{
    [Key]
    public new Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public int MentorshipId { get; set; }

    [Required]
    public DateTime ScheduledDate { get; set; }

    public DateTime? ActualStartTime { get; set; }

    public DateTime? ActualEndTime { get; set; }

    [StringLength(50)]
    public string Status { get; set; } = "Scheduled";

    [StringLength(100)]
    public string? SessionType { get; set; }

    [StringLength(500)]
    public string? Location { get; set; }

    [StringLength(500)]
    public string? MeetingLink { get; set; }

    [StringLength(2000)]
    public string? Agenda { get; set; }

    [StringLength(2000)]
    public string? Notes { get; set; }

    [StringLength(2000)]
    public string? ActionItems { get; set; }

    [StringLength(2000)]
    public string? NextSteps { get; set; }

    public int? MentorRating { get; set; }

    public int? MenteeRating { get; set; }

    [StringLength(1000)]
    public string? MentorFeedback { get; set; }

    [StringLength(1000)]
    public string? MenteeFeedback { get; set; }

    public bool WasCancelled { get; set; } = false;

    [StringLength(500)]
    public string? CancellationReason { get; set; }

    public DateTime? CancelledAt { get; set; }

    [StringLength(100)]
    public string? CancelledBy { get; set; }

    public bool WasRescheduled { get; set; } = false;

    public DateTime? RescheduledFrom { get; set; }

    [StringLength(500)]
    public string? RescheduleReason { get; set; }

    [ForeignKey("MentorshipId")]
    public virtual AlumniMentorship Mentorship { get; set; } = null!;
}
