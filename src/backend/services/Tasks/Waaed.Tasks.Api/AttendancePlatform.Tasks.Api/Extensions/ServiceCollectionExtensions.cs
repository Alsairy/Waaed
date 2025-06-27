using Microsoft.EntityFrameworkCore;
using AttendancePlatform.Tasks.Api.Data;

namespace AttendancePlatform.Tasks.Api.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddTasksServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<TasksDbContext>(options =>
            options.UseSqlite(configuration.GetConnectionString("DefaultConnection")));

        services.AddAutoMapper(typeof(Program));

        services.AddControllers();
        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen();

        services.AddCors(options =>
        {
            options.AddPolicy("AllowAll", builder =>
            {
                builder
                    .AllowAnyOrigin()
                    .AllowAnyMethod()
                    .AllowAnyHeader();
            });
        });

        return services;
    }
}
