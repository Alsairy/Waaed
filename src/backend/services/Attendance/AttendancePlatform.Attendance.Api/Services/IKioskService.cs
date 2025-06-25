using AttendancePlatform.Shared.Domain.DTOs;
using AttendancePlatform.Shared.Domain.Entities;
using AttendancePlatform.Attendance.Api.Controllers;

namespace AttendancePlatform.Attendance.Api.Services
{
    public interface IKioskService
    {
        Task<KioskDto> RegisterKioskAsync(RegisterKioskRequest request);
        Task<KioskAuthResult> AuthenticateKioskAsync(string kioskId, string accessCode);
        Task<EmployeeDto?> LookupEmployeeAsync(string employeeId, string? biometricData);
        Task<KioskStatusDto> GetKioskStatusAsync(string kioskId);
        Task<List<KioskActivityDto>> GetRecentActivityAsync(string kioskId, int limit);
        Task<bool> ValidateKioskLocationAsync(string kioskId, LocationInfo location);
        Task<bool> UpdateKioskStatusAsync(string kioskId, KioskStatus status);
    }

    public class KioskDto
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public KioskStatus Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime LastActivity { get; set; }
        public List<string> AllowedGeofences { get; set; } = new();
    }

    public class KioskAuthResult
    {
        public bool IsSuccess { get; set; }
        public string Token { get; set; } = string.Empty;
        public string KioskId { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public DateTime ExpiresAt { get; set; }
    }

    public class KioskStatusDto
    {
        public string KioskId { get; set; } = string.Empty;
        public KioskStatus Status { get; set; }
        public DateTime LastActivity { get; set; }
        public int TodayCheckIns { get; set; }
        public int TodayCheckOuts { get; set; }
        public bool IsOnline { get; set; }
        public string Version { get; set; } = string.Empty;
    }

    public class KioskActivityDto
    {
        public string Id { get; set; } = string.Empty;
        public string EmployeeId { get; set; } = string.Empty;
        public string EmployeeName { get; set; } = string.Empty;
        public AttendanceMethod Method { get; set; }
        public DateTime Timestamp { get; set; }
        public string Action { get; set; } = string.Empty;
        public bool IsSuccessful { get; set; }
    }




}
