using Microsoft.EntityFrameworkCore;
using Waaed.Tasks.Api.Data;
using Waaed.Tasks.Api.Mappings;
using Waaed.Shared.Infrastructure.Extensions;

namespace Waaed.Tasks.Api.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddTasksServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<TasksDbContext>(options =>
            options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));

        services.AddAutoMapper(typeof(MappingProfile));

        services.AddInfrastructure(configuration);

        // Add CORS
        services.AddCors(options =>
        {
            options.AddPolicy("AllowAll", builder =>
            {
                builder.AllowAnyOrigin()
                       .AllowAnyMethod()
                       .AllowAnyHeader();
            });
        });

        return services;
    }
}
