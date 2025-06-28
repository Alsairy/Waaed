namespace Waaed.HR.Api.DTOs;

public class LeaveRequestDto
{
    public int Id { get; set; }
    public int EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public string LeaveType { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public int TotalDays { get; set; }
    public string? Reason { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime RequestDate { get; set; }
    public int? ApprovedById { get; set; }
    public string? ApprovedByName { get; set; }
    public DateTime? ApprovalDate { get; set; }
    public string? ApprovalComments { get; set; }
    public string? RejectionReason { get; set; }
    public string? AttachmentPath { get; set; }
    public bool IsEmergency { get; set; }
    public string? ContactDuringLeave { get; set; }
    public string? HandoverNotes { get; set; }
}

public class CreateLeaveRequestDto
{
    public int EmployeeId { get; set; }
    public string LeaveType { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string? Reason { get; set; }
    public bool IsEmergency { get; set; }
    public string? ContactDuringLeave { get; set; }
    public string? HandoverNotes { get; set; }
}

public class UpdateLeaveRequestDto
{
    public string LeaveType { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string? Reason { get; set; }
    public bool IsEmergency { get; set; }
    public string? ContactDuringLeave { get; set; }
    public string? HandoverNotes { get; set; }
}

public class ApproveLeaveRequestDto
{
    public int ApprovedById { get; set; }
    public string? ApprovalComments { get; set; }
}

public class RejectLeaveRequestDto
{
    public int ApprovedById { get; set; }
    public string RejectionReason { get; set; } = string.Empty;
}

public class LeaveBalanceDto
{
    public int EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public string LeaveType { get; set; } = string.Empty;
    public int TotalEntitlement { get; set; }
    public int UsedDays { get; set; }
    public int RemainingDays { get; set; }
    public int PendingDays { get; set; }
}

public class LeaveSummaryDto
{
    public int TotalRequests { get; set; }
    public int PendingRequests { get; set; }
    public int ApprovedRequests { get; set; }
    public int RejectedRequests { get; set; }
    public Dictionary<string, int> RequestsByType { get; set; } = new();
    public Dictionary<string, int> RequestsByDepartment { get; set; } = new();
}
