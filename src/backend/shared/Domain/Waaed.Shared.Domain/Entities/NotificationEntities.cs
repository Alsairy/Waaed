using System;
using System.ComponentModel.DataAnnotations;

namespace AttendancePlatform.Shared.Domain.Entities
{
    public class NotificationTemplate : BaseEntity
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string Type { get; set; } = string.Empty;

        [Required]
        public string Subject { get; set; } = string.Empty;

        [Required]
        public string Body { get; set; } = string.Empty;

        public bool IsActive { get; set; } = true;

        public string? Variables { get; set; }

        public string? Metadata { get; set; }
    }

    public class DeviceToken : BaseEntity
    {
        [Required]
        public Guid UserId { get; set; }

        [Required]
        [MaxLength(500)]
        public string Token { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        public string Platform { get; set; } = string.Empty;

        public bool IsActive { get; set; } = true;

        public DateTime LastUsed { get; set; } = DateTime.UtcNow;

        public virtual User? User { get; set; }
    }

    public class NotificationPreference : BaseEntity
    {
        [Required]
        public Guid UserId { get; set; }

        [Required]
        public Guid TenantId { get; set; }

        public bool EmailEnabled { get; set; } = true;

        public bool SmsEnabled { get; set; } = false;

        public bool PushEnabled { get; set; } = true;

        public bool AttendanceNotifications { get; set; } = true;

        public bool LeaveNotifications { get; set; } = true;

        public bool SystemNotifications { get; set; } = true;

        public bool MarketingNotifications { get; set; } = false;

        public TimeSpan QuietHoursStart { get; set; } = TimeSpan.FromHours(22);

        public TimeSpan QuietHoursEnd { get; set; } = TimeSpan.FromHours(7);

        [MaxLength(20)]
        public string? DeliveryMethod { get; set; }

        public string? Settings { get; set; }

        public virtual User? User { get; set; }
    }

    public enum NotificationType
    {
        Attendance,
        Leave,
        System,
        Marketing,
        Security,
        Reminder
    }

    public enum NotificationPriority
    {
        Low,
        Normal,
        High,
        Critical
    }
}
