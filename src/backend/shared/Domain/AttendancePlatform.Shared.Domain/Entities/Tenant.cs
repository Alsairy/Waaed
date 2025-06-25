using System.ComponentModel.DataAnnotations;

namespace AttendancePlatform.Shared.Domain.Entities
{
    public class Tenant : BaseEntity
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(50)]
        public string Subdomain { get; set; } = string.Empty;
        
        [MaxLength(500)]
        public string? Description { get; set; }
        
        [MaxLength(200)]
        public string? ContactEmail { get; set; }
        
        [MaxLength(20)]
        public string? ContactPhone { get; set; }
        
        [MaxLength(500)]
        public string? Address { get; set; }
        
        [MaxLength(100)]
        public string? City { get; set; }
        
        [MaxLength(100)]
        public string? Country { get; set; }
        
        [MaxLength(20)]
        public string? PostalCode { get; set; }
        
        public string? LogoUrl { get; set; }
        
        public string? PrimaryColor { get; set; }
        
        public string? SecondaryColor { get; set; }
        
        public TenantStatus Status { get; set; } = TenantStatus.Active;
        
        public DateTime? SubscriptionStartDate { get; set; }
        
        public DateTime? SubscriptionEndDate { get; set; }
        
        public int MaxUsers { get; set; } = 100;
        
        public string? TimeZone { get; set; } = "UTC";
        
        public string? Locale { get; set; } = "en-US";
        
        public string? Currency { get; set; } = "USD";
        
        // Navigation properties
        public virtual ICollection<User> Users { get; set; } = new List<User>();
        public virtual ICollection<AttendanceRecord> AttendanceRecords { get; set; } = new List<AttendanceRecord>();
        public virtual TenantSettings? Settings { get; set; }
    }
    
    public enum TenantStatus
    {
        Active = 1,
        Suspended = 2,
        Inactive = 3,
        Trial = 4,
        Expired = 5
    }
}

