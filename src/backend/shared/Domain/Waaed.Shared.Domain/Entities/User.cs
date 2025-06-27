using System.ComponentModel.DataAnnotations;

namespace AttendancePlatform.Shared.Domain.Entities
{
    public class User : TenantEntity
    {
        [Required]
        [MaxLength(100)]
        public string FirstName { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(100)]
        public string LastName { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(200)]
        public string Email { get; set; } = string.Empty;
        
        [MaxLength(20)]
        public string? PhoneNumber { get; set; }
        
        [MaxLength(50)]
        public string? EmployeeId { get; set; }
        
        [MaxLength(100)]
        public string? Department { get; set; }
        
        [MaxLength(100)]
        public string? Position { get; set; }
        
        public DateTime? HireDate { get; set; }
        
        // public DateTime? DateOfBirth { get; set; }
        
        public string? ProfilePictureUrl { get; set; }
        
        public UserStatus Status { get; set; } = UserStatus.Active;
        
        public bool IsActive { get; set; } = true;
        
        public bool IsEmailVerified { get; set; } = false;
        
        public bool IsPhoneVerified { get; set; } = false;
        
        public DateTime? LastLoginAt { get; set; }
        
        public string? PasswordHash { get; set; }
        
        public string? PasswordSalt { get; set; }
        
        public DateTime? PasswordChangedAt { get; set; }
        
        public bool RequirePasswordChange { get; set; } = false;
        
        // public int FailedLoginAttempts { get; set; } = 0;
        
        public DateTime? LockedUntil { get; set; }
        
        public string? TwoFactorSecret { get; set; }
        
        public bool IsTwoFactorEnabled { get; set; } = false;
        
        public Guid? ManagerId { get; set; }
        
        // Navigation properties
        public virtual User? Manager { get; set; }
        public virtual ICollection<User> DirectReports { get; set; } = new List<User>();
        public virtual ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
        public virtual ICollection<AttendanceRecord> AttendanceRecords { get; set; } = new List<AttendanceRecord>();
        public virtual ICollection<LeaveRequest> LeaveRequests { get; set; } = new List<LeaveRequest>();
        public virtual ICollection<PermissionRequest> PermissionRequests { get; set; } = new List<PermissionRequest>();
        public virtual UserBiometrics? Biometrics { get; set; }
        
        public string? NotificationPreferences { get; set; }
        
        public virtual ICollection<Role> Roles => UserRoles.Select(ur => ur.Role).ToList();
        
        public string FullName => $"{FirstName} {LastName}";
    }
    
    public enum UserStatus
    {
        Active = 1,
        Inactive = 2,
        Suspended = 3,
        Terminated = 4,
        OnLeave = 5
    }
}

