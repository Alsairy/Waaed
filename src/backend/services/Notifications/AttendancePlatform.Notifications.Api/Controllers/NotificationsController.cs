using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using AttendancePlatform.Notifications.Api.Services;
using AttendancePlatform.Shared.Domain.Entities;
using System.Security.Claims;

namespace AttendancePlatform.Notifications.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class NotificationsController : ControllerBase
    {
        private readonly INotificationService _notificationService;
        private readonly ILogger<NotificationsController> _logger;

        public NotificationsController(
            INotificationService notificationService,
            ILogger<NotificationsController> logger)
        {
            _notificationService = notificationService;
            _logger = logger;
        }

        /// <summary>
        /// Send a notification to a specific user
        /// </summary>
        [HttpPost("send")]
        public async Task<ActionResult<NotificationDto>> SendNotification([FromBody] SendNotificationRequest request)
        {
            try
            {
                var notification = await _notificationService.SendNotificationAsync(request);
                return Ok(notification);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send notification");
                return StatusCode(500, "Failed to send notification");
            }
        }

        /// <summary>
        /// Send bulk notifications to multiple users
        /// </summary>
        [HttpPost("send-bulk")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<ActionResult> SendBulkNotification([FromBody] SendBulkNotificationRequest request)
        {
            try
            {
                var result = await _notificationService.SendBulkNotificationAsync(request);
                return result ? Ok("Bulk notifications sent successfully") : BadRequest("Failed to send bulk notifications");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send bulk notifications");
                return StatusCode(500, "Failed to send bulk notifications");
            }
        }

        /// <summary>
        /// Get notifications for the current user
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<NotificationDto>>> GetNotifications(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 50)
        {
            try
            {
                var userId = GetCurrentUserId();
                var notifications = await _notificationService.GetNotificationsAsync(userId, page, pageSize);
                return Ok(notifications);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to get notifications");
                return StatusCode(500, "Failed to get notifications");
            }
        }

        /// <summary>
        /// Get a specific notification
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<NotificationDto>> GetNotification(Guid id)
        {
            try
            {
                var notification = await _notificationService.GetNotificationAsync(id);
                return notification != null ? Ok(notification) : NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to get notification {id}");
                return StatusCode(500, "Failed to get notification");
            }
        }

        /// <summary>
        /// Mark a notification as read
        /// </summary>
        [HttpPut("{id}/read")]
        public async Task<ActionResult> MarkAsRead(Guid id)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _notificationService.MarkAsReadAsync(id, userId);
                return result ? Ok() : NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to mark notification {id} as read");
                return StatusCode(500, "Failed to mark notification as read");
            }
        }

        /// <summary>
        /// Mark all notifications as read for the current user
        /// </summary>
        [HttpPut("read-all")]
        public async Task<ActionResult> MarkAllAsRead()
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _notificationService.MarkAllAsReadAsync(userId);
                return result ? Ok() : BadRequest("Failed to mark all notifications as read");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to mark all notifications as read");
                return StatusCode(500, "Failed to mark all notifications as read");
            }
        }

        /// <summary>
        /// Get unread notification count for the current user
        /// </summary>
        [HttpGet("unread-count")]
        public async Task<ActionResult<int>> GetUnreadCount()
        {
            try
            {
                var userId = GetCurrentUserId();
                var count = await _notificationService.GetUnreadCountAsync(userId);
                return Ok(count);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to get unread count");
                return StatusCode(500, "Failed to get unread count");
            }
        }

        /// <summary>
        /// Delete a notification
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteNotification(Guid id)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _notificationService.DeleteNotificationAsync(id, userId);
                return result ? Ok() : NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to delete notification {id}");
                return StatusCode(500, "Failed to delete notification");
            }
        }

        /// <summary>
        /// Get notification statistics (Admin only)
        /// </summary>
        [HttpGet("stats")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<NotificationStatsDto>> GetNotificationStats([FromQuery] Guid? tenantId = null)
        {
            try
            {
                var stats = await _notificationService.GetNotificationStatsAsync(tenantId);
                return Ok(stats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to get notification stats");
                return StatusCode(500, "Failed to get notification stats");
            }
        }

        /// <summary>
        /// Update notification preferences for the current user
        /// </summary>
        [HttpPut("preferences")]
        public async Task<ActionResult> UpdateNotificationPreferences([FromBody] NotificationPreferencesDto preferences)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _notificationService.UpdateNotificationPreferencesAsync(userId, preferences);
                return result ? Ok() : BadRequest("Failed to update notification preferences");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to update notification preferences");
                return StatusCode(500, "Failed to update notification preferences");
            }
        }

        /// <summary>
        /// Get notification preferences for the current user
        /// </summary>
        [HttpGet("preferences")]
        public async Task<ActionResult<NotificationPreferencesDto>> GetNotificationPreferences()
        {
            try
            {
                var userId = GetCurrentUserId();
                var preferences = await _notificationService.GetNotificationPreferencesAsync(userId);
                return Ok(preferences);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to get notification preferences");
                return StatusCode(500, "Failed to get notification preferences");
            }
        }

        private Guid GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return Guid.TryParse(userIdClaim, out var userId) ? userId : Guid.Empty;
        }
    }

    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PushNotificationsController : ControllerBase
    {
        private readonly IPushNotificationService _pushService;
        private readonly ILogger<PushNotificationsController> _logger;

        public PushNotificationsController(
            IPushNotificationService pushService,
            ILogger<PushNotificationsController> logger)
        {
            _pushService = pushService;
            _logger = logger;
        }

        /// <summary>
        /// Register a device token for push notifications
        /// </summary>
        [HttpPost("register-device")]
        public async Task<ActionResult> RegisterDevice([FromBody] RegisterDeviceRequest request)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _pushService.RegisterDeviceTokenAsync(userId, request.DeviceToken, request.Platform);
                return result ? Ok() : BadRequest("Failed to register device");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to register device token");
                return StatusCode(500, "Failed to register device token");
            }
        }

        /// <summary>
        /// Unregister a device token
        /// </summary>
        [HttpPost("unregister-device")]
        public async Task<ActionResult> UnregisterDevice([FromBody] UnregisterDeviceRequest request)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _pushService.UnregisterDeviceTokenAsync(userId, request.DeviceToken);
                return result ? Ok() : BadRequest("Failed to unregister device");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to unregister device token");
                return StatusCode(500, "Failed to unregister device token");
            }
        }

        private Guid GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return Guid.TryParse(userIdClaim, out var userId) ? userId : Guid.Empty;
        }
    }

    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class NotificationTemplatesController : ControllerBase
    {
        private readonly INotificationTemplateService _templateService;
        private readonly ILogger<NotificationTemplatesController> _logger;

        public NotificationTemplatesController(
            INotificationTemplateService templateService,
            ILogger<NotificationTemplatesController> logger)
        {
            _templateService = templateService;
            _logger = logger;
        }

        /// <summary>
        /// Get all notification templates
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<NotificationTemplate>>> GetTemplates([FromQuery] string? type = null)
        {
            try
            {
                var templates = await _templateService.GetTemplatesAsync(type);
                return Ok(templates);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to get notification templates");
                return StatusCode(500, "Failed to get notification templates");
            }
        }

        /// <summary>
        /// Get a specific notification template
        /// </summary>
        [HttpGet("{name}/{type}")]
        public async Task<ActionResult<NotificationTemplate>> GetTemplate(string name, string type)
        {
            try
            {
                var template = await _templateService.GetTemplateAsync(name, type);
                return template != null ? Ok(template) : NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to get notification template {name}/{type}");
                return StatusCode(500, "Failed to get notification template");
            }
        }

        /// <summary>
        /// Create a new notification template
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<NotificationTemplate>> CreateTemplate([FromBody] CreateTemplateRequest request)
        {
            try
            {
                var template = await _templateService.CreateTemplateAsync(request);
                return CreatedAtAction(nameof(GetTemplate), new { name = template.Name, type = template.Type }, template);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to create notification template");
                return StatusCode(500, "Failed to create notification template");
            }
        }

        /// <summary>
        /// Update a notification template
        /// </summary>
        [HttpPut("{id}")]
        public async Task<ActionResult> UpdateTemplate(Guid id, [FromBody] UpdateTemplateRequest request)
        {
            try
            {
                var result = await _templateService.UpdateTemplateAsync(id, request);
                return result ? Ok() : NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to update notification template {id}");
                return StatusCode(500, "Failed to update notification template");
            }
        }

        /// <summary>
        /// Delete a notification template
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteTemplate(Guid id)
        {
            try
            {
                var result = await _templateService.DeleteTemplateAsync(id);
                return result ? Ok() : NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to delete notification template {id}");
                return StatusCode(500, "Failed to delete notification template");
            }
        }

        /// <summary>
        /// Validate a notification template
        /// </summary>
        [HttpPost("validate")]
        public async Task<ActionResult<bool>> ValidateTemplate([FromBody] ValidateTemplateRequest request)
        {
            try
            {
                var isValid = await _templateService.ValidateTemplateAsync(request.Template);
                return Ok(isValid);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to validate notification template");
                return StatusCode(500, "Failed to validate notification template");
            }
        }
    }

    // Request DTOs
    public class RegisterDeviceRequest
    {
        public string DeviceToken { get; set; } = string.Empty;
        public string Platform { get; set; } = string.Empty;
    }

    public class UnregisterDeviceRequest
    {
        public string DeviceToken { get; set; } = string.Empty;
    }

    public class ValidateTemplateRequest
    {
        public string Template { get; set; } = string.Empty;
    }
}

