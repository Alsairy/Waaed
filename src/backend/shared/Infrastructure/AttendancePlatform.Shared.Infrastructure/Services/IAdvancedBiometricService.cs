using AttendancePlatform.Shared.Domain.Entities;

namespace AttendancePlatform.Shared.Infrastructure.Services;

public interface IAdvancedBiometricService
{
    Task<BiometricEnrollmentResult> EnrollBiometricAsync(BiometricEnrollmentRequest request);
    Task<BiometricVerificationResult> VerifyBiometricAsync(BiometricVerificationRequest request);
    Task<BiometricTemplate> GetBiometricTemplateAsync(string userId, string biometricType);
    Task<IEnumerable<BiometricTemplate>> GetUserBiometricTemplatesAsync(string userId);
    Task<bool> DeleteBiometricTemplateAsync(string templateId, string userId);
    Task<BiometricQualityResult> AssessBiometricQualityAsync(BiometricQualityRequest request);
    Task<BiometricLivenessResult> PerformLivenessDetectionAsync(BiometricLivenessRequest request);
    Task<BiometricMatchResult> PerformBiometricMatchAsync(BiometricMatchRequest request);
    Task<BiometricAuditLog> LogBiometricEventAsync(BiometricAuditRequest request);
    Task<IEnumerable<BiometricAuditLog>> GetBiometricAuditLogsAsync(string userId, DateTime? fromDate = null, DateTime? toDate = null);
    Task<BiometricSystemHealth> GetSystemHealthAsync();
    Task<BiometricAnalytics> GetBiometricAnalyticsAsync(string tenantId, DateTime fromDate, DateTime toDate);
    Task<BiometricConfiguration> GetBiometricConfigurationAsync(string tenantId);
    Task UpdateBiometricConfigurationAsync(string tenantId, BiometricConfiguration configuration);
    Task<BiometricBackupResult> BackupBiometricDataAsync(string userId);
    Task<BiometricRestoreResult> RestoreBiometricDataAsync(BiometricRestoreRequest request);
}

public class BiometricEnrollmentRequest
{
    public string UserId { get; set; } = string.Empty;
    public string TenantId { get; set; } = string.Empty;
    public string BiometricType { get; set; } = string.Empty;
    public byte[] BiometricData { get; set; } = Array.Empty<byte>();
    public Dictionary<string, object> Metadata { get; set; } = new();
    public string DeviceId { get; set; } = string.Empty;
    public string SessionId { get; set; } = string.Empty;
}

public class BiometricVerificationRequest
{
    public string UserId { get; set; } = string.Empty;
    public string TenantId { get; set; } = string.Empty;
    public string BiometricType { get; set; } = string.Empty;
    public byte[] BiometricData { get; set; } = Array.Empty<byte>();
    public string DeviceId { get; set; } = string.Empty;
    public string SessionId { get; set; } = string.Empty;
    public double MinimumConfidenceThreshold { get; set; } = 0.8;
}

public class BiometricQualityRequest
{
    public string BiometricType { get; set; } = string.Empty;
    public byte[] BiometricData { get; set; } = Array.Empty<byte>();
    public Dictionary<string, object> Parameters { get; set; } = new();
}

public class BiometricLivenessRequest
{
    public string BiometricType { get; set; } = string.Empty;
    public byte[] BiometricData { get; set; } = Array.Empty<byte>();
    public List<byte[]> SequenceData { get; set; } = new();
    public Dictionary<string, object> Parameters { get; set; } = new();
}

public class BiometricMatchRequest
{
    public string BiometricType { get; set; } = string.Empty;
    public byte[] Template1 { get; set; } = Array.Empty<byte>();
    public byte[] Template2 { get; set; } = Array.Empty<byte>();
    public double MinimumThreshold { get; set; } = 0.8;
}

public class BiometricAuditRequest
{
    public string UserId { get; set; } = string.Empty;
    public string TenantId { get; set; } = string.Empty;
    public string EventType { get; set; } = string.Empty;
    public string BiometricType { get; set; } = string.Empty;
    public string DeviceId { get; set; } = string.Empty;
    public string SessionId { get; set; } = string.Empty;
    public bool IsSuccessful { get; set; }
    public string? ErrorMessage { get; set; }
    public Dictionary<string, object> Metadata { get; set; } = new();
}

public class BiometricRestoreRequest
{
    public string UserId { get; set; } = string.Empty;
    public string BackupId { get; set; } = string.Empty;
    public byte[] BackupData { get; set; } = Array.Empty<byte>();
    public string VerificationCode { get; set; } = string.Empty;
}

public class BiometricEnrollmentResult
{
    public bool IsSuccess { get; set; }
    public string? ErrorMessage { get; set; }
    public string TemplateId { get; set; } = string.Empty;
    public double QualityScore { get; set; }
    public Dictionary<string, object> Metadata { get; set; } = new();
    public List<string> Warnings { get; set; } = new();
}

public class BiometricVerificationResult
{
    public bool IsSuccess { get; set; }
    public string? ErrorMessage { get; set; }
    public double ConfidenceScore { get; set; }
    public string MatchedTemplateId { get; set; } = string.Empty;
    public TimeSpan ProcessingTime { get; set; }
    public Dictionary<string, object> Metadata { get; set; } = new();
}

public class BiometricQualityResult
{
    public double QualityScore { get; set; }
    public bool IsAcceptable { get; set; }
    public List<string> QualityIssues { get; set; } = new();
    public Dictionary<string, double> QualityMetrics { get; set; } = new();
    public List<string> Recommendations { get; set; } = new();
}

public class BiometricLivenessResult
{
    public bool IsLive { get; set; }
    public double LivenessScore { get; set; }
    public List<string> LivenessChecks { get; set; } = new();
    public Dictionary<string, object> Metadata { get; set; } = new();
}

public class BiometricMatchResult
{
    public bool IsMatch { get; set; }
    public double MatchScore { get; set; }
    public TimeSpan ProcessingTime { get; set; }
    public Dictionary<string, object> Metadata { get; set; } = new();
}

public class BiometricSystemHealth
{
    public bool IsHealthy { get; set; }
    public Dictionary<string, bool> ComponentStatus { get; set; } = new();
    public Dictionary<string, double> PerformanceMetrics { get; set; } = new();
    public List<string> Issues { get; set; } = new();
    public DateTime LastChecked { get; set; }
}

public class BiometricBackupResult
{
    public bool IsSuccess { get; set; }
    public string? ErrorMessage { get; set; }
    public string BackupId { get; set; } = string.Empty;
    public DateTime BackupDate { get; set; }
    public int TemplateCount { get; set; }
}

public class BiometricRestoreResult
{
    public bool IsSuccess { get; set; }
    public string? ErrorMessage { get; set; }
    public int RestoredTemplateCount { get; set; }
    public List<string> RestoredTemplateIds { get; set; } = new();
}

public class BiometricConfiguration
{
    public string TenantId { get; set; } = string.Empty;
    public Dictionary<string, bool> EnabledBiometricTypes { get; set; } = new();
    public Dictionary<string, double> QualityThresholds { get; set; } = new();
    public Dictionary<string, double> MatchingThresholds { get; set; } = new();
    public bool LivenessDetectionEnabled { get; set; } = true;
    public int MaxEnrollmentAttempts { get; set; } = 3;
    public int MaxVerificationAttempts { get; set; } = 5;
    public TimeSpan SessionTimeout { get; set; } = TimeSpan.FromMinutes(30);
    public bool AuditLoggingEnabled { get; set; } = true;
    public Dictionary<string, object> AdvancedSettings { get; set; } = new();
}
