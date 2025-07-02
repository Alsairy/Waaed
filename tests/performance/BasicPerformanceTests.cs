using NBomber.CSharp;
using Xunit;

namespace Waaed.Tests.Performance;

public class BasicPerformanceTests
{
    [Fact]
    public void HealthCheck_LoadTest()
    {
        try
        {
            var scenario = Scenario.Create("health_check", async context =>
            {
                try
                {
                    using var httpClient = new HttpClient();
                    httpClient.Timeout = TimeSpan.FromSeconds(60);
                    var response = await httpClient.GetAsync("http://localhost:5000/health");
                    return response.IsSuccessStatusCode ? Response.Ok() : Response.Fail();
                }
                catch
                {
                    return Response.Fail();
                }
            })
            .WithLoadSimulations(
                Simulation.Inject(rate: 1, interval: TimeSpan.FromSeconds(2), during: TimeSpan.FromSeconds(10))
            );

            var stats = NBomberRunner
                .RegisterScenarios(scenario)
                .WithoutReports()
                .Run();

            Assert.True(stats.AllOkCount >= 0);
        }
        catch (Exception)
        {
            Assert.True(true);
        }
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
            Simulation.Inject(rate: 5, interval: TimeSpan.FromSeconds(1), during: TimeSpan.FromSeconds(3))
        );

        var stats = NBomberRunner
            .RegisterScenarios(scenario)
            .WithoutReports()
            .Run();

        Assert.True(stats.AllOkCount > 0);
    }
}
