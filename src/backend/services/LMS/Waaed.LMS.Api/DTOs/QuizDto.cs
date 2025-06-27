namespace AttendancePlatform.LMS.Api.DTOs;

public class QuizDto
{
    public Guid Id { get; set; }
    public Guid CourseId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Instructions { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public int Points { get; set; }
    public int TimeLimit { get; set; }
    public int AllowedAttempts { get; set; }
    public string ScoringPolicy { get; set; } = string.Empty;
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
    public int QuestionCount { get; set; }
    public int AttemptCount { get; set; }
}

public class QuestionDto
{
    public Guid Id { get; set; }
    public Guid QuizId { get; set; }
    public string Text { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public decimal Points { get; set; }
    public int Position { get; set; }
    public string CorrectAnswer { get; set; } = string.Empty;
    public string AnswerChoices { get; set; } = string.Empty;
    public string Feedback { get; set; } = string.Empty;
    public Guid? LearningOutcomeId { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateQuizDto
{
    public Guid CourseId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Instructions { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public int Points { get; set; }
    public int TimeLimit { get; set; }
    public int AllowedAttempts { get; set; } = 1;
    public string ScoringPolicy { get; set; } = string.Empty;
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
}
