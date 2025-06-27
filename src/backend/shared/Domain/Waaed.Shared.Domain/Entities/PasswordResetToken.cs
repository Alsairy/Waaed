using System.ComponentModel.DataAnnotations;

namespace AttendancePlatform.Shared.Domain.Entities
{
    public class PasswordResetToken : BaseEntity
    {
        [Required]
        public string Token { get; set; } = string.Empty;
        
        [Required]
        public Guid UserId { get; set; }
        
        [Required]
        public DateTime ExpiresAt { get; set; }
        
        public bool IsUsed { get; set; } = false;
        
        public DateTime? UsedAt { get; set; }
        
        public string? UsedByIp { get; set; }
        
        // Navigation properties
        public virtual User User { get; set; } = null!;
        
        public bool IsExpired => DateTime.UtcNow >= ExpiresAt;
        
        public bool IsValid => !IsUsed && !IsExpired;
    }
}
