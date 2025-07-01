namespace Waaed.Finance.Api.DTOs;

public class FeeCollectionScheduleDto
{
    public int Id { get; set; }
    public int FeeCategoryId { get; set; }
    public string FeeCategoryName { get; set; } = string.Empty;
    public string CollectionName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime DueDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public bool HasLateFee { get; set; }
    public string? LateFeeType { get; set; }
    public decimal? LateFeeAmount { get; set; }
    public decimal? LateFeePercentage { get; set; }
    public string? LateFeeRecurrenceType { get; set; }
    public int? LateFeeRecurrenceInterval { get; set; }
    public bool SendNotifications { get; set; }
    public bool NotifyOnStart { get; set; }
    public bool NotifyBeforeDue { get; set; }
    public int? NotifyDaysBefore { get; set; }
    public bool NotifyOnOverdue { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public int TotalStudents { get; set; }
    public int PaidStudents { get; set; }
    public int PendingStudents { get; set; }
    public int OverdueStudents { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal CollectedAmount { get; set; }
    public decimal PendingAmount { get; set; }
}

public class CreateFeeCollectionScheduleDto
{
    public int FeeCategoryId { get; set; }
    public string CollectionName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime DueDate { get; set; }
    public DateTime? EndDate { get; set; }
    public bool HasLateFee { get; set; } = false;
    public string? LateFeeType { get; set; }
    public decimal? LateFeeAmount { get; set; }
    public decimal? LateFeePercentage { get; set; }
    public string? LateFeeRecurrenceType { get; set; }
    public int? LateFeeRecurrenceInterval { get; set; }
    public bool SendNotifications { get; set; } = true;
    public bool NotifyOnStart { get; set; } = true;
    public bool NotifyBeforeDue { get; set; } = true;
    public int? NotifyDaysBefore { get; set; } = 3;
    public bool NotifyOnOverdue { get; set; } = true;
    public List<string>? TargetBatches { get; set; }
    public List<int>? TargetStudentIds { get; set; }
}

public class UpdateFeeCollectionScheduleDto
{
    public string CollectionName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime DueDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public bool HasLateFee { get; set; }
    public string? LateFeeType { get; set; }
    public decimal? LateFeeAmount { get; set; }
    public decimal? LateFeePercentage { get; set; }
    public string? LateFeeRecurrenceType { get; set; }
    public int? LateFeeRecurrenceInterval { get; set; }
    public bool SendNotifications { get; set; }
    public bool NotifyOnStart { get; set; }
    public bool NotifyBeforeDue { get; set; }
    public int? NotifyDaysBefore { get; set; }
    public bool NotifyOnOverdue { get; set; }
    public bool IsActive { get; set; }
}

public class StudentFeeAssignmentDto
{
    public int Id { get; set; }
    public int FeeCollectionScheduleId { get; set; }
    public string FeeCollectionName { get; set; } = string.Empty;
    public int StudentId { get; set; }
    public string StudentName { get; set; } = string.Empty;
    public string StudentNumber { get; set; } = string.Empty;
    public string Class { get; set; } = string.Empty;
    public string? Section { get; set; }
    public decimal BaseAmount { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal LateFeeAmount { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal PaidAmount { get; set; }
    public decimal BalanceAmount { get; set; }
    public string PaymentStatus { get; set; } = string.Empty;
    public DateTime? LastPaymentDate { get; set; }
    public DateTime? OverdueDate { get; set; }
    public bool IsWaived { get; set; }
    public string? WaiverReason { get; set; }
    public string? WaivedBy { get; set; }
    public DateTime? WaivedAt { get; set; }
    public string? Remarks { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public List<FeePaymentDto> FeePayments { get; set; } = new();
}

public class CreateStudentFeeAssignmentDto
{
    public int FeeCollectionScheduleId { get; set; }
    public int StudentId { get; set; }
    public decimal? CustomAmount { get; set; }
    public string? Remarks { get; set; }
}

public class UpdateStudentFeeAssignmentDto
{
    public decimal? CustomAmount { get; set; }
    public string PaymentStatus { get; set; } = string.Empty;
    public bool IsWaived { get; set; }
    public string? WaiverReason { get; set; }
    public string? Remarks { get; set; }
}

public class FeePaymentDto
{
    public int Id { get; set; }
    public int StudentFeeAssignmentId { get; set; }
    public int? FeeCollectionScheduleId { get; set; }
    public string ReceiptNumber { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string PaymentMethod { get; set; } = string.Empty;
    public string? TransactionReference { get; set; }
    public string? ChequeNumber { get; set; }
    public string? BankName { get; set; }
    public DateTime? ChequeDate { get; set; }
    public DateTime PaymentDate { get; set; }
    public string PaymentStatus { get; set; } = string.Empty;
    public string? Remarks { get; set; }
    public string CollectedBy { get; set; } = string.Empty;
    public bool IsAdvancePayment { get; set; }
    public bool IsRefunded { get; set; }
    public decimal? RefundAmount { get; set; }
    public DateTime? RefundDate { get; set; }
    public string? RefundReason { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateFeePaymentDto
{
    public int StudentFeeAssignmentId { get; set; }
    public decimal Amount { get; set; }
    public string PaymentMethod { get; set; } = string.Empty;
    public string? TransactionReference { get; set; }
    public string? ChequeNumber { get; set; }
    public string? BankName { get; set; }
    public DateTime? ChequeDate { get; set; }
    public DateTime PaymentDate { get; set; }
    public string? Remarks { get; set; }
    public string CollectedBy { get; set; } = string.Empty;
    public bool IsAdvancePayment { get; set; } = false;
}

public class UpdateFeePaymentDto
{
    public string PaymentStatus { get; set; } = string.Empty;
    public string? Remarks { get; set; }
    public bool IsRefunded { get; set; }
    public decimal? RefundAmount { get; set; }
    public DateTime? RefundDate { get; set; }
    public string? RefundReason { get; set; }
}
