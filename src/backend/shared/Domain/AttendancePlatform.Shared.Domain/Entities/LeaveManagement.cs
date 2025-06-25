using System.ComponentModel.DataAnnotations;

namespace AttendancePlatform.Shared.Domain.Entities
{
    public class LeaveRequest : TenantEntity
    {
        [Required]
        public Guid UserId { get; set; }
        
        [Required]
        public Guid LeaveTypeId { get; set; }
        
        [Required]
        public DateTime StartDate { get; set; }
        
        [Required]
        public DateTime EndDate { get; set; }
        
        [Required]
        public int TotalDays { get; set; }
        
        [MaxLength(1000)]
        public string? Reason { get; set; }
        
        public LeaveRequestStatus Status { get; set; } = LeaveRequestStatus.Pending;
        
        public DateTime RequestedAt { get; set; } = DateTime.UtcNow;
        
        public Guid? ApprovedBy { get; set; }
        
        public DateTime? ApprovedAt { get; set; }
        
        public string? ApprovalNotes { get; set; }
        
        public Guid? RejectedBy { get; set; }
        
        public DateTime? RejectedAt { get; set; }
        
        public string? RejectionReason { get; set; }
        
        public bool IsEmergency { get; set; } = false;
        
        public string? AttachmentUrls { get; set; } // JSON array of URLs
        
        public string? ContactDuringLeave { get; set; }
        
        // Navigation properties
        public virtual User User { get; set; } = null!;
        public virtual LeaveType LeaveType { get; set; } = null!;
        public virtual User? ApprovedByUser { get; set; }
        public virtual User? RejectedByUser { get; set; }
        public virtual ICollection<LeaveApproval> LeaveApprovals { get; set; } = new List<LeaveApproval>();
    }
    
    public class LeaveType : TenantEntity
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;
        
        [MaxLength(500)]
        public string? Description { get; set; }
        
        public int MaxDaysPerYear { get; set; } = 0;
        
        public int MaxConsecutiveDays { get; set; } = 0;
        
        public bool RequiresApproval { get; set; } = true;
        
        public bool RequiresDocumentation { get; set; } = false;
        
        public bool IsActive { get; set; } = true;
        
        public bool IsPaid { get; set; } = true;
        
        public int MinAdvanceNoticeDays { get; set; } = 0;
        
        public string? Color { get; set; } = "#007bff";
        
        // Navigation properties
        public virtual ICollection<LeaveRequest> LeaveRequests { get; set; } = new List<LeaveRequest>();
        public virtual ICollection<UserLeaveBalance> UserLeaveBalances { get; set; } = new List<UserLeaveBalance>();
    }
    
    public class UserLeaveBalance : TenantEntity
    {
        [Required]
        public Guid UserId { get; set; }
        
        [Required]
        public Guid LeaveTypeId { get; set; }
        
        [Required]
        public int Year { get; set; }
        
        public int AllocatedDays { get; set; } = 0;
        
        public int UsedDays { get; set; } = 0;
        
        public int RemainingDays { get; set; } = 0;
        
        public int CarriedOverDays { get; set; } = 0;
        
        // Navigation properties
        public virtual User User { get; set; } = null!;
        public virtual LeaveType LeaveType { get; set; } = null!;
    }
    
    public class PermissionRequest : TenantEntity
    {
        [Required]
        public Guid UserId { get; set; }
        
        [Required]
        public DateTime StartTime { get; set; }
        
        [Required]
        public DateTime EndTime { get; set; }
        
        [Required]
        public int DurationMinutes { get; set; }
        
        [Required]
        [MaxLength(1000)]
        public string Reason { get; set; } = string.Empty;
        
        public PermissionRequestStatus Status { get; set; } = PermissionRequestStatus.Pending;
        
        public DateTime RequestedAt { get; set; } = DateTime.UtcNow;
        
        public Guid? ApprovedBy { get; set; }
        
        public DateTime? ApprovedAt { get; set; }
        
        public string? ApprovalNotes { get; set; }
        
        public Guid? RejectedBy { get; set; }
        
        public DateTime? RejectedAt { get; set; }
        
        public string? RejectionReason { get; set; }
        
        public bool IsEmergency { get; set; } = false;
        
        // Navigation properties
        public virtual User User { get; set; } = null!;
        public virtual User? ApprovedByUser { get; set; }
        public virtual User? RejectedByUser { get; set; }
    }
    
    public class LeaveApproval : TenantEntity
    {
        [Required]
        public Guid LeaveRequestId { get; set; }
        
        [Required]
        public Guid ApproverId { get; set; }
        
        public int ApprovalLevel { get; set; } = 1;
        
        public LeaveApprovalStatus Status { get; set; } = LeaveApprovalStatus.Pending;
        
        public DateTime? ApprovedAt { get; set; }
        
        public string? Notes { get; set; }
        
        // Navigation properties
        public virtual LeaveRequest LeaveRequest { get; set; } = null!;
        public virtual User Approver { get; set; } = null!;
    }
    
    public enum LeaveRequestStatus
    {
        Pending = 1,
        Approved = 2,
        Rejected = 3,
        Cancelled = 4,
        InProgress = 5,
        Completed = 6
    }
    
    public enum PermissionRequestStatus
    {
        Pending = 1,
        Approved = 2,
        Rejected = 3,
        Cancelled = 4,
        Used = 5
    }
    
    public enum LeaveApprovalStatus
    {
        Pending = 1,
        Approved = 2,
        Rejected = 3,
        Delegated = 4
    }
}

