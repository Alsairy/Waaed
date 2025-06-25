using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using AttendancePlatform.Webhooks.Api.Services;

namespace AttendancePlatform.Webhooks.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class WebhooksController : ControllerBase
    {
        private readonly IWebhookService _webhookService;
        private readonly ILogger<WebhooksController> _logger;

        public WebhooksController(IWebhookService webhookService, ILogger<WebhooksController> logger)
        {
            _webhookService = webhookService;
            _logger = logger;
        }

        /// <summary>
        /// Create a new webhook subscription
        /// </summary>
        [HttpPost("subscriptions")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<ActionResult<WebhookSubscriptionDto>> CreateSubscription([FromBody] CreateWebhookSubscriptionRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var subscription = await _webhookService.CreateSubscriptionAsync(request);
                return CreatedAtAction(nameof(GetSubscription), new { id = subscription.Id }, subscription);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating webhook subscription");
                return StatusCode(500, new { message = "An error occurred while creating the webhook subscription" });
            }
        }

        /// <summary>
        /// Get all webhook subscriptions for the current tenant
        /// </summary>
        [HttpGet("subscriptions")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<ActionResult<IEnumerable<WebhookSubscriptionDto>>> GetSubscriptions()
        {
            try
            {
                var subscriptions = await _webhookService.GetSubscriptionsAsync();
                return Ok(subscriptions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving webhook subscriptions");
                return StatusCode(500, new { message = "An error occurred while retrieving webhook subscriptions" });
            }
        }

        /// <summary>
        /// Get a specific webhook subscription by ID
        /// </summary>
        [HttpGet("subscriptions/{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<ActionResult<WebhookSubscriptionDto>> GetSubscription(Guid id)
        {
            try
            {
                var subscription = await _webhookService.GetSubscriptionAsync(id);
                if (subscription == null)
                    return NotFound(new { message = "Webhook subscription not found" });

                return Ok(subscription);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving webhook subscription {SubscriptionId}", id);
                return StatusCode(500, new { message = "An error occurred while retrieving the webhook subscription" });
            }
        }

        /// <summary>
        /// Update an existing webhook subscription
        /// </summary>
        [HttpPut("subscriptions/{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> UpdateSubscription(Guid id, [FromBody] UpdateWebhookSubscriptionRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var success = await _webhookService.UpdateSubscriptionAsync(id, request);
                if (!success)
                    return NotFound(new { message = "Webhook subscription not found" });

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating webhook subscription {SubscriptionId}", id);
                return StatusCode(500, new { message = "An error occurred while updating the webhook subscription" });
            }
        }

        /// <summary>
        /// Delete a webhook subscription
        /// </summary>
        [HttpDelete("subscriptions/{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> DeleteSubscription(Guid id)
        {
            try
            {
                var success = await _webhookService.DeleteSubscriptionAsync(id);
                if (!success)
                    return NotFound(new { message = "Webhook subscription not found" });

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting webhook subscription {SubscriptionId}", id);
                return StatusCode(500, new { message = "An error occurred while deleting the webhook subscription" });
            }
        }

        /// <summary>
        /// Manually trigger a webhook for testing purposes
        /// </summary>
        [HttpPost("trigger")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> TriggerWebhook([FromBody] TriggerWebhookRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var success = await _webhookService.TriggerWebhookAsync(request.EventType, request.Payload);
                if (!success)
                    return BadRequest(new { message = "Failed to trigger webhook" });

                return Ok(new { message = "Webhook triggered successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error triggering webhook for event type {EventType}", request.EventType);
                return StatusCode(500, new { message = "An error occurred while triggering the webhook" });
            }
        }

        /// <summary>
        /// Get delivery history for a webhook subscription
        /// </summary>
        [HttpGet("subscriptions/{subscriptionId}/deliveries")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<ActionResult<IEnumerable<WebhookDeliveryDto>>> GetDeliveryHistory(
            Guid subscriptionId, 
            [FromQuery] int page = 1, 
            [FromQuery] int pageSize = 50)
        {
            try
            {
                if (page < 1) page = 1;
                if (pageSize < 1 || pageSize > 100) pageSize = 50;

                var deliveries = await _webhookService.GetDeliveryHistoryAsync(subscriptionId, page, pageSize);
                return Ok(deliveries);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving delivery history for subscription {SubscriptionId}", subscriptionId);
                return StatusCode(500, new { message = "An error occurred while retrieving delivery history" });
            }
        }

        /// <summary>
        /// Retry a failed webhook delivery
        /// </summary>
        [HttpPost("deliveries/{deliveryId}/retry")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> RetryDelivery(Guid deliveryId)
        {
            try
            {
                var success = await _webhookService.RetryDeliveryAsync(deliveryId);
                if (!success)
                    return NotFound(new { message = "Delivery not found or already successful" });

                return Ok(new { message = "Delivery retry initiated" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrying delivery {DeliveryId}", deliveryId);
                return StatusCode(500, new { message = "An error occurred while retrying the delivery" });
            }
        }

        /// <summary>
        /// Get webhook statistics for the current tenant
        /// </summary>
        [HttpGet("stats")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<ActionResult<WebhookStatsDto>> GetWebhookStats()
        {
            try
            {
                var stats = await _webhookService.GetWebhookStatsAsync();
                return Ok(stats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving webhook statistics");
                return StatusCode(500, new { message = "An error occurred while retrieving webhook statistics" });
            }
        }

        /// <summary>
        /// Get available webhook event types
        /// </summary>
        [HttpGet("event-types")]
        [Authorize(Roles = "Admin,Manager")]
        public ActionResult<IEnumerable<WebhookEventTypeDto>> GetEventTypes()
        {
            var eventTypes = new[]
            {
                new WebhookEventTypeDto { Name = "attendance.checkin", Description = "User checked in" },
                new WebhookEventTypeDto { Name = "attendance.checkout", Description = "User checked out" },
                new WebhookEventTypeDto { Name = "attendance.missed", Description = "User missed attendance" },
                new WebhookEventTypeDto { Name = "leave.requested", Description = "Leave request submitted" },
                new WebhookEventTypeDto { Name = "leave.approved", Description = "Leave request approved" },
                new WebhookEventTypeDto { Name = "leave.rejected", Description = "Leave request rejected" },
                new WebhookEventTypeDto { Name = "leave.cancelled", Description = "Leave request cancelled" },
                new WebhookEventTypeDto { Name = "permission.requested", Description = "Permission request submitted" },
                new WebhookEventTypeDto { Name = "permission.approved", Description = "Permission request approved" },
                new WebhookEventTypeDto { Name = "permission.rejected", Description = "Permission request rejected" },
                new WebhookEventTypeDto { Name = "user.created", Description = "New user created" },
                new WebhookEventTypeDto { Name = "user.updated", Description = "User information updated" },
                new WebhookEventTypeDto { Name = "user.deactivated", Description = "User account deactivated" },
                new WebhookEventTypeDto { Name = "face.enrolled", Description = "Face template enrolled" },
                new WebhookEventTypeDto { Name = "face.verified", Description = "Face verification completed" },
                new WebhookEventTypeDto { Name = "biometric.enrolled", Description = "Biometric template enrolled" },
                new WebhookEventTypeDto { Name = "biometric.verified", Description = "Biometric verification completed" },
                new WebhookEventTypeDto { Name = "geofence.entered", Description = "User entered geofence" },
                new WebhookEventTypeDto { Name = "geofence.exited", Description = "User exited geofence" },
                new WebhookEventTypeDto { Name = "beacon.detected", Description = "Beacon detected" },
                new WebhookEventTypeDto { Name = "system.alert", Description = "System alert generated" },
                new WebhookEventTypeDto { Name = "security.breach", Description = "Security breach detected" },
                new WebhookEventTypeDto { Name = "compliance.violation", Description = "Compliance violation detected" }
            };

            return Ok(eventTypes);
        }

        /// <summary>
        /// Health check endpoint
        /// </summary>
        [HttpGet("health")]
        [AllowAnonymous]
        public IActionResult Health()
        {
            return Ok(new
            {
                service = "Webhook Service",
                status = "healthy",
                timestamp = DateTime.UtcNow,
                version = "1.0.0"
            });
        }
    }

    public class TriggerWebhookRequest
    {
        public string EventType { get; set; } = string.Empty;
        public object Payload { get; set; } = new();
    }

    public class WebhookEventTypeDto
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }
}

