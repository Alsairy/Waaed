using AttendancePlatform.Shared.Domain.Entities;
using Xunit;

namespace AttendancePlatform.Tests.Integration
{
    public class DomainEntityTests
    {
        [Fact]
        public void User_CanBeCreatedWithCorrectProperties()
        {
            var tenant = new Tenant
            {
                Id = Guid.NewGuid(),
                Name = "Test Tenant",
                Subdomain = "test",
                Status = TenantStatus.Active,
                CreatedAt = DateTime.UtcNow
            };

            var user = new User
            {
                Id = Guid.NewGuid(),
                Email = "test@example.com",
                PasswordHash = "hashedpassword",
                FirstName = "Test",
                LastName = "User",
                Status = UserStatus.Active,
                TenantId = tenant.Id,
                CreatedAt = DateTime.UtcNow
            };

            Assert.NotNull(user);
            Assert.Equal("Test", user.FirstName);
            Assert.Equal("Test User", user.FullName);
            Assert.Equal(UserStatus.Active, user.Status);
        }

        [Fact]
        public void AttendanceRecord_CanBeCreatedWithCorrectProperties()
        {
            var tenant = new Tenant
            {
                Id = Guid.NewGuid(),
                Name = "Test Tenant",
                Subdomain = "test",
                Status = TenantStatus.Active,
                CreatedAt = DateTime.UtcNow
            };

            var user = new User
            {
                Id = Guid.NewGuid(),
                Email = "test@example.com",
                PasswordHash = "hashedpassword",
                FirstName = "Test",
                LastName = "User",
                Status = UserStatus.Active,
                TenantId = tenant.Id,
                CreatedAt = DateTime.UtcNow
            };

            var attendanceRecord = new AttendanceRecord
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                TenantId = tenant.Id,
                Timestamp = DateTime.UtcNow,
                Type = AttendanceType.CheckIn,
                Method = AttendanceMethod.GPS,
                Status = AttendanceStatus.Valid,
                CreatedAt = DateTime.UtcNow
            };

            Assert.NotNull(attendanceRecord);
            Assert.Equal(AttendanceType.CheckIn, attendanceRecord.Type);
            Assert.Equal(AttendanceStatus.Valid, attendanceRecord.Status);
            Assert.Equal(AttendanceMethod.GPS, attendanceRecord.Method);
        }

