using System.ComponentModel.DataAnnotations;
using Waaed.Shared.Domain.Common;

namespace Waaed.AcademicCalendar.Api.Entities
{
    public enum SemesterType
    {
        Fall = 1,
        Spring = 2,
        Summer = 3,
        Winter = 4
    }

    public class Semester : BaseEntity
    {
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        public SemesterType Type { get; set; }

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime EndDate { get; set; }

        public bool IsActive { get; set; } = true;

        public string? Description { get; set; }

        [Required]
        public Guid AcademicYearId { get; set; }
        public virtual AcademicYear AcademicYear { get; set; } = null!;

        public Guid TenantId { get; set; }

        public virtual ICollection<AcademicEvent> AcademicEvents { get; set; } = new List<AcademicEvent>();
    }
}
