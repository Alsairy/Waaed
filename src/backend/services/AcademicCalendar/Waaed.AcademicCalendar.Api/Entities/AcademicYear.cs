using System.ComponentModel.DataAnnotations;
using Waaed.Shared.Domain.Common;

namespace Waaed.AcademicCalendar.Api.Entities
{
    public class AcademicYear : BaseEntity
    {
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime EndDate { get; set; }

        public bool IsActive { get; set; } = true;

        public string? Description { get; set; }

        public Guid TenantId { get; set; }

        public virtual ICollection<Semester> Semesters { get; set; } = new List<Semester>();
        public virtual ICollection<AcademicEvent> AcademicEvents { get; set; } = new List<AcademicEvent>();
        public virtual ICollection<Holiday> Holidays { get; set; } = new List<Holiday>();
    }
}
