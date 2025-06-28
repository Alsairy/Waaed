using Waaed.Hostel.Api.Data;

namespace Waaed.Hostel.Api.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddHostelServices(this IServiceCollection services)
    {
        services.AddAutoMapper(typeof(Program));
        
        return services;
    }
}
