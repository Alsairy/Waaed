using System.ComponentModel.DataAnnotations;

namespace AttendancePlatform.Shared.Domain.DTOs
{
    public class ApprovalWorkflowDto
    {
        public Guid Id { get; set; }
        public Guid TenantId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateApprovalWorkflowRequestDto
    {
        [Required]
        public Guid TenantId { get; set; }
        
        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;
        
        [MaxLength(1000)]
        public string Description { get; set; } = string.Empty;
        
        public string? StepDefinitions { get; set; }
        
        [Required]
        public Guid CreatedBy { get; set; }
    }

    public class UpdateApprovalWorkflowRequestDto
    {
        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;
        
        [MaxLength(1000)]
        public string Description { get; set; } = string.Empty;
        
        public string? StepDefinitions { get; set; }
        
        public bool IsActive { get; set; }
        
        [Required]
        public Guid UpdatedBy { get; set; }
    }

    public class SubmitApprovalRequestDto
    {
        [Required]
        public Guid TenantId { get; set; }
        
        [Required]
        public Guid WorkflowTemplateId { get; set; }
        
        [Required]
        public Guid EntityId { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string EntityType { get; set; } = string.Empty;
        
        [Required]
        public Guid InitiatedBy { get; set; }
        
        [MaxLength(50)]
        public string? Priority { get; set; }
        
        public string? InputData { get; set; }
    }

    public class ProcessApprovalRequestDto
    {
        [Required]
        [MaxLength(50)]
        public string Decision { get; set; } = string.Empty; // Approved, Rejected, Delegated
        
        [MaxLength(1000)]
        public string? Comments { get; set; }
        
        public Guid? DelegatedTo { get; set; }
    }

    public class ApprovalResultDto
    {
        public Guid ApprovalId { get; set; }
        public Guid WorkflowInstanceId { get; set; }
        public string Decision { get; set; } = string.Empty;
        public string? Comments { get; set; }
        public DateTime ProcessedAt { get; set; }
    }

    public class PendingApprovalDto
    {
        public Guid ApprovalId { get; set; }
        public Guid WorkflowInstanceId { get; set; }
        public string EntityType { get; set; } = string.Empty;
        public Guid EntityId { get; set; }
        public string Priority { get; set; } = string.Empty;
        public DateTime SubmittedAt { get; set; }
        public Guid ApproverId { get; set; }
    }

    public class WorkflowApprovalHistoryDto
    {
        public Guid ApprovalId { get; set; }
        public Guid WorkflowInstanceId { get; set; }
        public string EntityType { get; set; } = string.Empty;
        public Guid EntityId { get; set; }
        public string Decision { get; set; } = string.Empty;
        public string? Comments { get; set; }
        public DateTime ProcessedAt { get; set; }
        public Guid ApproverId { get; set; }
    }
}
