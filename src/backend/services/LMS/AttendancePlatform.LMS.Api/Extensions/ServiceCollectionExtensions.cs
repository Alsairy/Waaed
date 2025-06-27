using AttendancePlatform.LMS.Api.Data;
using Microsoft.EntityFrameworkCore;
using FluentValidation;
using MediatR;
using System.Reflection;

namespace AttendancePlatform.LMS.Api.Extensions;

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
}
