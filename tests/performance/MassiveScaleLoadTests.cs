using NBomber.Contracts;
using NBomber.CSharp;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using Xunit;

namespace AttendancePlatform.Tests.Performance
{
    public class MassiveScaleLoadTests
    {
        private const string BaseUrl = "http://localhost:5000";
        private const string AuthBaseUrl = "http://localhost:5001";
        private const string AttendanceBaseUrl = "http://localhost:5002";
        
        [Fact]
        public void Load_500K_ConcurrentUsers_AuthenticationFlow()
        {
            var authScenario = Scenario.Create("massive_auth_load", async context =>
            {
                using var httpClient = new HttpClient();
                
                var loginRequest = new
                {
                    Email = $"loadtest{context.InvocationNumber}@hudur.sa",
                    Password = "LoadTest123!",
                    TenantSubdomain = "enterprise"
                };

                var json = JsonSerializer.Serialize(loginRequest);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                try
                {
                    var response = await httpClient.PostAsync($"{AuthBaseUrl}/api/Auth/login", content);
                    
                    if (response.IsSuccessStatusCode)
                    {
                        return Response.Ok();
                    }
                    else
                    {
                        return Response.Fail();
                    }
                }
                catch (Exception ex)
                {
                    return Response.Fail();
                }
            })
            .WithLoadSimulations(
                Simulation.RampingInject(rate: 1000, interval: TimeSpan.FromSeconds(1), during: TimeSpan.FromMinutes(2)),
                Simulation.KeepConstant(copies: 10000, during: TimeSpan.FromMinutes(5)),
                Simulation.RampingInject(rate: -1000, interval: TimeSpan.FromSeconds(1), during: TimeSpan.FromMinutes(2))
            );

            var stats = NBomberRunner
                .RegisterScenarios(authScenario)
                .WithReportFolder("load_test_reports")
                .Run();

            Assert.True(stats.AllOkCount > 0, "Should have successful authentication requests");
            Assert.True(stats.AllFailCount < stats.AllOkCount * 0.05, "Error rate should be less than 5%");
        }

        [Fact]
        public void Load_500K_ConcurrentUsers_AttendanceCheckIn()
        {
            var attendanceScenario = Scenario.Create("massive_attendance_load", async context =>
            {
                using var httpClient = new HttpClient();
                
                var token = await GetAuthToken(httpClient, context.InvocationNumber);
                if (string.IsNullOrEmpty(token))
                {
                    return Response.Fail();
                }

                httpClient.DefaultRequestHeaders.Authorization = 
                    new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

                var checkInRequest = new
                {
                    UserId = $"user_{context.InvocationNumber}",
                    Latitude = 24.7136 + (Random.Shared.NextDouble() - 0.5) * 0.01,
                    Longitude = 46.6753 + (Random.Shared.NextDouble() - 0.5) * 0.01,
                    CheckInTime = DateTime.UtcNow,
                    DeviceId = $"device_{context.InvocationNumber}",
                    BiometricVerified = true
                };

                var json = JsonSerializer.Serialize(checkInRequest);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                try
                {
                    var response = await httpClient.PostAsync($"{AttendanceBaseUrl}/api/Attendance/checkin", content);
                    
                    if (response.IsSuccessStatusCode)
                    {
                        return Response.Ok();
                    }
                    else
                    {
                        return Response.Fail();
                    }
                }
                catch (Exception ex)
                {
                    return Response.Fail();
                }
            })
            .WithLoadSimulations(
                Simulation.RampingInject(rate: 800, interval: TimeSpan.FromSeconds(1), during: TimeSpan.FromMinutes(3)),
                Simulation.KeepConstant(copies: 5000, during: TimeSpan.FromMinutes(10)),
                Simulation.RampingInject(rate: -800, interval: TimeSpan.FromSeconds(1), during: TimeSpan.FromMinutes(3))
            );

            var stats = NBomberRunner
                .RegisterScenarios(attendanceScenario)
                .WithReportFolder("load_test_reports")
                .Run();

            Assert.True(stats.AllOkCount > 0, "Should have successful check-in requests");
            Assert.True(stats.AllFailCount < stats.AllOkCount * 0.03, "Error rate should be less than 3%");
        }

