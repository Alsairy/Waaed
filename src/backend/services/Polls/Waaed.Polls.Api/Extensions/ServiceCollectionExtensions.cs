using Microsoft.EntityFrameworkCore;
using Waaed.Polls.Api.Data;
using Waaed.Polls.Api.Mappings;
using Waaed.Shared.Infrastructure.Extensions;

namespace Waaed.Polls.Api.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddPollsServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<PollsDbContext>(options =>
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
