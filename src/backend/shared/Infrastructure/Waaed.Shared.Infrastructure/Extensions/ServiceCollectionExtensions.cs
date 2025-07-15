using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Waaed.Shared.Domain.Interfaces;
using Waaed.Shared.Infrastructure.Data;
using Waaed.Shared.Infrastructure.Services;
using Waaed.Shared.Infrastructure.Repositories;
using Waaed.Shared.Infrastructure.Security;
using Waaed.Shared.Infrastructure.Middleware;
using StackExchange.Redis;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Caching.Memory;

namespace Waaed.Shared.Infrastructure.Extensions
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
        {
            // Add DbContext with optimized configuration
            services.AddDbContext<WaaedDbContext>(options =>
                options.UseSqlServer(configuration.GetConnectionString("DefaultConnection"),
                    b => {
                        b.MigrationsAssembly(typeof(WaaedDbContext).Assembly.FullName);
                        b.EnableRetryOnFailure(maxRetryCount: 3, maxRetryDelay: TimeSpan.FromSeconds(5), errorNumbersToAdd: null);
                        b.CommandTimeout(30);
                    }), ServiceLifetime.Scoped);

            var redisConnectionString = configuration.GetConnectionString("Redis") ?? 
                                      configuration["Redis:ConnectionString"] ?? 
                                      "localhost:6379";
            
            services.AddStackExchangeRedisCache(options =>
            {
                options.Configuration = redisConnectionString;
                options.InstanceName = "Waaed";
            });

            services.AddMemoryCache(options =>
            {
                options.SizeLimit = 1024; // Limit cache size
                options.CompactionPercentage = 0.25; // Compact when 25% over limit
            });

            services.AddScoped<ICacheService, CacheService>();

            // Add repositories
            services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
            services.AddScoped(typeof(ITenantRepository<>), typeof(TenantRepository<>));
            services.AddScoped<IUnitOfWork, UnitOfWork>();

            services.AddScoped<ITenantContext, TenantContext>();
            services.AddScoped<ICurrentUserService, CurrentUserService>();
            services.AddSingleton<IDateTimeProvider, DateTimeProvider>();

            services.AddScoped<IWorkflowAutomationService, WorkflowAutomationService>();
            services.AddScoped<INotificationService, NotificationService>();

            // Add HTTP context accessor
            services.AddHttpContextAccessor();

            return services;
        }

        public static IServiceCollection AddMultiTenancy(this IServiceCollection services)
        {
            services.AddScoped<ITenantContext, TenantContext>();
            return services;
        }

        public static async Task<IServiceProvider> MigrateDatabaseAsync(this IServiceProvider serviceProvider)
        {
            using var scope = serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<WaaedDbContext>();
            
            try
            {
                await context.Database.MigrateAsync();
            }
            catch (Exception ex)
            {
                // Log the exception
                Console.WriteLine($"Database migration failed: {ex.Message}");
                throw;
            }

            return serviceProvider;
        }

        public static IServiceCollection AddSecurityServices(this IServiceCollection services, IConfiguration configuration)
        {
            var encryptionKey = configuration["Security:EncryptionKey"] ?? 
                               configuration["ENCRYPTION_KEY"] ?? 
                               throw new InvalidOperationException("Encryption key not configured");
            
            services.AddSingleton<IEncryptionService>(provider => new EncryptionService(encryptionKey));
            services.AddScoped<IAuditLogService, AuditLogService>();
            services.AddScoped<IComplianceReportingService, ComplianceReportingService>();
            
            services.Configure<RateLimitOptions>(options =>
            {
                options.MaxRequests = configuration.GetValue<int>("RATE_LIMIT_REQUESTS_PER_MINUTE", 100);
                options.WindowSizeInMinutes = 1;
            });

            services.AddCors(options =>
            {
                options.AddDefaultPolicy(builder =>
                {
                    var origins = configuration["CORS_ORIGINS"]?.Split(',') ?? new[] { "https://localhost:3000" };
                    builder.WithOrigins(origins)
                           .AllowAnyMethod()
                           .AllowAnyHeader()
                           .AllowCredentials();
                });
            });

            return services;
        }


    }
}

