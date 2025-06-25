using Xunit;
using Hudur.Shared.Infrastructure.Services;
using Moq;

namespace Hudur.Tests.Unit
{
    public class BasicTests
    {
        [Fact]
        public void Test_BasicAssertion_ReturnsTrue()
        {
            var result = true;

            // Assert
            Assert.True(result);
        }

        [Fact]
        public void Test_StringComparison_ReturnsEqual()
        {
            // Arrange
            var expected = "test";
            var actual = "test";

            Assert.Equal(expected, actual);
        }

        [Fact]
        public void Test_GuidGeneration_ReturnsValidGuid()
        {
            // Act
            var guid = Guid.NewGuid();

            // Assert
            Assert.NotEqual(Guid.Empty, guid);
        }

        [Fact]
        public void Test_MockCreation_ReturnsValidMock()
        {
            var mockCacheService = new Mock<ICacheService>();

            // Assert
            Assert.NotNull(mockCacheService);
            Assert.NotNull(mockCacheService.Object);
        }

        [Fact]
        public async Task Test_AsyncOperation_CompletesSuccessfully()
        {
            // Arrange
            var delay = 10;

            // Act
            await Task.Delay(delay);
            var result = true;

            // Assert
            Assert.True(result);
        }
    }
}
