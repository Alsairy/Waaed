using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AttendancePlatform.Shared.Domain.Entities;

[Table("AuditLogEntries")]
public class AuditLogEntry : BaseEntity
{
    [Required]
    [MaxLength(100)]
    public string Action { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string EntityType { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string EntityId { get; set; } = string.Empty;

    [MaxLength(50)]
    public string? UserId { get; set; }

    [MaxLength(50)]
    public string? TenantId { get; set; }

    [MaxLength(100)]
    public string? UserName { get; set; }

    [MaxLength(45)]
    public string? IpAddress { get; set; }

    [MaxLength(500)]
    public string? UserAgent { get; set; }

    public string? OldValues { get; set; }

    public string? NewValues { get; set; }

    [MaxLength(1000)]
    public string? AdditionalData { get; set; }

    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    [MaxLength(50)]
    public string Severity { get; set; } = "Information";

    [MaxLength(100)]
    public string? CorrelationId { get; set; }

    [MaxLength(100)]
    public string? SessionId { get; set; }

    public bool IsSuccessful { get; set; } = true;

    [MaxLength(1000)]
    public string? ErrorMessage { get; set; }

    [MaxLength(100)]
    public string? Source { get; set; }

    [MaxLength(100)]
    public string? Category { get; set; }
}
