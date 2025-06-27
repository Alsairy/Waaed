using System.ComponentModel.DataAnnotations;

namespace AttendancePlatform.Shared.Domain.DTOs
{
    public class ApprovalRequestDto
    {
        public Guid Id { get; set; }
        public Guid TenantId { get; set; }
        public Guid WorkflowInstanceId { get; set; }
        public Guid WorkflowTemplateId { get; set; }
        public string EntityType { get; set; } = string.Empty;
        public Guid EntityId { get; set; }
        public Guid InitiatedBy { get; set; }
        public string InitiatorName { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string Priority { get; set; } = string.Empty;
        public DateTime SubmittedAt { get; set; }
        public DateTime? ProcessedAt { get; set; }
        public Guid? ApproverId { get; set; }
        public string? ApproverName { get; set; }
        public string? Comments { get; set; }
        public string? InputData { get; set; }
    }


}
