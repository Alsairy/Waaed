using System.ComponentModel.DataAnnotations;

namespace AttendancePlatform.Shared.Domain.Entities
{
    public abstract class TenantEntity : BaseEntity
    {
        [Required]
        public Guid TenantId { get; set; }
        
        public virtual Tenant? Tenant { get; set; }
    }
}

