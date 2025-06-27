namespace AttendancePlatform.Finance.Api.DTOs;

public class FeeCollectionDto
{
    public int Id { get; set; }
    public string ReceiptNumber { get; set; } = string.Empty;
    public int StudentId { get; set; }
    public string StudentName { get; set; } = string.Empty;
    public string StudentClass { get; set; } = string.Empty;
    public int FeeStructureId { get; set; }
    public string FeeStructureName { get; set; } = string.Empty;
    public decimal AmountDue { get; set; }
    public decimal AmountPaid { get; set; }
    public decimal? Discount { get; set; }
    public decimal? LateFee { get; set; }
    public decimal Balance { get; set; }
    public DateTime DueDate { get; set; }
    public DateTime? PaymentDate { get; set; }
    public string PaymentStatus { get; set; } = string.Empty;
    public string? PaymentMethod { get; set; }
    public string? TransactionReference { get; set; }
    public string? Remarks { get; set; }
    public string FeeType { get; set; } = string.Empty;
    public DateTime ForMonth { get; set; }
    public DateTime AcademicYear { get; set; }
    public string? CollectedBy { get; set; }
}

public class CreateFeeCollectionDto
{
    public int StudentId { get; set; }
    public int FeeStructureId { get; set; }
    public decimal AmountDue { get; set; }
    public decimal AmountPaid { get; set; }
    public decimal? Discount { get; set; }
    public decimal? LateFee { get; set; }
    public DateTime DueDate { get; set; }
    public DateTime? PaymentDate { get; set; }
    public string? PaymentMethod { get; set; }
    public string? TransactionReference { get; set; }
    public string? Remarks { get; set; }
    public string FeeType { get; set; } = string.Empty;
    public DateTime ForMonth { get; set; }
    public DateTime AcademicYear { get; set; }
    public string? CollectedBy { get; set; }
}

public class UpdateFeeCollectionDto
{
    public decimal AmountPaid { get; set; }
    public decimal? Discount { get; set; }
    public decimal? LateFee { get; set; }
    public DateTime? PaymentDate { get; set; }
    public string PaymentStatus { get; set; } = string.Empty;
    public string? PaymentMethod { get; set; }
    public string? TransactionReference { get; set; }
    public string? Remarks { get; set; }
    public string? CollectedBy { get; set; }
}

public class FeeCollectionSummaryDto
{
    public decimal TotalDue { get; set; }
    public decimal TotalPaid { get; set; }
    public decimal TotalPending { get; set; }
    public decimal TotalOverdue { get; set; }
    public int TotalStudents { get; set; }
    public int PaidStudents { get; set; }
    public int PendingStudents { get; set; }
    public int OverdueStudents { get; set; }
}
