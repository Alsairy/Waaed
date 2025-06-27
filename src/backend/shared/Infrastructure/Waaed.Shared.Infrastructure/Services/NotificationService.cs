using AttendancePlatform.Shared.Domain.Entities;
using AttendancePlatform.Shared.Domain.Interfaces;
using AttendancePlatform.Shared.Infrastructure.Data;
using AttendancePlatform.Shared.Infrastructure.Hubs;
using AttendancePlatform.Shared.Infrastructure.Services;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Text.Json;

namespace AttendancePlatform.Shared.Infrastructure.Services;

public class NotificationService : INotificationService
{
    private readonly AttendancePlatformDbContext _context;
    private readonly IHubContext<NotificationHub> _hubContext;
    private readonly ILogger<NotificationService> _logger;

    public NotificationService(
        AttendancePlatformDbContext context,
        IHubContext<NotificationHub> hubContext,
        ILogger<NotificationService> logger)
    {
        _context = context;
        _hubContext = hubContext;
        _logger = logger;
    }

    public async Task SendNotificationAsync(NotificationRequest request)
    {
        try
        {
            var notification = new Notification
            {
                UserId = Guid.Parse(request.UserId),
                TenantId = Guid.Parse(request.TenantId ?? Guid.Empty.ToString()),
                Title = request.Title,
                Message = request.Message,
                Type = Enum.Parse<NotificationType>(request.Type, true),
                Data = request.Data != null ? JsonSerializer.Serialize(request.Data) : null,
                ActionUrl = request.ActionUrl,
                ExpiresAt = request.ExpiresAt,
                Priority = Enum.Parse<NotificationPriority>(request.Priority, true),
                ImageUrl = request.ImageUrl
            };

            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();

            if (request.Channels.Contains("realtime") || request.Channels.Count == 0)
            {
                await SendRealTimeNotificationAsync(request.UserId, request.Message, request.Type, request.Data);
            }

            if (request.Channels.Contains("email"))
            {
                await SendEmailNotificationAsync(new EmailNotificationRequest
                {
                    ToEmail = await GetUserEmailAsync(request.UserId),
                    Subject = request.Title,
                    Body = request.Message
                });
            }

            if (request.Channels.Contains("push"))
            {
                await SendPushNotificationAsync(new PushNotificationRequest
                {
                    UserId = request.UserId,
                    Title = request.Title,
                    Body = request.Message,
                    Data = request.Data as Dictionary<string, string> ?? new()
                });
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send notification to user {UserId}", request.UserId);
        }
    }

    public async Task SendBulkNotificationAsync(BulkNotificationRequest request)
    {
        try
        {
            var userIds = new List<string>();

            if (request.UserIds.Any())
            {
                userIds.AddRange(request.UserIds);
            }

            if (!string.IsNullOrEmpty(request.TenantId))
            {
                var tenantUsers = await _context.Users
                    .Where(u => u.TenantId == Guid.Parse(request.TenantId))
                    .Select(u => u.Id.ToString())
                    .ToListAsync();
                userIds.AddRange(tenantUsers);
            }

            if (!string.IsNullOrEmpty(request.Role))
            {
                var roleUsers = await _context.Users
                    .Where(u => u.UserRoles.Any(ur => ur.Role.Name == request.Role))
                    .Select(u => u.Id.ToString())
                    .ToListAsync();
                userIds.AddRange(roleUsers);
            }

            userIds = userIds.Distinct().ToList();

            var notifications = userIds.Select(userId => new Notification
            {
                UserId = Guid.Parse(userId),
                TenantId = Guid.Parse(request.TenantId ?? Guid.Empty.ToString()),
                Title = request.Title,
                Message = request.Message,
                Type = Enum.Parse<NotificationType>(request.Type, true),
                Data = request.Data != null ? JsonSerializer.Serialize(request.Data) : null,
                ActionUrl = request.ActionUrl,
                ExpiresAt = request.ExpiresAt,
                Priority = Enum.Parse<NotificationPriority>(request.Priority, true),
                ImageUrl = request.ImageUrl
            }).ToList();

            _context.Notifications.AddRange(notifications);
            await _context.SaveChangesAsync();

            foreach (var userId in userIds)
            {
                if (request.Channels.Contains("realtime") || request.Channels.Count == 0)
                {
                    await SendRealTimeNotificationAsync(userId, request.Message, request.Type, request.Data);
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send bulk notification");
        }
    }

    public async Task SendRealTimeNotificationAsync(string userId, string message, string type = "info", object? data = null)
    {
        try
        {
            await _hubContext.Clients.Group($"user_{userId}").SendAsync("ReceiveNotification", new
            {
                message,
                type,
                data,
                timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send real-time notification to user {UserId}", userId);
        }
    }

    public async Task SendTenantNotificationAsync(string tenantId, string message, string type = "info", object? data = null)
    {
        try
        {
            await _hubContext.Clients.Group($"tenant_{tenantId}").SendAsync("ReceiveNotification", new
            {
                message,
                type,
                data,
                timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send tenant notification to tenant {TenantId}", tenantId);
        }
    }

    public async Task SendRoleBasedNotificationAsync(string role, string message, string type = "info", object? data = null)
    {
        try
        {
            await _hubContext.Clients.Group($"role_{role}").SendAsync("ReceiveNotification", new
            {
                message,
                type,
                data,
                timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send role-based notification to role {Role}", role);
        }
    }

    public async Task<IEnumerable<Notification>> GetUserNotificationsAsync(string userId, bool unreadOnly = false, int page = 1, int pageSize = 50)
    {
        var userGuid = Guid.Parse(userId);
        var query = _context.Notifications
            .Where(n => n.UserId == userGuid && !n.IsDeleted);

        if (unreadOnly)
        {
            query = query.Where(n => !n.IsRead);
        }

        return await query
            .OrderByDescending(n => n.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task<int> GetUnreadNotificationCountAsync(string userId)
    {
        var userGuid = Guid.Parse(userId);
        return await _context.Notifications
            .CountAsync(n => n.UserId == userGuid && !n.IsRead && !n.IsDeleted);
    }

    public async Task MarkNotificationAsReadAsync(string notificationId, string userId)
    {
        var userGuid = Guid.Parse(userId);
        var notification = await _context.Notifications
            .FirstOrDefaultAsync(n => n.Id == Guid.Parse(notificationId) && n.UserId == userGuid);

        if (notification != null && !notification.IsRead)
        {
            notification.IsRead = true;
            notification.ReadAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            await _hubContext.Clients.Group($"user_{userId}").SendAsync("NotificationMarkedAsRead", notificationId);
        }
    }

    public async Task MarkAllNotificationsAsReadAsync(string userId)
    {
        var userGuid = Guid.Parse(userId);
        var unreadNotifications = await _context.Notifications
            .Where(n => n.UserId == userGuid && !n.IsRead && !n.IsDeleted)
            .ToListAsync();

        foreach (var notification in unreadNotifications)
        {
            notification.IsRead = true;
            notification.ReadAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();

        await _hubContext.Clients.Group($"user_{userId}").SendAsync("AllNotificationsMarkedAsRead");
    }

    public async Task DeleteNotificationAsync(string notificationId, string userId)
    {
        var userGuid = Guid.Parse(userId);
        var notification = await _context.Notifications
            .FirstOrDefaultAsync(n => n.Id == Guid.Parse(notificationId) && n.UserId == userGuid);

        if (notification != null)
        {
            notification.IsDeleted = true;
            notification.DeletedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }
    }

    public async Task<NotificationPreferences> GetNotificationPreferencesAsync(string userId)
    {
        var user = await _context.Users.FindAsync(Guid.Parse(userId));
        if (user?.NotificationPreferences != null)
        {
            return JsonSerializer.Deserialize<NotificationPreferences>(user.NotificationPreferences) ?? new NotificationPreferences { UserId = userId };
        }

        return new NotificationPreferences { UserId = userId };
    }

    public async Task UpdateNotificationPreferencesAsync(string userId, NotificationPreferences preferences)
    {
        var user = await _context.Users.FindAsync(Guid.Parse(userId));
        if (user != null)
        {
            user.NotificationPreferences = JsonSerializer.Serialize(preferences);
            await _context.SaveChangesAsync();
        }
    }

    public async Task SendEmailNotificationAsync(EmailNotificationRequest request)
    {
        await Task.Run(() => _logger.LogInformation("Email notification would be sent to {Email}: {Subject}", request.ToEmail, request.Subject));
    }

    public async Task SendSmsNotificationAsync(SmsNotificationRequest request)
    {
        await Task.Run(() => _logger.LogInformation("SMS notification would be sent to {PhoneNumber}: {Message}", request.PhoneNumber, request.Message));
    }

    public async Task SendPushNotificationAsync(PushNotificationRequest request)
    {
        await Task.Run(() => _logger.LogInformation("Push notification would be sent to user {UserId}: {Title}", request.UserId, request.Title));
    }

    public async Task ScheduleNotificationAsync(ScheduledNotificationRequest request)
    {
        var scheduledNotification = new ScheduledNotification
        {
            UserId = Guid.Parse(request.UserId),
            TenantId = Guid.Parse(request.TenantId ?? Guid.Empty.ToString()),
            Title = request.Title,
            Message = request.Message,
            Type = Enum.Parse<NotificationType>(request.Type, true),
            Data = request.Data != null ? JsonSerializer.Serialize(request.Data) : null,
            ScheduledAt = request.ScheduledAt,
            RecurrencePattern = request.RecurrencePattern,
            RecurrenceEndDate = request.RecurrenceEndDate
        };

        _context.ScheduledNotifications.Add(scheduledNotification);
        await _context.SaveChangesAsync();
    }

    public async Task CancelScheduledNotificationAsync(string scheduledNotificationId)
    {
        var scheduledNotification = await _context.ScheduledNotifications.FindAsync(Guid.Parse(scheduledNotificationId));
        if (scheduledNotification != null)
        {
            scheduledNotification.Status = "cancelled";
            await _context.SaveChangesAsync();
        }
    }

    public async Task<bool> SendWorkflowNotificationAsync(Guid workflowInstanceId, string stepName, Guid? assignedTo = null)
    {
        try
        {
            var notificationRequest = new NotificationRequest
            {
                UserId = assignedTo?.ToString() ?? string.Empty,
                Title = "Workflow Step Notification",
                Message = $"Workflow step '{stepName}' requires your attention",
                Type = "workflow",
                Data = new { WorkflowInstanceId = workflowInstanceId, StepName = stepName },
                Priority = "normal",
                Channels = new List<string> { "email", "push", "inapp" }
            };

            await SendNotificationAsync(notificationRequest);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send workflow notification for instance {WorkflowInstanceId}", workflowInstanceId);
            return false;
        }
    }

    private async Task<string> GetUserEmailAsync(string userId)
    {
        var user = await _context.Users.FindAsync(Guid.Parse(userId));
        return user?.Email ?? string.Empty;
    }
}
