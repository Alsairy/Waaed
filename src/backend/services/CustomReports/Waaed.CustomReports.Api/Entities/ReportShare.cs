using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Waaed.Shared.Domain.Entities;

namespace Waaed.CustomReports.Api.Entities;

[Table("ReportShares")]
public class ReportShare : BaseEntity
{
    [Key]
    public new Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public int ReportTemplateId { get; set; }

    [Required]
    [StringLength(100)]
    public string SharedBy { get; set; } = string.Empty;

    [Required]
    [StringLength(100)]
    public string SharedWith { get; set; } = string.Empty;

    [StringLength(50)]
    public string ShareType { get; set; } = "User";

    [Required]
    [StringLength(50)]
    public string Permission { get; set; } = "View";

    [Required]
    public DateTime SharedDate { get; set; }

    public DateTime? ExpiryDate { get; set; }

    [StringLength(50)]
    public string Status { get; set; } = "Active";

    [StringLength(1000)]
    public string? ShareMessage { get; set; }

    [StringLength(500)]
    public string? ShareLink { get; set; }

    [StringLength(100)]
    public string? ShareToken { get; set; }

    public bool RequiresAuthentication { get; set; } = true;

    public bool AllowDownload { get; set; } = true;

    public bool AllowPrint { get; set; } = true;

    public bool AllowExport { get; set; } = true;

    public bool AllowModification { get; set; } = false;

    public bool AllowSharing { get; set; } = false;

    public int ViewCount { get; set; } = 0;

    public int DownloadCount { get; set; } = 0;

    public DateTime? LastAccessed { get; set; }

    [StringLength(50)]
    public string? LastAccessedIP { get; set; }

    [StringLength(200)]
    public string? LastAccessedUserAgent { get; set; }

    [StringLength(1000)]
    public string? AccessLog { get; set; }

    public bool IsRevoked { get; set; } = false;

    public DateTime? RevokedDate { get; set; }

    [StringLength(100)]
    public string? RevokedBy { get; set; }

    [StringLength(500)]
    public string? RevokeReason { get; set; }

    [StringLength(1000)]
    public string? Notes { get; set; }

    [ForeignKey("ReportTemplateId")]
    public virtual ReportTemplate ReportTemplate { get; set; } = null!;
}
