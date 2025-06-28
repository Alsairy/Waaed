using Waaed.CustomReports.Api.Data;

namespace Waaed.CustomReports.Api.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddCustomReportsServices(this IServiceCollection services)
    {
        services.AddAutoMapper(typeof(Program));
        
        return services;
    }
}
