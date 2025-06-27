namespace Waaed.LMS.Api.Entities;

public class Grade
{
    public Guid Id { get; set; }
    public Guid AssignmentId { get; set; }
    public string StudentId { get; set; } = string.Empty;
    public Guid? SubmissionId { get; set; }
    public decimal Points { get; set; }
    public decimal? PercentageScore { get; set; }
    public string LetterGrade { get; set; } = string.Empty;
    public GradeStatus Status { get; set; }
    public string Comments { get; set; } = string.Empty;
    public bool ExcusedFromGrading { get; set; }
    public DateTime? GradedAt { get; set; }
    public string GradedBy { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public virtual Assignment Assignment { get; set; } = null!;
    public virtual Submission? Submission { get; set; }
    public virtual ICollection<RubricAssessment> RubricAssessments { get; set; } = new List<RubricAssessment>();
}

public class RubricAssessment
{
    public Guid Id { get; set; }
    public Guid GradeId { get; set; }
    public Guid RubricCriterionId { get; set; }
    public decimal Points { get; set; }
    public string Comments { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }

    public virtual Grade Grade { get; set; } = null!;
    public virtual RubricCriterion RubricCriterion { get; set; } = null!;
}

public enum GradeStatus
{
    NotGraded,
    Graded,
    Excused,
    Missing
}
