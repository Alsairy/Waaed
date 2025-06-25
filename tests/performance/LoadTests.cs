using NBomber.Contracts;
using NBomber.CSharp;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using Xunit;

namespace AttendancePlatform.Tests.Performance
{
    public class LoadTests
    {
        private const string AuthBaseUrl = "http://localhost:5001";
    private const string AttendanceBaseUrl = "http://localhost:5002";
        private const int TestDurationMinutes = 2;
        private const int MaxConcurrentUsers = 50;

        [Fact]
        public void HealthCheckLoad_ShouldHandleConcurrentRequests()
        {
            var scenario = Scenario.Create("health_check_load", async context =>
            {
                using var httpClient = new HttpClient();
                
                try
                {
                    var endpoints = new[]
                    {
                        $"{AuthBaseUrl}/health",
                        $"{AttendanceBaseUrl}/health"
                    };

                    var endpoint = endpoints[context.InvocationNumber % endpoints.Length];
                    var response = await httpClient.GetAsync(endpoint);
                    
                    if (response.IsSuccessStatusCode)
                    {
                        var responseContent = await response.Content.ReadAsStringAsync();
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
                Simulation.Inject(rate: 5, interval: TimeSpan.FromSeconds(1), during: TimeSpan.FromSeconds(30))
            );

            var stats = NBomberRunner
                .RegisterScenarios(scenario)
                .Run();

            Assert.True(stats.AllOkCount > 0, "Should have successful requests");
            Assert.True(stats.AllFailCount < stats.AllOkCount * 0.01, "Error rate should be less than 1%");
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
                        $"{AuthBaseUrl}/health",
                        $"{AttendanceBaseUrl}/health"
                    };

                    var endpoint = endpoints[context.InvocationNumber % endpoints.Length];
                    var response = await httpClient.GetAsync(endpoint);
                    
                    if (response.IsSuccessStatusCode)
                    {
                        var responseContent = await response.Content.ReadAsStringAsync();
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
                Simulation.KeepConstant(copies: 5, during: TimeSpan.FromSeconds(30))
            );

            var stats = NBomberRunner
                .RegisterScenarios(scenario)
                .Run();

            Assert.True(stats.AllOkCount > 0, "Should have successful requests");
            Assert.True(stats.AllFailCount < stats.AllOkCount * 0.02, "Error rate should be less than 2%");
        }

        [Fact]
        public void ServiceLoad_ShouldHandleConcurrentRequests()
        {
            var scenario = Scenario.Create("service_load", async context =>
            {
                using var httpClient = new HttpClient();
                
                try
                {
                    var endpoints = new[]
                    {
                        $"{AuthBaseUrl}/health",
                        $"{AttendanceBaseUrl}/health"
                    };

                    var endpoint = endpoints[context.InvocationNumber % endpoints.Length];
                    var response = await httpClient.GetAsync(endpoint);
                    
                    if (response.IsSuccessStatusCode)
                    {
                        var responseContent = await response.Content.ReadAsStringAsync();
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
                Simulation.KeepConstant(copies: 5, during: TimeSpan.FromSeconds(30))
            );

            var stats = NBomberRunner
                .RegisterScenarios(scenario)
                .Run();

            Assert.True(stats.AllOkCount > 0, "Should have successful requests");
            Assert.True(stats.AllFailCount < stats.AllOkCount * 0.02, "Error rate should be less than 2%");
        }

        [Fact]
        public void HighVolumeLoad_ShouldMaintainStability()
        {
            var scenario = Scenario.Create("high_volume_load", async context =>
            {
                using var httpClient = new HttpClient();
                
                try
                {
                    var endpoints = new[]
                    {
                        $"{AuthBaseUrl}/health",
                        $"{AttendanceBaseUrl}/health"
                    };

                    var endpoint = endpoints[context.InvocationNumber % endpoints.Length];
                    var response = await httpClient.GetAsync(endpoint);
                    
                    if (response.IsSuccessStatusCode)
                    {
                        var responseContent = await response.Content.ReadAsStringAsync();
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
                Simulation.Inject(rate: 10, interval: TimeSpan.FromSeconds(1), during: TimeSpan.FromSeconds(30))
            );

            var stats = NBomberRunner
                .RegisterScenarios(scenario)
                .Run();

            Assert.True(stats.AllOkCount > 0, "Should have successful requests");
            Assert.True(stats.AllFailCount < stats.AllOkCount * 0.05, "Error rate should be less than 5%");
        }

        private async Task<string> GetAuthToken(HttpClient httpClient, int invocationNumber)
        {
            var loginRequest = new
            {
                Email = $"loadtest{invocationNumber}@test.com",
                Password = "LoadTest123!",
                TenantSubdomain = "loadtest"
            };

            var json = JsonSerializer.Serialize(loginRequest);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            try
            {
                var response = await httpClient.PostAsync($"{AuthBaseUrl}/api/Auth/login", content);
                
                if (response.IsSuccessStatusCode)
                {
                    var responseContent = await response.Content.ReadAsStringAsync();
                    var result = JsonSerializer.Deserialize<JsonElement>(responseContent);
                    
                    if (result.TryGetProperty("token", out var tokenElement))
                    {
                        return tokenElement.GetString() ?? string.Empty;
                    }
                }
            }
            catch
            {
            }

            return string.Empty;
        }
    }
}
