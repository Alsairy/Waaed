using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Waaed.Shared.Domain.Entities;

namespace Waaed.CustomReports.Api.Entities;

[Table("ReportDashboards")]
public class ReportDashboard : BaseEntity
{
    [Key]
    public new Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [StringLength(200)]
    public string Name { get; set; } = string.Empty;

    [StringLength(1000)]
    public string? Description { get; set; }

    [Required]
    [StringLength(50)]
    public string Category { get; set; } = string.Empty;

    [StringLength(5000)]
    public string? LayoutConfiguration { get; set; }

    [StringLength(2000)]
    public string? StyleConfiguration { get; set; }

    [StringLength(1000)]
    public string? FilterConfiguration { get; set; }

    [StringLength(1000)]
    public string? RefreshConfiguration { get; set; }

    public bool AutoRefresh { get; set; } = false;

    public int? RefreshIntervalMinutes { get; set; }

    [Required]
    [StringLength(100)]
    public new string CreatedBy { get; set; } = string.Empty;

    [StringLength(100)]
    public string? ModifiedBy { get; set; }

    public DateTime? LastModified { get; set; }

    [StringLength(50)]
    public string Status { get; set; } = "Active";

    public bool IsPublic { get; set; } = false;

    public bool IsDefault { get; set; } = false;

    [StringLength(1000)]
    public string? Tags { get; set; }

    [StringLength(1000)]
    public string? AccessPermissions { get; set; }

    public int ViewCount { get; set; } = 0;

    public DateTime? LastViewed { get; set; }

    [StringLength(100)]
    public string? LastViewedBy { get; set; }

    [StringLength(1000)]
    public string? ShareSettings { get; set; }

    [StringLength(1000)]
    public string? ExportSettings { get; set; }

    [StringLength(1000)]
    public string? NotificationSettings { get; set; }

    [StringLength(2000)]
    public string? Notes { get; set; }

    public bool IsActive { get; set; } = true;

    public virtual ICollection<ReportDashboardWidget> DashboardWidgets { get; set; } = new List<ReportDashboardWidget>();
}
