using Microsoft.EntityFrameworkCore;
using AttendancePlatform.Shared.Domain.Interfaces;
using AttendancePlatform.Shared.Domain.Entities;
using AttendancePlatform.Shared.Infrastructure.Data;
using System.Text.Json;

namespace AttendancePlatform.Notifications.Api.Services
{
    public interface INotificationService
    {
        Task<NotificationDto> SendNotificationAsync(SendNotificationRequest request);
        Task<bool> SendBulkNotificationAsync(SendBulkNotificationRequest request);
        Task<IEnumerable<NotificationDto>> GetNotificationsAsync(Guid userId, int page = 1, int pageSize = 50);
        Task<NotificationDto?> GetNotificationAsync(Guid id);
        Task<bool> MarkAsReadAsync(Guid id, Guid userId);
        Task<bool> MarkAllAsReadAsync(Guid userId);
        Task<int> GetUnreadCountAsync(Guid userId);
        Task<bool> DeleteNotificationAsync(Guid id, Guid userId);
        Task<NotificationStatsDto> GetNotificationStatsAsync(Guid? tenantId = null);
        Task<bool> UpdateNotificationPreferencesAsync(Guid userId, NotificationPreferencesDto preferences);
        Task<NotificationPreferencesDto> GetNotificationPreferencesAsync(Guid userId);
    }

    public class NotificationService : INotificationService
    {
        private readonly AttendancePlatformDbContext _context;
        private readonly IEmailService _emailService;
        private readonly ISmsService _smsService;
        private readonly IPushNotificationService _pushService;
        private readonly INotificationTemplateService _templateService;
        private readonly ILogger<NotificationService> _logger;
        private readonly ITenantContext _tenantContext;

        public NotificationService(
            AttendancePlatformDbContext context,
            IEmailService emailService,
            ISmsService smsService,
            IPushNotificationService pushService,
            INotificationTemplateService templateService,
            ILogger<NotificationService> logger,
            ITenantContext tenantContext)
        {
            _context = context;
            _emailService = emailService;
            _smsService = smsService;
            _pushService = pushService;
            _templateService = templateService;
            _logger = logger;
            _tenantContext = tenantContext;
        }

        public async Task<NotificationDto> SendNotificationAsync(SendNotificationRequest request)
        {
            var notification = new Notification
            {
                Id = Guid.NewGuid(),
                TenantId = _tenantContext.TenantId ?? Guid.Empty,
                UserId = request.UserId,
                Type = request.Type,
                Title = request.Title,
                Message = request.Message,
                Data = request.Data != null ? JsonSerializer.Serialize(request.Data) : null,
                Priority = request.Priority,
                Category = request.Category,
                IsRead = false,
                CreatedAt = DateTime.UtcNow,
                ExpiresAt = request.ExpiresAt,
                ActionUrl = request.ActionUrl,
                ImageUrl = request.ImageUrl
            };

            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();

            // Get user preferences
            var preferences = await GetNotificationPreferencesAsync(request.UserId);

            // Send via different channels based on preferences and type
            var deliveryTasks = new List<Task>();

            if (ShouldSendEmail(request.Type, preferences))
            {
                deliveryTasks.Add(SendEmailNotificationAsync(notification, request));
            }

            if (ShouldSendSms(request.Type, preferences))
            {
                deliveryTasks.Add(SendSmsNotificationAsync(notification, request));
            }

            if (ShouldSendPush(request.Type, preferences))
            {
                deliveryTasks.Add(SendPushNotificationAsync(notification, request));
            }

            // Execute all delivery methods in parallel
            await Task.WhenAll(deliveryTasks);

            _logger.LogInformation($"Notification {notification.Id} sent to user {request.UserId}");

            return MapToDto(notification);
        }

