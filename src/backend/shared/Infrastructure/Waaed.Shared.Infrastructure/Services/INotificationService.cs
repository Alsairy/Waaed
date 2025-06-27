using AttendancePlatform.Shared.Domain.Entities;

namespace AttendancePlatform.Shared.Infrastructure.Services;

public interface INotificationService
{
    Task SendNotificationAsync(NotificationRequest request);
    Task SendBulkNotificationAsync(BulkNotificationRequest request);
    Task SendRealTimeNotificationAsync(string userId, string message, string type = "info", object? data = null);
    Task SendTenantNotificationAsync(string tenantId, string message, string type = "info", object? data = null);
    Task SendRoleBasedNotificationAsync(string role, string message, string type = "info", object? data = null);
    Task<IEnumerable<Notification>> GetUserNotificationsAsync(string userId, bool unreadOnly = false, int page = 1, int pageSize = 50);
    Task<int> GetUnreadNotificationCountAsync(string userId);
    Task MarkNotificationAsReadAsync(string notificationId, string userId);
    Task MarkAllNotificationsAsReadAsync(string userId);
    Task DeleteNotificationAsync(string notificationId, string userId);
    Task<NotificationPreferences> GetNotificationPreferencesAsync(string userId);
    Task UpdateNotificationPreferencesAsync(string userId, NotificationPreferences preferences);
    Task SendEmailNotificationAsync(EmailNotificationRequest request);
    Task SendSmsNotificationAsync(SmsNotificationRequest request);
    Task SendPushNotificationAsync(PushNotificationRequest request);
    Task ScheduleNotificationAsync(ScheduledNotificationRequest request);
    Task CancelScheduledNotificationAsync(string scheduledNotificationId);
    Task<bool> SendWorkflowNotificationAsync(Guid workflowInstanceId, string stepName, Guid? assignedTo = null);
}

public class NotificationRequest
{
    public string UserId { get; set; } = string.Empty;
    public string? TenantId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string Type { get; set; } = "info";
    public object? Data { get; set; }
    public string? ActionUrl { get; set; }
    public string? ImageUrl { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public string Priority { get; set; } = "normal";
    public List<string> Channels { get; set; } = new();
}

public class BulkNotificationRequest
{
    public List<string> UserIds { get; set; } = new();
    public string? TenantId { get; set; }
    public string? Role { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string Type { get; set; } = "info";
    public object? Data { get; set; }
    public string? ActionUrl { get; set; }
    public string? ImageUrl { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public string Priority { get; set; } = "normal";
    public List<string> Channels { get; set; } = new();
}

public class EmailNotificationRequest
{
    public string ToEmail { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public bool IsHtml { get; set; } = true;
    public List<EmailAttachment> Attachments { get; set; } = new();
    public string? FromEmail { get; set; }
    public string? FromName { get; set; }
    public string Priority { get; set; } = "normal";
}

public class SmsNotificationRequest
{
    public string PhoneNumber { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string? SenderId { get; set; }
}

public class PushNotificationRequest
{
    public string UserId { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public Dictionary<string, string> Data { get; set; } = new();
    public string? Icon { get; set; }
    public string? Sound { get; set; }
    public string? Badge { get; set; }
    public string? ClickAction { get; set; }
}

public class ScheduledNotificationRequest
{
    public string UserId { get; set; } = string.Empty;
    public string? TenantId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string Type { get; set; } = "info";
    public object? Data { get; set; }
    public DateTime ScheduledAt { get; set; }
    public string? RecurrencePattern { get; set; }
    public DateTime? RecurrenceEndDate { get; set; }
    public List<string> Channels { get; set; } = new();
}

public class EmailAttachment
{
    public string FileName { get; set; } = string.Empty;
    public byte[] Content { get; set; } = Array.Empty<byte>();
    public string ContentType { get; set; } = string.Empty;
}

public class NotificationPreferences
{
    public string UserId { get; set; } = string.Empty;
    public bool EmailEnabled { get; set; } = true;
    public bool SmsEnabled { get; set; } = false;
    public bool PushEnabled { get; set; } = true;
    public bool InAppEnabled { get; set; } = true;
    public Dictionary<string, bool> CategoryPreferences { get; set; } = new();
    public string QuietHoursStart { get; set; } = "22:00";
    public string QuietHoursEnd { get; set; } = "08:00";
    public string TimeZone { get; set; } = "UTC";
    public string Language { get; set; } = "en";
}
