using System.ComponentModel.DataAnnotations;

namespace AttendancePlatform.Shared.Domain.Entities
{
    public class AttendanceRecord : TenantEntity
    {
        [Required]
        public Guid UserId { get; set; }
        
        [Required]
        public DateTime Timestamp { get; set; }
        
        [Required]
        public AttendanceType Type { get; set; }
        
        [Required]
        public AttendanceMethod Method { get; set; }
        
        public AttendanceStatus Status { get; set; } = AttendanceStatus.Valid;
        
        // Location data
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public string? LocationName { get; set; }
        public string? Address { get; set; }
        
        // Geofence data
        public Guid? GeofenceId { get; set; }
        public bool IsWithinGeofence { get; set; } = false;
        
        // Beacon data
        public string? BeaconId { get; set; }
        public string? BeaconName { get; set; }
        public double? BeaconDistance { get; set; }
        
        // Biometric data
        public string? BiometricData { get; set; }
        public double? BiometricConfidence { get; set; }
        public bool IsBiometricVerified { get; set; } = false;
        
        // Device information
        public string? DeviceId { get; set; }
        public string? DeviceType { get; set; }
        public string? DeviceModel { get; set; }
        public string? AppVersion { get; set; }
        
        // Photo/Image data
        public string? PhotoUrl { get; set; }
        public bool IsPhotoRequired { get; set; } = false;
        
        // Offline sync
        public bool IsOfflineRecord { get; set; } = false;
        public DateTime? SyncedAt { get; set; }
        
        // Validation and approval
        public bool RequiresApproval { get; set; } = false;
        public bool IsApproved { get; set; } = false;
        public Guid? ApprovedBy { get; set; }
        public DateTime? ApprovedAt { get; set; }
        public string? ApprovalNotes { get; set; }
        
        public string? KioskId { get; set; }
        
        public DateTime CheckInTime { get; set; }
        public DateTime? CheckOutTime { get; set; }

        // Additional metadata
        public string? Notes { get; set; }
        public string? IpAddress { get; set; }
        public string? UserAgent { get; set; }
        
        // Navigation properties
        public virtual User User { get; set; } = null!;
        public virtual Geofence? Geofence { get; set; }
        public virtual User? ApprovedByUser { get; set; }
        public virtual Kiosk? Kiosk { get; set; }
    }
    
    public enum AttendanceType
    {
        CheckIn = 1,
        CheckOut = 2,
        BreakStart = 3,
        BreakEnd = 4
    }
    
    public enum AttendanceMethod
    {
        Manual = 1,
        GPS = 2,
        Beacon = 3,
        Biometric = 4,
        QRCode = 5,
        NFC = 6,
        Kiosk = 7,
        ExternalDevice = 8
    }
    
    public enum AttendanceStatus
    {
        Valid = 1,
        Invalid = 2,
        Suspicious = 3,
        PendingReview = 4,
        Approved = 5,
        Rejected = 6
    }
}

