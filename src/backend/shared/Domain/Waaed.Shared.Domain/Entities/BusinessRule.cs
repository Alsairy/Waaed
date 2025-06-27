using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AttendancePlatform.Shared.Domain.Entities
{
    public class BusinessRule : BaseEntity
    {
        [Required]
        public Guid TenantId { get; set; }
        
        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;
        
        [MaxLength(1000)]
        public string Description { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(100)]
        public string Category { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(50)]
        public string RuleType { get; set; } = string.Empty;
        
        [Required]
        public string Conditions { get; set; } = string.Empty; // JSON serialized
        
        [Required]
        public string Actions { get; set; } = string.Empty; // JSON serialized
        
        public bool IsActive { get; set; } = true;
        
        public int Priority { get; set; } = 0;
        
        [MaxLength(100)]
        public string? TriggerEvent { get; set; }
        
        public DateTime? EffectiveFrom { get; set; }
        
        public DateTime? EffectiveTo { get; set; }
        
        // Navigation properties
        public virtual Tenant Tenant { get; set; } = null!;
    }
}
