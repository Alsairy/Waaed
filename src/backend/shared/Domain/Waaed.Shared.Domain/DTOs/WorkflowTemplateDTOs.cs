using System.ComponentModel.DataAnnotations;

namespace AttendancePlatform.Shared.Domain.DTOs
{
    public class CreateWorkflowTemplateRequestDto
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
        
        public string? StepDefinitions { get; set; }
        
        public string? Steps { get; set; }
        
        public int StepCount { get; set; } = 0;
        
        [Required]
        public Guid CreatedBy { get; set; }
    }

    public class UpdateWorkflowTemplateRequestDto
    {
        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;
        
        [MaxLength(1000)]
        public string Description { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(100)]
        public string WorkflowType { get; set; } = string.Empty;
        
        public string? StepDefinitions { get; set; }
        
        public string? Steps { get; set; }
        
        public int StepCount { get; set; } = 0;
        
        public bool IsActive { get; set; } = true;
        
        [Required]
        public Guid UpdatedBy { get; set; }
    }

    public class WorkflowTemplateCategoryDto
    {
        public string Name { get; set; } = string.Empty;
        public int Count { get; set; }
        public string Description { get; set; } = string.Empty;
    }
}
