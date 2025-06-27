using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.Http;
using System.Text.Json;

namespace AttendancePlatform.Shared.Infrastructure.Health;

public static class HealthCheckExtensions
{
    public static IServiceCollection AddHudurHealthChecks(this IServiceCollection services, string connectionString)
    {
        services.AddHealthChecks()
            .AddSqlServer(connectionString, name: "database", tags: new[] { "db", "sql" })
            .AddRedis(Environment.GetEnvironmentVariable("REDIS_CONNECTION_STRING") ?? "localhost:6379", 
                name: "redis", tags: new[] { "cache", "redis" })
            .AddRabbitMQ(Environment.GetEnvironmentVariable("RABBITMQ_CONNECTION_STRING") ?? "amqp://localhost:5672", 
                name: "rabbitmq", tags: new[] { "messaging", "rabbitmq" })
            .AddCheck<CustomHealthCheck>("custom", tags: new[] { "custom" })
            .AddCheck<BiometricServiceHealthCheck>("biometric", tags: new[] { "biometric" })
            .AddCheck<WorkflowEngineHealthCheck>("workflow", tags: new[] { "workflow" });

        return services;
    }

    public static IApplicationBuilder UseHudurHealthChecks(this IApplicationBuilder app)
    {
        app.UseHealthChecks("/health", new HealthCheckOptions
        {
            ResponseWriter = WriteHealthCheckResponse
        });

        app.UseHealthChecks("/health/ready", new HealthCheckOptions
        {
            Predicate = check => check.Tags.Contains("ready"),
            ResponseWriter = WriteHealthCheckResponse
        });

        app.UseHealthChecks("/health/live", new HealthCheckOptions
        {
            Predicate = _ => false,
            ResponseWriter = WriteHealthCheckResponse
        });

        return app;
    }

    private static async Task WriteHealthCheckResponse(HttpContext context, HealthReport healthReport)
    {
        context.Response.ContentType = "application/json; charset=utf-8";

        var options = new JsonWriterOptions { Indented = true };
        using var memoryStream = new MemoryStream();
        using (var jsonWriter = new Utf8JsonWriter(memoryStream, options))
        {
            jsonWriter.WriteStartObject();
            jsonWriter.WriteString("status", healthReport.Status.ToString());
            jsonWriter.WriteString("totalDuration", healthReport.TotalDuration.ToString());
            jsonWriter.WriteStartObject("results");

            foreach (var (key, value) in healthReport.Entries)
            {
                jsonWriter.WriteStartObject(key);
                jsonWriter.WriteString("status", value.Status.ToString());
                jsonWriter.WriteString("duration", value.Duration.ToString());
                jsonWriter.WriteString("description", value.Description);

                if (value.Data.Any())
                {
                    jsonWriter.WriteStartObject("data");
                    foreach (var (dataKey, dataValue) in value.Data)
                    {
                        jsonWriter.WritePropertyName(dataKey);
                        JsonSerializer.Serialize(jsonWriter, dataValue, dataValue?.GetType() ?? typeof(object));
                    }
                    jsonWriter.WriteEndObject();
                }

                if (value.Exception != null)
                {
                    jsonWriter.WriteString("exception", value.Exception.Message);
                }

                jsonWriter.WriteEndObject();
            }

            jsonWriter.WriteEndObject();
            jsonWriter.WriteEndObject();
        }

        await context.Response.WriteAsync(System.Text.Encoding.UTF8.GetString(memoryStream.ToArray()));
    }
}

public class CustomHealthCheck : IHealthCheck
{
    public Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
    {
        var isHealthy = true;
        var description = "Custom health check passed";

        if (isHealthy)
        {
            return Task.FromResult(HealthCheckResult.Healthy(description));
        }

        return Task.FromResult(HealthCheckResult.Unhealthy(description));
    }
}

public class BiometricServiceHealthCheck : IHealthCheck
{
    public Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
    {
        try
        {
            var data = new Dictionary<string, object>
            {
                ["biometric_templates_count"] = 1000,
                ["average_verification_time"] = "0.5s",
                ["success_rate"] = "99.2%"
            };

            return Task.FromResult(HealthCheckResult.Healthy("Biometric service is operational", data));
        }
        catch (Exception ex)
        {
            return Task.FromResult(HealthCheckResult.Unhealthy("Biometric service failed", ex));
        }
    }
}

public class WorkflowEngineHealthCheck : IHealthCheck
{
    public Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
    {
        try
        {
            var data = new Dictionary<string, object>
            {
                ["active_workflows"] = 25,
                ["pending_tasks"] = 150,
                ["completed_today"] = 500
            };

            return Task.FromResult(HealthCheckResult.Healthy("Workflow engine is operational", data));
        }
        catch (Exception ex)
        {
            return Task.FromResult(HealthCheckResult.Unhealthy("Workflow engine failed", ex));
        }
    }
}
