using AttendancePlatform.Shared.Domain.Entities;

namespace AttendancePlatform.Shared.Infrastructure.Services;

public interface IWorkflowAutomationService
{
    Task<WorkflowDefinition> CreateWorkflowAsync(CreateWorkflowRequest request);
    Task<WorkflowDefinition> UpdateWorkflowAsync(string workflowId, UpdateWorkflowRequest request);
    Task DeleteWorkflowAsync(string workflowId);
    Task<WorkflowDefinition?> GetWorkflowAsync(string workflowId);
    Task<IEnumerable<WorkflowDefinition>> GetWorkflowsAsync(string tenantId, bool activeOnly = true);
    Task<WorkflowInstance> StartWorkflowAsync(string workflowId, object? inputData = null, string? userId = null);
    Task<WorkflowInstance?> GetWorkflowInstanceAsync(string instanceId);
    Task<IEnumerable<WorkflowInstance>> GetWorkflowInstancesAsync(string workflowId, string? status = null, int page = 1, int pageSize = 50);
    Task CompleteTaskAsync(string instanceId, string taskId, object? outputData = null, string? userId = null);
    Task CancelWorkflowInstanceAsync(string instanceId, string reason, string? userId = null);
    Task<IEnumerable<WorkflowTask>> GetPendingTasksAsync(string userId);
    Task<IEnumerable<WorkflowTask>> GetWorkflowTasksAsync(string instanceId);
    Task AssignTaskAsync(string taskId, string userId, string? assignedBy = null);
    Task ReassignTaskAsync(string taskId, string fromUserId, string toUserId, string? reassignedBy = null);
    Task<WorkflowExecutionResult> ExecuteWorkflowStepAsync(string instanceId, string stepId, object? inputData = null);
    Task<IEnumerable<WorkflowTemplate>> GetWorkflowTemplatesAsync();
    Task<WorkflowDefinition> CreateWorkflowFromTemplateAsync(string templateId, string tenantId, Dictionary<string, object>? parameters = null);
}

public class CreateWorkflowRequest
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string TenantId { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public List<WorkflowStep> Steps { get; set; } = new();
    public List<WorkflowTrigger> Triggers { get; set; } = new();
    public Dictionary<string, object> Variables { get; set; } = new();
    public bool IsActive { get; set; } = true;
    public string? CreatedBy { get; set; }
}

public class UpdateWorkflowRequest
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public string? Category { get; set; }
    public List<WorkflowStep>? Steps { get; set; }
    public List<WorkflowTrigger>? Triggers { get; set; }
    public Dictionary<string, object>? Variables { get; set; }
    public bool? IsActive { get; set; }
    public string? UpdatedBy { get; set; }
}

public class WorkflowExecutionResult
{
    public bool IsSuccess { get; set; }
    public string? ErrorMessage { get; set; }
    public object? OutputData { get; set; }
    public string NextStepId { get; set; } = string.Empty;
    public bool IsCompleted { get; set; }
    public bool RequiresManualAction { get; set; }
    public Dictionary<string, object> Variables { get; set; } = new();
}
