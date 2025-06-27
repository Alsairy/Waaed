namespace Waaed.LMS.Api.Entities;

public class Conference
{
    public Guid Id { get; set; }
    public Guid CourseId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public ConferenceType Type { get; set; }
    public DateTime ScheduledStart { get; set; }
    public DateTime ScheduledEnd { get; set; }
    public DateTime? ActualStart { get; set; }
    public DateTime? ActualEnd { get; set; }
    public ConferenceStatus Status { get; set; }
    public string MeetingId { get; set; } = string.Empty;
    public string ModeratorPassword { get; set; } = string.Empty;
    public string AttendeePassword { get; set; } = string.Empty;
    public string JoinUrl { get; set; } = string.Empty;
    public string ModeratorUrl { get; set; } = string.Empty;
    public bool RecordingEnabled { get; set; }
    public string RecordingUrl { get; set; } = string.Empty;
    public bool IsRecurring { get; set; }
    public string RecurrencePattern { get; set; } = string.Empty;
    public int MaxParticipants { get; set; }
    public bool RequireModeratorApproval { get; set; }
    public bool MuteOnStart { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public string CreatedBy { get; set; } = string.Empty;

    public virtual Course Course { get; set; } = null!;
    public virtual ICollection<ConferenceParticipant> Participants { get; set; } = new List<ConferenceParticipant>();
    public virtual ICollection<ConferenceRecording> Recordings { get; set; } = new List<ConferenceRecording>();
}

public class ConferenceParticipant
{
    public Guid Id { get; set; }
    public Guid ConferenceId { get; set; }
    public string UserId { get; set; } = string.Empty;
    public ParticipantRole Role { get; set; }
    public DateTime? JoinedAt { get; set; }
    public DateTime? LeftAt { get; set; }
    public int Duration { get; set; } // in seconds
    public bool IsPresent { get; set; }

    public virtual Conference Conference { get; set; } = null!;
}

public class ConferenceRecording
{
    public Guid Id { get; set; }
    public Guid ConferenceId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public string PlaybackUrl { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public int Duration { get; set; } // in seconds
    public RecordingFormat Format { get; set; }
    public bool IsPublished { get; set; }
    public DateTime RecordedAt { get; set; }
    public DateTime? PublishedAt { get; set; }

    public virtual Conference Conference { get; set; } = null!;
}

public enum ConferenceType
{
    BigBlueButton,
    Zoom,
    Teams,
    WebEx,
    GoogleMeet
}

public enum ConferenceStatus
{
    Scheduled,
    InProgress,
    Completed,
    Cancelled
}

public enum ParticipantRole
{
    Moderator,
    Presenter,
    Attendee
}

public enum RecordingFormat
{
    MP4,
    WebM,
    Audio
}
