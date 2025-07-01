using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Waaed.Shared.Domain.Entities;

namespace Waaed.Alumni.Api.Entities;

[Table("AlumniAchievements")]
public class AlumniAchievement : BaseEntity
{
    [Key]
    public new Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public Guid AlumniId { get; set; }

    [Required]
    [StringLength(200)]
    public string Title { get; set; } = string.Empty;

    [StringLength(2000)]
    public string? Description { get; set; }

    [StringLength(100)]
    public string? Category { get; set; }

    [Required]
    public DateTime AchievementDate { get; set; }

    [StringLength(200)]
    public string? Organization { get; set; }

    [StringLength(500)]
    public string? CertificateUrl { get; set; }

    [StringLength(500)]
    public string? VerificationUrl { get; set; }

    public bool IsVerified { get; set; } = false;

    public DateTime? VerifiedAt { get; set; }

    [StringLength(100)]
    public string? VerifiedBy { get; set; }

    public bool IsPublic { get; set; } = true;

    public bool IsFeatured { get; set; } = false;

    [StringLength(500)]
    public string? ImageUrl { get; set; }

    [StringLength(1000)]
    public string? Tags { get; set; }

    [StringLength(1000)]
    public string? InternalNotes { get; set; }

    public int ViewCount { get; set; } = 0;

    public int LikeCount { get; set; } = 0;

    public int ShareCount { get; set; } = 0;

    [ForeignKey("AlumniId")]
    public virtual Alumni Alumni { get; set; } = null!;
}
