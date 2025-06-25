using System;
using System.Net.Http;
using System.Threading.Tasks;
using Xunit;

namespace AttendancePlatform.Tests.Performance
{
    public class BasicPerformanceTest
    {
        private const string AuthBaseUrl = "http://localhost:5001";
        private const string AttendanceBaseUrl = "http://localhost:5002";

        [Fact]
        public async Task HealthEndpoints_ShouldRespondQuickly()
        {
            using var httpClient = new HttpClient();
            
            var authStart = DateTime.UtcNow;
            var authResponse = await httpClient.GetAsync($"{AuthBaseUrl}/health");
            var authDuration = DateTime.UtcNow - authStart;
            
            var attendanceStart = DateTime.UtcNow;
            var attendanceResponse = await httpClient.GetAsync($"{AttendanceBaseUrl}/health");
            var attendanceDuration = DateTime.UtcNow - attendanceStart;
            
            Assert.True(authResponse.IsSuccessStatusCode, "Auth health check should succeed");
            Assert.True(attendanceResponse.IsSuccessStatusCode, "Attendance health check should succeed");
            Assert.True(authDuration.TotalMilliseconds < 100, $"Auth response time should be under 100ms, was {authDuration.TotalMilliseconds}ms");
            Assert.True(attendanceDuration.TotalMilliseconds < 100, $"Attendance response time should be under 100ms, was {attendanceDuration.TotalMilliseconds}ms");
        }

        [Fact]
        public async Task ConcurrentHealthChecks_ShouldSucceed()
        {
            using var httpClient = new HttpClient();
            
            var tasks = new Task<HttpResponseMessage>[20];
            for (int i = 0; i < 20; i++)
            {
                var endpoint = i % 2 == 0 ? $"{AuthBaseUrl}/health" : $"{AttendanceBaseUrl}/health";
                tasks[i] = httpClient.GetAsync(endpoint);
            }
            
            var responses = await Task.WhenAll(tasks);
            
            var successCount = 0;
            foreach (var response in responses)
            {
                if (response.IsSuccessStatusCode)
                    successCount++;
            }
            
            Assert.True(successCount >= 18, $"At least 18 out of 20 requests should succeed, got {successCount}");
        }

        [Fact]
        public async Task SequentialRequests_ShouldMaintainPerformance()
        {
            using var httpClient = new HttpClient();
            
            var totalDuration = TimeSpan.Zero;
            var successCount = 0;
            
            for (int i = 0; i < 50; i++)
            {
                var start = DateTime.UtcNow;
                var endpoint = i % 2 == 0 ? $"{AuthBaseUrl}/health" : $"{AttendanceBaseUrl}/health";
                var response = await httpClient.GetAsync(endpoint);
                var duration = DateTime.UtcNow - start;
                
                totalDuration += duration;
                if (response.IsSuccessStatusCode)
                    successCount++;
            }
            
            var averageResponseTime = totalDuration.TotalMilliseconds / 50;
            
            Assert.True(successCount >= 48, $"At least 48 out of 50 requests should succeed, got {successCount}");
            Assert.True(averageResponseTime < 50, $"Average response time should be under 50ms, was {averageResponseTime}ms");
        }
    }
}
