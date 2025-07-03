using System.ComponentModel.DataAnnotations;
using Waaed.Shared.Domain.Common;

namespace Waaed.AcademicCalendar.Api.Entities
{
    public enum EventType
    {
        Exam = 1,
        Assignment = 2,
        Holiday = 3,
        Meeting = 4,
        Deadline = 5,
        Orientation = 6,
        Graduation = 7,
        Registration = 8,
        Other = 9
    }

    public enum EventPriority
    {
        Low = 1,
        Medium = 2,
        High = 3,
        Critical = 4
    }

    public class AcademicEvent : BaseEntity
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
        public virtual AcademicYear? AcademicYear { get; set; }

        public Guid? SemesterId { get; set; }
        public virtual Semester? Semester { get; set; }

        public Guid TenantId { get; set; }

        public Guid CreatedBy { get; set; }
    }
}
