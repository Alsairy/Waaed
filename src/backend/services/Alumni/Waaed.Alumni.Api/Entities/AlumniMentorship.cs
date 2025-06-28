using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Waaed.Shared.Domain.Entities;

namespace Waaed.Alumni.Api.Entities;

[Table("AlumniMentorships")]
public class AlumniMentorship : BaseEntity
{
    [Key]
    public new Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public int MentorAlumniId { get; set; }

    [Required]
    public int MenteeAlumniId { get; set; }

    [Required]
    public DateTime StartDate { get; set; }

    public DateTime? EndDate { get; set; }

    [StringLength(50)]
    public string Status { get; set; } = "Active";

    [StringLength(100)]
    public string? MentorshipType { get; set; }

    [StringLength(100)]
    public string? FocusArea { get; set; }

    [StringLength(2000)]
    public string? Goals { get; set; }

    [StringLength(2000)]
    public string? Expectations { get; set; }

    [StringLength(100)]
    public string? MeetingFrequency { get; set; }

    [StringLength(100)]
    public string? PreferredCommunication { get; set; }

    public int TotalMeetings { get; set; } = 0;

    public DateTime? LastMeetingDate { get; set; }

    public DateTime? NextMeetingDate { get; set; }

    [StringLength(2000)]
    public string? Progress { get; set; }

    [StringLength(2000)]
    public string? Challenges { get; set; }

    [StringLength(2000)]
    public string? Achievements { get; set; }

    public int? MentorRating { get; set; }

    public int? MenteeRating { get; set; }

    [StringLength(2000)]
    public string? MentorFeedback { get; set; }

    [StringLength(2000)]
    public string? MenteeFeedback { get; set; }

    public bool IsCompleted { get; set; } = false;

    public DateTime? CompletedAt { get; set; }

    [StringLength(2000)]
    public string? CompletionNotes { get; set; }

    [StringLength(1000)]
    public string? InternalNotes { get; set; }

    [ForeignKey("MentorAlumniId")]
    public virtual Alumni MentorAlumni { get; set; } = null!;

    [ForeignKey("MenteeAlumniId")]
    public virtual Alumni MenteeAlumni { get; set; } = null!;

    public virtual ICollection<AlumniMentorshipSession> MentorshipSessions { get; set; } = new List<AlumniMentorshipSession>();
}
