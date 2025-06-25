using Microsoft.EntityFrameworkCore;
using AttendancePlatform.Shared.Domain.Interfaces;
using AttendancePlatform.Shared.Domain.Entities;
using AttendancePlatform.Shared.Infrastructure.Data;
using System.Text.Json;
using System.Security.Cryptography;
using System.Text;

namespace AttendancePlatform.Webhooks.Api.Services
{
    public interface IWebhookService
    {
        Task<WebhookSubscriptionDto> CreateSubscriptionAsync(CreateWebhookSubscriptionRequest request);
        Task<bool> UpdateSubscriptionAsync(Guid id, UpdateWebhookSubscriptionRequest request);
        Task<bool> DeleteSubscriptionAsync(Guid id);
        Task<IEnumerable<WebhookSubscriptionDto>> GetSubscriptionsAsync(Guid? tenantId = null);
        Task<WebhookSubscriptionDto?> GetSubscriptionAsync(Guid id);
        Task<bool> TriggerWebhookAsync(string eventType, object payload, Guid? tenantId = null);
        Task<IEnumerable<WebhookDeliveryDto>> GetDeliveryHistoryAsync(Guid subscriptionId, int page = 1, int pageSize = 50);
        Task<bool> RetryDeliveryAsync(Guid deliveryId);
        Task<WebhookStatsDto> GetWebhookStatsAsync(Guid? tenantId = null);
    }

    public class WebhookService : IWebhookService
    {
        private readonly AttendancePlatformDbContext _context;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ILogger<WebhookService> _logger;
        private readonly ITenantContext _tenantContext;
        private readonly ICurrentUserService _currentUserService;

        public WebhookService(
            AttendancePlatformDbContext context,
            IHttpClientFactory httpClientFactory,
            ILogger<WebhookService> logger,
            ITenantContext tenantContext,
            ICurrentUserService currentUserService)
        {
            _context = context;
            _httpClientFactory = httpClientFactory;
            _logger = logger;
            _tenantContext = tenantContext;
            _currentUserService = currentUserService;
        }

        public async Task<WebhookSubscriptionDto> CreateSubscriptionAsync(CreateWebhookSubscriptionRequest request)
        {
            var subscription = new WebhookSubscription
            {
                Id = Guid.NewGuid(),
                TenantId = _tenantContext.TenantId ?? Guid.Empty,
                Name = request.Name,
                Url = request.Url,
                EventTypes = request.EventTypes,
                Secret = GenerateSecret(),
                IsActive = true,
                Headers = request.Headers ?? new Dictionary<string, string>(),
                RetryPolicy = new WebhookRetryPolicy
                {
                    MaxRetries = request.MaxRetries ?? 3,
                    RetryDelaySeconds = request.RetryDelaySeconds ?? 60,
                    ExponentialBackoff = request.ExponentialBackoff ?? true
                },
                CreatedAt = DateTime.UtcNow,
                CreatedBy = _currentUserService.UserId?.ToString() ?? string.Empty
            };

            _context.WebhookSubscriptions.Add(subscription);
            await _context.SaveChangesAsync();

            _logger.LogInformation($"Created webhook subscription {subscription.Id} for tenant {subscription.TenantId}");

            return MapToDto(subscription);
        }

