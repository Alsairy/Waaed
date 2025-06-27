using System.ComponentModel.DataAnnotations;

namespace AttendancePlatform.Shared.Domain.DTOs
{
    public class WorkflowExecutionResultDto
    {
        public Guid Id { get; set; }
        public Guid WorkflowId { get; set; }
        public Guid InstanceId { get; set; }
        public string WorkflowName { get; set; } = string.Empty;
        public bool Success { get; set; }
        public string? ErrorMessage { get; set; }
        public DateTime StartedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public long ExecutionTimeMs { get; set; }
        public Dictionary<string, object> Result { get; set; } = new();
    }

    public class WorkflowPerformanceDto
    {
        public Guid WorkflowId { get; set; }
        public string WorkflowName { get; set; } = string.Empty;
        public int TotalExecutions { get; set; }
        public int SuccessfulExecutions { get; set; }
        public int FailedExecutions { get; set; }
        public double SuccessRate { get; set; }
        public long AverageExecutionTimeMs { get; set; }
        public long MinExecutionTimeMs { get; set; }
        public long MaxExecutionTimeMs { get; set; }
        public DateTime LastExecuted { get; set; }
    }

    public class StartWorkflowRequestDto
    {
        [Required]
        public Guid TenantId { get; set; }
        
        [Required]
        public Guid WorkflowTemplateId { get; set; }
        
        [Required]
        public Guid InitiatedBy { get; set; }
        
        public Dictionary<string, object> Context { get; set; } = new();
        
        public string Priority { get; set; } = "Medium";
    }

    public class ExecuteStepRequestDto
    {
        [Required]
        public string Action { get; set; } = string.Empty;
        
        public Dictionary<string, object> Data { get; set; } = new();
        
        public string? Comments { get; set; }
        
        public Guid? ExecutedBy { get; set; }
    }

    public class CreateWorkflowInstanceRequest
    {
        [Required]
        public string WorkflowType { get; set; } = string.Empty;
        
        [Required]
        public Guid EntityId { get; set; }
        
        [Required]
        public string EntityType { get; set; } = string.Empty;
        
        [Required]
        public Guid InitiatedBy { get; set; }
        
        public Dictionary<string, object> InputData { get; set; } = new();
        
        public string Priority { get; set; } = "Medium";
    }

    public class ExecuteStepRequest
    {
        [Required]
        public string Action { get; set; } = string.Empty;
        
        public Dictionary<string, object> Data { get; set; } = new();
        
        public string? Comments { get; set; }
        
        public Guid? CompletedBy { get; set; }
        
        public Dictionary<string, object>? OutputData { get; set; }
    }

    public class CreateWorkflowTemplateRequest
    {
        [Required]
        public string WorkflowType { get; set; } = string.Empty;
        
        [Required]
        public string Name { get; set; } = string.Empty;
        
        public string Description { get; set; } = string.Empty;
        
        [Required]
        public string StepDefinitions { get; set; } = string.Empty;
        
        public string Steps { get; set; } = string.Empty;
        
        public bool IsActive { get; set; } = true;
    }
}
