using System.ComponentModel.DataAnnotations;
using AttendancePlatform.Shared.Domain.Interfaces;

namespace AttendancePlatform.Shared.Domain.Entities
{
    public class TenantIntegration : BaseEntity, ITenantAware
    {
        public Guid TenantId { get; set; }

        [Required]
        [MaxLength(100)]
        public string IntegrationType { get; set; } = string.Empty;

        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        public string Configuration { get; set; } = string.Empty;

        public bool IsActive { get; set; } = true;

        public bool IsConfigured { get; set; } = false;

        public DateTime? LastSyncAt { get; set; }

        public string? LastSyncStatus { get; set; }

        public string? LastSyncError { get; set; }

        public virtual ICollection<IntegrationLog> Logs { get; set; } = new List<IntegrationLog>();
    }

    public class IntegrationLog : BaseEntity, ITenantAware
    {
        public Guid TenantId { get; set; }

        public Guid? IntegrationId { get; set; }

        public virtual TenantIntegration? Integration { get; set; }

        [Required]
        [MaxLength(100)]
        public string Operation { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string Status { get; set; } = string.Empty;

        public string? Message { get; set; }

        public string? Details { get; set; }

        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        public TimeSpan? Duration { get; set; }

        public string? ErrorCode { get; set; }

        public int? RecordsProcessed { get; set; }

        public int? RecordsSucceeded { get; set; }

        public int? RecordsFailed { get; set; }
    }

    public class TenantConfiguration : BaseEntity, ITenantAware
    {
        public Guid TenantId { get; set; }

        [Required]
        [MaxLength(100)]
        public string ConfigurationKey { get; set; } = string.Empty;

        public string ConfigurationValue { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Description { get; set; }

        public bool IsEncrypted { get; set; } = false;

        public bool IsActive { get; set; } = true;
    }
}
