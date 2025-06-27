using AttendancePlatform.Finance.Api.Data;
using Microsoft.EntityFrameworkCore;
using FluentValidation;
using MediatR;
using System.Reflection;
using AttendancePlatform.Shared.Domain.Interfaces;
using AttendancePlatform.Shared.Infrastructure.Services;
using Microsoft.Extensions.Caching.Memory;

namespace AttendancePlatform.Finance.Api.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddFinanceServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<FinanceDbContext>(options =>
            options.UseSqlite(configuration.GetConnectionString("DefaultConnection")));

        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(Assembly.GetExecutingAssembly()));
        services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());
        services.AddAutoMapper(Assembly.GetExecutingAssembly());

        return services;
    }

    public static IServiceCollection AddFinanceInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddMemoryCache();
        services.AddHttpContextAccessor();
        services.AddSingleton<IDateTimeProvider, DateTimeProvider>();

        return services;
    }
}
