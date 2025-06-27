using System.ComponentModel.DataAnnotations;
using AttendancePlatform.Shared.Domain.Entities;

namespace AttendancePlatform.Shared.Domain.DTOs
{
    // Additional Leave Management DTOs that don't exist in CommonDTOs
    public class ApprovalDto
    {
        [Required]
        public bool IsApproved { get; set; }
        
        [StringLength(1000)]
        public string? Comments { get; set; }
    }

    public class ApprovalHistoryDto
    {
        public Guid ApproverId { get; set; }
        public string? ApproverName { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime? ApprovalDate { get; set; }
        public string? Comments { get; set; }
        public int Level { get; set; }
    }

    public class UserLeaveBalanceDto
    {
        public Guid UserId { get; set; }
        public int Year { get; set; }
        public List<LeaveBalanceDto> LeaveBalances { get; set; } = new();
    }

    public class LeaveBalanceDto
    {
        public Guid LeaveTypeId { get; set; }
        public string LeaveTypeName { get; set; } = string.Empty;
        public int AllocatedDays { get; set; }
        public int UsedDays { get; set; }
        public int RemainingDays { get; set; }
        public int CarryForwardDays { get; set; }
        public int Year { get; set; }
    }

    public class LeaveTypeDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int MaxDaysPerYear { get; set; }
        public bool IsCarryForwardAllowed { get; set; }
        public int MaxCarryForwardDays { get; set; }
        public bool RequiresApproval { get; set; }
        public bool IsActive { get; set; }
    }

    public class LeaveCalendarDto
    {
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public List<LeaveCalendarItemDto> LeaveItems { get; set; } = new();
    }

    public class LeaveCalendarItemDto
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string? UserName { get; set; }
        public string? LeaveTypeName { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int DaysRequested { get; set; }
        public string? Reason { get; set; }
    }

    public class UpdateLeaveBalanceDto
    {
        [Required]
        public Guid LeaveTypeId { get; set; }
        
        [Required]
        [Range(2020, 2050)]
        public int Year { get; set; }
        
        [Required]
        [Range(0, 365)]
        public int AllocatedDays { get; set; }
        
        [Range(0, 365)]
        public int CarryForwardDays { get; set; }
    }

    public class LeaveReportRequestDto
    {
        [Required]
        public DateTime StartDate { get; set; }
        
        [Required]
        public DateTime EndDate { get; set; }
        
        public Guid? UserId { get; set; }
        public Guid? LeaveTypeId { get; set; }
        public LeaveRequestStatus? Status { get; set; }
    }

    public class LeaveReportDto
    {
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int TotalRequests { get; set; }
        public int TotalDaysRequested { get; set; }
        public List<LeaveReportItemDto> ReportItems { get; set; } = new();
        public DateTime GeneratedAt { get; set; }
    }

    public class LeaveReportItemDto
    {
        public Guid UserId { get; set; }
        public string? UserName { get; set; }
        public string? EmployeeId { get; set; }
        public string? LeaveTypeName { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int DaysRequested { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime RequestDate { get; set; }
        public string? Reason { get; set; }
    }
}

