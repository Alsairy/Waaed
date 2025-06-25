using System.ComponentModel.DataAnnotations;

namespace AttendancePlatform.Shared.Domain.Entities
{
    public class Geofence : TenantEntity
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;
        
        [MaxLength(500)]
        public string? Description { get; set; }
        
        [Required]
        public double Latitude { get; set; }
        
        [Required]
        public double Longitude { get; set; }
        
        [Required]
        public double Radius { get; set; } // in meters
        
        [MaxLength(200)]
        public string? Address { get; set; }
        
        [MaxLength(100)]
        public string? City { get; set; }
        
        [MaxLength(100)]
        public string? Country { get; set; }
        
        [MaxLength(20)]
        public string? PostalCode { get; set; }
        
        public bool IsActive { get; set; } = true;
        
        public GeofenceType Type { get; set; } = GeofenceType.Workplace;
        
        // Working hours for this location
        public TimeSpan? WorkStartTime { get; set; }
        public TimeSpan? WorkEndTime { get; set; }
        public string? WorkingDays { get; set; } // JSON array of days
        
        // Tolerance settings
        public double? AccuracyTolerance { get; set; } // in meters
        public int? TimeToleranceMinutes { get; set; }
        
        // Navigation properties
        public virtual ICollection<AttendanceRecord> AttendanceRecords { get; set; } = new List<AttendanceRecord>();
        public virtual ICollection<UserGeofence> UserGeofences { get; set; } = new List<UserGeofence>();
        public virtual ICollection<Beacon> Beacons { get; set; } = new List<Beacon>();
    }
    
    public class UserGeofence : TenantEntity
    {
        [Required]
        public Guid UserId { get; set; }
        
        [Required]
        public Guid GeofenceId { get; set; }
        
        public bool IsActive { get; set; } = true;
        
        public DateTime AssignedAt { get; set; } = DateTime.UtcNow;
        
        public Guid? AssignedBy { get; set; }
        
        // Navigation properties
        public virtual User User { get; set; } = null!;
        public virtual Geofence Geofence { get; set; } = null!;
    }
    
    public class Beacon : TenantEntity
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(100)]
        public string BeaconId { get; set; } = string.Empty; // UUID or identifier
        
        [MaxLength(100)]
        public string? Major { get; set; }
        
        [MaxLength(100)]
        public string? Minor { get; set; }
        
        [MaxLength(500)]
        public string? Description { get; set; }
        
        public Guid? GeofenceId { get; set; }
        
        public bool IsActive { get; set; } = true;
        
        public double? Range { get; set; } // in meters
        
        public int? TxPower { get; set; }
        
        public DateTime? LastSeenAt { get; set; }
        
        public int? BatteryLevel { get; set; }
        
        // Navigation properties
        public virtual Geofence? Geofence { get; set; }
    }
    
    public enum GeofenceType
    {
        Workplace = 1,
        Branch = 2,
        Site = 3,
        Remote = 4,
        Temporary = 5
    }
}

