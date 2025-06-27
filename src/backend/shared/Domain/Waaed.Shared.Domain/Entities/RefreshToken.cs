using System.ComponentModel.DataAnnotations;

namespace AttendancePlatform.Shared.Domain.Entities
{
    public class RefreshToken : BaseEntity
    {
        [Required]
        public string Token { get; set; } = string.Empty;
        
        [Required]
        public Guid UserId { get; set; }
        
        [Required]
        public DateTime ExpiresAt { get; set; }
        
        public bool IsRevoked { get; set; } = false;
        
        public DateTime? RevokedAt { get; set; }
        
        public string? RevokedByIp { get; set; }
        
        public string? ReplacedByToken { get; set; }
        
        // Navigation properties
        public virtual User User { get; set; } = null!;
        
        public bool IsExpired => DateTime.UtcNow >= ExpiresAt;
        
        public bool IsActive => !IsRevoked && !IsExpired;
    }
}
