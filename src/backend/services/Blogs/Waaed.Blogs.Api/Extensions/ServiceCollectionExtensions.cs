using Microsoft.EntityFrameworkCore;
using Waaed.Blogs.Api.Data;
using Waaed.Blogs.Api.Mappings;
using Waaed.Shared.Infrastructure.Extensions;

namespace Waaed.Blogs.Api.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddBlogsServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<BlogsDbContext>(options =>
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