        public async Task<bool> UpdateSubscriptionAsync(Guid id, UpdateWebhookSubscriptionRequest request)
        {
            var subscription = await _context.WebhookSubscriptions
                .FirstOrDefaultAsync(w => w.Id == id && w.TenantId == _tenantContext.TenantId);

            if (subscription == null)
                return false;

            subscription.Name = request.Name ?? subscription.Name;
            subscription.Url = request.Url ?? subscription.Url;
            subscription.EventTypes = request.EventTypes ?? subscription.EventTypes;
            subscription.IsActive = request.IsActive ?? subscription.IsActive;
            subscription.Headers = request.Headers ?? subscription.Headers;
            
            if (request.MaxRetries.HasValue || request.RetryDelaySeconds.HasValue || request.ExponentialBackoff.HasValue)
            {
                subscription.RetryPolicy.MaxRetries = request.MaxRetries ?? subscription.RetryPolicy.MaxRetries;
                subscription.RetryPolicy.RetryDelaySeconds = request.RetryDelaySeconds ?? subscription.RetryPolicy.RetryDelaySeconds;
                subscription.RetryPolicy.ExponentialBackoff = request.ExponentialBackoff ?? subscription.RetryPolicy.ExponentialBackoff;
            }

            subscription.UpdatedAt = DateTime.UtcNow;
            subscription.UpdatedBy = _currentUserService.UserId?.ToString() ?? string.Empty;

            await _context.SaveChangesAsync();

            _logger.LogInformation($"Updated webhook subscription {id}");

            return true;
        }

        public async Task<bool> DeleteSubscriptionAsync(Guid id)
        {
            var subscription = await _context.WebhookSubscriptions
                .FirstOrDefaultAsync(w => w.Id == id && w.TenantId == _tenantContext.TenantId);

            if (subscription == null)
                return false;

            _context.WebhookSubscriptions.Remove(subscription);
            await _context.SaveChangesAsync();

            _logger.LogInformation($"Deleted webhook subscription {id}");

            return true;
        }

        public async Task<IEnumerable<WebhookSubscriptionDto>> GetSubscriptionsAsync(Guid? tenantId = null)
        {
            var query = _context.WebhookSubscriptions.AsQueryable();

            if (tenantId.HasValue)
                query = query.Where(w => w.TenantId == tenantId.Value);
            else
                query = query.Where(w => w.TenantId == _tenantContext.TenantId);

            var subscriptions = await query.ToListAsync();

            return subscriptions.Select(MapToDto);
        }

        public async Task<WebhookSubscriptionDto?> GetSubscriptionAsync(Guid id)
        {
            var subscription = await _context.WebhookSubscriptions
                .FirstOrDefaultAsync(w => w.Id == id && w.TenantId == _tenantContext.TenantId);

            return subscription != null ? MapToDto(subscription) : null;
        }

        public async Task<bool> TriggerWebhookAsync(string eventType, object payload, Guid? tenantId = null)
        {
            var targetTenantId = tenantId ?? _tenantContext.TenantId;

            var subscriptions = await _context.WebhookSubscriptions
                .Where(w => w.TenantId == targetTenantId && 
                           w.IsActive && 
                           w.EventTypes.Contains(eventType))
                .ToListAsync();

            if (!subscriptions.Any())
            {
                _logger.LogInformation($"No active webhook subscriptions found for event type {eventType}");
                return true;
            }

            var webhookPayload = new
            {
                EventType = eventType,
                Timestamp = DateTime.UtcNow,
                TenantId = targetTenantId,
                Data = payload
            };

            var tasks = subscriptions.Select(subscription => 
                DeliverWebhookAsync(subscription, webhookPayload));

            await Task.WhenAll(tasks);

            return true;
        }

