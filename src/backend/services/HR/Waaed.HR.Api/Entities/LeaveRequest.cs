using System.ComponentModel.DataAnnotations;

namespace Waaed.HR.Api.Entities;

public class LeaveRequest
{
    public int Id { get; set; }
    
    public int EmployeeId { get; set; }
    public Employee Employee { get; set; } = null!;
    
    [Required]
    [MaxLength(20)]
    public string LeaveType { get; set; } = string.Empty;
    
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    
    public int TotalDays { get; set; }
    
    [MaxLength(1000)]
    public string? Reason { get; set; }
    
    [Required]
    [MaxLength(20)]
    public string Status { get; set; } = "Pending";
    
    public DateTime RequestDate { get; set; }
    
    public int? ApprovedById { get; set; }
    public Employee? ApprovedBy { get; set; }
    
    public DateTime? ApprovalDate { get; set; }
    
    [MaxLength(500)]
    public string? ApprovalComments { get; set; }
    
    [MaxLength(500)]
    public string? RejectionReason { get; set; }
    
    [MaxLength(500)]
    public string? AttachmentPath { get; set; }
    
    public bool IsEmergency { get; set; }
    
    [MaxLength(15)]
    public string? ContactDuringLeave { get; set; }
    
    [MaxLength(500)]
    public string? HandoverNotes { get; set; }
    
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
