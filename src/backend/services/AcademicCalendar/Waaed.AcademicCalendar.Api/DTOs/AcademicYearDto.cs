using System.ComponentModel.DataAnnotations;

namespace Waaed.AcademicCalendar.Api.DTOs
{
    public class AcademicYearDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public bool IsActive { get; set; }
        public string? Description { get; set; }
        public Guid TenantId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public List<SemesterDto> Semesters { get; set; } = new();
        public List<AcademicEventDto> AcademicEvents { get; set; } = new();
        public List<HolidayDto> Holidays { get; set; } = new();
    }

    public class CreateAcademicYearDto
    {
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime EndDate { get; set; }

        public string? Description { get; set; }
    }

    public class UpdateAcademicYearDto
    {
        [StringLength(100)]
        public string? Name { get; set; }

        public DateTime? StartDate { get; set; }

        public DateTime? EndDate { get; set; }

        public bool? IsActive { get; set; }

        public string? Description { get; set; }
    }
}
