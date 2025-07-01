using Waaed.Alumni.Api.Data;

namespace Waaed.Alumni.Api.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddAlumniServices(this IServiceCollection services)
    {
        services.AddAutoMapper(typeof(Program));
        
        return services;
    }
}
