using AttendancePlatform.Shared.Domain.Interfaces;

namespace AttendancePlatform.Shared.Domain.Entities
{
    public class Kiosk : BaseEntity, ITenantAware
    {
        public Guid TenantId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string AccessCode { get; set; } = string.Empty;
        public KioskStatus Status { get; set; } = KioskStatus.Active;
        public DateTime LastActivity { get; set; }
        public List<string> AllowedGeofences { get; set; } = new();
        public string? KioskVersion { get; set; }
        public string? IpAddress { get; set; }
        public string? MacAddress { get; set; }
        public bool IsOnline { get; set; }
        public DateTime? LastHeartbeat { get; set; }
        
        public virtual ICollection<AttendanceRecord> AttendanceRecords { get; set; } = new List<AttendanceRecord>();
    }

    public enum KioskStatus
    {
        Active = 1,
        Inactive = 2,
        Maintenance = 3,
        Error = 4
    }
}
