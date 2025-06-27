namespace AttendancePlatform.LMS.Api.DTOs;

public class RubricDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public bool IsPublic { get; set; }
    public string TenantId { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    public List<RubricCriterionDto> Criteria { get; set; } = new();
}

public class RubricCriterionDto
{
    public Guid Id { get; set; }
    public Guid RubricId { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Points { get; set; }
    public int Position { get; set; }
    public Guid? LearningOutcomeId { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<RubricLevelDto> Levels { get; set; } = new();
}

public class RubricLevelDto
{
    public Guid Id { get; set; }
    public Guid RubricCriterionId { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Points { get; set; }
    public int Position { get; set; }
}

public class CreateRubricDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public bool IsPublic { get; set; }
    public List<CreateRubricCriterionDto> Criteria { get; set; } = new();
}

public class CreateRubricCriterionDto
{
    public string Description { get; set; } = string.Empty;
    public decimal Points { get; set; }
    public int Position { get; set; }
    public Guid? LearningOutcomeId { get; set; }
    public List<CreateRubricLevelDto> Levels { get; set; } = new();
}

public class CreateRubricLevelDto
{
    public string Description { get; set; } = string.Empty;
    public decimal Points { get; set; }
    public int Position { get; set; }
}
