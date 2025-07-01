using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Waaed.Shared.Domain.Entities;

namespace Waaed.Alumni.Api.Entities;

[Table("AlumniJobPostings")]
public class AlumniJobPosting : BaseEntity
{
    [Key]
    public new Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [StringLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [StringLength(200)]
    public string Company { get; set; } = string.Empty;

    [StringLength(2000)]
    public string? Description { get; set; }

    [StringLength(1000)]
    public string? Requirements { get; set; }

    [StringLength(500)]
    public string? Location { get; set; }

    [StringLength(50)]
    public string? JobType { get; set; }

    [StringLength(50)]
    public string? ExperienceLevel { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal? SalaryMin { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal? SalaryMax { get; set; }

    [StringLength(10)]
    public string? SalaryCurrency { get; set; }

    [StringLength(50)]
    public string? SalaryPeriod { get; set; }

    public bool IsRemote { get; set; } = false;

    public bool IsHybrid { get; set; } = false;

    [Required]
    public DateTime PostedDate { get; set; }

    public DateTime? ApplicationDeadline { get; set; }

    [StringLength(50)]
    public string Status { get; set; } = "Active";

    [Required]
    public int PostedByAlumniId { get; set; }

    [StringLength(200)]
    public string? ContactEmail { get; set; }

    [StringLength(20)]
    public string? ContactPhone { get; set; }

    [StringLength(500)]
    public string? ApplicationUrl { get; set; }

    [StringLength(1000)]
    public string? Benefits { get; set; }

    [StringLength(500)]
    public string? Skills { get; set; }

    [StringLength(100)]
    public string? Industry { get; set; }

    [StringLength(100)]
    public string? Department { get; set; }

    public int ViewCount { get; set; } = 0;

    public int ApplicationCount { get; set; } = 0;

    public bool IsFeatured { get; set; } = false;

    public bool IsApproved { get; set; } = false;

    public DateTime? ApprovedAt { get; set; }

    [StringLength(100)]
    public string? ApprovedBy { get; set; }

    [StringLength(1000)]
    public string? InternalNotes { get; set; }

    [ForeignKey("PostedByAlumniId")]
    public virtual Alumni PostedByAlumni { get; set; } = null!;

    public virtual ICollection<AlumniJobApplication> JobApplications { get; set; } = new List<AlumniJobApplication>();
}
