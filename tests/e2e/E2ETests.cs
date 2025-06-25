using Microsoft.Playwright;
using Xunit;
using System.Text.Json;

namespace AttendancePlatform.Tests.E2E
{
    public class E2ETestFixture : IAsyncLifetime
    {
        public IPlaywright Playwright { get; private set; } = null!;
        public IBrowser Browser { get; private set; } = null!;
        public string BaseUrl { get; private set; } = "https://app.hudur.sa";

        public async Task InitializeAsync()
        {
            Playwright = await Microsoft.Playwright.Playwright.CreateAsync();
            Browser = await Playwright.Chromium.LaunchAsync(new BrowserTypeLaunchOptions
            {
                Headless = true,
                Args = new[] { "--no-sandbox", "--disable-dev-shm-usage" }
            });
        }

        public async Task DisposeAsync()
        {
            await Browser.DisposeAsync();
            Playwright.Dispose();
        }
    }

    public class AuthenticationE2ETests : IClassFixture<E2ETestFixture>
    {
        private readonly E2ETestFixture _fixture;

        public AuthenticationE2ETests(E2ETestFixture fixture)
        {
            _fixture = fixture;
        }

        [Fact]
        public async Task LoginFlow_WithValidCredentials_ShouldRedirectToDashboard()
        {
            // Arrange
            var page = await _fixture.Browser.NewPageAsync();
            
            try
            {
                // Act
                await page.GotoAsync($"{_fixture.BaseUrl}/login");
                await page.WaitForLoadStateAsync(LoadState.NetworkIdle);

                await page.FillAsync("[data-testid=email-input]", "admin@test.com");
                await page.FillAsync("[data-testid=password-input]", "Test123!");
                await page.FillAsync("[data-testid=tenant-input]", "test");
                
                await page.ClickAsync("[data-testid=login-button]");
                
                await page.WaitForURLAsync("**/dashboard", new PageWaitForURLOptions { Timeout = 10000 });

                // Assert
                Assert.Contains("/dashboard", page.Url);
                
                await page.WaitForSelectorAsync("[data-testid=dashboard-header]");
                var dashboardHeader = await page.TextContentAsync("[data-testid=dashboard-header]");
                Assert.Contains("Dashboard", dashboardHeader);
            }
            finally
            {
                await page.CloseAsync();
            }
        }

        [Fact]
        public async Task LoginFlow_WithInvalidCredentials_ShouldShowError()
        {
            // Arrange
            var page = await _fixture.Browser.NewPageAsync();
            
            try
            {
                // Act
                await page.GotoAsync($"{_fixture.BaseUrl}/login");
                await page.WaitForLoadStateAsync(LoadState.NetworkIdle);

                await page.FillAsync("[data-testid=email-input]", "invalid@test.com");
                await page.FillAsync("[data-testid=password-input]", "WrongPassword");
                await page.FillAsync("[data-testid=tenant-input]", "test");
                
                await page.ClickAsync("[data-testid=login-button]");
                
                await page.WaitForSelectorAsync("[data-testid=error-message]", new PageWaitForSelectorOptions { Timeout = 5000 });

                // Assert
                var errorMessage = await page.TextContentAsync("[data-testid=error-message]");
                Assert.Contains("Invalid credentials", errorMessage);
                
                Assert.Contains("/login", page.Url);
            }
            finally
            {
                await page.CloseAsync();
            }
        }

        [Fact]
        public async Task RegisterFlow_WithValidData_ShouldCreateUserAndRedirectToLogin()
        {
            // Arrange
            var page = await _fixture.Browser.NewPageAsync();
            var uniqueEmail = $"newuser{DateTime.Now.Ticks}@test.com";
            
            try
            {
                // Act
                await page.GotoAsync($"{_fixture.BaseUrl}/register");
                await page.WaitForLoadStateAsync(LoadState.NetworkIdle);

                await page.FillAsync("[data-testid=first-name-input]", "New");
                await page.FillAsync("[data-testid=last-name-input]", "User");
                await page.FillAsync("[data-testid=email-input]", uniqueEmail);
                await page.FillAsync("[data-testid=password-input]", "NewUser123!");
                await page.FillAsync("[data-testid=confirm-password-input]", "NewUser123!");
                await page.FillAsync("[data-testid=tenant-input]", "test");
                
                await page.ClickAsync("[data-testid=register-button]");
                
                await page.WaitForSelectorAsync("[data-testid=success-message]", new PageWaitForSelectorOptions { Timeout = 10000 });

                // Assert
                var successMessage = await page.TextContentAsync("[data-testid=success-message]");
                Assert.Contains("Registration successful", successMessage);
            }
            finally
            {
                await page.CloseAsync();
            }
        }
    }

    public class AttendanceE2ETests : IClassFixture<E2ETestFixture>
    {
        private readonly E2ETestFixture _fixture;

        public AttendanceE2ETests(E2ETestFixture fixture)
        {
            _fixture = fixture;
        }