        public async Task<bool> SendBulkNotificationAsync(SendBulkNotificationRequest request)
        {
            var notifications = new List<Notification>();

            foreach (var userId in request.UserIds)
            {
                var notification = new Notification
                {
                    Id = Guid.NewGuid(),
                    TenantId = _tenantContext.TenantId ?? Guid.Empty,
                    UserId = userId,
                    Type = request.Type,
                    Title = request.Title,
                    Message = request.Message,
                    Data = request.Data != null ? JsonSerializer.Serialize(request.Data) : null,
                    Priority = request.Priority,
                    Category = request.Category,
                    IsRead = false,
                    CreatedAt = DateTime.UtcNow,
                    ExpiresAt = request.ExpiresAt,
                    ActionUrl = request.ActionUrl,
                    ImageUrl = request.ImageUrl
                };

                notifications.Add(notification);
            }

            _context.Notifications.AddRange(notifications);
            await _context.SaveChangesAsync();

            // Send notifications in batches
            var batchSize = 100;
            var batches = notifications.Chunk(batchSize);

            foreach (var batch in batches)
            {
                var deliveryTasks = batch.Select(async notification =>
                {
                    var preferences = await GetNotificationPreferencesAsync(notification.UserId);
                    var notificationRequest = new SendNotificationRequest
                    {
                        UserId = notification.UserId,
                        Type = notification.Type,
                        Title = notification.Title,
                        Message = notification.Message,
                        Priority = notification.Priority,
                        Category = notification.Category
                    };

                    var tasks = new List<Task>();

                    if (ShouldSendEmail(notification.Type, preferences))
                        tasks.Add(SendEmailNotificationAsync(notification, notificationRequest));

                    if (ShouldSendSms(notification.Type, preferences))
                        tasks.Add(SendSmsNotificationAsync(notification, notificationRequest));

                    if (ShouldSendPush(notification.Type, preferences))
                        tasks.Add(SendPushNotificationAsync(notification, notificationRequest));

                    await Task.WhenAll(tasks);
                });

                await Task.WhenAll(deliveryTasks);
            }

            _logger.LogInformation($"Bulk notification sent to {request.UserIds.Count} users");

            return true;
        }