        public async Task<IEnumerable<WebhookDeliveryDto>> GetDeliveryHistoryAsync(Guid subscriptionId, int page = 1, int pageSize = 50)
        {
            var deliveries = await _context.WebhookDeliveries
                .Where(d => d.SubscriptionId == subscriptionId)
                .OrderByDescending(d => d.AttemptedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return deliveries.Select(d => new WebhookDeliveryDto
            {
                Id = d.Id,
                SubscriptionId = d.SubscriptionId,
                EventType = d.EventType,
                Payload = d.Payload,
                HttpStatusCode = d.HttpStatusCode,
                ResponseBody = d.ResponseBody,
                AttemptedAt = d.AttemptedAt,
                IsSuccessful = d.IsSuccessful,
                ErrorMessage = d.ErrorMessage,
                RetryCount = d.RetryCount
            });
        }

        public async Task<bool> RetryDeliveryAsync(Guid deliveryId)
        {
            var delivery = await _context.WebhookDeliveries
                .Include(d => d.Subscription)
                .FirstOrDefaultAsync(d => d.Id == deliveryId);

            if (delivery == null || delivery.IsSuccessful)
                return false;

            var payload = JsonSerializer.Deserialize<object>(delivery.Payload);
            await DeliverWebhookAsync(delivery.Subscription, payload);

            return true;
        }

        public async Task<WebhookStatsDto> GetWebhookStatsAsync(Guid? tenantId = null)
        {
            var targetTenantId = tenantId ?? _tenantContext.TenantId;

            var totalSubscriptions = await _context.WebhookSubscriptions
                .CountAsync(w => w.TenantId == targetTenantId);

            var activeSubscriptions = await _context.WebhookSubscriptions
                .CountAsync(w => w.TenantId == targetTenantId && w.IsActive);

            var totalDeliveries = await _context.WebhookDeliveries
                .Where(d => d.Subscription.TenantId == targetTenantId)
                .CountAsync();

            var successfulDeliveries = await _context.WebhookDeliveries
                .Where(d => d.Subscription.TenantId == targetTenantId && d.IsSuccessful)
                .CountAsync();

            var failedDeliveries = totalDeliveries - successfulDeliveries;

            var recentDeliveries = await _context.WebhookDeliveries
                .Where(d => d.Subscription.TenantId == targetTenantId && 
                           d.AttemptedAt >= DateTime.UtcNow.AddDays(-7))
                .CountAsync();

            return new WebhookStatsDto
            {
                TotalSubscriptions = totalSubscriptions,
                ActiveSubscriptions = activeSubscriptions,
                TotalDeliveries = totalDeliveries,
                SuccessfulDeliveries = successfulDeliveries,
                FailedDeliveries = failedDeliveries,
                SuccessRate = totalDeliveries > 0 ? (double)successfulDeliveries / totalDeliveries * 100 : 0,
                RecentDeliveries = recentDeliveries
            };
        }

        private async Task DeliverWebhookAsync(WebhookSubscription subscription, object payload)
        {
            var delivery = new WebhookDelivery
            {
                Id = Guid.NewGuid(),
                SubscriptionId = subscription.Id,
                EventType = ((dynamic)payload).EventType,
                Payload = JsonSerializer.Serialize(payload),
                AttemptedAt = DateTime.UtcNow,
                RetryCount = 0
            };

            try
            {
                using var httpClient = _httpClientFactory.CreateClient();
                httpClient.Timeout = TimeSpan.FromSeconds(30);

                var jsonPayload = JsonSerializer.Serialize(payload);
                var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

                // Add custom headers
                foreach (var header in subscription.Headers)
                {
                    httpClient.DefaultRequestHeaders.Add(header.Key, header.Value);
                }

                // Add signature header for security
                var signature = GenerateSignature(jsonPayload, subscription.Secret);
                httpClient.DefaultRequestHeaders.Add("X-Webhook-Signature", signature);

                var response = await httpClient.PostAsync(subscription.Url, content);

                delivery.HttpStatusCode = (int)response.StatusCode;
                delivery.ResponseBody = await response.Content.ReadAsStringAsync();
                delivery.IsSuccessful = response.IsSuccessStatusCode;

                if (!response.IsSuccessStatusCode)
                {
                    delivery.ErrorMessage = $"HTTP {response.StatusCode}: {response.ReasonPhrase}";
                    _logger.LogWarning($"Webhook delivery failed for subscription {subscription.Id}: {delivery.ErrorMessage}");
                }
                else
                {
                    _logger.LogInformation($"Webhook delivered successfully to {subscription.Url}");
                }
            }
            catch (Exception ex)
            {
                delivery.IsSuccessful = false;
                delivery.ErrorMessage = ex.Message;
                _logger.LogError(ex, $"Exception during webhook delivery to {subscription.Url}");
            }

            _context.WebhookDeliveries.Add(delivery);
            await _context.SaveChangesAsync();

            // Schedule retry if failed and retries are configured
            if (!delivery.IsSuccessful && subscription.RetryPolicy.MaxRetries > 0)
            {
                _ = Task.Run(async () => await ScheduleRetryAsync(subscription, payload, delivery.RetryCount + 1));
            }
        }

        private async Task ScheduleRetryAsync(WebhookSubscription subscription, object payload, int retryCount)
        {
            if (retryCount > subscription.RetryPolicy.MaxRetries)
                return;

            var delay = subscription.RetryPolicy.RetryDelaySeconds;
            if (subscription.RetryPolicy.ExponentialBackoff)
            {
                delay = (int)(delay * Math.Pow(2, retryCount - 1));
            }

            await Task.Delay(TimeSpan.FromSeconds(delay));
            await DeliverWebhookAsync(subscription, payload);
        }

        private string GenerateSecret()
        {
            using var rng = RandomNumberGenerator.Create();
            var bytes = new byte[32];
            rng.GetBytes(bytes);
            return Convert.ToBase64String(bytes);
        }

        private string GenerateSignature(string payload, string secret)
        {
            using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(secret));
            var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(payload));
            return $"sha256={Convert.ToHexString(hash).ToLower()}";
        }

