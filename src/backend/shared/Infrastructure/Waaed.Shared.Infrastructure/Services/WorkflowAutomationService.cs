using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using AttendancePlatform.Shared.Domain.Entities;
using AttendancePlatform.Shared.Domain.Interfaces;
using AttendancePlatform.Shared.Infrastructure.Data;
using AttendancePlatform.Shared.Infrastructure.Services;

namespace AttendancePlatform.Shared.Infrastructure.Services
{
    public class WorkflowAutomationService : IWorkflowAutomationService
    {
        private readonly AttendancePlatformDbContext _context;

        public WorkflowAutomationService(AttendancePlatformDbContext context)
        {
            _context = context;
        }

        public async Task<WorkflowDefinition> CreateWorkflowAsync(CreateWorkflowRequest request)
        {
            var workflow = new WorkflowDefinition
            {
                Id = Guid.NewGuid(),
                TenantId = Guid.Parse(request.TenantId),
                Name = request.Name,
                Description = request.Description,
                Category = request.Category,
                Steps = JsonSerializer.Serialize(request.Steps),
                Triggers = JsonSerializer.Serialize(request.Triggers),
                Variables = JsonSerializer.Serialize(request.Variables),
                IsActive = request.IsActive,
                CreatedBy = request.CreatedBy,
                CreatedAt = DateTime.UtcNow
            };

            _context.WorkflowDefinitions.Add(workflow);
            await _context.SaveChangesAsync();
            return workflow;
        }

        public async Task<WorkflowDefinition> UpdateWorkflowAsync(string workflowId, UpdateWorkflowRequest request)
        {
            var workflow = await _context.WorkflowDefinitions.FirstOrDefaultAsync(w => w.Id == Guid.Parse(workflowId));
            if (workflow == null)
                throw new ArgumentException("Workflow not found");

            if (!string.IsNullOrEmpty(request.Name))
                workflow.Name = request.Name;
            if (!string.IsNullOrEmpty(request.Description))
                workflow.Description = request.Description;
            if (!string.IsNullOrEmpty(request.Category))
                workflow.Category = request.Category;
            if (request.Steps != null)
                workflow.Steps = JsonSerializer.Serialize(request.Steps);
            if (request.Triggers != null)
                workflow.Triggers = JsonSerializer.Serialize(request.Triggers);
            if (request.Variables != null)
                workflow.Variables = JsonSerializer.Serialize(request.Variables);
            if (request.IsActive.HasValue)
                workflow.IsActive = request.IsActive.Value;
            
            workflow.UpdatedBy = request.UpdatedBy;
            workflow.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return workflow;
        }

