using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AttendancePlatform.Shared.Domain.Entities;

[Table("BiometricTemplates")]
public class BiometricTemplate : TenantEntity
{
    [Required]
    [MaxLength(50)]
    public string UserId { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string BiometricType { get; set; } = string.Empty;

    public byte[] TemplateData { get; set; } = Array.Empty<byte>();

    public double QualityScore { get; set; }

    [MaxLength(100)]
    public string DeviceId { get; set; } = string.Empty;

    [MaxLength(100)]
    public string Algorithm { get; set; } = string.Empty;

    [MaxLength(20)]
    public string Version { get; set; } = string.Empty;

    public bool IsActive { get; set; } = true;

    public DateTime EnrolledAt { get; set; } = DateTime.UtcNow;

    public DateTime? LastUsedAt { get; set; }

    public int UsageCount { get; set; } = 0;

    public string Metadata { get; set; } = "{}";

    [MaxLength(100)]
    public string? BackupId { get; set; }

    public DateTime? ExpiresAt { get; set; }

    public virtual User User { get; set; } = null!;
}

[Table("BiometricAuditLogs")]
public class BiometricAuditLog : TenantEntity
{
    [Required]
    [MaxLength(50)]
    public string UserId { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string EventType { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string BiometricType { get; set; } = string.Empty;

    [MaxLength(100)]
    public string DeviceId { get; set; } = string.Empty;

    [MaxLength(100)]
    public string SessionId { get; set; } = string.Empty;

    public bool IsSuccessful { get; set; }

    [MaxLength(1000)]
    public string? ErrorMessage { get; set; }

    public double? ConfidenceScore { get; set; }

    public double? QualityScore { get; set; }

    public TimeSpan? ProcessingTime { get; set; }

    [MaxLength(45)]
    public string? IpAddress { get; set; }

    [MaxLength(500)]
    public string? UserAgent { get; set; }

    public string Metadata { get; set; } = "{}";

    public DateTime EventTimestamp { get; set; } = DateTime.UtcNow;

    [MaxLength(50)]
    public string? TemplateId { get; set; }

    [MaxLength(100)]
    public string? CorrelationId { get; set; }

    public virtual User User { get; set; } = null!;
}

[Table("BiometricBackups")]
public class BiometricBackup : TenantEntity
{
    [Required]
    [MaxLength(50)]
    public string UserId { get; set; } = string.Empty;

    public byte[] BackupData { get; set; } = Array.Empty<byte>();

    [MaxLength(100)]
    public string EncryptionKey { get; set; } = string.Empty;

    public DateTime BackupDate { get; set; } = DateTime.UtcNow;

    public DateTime? ExpiresAt { get; set; }

    public int TemplateCount { get; set; }

    [MaxLength(50)]
    public string Status { get; set; } = "active";

    [MaxLength(1000)]
    public string? Description { get; set; }

    public string Metadata { get; set; } = "{}";

    public virtual User User { get; set; } = null!;
}

[Table("BiometricSessions")]
public class BiometricSession : TenantEntity
{
    [Required]
    [MaxLength(50)]
    public string UserId { get; set; } = string.Empty;

    [MaxLength(100)]
    public string SessionId { get; set; } = string.Empty;

    [MaxLength(100)]
    public string DeviceId { get; set; } = string.Empty;

    [MaxLength(50)]
    public string BiometricType { get; set; } = string.Empty;

    [MaxLength(50)]
    public string Status { get; set; } = "active";

    public DateTime StartedAt { get; set; } = DateTime.UtcNow;

    public DateTime? CompletedAt { get; set; }

    public DateTime ExpiresAt { get; set; }

    public int AttemptCount { get; set; } = 0;

    public int MaxAttempts { get; set; } = 5;

    [MaxLength(45)]
    public string? IpAddress { get; set; }

    [MaxLength(500)]
    public string? UserAgent { get; set; }

    public string Metadata { get; set; } = "{}";

    public virtual User User { get; set; } = null!;
}

[Table("BiometricDevices")]
public class BiometricDevice : TenantEntity
{
    [Required]
    [MaxLength(100)]
    public string DeviceId { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public string DeviceName { get; set; } = string.Empty;

    [MaxLength(100)]
    public string DeviceType { get; set; } = string.Empty;

    [MaxLength(100)]
    public string Manufacturer { get; set; } = string.Empty;

    [MaxLength(100)]
    public string Model { get; set; } = string.Empty;

    [MaxLength(50)]
    public string SerialNumber { get; set; } = string.Empty;

    [MaxLength(50)]
    public string FirmwareVersion { get; set; } = string.Empty;

    public List<string> SupportedBiometricTypes { get; set; } = new();

    public bool IsActive { get; set; } = true;

    public DateTime RegisteredAt { get; set; } = DateTime.UtcNow;

    public DateTime? LastSeenAt { get; set; }

    [MaxLength(45)]
    public string? IpAddress { get; set; }

    [MaxLength(200)]
    public string? Location { get; set; }

    public string Configuration { get; set; } = "{}";

    public string Metadata { get; set; } = "{}";

    [MaxLength(50)]
    public string? RegisteredBy { get; set; }
}
