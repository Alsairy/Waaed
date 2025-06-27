using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using System.Text.Json;
using StackExchange.Redis;
using System.Diagnostics.Metrics;

namespace AttendancePlatform.Shared.Infrastructure.Services
{
    public class CacheService : ICacheService
    {
        private readonly IDistributedCache _distributedCache;
        private readonly IMemoryCache _memoryCache;
        private readonly ILogger<CacheService> _logger;
        private readonly IConnectionMultiplexer? _redis;

        public CacheService(
            IDistributedCache distributedCache,
            IMemoryCache memoryCache,
            ILogger<CacheService> logger,
            IConnectionMultiplexer? redis = null)
        {
            _distributedCache = distributedCache;
            _memoryCache = memoryCache;
            _logger = logger;
            _redis = redis;
        }

        public async Task<T?> GetAsync<T>(string key)
        {
            try
            {
                if (_memoryCache.TryGetValue(key, out T? cachedValue))
                {
                    _logger.LogDebug("Cache hit (memory): {Key}", key);
                    return cachedValue;
                }

                var distributedValue = await _distributedCache.GetStringAsync(key);
                if (!string.IsNullOrEmpty(distributedValue))
                {
                    var deserializedValue = JsonSerializer.Deserialize<T>(distributedValue);
                    
                    _memoryCache.Set(key, deserializedValue, TimeSpan.FromMinutes(5));
                    
                    _logger.LogDebug("Cache hit (distributed): {Key}", key);
                    return deserializedValue;
                }

                _logger.LogDebug("Cache miss: {Key}", key);
                return default(T);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving from cache: {Key}", key);
                return default(T);
            }
        }

        public async Task SetAsync<T>(string key, T value, TimeSpan? expiration = null)
        {
            try
            {
                var serializedValue = JsonSerializer.Serialize(value);
                var options = new DistributedCacheEntryOptions();

                if (expiration.HasValue)
                {
                    options.SetAbsoluteExpiration(expiration.Value);
                }
                else
                {
                    options.SetSlidingExpiration(TimeSpan.FromMinutes(30));
                }

                await _distributedCache.SetStringAsync(key, serializedValue, options);

                var memoryExpiration = expiration ?? TimeSpan.FromMinutes(5);
                _memoryCache.Set(key, value, memoryExpiration);

                _logger.LogDebug("Cache set: {Key}, Expiration: {Expiration}", key, expiration);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error setting cache: {Key}", key);
            }
        }

        public async Task RemoveAsync(string key)
        {
            try
            {
                await _distributedCache.RemoveAsync(key);
                _memoryCache.Remove(key);
                
                _logger.LogDebug("Cache removed: {Key}", key);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing from cache: {Key}", key);
            }
        }

        public async Task RemoveByPatternAsync(string pattern)
        {
            try
            {
                if (_redis != null)
                {
                    var database = _redis.GetDatabase();
                    var server = _redis.GetServer(_redis.GetEndPoints().First());
                    
                    var keys = server.Keys(pattern: pattern);
                    foreach (var key in keys)
                    {
                        await database.KeyDeleteAsync(key);
                        _memoryCache.Remove(key.ToString());
                    }
                    
                    _logger.LogDebug("Cache pattern removed: {Pattern}", pattern);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing cache pattern: {Pattern}", pattern);
            }
        }

        public async Task<T> GetOrSetAsync<T>(string key, Func<Task<T>> getItem, TimeSpan? expiration = null)
        {
            var cachedValue = await GetAsync<T>(key);
            if (cachedValue != null)
            {
                return cachedValue;
            }

            var item = await getItem();
            if (item != null)
            {
                await SetAsync(key, item, expiration);
            }

            return item;
        }

        public async Task<bool> ExistsAsync(string key)
        {
            try
            {
                if (_memoryCache.TryGetValue(key, out _))
                {
                    return true;
                }

                var value = await _distributedCache.GetStringAsync(key);
                return !string.IsNullOrEmpty(value);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking cache existence: {Key}", key);
                return false;
            }
        }

        public async Task RefreshAsync(string key)
        {
            try
            {
                await _distributedCache.RefreshAsync(key);
                _logger.LogDebug("Cache refreshed: {Key}", key);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error refreshing cache: {Key}", key);
            }
        }
    }

    public class CacheMetrics
    {
        private static readonly Meter _meter = new("AttendancePlatform.Cache");
        private readonly Counter<long> _cacheHits = _meter.CreateCounter<long>("cache_hits_total");
        private readonly Counter<long> _cacheMisses = _meter.CreateCounter<long>("cache_misses_total");
        private readonly Counter<long> _cacheErrors = _meter.CreateCounter<long>("cache_errors_total");

        public void RecordCacheHit(string key)
        {
            _cacheHits.Add(1, new KeyValuePair<string, object?>("cache_key", key));
        }

        public void RecordCacheMiss(string key)
        {
            _cacheMisses.Add(1, new KeyValuePair<string, object?>("cache_key", key));
        }

        public void RecordCacheError(string key)
        {
            _cacheErrors.Add(1, new KeyValuePair<string, object?>("cache_key", key));
        }
    }
}
