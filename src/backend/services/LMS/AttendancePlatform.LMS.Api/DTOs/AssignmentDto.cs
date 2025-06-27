namespace AttendancePlatform.LMS.Api.DTOs;

public class AssignmentDto
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
    public string SubmissionType { get; set; } = string.Empty;
    public string AllowedFileTypes { get; set; } = string.Empty;
    public bool AllowLateSubmissions { get; set; }
    public int? LatePenaltyPercent { get; set; }
    public int MaxAttempts { get; set; }
    public string GradingType { get; set; } = string.Empty;
    public Guid? RubricId { get; set; }
    public bool PeerReviewEnabled { get; set; }
    public int PeerReviewCount { get; set; }
    public DateTime? PeerReviewDueDate { get; set; }
    public bool GroupAssignment { get; set; }
    public Guid? GroupSetId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    public int SubmissionCount { get; set; }
    public int GradedCount { get; set; }
}

public class CreateAssignmentDto
{
    public Guid CourseId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Instructions { get; set; } = string.Empty;
    public int Points { get; set; }
    public DateTime? DueDate { get; set; }
    public DateTime? AvailableFrom { get; set; }
    public DateTime? AvailableUntil { get; set; }
    public string SubmissionType { get; set; } = string.Empty;
    public string AllowedFileTypes { get; set; } = string.Empty;
    public bool AllowLateSubmissions { get; set; }
    public int? LatePenaltyPercent { get; set; }
    public int MaxAttempts { get; set; } = 1;
    public string GradingType { get; set; } = string.Empty;
    public Guid? RubricId { get; set; }
    public bool PeerReviewEnabled { get; set; }
    public int PeerReviewCount { get; set; }
    public DateTime? PeerReviewDueDate { get; set; }
    public bool GroupAssignment { get; set; }
    public Guid? GroupSetId { get; set; }
}

public class UpdateAssignmentDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Instructions { get; set; } = string.Empty;
    public int Points { get; set; }
    public DateTime? DueDate { get; set; }
    public DateTime? AvailableFrom { get; set; }
    public DateTime? AvailableUntil { get; set; }
    public bool AllowLateSubmissions { get; set; }
    public int? LatePenaltyPercent { get; set; }
    public int MaxAttempts { get; set; }
    public Guid? RubricId { get; set; }
}

public class AssignmentListDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public int Points { get; set; }
    public DateTime? DueDate { get; set; }
    public string GradingType { get; set; } = string.Empty;
    public int SubmissionCount { get; set; }
    public int GradedCount { get; set; }
    public DateTime UpdatedAt { get; set; }
}
