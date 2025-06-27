using Microsoft.EntityFrameworkCore;
using AttendancePlatform.Inventory.Api.Data;

namespace AttendancePlatform.Inventory.Api.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddInventoryServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<InventoryDbContext>(options =>
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
