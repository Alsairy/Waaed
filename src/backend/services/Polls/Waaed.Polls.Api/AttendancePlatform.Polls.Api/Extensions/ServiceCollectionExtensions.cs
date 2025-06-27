using Microsoft.EntityFrameworkCore;
using AttendancePlatform.Polls.Api.Data;

namespace AttendancePlatform.Polls.Api.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddPollsServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<PollsDbContext>(options =>
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

        services.AddDistributedMemoryCache();

        services.AddSession(options =>
        {
            options.IdleTimeout = TimeSpan.FromMinutes(30);
            options.Cookie.HttpOnly = true;
            options.Cookie.IsEssential = true;
        });

        return services;
    }
}
