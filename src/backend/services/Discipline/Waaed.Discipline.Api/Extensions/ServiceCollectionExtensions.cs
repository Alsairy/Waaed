using Waaed.Discipline.Api.Data;

namespace Waaed.Discipline.Api.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddDisciplineServices(this IServiceCollection services)
    {
        services.AddAutoMapper(typeof(Program));
        
        return services;
    }
}
