using System;
using System.Net.Http;
using System.Threading.Tasks;
using NBomber.CSharp;
using Xunit;

namespace AttendancePlatform.Tests.Performance
{
    public class HealthCheckLoadTest
    {
        [Fact]
        public void HealthCheck_ShouldHandleHighLoad()
        {
            var scenario = Scenario.Create("health_check_load", async context =>
            {
                using var httpClient = new HttpClient();
                
                try
                {
                    var authResponse = await httpClient.GetAsync("http://localhost:5001/api/Auth/health");
                    var attendanceResponse = await httpClient.GetAsync("http://localhost:5002/api/Attendance/health");
                    
                    if (authResponse.IsSuccessStatusCode && attendanceResponse.IsSuccessStatusCode)
                    {
                        return Response.Ok();
                    }
                    else
                    {
                        return Response.Fail();
                    }
                }
                catch (Exception)
                {
                    return Response.Fail();
                }
            })
            .WithLoadSimulations(
                Simulation.Inject(rate: 20, interval: TimeSpan.FromSeconds(1), during: TimeSpan.FromMinutes(1))
            );

            var stats = NBomberRunner
                .RegisterScenarios(scenario)
                .Run();

            Assert.True(stats.AllOkCount > 0, "Should have successful health check requests");
            Assert.True(stats.AllFailCount < stats.AllOkCount * 0.05, "Error rate should be less than 5%");
        }

        [Fact]
        public void ConcurrentHealthChecks_ShouldMaintainPerformance()
        {
            var scenario = Scenario.Create("concurrent_health_checks", async context =>
            {
                using var httpClient = new HttpClient();
                
                try
                {
                    var endpoints = new[]
                    {
                        "http://localhost:5001/api/Auth/health",
                        "http://localhost:5002/api/Attendance/health"
                    };

                    var endpoint = endpoints[context.InvocationNumber % endpoints.Length];
                    var response = await httpClient.GetAsync(endpoint);
                    
                    if (response.IsSuccessStatusCode)
                    {
                        return Response.Ok();
                    }
                    else
                    {
                        return Response.Fail();
                    }
                }
                catch (Exception)
                {
                    return Response.Fail();
                }
            })
            .WithLoadSimulations(
                Simulation.KeepConstant(copies: 30, during: TimeSpan.FromMinutes(1))
            );

            var stats = NBomberRunner
                .RegisterScenarios(scenario)
                .Run();

            Assert.True(stats.AllOkCount > 0, "Should have successful requests");
            Assert.True(stats.AllFailCount < stats.AllOkCount * 0.02, "Error rate should be less than 2%");
            Assert.True(stats.AllOkCount > stats.AllFailCount, "Should have more successful requests than failures");
        }
    }
}
