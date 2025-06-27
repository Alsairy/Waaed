namespace AttendancePlatform.LMS.Api.Entities;

public class Rubric
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public RubricType Type { get; set; }
    public bool IsPublic { get; set; }
    public string TenantId { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public string CreatedBy { get; set; } = string.Empty;

    public virtual ICollection<RubricCriterion> Criteria { get; set; } = new List<RubricCriterion>();
    public virtual ICollection<Assignment> Assignments { get; set; } = new List<Assignment>();
}

public class RubricCriterion
{
    public Guid Id { get; set; }
    public Guid RubricId { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Points { get; set; }
    public int Position { get; set; }
    public Guid? LearningOutcomeId { get; set; }
    public DateTime CreatedAt { get; set; }

    public virtual Rubric Rubric { get; set; } = null!;
    public virtual LearningOutcome? LearningOutcome { get; set; }
    public virtual ICollection<RubricLevel> Levels { get; set; } = new List<RubricLevel>();
    public virtual ICollection<RubricAssessment> Assessments { get; set; } = new List<RubricAssessment>();
}

public class RubricLevel
{
    public Guid Id { get; set; }
    public Guid RubricCriterionId { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Points { get; set; }
    public int Position { get; set; }

    public virtual RubricCriterion RubricCriterion { get; set; } = null!;
}

public enum RubricType
{
    Holistic,
    Analytic
}
