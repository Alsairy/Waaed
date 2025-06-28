using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Waaed.Shared.Domain.Entities;

namespace Waaed.CustomReports.Api.Entities;

[Table("ReportDashboardWidgets")]
public class ReportDashboardWidget : BaseEntity
{
    [Key]
    public new Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public int DashboardId { get; set; }

    public int? ReportTemplateId { get; set; }

    [Required]
    [StringLength(200)]
    public string WidgetName { get; set; } = string.Empty;

    [StringLength(1000)]
    public string? Description { get; set; }

    [Required]
    [StringLength(50)]
    public string WidgetType { get; set; } = string.Empty;

    [Required]
    public int PositionX { get; set; }

    [Required]
    public int PositionY { get; set; }

    [Required]
    public int Width { get; set; }

    [Required]
    public int Height { get; set; }

    [StringLength(2000)]
    public string? Configuration { get; set; }

    [StringLength(1000)]
    public string? StyleConfiguration { get; set; }

    [StringLength(1000)]
    public string? DataConfiguration { get; set; }

    [StringLength(1000)]
    public string? FilterConfiguration { get; set; }

    [StringLength(1000)]
    public string? ChartConfiguration { get; set; }

    public bool AutoRefresh { get; set; } = false;

    public int? RefreshIntervalMinutes { get; set; }

    public DateTime? LastRefreshed { get; set; }

    [StringLength(50)]
    public string Status { get; set; } = "Active";

    public bool IsVisible { get; set; } = true;

    public bool IsResizable { get; set; } = true;

    public bool IsMovable { get; set; } = true;

    [StringLength(1000)]
    public string? Title { get; set; }

    [StringLength(2000)]
    public string? Subtitle { get; set; }

    public bool ShowTitle { get; set; } = true;

    public bool ShowBorder { get; set; } = true;

    public bool ShowHeader { get; set; } = true;

    public bool ShowFooter { get; set; } = false;

    [StringLength(1000)]
    public string? HeaderContent { get; set; }

    [StringLength(1000)]
    public string? FooterContent { get; set; }

    [StringLength(1000)]
    public string? DrillDownConfiguration { get; set; }

    [StringLength(1000)]
    public string? InteractionConfiguration { get; set; }

    [StringLength(1000)]
    public string? AlertConfiguration { get; set; }

    [StringLength(1000)]
    public string? CacheConfiguration { get; set; }

    [StringLength(1000)]
    public string? SecurityConfiguration { get; set; }

    [StringLength(1000)]
    public string? Notes { get; set; }

    [ForeignKey("DashboardId")]
    public virtual ReportDashboard Dashboard { get; set; } = null!;

    [ForeignKey("ReportTemplateId")]
    public virtual ReportTemplate? ReportTemplate { get; set; }
}
