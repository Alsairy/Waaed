using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AttendancePlatform.Shared.Domain.Entities;

[Table("Notifications")]
public class Notification : BaseEntity
{
    [Required]
    public Guid UserId { get; set; }

    [Required]
    public Guid TenantId { get; set; }

    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [MaxLength(1000)]
    public string Message { get; set; } = string.Empty;

    public NotificationType Type { get; set; } = NotificationType.System;

    public string? Data { get; set; }

    [MaxLength(500)]
    public string? ActionUrl { get; set; }

    [MaxLength(500)]
    public string? ImageUrl { get; set; }

    public bool IsRead { get; set; } = false;

    public DateTime? ReadAt { get; set; }

    public DateTime? ExpiresAt { get; set; }

    public NotificationPriority Priority { get; set; } = NotificationPriority.Normal;

    [MaxLength(100)]
    public string? Category { get; set; }

    [MaxLength(100)]
    public string? Source { get; set; }

    public new bool IsDeleted { get; set; } = false;
    
    public new DateTime? DeletedAt { get; set; }

    [MaxLength(50)]
    public string? CorrelationId { get; set; }

    [NotMapped]
    public List<string> Channels { get; set; } = new();

    [NotMapped]
    public Dictionary<string, object> Metadata { get; set; } = new();
}

[Table("ScheduledNotifications")]
public class ScheduledNotification : BaseEntity
{
    [Required]
    public Guid UserId { get; set; }

    [Required]
    public Guid TenantId { get; set; }

    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [MaxLength(1000)]
    public string Message { get; set; } = string.Empty;

    public NotificationType Type { get; set; } = NotificationType.System;

    public string? Data { get; set; }

    public DateTime ScheduledAt { get; set; }

    public bool IsProcessed { get; set; } = false;

    public DateTime? ProcessedAt { get; set; }

    [MaxLength(100)]
    public string? RecurrencePattern { get; set; }

    public DateTime? RecurrenceEndDate { get; set; }

    public DateTime? NextScheduledAt { get; set; }

    [NotMapped]
    public List<string> Channels { get; set; } = new();

    [MaxLength(50)]
    public string Status { get; set; } = "pending";

    [MaxLength(1000)]
    public string? ErrorMessage { get; set; }

    public int RetryCount { get; set; } = 0;

    public int MaxRetries { get; set; } = 3;
}
