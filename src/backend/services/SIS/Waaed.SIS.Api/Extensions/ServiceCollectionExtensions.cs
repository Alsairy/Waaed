using Microsoft.EntityFrameworkCore;
using Waaed.SIS.Api.Data;
using Waaed.SIS.Api.Mappings;

namespace Waaed.SIS.Api.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddSISServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<SISDbContext>(options =>
            options.UseSqlite(configuration.GetConnectionString("DefaultConnection")));

        services.AddAutoMapper(typeof(MappingProfile));

        return services;
    }
}
