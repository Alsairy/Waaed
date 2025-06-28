namespace Waaed.LMS.Api.DTOs;

public class LTIToolDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string LaunchUrl { get; set; } = string.Empty;
    public string ConsumerKey { get; set; } = string.Empty;
    public string Version { get; set; } = string.Empty;
    public string ClientId { get; set; } = string.Empty;
    public string DeploymentId { get; set; } = string.Empty;
    public string KeysetUrl { get; set; } = string.Empty;
    public string AuthTokenUrl { get; set; } = string.Empty;
    public string AuthLoginUrl { get; set; } = string.Empty;
    public string TargetLinkUri { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public string TenantId { get; set; } = string.Empty;
    public string Placements { get; set; } = string.Empty;
    public string CustomFields { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    public int LaunchCount { get; set; }
}

public class CreateLTIToolDto
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string LaunchUrl { get; set; } = string.Empty;
    public string ConsumerKey { get; set; } = string.Empty;
    public string SharedSecret { get; set; } = string.Empty;
    public string Version { get; set; } = string.Empty;
    public string ClientId { get; set; } = string.Empty;
    public string DeploymentId { get; set; } = string.Empty;
    public string KeysetUrl { get; set; } = string.Empty;
    public string AuthTokenUrl { get; set; } = string.Empty;
    public string AuthLoginUrl { get; set; } = string.Empty;
    public string TargetLinkUri { get; set; } = string.Empty;
    public string Placements { get; set; } = string.Empty;
    public string CustomFields { get; set; } = string.Empty;
}

public class SCORMPackageDto
{
    public Guid Id { get; set; }
    public Guid CourseId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
    public string ManifestPath { get; set; } = string.Empty;
    public string Version { get; set; } = string.Empty;
    public string Identifier { get; set; } = string.Empty;
    public bool IsGraded { get; set; }
    public int Points { get; set; }
    public DateTime? DueDate { get; set; }
    public DateTime? AvailableFrom { get; set; }
    public DateTime? AvailableUntil { get; set; }
    public int MaxAttempts { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    public int AttemptCount { get; set; }
}

public class ConferenceDto
{
    public Guid Id { get; set; }
    public Guid CourseId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public DateTime ScheduledStart { get; set; }
    public DateTime ScheduledEnd { get; set; }
    public DateTime? ActualStart { get; set; }
    public DateTime? ActualEnd { get; set; }
    public string Status { get; set; } = string.Empty;
    public string MeetingId { get; set; } = string.Empty;
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
    public int ParticipantCount { get; set; }
}

public class CourseTemplateDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public bool IsPublic { get; set; }
    public string TenantId { get; set; } = string.Empty;
    public string CourseStructure { get; set; } = string.Empty;
    public string DefaultSettings { get; set; } = string.Empty;
    public string Tags { get; set; } = string.Empty;
    public int UsageCount { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
}
