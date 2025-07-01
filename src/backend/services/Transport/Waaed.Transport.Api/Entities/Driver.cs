using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Waaed.Shared.Domain.Entities;

namespace Waaed.Transport.Api.Entities;

[Table("Drivers")]
public class Driver : BaseEntity
{
    [Key]
    public new Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [StringLength(50)]
    public string EmployeeId { get; set; } = string.Empty;

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

    [Required]
    [StringLength(20)]
    public string PhoneNumber { get; set; } = string.Empty;

    [StringLength(20)]
    public string? AlternatePhoneNumber { get; set; }

    [Required]
    public DateTime DateOfBirth { get; set; }

    [StringLength(10)]
    public string? Gender { get; set; }

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
    public string LicenseNumber { get; set; } = string.Empty;

    [Required]
    [StringLength(50)]
    public string LicenseType { get; set; } = string.Empty;

    [Required]
    public DateTime LicenseIssueDate { get; set; }

    [Required]
    public DateTime LicenseExpiryDate { get; set; }

    [StringLength(100)]
    public string? LicenseIssuingAuthority { get; set; }

    [Required]
    public DateTime JoiningDate { get; set; }

    public DateTime? LeavingDate { get; set; }

    [StringLength(50)]
    public string Status { get; set; } = "Active";

    [Column(TypeName = "decimal(18,2)")]
    public decimal Salary { get; set; }

    [StringLength(50)]
    public string? BloodGroup { get; set; }

    [StringLength(200)]
    public string? EmergencyContactName { get; set; }

    [StringLength(20)]
    public string? EmergencyContactPhone { get; set; }

    [StringLength(100)]
    public string? EmergencyContactRelation { get; set; }

    public int ExperienceYears { get; set; } = 0;

    [StringLength(1000)]
    public string? PreviousEmployment { get; set; }

    [StringLength(1000)]
    public string? Skills { get; set; }

    [StringLength(1000)]
    public string? Certifications { get; set; }

    public bool HasMedicalCertificate { get; set; } = false;

    public DateTime? MedicalCertificateExpiryDate { get; set; }

    public bool HasPoliceClearance { get; set; } = false;

    public DateTime? PoliceClearanceExpiryDate { get; set; }

    [StringLength(1000)]
    public string? Notes { get; set; }

    [StringLength(500)]
    public string? ProfilePictureUrl { get; set; }

    public bool IsActive { get; set; } = true;

    public bool IsAvailable { get; set; } = true;

    public DateTime? LastActiveDate { get; set; }

    public virtual ICollection<RouteAssignment> RouteAssignments { get; set; } = new List<RouteAssignment>();
    public virtual ICollection<TripRecord> TripRecords { get; set; } = new List<TripRecord>();
    public virtual ICollection<DriverPerformanceRecord> PerformanceRecords { get; set; } = new List<DriverPerformanceRecord>();
}
