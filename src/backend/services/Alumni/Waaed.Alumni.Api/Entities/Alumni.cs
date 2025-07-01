using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Waaed.Shared.Domain.Entities;

namespace Waaed.Alumni.Api.Entities;

[Table("Alumni")]
public class Alumni : BaseEntity
{
    [Key]
    public new Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [StringLength(100)]
    public string FirstName { get; set; } = string.Empty;

    [Required]
    [StringLength(100)]
    public string LastName { get; set; } = string.Empty;

    [StringLength(100)]
    public string? MiddleName { get; set; }

    [Required]
    [StringLength(200)]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [StringLength(20)]
    public string? PhoneNumber { get; set; }

    [StringLength(500)]
    public string? Address { get; set; }

    [StringLength(100)]
    public string? City { get; set; }

    [StringLength(100)]
    public string? State { get; set; }

    [StringLength(20)]
    public string? PostalCode { get; set; }

    [StringLength(100)]
    public string? Country { get; set; }

    [Required]
    [StringLength(50)]
    public string StudentId { get; set; } = string.Empty;

    [Required]
    public DateTime GraduationDate { get; set; }

    [Required]
    [StringLength(200)]
    public string Degree { get; set; } = string.Empty;

    [StringLength(200)]
    public string? Major { get; set; }

    [StringLength(200)]
    public string? Minor { get; set; }

    [Column(TypeName = "decimal(3,2)")]
    public decimal? GPA { get; set; }

    [StringLength(50)]
    public string? GraduationHonors { get; set; }

    [StringLength(200)]
    public string? CurrentEmployer { get; set; }

    [StringLength(200)]
    public string? CurrentJobTitle { get; set; }

    [StringLength(100)]
    public string? Industry { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal? AnnualSalary { get; set; }

    [StringLength(500)]
    public string? WorkAddress { get; set; }

    [StringLength(200)]
    public string? WorkEmail { get; set; }

    [StringLength(20)]
    public string? WorkPhone { get; set; }

    [StringLength(500)]
    public string? LinkedInProfile { get; set; }

    [StringLength(500)]
    public string? FacebookProfile { get; set; }

    [StringLength(500)]
    public string? TwitterProfile { get; set; }

    [StringLength(500)]
    public string? InstagramProfile { get; set; }

    [StringLength(500)]
    public string? PersonalWebsite { get; set; }

    public bool IsEmailVerified { get; set; } = false;

    public bool IsPhoneVerified { get; set; } = false;

    public bool OptInForCommunications { get; set; } = true;

    public bool OptInForEvents { get; set; } = true;

    public bool OptInForJobNotifications { get; set; } = true;

    public bool OptInForDonationRequests { get; set; } = true;

    [StringLength(50)]
    public string Status { get; set; } = "Active";

    [StringLength(1000)]
    public string? Notes { get; set; }

    [StringLength(500)]
    public string? ProfilePictureUrl { get; set; }

    public DateTime? LastContactDate { get; set; }

    public DateTime? LastLoginDate { get; set; }

    [StringLength(100)]
    public string? PreferredContactMethod { get; set; }

    [StringLength(50)]
    public string? TimeZone { get; set; }

    [StringLength(10)]
    public string? PreferredLanguage { get; set; }

    public bool IsDeceased { get; set; } = false;

    public DateTime? DeceasedDate { get; set; }

    public virtual ICollection<AlumniEventRegistration> AlumniEventRegistrations { get; set; } = new List<AlumniEventRegistration>();
    public virtual ICollection<AlumniDonation> AlumniDonations { get; set; } = new List<AlumniDonation>();
    public virtual ICollection<AlumniJobPosting> AlumniJobPostings { get; set; } = new List<AlumniJobPosting>();
    public virtual ICollection<AlumniMentorship> MentorshipAsMentor { get; set; } = new List<AlumniMentorship>();
    public virtual ICollection<AlumniMentorship> MentorshipAsMentee { get; set; } = new List<AlumniMentorship>();
    public virtual ICollection<AlumniAchievement> AlumniAchievements { get; set; } = new List<AlumniAchievement>();
}
