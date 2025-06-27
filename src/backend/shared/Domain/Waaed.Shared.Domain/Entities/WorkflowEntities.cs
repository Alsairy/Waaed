using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AttendancePlatform.Shared.Domain.Entities;

[Table("WorkflowDefinitions")]
public class WorkflowDefinition : TenantEntity
{
    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string Description { get; set; } = string.Empty;

    [MaxLength(100)]
    public string Category { get; set; } = string.Empty;

    public string Steps { get; set; } = string.Empty;

    public string Triggers { get; set; } = string.Empty;

    public string Variables { get; set; } = "{}";

    public bool IsActive { get; set; } = true;

    public int Version { get; set; } = 1;

    [MaxLength(50)]
    public new string? CreatedBy { get; set; }

    [MaxLength(50)]
    public new string? UpdatedBy { get; set; }

    public DateTime? LastExecutedAt { get; set; }

    public int ExecutionCount { get; set; } = 0;

    public virtual ICollection<WorkflowInstance> Instances { get; set; } = new List<WorkflowInstance>();
}



[Table("WorkflowTasks")]
public class WorkflowTask : BaseEntity
{
    [Required]
    [MaxLength(50)]
    public string WorkflowInstanceId { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string StepId { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string Description { get; set; } = string.Empty;

    [MaxLength(50)]
    public string Type { get; set; } = string.Empty;

    [MaxLength(50)]
    public string Status { get; set; } = "pending";

    [MaxLength(50)]
    public string? AssignedTo { get; set; }

    [MaxLength(50)]
    public string? AssignedBy { get; set; }

    public DateTime? AssignedAt { get; set; }

    public DateTime? DueDate { get; set; }

    public DateTime? CompletedAt { get; set; }

    [MaxLength(50)]
    public string? CompletedBy { get; set; }

    public string InputData { get; set; } = "{}";

    public string OutputData { get; set; } = "{}";

    [MaxLength(1000)]
    public string? ErrorMessage { get; set; }

    public int RetryCount { get; set; } = 0;

    [MaxLength(20)]
    public string Priority { get; set; } = "normal";

    public virtual WorkflowInstance WorkflowInstance { get; set; } = null!;
}



public class WorkflowStepDefinition
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? AssignedTo { get; set; }
    public int? DueDays { get; set; }
    public bool IsAutomated { get; set; }
    public Dictionary<string, object>? Configuration { get; set; }
    public Dictionary<string, object> Properties { get; set; } = new();
    public List<string> NextSteps { get; set; } = new();
    public List<WorkflowCondition> Conditions { get; set; } = new();
    public int Order { get; set; }
    public bool IsRequired { get; set; } = true;
    public TimeSpan? Timeout { get; set; }
    public int MaxRetries { get; set; } = 0;
}

public class WorkflowTrigger
{
    public string Id { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public Dictionary<string, object> Properties { get; set; } = new();
    public List<WorkflowCondition> Conditions { get; set; } = new();
    public bool IsActive { get; set; } = true;
}

public class WorkflowCondition
{
    public string Field { get; set; } = string.Empty;
    public string Operator { get; set; } = string.Empty;
    public object Value { get; set; } = new();
    public string LogicalOperator { get; set; } = "AND";
}
