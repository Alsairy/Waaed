using System.ComponentModel.DataAnnotations;
using Waaed.AcademicCalendar.Api.Entities;

namespace Waaed.AcademicCalendar.Api.DTOs
{
    public class HolidayDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime Date { get; set; }
        public DateTime? EndDate { get; set; }
        public HolidayType Type { get; set; }
        public bool IsRecurring { get; set; }
        public string? RecurrencePattern { get; set; }
        public bool IsObserved { get; set; }
        public Guid? AcademicYearId { get; set; }
        public string? AcademicYearName { get; set; }
        public Guid TenantId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class CreateHolidayDto
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
    }

    public class UpdateHolidayDto
    {
        [StringLength(200)]
        public string? Name { get; set; }

        public string? Description { get; set; }

        public DateTime? Date { get; set; }

        public DateTime? EndDate { get; set; }

        public HolidayType? Type { get; set; }

        public bool? IsRecurring { get; set; }

        public string? RecurrencePattern { get; set; }

        public bool? IsObserved { get; set; }

        public Guid? AcademicYearId { get; set; }
    }
}
