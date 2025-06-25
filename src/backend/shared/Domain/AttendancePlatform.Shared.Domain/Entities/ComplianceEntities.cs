using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AttendancePlatform.Shared.Domain.Entities
{
    public class ComplianceReport : BaseEntity
    {
        [Required]
        public Guid TenantId { get; set; }
        
        [Required]
        [MaxLength(10)]
        public string Region { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(10)]
        public string Language { get; set; } = string.Empty;
        
        [Required]
        public DateTime StartDate { get; set; }
        
        [Required]
        public DateTime EndDate { get; set; }
        
        [Required]
        public DateTime GeneratedAt { get; set; }
        
        [Required]
        public string ReportData { get; set; } = string.Empty; // JSON serialized report
        
        // Navigation properties
        public virtual Tenant Tenant { get; set; } = null!;
    }

    public class RegionalSettings : BaseEntity
    {
        [Required]
        public Guid TenantId { get; set; }
        
        [Required]
        [MaxLength(10)]
        public string CountryCode { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(100)]
        public string TimeZone { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(10)]
        public string Language { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(10)]
        public string Currency { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(50)]
        public string DateFormat { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(50)]
        public string TimeFormat { get; set; } = string.Empty;
        
        [Required]
        [Range(1, 7)]
        public int WorkingDaysPerWeek { get; set; } = 5;
        
        [Required]
        [Range(1, 24)]
        public double StandardWorkingHours { get; set; } = 8.0;
        
        [Required]
        [Range(1, 24)]
        public double OvertimeThreshold { get; set; } = 8.0;
        
        [Required]
        [MaxLength(50)]
        public string ComplianceLevel { get; set; } = "Standard";
        
        // Navigation properties
        public virtual Tenant Tenant { get; set; } = null!;
    }

    public class LocalizedString : BaseEntity
    {
        [Required]
        [MaxLength(200)]
        public string Key { get; set; } = string.Empty;
        
        [Required]
        public string Value { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(10)]
        public string Language { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(50)]
        public string Module { get; set; } = string.Empty;
        
        [MaxLength(500)]
        public string? Description { get; set; }
        
        public bool IsActive { get; set; } = true;
    }

    public class ComplianceViolation : BaseEntity
    {
        [Required]
        public Guid TenantId { get; set; }
        
        [Required]
        public Guid UserId { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string ViolationType { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(50)]
        public string Severity { get; set; } = string.Empty; // Critical, Warning, Info
        
        [Required]
        [MaxLength(1000)]
        public string Description { get; set; } = string.Empty;
        
        [Required]
        public DateTime DetectedAt { get; set; }
        
        [Required]
        [MaxLength(50)]
        public string Status { get; set; } = "Active"; // Active, Resolved, Dismissed
        
        [Required]
        [MaxLength(10)]
        public string Region { get; set; } = string.Empty;
        
        public DateTime? ResolvedAt { get; set; }
        
        public Guid? ResolvedBy { get; set; }
        
        [MaxLength(1000)]
        public string? ResolutionNotes { get; set; }
        
        // Navigation properties
        public virtual Tenant Tenant { get; set; } = null!;
        public virtual User User { get; set; } = null!;
        public virtual User? ResolvedByUser { get; set; }
    }

    public class ComplianceAuditLog : BaseEntity
    {
        [Required]
        public Guid TenantId { get; set; }
        
        [Required]
        public Guid UserId { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string Action { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(100)]
        public string EntityType { get; set; } = string.Empty;
        
        public Guid? EntityId { get; set; }
        
        [Required]
        public string Details { get; set; } = string.Empty; // JSON serialized details
        
        [Required]
        public DateTime Timestamp { get; set; }
        
        [Required]
        [MaxLength(45)]
        public string IpAddress { get; set; } = string.Empty;
        
        [MaxLength(500)]
        public string? UserAgent { get; set; }
        
        // Navigation properties
        public virtual Tenant Tenant { get; set; } = null!;
        public virtual User User { get; set; } = null!;
    }
}