        [Fact]
        public async Task AttendanceFlow_CheckInAndCheckOut_ShouldRecordAttendance()
        {
            // Arrange
            var page = await _fixture.Browser.NewPageAsync();
            
            try
            {
                await LoginAsTestUser(page);
                
                await page.GotoAsync($"{_fixture.BaseUrl}/attendance");
                await page.WaitForLoadStateAsync(LoadState.NetworkIdle);

                await page.ClickAsync("[data-testid=check-in-button]");
                await page.WaitForSelectorAsync("[data-testid=check-in-success]", new PageWaitForSelectorOptions { Timeout = 10000 });
                
                var checkInMessage = await page.TextContentAsync("[data-testid=check-in-success]");
                Assert.Contains("Checked in successfully", checkInMessage);

                await Task.Delay(2000);

                await page.ClickAsync("[data-testid=check-out-button]");
                await page.WaitForSelectorAsync("[data-testid=check-out-success]", new PageWaitForSelectorOptions { Timeout = 10000 });
                
                var checkOutMessage = await page.TextContentAsync("[data-testid=check-out-success]");
                Assert.Contains("Checked out successfully", checkOutMessage);

                await page.WaitForSelectorAsync("[data-testid=attendance-record]");
                var attendanceRecords = await page.QuerySelectorAllAsync("[data-testid=attendance-record]");
                Assert.True(attendanceRecords.Count > 0);
            }
            finally
            {
                await page.CloseAsync();
            }
        }

        private async Task LoginAsTestUser(IPage page)
        {
            await page.GotoAsync($"{_fixture.BaseUrl}/login");
            await page.WaitForLoadStateAsync(LoadState.NetworkIdle);

            await page.FillAsync("[data-testid=email-input]", "admin@test.com");
            await page.FillAsync("[data-testid=password-input]", "Test123!");
            await page.FillAsync("[data-testid=tenant-input]", "test");
            
            await page.ClickAsync("[data-testid=login-button]");
            await page.WaitForURLAsync("**/dashboard", new PageWaitForURLOptions { Timeout = 10000 });
        }
    }

    public class DashboardE2ETests : IClassFixture<E2ETestFixture>
    {
        private readonly E2ETestFixture _fixture;

        public DashboardE2ETests(E2ETestFixture fixture)
        {
            _fixture = fixture;
        }

        [Fact]
        public async Task Dashboard_AfterLogin_ShouldDisplayKeyMetrics()
        {
            // Arrange
            var page = await _fixture.Browser.NewPageAsync();
            
            try
            {
                await LoginAsTestUser(page);
                
                await page.GotoAsync($"{_fixture.BaseUrl}/dashboard");
                await page.WaitForLoadStateAsync(LoadState.NetworkIdle);

                await page.WaitForSelectorAsync("[data-testid=total-employees-card]");
                await page.WaitForSelectorAsync("[data-testid=present-today-card]");
                await page.WaitForSelectorAsync("[data-testid=attendance-rate-card]");
                await page.WaitForSelectorAsync("[data-testid=recent-activity-section]");

                var totalEmployees = await page.TextContentAsync("[data-testid=total-employees-value]");
                var presentToday = await page.TextContentAsync("[data-testid=present-today-value]");
                var attendanceRate = await page.TextContentAsync("[data-testid=attendance-rate-value]");

                Assert.False(string.IsNullOrEmpty(totalEmployees));
                Assert.False(string.IsNullOrEmpty(presentToday));
                Assert.False(string.IsNullOrEmpty(attendanceRate));
            }
            finally
            {
                await page.CloseAsync();
            }
        }

        [Fact]
        public async Task Navigation_BetweenPages_ShouldWorkCorrectly()
        {
            // Arrange
            var page = await _fixture.Browser.NewPageAsync();
            
            try
            {
                await LoginAsTestUser(page);

                var pagesToTest = new[]
                {
                    ("/attendance", "[data-testid=attendance-page]"),
                    ("/analytics", "[data-testid=analytics-page]"),
                    ("/users", "[data-testid=users-page]"),
                    ("/profile", "[data-testid=profile-page]"),
                    ("/settings", "[data-testid=settings-page]")
                };

                foreach (var (url, selector) in pagesToTest)
                {
                    await page.GotoAsync($"{_fixture.BaseUrl}{url}");
                    await page.WaitForLoadStateAsync(LoadState.NetworkIdle);
                    
                    await page.WaitForSelectorAsync(selector, new PageWaitForSelectorOptions { Timeout = 5000 });
                    Assert.Contains(url, page.Url);
                }
            }
            finally
            {
                await page.CloseAsync();
            }
        }

        private async Task LoginAsTestUser(IPage page)
        {
            await page.GotoAsync($"{_fixture.BaseUrl}/login");
            await page.WaitForLoadStateAsync(LoadState.NetworkIdle);

            await page.FillAsync("[data-testid=email-input]", "admin@test.com");
            await page.FillAsync("[data-testid=password-input]", "Test123!");
            await page.FillAsync("[data-testid=tenant-input]", "test");
            
            await page.ClickAsync("[data-testid=login-button]");
            await page.WaitForURLAsync("**/dashboard", new PageWaitForURLOptions { Timeout = 10000 });
        }
    }
}
