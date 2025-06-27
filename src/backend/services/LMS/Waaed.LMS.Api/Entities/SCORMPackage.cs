namespace AttendancePlatform.LMS.Api.Entities;

public class SCORMPackage
{
    public Guid Id { get; set; }
    public Guid CourseId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
    public string ManifestPath { get; set; } = string.Empty;
    public SCORMVersion Version { get; set; }
    public string Identifier { get; set; } = string.Empty;
    public bool IsGraded { get; set; }
    public int Points { get; set; }
    public DateTime? DueDate { get; set; }
    public DateTime? AvailableFrom { get; set; }
    public DateTime? AvailableUntil { get; set; }
    public int MaxAttempts { get; set; } = -1; // -1 = unlimited
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public string CreatedBy { get; set; } = string.Empty;

    public virtual Course Course { get; set; } = null!;
    public virtual ICollection<SCORMAttempt> Attempts { get; set; } = new List<SCORMAttempt>();
}

public class SCORMAttempt
{
    public Guid Id { get; set; }
    public Guid SCORMPackageId { get; set; }
    public string StudentId { get; set; } = string.Empty;
    public int AttemptNumber { get; set; }
    public SCORMStatus Status { get; set; }
    public decimal? Score { get; set; }
    public string CompletionStatus { get; set; } = string.Empty;
    public string SuccessStatus { get; set; } = string.Empty;
    public int TimeSpent { get; set; } // in seconds
    public string SuspendData { get; set; } = string.Empty;
    public DateTime StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public DateTime LastAccessed { get; set; }

    public virtual SCORMPackage SCORMPackage { get; set; } = null!;
    public virtual ICollection<SCORMInteraction> Interactions { get; set; } = new List<SCORMInteraction>();
}

public class SCORMInteraction
{
    public Guid Id { get; set; }
    public Guid SCORMAttemptId { get; set; }
    public string InteractionId { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string StudentResponse { get; set; } = string.Empty;
    public string CorrectResponse { get; set; } = string.Empty;
    public string Result { get; set; } = string.Empty;
    public decimal? Weighting { get; set; }
    public int? Latency { get; set; }
    public DateTime Timestamp { get; set; }

    public virtual SCORMAttempt SCORMAttempt { get; set; } = null!;
}

public enum SCORMVersion
{
    SCORM12,
    SCORM2004
}

public enum SCORMStatus
{
    NotAttempted,
    Incomplete,
    Completed,
    Passed,
    Failed,
    Browsed
}
