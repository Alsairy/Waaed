using System.ComponentModel.DataAnnotations;

namespace AttendancePlatform.Shared.Domain.Entities
{
    public enum BiometricType
    {
        Face = 1,
        Fingerprint = 2,
        Voice = 3,
        Iris = 4,
        Palm = 5
    }



    public class BiometricVerificationLog : TenantEntity
    {
        [Required]
        public Guid UserId { get; set; }
        
        [Required]
        public BiometricType Type { get; set; }
        
        public Guid? TemplateId { get; set; } // Which template was matched (if any)
        
        [Required]
        public DateTime VerificationTime { get; set; }
        
        public bool IsSuccessful { get; set; }
        
        public double ConfidenceScore { get; set; } // Confidence/similarity score
        
        public string? DeviceId { get; set; }
        
        public string? DeviceType { get; set; }
        
        public string? FailureReason { get; set; }
        
        public string? VerificationContext { get; set; } // e.g., "attendance", "login", etc.
        
        // Navigation properties
        public virtual User User { get; set; } = null!;
        public virtual BiometricTemplate? Template { get; set; }
    }

    // Keep existing UserBiometrics for backward compatibility
    public class UserBiometrics : TenantEntity
    {
        [Required]
        public Guid UserId { get; set; }
        
        public string? FaceTemplate { get; set; }
        
        public string? FingerprintTemplate { get; set; }
        
        public string? VoiceTemplate { get; set; }
        
        public bool IsFaceEnrolled { get; set; } = false;
        
        public bool IsFingerprintEnrolled { get; set; } = false;
        
        public bool IsVoiceEnrolled { get; set; } = false;
        
        public DateTime? FaceEnrolledAt { get; set; }
        
        public DateTime? FingerprintEnrolledAt { get; set; }
        
        public DateTime? VoiceEnrolledAt { get; set; }
        
        public string? EncryptionKey { get; set; }
        
        // Navigation properties
        public virtual User User { get; set; } = null!;
    }
    
    public class TenantSettings : TenantEntity
    {
        // Attendance settings
        public bool IsGpsAttendanceEnabled { get; set; } = true;
        
        public bool IsBeaconAttendanceEnabled { get; set; } = false;
        
        public bool IsFaceRecognitionEnabled { get; set; } = false;
        
        public bool IsBiometricAttendanceEnabled { get; set; } = false;
        
        public bool IsOfflineModeEnabled { get; set; } = true;
        
        public bool IsKioskModeEnabled { get; set; } = false;
        
        public bool RequirePhotoOnCheckIn { get; set; } = false;
        
        public bool RequireLivenessDetection { get; set; } = true;
        
        public double FaceVerificationThreshold { get; set; } = 0.75;
        
        public int MaxFaceTemplatesPerUser { get; set; } = 5;
        
        // Working hours
        public TimeSpan? DefaultWorkStartTime { get; set; }
        
        public TimeSpan? DefaultWorkEndTime { get; set; }
        
        public string? DefaultWorkingDays { get; set; } // JSON array
        
        // Geofence settings
        public double DefaultGeofenceRadius { get; set; } = 100; // meters
        
        public double GeofenceAccuracyTolerance { get; set; } = 50; // meters
        
        // Leave settings
        public int DefaultAnnualLeaveBalance { get; set; } = 21; // days
        
        public bool RequireManagerApproval { get; set; } = true;
        
        public int MaxAdvanceLeaveRequestDays { get; set; } = 90;
        
        // Notification settings
        public bool EnableEmailNotifications { get; set; } = true;
        
        public bool EnablePushNotifications { get; set; } = true;
        
        public bool EnableSmsNotifications { get; set; } = false;
        
        // Security settings
        public int MaxFailedLoginAttempts { get; set; } = 5;
        
        public int AccountLockoutDurationMinutes { get; set; } = 30;
        
        public bool RequirePasswordChange { get; set; } = false;
        
        public int PasswordExpirationDays { get; set; } = 90;
        
        // Data retention
        public int AttendanceDataRetentionDays { get; set; } = 1095; // 3 years
        
        public int AuditLogRetentionDays { get; set; } = 2555; // 7 years
        
        // Integration settings
        public string? HrSystemIntegrationUrl { get; set; }
        
        public string? PayrollSystemIntegrationUrl { get; set; }
        
        public string? SsoProviderUrl { get; set; }
        
        public string? CustomBrandingLogoUrl { get; set; }
        
        public string? CustomBrandingColors { get; set; } // JSON
        
        // Navigation properties
        public override Tenant? Tenant { get; set; } = null!;
    }
}

