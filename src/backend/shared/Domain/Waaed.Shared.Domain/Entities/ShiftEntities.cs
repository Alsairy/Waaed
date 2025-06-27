using AttendancePlatform.Shared.Domain.Interfaces;
using System.ComponentModel.DataAnnotations;

namespace AttendancePlatform.Shared.Domain.Entities
{
    public class Shift : BaseEntity, ITenantAware
    {
        public Guid TenantId { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;
        
        [MaxLength(500)]
        public string Description { get; set; } = string.Empty;
        
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public TimeSpan? BreakDuration { get; set; }
        
        public DayOfWeek[] WorkingDays { get; set; } = Array.Empty<DayOfWeek>();
        
        public ShiftType Type { get; set; } = ShiftType.Regular;
        public ShiftStatus Status { get; set; } = ShiftStatus.Active;
        
        public int MaxEmployees { get; set; } = 1;
        public int MinEmployees { get; set; } = 1;
        
        public string? Department { get; set; }
        public string? Location { get; set; }
        
        public decimal? HourlyRate { get; set; }
        public decimal? OvertimeMultiplier { get; set; } = 1.5m;
        
        public bool AllowOvertime { get; set; } = false;
        public bool RequiresApproval { get; set; } = false;
        
        public DateTime EffectiveFrom { get; set; }
        public DateTime? EffectiveTo { get; set; }
        
        public virtual ICollection<ShiftAssignment> Assignments { get; set; } = new List<ShiftAssignment>();
        public virtual ICollection<ShiftSwapRequest> SwapRequests { get; set; } = new List<ShiftSwapRequest>();
        public virtual ShiftTemplate? Template { get; set; }
        public Guid? TemplateId { get; set; }
    }

    public class ShiftTemplate : BaseEntity, ITenantAware
    {
        public Guid TenantId { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;
        
        [MaxLength(500)]
        public string Description { get; set; } = string.Empty;
        
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public TimeSpan? BreakDuration { get; set; }
        
        public DayOfWeek[] WorkingDays { get; set; } = Array.Empty<DayOfWeek>();
        
        public ShiftType Type { get; set; } = ShiftType.Regular;
        
        public int MaxEmployees { get; set; } = 1;
        public int MinEmployees { get; set; } = 1;
        
        public string? Department { get; set; }
        public string? Location { get; set; }
        
        public decimal? HourlyRate { get; set; }
        public decimal? OvertimeMultiplier { get; set; } = 1.5m;
        
        public bool AllowOvertime { get; set; } = false;
        public bool RequiresApproval { get; set; } = false;
        
        public bool IsActive { get; set; } = true;
        
        public virtual ICollection<Shift> Shifts { get; set; } = new List<Shift>();
    }

    public class ShiftAssignment : BaseEntity, ITenantAware
    {
        public Guid TenantId { get; set; }
        
        [Required]
        public Guid ShiftId { get; set; }
        
        [Required]
        public Guid UserId { get; set; }
        
        public DateTime ScheduledDate { get; set; }
        public DateTime? ActualStartTime { get; set; }
        public DateTime? ActualEndTime { get; set; }
        
        public ShiftAssignmentStatus Status { get; set; } = ShiftAssignmentStatus.Scheduled;
        
        public string? Notes { get; set; }
        public Guid? AssignedBy { get; set; }
        
        public bool IsRecurring { get; set; } = false;
        public RecurrencePattern? RecurrencePattern { get; set; }
        
        public virtual Shift Shift { get; set; } = null!;
        public virtual User User { get; set; } = null!;
        public virtual User? AssignedByUser { get; set; }
        public virtual ICollection<ShiftSwapRequest> SwapRequests { get; set; } = new List<ShiftSwapRequest>();
    }

    public class ShiftSwapRequest : BaseEntity, ITenantAware
    {
        public Guid TenantId { get; set; }
        
        [Required]
        public Guid RequesterId { get; set; }
        
        [Required]
        public Guid OriginalAssignmentId { get; set; }
        
        public Guid? TargetUserId { get; set; }
        public Guid? TargetAssignmentId { get; set; }
        
        [MaxLength(1000)]
        public string Reason { get; set; } = string.Empty;
        
        public SwapRequestStatus Status { get; set; } = SwapRequestStatus.Pending;
        
        public DateTime RequestedDate { get; set; }
        public DateTime? ResponseDate { get; set; }
        public DateTime? ApprovalDate { get; set; }
        
        public string? ResponseNotes { get; set; }
        public string? ApprovalNotes { get; set; }
        
        public Guid? RespondedBy { get; set; }
        public Guid? ApprovedBy { get; set; }
        
        public SwapType Type { get; set; } = SwapType.DirectSwap;
        
        public virtual User Requester { get; set; } = null!;
        public virtual ShiftAssignment OriginalAssignment { get; set; } = null!;
        public virtual User? TargetUser { get; set; }
        public virtual ShiftAssignment? TargetAssignment { get; set; }
        public virtual User? RespondedByUser { get; set; }
        public virtual User? ApprovedByUser { get; set; }
    }

    public class ShiftConflict : BaseEntity, ITenantAware
    {
        public Guid TenantId { get; set; }
        
        [Required]
        public Guid UserId { get; set; }
        
        [Required]
        public Guid AssignmentId { get; set; }
        
        public ConflictType Type { get; set; }
        
        [MaxLength(500)]
        public string Description { get; set; } = string.Empty;
        
        public ConflictSeverity Severity { get; set; } = ConflictSeverity.Medium;
        public ConflictStatus Status { get; set; } = ConflictStatus.Open;
        
        public DateTime DetectedAt { get; set; }
        public DateTime? ResolvedAt { get; set; }
        
        public Guid? ResolvedBy { get; set; }
        public string? ResolutionNotes { get; set; }
        
        public virtual User User { get; set; } = null!;
        public virtual ShiftAssignment Assignment { get; set; } = null!;
        public virtual User? ResolvedByUser { get; set; }
    }

    public enum ShiftType
    {
        Regular = 1,
        Overtime = 2,
        Night = 3,
        Weekend = 4,
        Holiday = 5,
        OnCall = 6,
        Split = 7
    }

    public enum ShiftStatus
    {
        Active = 1,
        Inactive = 2,
        Archived = 3,
        Draft = 4
    }

    public enum ShiftAssignmentStatus
    {
        Scheduled = 1,
        InProgress = 2,
        Completed = 3,
        Cancelled = 4,
        NoShow = 5,
        Late = 6,
        EarlyDeparture = 7
    }

    public enum SwapRequestStatus
    {
        Pending = 1,
        Accepted = 2,
        Rejected = 3,
        Cancelled = 4,
        Approved = 5,
        Denied = 6,
        Expired = 7
    }

    public enum SwapType
    {
        DirectSwap = 1,
        PickupShift = 2,
        DropShift = 3,
        PartialSwap = 4
    }

    public enum ConflictType
    {
        OverlappingShifts = 1,
        InsufficientRestTime = 2,
        MaxHoursExceeded = 3,
        SkillMismatch = 4,
        LocationConflict = 5,
        LeaveConflict = 6,
        AvailabilityConflict = 7
    }

    public enum ConflictSeverity
    {
        Low = 1,
        Medium = 2,
        High = 3,
        Critical = 4
    }

    public enum ConflictStatus
    {
        Open = 1,
        Resolved = 2,
        Ignored = 3,
        Escalated = 4
    }

    public enum RecurrencePattern
    {
        None = 0,
        Daily = 1,
        Weekly = 2,
        BiWeekly = 3,
        Monthly = 4,
        Custom = 5
    }
}
