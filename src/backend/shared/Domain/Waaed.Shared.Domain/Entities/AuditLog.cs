using System.ComponentModel.DataAnnotations;

namespace AttendancePlatform.Shared.Domain.Entities
{
    public enum AuditAction
    {
        Create = 1,
        Update = 2,
        Delete = 3,
        Login = 4,
        Logout = 5,
        CheckIn = 6,
        CheckOut = 7,
        LeaveRequest = 8,
        LeaveApproval = 9,
        PermissionRequest = 10,
        PermissionApproval = 11,
        BiometricEnrollment = 12,
        BiometricVerification = 13,
        PasswordChange = 14,
        PasswordReset = 15,
        AccountLockout = 16,
        AccountUnlock = 17,
        RoleAssignment = 18,
        PermissionGrant = 19,
        SettingsChange = 20,
        DataExport = 21,
        DataImport = 22
    }

    public class AuditLog : TenantEntity
    {
        [Required]
        public Guid? UserId { get; set; } // Nullable for system actions
        
        [Required]
        public AuditAction Action { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string EntityType { get; set; } = string.Empty; // e.g., "User", "AttendanceRecord"
        
        public Guid? EntityId { get; set; } // ID of the affected entity
        
        [Required]
        public DateTime Timestamp { get; set; }
        
        [MaxLength(500)]
        public string? Description { get; set; }
        
        public string? OldValues { get; set; } // JSON of old values for updates
        
        public string? NewValues { get; set; } // JSON of new values for updates
        
        [MaxLength(45)]
        public string? IpAddress { get; set; }
        
        [MaxLength(500)]
        public string? UserAgent { get; set; }
        
        [MaxLength(100)]
        public string? DeviceId { get; set; }
        
        [MaxLength(50)]
        public string? DeviceType { get; set; }
        
        [MaxLength(100)]
        public string? Location { get; set; } // Geographic location if available
        
        public bool IsSuccessful { get; set; } = true;
        
        [MaxLength(500)]
        public string? FailureReason { get; set; }
        
        [MaxLength(100)]
        public string? SessionId { get; set; }
        
        public string? AdditionalData { get; set; } // JSON for extra context
        
        // Navigation properties
        public virtual User? User { get; set; }
    }
}

