using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
using Waaed.Shared.Infrastructure.Services;
using Waaed.Shared.Infrastructure.Middleware;

namespace Waaed.Shared.Infrastructure.Extensions
{
    public static class SharedInfrastructureExtensions
    {
        public static IServiceCollection AddSharedInfrastructure(this IServiceCollection services)
        {
            services.AddScoped<ICacheService, CacheService>();
            services.AddScoped<IAuditLogService, AuditLogService>();
            services.AddScoped<INotificationService, NotificationService>();
            services.AddScoped<IWorkflowAutomationService, WorkflowAutomationService>();
            
            return services;
        }
    }
}