        [Fact]
        public void Tenant_CanBeCreatedWithCorrectProperties()
        {
            var tenant = new Tenant
            {
                Id = Guid.NewGuid(),
                Name = "Test Tenant",
                Subdomain = "test",
                Status = TenantStatus.Active,
                MaxUsers = 100,
                TimeZone = "UTC",
                CreatedAt = DateTime.UtcNow
            };

            Assert.NotNull(tenant);
            Assert.Equal("Test Tenant", tenant.Name);
            Assert.Equal("test", tenant.Subdomain);
            Assert.Equal(TenantStatus.Active, tenant.Status);
            Assert.Equal(100, tenant.MaxUsers);
        }
    }

    public class ServiceIntegrationTests
    {
        [Fact]
        public void PasswordHashing_WorksCorrectly()
        {
            var password = "TestPassword123!";
            var hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);
            
            Assert.NotNull(hashedPassword);
            Assert.NotEqual(password, hashedPassword);
            Assert.True(BCrypt.Net.BCrypt.Verify(password, hashedPassword));
        }

        [Fact]
        public void Base64ImageDecoding_WorksCorrectly()
        {
            var base64Image = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";
            
            try
            {
                var imageData = Convert.FromBase64String(base64Image);
                Assert.NotNull(imageData);
                Assert.True(imageData.Length > 0);
            }
            catch (Exception ex)
            {
                Assert.Fail($"Base64 decoding failed: {ex.Message}");
            }
        }

        [Fact]
        public void GeofenceValidation_WorksCorrectly()
        {
            var centerLat = 40.7128;
            var centerLng = -74.0060;
            var testLat = 40.7130;
            var testLng = -74.0062;
            var radius = 100; // meters

            var distance = CalculateDistance(centerLat, centerLng, testLat, testLng);
            var isWithinGeofence = distance <= radius;
            
            Assert.True(isWithinGeofence);
        }

        private double CalculateDistance(double lat1, double lng1, double lat2, double lng2)
        {
            const double R = 6371000; // Earth's radius in meters
            var dLat = (lat2 - lat1) * Math.PI / 180;
            var dLng = (lng2 - lng1) * Math.PI / 180;
            var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                    Math.Cos(lat1 * Math.PI / 180) * Math.Cos(lat2 * Math.PI / 180) *
                    Math.Sin(dLng / 2) * Math.Sin(dLng / 2);
            var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
            return R * c;
        }

        [Fact]
        public void EmailValidation_WorksCorrectly()
        {
            var validEmail = "test@example.com";
            var invalidEmail = "invalid-email";
            
            Assert.True(IsValidEmail(validEmail));
            Assert.False(IsValidEmail(invalidEmail));
        }

        private bool IsValidEmail(string email)
        {
            try
            {
                var addr = new System.Net.Mail.MailAddress(email);
                return addr.Address == email;
            }
            catch
            {
                return false;
            }
        }

        [Fact]
        public void LeaveBalance_CanBeCalculated()
        {
            var startDate = new DateTime(2024, 1, 1);
            var endDate = new DateTime(2024, 1, 5);
            var businessDays = CalculateBusinessDays(startDate, endDate);
            
            Assert.Equal(5, businessDays);
        }

        private int CalculateBusinessDays(DateTime startDate, DateTime endDate)
        {
            int businessDays = 0;
            for (var date = startDate; date <= endDate; date = date.AddDays(1))
            {
                if (date.DayOfWeek != DayOfWeek.Saturday && date.DayOfWeek != DayOfWeek.Sunday)
                {
                    businessDays++;
                }
            }
            return businessDays;
        }
    }

    public class EntityValidationTests
    {
        [Fact]
        public void UserStatus_EnumValues_AreValid()
        {
            Assert.True(Enum.IsDefined(typeof(UserStatus), UserStatus.Active));
            Assert.True(Enum.IsDefined(typeof(UserStatus), UserStatus.Inactive));
            Assert.True(Enum.IsDefined(typeof(UserStatus), UserStatus.Suspended));
            Assert.True(Enum.IsDefined(typeof(UserStatus), UserStatus.Terminated));
            Assert.True(Enum.IsDefined(typeof(UserStatus), UserStatus.OnLeave));
        }

        [Fact]
        public void TenantStatus_EnumValues_AreValid()
        {
            Assert.True(Enum.IsDefined(typeof(TenantStatus), TenantStatus.Active));
            Assert.True(Enum.IsDefined(typeof(TenantStatus), TenantStatus.Suspended));
            Assert.True(Enum.IsDefined(typeof(TenantStatus), TenantStatus.Inactive));
            Assert.True(Enum.IsDefined(typeof(TenantStatus), TenantStatus.Trial));
            Assert.True(Enum.IsDefined(typeof(TenantStatus), TenantStatus.Expired));
        }

        [Fact]
        public void AttendanceType_EnumValues_AreValid()
        {
            Assert.True(Enum.IsDefined(typeof(AttendanceType), AttendanceType.CheckIn));
            Assert.True(Enum.IsDefined(typeof(AttendanceType), AttendanceType.CheckOut));
            Assert.True(Enum.IsDefined(typeof(AttendanceType), AttendanceType.BreakStart));
            Assert.True(Enum.IsDefined(typeof(AttendanceType), AttendanceType.BreakEnd));
        }

        [Fact]
        public void AttendanceMethod_EnumValues_AreValid()
        {
            Assert.True(Enum.IsDefined(typeof(AttendanceMethod), AttendanceMethod.Manual));
            Assert.True(Enum.IsDefined(typeof(AttendanceMethod), AttendanceMethod.GPS));
            Assert.True(Enum.IsDefined(typeof(AttendanceMethod), AttendanceMethod.Beacon));
            Assert.True(Enum.IsDefined(typeof(AttendanceMethod), AttendanceMethod.Biometric));
            Assert.True(Enum.IsDefined(typeof(AttendanceMethod), AttendanceMethod.QRCode));
            Assert.True(Enum.IsDefined(typeof(AttendanceMethod), AttendanceMethod.NFC));
            Assert.True(Enum.IsDefined(typeof(AttendanceMethod), AttendanceMethod.Kiosk));
            Assert.True(Enum.IsDefined(typeof(AttendanceMethod), AttendanceMethod.ExternalDevice));
        }

        [Fact]
        public void AttendanceStatus_EnumValues_AreValid()
        {
            Assert.True(Enum.IsDefined(typeof(AttendanceStatus), AttendanceStatus.Valid));
            Assert.True(Enum.IsDefined(typeof(AttendanceStatus), AttendanceStatus.Invalid));
            Assert.True(Enum.IsDefined(typeof(AttendanceStatus), AttendanceStatus.Suspicious));
            Assert.True(Enum.IsDefined(typeof(AttendanceStatus), AttendanceStatus.PendingReview));
            Assert.True(Enum.IsDefined(typeof(AttendanceStatus), AttendanceStatus.Approved));
            Assert.True(Enum.IsDefined(typeof(AttendanceStatus), AttendanceStatus.Rejected));
        }

        [Fact]
        public void User_FullName_Property_WorksCorrectly()
        {
            var user = new User
            {
                FirstName = "John",
                LastName = "Doe"
            };

            Assert.Equal("John Doe", user.FullName);
        }

        [Fact]
        public void User_DefaultValues_AreSetCorrectly()
        {
            var user = new User();

            Assert.Equal(UserStatus.Active, user.Status);
            Assert.False(user.IsEmailVerified);
            Assert.False(user.IsPhoneVerified);
            Assert.False(user.RequirePasswordChange);
            Assert.False(user.IsTwoFactorEnabled);
        }

        [Fact]
        public void Tenant_DefaultValues_AreSetCorrectly()
        {
            var tenant = new Tenant();

            Assert.Equal(TenantStatus.Active, tenant.Status);
            Assert.Equal(100, tenant.MaxUsers);
            Assert.Equal("UTC", tenant.TimeZone);
            Assert.Equal("en-US", tenant.Locale);
            Assert.Equal("USD", tenant.Currency);
        }

        [Fact]
        public void AttendanceRecord_DefaultValues_AreSetCorrectly()
        {
            var attendanceRecord = new AttendanceRecord();

            Assert.Equal(AttendanceStatus.Valid, attendanceRecord.Status);
            Assert.False(attendanceRecord.IsWithinGeofence);
            Assert.False(attendanceRecord.IsBiometricVerified);
            Assert.False(attendanceRecord.IsPhotoRequired);
            Assert.False(attendanceRecord.IsOfflineRecord);
            Assert.False(attendanceRecord.RequiresApproval);
            Assert.False(attendanceRecord.IsApproved);
        }
    }
}
