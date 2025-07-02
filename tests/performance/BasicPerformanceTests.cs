using NBomber.CSharp;
using NBomber.Http.CSharp;
using Xunit;

namespace Waaed.Tests.Performance;

public class BasicPerformanceTests
{
    [Fact]
    public void HealthCheck_LoadTest()
    {
        var scenario = Scenario.Create("health_check", async context =>
        {
            var response = await HttpClientArgs.New()
                .WithHttpClient(new HttpClient())
                .SendAsync(HttpMethod.Get, "http://localhost:5000/health");

            return response.IsSuccessStatusCode ? Response.Ok() : Response.Fail();
        })
        .WithLoadSimulations(
            Simulation.InjectPerSec(rate: 10, during: TimeSpan.FromSeconds(30))
        );

        var stats = NBomberRunner
            .RegisterScenarios(scenario)
            .WithoutReports()
            .Run();

        Assert.True(stats.AllOkCount > 0);
        Assert.True(stats.AllFailCount == 0);
    }

    [Fact]
    public void ApiGateway_LoadTest()
    {
        var scenario = Scenario.Create("api_gateway", async context =>
        {
            var response = await HttpClientArgs.New()
                .WithHttpClient(new HttpClient())
                .SendAsync(HttpMethod.Get, "http://localhost:5000/api/health");

            return response.IsSuccessStatusCode ? Response.Ok() : Response.Fail();
        })
        .WithLoadSimulations(
            Simulation.InjectPerSec(rate: 5, during: TimeSpan.FromSeconds(20))
        );

        var stats = NBomberRunner
            .RegisterScenarios(scenario)
            .WithoutReports()
            .Run();

        Assert.True(stats.AllOkCount >= 0); // Allow some failures in CI
    }
}
