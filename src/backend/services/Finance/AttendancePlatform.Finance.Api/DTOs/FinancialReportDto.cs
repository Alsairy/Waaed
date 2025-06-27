namespace AttendancePlatform.Finance.Api.DTOs;

public class FinancialReportDto
{
    public int Id { get; set; }
    public string ReportName { get; set; } = string.Empty;
    public string ReportType { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public DateTime GeneratedDate { get; set; }
    public string GeneratedBy { get; set; } = string.Empty;
    public decimal? TotalIncome { get; set; }
    public decimal? TotalExpenses { get; set; }
    public decimal? NetProfit { get; set; }
    public decimal? FeeCollected { get; set; }
    public decimal? FeePending { get; set; }
    public decimal? SalaryPaid { get; set; }
    public decimal? OperationalExpenses { get; set; }
    public string? FilePath { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? ReviewedBy { get; set; }
    public DateTime? ReviewDate { get; set; }
    public string? Comments { get; set; }
}

public class CreateFinancialReportDto
{
    public string ReportName { get; set; } = string.Empty;
    public string ReportType { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
}

public class UpdateFinancialReportDto
{
    public string ReportName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? Comments { get; set; }
}

public class FinancialDashboardDto
{
    public decimal TotalRevenue { get; set; }
    public decimal TotalExpenses { get; set; }
    public decimal NetIncome { get; set; }
    public decimal FeeCollectionRate { get; set; }
    public decimal MonthlyRevenue { get; set; }
    public decimal MonthlyExpenses { get; set; }
    public decimal YearlyRevenue { get; set; }
    public decimal YearlyExpenses { get; set; }
    public List<MonthlyFinancialSummary> MonthlyTrends { get; set; } = new();
    public Dictionary<string, decimal> RevenueBySource { get; set; } = new();
    public Dictionary<string, decimal> ExpensesByCategory { get; set; } = new();
}

public class MonthlyFinancialSummary
{
    public DateTime Month { get; set; }
    public decimal Revenue { get; set; }
    public decimal Expenses { get; set; }
    public decimal NetIncome { get; set; }
    public decimal FeeCollection { get; set; }
}
