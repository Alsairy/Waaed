namespace AttendancePlatform.Finance.Api.DTOs;

public class BudgetDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Category { get; set; } = string.Empty;
    public string? Department { get; set; }
    public decimal AllocatedAmount { get; set; }
    public decimal SpentAmount { get; set; }
    public decimal RemainingAmount { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public DateTime AcademicYear { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? CreatedBy { get; set; }
    public string? ApprovedBy { get; set; }
    public DateTime? ApprovalDate { get; set; }
    public string? Remarks { get; set; }
    public bool IsActive { get; set; }
    public List<ExpenseDto> Expenses { get; set; } = new();
}

public class CreateBudgetDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Category { get; set; } = string.Empty;
    public string? Department { get; set; }
    public decimal AllocatedAmount { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public DateTime AcademicYear { get; set; }
    public string? Remarks { get; set; }
}

public class UpdateBudgetDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Category { get; set; } = string.Empty;
    public string? Department { get; set; }
    public decimal AllocatedAmount { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? Remarks { get; set; }
    public bool IsActive { get; set; }
}

public class BudgetSummaryDto
{
    public decimal TotalAllocated { get; set; }
    public decimal TotalSpent { get; set; }
    public decimal TotalRemaining { get; set; }
    public int ActiveBudgets { get; set; }
    public int CompletedBudgets { get; set; }
    public Dictionary<string, decimal> BudgetsByCategory { get; set; } = new();
    public Dictionary<string, decimal> BudgetsByDepartment { get; set; } = new();
}
