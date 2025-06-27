using System;
using System.Threading.Tasks;

namespace AttendancePlatform.Shared.Infrastructure.Services
{
    public interface ICacheService
    {
        Task<T?> GetAsync<T>(string key);
        Task SetAsync<T>(string key, T value, TimeSpan? expiration = null);
        Task RemoveAsync(string key);
        Task RemoveByPatternAsync(string pattern);
        Task<T> GetOrSetAsync<T>(string key, Func<Task<T>> getItem, TimeSpan? expiration = null);
        Task<bool> ExistsAsync(string key);
        Task RefreshAsync(string key);
    }
}