        private WebhookSubscriptionDto MapToDto(WebhookSubscription subscription)
        {
            return new WebhookSubscriptionDto
            {
                Id = subscription.Id,
                Name = subscription.Name,
                Url = subscription.Url,
                EventTypes = subscription.EventTypes,
                IsActive = subscription.IsActive,
                Headers = subscription.Headers,
                MaxRetries = subscription.RetryPolicy.MaxRetries,
                RetryDelaySeconds = subscription.RetryPolicy.RetryDelaySeconds,
                ExponentialBackoff = subscription.RetryPolicy.ExponentialBackoff,
                CreatedAt = subscription.CreatedAt,
                UpdatedAt = subscription.UpdatedAt
            };
        }
    }


    public class WebhookSubscriptionDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Url { get; set; } = string.Empty;
        public List<string> EventTypes { get; set; } = new();
        public bool IsActive { get; set; }
        public Dictionary<string, string> Headers { get; set; } = new();
        public int MaxRetries { get; set; }
        public int RetryDelaySeconds { get; set; }
        public bool ExponentialBackoff { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class WebhookDeliveryDto
    {
        public Guid Id { get; set; }
        public Guid SubscriptionId { get; set; }
        public string EventType { get; set; } = string.Empty;
        public string Payload { get; set; } = string.Empty;
        public int? HttpStatusCode { get; set; }
        public string? ResponseBody { get; set; }
        public DateTime AttemptedAt { get; set; }
        public bool IsSuccessful { get; set; }
        public string? ErrorMessage { get; set; }
        public int RetryCount { get; set; }
    }

    public class WebhookStatsDto
    {
        public int TotalSubscriptions { get; set; }
        public int ActiveSubscriptions { get; set; }
        public int TotalDeliveries { get; set; }
        public int SuccessfulDeliveries { get; set; }
        public int FailedDeliveries { get; set; }
        public double SuccessRate { get; set; }
        public int RecentDeliveries { get; set; }
    }

    public class CreateWebhookSubscriptionRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Url { get; set; } = string.Empty;
        public List<string> EventTypes { get; set; } = new();
        public Dictionary<string, string>? Headers { get; set; }
        public int? MaxRetries { get; set; }
        public int? RetryDelaySeconds { get; set; }
        public bool? ExponentialBackoff { get; set; }
    }

    public class UpdateWebhookSubscriptionRequest
    {
        public string? Name { get; set; }
        public string? Url { get; set; }
        public List<string>? EventTypes { get; set; }
        public bool? IsActive { get; set; }
        public Dictionary<string, string>? Headers { get; set; }
        public int? MaxRetries { get; set; }
        public int? RetryDelaySeconds { get; set; }
        public bool? ExponentialBackoff { get; set; }
    }
}

