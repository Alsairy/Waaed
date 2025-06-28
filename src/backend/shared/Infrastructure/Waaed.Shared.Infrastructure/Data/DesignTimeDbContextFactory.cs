using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;
using Waaed.Shared.Domain.Interfaces;
using Waaed.Shared.Infrastructure.Services;

namespace Waaed.Shared.Infrastructure.Data
{
    public class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<WaaedDbContext>
    {
        public WaaedDbContext CreateDbContext(string[] args)
        {
            var optionsBuilder = new DbContextOptionsBuilder<WaaedDbContext>();
            
            var connectionString = "Server=host.docker.internal,1433;Database=Waaed;User Id=sa;Password=AttendanceP@ssw0rd123;TrustServerCertificate=true";
            
            optionsBuilder.UseSqlServer(connectionString, b => {
                b.MigrationsAssembly(typeof(WaaedDbContext).Assembly.FullName);
                b.EnableRetryOnFailure(maxRetryCount: 3, maxRetryDelay: TimeSpan.FromSeconds(5), errorNumbersToAdd: null);
                b.CommandTimeout(30);
            });

            var mockTenantContext = new MockTenantContext();
            var mockCurrentUserService = new MockCurrentUserService();
            var mockDateTimeProvider = new DateTimeProvider();

            return new WaaedDbContext(optionsBuilder.Options, mockTenantContext, mockCurrentUserService, mockDateTimeProvider);
        }
    }

    public class MockTenantContext : ITenantContext
    {
        public Guid? TenantId => Guid.Parse("00000000-0000-0000-0000-000000000001");
        public string? TenantSubdomain => "design-time";
        
        public void SetTenant(Guid tenantId, string subdomain)
        {
        }
    }

    public class MockCurrentUserService : ICurrentUserService
    {
        public Guid? UserId => Guid.Parse("00000000-0000-0000-0000-000000000001");
        public string? UserName => "Design Time User";
        public string? Email => "design@time.com";
        public IEnumerable<string> Roles => new[] { "Admin" };
        public bool IsAuthenticated => true;
        
        public bool HasPermission(string permission) => true;
        public bool HasRole(string role) => true;
    }
}
