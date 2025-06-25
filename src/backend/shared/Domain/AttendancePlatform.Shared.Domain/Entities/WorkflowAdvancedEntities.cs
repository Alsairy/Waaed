using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AttendancePlatform.Shared.Domain.Entities
{
    public class WorkflowTemplate : BaseEntity
    {
        [Required]
        public Guid TenantId { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string WorkflowType { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;
        
        [MaxLength(1000)]
        public string Description { get; set; } = string.Empty;
        
        [Required]
        public string StepDefinitions { get; set; } = string.Empty; // JSON serialized
        
        public string Steps { get; set; } = string.Empty; // JSON serialized steps
        
        public int StepCount { get; set; } = 0;
        
        public bool IsActive { get; set; } = true;
        
        // Navigation properties
        public virtual Tenant Tenant { get; set; } = null!;
        public virtual ICollection<WorkflowInstance> WorkflowInstances { get; set; } = new List<WorkflowInstance>();
    }

    public class WorkflowInstance : BaseEntity
    {
        [Required]
        public Guid TenantId { get; set; }
        
        [Required]
        public Guid WorkflowTemplateId { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string WorkflowType { get; set; } = string.Empty;
        
        [Required]
        public Guid EntityId { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string EntityType { get; set; } = string.Empty;
        
        [Required]
        public Guid InitiatedBy { get; set; }
        
        [Required]
        [MaxLength(50)]
        public string Status { get; set; } = "Running"; // Running, Completed, Rejected, Cancelled
        
        [Required]
        [MaxLength(50)]
        public string Priority { get; set; } = "Medium"; // High, Medium, Low
        
        public string InputData { get; set; } = string.Empty; // JSON serialized
        
        public int CurrentStepIndex { get; set; } = 0;
        
        public string CurrentStep { get; set; } = string.Empty;
        
        public string CurrentStepName { get; set; } = string.Empty;
        
        public DateTime LastUpdatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime? CompletedAt { get; set; }
        
        public string Context { get; set; } = string.Empty; // JSON serialized context data
        
        public DateTime StartedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime? ResumeAt { get; set; }
        
        // Navigation properties
        public virtual Tenant Tenant { get; set; } = null!;
        public virtual WorkflowTemplate WorkflowTemplate { get; set; } = null!;
        public virtual User InitiatedByUser { get; set; } = null!;
        public virtual ICollection<WorkflowStep> WorkflowSteps { get; set; } = new List<WorkflowStep>();
        public virtual ICollection<WorkflowExecutionLog> WorkflowExecutionLogs { get; set; } = new List<WorkflowExecutionLog>();
        public virtual ICollection<WorkflowHistory> WorkflowHistories { get; set; } = new List<WorkflowHistory>();
    }

    public class WorkflowStep : BaseEntity
    {
        [Required]
        public Guid WorkflowInstanceId { get; set; }
        
        [Required]
        [MaxLength(200)]
        public string StepName { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(100)]
        public string StepType { get; set; } = string.Empty;
        
        [Required]
        public int StepIndex { get; set; }
        
        [Required]
        [MaxLength(50)]
        public string Status { get; set; } = "Pending"; // Pending, InProgress, Completed, Failed, Cancelled
        
        [MaxLength(200)]
        public string? AssignedTo { get; set; }
        
        public DateTime? DueDate { get; set; }
        
        public DateTime? StartedAt { get; set; }
        
        public DateTime? CompletedAt { get; set; }
        
        public Guid? CompletedBy { get; set; }
        
        [MaxLength(1000)]
        public string? Comments { get; set; }
        
        public string? InputData { get; set; } // JSON serialized
        
        public string? OutputData { get; set; } // JSON serialized
        
        public int? RetryCount { get; set; } = 0;
        
        // Navigation properties
        public virtual WorkflowInstance WorkflowInstance { get; set; } = null!;
        public virtual User? CompletedByUser { get; set; }
    }

    public class WorkflowExecutionLog : BaseEntity
    {
        [Required]
        public Guid WorkflowInstanceId { get; set; }
        
        public Guid? StepId { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string Action { get; set; } = string.Empty;
        
        public Guid? ExecutedBy { get; set; }
        
        [Required]
        public DateTime ExecutedAt { get; set; }
        
        [MaxLength(1000)]
        public string? Comments { get; set; }
        
        public string? InputData { get; set; } // JSON serialized
        
        public string? OutputData { get; set; } // JSON serialized
        
        [MaxLength(45)]
        public string? IpAddress { get; set; }
        
        [MaxLength(500)]
        public string? UserAgent { get; set; }
        
        // Navigation properties
        public virtual WorkflowInstance WorkflowInstance { get; set; } = null!;
        public virtual WorkflowStep? WorkflowStep { get; set; }
        public virtual User? ExecutedByUser { get; set; }
    }

    public class WorkflowRule : BaseEntity
    {
        [Required]
        public Guid TenantId { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string RuleName { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(100)]
        public string RuleType { get; set; } = string.Empty; // Condition, Action, Validation
        
        [MaxLength(1000)]
        public string Description { get; set; } = string.Empty;
        
        [Required]
        public string RuleDefinition { get; set; } = string.Empty; // JSON serialized rule logic
        
        public bool IsActive { get; set; } = true;
        
        public int Priority { get; set; } = 0;
        
        [MaxLength(100)]
        public string? ApplicableWorkflowType { get; set; }
        
        // Navigation properties
        public virtual Tenant Tenant { get; set; } = null!;
    }

    public class WorkflowNotification : BaseEntity
    {
        [Required]
        public Guid WorkflowInstanceId { get; set; }
        
        [Required]
        public Guid RecipientId { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string NotificationType { get; set; } = string.Empty; // Email, SMS, Push, InApp
        
        [Required]
        [MaxLength(200)]
        public string Subject { get; set; } = string.Empty;
        
        [Required]
        public string Message { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(50)]
        public string Status { get; set; } = "Pending"; // Pending, Sent, Failed, Delivered
        
        public DateTime? SentAt { get; set; }
        
        public DateTime? DeliveredAt { get; set; }
        
        public int RetryCount { get; set; } = 0;
        
        [MaxLength(1000)]
        public string? ErrorMessage { get; set; }
        
        // Navigation properties
        public virtual WorkflowInstance WorkflowInstance { get; set; } = null!;
        public virtual User Recipient { get; set; } = null!;
    }

    public class WorkflowApproval : BaseEntity
    {
        [Required]
        public Guid WorkflowInstanceId { get; set; }
        
        [Required]
        public Guid StepId { get; set; }
        
        [Required]
        public Guid ApproverId { get; set; }
        
        [Required]
        [MaxLength(50)]
        public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected, Delegated
        
        [MaxLength(1000)]
        public string? Comments { get; set; }
        
        public DateTime? ApprovedAt { get; set; }
        
        public Guid? DelegatedTo { get; set; }
        
        public DateTime? DelegatedAt { get; set; }
        
        [MaxLength(1000)]
        public string? DelegationReason { get; set; }
        
        // Navigation properties
        public virtual WorkflowInstance WorkflowInstance { get; set; } = null!;
        public virtual WorkflowStep WorkflowStep { get; set; } = null!;
        public virtual User Approver { get; set; } = null!;
        public virtual User? DelegatedToUser { get; set; }
    }

    public class WorkflowHistory : BaseEntity
    {
        [Required]
        public Guid WorkflowInstanceId { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string Action { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(100)]
        public string EventType { get; set; } = string.Empty;
        
        [MaxLength(1000)]
        public string Description { get; set; } = string.Empty;
        
        [Required]
        public Guid PerformedBy { get; set; }
        
        public Guid? UserId { get; set; }
        
        [Required]
        public DateTime PerformedAt { get; set; }
        
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        
        [MaxLength(1000)]
        public string? Details { get; set; }
        
        public string? Data { get; set; }
        
        public string? PreviousState { get; set; }
        
        public string? NewState { get; set; }
        
        // Navigation properties
        public virtual WorkflowInstance WorkflowInstance { get; set; } = null!;
        public virtual User PerformedByUser { get; set; } = null!;
    }
}
