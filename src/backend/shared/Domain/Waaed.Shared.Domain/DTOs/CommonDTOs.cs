using System.ComponentModel.DataAnnotations;
using AttendancePlatform.Shared.Domain.Entities;

namespace AttendancePlatform.Shared.Domain.DTOs
{
    public class ApiResponse<T>
    {
        public bool Success { get; set; }
        public string? Message { get; set; }
        public T? Data { get; set; }
        public IEnumerable<string>? Errors { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        
        public static ApiResponse<T> SuccessResult(T data, string? message = null)
        {
            return new ApiResponse<T>
            {
                Success = true,
                Data = data,
                Message = message
            };
        }
        
        public static ApiResponse<T> ErrorResult(string message, IEnumerable<string>? errors = null)
        {
            return new ApiResponse<T>
            {
                Success = false,
                Message = message,
                Errors = errors
            };
        }
    }
    
    public class PagedResult<T>
    {
        public IEnumerable<T> Items { get; set; } = new List<T>();
        public int TotalCount { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
        public bool HasPreviousPage => PageNumber > 1;
        public bool HasNextPage => PageNumber < TotalPages;
    }
    
    public class PagedRequest
    {
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string? SearchTerm { get; set; }
        public string? SortBy { get; set; }
        public bool SortDescending { get; set; } = false;
    }
    
    public class LoginRequest
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
        
        [Required]
        public string Password { get; set; } = string.Empty;
        
        public bool RememberMe { get; set; } = false;
        
        public string? TwoFactorCode { get; set; }
    }
    
    public class LoginResponse
    {
        public string AccessToken { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;
        public DateTime ExpiresAt { get; set; }
        public UserDto User { get; set; } = null!;
        public bool RequiresTwoFactor { get; set; } = false;
    }
    
    public class UserDto
    {
        public Guid Id { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? PhoneNumber { get; set; }
        public string? EmployeeId { get; set; }
        public string? Department { get; set; }
        public string? Position { get; set; }
        public string? ProfilePictureUrl { get; set; }
        public string Status { get; set; } = string.Empty;
        public IEnumerable<string> Roles { get; set; } = new List<string>();
        public string FullName => $"{FirstName} {LastName}";
    }

    public class CreateUserDto
    {
        [Required]
        [MaxLength(100)]
        public string FirstName { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(100)]
        public string LastName { get; set; } = string.Empty;
        
        [Required]
        [EmailAddress]
        [MaxLength(200)]
        public string Email { get; set; } = string.Empty;
        
        [Phone]
        [MaxLength(20)]
        public string? PhoneNumber { get; set; }
        
        [MaxLength(50)]
        public string? EmployeeId { get; set; }
        
        [MaxLength(100)]
        public string? Department { get; set; }
        
        [MaxLength(100)]
        public string? Position { get; set; }
        
        public DateTime? HireDate { get; set; }
        
        public string? ProfilePictureUrl { get; set; }
        
        public Guid? ManagerId { get; set; }
        
        public IEnumerable<Guid> RoleIds { get; set; } = new List<Guid>();
        
        [Required]
        [MinLength(8)]
        public string Password { get; set; } = string.Empty;
        
        public bool RequirePasswordChange { get; set; } = true;
    }

    public class UpdateUserDto
    {
        [MaxLength(100)]
        public string? FirstName { get; set; }
        
        [MaxLength(100)]
        public string? LastName { get; set; }
        
        [EmailAddress]
        [MaxLength(200)]
        public string? Email { get; set; }
        
        [Phone]
        [MaxLength(20)]
        public string? PhoneNumber { get; set; }
        
        [MaxLength(50)]
        public string? EmployeeId { get; set; }
        
        [MaxLength(100)]
        public string? Department { get; set; }
        
        [MaxLength(100)]
        public string? Position { get; set; }
        
        public DateTime? HireDate { get; set; }
        
        public string? ProfilePictureUrl { get; set; }
        
        public Guid? ManagerId { get; set; }
        
        public IEnumerable<Guid>? RoleIds { get; set; }
    }

