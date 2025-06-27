using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Net;

namespace AttendancePlatform.Shared.Infrastructure.Middleware
{
    public class RateLimitingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly IMemoryCache _cache;
        private readonly ILogger<RateLimitingMiddleware> _logger;
        private readonly RateLimitOptions _options;

        public RateLimitingMiddleware(
            RequestDelegate next,
            IMemoryCache cache,
            ILogger<RateLimitingMiddleware> logger,
            IOptions<RateLimitOptions> options)
        {
            _next = next;
            _cache = cache;
            _logger = logger;
            _options = options.Value;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var clientId = GetClientIdentifier(context);
            var key = $"rate_limit_{clientId}";

            if (!_cache.TryGetValue(key, out RateLimitInfo? rateLimitInfo))
            {
                rateLimitInfo = new RateLimitInfo
                {
                    RequestCount = 1,
                    WindowStart = DateTime.UtcNow
                };

                var cacheEntryOptions = new MemoryCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(_options.WindowSizeInMinutes),
                    Size = 1
                };
                _cache.Set(key, rateLimitInfo, cacheEntryOptions);
            }
            else
            {
                if (rateLimitInfo != null && DateTime.UtcNow - rateLimitInfo.WindowStart > TimeSpan.FromMinutes(_options.WindowSizeInMinutes))
                {
                    rateLimitInfo.RequestCount = 1;
                    rateLimitInfo.WindowStart = DateTime.UtcNow;
                }
                else if (rateLimitInfo != null)
                {
                    rateLimitInfo.RequestCount++;
                }

                var cacheEntryOptions = new MemoryCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(_options.WindowSizeInMinutes),
                    Size = 1
                };
                _cache.Set(key, rateLimitInfo, cacheEntryOptions);
            }

            if (rateLimitInfo.RequestCount > _options.MaxRequests)
            {
                _logger.LogWarning("Rate limit exceeded for client: {ClientId}, Requests: {RequestCount}", 
                    clientId, rateLimitInfo.RequestCount);

                context.Response.StatusCode = (int)HttpStatusCode.TooManyRequests;
                context.Response.Headers.Add("Retry-After", (_options.WindowSizeInMinutes * 60).ToString());
                
                await context.Response.WriteAsync("Rate limit exceeded. Please try again later.");
                return;
            }

            context.Response.Headers.Add("X-RateLimit-Limit", _options.MaxRequests.ToString());
            context.Response.Headers.Add("X-RateLimit-Remaining", 
                Math.Max(0, _options.MaxRequests - rateLimitInfo.RequestCount).ToString());
            context.Response.Headers.Add("X-RateLimit-Reset", 
                ((DateTimeOffset)(rateLimitInfo.WindowStart.AddMinutes(_options.WindowSizeInMinutes))).ToUnixTimeSeconds().ToString());

            await _next(context);
        }

        private string GetClientIdentifier(HttpContext context)
        {
            var userId = context.User?.FindFirst("sub")?.Value ?? 
                        context.User?.FindFirst("userId")?.Value;
            
            if (!string.IsNullOrEmpty(userId))
            {
                return $"user_{userId}";
            }

            var ipAddress = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
            
            if (context.Request.Headers.ContainsKey("X-Forwarded-For"))
            {
                ipAddress = context.Request.Headers["X-Forwarded-For"].FirstOrDefault() ?? ipAddress;
            }
            else if (context.Request.Headers.ContainsKey("X-Real-IP"))
            {
                ipAddress = context.Request.Headers["X-Real-IP"].FirstOrDefault() ?? ipAddress;
            }

            return $"ip_{ipAddress}";
        }
    }

    public class RateLimitOptions
    {
        public int MaxRequests { get; set; } = 100;
        public int WindowSizeInMinutes { get; set; } = 1;
    }

    public class RateLimitInfo
    {
        public int RequestCount { get; set; }
        public DateTime WindowStart { get; set; }
    }
}
