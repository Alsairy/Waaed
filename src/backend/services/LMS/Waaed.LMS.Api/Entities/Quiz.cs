namespace Waaed.LMS.Api.Entities;

public class Quiz
{
    public Guid Id { get; set; }
    public Guid CourseId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Instructions { get; set; } = string.Empty;
    public QuizType Type { get; set; }
    public int Points { get; set; }
    public int TimeLimit { get; set; } // in minutes
    public int AllowedAttempts { get; set; } = 1;
    public ScoringPolicy ScoringPolicy { get; set; }
    public DateTime? AvailableFrom { get; set; }
    public DateTime? AvailableUntil { get; set; }
    public DateTime? DueDate { get; set; }
    public bool ShuffleQuestions { get; set; }
    public bool ShuffleAnswers { get; set; }
    public bool ShowCorrectAnswers { get; set; }
    public DateTime? ShowCorrectAnswersAt { get; set; }
    public bool OneQuestionAtATime { get; set; }
    public bool CantGoBack { get; set; }
    public string AccessCode { get; set; } = string.Empty;
    public bool RequireLockdownBrowser { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public string CreatedBy { get; set; } = string.Empty;

    public virtual Course Course { get; set; } = null!;
    public virtual ICollection<Question> Questions { get; set; } = new List<Question>();
    public virtual ICollection<QuizAttempt> Attempts { get; set; } = new List<QuizAttempt>();
    public virtual ICollection<OutcomeAlignment> OutcomeAlignments { get; set; } = new List<OutcomeAlignment>();
}

public class Question
{
    public Guid Id { get; set; }
    public Guid QuizId { get; set; }
    public string Text { get; set; } = string.Empty;
    public QuestionType Type { get; set; }
    public decimal Points { get; set; }
    public int Position { get; set; }
    public string CorrectAnswer { get; set; } = string.Empty;
    public string AnswerChoices { get; set; } = string.Empty; // JSON
    public string Feedback { get; set; } = string.Empty;
    public Guid? LearningOutcomeId { get; set; }
    public DateTime CreatedAt { get; set; }

    public virtual Quiz Quiz { get; set; } = null!;
    public virtual LearningOutcome? LearningOutcome { get; set; }
    public virtual ICollection<QuestionResponse> Responses { get; set; } = new List<QuestionResponse>();
}

public class QuizAttempt
{
    public Guid Id { get; set; }
    public Guid QuizId { get; set; }
    public string StudentId { get; set; } = string.Empty;
    public int AttemptNumber { get; set; }
    public AttemptStatus Status { get; set; }
    public DateTime StartedAt { get; set; }
    public DateTime? SubmittedAt { get; set; }
    public decimal Score { get; set; }
    public int TimeSpent { get; set; } // in seconds
    public string WorkflowState { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }

    public virtual Quiz Quiz { get; set; } = null!;
    public virtual ICollection<QuestionResponse> Responses { get; set; } = new List<QuestionResponse>();
}

public class QuestionResponse
{
    public Guid Id { get; set; }
    public Guid QuizAttemptId { get; set; }
    public Guid QuestionId { get; set; }
    public string Response { get; set; } = string.Empty;
    public bool IsCorrect { get; set; }
    public decimal Points { get; set; }
    public DateTime CreatedAt { get; set; }

    public virtual QuizAttempt QuizAttempt { get; set; } = null!;
    public virtual Question Question { get; set; } = null!;
}

public enum QuizType
{
    Practice,
    Graded,
    Survey
}

public enum QuestionType
{
    MultipleChoice,
    TrueFalse,
    FillInTheBlank,
    Essay,
    Matching,
    Ordering,
    Numerical,
    FileUpload
}

public enum ScoringPolicy
{
    KeepHighest,
    KeepLatest,
    KeepAverage
}

public enum AttemptStatus
{
    InProgress,
    Submitted,
    Graded
}
