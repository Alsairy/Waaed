namespace AttendancePlatform.LMS.Api.Entities;

public class Submission
{
    public Guid Id { get; set; }
    public Guid AssignmentId { get; set; }
    public string StudentId { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string AttachmentUrls { get; set; } = string.Empty;
    public string ExternalUrl { get; set; } = string.Empty;
    public SubmissionStatus Status { get; set; }
    public DateTime SubmittedAt { get; set; }
    public bool IsLate { get; set; }
    public int AttemptNumber { get; set; }
    public string WorkflowState { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public virtual Assignment Assignment { get; set; } = null!;
    public virtual ICollection<SubmissionComment> Comments { get; set; } = new List<SubmissionComment>();
    public virtual Grade? Grade { get; set; }
}

public class SubmissionComment
{
    public Guid Id { get; set; }
    public Guid SubmissionId { get; set; }
    public string AuthorId { get; set; } = string.Empty;
    public string Comment { get; set; } = string.Empty;
    public string AttachmentUrls { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }

    public virtual Submission Submission { get; set; } = null!;
}

public enum SubmissionStatus
{
    Unsubmitted,
    Submitted,
    Graded,
    Returned
}