    public class UserProfileDto
    {
        public Guid Id { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? PhoneNumber { get; set; }
        public string? EmployeeId { get; set; }
        public string? Department { get; set; }
        public string? Position { get; set; }
        public DateTime? HireDate { get; set; }
        public string? ProfilePictureUrl { get; set; }
        public string Status { get; set; } = string.Empty;
        public bool IsEmailVerified { get; set; }
        public bool IsPhoneVerified { get; set; }
        public DateTime? LastLoginAt { get; set; }
        public bool IsTwoFactorEnabled { get; set; }
        public string? ManagerName { get; set; }
        public IEnumerable<string> Roles { get; set; } = new List<string>();
        public string? NotificationPreferences { get; set; }
        public string FullName => $"{FirstName} {LastName}";
    }

    public class UpdateUserProfileDto
    {
        [MaxLength(100)]
        public string? FirstName { get; set; }
        
        [MaxLength(100)]
        public string? LastName { get; set; }
        
        [Phone]
        [MaxLength(20)]
        public string? PhoneNumber { get; set; }
        
        public string? ProfilePictureUrl { get; set; }
        
        public string? NotificationPreferences { get; set; }
        
        public bool? IsTwoFactorEnabled { get; set; }
    }
    
    public class AttendanceRecordDto
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
        public string Type { get; set; } = string.Empty;
        public string Method { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public string? LocationName { get; set; }
        public string? Address { get; set; }
        public bool IsWithinGeofence { get; set; }
        public string? BeaconId { get; set; }
        public bool IsBiometricVerified { get; set; }
        public string? PhotoUrl { get; set; }
        public bool IsOfflineRecord { get; set; }
        public bool IsApproved { get; set; }
        public string? Notes { get; set; }
    }
    
    public class CheckInRequest
    {
        public string UserId { get; set; } = string.Empty;
        public AttendanceMethod Method { get; set; }
        public LocationInfo Location { get; set; } = new();
        public string? KioskId { get; set; }
        public string? BiometricData { get; set; }
        public DateTime Timestamp { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public string? LocationName { get; set; }
        public string? Address { get; set; }
        public string? BeaconId { get; set; }
        public string? PhotoBase64 { get; set; }
        public string? DeviceId { get; set; }
        public string? DeviceType { get; set; }
        public string? Notes { get; set; }
        public bool IsOffline { get; set; } = false;
        public DateTime? OfflineTimestamp { get; set; }
    }

    public class CheckOutRequest
    {
        public string UserId { get; set; } = string.Empty;
        public AttendanceMethod Method { get; set; }
        public LocationInfo Location { get; set; } = new();
        public string? KioskId { get; set; }
        public string? BiometricData { get; set; }
        public DateTime Timestamp { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public string? LocationName { get; set; }
        public string? Address { get; set; }
        public string? BeaconId { get; set; }
        public string? PhotoBase64 { get; set; }
        public string? DeviceId { get; set; }
        public string? DeviceType { get; set; }
        public string? Notes { get; set; }
        public bool IsOffline { get; set; } = false;
        public DateTime? OfflineTimestamp { get; set; }
    }

    public class LocationInfo
    {
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public double Accuracy { get; set; }
        public DateTime Timestamp { get; set; }
    }
    