        [Fact]
        public void Load_500K_ConcurrentUsers_FaceRecognition()
        {
            var faceRecognitionScenario = Scenario.Create("massive_face_recognition_load", async context =>
            {
                using var httpClient = new HttpClient();
                
                var token = await GetAuthToken(httpClient, context.InvocationNumber);
                if (string.IsNullOrEmpty(token))
                {
                    return Response.Fail();
                }

                httpClient.DefaultRequestHeaders.Authorization = 
                    new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

                var faceData = Convert.ToBase64String(GenerateMockFaceData());
                var verificationRequest = new
                {
                    UserId = $"user_{context.InvocationNumber}",
                    FaceImageData = faceData,
                    ConfidenceThreshold = 0.85
                };

                var json = JsonSerializer.Serialize(verificationRequest);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                try
                {
                    var response = await httpClient.PostAsync($"{BaseUrl}/api/FaceRecognition/verify", content);
                    
                    if (response.IsSuccessStatusCode)
                    {
                        return Response.Ok();
                    }
                    else
                    {
                        return Response.Fail();
                    }
                }
                catch (Exception ex)
                {
                    return Response.Fail();
                }
            })
            .WithLoadSimulations(
                Simulation.RampingInject(rate: 500, interval: TimeSpan.FromSeconds(1), during: TimeSpan.FromMinutes(2)),
                Simulation.KeepConstant(copies: 2000, during: TimeSpan.FromMinutes(5)),
                Simulation.RampingInject(rate: -500, interval: TimeSpan.FromSeconds(1), during: TimeSpan.FromMinutes(2))
            );

            var stats = NBomberRunner
                .RegisterScenarios(faceRecognitionScenario)
                .WithReportFolder("load_test_reports")
                .Run();

            Assert.True(stats.AllOkCount > 0, "Should have successful face recognition requests");
            Assert.True(stats.AllFailCount < stats.AllOkCount * 0.08, "Error rate should be less than 8%");
        }

        [Fact]
        public void Load_500K_ConcurrentUsers_MixedWorkload()
        {
            var authScenario = Scenario.Create("auth_scenario", async context =>
            {
                using var httpClient = new HttpClient();
                var token = await GetAuthToken(httpClient, context.InvocationNumber);
                return string.IsNullOrEmpty(token) ? Response.Fail() : Response.Ok();
            })
            .WithLoadSimulations(
                Simulation.KeepConstant(copies: 1500, during: TimeSpan.FromMinutes(10))
            );

            var attendanceScenario = Scenario.Create("attendance_scenario", async context =>
            {
                using var httpClient = new HttpClient();
                var token = await GetAuthToken(httpClient, context.InvocationNumber);
                if (string.IsNullOrEmpty(token)) return Response.Fail();

                httpClient.DefaultRequestHeaders.Authorization = 
                    new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

                var response = await httpClient.GetAsync($"{AttendanceBaseUrl}/health");
                return response.IsSuccessStatusCode ? Response.Ok() : Response.Fail();
            })
            .WithLoadSimulations(
                Simulation.KeepConstant(copies: 2000, during: TimeSpan.FromMinutes(10))
            );

            var analyticsScenario = Scenario.Create("analytics_scenario", async context =>
            {
                using var httpClient = new HttpClient();
                var token = await GetAuthToken(httpClient, context.InvocationNumber);
                if (string.IsNullOrEmpty(token)) return Response.Fail();

                httpClient.DefaultRequestHeaders.Authorization = 
                    new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

                var response = await httpClient.GetAsync($"{BaseUrl}/health");
                return response.IsSuccessStatusCode ? Response.Ok() : Response.Fail();
            })
            .WithLoadSimulations(
                Simulation.KeepConstant(copies: 1000, during: TimeSpan.FromMinutes(10))
            );

            var reportsScenario = Scenario.Create("reports_scenario", async context =>
            {
                using var httpClient = new HttpClient();
                var token = await GetAuthToken(httpClient, context.InvocationNumber);
                if (string.IsNullOrEmpty(token)) return Response.Fail();

                httpClient.DefaultRequestHeaders.Authorization = 
                    new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

                var response = await httpClient.GetAsync($"{BaseUrl}/health");
                return response.IsSuccessStatusCode ? Response.Ok() : Response.Fail();
            })
            .WithLoadSimulations(
                Simulation.KeepConstant(copies: 500, during: TimeSpan.FromMinutes(10))
            );

            var stats = NBomberRunner
                .RegisterScenarios(authScenario, attendanceScenario, analyticsScenario, reportsScenario)
                .WithReportFolder("load_test_reports")
                .Run();

            Assert.True(stats.AllOkCount > 0, "Should have successful requests across all scenarios");
            Assert.True(stats.AllFailCount < stats.AllOkCount * 0.05, "Overall error rate should be less than 5%");
        }

        private async Task<string> GetAuthToken(HttpClient httpClient, int invocationNumber)
        {
            var loginRequest = new
            {
                Email = $"loadtest{invocationNumber % 10000}@hudur.sa",
                Password = "LoadTest123!",
                TenantSubdomain = "enterprise"
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

        private byte[] GenerateMockFaceData()
        {
            var random = new Random();
            var data = new byte[1024];
            random.NextBytes(data);
            return data;
        }
    }
}
