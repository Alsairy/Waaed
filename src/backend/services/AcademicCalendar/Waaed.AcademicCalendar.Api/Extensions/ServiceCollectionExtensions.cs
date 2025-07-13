using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Waaed.AcademicCalendar.Api.Data;
using Waaed.AcademicCalendar.Api.Mappings;
using Waaed.AcademicCalendar.Api.Services;
using Waaed.Shared.Domain.Interfaces;
using Waaed.Shared.Infrastructure.Services;

namespace Waaed.AcademicCalendar.Api.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddAcademicCalendarServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<AcademicCalendarDbContext>(options =>
            options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));

        services.AddAutoMapper(typeof(AcademicCalendarMappingProfile).Assembly);

        services.AddScoped<IAcademicCalendarService, AcademicCalendarService>();
        services.AddScoped<ITenantContext, TenantContext>();
        services.AddScoped<ICurrentUserService, CurrentUserService>();
        services.AddScoped<IDateTimeProvider, DateTimeProvider>();

        services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = configuration["Jwt:Issuer"],
                    ValidAudience = configuration["Jwt:Audience"],
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["Jwt:Key"]!))
                };
            });

        services.AddCors(options =>
        {
            options.AddDefaultPolicy(builder =>
            {
                builder.AllowAnyOrigin()
                       .AllowAnyMethod()
                       .AllowAnyHeader();
            });
        });

        return services;
    }
}
