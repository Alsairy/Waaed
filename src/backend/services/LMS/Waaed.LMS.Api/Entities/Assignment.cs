namespace AttendancePlatform.LMS.Api.Entities;

public class Assignment
{
    public Guid Id { get; set; }
    public Guid CourseId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Instructions { get; set; } = string.Empty;
    public int Points { get; set; }
    public DateTime? DueDate { get; set; }
    public DateTime? AvailableFrom { get; set; }
    public DateTime? AvailableUntil { get; set; }
    public AssignmentSubmissionType SubmissionType { get; set; }
    public string AllowedFileTypes { get; set; } = string.Empty;
    public bool AllowLateSubmissions { get; set; }
    public int? LatePenaltyPercent { get; set; }
    public int MaxAttempts { get; set; } = 1;
    public GradingType GradingType { get; set; }
    public Guid? RubricId { get; set; }
    public bool PeerReviewEnabled { get; set; }
    public int PeerReviewCount { get; set; }
    public DateTime? PeerReviewDueDate { get; set; }
    public bool GroupAssignment { get; set; }
    public Guid? GroupSetId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public string CreatedBy { get; set; } = string.Empty;

    public virtual Course Course { get; set; } = null!;
    public virtual Rubric? Rubric { get; set; }
    public virtual ICollection<Submission> Submissions { get; set; } = new List<Submission>();
    public virtual ICollection<OutcomeAlignment> OutcomeAlignments { get; set; } = new List<OutcomeAlignment>();
}

public enum AssignmentSubmissionType
{
    OnlineTextEntry,
    OnlineUpload,
    OnlineUrl,
    MediaRecording,
    ExternalTool,
    OnPaper,
    NoSubmission
}

public enum GradingType
{
    Points,
    Percentage,
    LetterGrade,
    PassFail,
    NotGraded
}
