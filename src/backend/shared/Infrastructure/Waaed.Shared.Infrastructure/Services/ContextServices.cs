using Microsoft.AspNetCore.Http;
using AttendancePlatform.Shared.Domain.Interfaces;

namespace AttendancePlatform.Shared.Infrastructure.Services
{
    public class TenantContext : ITenantContext
    {
        private Guid? _tenantId;
        private string? _tenantSubdomain;

        public Guid? TenantId => _tenantId;
        public string? TenantSubdomain => _tenantSubdomain;

        public void SetTenant(Guid tenantId, string subdomain)
        {
            _tenantId = tenantId;
            _tenantSubdomain = subdomain;
        }
    }

    public class DateTimeProvider : IDateTimeProvider
    {
        public DateTime UtcNow => DateTime.UtcNow;
        public DateTime Now => DateTime.Now;
        public DateOnly Today => DateOnly.FromDateTime(DateTime.Today);
    }

    public class CurrentUserService : ICurrentUserService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public CurrentUserService(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public Guid? UserId
        {
            get
            {
                var userIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirst("sub") ??
                                 _httpContextAccessor.HttpContext?.User?.FindFirst("userId");
                
                if (userIdClaim != null && Guid.TryParse(userIdClaim.Value, out var userId))
                {
                    return userId;
                }
                
                return null;
            }
        }

        public string? UserName => _httpContextAccessor.HttpContext?.User?.FindFirst("name")?.Value ??
                                  _httpContextAccessor.HttpContext?.User?.Identity?.Name;

        public string? Email => _httpContextAccessor.HttpContext?.User?.FindFirst("email")?.Value;

        public IEnumerable<string> Roles => _httpContextAccessor.HttpContext?.User?.FindAll("role")?.Select(c => c.Value) ?? 
                                           Enumerable.Empty<string>();

        public bool IsAuthenticated => _httpContextAccessor.HttpContext?.User?.Identity?.IsAuthenticated ?? false;

        public bool HasPermission(string permission)
        {
            return _httpContextAccessor.HttpContext?.User?.FindAll("permission")?.Any(c => c.Value == permission) ?? false;
        }

        public bool HasRole(string role)
        {
            return Roles.Contains(role);
        }
    }
}

