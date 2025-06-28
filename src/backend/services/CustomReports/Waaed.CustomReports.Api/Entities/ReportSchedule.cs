using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Waaed.Shared.Domain.Entities;

namespace Waaed.CustomReports.Api.Entities;

[Table("ReportSchedules")]
public class ReportSchedule : BaseEntity
{
    [Key]
    public new Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public int ReportTemplateId { get; set; }

    [Required]
    [StringLength(200)]
    public string ScheduleName { get; set; } = string.Empty;

    [StringLength(1000)]
    public string? Description { get; set; }

    [Required]
    [StringLength(50)]
    public string Frequency { get; set; } = string.Empty;

    [StringLength(100)]
    public string? CronExpression { get; set; }

    public DateTime? StartDate { get; set; }

    public DateTime? EndDate { get; set; }

    public TimeSpan? ExecutionTime { get; set; }

    [StringLength(100)]
    public string? TimeZone { get; set; }

    [StringLength(50)]
    public string Status { get; set; } = "Active";

    [Required]
    [StringLength(100)]
    public new string CreatedBy { get; set; } = string.Empty;

    [StringLength(100)]
    public string? ModifiedBy { get; set; }

    public DateTime? LastModified { get; set; }

    public DateTime? LastExecuted { get; set; }

    public DateTime? NextExecution { get; set; }

    public int ExecutionCount { get; set; } = 0;

    public int SuccessfulExecutions { get; set; } = 0;

    public int FailedExecutions { get; set; } = 0;

    [StringLength(2000)]
    public string? LastExecutionError { get; set; }

    [StringLength(1000)]
    public string? Parameters { get; set; }

    [StringLength(50)]
    public string? OutputFormat { get; set; }

    [StringLength(1000)]
    public string? EmailRecipients { get; set; }

    [StringLength(200)]
    public string? EmailSubject { get; set; }

    [StringLength(2000)]
    public string? EmailBody { get; set; }

    public bool SendEmailOnSuccess { get; set; } = true;

    public bool SendEmailOnFailure { get; set; } = true;

    public bool AttachReportToEmail { get; set; } = true;

    [StringLength(1000)]
    public string? WebhookUrl { get; set; }

    [StringLength(1000)]
    public string? WebhookHeaders { get; set; }

    public bool SendWebhookNotification { get; set; } = false;

    [StringLength(500)]
    public string? OutputDirectory { get; set; }

    public bool SaveToFileSystem { get; set; } = false;

    public bool OverwriteExistingFiles { get; set; } = false;

    [StringLength(100)]
    public string? FileNamingPattern { get; set; }

    public int? RetentionDays { get; set; }

    public bool IsActive { get; set; } = true;

    [StringLength(1000)]
    public string? Notes { get; set; }

    [ForeignKey("ReportTemplateId")]
    public virtual ReportTemplate ReportTemplate { get; set; } = null!;

    public virtual ICollection<ReportExecution> ReportExecutions { get; set; } = new List<ReportExecution>();
}
