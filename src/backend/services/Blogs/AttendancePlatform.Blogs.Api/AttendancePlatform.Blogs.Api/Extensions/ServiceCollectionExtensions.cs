using Microsoft.EntityFrameworkCore;
using AttendancePlatform.Blogs.Api.Data;

namespace AttendancePlatform.Blogs.Api.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddBlogsServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<BlogsDbContext>(options =>
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
