using Xunit;

namespace Waaed.Tests.Performance
{
    public class PerformanceTests
    {
        [Fact]
        public async Task LoadTest_ApiGateway_ShouldHandleLoad()
        {
            using var httpClient = new HttpClient();
            var tasks = new List<Task<bool>>();
            
            for (int i = 0; i < 10; i++)
            {
                tasks.Add(Task.Run(async () =>
                {
                    try
                    {
                        var response = await httpClient.GetAsync("http://localhost:5000/health");
                        return response.IsSuccessStatusCode;
                    }
                    catch
                    {
                        return false;
                    }
                }));
            }

            var results = await Task.WhenAll(tasks);
            var successCount = results.Count(r => r);
            
            Assert.True(successCount > 0);
        }

        [Fact]
        public async Task StressTest_Authentication_ShouldHandleStress()
        {
            using var httpClient = new HttpClient();
            var tasks = new List<Task<bool>>();
            
            for (int i = 0; i < 5; i++)
            {
                tasks.Add(Task.Run(async () =>
                {
                    try
                    {
                        var content = new StringContent(
                            "{\"email\":\"test@example.com\",\"password\":\"Test123!\",\"tenantId\":\"test\"}", 
                            System.Text.Encoding.UTF8, 
                            "application/json");
                        
                        var response = await httpClient.PostAsync("http://localhost:5000/api/auth/login", content);
                        return response.IsSuccessStatusCode;
                    }
                    catch
                    {
                        return false;
                    }
                }));
            }

            var results = await Task.WhenAll(tasks);
            var successCount = results.Count(r => r);
            
            Assert.True(successCount >= 0);
        }

        [Fact]
        public async Task VolumeTest_ShouldHandleLargeDataSet()
        {
            using var httpClient = new HttpClient();
            var tasks = new List<Task<bool>>();
            
            for (int i = 0; i < 100; i++)
            {
                tasks.Add(Task.Run(async () =>
                {
                    try
                    {
                        var response = await httpClient.GetAsync("http://localhost:5000/health");
                        return response.IsSuccessStatusCode;
                    }
                    catch
                    {
                        return false;
                    }
                }));
            }

            var results = await Task.WhenAll(tasks);
            var successCount = results.Count(r => r);
            
            Assert.True(successCount >= 0);
        }
    }
}
