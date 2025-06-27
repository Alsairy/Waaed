namespace AttendancePlatform.Library.Api.DTOs;

public class FineDto
{
    public int Id { get; set; }
    public int MemberId { get; set; }
    public string MemberName { get; set; } = string.Empty;
    public string MembershipId { get; set; } = string.Empty;
    public int? BookIssueId { get; set; }
    public string? BookTitle { get; set; }
    public string FineType { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string? Description { get; set; }
    public DateTime FineDate { get; set; }
    public DateTime? PaidDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? PaymentMethod { get; set; }
    public string? TransactionId { get; set; }
    public int DaysOverdue { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateFineDto
{
    public int MemberId { get; set; }
    public int? BookIssueId { get; set; }
    public string FineType { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string? Description { get; set; }
}

public class PayFineDto
{
    public string PaymentMethod { get; set; } = string.Empty;
    public string? TransactionId { get; set; }
    public decimal? AmountPaid { get; set; }
}

public class FineSummaryDto
{
    public int TotalFines { get; set; }
    public int PendingFines { get; set; }
    public int PaidFines { get; set; }
    public int WaivedFines { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal PendingAmount { get; set; }
    public decimal PaidAmount { get; set; }
    public decimal WaivedAmount { get; set; }
    public Dictionary<string, int> FinesByType { get; set; } = new();
    public Dictionary<string, decimal> AmountByType { get; set; } = new();
}
