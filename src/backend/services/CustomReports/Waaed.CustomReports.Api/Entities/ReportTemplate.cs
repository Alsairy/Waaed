using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Waaed.Shared.Domain.Entities;

namespace Waaed.CustomReports.Api.Entities;

[Table("ReportTemplates")]
public class ReportTemplate : BaseEntity
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

    [Required]
    [StringLength(50)]
    public string ReportType { get; set; } = string.Empty;

    [Required]
    [StringLength(2000)]
    public string DataSource { get; set; } = string.Empty;

    [StringLength(5000)]
    public string? QueryDefinition { get; set; }

    [StringLength(5000)]
    public string? FilterDefinition { get; set; }

    [StringLength(2000)]
    public string? GroupingDefinition { get; set; }

    [StringLength(2000)]
    public string? SortingDefinition { get; set; }

    [StringLength(5000)]
    public string? ColumnDefinition { get; set; }

    [StringLength(2000)]
    public string? ChartConfiguration { get; set; }

    [StringLength(1000)]
    public string? LayoutConfiguration { get; set; }

    [StringLength(1000)]
    public string? StyleConfiguration { get; set; }

    [Required]
    [StringLength(100)]
    public new string CreatedBy { get; set; } = string.Empty;

    [StringLength(100)]
    public string? ModifiedBy { get; set; }

    public DateTime? LastModified { get; set; }

    [StringLength(50)]
    public string Status { get; set; } = "Active";

    public bool IsPublic { get; set; } = false;

    public bool IsSystemTemplate { get; set; } = false;

    [StringLength(1000)]
    public string? Tags { get; set; }

    [StringLength(1000)]
    public string? AccessPermissions { get; set; }

    [StringLength(50)]
    public string? RefreshFrequency { get; set; }

    public bool AutoRefresh { get; set; } = false;

    public DateTime? LastRefreshed { get; set; }

    [StringLength(1000)]
    public string? Parameters { get; set; }

    [StringLength(1000)]
    public string? DefaultParameters { get; set; }

    [StringLength(50)]
    public string? OutputFormat { get; set; }

    public bool EnableExport { get; set; } = true;

    public bool EnableScheduling { get; set; } = false;

    [StringLength(1000)]
    public string? ScheduleConfiguration { get; set; }

    [StringLength(1000)]
    public string? NotificationSettings { get; set; }

    [StringLength(2000)]
    public string? Notes { get; set; }

    public bool IsActive { get; set; } = true;

    public virtual ICollection<ReportExecution> ReportExecutions { get; set; } = new List<ReportExecution>();
    public virtual ICollection<ReportSchedule> ReportSchedules { get; set; } = new List<ReportSchedule>();
    public virtual ICollection<ReportShare> ReportShares { get; set; } = new List<ReportShare>();
}
