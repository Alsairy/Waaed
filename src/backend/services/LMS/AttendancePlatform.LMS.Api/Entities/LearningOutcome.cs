namespace AttendancePlatform.LMS.Api.Entities;

public class LearningOutcome
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public OutcomeScope Scope { get; set; }
    public string ScopeId { get; set; } = string.Empty; // CourseId, AccountId, etc.
    public decimal MasteryThreshold { get; set; }
    public string MasteryScale { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public string CreatedBy { get; set; } = string.Empty;

    public virtual ICollection<OutcomeAlignment> Alignments { get; set; } = new List<OutcomeAlignment>();
    public virtual ICollection<OutcomeResult> Results { get; set; } = new List<OutcomeResult>();
    public virtual ICollection<RubricCriterion> RubricCriteria { get; set; } = new List<RubricCriterion>();
}

public class OutcomeAlignment
{
    public Guid Id { get; set; }
    public Guid LearningOutcomeId { get; set; }
    public AlignmentType Type { get; set; }
    public string ContentId { get; set; } = string.Empty; // AssignmentId, QuizId, etc.
    public decimal Weight { get; set; } = 1.0m;
    public DateTime CreatedAt { get; set; }

    public virtual LearningOutcome LearningOutcome { get; set; } = null!;
}

public class OutcomeResult
{
    public Guid Id { get; set; }
    public Guid LearningOutcomeId { get; set; }
    public string StudentId { get; set; } = string.Empty;
    public string CourseId { get; set; } = string.Empty;
    public decimal Score { get; set; }
    public MasteryLevel MasteryLevel { get; set; }
    public int AttemptCount { get; set; }
    public DateTime LastAssessed { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public virtual LearningOutcome LearningOutcome { get; set; } = null!;
}

public enum OutcomeScope
{
    Course,
    Program,
    Institution,
    State,
    National
}

public enum AlignmentType
{
    Assignment,
    Quiz,
    Discussion,
    RubricCriterion
}

public enum MasteryLevel
{
    NotAssessed,
    BelowMastery,
    NearMastery,
    Mastery,
    ExceedsMastery
}
