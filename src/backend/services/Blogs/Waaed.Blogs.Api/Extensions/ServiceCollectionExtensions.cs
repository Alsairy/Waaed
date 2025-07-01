using Microsoft.EntityFrameworkCore;
using Waaed.Blogs.Api.Data;
using Waaed.Blogs.Api.Mappings;

namespace Waaed.Blogs.Api.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddBlogsServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<BlogsDbContext>(options =>
            options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));

        services.AddAutoMapper(typeof(MappingProfile));

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