    public class LeaveRequestDto
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string LeaveTypeName { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int TotalDays { get; set; }
        public string? Reason { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime RequestedAt { get; set; }
        public string? ApprovedByName { get; set; }
        public DateTime? ApprovedAt { get; set; }
        public string? ApprovalNotes { get; set; }
        public bool IsEmergency { get; set; }
        public IEnumerable<string>? AttachmentUrls { get; set; }
    }
    
    public class CreateLeaveRequestDto
    {
        [Required]
        public Guid LeaveTypeId { get; set; }
        
        [Required]
        public DateTime StartDate { get; set; }
        
        [Required]
        public DateTime EndDate { get; set; }
        
        [MaxLength(1000)]
        public string? Reason { get; set; }
        
        public bool IsEmergency { get; set; } = false;
        
        public string? ContactDuringLeave { get; set; }
        
        public IEnumerable<string>? AttachmentUrls { get; set; }
    }
    
    public class PermissionRequestDto
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public int DurationMinutes { get; set; }
        public string Reason { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime RequestedAt { get; set; }
        public string? ApprovedByName { get; set; }
        public DateTime? ApprovedAt { get; set; }
        public bool IsEmergency { get; set; }
    }
    
    public class CreatePermissionRequestDto
    {
        [Required]
        public DateTime StartTime { get; set; }
        
        [Required]
        public DateTime EndTime { get; set; }
        
        [Required]
        [MaxLength(1000)]
        public string Reason { get; set; } = string.Empty;
        
        public bool IsEmergency { get; set; } = false;
    }

    public class BiometricTemplateDto
    {
        public Guid Id { get; set; }
        public string Type { get; set; } = string.Empty;
        public double Quality { get; set; }
        public DateTime EnrollmentDate { get; set; }
        public bool IsActive { get; set; }
        public string? DeviceId { get; set; }
        public string? DeviceType { get; set; }
    }

    public class FaceEnrollmentDto
    {
        public Guid TemplateId { get; set; }
        public double Quality { get; set; }
        public DateTime EnrollmentDate { get; set; }
        public bool IsActive { get; set; }
        public string Message { get; set; } = string.Empty;
    }

    public class FaceVerificationDto
    {
        public bool IsVerified { get; set; }
        public double Confidence { get; set; }
        public Guid TemplateId { get; set; }
        public DateTime VerificationTime { get; set; }
        public string Message { get; set; } = string.Empty;
    }

    public class FaceIdentificationDto
    {
        public bool IsIdentified { get; set; }
        public Guid? UserId { get; set; }
        public string? UserName { get; set; }
        public double Confidence { get; set; }
        public Guid? TemplateId { get; set; }
        public DateTime IdentificationTime { get; set; }
        public List<object> AllMatches { get; set; } = new();
    }

    public class ComplianceReportDto
    {
        public Guid TenantId { get; set; }
        public string Region { get; set; } = string.Empty;
        public string Language { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public DateTime GeneratedAt { get; set; }
        public int TotalEmployees { get; set; }
        public int TotalWorkingDays { get; set; }
        public double ComplianceScore { get; set; }
        public List<ComplianceViolationDto> Violations { get; set; } = new();
        public List<RegionalRequirementDto> RegionalRequirements { get; set; } = new();
        public string Summary { get; set; } = string.Empty;
        public List<string> Recommendations { get; set; } = new();
    }

    public class RegionalRequirementDto
    {
        public string Category { get; set; } = string.Empty;
        public string Requirement { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public bool Mandatory { get; set; }
        public string Region { get; set; } = string.Empty;
    }

    public class ComplianceViolationDto
    {
        public Guid Id { get; set; }
        public Guid TenantId { get; set; }
        public Guid UserId { get; set; }
        public string ViolationType { get; set; } = string.Empty;
        public string Severity { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime DetectedAt { get; set; }
        public string Status { get; set; } = string.Empty;
        public string Region { get; set; } = string.Empty;
    }

    public class ComplianceStatusDto
    {
        public Guid TenantId { get; set; }
        public string Region { get; set; } = string.Empty;
        public bool IsCompliant { get; set; }
        public double ComplianceScore { get; set; }
        public DateTime LastChecked { get; set; }
        public int ViolationCount { get; set; }
        public int CriticalViolationCount { get; set; }
        public DateTime NextReviewDate { get; set; }
        public string Status { get; set; } = string.Empty;
    }

    public class RegionalSettingsDto
    {
        public string CountryCode { get; set; } = string.Empty;
        public string TimeZone { get; set; } = string.Empty;
        public string Language { get; set; } = string.Empty;
        public string Currency { get; set; } = string.Empty;
        public string DateFormat { get; set; } = string.Empty;
        public string TimeFormat { get; set; } = string.Empty;
        public int WorkingDaysPerWeek { get; set; }
        public double StandardWorkingHours { get; set; }
        public double OvertimeThreshold { get; set; }
        public string ComplianceLevel { get; set; } = string.Empty;
    }

    public class LocalizedStringDto
    {
        public string Key { get; set; } = string.Empty;
        public string Value { get; set; } = string.Empty;
        public string Language { get; set; } = string.Empty;
        public string Module { get; set; } = string.Empty;
    }

    public class TenantDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? LogoUrl { get; set; }
        public string? PrimaryColor { get; set; }
        public string? SecondaryColor { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime? SubscriptionStartDate { get; set; }
        public DateTime? SubscriptionEndDate { get; set; }
        public int MaxUsers { get; set; }
        public string? TimeZone { get; set; }
        public string? Locale { get; set; }
        public string? Currency { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class TenantUsageDto
    {
        public Guid TenantId { get; set; }
        public int ActiveUsers { get; set; }
        public int TotalUsers { get; set; }
        public int AttendanceRecordsThisMonth { get; set; }
        public int LeaveRequestsThisMonth { get; set; }
        public DateTime? LastActivity { get; set; }
    }

    public class TenantSettingsDto
    {
        public Guid TenantId { get; set; }
        public string? LogoUrl { get; set; }
        public string? PrimaryColor { get; set; }
        public string? SecondaryColor { get; set; }
        public string? TimeZone { get; set; }
        public string? Locale { get; set; }
        public string? Currency { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class CreateTenantDto
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;
        
        [MaxLength(500)]
        public string? Description { get; set; }
        
        public string? LogoUrl { get; set; }
        public string? PrimaryColor { get; set; }
        public string? SecondaryColor { get; set; }
        
        [Required]
        public DateTime SubscriptionStartDate { get; set; }
        
        [Required]
        public DateTime SubscriptionEndDate { get; set; }
        
        [Range(1, 10000)]
        public int MaxUsers { get; set; } = 100;
        
        public string? TimeZone { get; set; }
        public string? Locale { get; set; }
        public string? Currency { get; set; }
    }

    public class UpdateTenantDto
    {
        [MaxLength(100)]
        public string? Name { get; set; }
        
        [MaxLength(500)]
        public string? Description { get; set; }
        
        public string? LogoUrl { get; set; }
        public string? PrimaryColor { get; set; }
        public string? SecondaryColor { get; set; }
        public DateTime? SubscriptionStartDate { get; set; }
        public DateTime? SubscriptionEndDate { get; set; }
        
        [Range(1, 10000)]
        public int? MaxUsers { get; set; }
        
        public string? TimeZone { get; set; }
        public string? Locale { get; set; }
        public string? Currency { get; set; }
    }

    public class WorkflowMetricsDto
    {
        public int TotalWorkflows { get; set; }
        public int CompletedWorkflows { get; set; }
        public int RejectedWorkflows { get; set; }
        public int CancelledWorkflows { get; set; }
        public int ActiveWorkflows { get; set; }
        public double AverageCompletionTime { get; set; }
        public Dictionary<string, int> WorkflowsByType { get; set; } = new();
        public double CompletionRate { get; set; }
    }

    public class WorkflowExecutionLogDto
    {
        public Guid Id { get; set; }
        public Guid WorkflowInstanceId { get; set; }
        public Guid StepId { get; set; }
        public string Action { get; set; } = string.Empty;
        public Guid ExecutedBy { get; set; }
        public DateTime ExecutedAt { get; set; }
        public string? Comments { get; set; }
        public Dictionary<string, object>? OutputData { get; set; }
    }

    public class WorkflowInstanceDto
    {
        public Guid Id { get; set; }
        public Guid TenantId { get; set; }
        public Guid WorkflowTemplateId { get; set; }
        public string WorkflowType { get; set; } = string.Empty;
        public Guid EntityId { get; set; }
        public string EntityType { get; set; } = string.Empty;
        public Guid InitiatedBy { get; set; }
        public string Status { get; set; } = string.Empty;
        public string Priority { get; set; } = string.Empty;
        public string InputData { get; set; } = string.Empty;
        public int CurrentStepIndex { get; set; }
        public int CurrentStep { get; set; }
        public string CurrentStepName { get; set; } = string.Empty;
        public Dictionary<string, object> Context { get; set; } = new();
        public DateTime StartedAt { get; set; }
        public DateTime LastUpdatedAt { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public DateTime? ResumeAt { get; set; }
        public string InitiatedByName { get; set; } = string.Empty;
        public string WorkflowTemplateName { get; set; } = string.Empty;
        public int TotalSteps { get; set; }
        public List<WorkflowStepDto> Steps { get; set; } = new();
    }

    public class WorkflowTemplateDto
    {
        public Guid Id { get; set; }
        public Guid TenantId { get; set; }
        public string WorkflowType { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string StepDefinitions { get; set; } = string.Empty;
        public int StepCount { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class WorkflowStepDto
    {
        public Guid Id { get; set; }
        public Guid WorkflowInstanceId { get; set; }
        public string StepName { get; set; } = string.Empty;
        public string StepType { get; set; } = string.Empty;
        public int StepIndex { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? AssignedTo { get; set; }
        public DateTime? DueDate { get; set; }
        public DateTime? StartedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public Guid? CompletedBy { get; set; }
        public string? Comments { get; set; }
        public string? InputData { get; set; }
        public string? OutputData { get; set; }
        public int? RetryCount { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}

