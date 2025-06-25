using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using OpenTelemetry;
using OpenTelemetry.Metrics;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;
using System.Diagnostics;
using System.Diagnostics.Metrics;

namespace AttendancePlatform.Shared.Infrastructure.Telemetry;

public static class TelemetryExtensions
{
    public static readonly ActivitySource ActivitySource = new("Hudur");
    public static readonly Meter Meter = new("Hudur");

    public static IServiceCollection AddHudurTelemetry(this IServiceCollection services, string serviceName)
    {
        services.AddOpenTelemetry()
            .WithTracing(builder =>
            {
                builder
                    .SetResourceBuilder(ResourceBuilder.CreateDefault()
                        .AddService(serviceName)
                        .AddTelemetrySdk())
                    .AddSource("Hudur")
                    .AddAspNetCoreInstrumentation(options =>
                    {
                        options.RecordException = true;
                        options.EnrichWithHttpRequest = (activity, request) =>
                        {
                            activity.SetTag("http.request.body.size", request.ContentLength);
                            activity.SetTag("http.request.header.user-agent", request.Headers.UserAgent.ToString());
                        };
                        options.EnrichWithHttpResponse = (activity, response) =>
                        {
                            activity.SetTag("http.response.body.size", response.ContentLength);
                        };
                    })
                    .AddHttpClientInstrumentation()
                    .AddSqlClientInstrumentation(options =>
                    {
                        options.SetDbStatementForText = true;
                        options.RecordException = true;
                    })
                    .AddRedisInstrumentation()
                    .AddConsoleExporter()
                    .AddJaegerExporter();
            })
            .WithMetrics(builder =>
            {
                builder
                    .SetResourceBuilder(ResourceBuilder.CreateDefault()
                        .AddService(serviceName)
                        .AddTelemetrySdk())
                    .AddMeter("Hudur")
                    .AddAspNetCoreInstrumentation()
                    .AddHttpClientInstrumentation()
                    .AddRuntimeInstrumentation()
                    .AddPrometheusExporter();
            });

        services.AddSingleton<ITelemetryService, TelemetryService>();
        return services;
    }
}

public interface ITelemetryService
{
    Activity? StartActivity(string name, ActivityKind kind = ActivityKind.Internal);
    void RecordMetric(string name, double value, params KeyValuePair<string, object?>[] tags);
    void IncrementCounter(string name, params KeyValuePair<string, object?>[] tags);
    void RecordHistogram(string name, double value, params KeyValuePair<string, object?>[] tags);
}

public class TelemetryService : ITelemetryService
{
    private readonly Counter<long> _requestCounter;
    private readonly Histogram<double> _requestDuration;
    private readonly Counter<long> _errorCounter;
    private readonly Histogram<double> _biometricVerificationTime;
    private readonly Counter<long> _attendanceEvents;

    public TelemetryService()
    {
        _requestCounter = TelemetryExtensions.Meter.CreateCounter<long>(
            "http_requests_total",
            description: "Total number of HTTP requests");

        _requestDuration = TelemetryExtensions.Meter.CreateHistogram<double>(
            "http_request_duration_seconds",
            description: "Duration of HTTP requests in seconds");

        _errorCounter = TelemetryExtensions.Meter.CreateCounter<long>(
            "http_errors_total",
            description: "Total number of HTTP errors");

        _biometricVerificationTime = TelemetryExtensions.Meter.CreateHistogram<double>(
            "biometric_verification_duration_seconds",
            description: "Time taken for biometric verification");

        _attendanceEvents = TelemetryExtensions.Meter.CreateCounter<long>(
            "attendance_events_total",
            description: "Total attendance events (check-in/check-out)");
    }

    public Activity? StartActivity(string name, ActivityKind kind = ActivityKind.Internal)
    {
        return TelemetryExtensions.ActivitySource.StartActivity(name, kind);
    }

    public void RecordMetric(string name, double value, params KeyValuePair<string, object?>[] tags)
    {
        switch (name)
        {
            case "http_request_duration":
                _requestDuration.Record(value, tags);
                break;
            case "biometric_verification_time":
                _biometricVerificationTime.Record(value, tags);
                break;
        }
    }

    public void IncrementCounter(string name, params KeyValuePair<string, object?>[] tags)
    {
        switch (name)
        {
            case "http_requests":
                _requestCounter.Add(1, tags);
                break;
            case "http_errors":
                _errorCounter.Add(1, tags);
                break;
            case "attendance_events":
                _attendanceEvents.Add(1, tags);
                break;
        }
    }

    public void RecordHistogram(string name, double value, params KeyValuePair<string, object?>[] tags)
    {
        RecordMetric(name, value, tags);
    }
}