        public async Task DeleteWorkflowAsync(string workflowId)
        {
            var workflow = await _context.WorkflowDefinitions.FirstOrDefaultAsync(w => w.Id == Guid.Parse(workflowId));
            if (workflow != null)
            {
                _context.WorkflowDefinitions.Remove(workflow);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<WorkflowDefinition?> GetWorkflowAsync(string workflowId)
        {
            return await _context.WorkflowDefinitions.FirstOrDefaultAsync(w => w.Id == Guid.Parse(workflowId));
        }

        public async Task<IEnumerable<WorkflowDefinition>> GetWorkflowsAsync(string tenantId, bool activeOnly = true)
        {
            var query = _context.WorkflowDefinitions.Where(w => w.TenantId == Guid.Parse(tenantId));
            if (activeOnly)
                query = query.Where(w => w.IsActive);
            return await query.ToListAsync();
        }

        public async Task<WorkflowInstance> StartWorkflowAsync(string workflowId, object? inputData = null, string? userId = null)
        {
            var workflow = await _context.WorkflowDefinitions.FirstOrDefaultAsync(w => w.Id == Guid.Parse(workflowId));
            if (workflow == null)
                throw new ArgumentException("Workflow not found");

            var instance = new WorkflowInstance
            {
                Id = Guid.NewGuid(),
                TenantId = workflow.TenantId,
                WorkflowTemplateId = Guid.Parse(workflowId),
                WorkflowType = workflow.Category,
                EntityId = Guid.NewGuid(),
                EntityType = "Workflow",
                InitiatedBy = userId != null ? Guid.Parse(userId) : Guid.NewGuid(),
                Status = "Running",
                Priority = "Medium",
                InputData = JsonSerializer.Serialize(inputData ?? new object()),
                CurrentStepIndex = 0,
                CreatedAt = DateTime.UtcNow
            };

            _context.WorkflowInstances.Add(instance);
            await _context.SaveChangesAsync();
            return instance;
        }

        public async Task<WorkflowInstance?> GetWorkflowInstanceAsync(string instanceId)
        {
            return await _context.WorkflowInstances.FirstOrDefaultAsync(i => i.Id == Guid.Parse(instanceId));
        }

        public async Task<IEnumerable<WorkflowInstance>> GetWorkflowInstancesAsync(string workflowId, string? status = null, int page = 1, int pageSize = 50)
        {
            var query = _context.WorkflowInstances.Where(i => i.WorkflowTemplateId == Guid.Parse(workflowId));
            if (!string.IsNullOrEmpty(status))
                query = query.Where(i => i.Status == status);
            
            return await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
        }

        public async Task CompleteTaskAsync(string instanceId, string taskId, object? outputData = null, string? userId = null)
        {
            var step = await _context.WorkflowSteps.FirstOrDefaultAsync(s => s.Id == Guid.Parse(taskId) && s.WorkflowInstanceId == Guid.Parse(instanceId));
            if (step != null)
            {
                step.Status = "Completed";
                step.CompletedAt = DateTime.UtcNow;
                step.CompletedBy = userId != null ? Guid.Parse(userId) : Guid.NewGuid();
                step.OutputData = JsonSerializer.Serialize(outputData ?? new object());
                await _context.SaveChangesAsync();
            }
        }

        public async Task CancelWorkflowInstanceAsync(string instanceId, string reason, string? userId = null)
        {
            var instance = await _context.WorkflowInstances.FirstOrDefaultAsync(i => i.Id == Guid.Parse(instanceId));
            if (instance != null)
            {
                instance.Status = "Cancelled";
                instance.CompletedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }
        }

        public async Task<IEnumerable<WorkflowTask>> GetPendingTasksAsync(string userId)
        {
            return await _context.WorkflowTasks.Where(t => t.AssignedTo == userId && t.Status == "pending").ToListAsync();
        }

        public async Task<IEnumerable<WorkflowTask>> GetWorkflowTasksAsync(string instanceId)
        {
            return await _context.WorkflowTasks.Where(t => t.WorkflowInstanceId == instanceId).ToListAsync();
        }

        public async Task AssignTaskAsync(string taskId, string userId, string? assignedBy = null)
        {
            var task = await _context.WorkflowTasks.FirstOrDefaultAsync(t => t.Id == Guid.Parse(taskId));
            if (task != null)
            {
                task.AssignedTo = userId;
                task.AssignedBy = assignedBy;
                task.AssignedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }
        }

        public async Task ReassignTaskAsync(string taskId, string fromUserId, string toUserId, string? reassignedBy = null)
        {
            var task = await _context.WorkflowTasks.FirstOrDefaultAsync(t => t.Id == Guid.Parse(taskId) && t.AssignedTo == fromUserId);
            if (task != null)
            {
                task.AssignedTo = toUserId;
                task.AssignedBy = reassignedBy;
                task.AssignedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }
        }

        public async Task<WorkflowExecutionResult> ExecuteWorkflowStepAsync(string instanceId, string stepId, object? inputData = null)
        {
            try
            {
                var step = await _context.WorkflowSteps.FirstOrDefaultAsync(s => s.Id == Guid.Parse(stepId) && s.WorkflowInstanceId == Guid.Parse(instanceId));
                if (step == null)
                {
                    return new WorkflowExecutionResult
                    {
                        IsSuccess = false,
                        ErrorMessage = "Step not found"
                    };
                }

                step.Status = "InProgress";
                step.StartedAt = DateTime.UtcNow;
                step.InputData = JsonSerializer.Serialize(inputData ?? new object());
                await _context.SaveChangesAsync();

                return new WorkflowExecutionResult
                {
                    IsSuccess = true,
                    OutputData = inputData,
                    NextStepId = "",
                    IsCompleted = false,
                    RequiresManualAction = true,
                    Variables = new Dictionary<string, object>()
                };
            }
            catch (Exception ex)
            {
                return new WorkflowExecutionResult
                {
                    IsSuccess = false,
                    ErrorMessage = ex.Message
                };
            }
        }

        public async Task<IEnumerable<WorkflowTemplate>> GetWorkflowTemplatesAsync()
        {
            return await _context.WorkflowTemplates.ToListAsync();
        }

        public async Task<WorkflowDefinition> CreateWorkflowFromTemplateAsync(string templateId, string tenantId, Dictionary<string, object>? parameters = null)
        {
            var template = await _context.WorkflowTemplates.FirstOrDefaultAsync(t => t.Id == Guid.Parse(templateId));
            if (template == null)
                throw new ArgumentException("Template not found");

            var workflow = new WorkflowDefinition
            {
                Id = Guid.NewGuid(),
                TenantId = Guid.Parse(tenantId),
                Name = template.Name,
                Description = template.Description,
                Category = template.WorkflowType,
                Steps = template.StepDefinitions,
                Triggers = "[]",
                Variables = JsonSerializer.Serialize(parameters ?? new Dictionary<string, object>()),
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.WorkflowDefinitions.Add(workflow);
            await _context.SaveChangesAsync();
            return workflow;
        }


    }
}
