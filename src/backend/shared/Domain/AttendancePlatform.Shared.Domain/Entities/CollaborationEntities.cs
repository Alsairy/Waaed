using System.ComponentModel.DataAnnotations;

namespace AttendancePlatform.Shared.Domain.Entities
{
    public class Team : BaseEntity
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(500)]
        public string Description { get; set; } = string.Empty;

        public Guid CreatedById { get; set; }
        public new DateTime CreatedAt { get; set; }
        public bool IsActive { get; set; } = true;

        public new virtual User CreatedBy { get; set; } = null!;
        public virtual ICollection<TeamMember> Members { get; set; } = new List<TeamMember>();
        public virtual ICollection<TeamProject> Projects { get; set; } = new List<TeamProject>();
    }

    public class TeamMember : BaseEntity
    {
        public Guid TeamId { get; set; }
        public Guid UserId { get; set; }

        [Required]
        [MaxLength(50)]
        public string Role { get; set; } = "Member";

        public DateTime JoinedAt { get; set; }
        public bool IsActive { get; set; } = true;

        public virtual Team Team { get; set; } = null!;
        public virtual User User { get; set; } = null!;
    }

    public class TeamProject : BaseEntity
    {
        public Guid TeamId { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string Description { get; set; } = string.Empty;

        public Guid CreatedById { get; set; }
        public new DateTime CreatedAt { get; set; }

        [MaxLength(20)]
        public string Status { get; set; } = "Active";

        [MaxLength(20)]
        public string Priority { get; set; } = "Medium";

        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }

        public virtual Team Team { get; set; } = null!;
        public new virtual User CreatedBy { get; set; } = null!;
        public virtual ICollection<ProjectMember> ProjectMembers { get; set; } = new List<ProjectMember>();
    }

    public class ProjectMember : BaseEntity
    {
        public Guid ProjectId { get; set; }
        public Guid UserId { get; set; }

        [MaxLength(50)]
        public string Role { get; set; } = "Contributor";

        public DateTime AssignedAt { get; set; }
        public bool IsActive { get; set; } = true;

        public virtual TeamProject Project { get; set; } = null!;
        public virtual User User { get; set; } = null!;
    }

    public class VideoConference : BaseEntity
    {
        [Required]
        [MaxLength(100)]
        public string Title { get; set; } = string.Empty;

        [MaxLength(500)]
        public string Description { get; set; } = string.Empty;

        public Guid HostId { get; set; }
        public DateTime ScheduledStartTime { get; set; }
        public DateTime? ActualStartTime { get; set; }
        public DateTime? EndTime { get; set; }

        [MaxLength(20)]
        public string Status { get; set; } = "Scheduled";

        [MaxLength(200)]
        public string MeetingUrl { get; set; } = string.Empty;

        [MaxLength(50)]
        public string MeetingId { get; set; } = string.Empty;

        [MaxLength(100)]
        public string Passcode { get; set; } = string.Empty;

        public int MaxParticipants { get; set; } = 100;
        public bool IsRecorded { get; set; } = false;

        public virtual User Host { get; set; } = null!;
        public virtual ICollection<ConferenceParticipant> Participants { get; set; } = new List<ConferenceParticipant>();
    }

    public class ConferenceParticipant : BaseEntity
    {
        public Guid ConferenceId { get; set; }
        public Guid UserId { get; set; }

        public DateTime JoinedAt { get; set; }
        public DateTime? LeftAt { get; set; }

        [MaxLength(20)]
        public string Role { get; set; } = "Participant";

        public bool IsMuted { get; set; } = false;
        public bool IsVideoEnabled { get; set; } = true;

        public virtual VideoConference Conference { get; set; } = null!;
        public virtual User User { get; set; } = null!;
    }

    public class ChatMessage : BaseEntity
    {
        public Guid SenderId { get; set; }
        public Guid? ChannelId { get; set; }
        public Guid? ConferenceId { get; set; }

        [Required]
        [MaxLength(2000)]
        public string Content { get; set; } = string.Empty;

        [MaxLength(20)]
        public string MessageType { get; set; } = "Text";

        public DateTime SentAt { get; set; }
        public bool IsEdited { get; set; } = false;
        public DateTime? EditedAt { get; set; }

        public virtual User Sender { get; set; } = null!;
        public virtual ChatChannel? Channel { get; set; }
        public virtual VideoConference? Conference { get; set; }
    }

    public class ChatChannel : BaseEntity
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(500)]
        public string Description { get; set; } = string.Empty;

        public Guid? TeamId { get; set; }
        public Guid CreatedById { get; set; }
        public new DateTime CreatedAt { get; set; }

        [MaxLength(20)]
        public string ChannelType { get; set; } = "Public";

        public bool IsActive { get; set; } = true;

        public virtual Team? Team { get; set; }
        public new virtual User CreatedBy { get; set; } = null!;
        public virtual ICollection<ChatMessage> Messages { get; set; } = new List<ChatMessage>();
        public virtual ICollection<ChannelMember> Members { get; set; } = new List<ChannelMember>();
    }

    public class ChannelMember : BaseEntity
    {
        public Guid ChannelId { get; set; }
        public Guid UserId { get; set; }

        [MaxLength(20)]
        public string Role { get; set; } = "Member";

        public DateTime JoinedAt { get; set; }
        public bool IsActive { get; set; } = true;

        public virtual ChatChannel Channel { get; set; } = null!;
        public virtual User User { get; set; } = null!;
    }

    public class Document : BaseEntity
    {
        [Required]
        [MaxLength(200)]
        public string FileName { get; set; } = string.Empty;

        [MaxLength(500)]
        public string FilePath { get; set; } = string.Empty;

        [MaxLength(50)]
        public string FileType { get; set; } = string.Empty;

        public long FileSize { get; set; }

        public Guid UploadedById { get; set; }
        public DateTime UploadedAt { get; set; }

        public Guid? TeamId { get; set; }
        public Guid? ProjectId { get; set; }

        [MaxLength(20)]
        public string Status { get; set; } = "Active";

        public int Version { get; set; } = 1;
        public bool IsShared { get; set; } = false;

        public virtual User UploadedBy { get; set; } = null!;
        public virtual Team? Team { get; set; }
        public virtual TeamProject? Project { get; set; }
        public virtual ICollection<DocumentVersion> Versions { get; set; } = new List<DocumentVersion>();
    }

    public class DocumentVersion : BaseEntity
    {
        public Guid DocumentId { get; set; }
        public int VersionNumber { get; set; }

        [MaxLength(500)]
        public string FilePath { get; set; } = string.Empty;

        public Guid CreatedById { get; set; }
        public new DateTime CreatedAt { get; set; }

        [MaxLength(500)]
        public string ChangeDescription { get; set; } = string.Empty;

        public long FileSize { get; set; }

        public virtual Document Document { get; set; } = null!;
        public new virtual User CreatedBy { get; set; } = null!;
    }

    public class ScreenSharingSession : BaseEntity
    {
        public Guid HostId { get; set; }
        public Guid? ConferenceId { get; set; }

        [Required]
        [MaxLength(100)]
        public string SessionName { get; set; } = string.Empty;

        public DateTime StartedAt { get; set; }
        public DateTime? EndedAt { get; set; }

        [MaxLength(20)]
        public string Status { get; set; } = "Active";

        [MaxLength(200)]
        public string StreamUrl { get; set; } = string.Empty;

        public bool IsRecorded { get; set; } = false;

        public virtual User Host { get; set; } = null!;
        public virtual VideoConference? Conference { get; set; }
        public virtual ICollection<ScreenSharingParticipant> Participants { get; set; } = new List<ScreenSharingParticipant>();
    }

    public class ScreenSharingParticipant : BaseEntity
    {
        public Guid SessionId { get; set; }
        public Guid UserId { get; set; }

        public DateTime JoinedAt { get; set; }
        public DateTime? LeftAt { get; set; }

        [MaxLength(20)]
        public string Permission { get; set; } = "View";

        public virtual ScreenSharingSession Session { get; set; } = null!;
        public virtual User User { get; set; } = null!;
    }

    public class UserPresence : BaseEntity
    {
        public Guid UserId { get; set; }

        [MaxLength(20)]
        public string Status { get; set; } = "Offline";

        [MaxLength(100)]
        public string StatusMessage { get; set; } = string.Empty;

        public DateTime LastSeen { get; set; }
        public DateTime LastActivity { get; set; }

        public bool IsOnline { get; set; } = false;
        public bool IsAvailable { get; set; } = true;

        public virtual User User { get; set; } = null!;
    }
}
