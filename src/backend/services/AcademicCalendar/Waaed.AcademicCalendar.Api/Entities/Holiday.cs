using System.ComponentModel.DataAnnotations;
using Waaed.Shared.Domain.Common;

namespace Waaed.AcademicCalendar.Api.Entities
{
    public enum HolidayType
    {
        National = 1,
        Religious = 2,
        Academic = 3,
        Local = 4,
        Other = 5
    }

    public class Holiday : BaseEntity
    {
        [Required]
        [StringLength(200)]
        public string Name { get; set; } = string.Empty;

        public string? Description { get; set; }

        [Required]
        public DateTime Date { get; set; }

        public DateTime? EndDate { get; set; }

        [Required]
        public HolidayType Type { get; set; }

        public bool IsRecurring { get; set; } = false;

        public string? RecurrencePattern { get; set; }

        public bool IsObserved { get; set; } = true;

        public Guid? AcademicYearId { get; set; }
        public virtual AcademicYear? AcademicYear { get; set; }

        public Guid TenantId { get; set; }
    }
}
