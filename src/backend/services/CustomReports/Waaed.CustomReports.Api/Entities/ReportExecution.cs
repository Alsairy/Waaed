using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Waaed.Shared.Domain.Entities;

namespace Waaed.CustomReports.Api.Entities;

[Table("ReportExecutions")]
public class ReportExecution : BaseEntity
{
    [Key]
    public new Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public int ReportTemplateId { get; set; }

    [Required]
    [StringLength(100)]
    public string ExecutedBy { get; set; } = string.Empty;

    [Required]
    public DateTime ExecutionStartTime { get; set; }

    public DateTime? ExecutionEndTime { get; set; }

    [StringLength(50)]
    public string Status { get; set; } = "Running";

    [StringLength(2000)]
    public string? ErrorMessage { get; set; }

    [StringLength(1000)]
    public string? Parameters { get; set; }

    [StringLength(50)]
    public string? OutputFormat { get; set; }

    [StringLength(500)]
    public string? OutputFilePath { get; set; }

    [StringLength(500)]
    public string? OutputFileName { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal? FileSizeMB { get; set; }

    public int? RecordCount { get; set; }

    public int? PageCount { get; set; }

    [Column(TypeName = "decimal(10,2)")]
    public decimal? ExecutionTimeSeconds { get; set; }

    [StringLength(200)]
    public string? DataSourceUsed { get; set; }

    [StringLength(2000)]
    public string? QueryExecuted { get; set; }

    [StringLength(1000)]
    public string? FiltersApplied { get; set; }

    [StringLength(1000)]
    public string? GroupingApplied { get; set; }

    [StringLength(1000)]
    public string? SortingApplied { get; set; }

    public bool IsScheduled { get; set; } = false;

    public int? ScheduleId { get; set; }

    [StringLength(100)]
    public string? ExecutionMode { get; set; }

    [StringLength(1000)]
    public string? CacheKey { get; set; }

    public bool IsCached { get; set; } = false;

    public DateTime? CacheExpiry { get; set; }

    [StringLength(1000)]
    public string? ExecutionNotes { get; set; }

    [StringLength(200)]
    public string? UserAgent { get; set; }

    [StringLength(50)]
    public string? IPAddress { get; set; }

    public new bool IsDeleted { get; set; } = false;

    public new DateTime? DeletedAt { get; set; }

    [StringLength(100)]
    public new string? DeletedBy { get; set; }

    [ForeignKey("ReportTemplateId")]
    public virtual ReportTemplate ReportTemplate { get; set; } = null!;

    [ForeignKey("ScheduleId")]
    public virtual ReportSchedule? ReportSchedule { get; set; }
}