        public async Task<IEnumerable<NotificationDto>> GetNotificationsAsync(Guid userId, int page = 1, int pageSize = 50)
        {
            var notifications = await _context.Notifications
                .Where(n => n.UserId == userId && n.TenantId == _tenantContext.TenantId)
                .Where(n => n.ExpiresAt == null || n.ExpiresAt > DateTime.UtcNow)
                .OrderByDescending(n => n.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return notifications.Select(MapToDto);
        }

        public async Task<NotificationDto?> GetNotificationAsync(Guid id)
        {
            var notification = await _context.Notifications
                .FirstOrDefaultAsync(n => n.Id == id && n.TenantId == _tenantContext.TenantId);

            return notification != null ? MapToDto(notification) : null;
        }

        public async Task<bool> MarkAsReadAsync(Guid id, Guid userId)
        {
            var notification = await _context.Notifications
                .FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId && n.TenantId == _tenantContext.TenantId);

            if (notification == null)
                return false;

            notification.IsRead = true;
            notification.ReadAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> MarkAllAsReadAsync(Guid userId)
        {
            var notifications = await _context.Notifications
                .Where(n => n.UserId == userId && n.TenantId == _tenantContext.TenantId && !n.IsRead)
                .ToListAsync();

            foreach (var notification in notifications)
            {
                notification.IsRead = true;
                notification.ReadAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<int> GetUnreadCountAsync(Guid userId)
        {
            return await _context.Notifications
                .CountAsync(n => n.UserId == userId && 
                               n.TenantId == _tenantContext.TenantId && 
                               !n.IsRead &&
                               (n.ExpiresAt == null || n.ExpiresAt > DateTime.UtcNow));
        }

        public async Task<bool> DeleteNotificationAsync(Guid id, Guid userId)
        {
            var notification = await _context.Notifications
                .FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId && n.TenantId == _tenantContext.TenantId);

            if (notification == null)
                return false;

            _context.Notifications.Remove(notification);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<NotificationStatsDto> GetNotificationStatsAsync(Guid? tenantId = null)
        {
            var targetTenantId = tenantId ?? _tenantContext.TenantId;

            var totalNotifications = await _context.Notifications
                .CountAsync(n => n.TenantId == targetTenantId);

            var unreadNotifications = await _context.Notifications
                .CountAsync(n => n.TenantId == targetTenantId && !n.IsRead);

            var todayNotifications = await _context.Notifications
                .CountAsync(n => n.TenantId == targetTenantId && 
                               n.CreatedAt.Date == DateTime.UtcNow.Date);

            var weeklyNotifications = await _context.Notifications
                .CountAsync(n => n.TenantId == targetTenantId && 
                               n.CreatedAt >= DateTime.UtcNow.AddDays(-7));

            return new NotificationStatsDto
            {
                TotalNotifications = totalNotifications,
                UnreadNotifications = unreadNotifications,
                TodayNotifications = todayNotifications,
                WeeklyNotifications = weeklyNotifications,
                ReadRate = totalNotifications > 0 ? (double)(totalNotifications - unreadNotifications) / totalNotifications * 100 : 0
            };
        }

        public async Task<bool> UpdateNotificationPreferencesAsync(Guid userId, NotificationPreferencesDto preferences)
        {
            var existingPreferences = await _context.NotificationPreferences
                .FirstOrDefaultAsync(p => p.UserId == userId && p.TenantId == _tenantContext.TenantId);

            if (existingPreferences == null)
            {
                existingPreferences = new NotificationPreference
                {
                    Id = Guid.NewGuid(),
                    UserId = userId,
                    TenantId = _tenantContext.TenantId ?? Guid.Empty,
                    CreatedAt = DateTime.UtcNow
                };
                _context.NotificationPreferences.Add(existingPreferences);
            }

            existingPreferences.EmailEnabled = preferences.EmailEnabled;
            existingPreferences.SmsEnabled = preferences.SmsEnabled;
            existingPreferences.PushEnabled = preferences.PushEnabled;
            existingPreferences.AttendanceNotifications = preferences.AttendanceNotifications;
            existingPreferences.LeaveNotifications = preferences.LeaveNotifications;
            existingPreferences.SystemNotifications = preferences.SystemNotifications;
            existingPreferences.MarketingNotifications = preferences.MarketingNotifications;
            existingPreferences.QuietHoursStart = preferences.QuietHoursStart;
            existingPreferences.QuietHoursEnd = preferences.QuietHoursEnd;
            existingPreferences.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<NotificationPreferencesDto> GetNotificationPreferencesAsync(Guid userId)
        {
            var preferences = await _context.NotificationPreferences
                .FirstOrDefaultAsync(p => p.UserId == userId && p.TenantId == _tenantContext.TenantId);

            if (preferences == null)
            {
                // Return default preferences
                return new NotificationPreferencesDto
                {
                    EmailEnabled = true,
                    SmsEnabled = false,
                    PushEnabled = true,
                    AttendanceNotifications = true,
                    LeaveNotifications = true,
                    SystemNotifications = true,
                    MarketingNotifications = false,
                    QuietHoursStart = TimeSpan.FromHours(22),
                    QuietHoursEnd = TimeSpan.FromHours(7)
                };
            }

            return new NotificationPreferencesDto
            {
                EmailEnabled = preferences.EmailEnabled,
                SmsEnabled = preferences.SmsEnabled,
                PushEnabled = preferences.PushEnabled,
                AttendanceNotifications = preferences.AttendanceNotifications,
                LeaveNotifications = preferences.LeaveNotifications,
                SystemNotifications = preferences.SystemNotifications,
                MarketingNotifications = preferences.MarketingNotifications,
                QuietHoursStart = preferences.QuietHoursStart,
                QuietHoursEnd = preferences.QuietHoursEnd
            };
        }

        private async Task SendEmailNotificationAsync(Notification notification, SendNotificationRequest request)
        {
            try
            {
                var user = await _context.Users.FindAsync(request.UserId);
                if (user?.Email != null)
                {
                    await _emailService.SendEmailAsync(
                        user.Email,
                        notification.Title,
                        notification.Message,
                        notification.ActionUrl);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to send email notification {notification.Id}");
            }
        }

        private async Task SendSmsNotificationAsync(Notification notification, SendNotificationRequest request)
        {
            try
            {
                var user = await _context.Users.FindAsync(request.UserId);
                if (user?.PhoneNumber != null)
                {
                    await _smsService.SendSmsAsync(
                        user.PhoneNumber,
                        $"{notification.Title}: {notification.Message}");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to send SMS notification {notification.Id}");
            }
        }

        private async Task SendPushNotificationAsync(Notification notification, SendNotificationRequest request)
        {
            try
            {
                await _pushService.SendPushNotificationAsync(
                    request.UserId,
                    notification.Title,
                    notification.Message,
                    notification.Data,
                    notification.ActionUrl);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to send push notification {notification.Id}");
            }
        }

        private bool ShouldSendEmail(NotificationType type, NotificationPreferencesDto preferences)
        {
            if (!preferences.EmailEnabled) return false;

            return type switch
            {
                NotificationType.Attendance => preferences.AttendanceNotifications,
                NotificationType.Leave => preferences.LeaveNotifications,
                NotificationType.System => preferences.SystemNotifications,
                NotificationType.Marketing => preferences.MarketingNotifications,
                _ => true
            };
        }

        private bool ShouldSendSms(NotificationType type, NotificationPreferencesDto preferences)
        {
            if (!preferences.SmsEnabled) return false;

            // SMS only for high priority notifications
            return type switch
            {
                NotificationType.Attendance => preferences.AttendanceNotifications,
                NotificationType.Leave => preferences.LeaveNotifications,
                NotificationType.System => preferences.SystemNotifications,
                _ => false
            };
        }

        private bool ShouldSendPush(NotificationType type, NotificationPreferencesDto preferences)
        {
            if (!preferences.PushEnabled) return false;

            return type switch
            {
                NotificationType.Attendance => preferences.AttendanceNotifications,
                NotificationType.Leave => preferences.LeaveNotifications,
                NotificationType.System => preferences.SystemNotifications,
                NotificationType.Marketing => preferences.MarketingNotifications,
                _ => true
            };
        }

        private NotificationDto MapToDto(Notification notification)
        {
            return new NotificationDto
            {
                Id = notification.Id,
                UserId = notification.UserId,
                Type = notification.Type,
                Title = notification.Title,
                Message = notification.Message,
                Data = notification.Data,
                Priority = notification.Priority,
                Category = notification.Category,
                IsRead = notification.IsRead,
                CreatedAt = notification.CreatedAt,
                ReadAt = notification.ReadAt,
                ExpiresAt = notification.ExpiresAt,
                ActionUrl = notification.ActionUrl,
                ImageUrl = notification.ImageUrl
            };
        }
    }





    public class NotificationDto
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public NotificationType Type { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string? Data { get; set; }
        public NotificationPriority Priority { get; set; }
        public string? Category { get; set; }
        public bool IsRead { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? ReadAt { get; set; }
        public DateTime? ExpiresAt { get; set; }
        public string? ActionUrl { get; set; }
        public string? ImageUrl { get; set; }
    }

    public class SendNotificationRequest
    {
        public Guid UserId { get; set; }
        public NotificationType Type { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public object? Data { get; set; }
        public NotificationPriority Priority { get; set; } = NotificationPriority.Normal;
        public string? Category { get; set; }
        public DateTime? ExpiresAt { get; set; }
        public string? ActionUrl { get; set; }
        public string? ImageUrl { get; set; }
    }

    public class SendBulkNotificationRequest
    {
        public List<Guid> UserIds { get; set; } = new();
        public NotificationType Type { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public object? Data { get; set; }
        public NotificationPriority Priority { get; set; } = NotificationPriority.Normal;
        public string? Category { get; set; }
        public DateTime? ExpiresAt { get; set; }
        public string? ActionUrl { get; set; }
        public string? ImageUrl { get; set; }
    }

    public class NotificationPreferencesDto
    {
        public bool EmailEnabled { get; set; }
        public bool SmsEnabled { get; set; }
        public bool PushEnabled { get; set; }
        public bool AttendanceNotifications { get; set; }
        public bool LeaveNotifications { get; set; }
        public bool SystemNotifications { get; set; }
        public bool MarketingNotifications { get; set; }
        public TimeSpan QuietHoursStart { get; set; }
        public TimeSpan QuietHoursEnd { get; set; }
    }

    public class NotificationStatsDto
    {
        public int TotalNotifications { get; set; }
        public int UnreadNotifications { get; set; }
        public int TodayNotifications { get; set; }
        public int WeeklyNotifications { get; set; }
        public double ReadRate { get; set; }
    }
}

