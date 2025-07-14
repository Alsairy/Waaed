using System.Security.Claims;
using Microsoft.AspNetCore.Http;

namespace Waaed.Shared.Infrastructure.Services
{
    public interface IUserContextService
    {
        Guid GetCurrentUserId();
        Guid GetCurrentTenantId();
        string GetCurrentUserEmail();
        IEnumerable<string> GetCurrentUserRoles();
        bool IsAuthenticated();
    }

    public class UserContextService : IUserContextService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public UserContextService(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public Guid GetCurrentUserId()
        {
            var userIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirst("userId") 
                ?? _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier);
            
            if (userIdClaim != null && Guid.TryParse(userIdClaim.Value, out var userId))
                return userId;
                
            throw new UnauthorizedAccessException("User ID not found in JWT token");
        }

        public Guid GetCurrentTenantId()
        {
            var tenantIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirst("tenantId");
            
            if (tenantIdClaim != null && Guid.TryParse(tenantIdClaim.Value, out var tenantId))
                return tenantId;
                
            throw new UnauthorizedAccessException("Tenant ID not found in JWT token");
        }

        public string GetCurrentUserEmail()
        {
            return _httpContextAccessor.HttpContext?.User?.FindFirst("email")?.Value 
                ?? _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.Email)?.Value
                ?? throw new UnauthorizedAccessException("Email not found in JWT token");
        }

        public IEnumerable<string> GetCurrentUserRoles()
        {
            return _httpContextAccessor.HttpContext?.User?.FindAll("role")
                .Select(c => c.Value) ?? Enumerable.Empty<string>();
        }

        public bool IsAuthenticated()
        {
            return _httpContextAccessor.HttpContext?.User?.Identity?.IsAuthenticated == true;
        }
    }
}
