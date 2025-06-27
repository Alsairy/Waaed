using Waaed.LMS.Api.Data;
using Microsoft.EntityFrameworkCore;
using FluentValidation;
using MediatR;
using System.Reflection;
using Waaed.Shared.Domain.Interfaces;
using Waaed.Shared.Infrastructure.Services;
using Waaed.Shared.Infrastructure.Repositories;
using Waaed.Shared.Infrastructure.Security;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Caching.Distributed;

namespace Waaed.LMS.Api.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddLMSServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<LMSDbContext>(options =>
            options.UseSqlite(configuration.GetConnectionString("DefaultConnection")));

        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(Assembly.GetExecutingAssembly()));
        services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());
        services.AddAutoMapper(Assembly.GetExecutingAssembly());

        return services;
    }

    public static IServiceCollection AddLMSInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddMemoryCache();
        services.AddHttpContextAccessor();
        services.AddSingleton<IDateTimeProvider, DateTimeProvider>();

        return services;
    }
}
