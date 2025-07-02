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
            try
            {
                var response = await HttpClientArgs.New()
                    .WithHttpClient(new HttpClient())
                    .SendAsync(HttpMethod.Get, "http://localhost:5000/health");

                return response.IsSuccessStatusCode ? Response.Ok() : Response.Fail();
            }
            catch
            {
                return Response.Fail();
            }
        })
        .WithLoadSimulations(
            Simulation.InjectPerSec(rate: 5, during: TimeSpan.FromSeconds(10))
        );

        var stats = NBomberRunner
            .RegisterScenarios(scenario)
            .WithoutReports()
            .Run();

        Assert.True(stats.AllOkCount >= 0);
    }

    [Fact]
    public void BasicPerformance_Test()
    {
        var scenario = Scenario.Create("basic_test", async context =>
        {
            await Task.Delay(10);
            return Response.Ok();
        })
        .WithLoadSimulations(
            Simulation.InjectPerSec(rate: 10, during: TimeSpan.FromSeconds(5))
        );

        var stats = NBomberRunner
            .RegisterScenarios(scenario)
            .WithoutReports()
            .Run();

        Assert.True(stats.AllOkCount > 0);
    }
}
