using System.ComponentModel.DataAnnotations;

namespace AttendancePlatform.Shared.Domain.DTOs
{
    public class AutomationRuleDto
    {
        public Guid Id { get; set; }
        public Guid TenantId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string RuleType { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public int Priority { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateAutomationRuleRequestDto
    {
        [Required]
        public Guid TenantId { get; set; }
        
        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;
        
        [MaxLength(1000)]
        public string Description { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(100)]
        public string RuleType { get; set; } = string.Empty;
        
        public string? Conditions { get; set; }
        
        public string? Actions { get; set; }
        
        public int Priority { get; set; } = 0;
        
        [Required]
        public Guid CreatedBy { get; set; }
    }

    public class UpdateAutomationRuleRequestDto
    {
        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;
        
        [MaxLength(1000)]
        public string Description { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(100)]
        public string RuleType { get; set; } = string.Empty;
        
        public string? Conditions { get; set; }
        
        public string? Actions { get; set; }
        
        public int Priority { get; set; } = 0;
        
        [Required]
        public Guid UpdatedBy { get; set; }
    }

    public class AutomationTemplateDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string RuleType { get; set; } = string.Empty;
    }

    public class AutomationExecutionResultDto
    {
        public Guid RuleId { get; set; }
        public Guid ExecutionId { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime ExecutedAt { get; set; }
        public string Context { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
    }

    public class AutomationExecutionLogDto
    {
        public Guid Id { get; set; }
        public Guid RuleId { get; set; }
        public string RuleName { get; set; } = string.Empty;
        public DateTime ExecutedAt { get; set; }
        public string Status { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
    }
}
