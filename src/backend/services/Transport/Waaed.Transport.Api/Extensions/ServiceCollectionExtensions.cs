using Waaed.Transport.Api.Data;

namespace Waaed.Transport.Api.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddTransportServices(this IServiceCollection services)
    {
        services.AddAutoMapper(typeof(Program));
        
        return services;
    }
}
