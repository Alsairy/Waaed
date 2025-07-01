using Microsoft.EntityFrameworkCore;
using Waaed.Tasks.Api.Data;
using Waaed.Tasks.Api.Mappings;

namespace Waaed.Tasks.Api.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddTasksServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<TasksDbContext>(options =>
            options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));

        services.AddAutoMapper(typeof(MappingProfile));

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
