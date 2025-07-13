using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Waaed.Polls.Api.Data;
using Waaed.Polls.Api.Mappings;
using Waaed.Shared.Infrastructure.Services;
using Waaed.Shared.Infrastructure.Repositories;
using Waaed.Shared.Domain.Interfaces;

namespace Waaed.Polls.Api.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddPollsServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<PollsDbContext>(options =>
            options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));

        services.AddAutoMapper(typeof(MappingProfile));

        services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
        services.AddScoped(typeof(ITenantRepository<>), typeof(TenantRepository<>));
        services.AddScoped<IUnitOfWork, UnitOfWork>();
        services.AddScoped<ITenantContext, TenantContext>();
        services.AddScoped<ICurrentUserService, CurrentUserService>();
        services.AddSingleton<IDateTimeProvider, DateTimeProvider>();
        services.AddHttpContextAccessor();

        // Configure JWT authentication
        var jwtSettings = configuration.GetSection("JWT");
        var secretKey = jwtSettings["SecretKey"] ?? "your-secret-key-here-make-it-long-enough";
        var key = Encoding.ASCII.GetBytes(secretKey);

        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            options.RequireHttpsMetadata = false;
            options.SaveToken = true;
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = true,
                ValidIssuer = jwtSettings["Issuer"] ?? "Waaed",
                ValidateAudience = true,
                ValidAudience = jwtSettings["Audience"] ?? "Waaed",
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero
            };
        });

        services.AddAuthorization();
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
