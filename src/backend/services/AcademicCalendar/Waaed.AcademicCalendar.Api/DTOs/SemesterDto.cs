using System.ComponentModel.DataAnnotations;
using Waaed.AcademicCalendar.Api.Entities;

namespace Waaed.AcademicCalendar.Api.DTOs
{
    public class SemesterDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public SemesterType Type { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public bool IsActive { get; set; }
        public string? Description { get; set; }
        public Guid AcademicYearId { get; set; }
        public string AcademicYearName { get; set; } = string.Empty;
        public Guid TenantId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public List<AcademicEventDto> AcademicEvents { get; set; } = new();
    }

    public class CreateSemesterDto
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

        public string? Description { get; set; }

        [Required]
        public Guid AcademicYearId { get; set; }
    }

    public class UpdateSemesterDto
    {
        [StringLength(100)]
        public string? Name { get; set; }

        public SemesterType? Type { get; set; }

        public DateTime? StartDate { get; set; }

        public DateTime? EndDate { get; set; }

        public bool? IsActive { get; set; }

        public string? Description { get; set; }

        public Guid? AcademicYearId { get; set; }
    }
}
