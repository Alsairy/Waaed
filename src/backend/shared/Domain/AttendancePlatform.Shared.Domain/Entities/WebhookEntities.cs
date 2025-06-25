using System.ComponentModel.DataAnnotations;
using AttendancePlatform.Shared.Domain.Interfaces;

namespace AttendancePlatform.Shared.Domain.Entities
{
    public class WebhookSubscription : BaseEntity, ITenantAware
    {
        public Guid TenantId { get; set; }

        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [MaxLength(500)]
        public string Url { get; set; } = string.Empty;

        public List<string> EventTypes { get; set; } = new();

        [MaxLength(200)]
        public string Secret { get; set; } = string.Empty;

        public bool IsActive { get; set; } = true;

        public Dictionary<string, string> Headers { get; set; } = new();

        public WebhookRetryPolicy RetryPolicy { get; set; } = new();

        public virtual ICollection<WebhookDelivery> Deliveries { get; set; } = new List<WebhookDelivery>();
    }

    public class WebhookRetryPolicy
    {
        public int MaxRetries { get; set; } = 3;
        public int RetryDelaySeconds { get; set; } = 60;
        public bool ExponentialBackoff { get; set; } = true;
    }

    public class WebhookDelivery : BaseEntity, ITenantAware
    {
        public Guid TenantId { get; set; }

        public Guid SubscriptionId { get; set; }

        public virtual WebhookSubscription Subscription { get; set; } = null!;

        [Required]
        [MaxLength(100)]
        public string EventType { get; set; } = string.Empty;

        public string Payload { get; set; } = string.Empty;

        public int? HttpStatusCode { get; set; }

        public string? ResponseBody { get; set; }

        public DateTime AttemptedAt { get; set; }

        public bool IsSuccessful { get; set; }

        public string? ErrorMessage { get; set; }

        public int RetryCount { get; set; }
    }
}
