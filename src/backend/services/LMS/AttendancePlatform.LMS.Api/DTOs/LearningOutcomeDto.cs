namespace AttendancePlatform.LMS.Api.DTOs;

public class LearningOutcomeDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string Scope { get; set; } = string.Empty;
    public string ScopeId { get; set; } = string.Empty;
    public decimal MasteryThreshold { get; set; }
    public string MasteryScale { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    public int AlignmentCount { get; set; }
    public int ResultCount { get; set; }
}

public class CreateLearningOutcomeDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string Scope { get; set; } = string.Empty;
    public string ScopeId { get; set; } = string.Empty;
    public decimal MasteryThreshold { get; set; }
    public string MasteryScale { get; set; } = string.Empty;
}

public class OutcomeResultDto
{
    public Guid Id { get; set; }
    public Guid LearningOutcomeId { get; set; }
    public string StudentId { get; set; } = string.Empty;
    public string CourseId { get; set; } = string.Empty;
    public decimal Score { get; set; }
    public string MasteryLevel { get; set; } = string.Empty;
    public int AttemptCount { get; set; }
    public DateTime LastAssessed { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
