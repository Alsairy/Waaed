using System.ComponentModel.DataAnnotations;
using Waaed.AcademicCalendar.Api.Entities;

namespace Waaed.AcademicCalendar.Api.DTOs
{
    public class AcademicEventDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public EventType Type { get; set; }
        public EventPriority Priority { get; set; }
        public bool IsAllDay { get; set; }
        public string? Location { get; set; }
        public bool IsRecurring { get; set; }
        public string? RecurrencePattern { get; set; }
        public Guid? AcademicYearId { get; set; }
        public string? AcademicYearName { get; set; }
        public Guid? SemesterId { get; set; }
        public string? SemesterName { get; set; }
        public Guid TenantId { get; set; }
        public Guid CreatedBy { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class CreateAcademicEventDto
    {
        [Required]
        [StringLength(200)]
        public string Title { get; set; } = string.Empty;

        public string? Description { get; set; }

        [Required]
        public DateTime StartDate { get; set; }

        public DateTime? EndDate { get; set; }

        [Required]
        public EventType Type { get; set; }

        public EventPriority Priority { get; set; } = EventPriority.Medium;

        public bool IsAllDay { get; set; } = false;

        public string? Location { get; set; }

        public bool IsRecurring { get; set; } = false;

        public string? RecurrencePattern { get; set; }

        public Guid? AcademicYearId { get; set; }

        public Guid? SemesterId { get; set; }
    }

    public class UpdateAcademicEventDto
    {
        [StringLength(200)]
        public string? Title { get; set; }

        public string? Description { get; set; }

        public DateTime? StartDate { get; set; }

        public DateTime? EndDate { get; set; }

        public EventType? Type { get; set; }

        public EventPriority? Priority { get; set; }

        public bool? IsAllDay { get; set; }

        public string? Location { get; set; }

        public bool? IsRecurring { get; set; }

        public string? RecurrencePattern { get; set; }

        public Guid? AcademicYearId { get; set; }

        public Guid? SemesterId { get; set; }
    }
}
