namespace Waaed.Finance.Api.DTOs;

public class ExpenseDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Amount { get; set; }
    public string Category { get; set; } = string.Empty;
    public string? SubCategory { get; set; }
    public DateTime ExpenseDate { get; set; }
    public string? Vendor { get; set; }
    public string? InvoiceNumber { get; set; }
    public string PaymentMethod { get; set; } = string.Empty;
    public string? PaymentReference { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? ApprovedBy { get; set; }
    public DateTime? ApprovalDate { get; set; }
    public string? PaidBy { get; set; }
    public DateTime? PaymentDate { get; set; }
    public string? Remarks { get; set; }
    public string? Department { get; set; }
    public int? BudgetId { get; set; }
    public string? BudgetName { get; set; }
    public bool IsRecurring { get; set; }
    public string? RecurrencePattern { get; set; }
    public DateTime? NextDueDate { get; set; }
    public string? AttachmentPath { get; set; }
}

public class CreateExpenseDto
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Amount { get; set; }
    public string Category { get; set; } = string.Empty;
    public string? SubCategory { get; set; }
    public DateTime ExpenseDate { get; set; }
    public string? Vendor { get; set; }
    public string? InvoiceNumber { get; set; }
    public string PaymentMethod { get; set; } = "Cash";
    public string? PaymentReference { get; set; }
    public string? Remarks { get; set; }
    public string? Department { get; set; }
    public int? BudgetId { get; set; }
    public bool IsRecurring { get; set; }
    public string? RecurrencePattern { get; set; }
    public DateTime? NextDueDate { get; set; }
}

public class UpdateExpenseDto
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Amount { get; set; }
    public string Category { get; set; } = string.Empty;
    public string? SubCategory { get; set; }
    public DateTime ExpenseDate { get; set; }
    public string? Vendor { get; set; }
    public string? InvoiceNumber { get; set; }
    public string PaymentMethod { get; set; } = string.Empty;
    public string? PaymentReference { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? Remarks { get; set; }
    public string? Department { get; set; }
    public int? BudgetId { get; set; }
    public bool IsRecurring { get; set; }
    public string? RecurrencePattern { get; set; }
    public DateTime? NextDueDate { get; set; }
}

public class ExpenseSummaryDto
{
    public decimal TotalExpenses { get; set; }
    public decimal PendingExpenses { get; set; }
    public decimal ApprovedExpenses { get; set; }
    public decimal PaidExpenses { get; set; }
    public Dictionary<string, decimal> ExpensesByCategory { get; set; } = new();
    public Dictionary<string, decimal> ExpensesByDepartment { get; set; } = new();
}
