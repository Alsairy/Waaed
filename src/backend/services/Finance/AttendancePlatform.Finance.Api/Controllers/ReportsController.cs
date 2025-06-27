using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutoMapper;
using AttendancePlatform.Finance.Api.Data;
using AttendancePlatform.Finance.Api.Entities;
using AttendancePlatform.Finance.Api.DTOs;

namespace AttendancePlatform.Finance.Api.Controllers;

[ApiController]
[Route("api/finance/[controller]")]
public class ReportsController : ControllerBase
{
    private readonly FinanceDbContext _context;
    private readonly IMapper _mapper;
    private readonly ILogger<ReportsController> _logger;

    public ReportsController(FinanceDbContext context, IMapper mapper, ILogger<ReportsController> logger)
    {
        _context = context;
        _mapper = mapper;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<FinancialReportDto>>> GetFinancialReports(
        [FromQuery] string? reportType = null,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        [FromQuery] string? status = null)
    {
        try
        {
            var query = _context.FinancialReports.AsQueryable();

            if (!string.IsNullOrEmpty(reportType))
            {
                query = query.Where(r => r.ReportType == reportType);
            }

            if (fromDate.HasValue)
            {
                query = query.Where(r => r.StartDate >= fromDate.Value);
            }

            if (toDate.HasValue)
            {
                query = query.Where(r => r.EndDate <= toDate.Value);
            }

            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(r => r.Status == status);
            }

            var reports = await query
                .OrderByDescending(r => r.GeneratedDate)
                .ToListAsync();

            var reportDtos = _mapper.Map<IEnumerable<FinancialReportDto>>(reports);
            return Ok(reportDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving financial reports");
            return StatusCode(500, "An error occurred while retrieving financial reports");
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<FinancialReportDto>> GetFinancialReport(int id)
    {
        try
        {
            var report = await _context.FinancialReports.FindAsync(id);
            if (report == null)
            {
                return NotFound($"Financial report with ID {id} not found");
            }

            var reportDto = _mapper.Map<FinancialReportDto>(report);
            return Ok(reportDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving financial report {Id}", id);
            return StatusCode(500, "An error occurred while retrieving the financial report");
        }
    }

    [HttpPost]
    public async Task<ActionResult<FinancialReportDto>> CreateFinancialReport(CreateFinancialReportDto createDto)
    {
        try
        {
            var report = _mapper.Map<FinancialReport>(createDto);
            report.GeneratedDate = DateTime.UtcNow;
            report.CreatedAt = DateTime.UtcNow;
            report.UpdatedAt = DateTime.UtcNow;

            await GenerateReportData(report);

            _context.FinancialReports.Add(report);
            await _context.SaveChangesAsync();

            var reportDto = _mapper.Map<FinancialReportDto>(report);
            return CreatedAtAction(nameof(GetFinancialReport), new { id = report.Id }, reportDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating financial report");
            return StatusCode(500, "An error occurred while creating the financial report");
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateFinancialReport(int id, UpdateFinancialReportDto updateDto)
    {
        try
        {
            var report = await _context.FinancialReports.FindAsync(id);
            if (report == null)
            {
                return NotFound($"Financial report with ID {id} not found");
            }

            _mapper.Map(updateDto, report);
            report.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating financial report {Id}", id);
            return StatusCode(500, "An error occurred while updating the financial report");
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteFinancialReport(int id)
    {
        try
        {
            var report = await _context.FinancialReports.FindAsync(id);
            if (report == null)
            {
                return NotFound($"Financial report with ID {id} not found");
            }

            _context.FinancialReports.Remove(report);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting financial report {Id}", id);
            return StatusCode(500, "An error occurred while deleting the financial report");
        }
    }

    [HttpGet("dashboard")]
    public async Task<ActionResult<FinancialDashboardDto>> GetFinancialDashboard(
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        try
        {
            var start = startDate ?? DateTime.UtcNow.AddMonths(-12);
            var end = endDate ?? DateTime.UtcNow;

            var totalRevenue = await _context.FeeCollections
                .Where(fc => fc.PaymentDate >= start && fc.PaymentDate <= end)
                .SumAsync(fc => fc.AmountPaid);

            var totalExpenses = await _context.Expenses
                .Where(e => e.ExpenseDate >= start && e.ExpenseDate <= end && e.Status == "Paid")
                .SumAsync(e => e.Amount);

            var netIncome = totalRevenue - totalExpenses;

            var totalFeeDue = await _context.FeeCollections
                .Where(fc => fc.DueDate >= start && fc.DueDate <= end)
                .SumAsync(fc => fc.AmountDue);

            var feeCollectionRate = totalFeeDue > 0 ? (totalRevenue / totalFeeDue) * 100 : 0;

            var currentMonth = DateTime.UtcNow.Date.AddDays(1 - DateTime.UtcNow.Day);
            var monthlyRevenue = await _context.FeeCollections
                .Where(fc => fc.PaymentDate >= currentMonth)
                .SumAsync(fc => fc.AmountPaid);

            var monthlyExpenses = await _context.Expenses
                .Where(e => e.ExpenseDate >= currentMonth && e.Status == "Paid")
                .SumAsync(e => e.Amount);

            var currentYear = new DateTime(DateTime.UtcNow.Year, 1, 1);
            var yearlyRevenue = await _context.FeeCollections
                .Where(fc => fc.PaymentDate >= currentYear)
                .SumAsync(fc => fc.AmountPaid);

            var yearlyExpenses = await _context.Expenses
                .Where(e => e.ExpenseDate >= currentYear && e.Status == "Paid")
                .SumAsync(e => e.Amount);

            var monthlyTrends = await GetMonthlyTrends(start, end);

            var revenueBySource = new Dictionary<string, decimal>
            {
                ["Fee Collections"] = totalRevenue,
                ["Other Income"] = 0
            };

            var expensesByCategory = await _context.Expenses
                .Where(e => e.ExpenseDate >= start && e.ExpenseDate <= end && e.Status == "Paid")
                .GroupBy(e => e.Category)
                .Select(g => new { Category = g.Key, Total = g.Sum(e => e.Amount) })
                .ToDictionaryAsync(x => x.Category, x => x.Total);

            var dashboard = new FinancialDashboardDto
            {
                TotalRevenue = totalRevenue,
                TotalExpenses = totalExpenses,
                NetIncome = netIncome,
                FeeCollectionRate = feeCollectionRate,
                MonthlyRevenue = monthlyRevenue,
                MonthlyExpenses = monthlyExpenses,
                YearlyRevenue = yearlyRevenue,
                YearlyExpenses = yearlyExpenses,
                MonthlyTrends = monthlyTrends,
                RevenueBySource = revenueBySource,
                ExpensesByCategory = expensesByCategory
            };

            return Ok(dashboard);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving financial dashboard");
            return StatusCode(500, "An error occurred while retrieving the financial dashboard");
        }
    }

    [HttpPost("{id}/review")]
    public async Task<IActionResult> ReviewFinancialReport(int id, [FromBody] ReviewReportRequest request)
    {
        try
        {
            var report = await _context.FinancialReports.FindAsync(id);
            if (report == null)
            {
                return NotFound($"Financial report with ID {id} not found");
            }

            report.Status = "Reviewed";
            report.ReviewedBy = request.ReviewedBy;
            report.ReviewDate = DateTime.UtcNow;
            report.Comments = request.Comments;
            report.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error reviewing financial report {Id}", id);
            return StatusCode(500, "An error occurred while reviewing the financial report");
        }
    }

    [HttpGet("types")]
    public ActionResult<IEnumerable<string>> GetReportTypes()
    {
        var reportTypes = new[]
        {
            "Income Statement",
            "Balance Sheet",
            "Cash Flow",
            "Fee Collection",
            "Expense Report",
            "Payroll Report",
            "Budget Report"
        };

        return Ok(reportTypes);
    }

    private async Task GenerateReportData(FinancialReport report)
    {
        switch (report.ReportType)
        {
            case "Fee Collection":
                await GenerateFeeCollectionData(report);
                break;
            case "Expense Report":
                await GenerateExpenseData(report);
                break;
            case "Income Statement":
                await GenerateIncomeStatementData(report);
                break;
            case "Payroll Report":
                await GeneratePayrollData(report);
                break;
            default:
                await GenerateGeneralFinancialData(report);
                break;
        }
    }

    private async Task GenerateFeeCollectionData(FinancialReport report)
    {
        var feeCollected = await _context.FeeCollections
            .Where(fc => fc.PaymentDate >= report.StartDate && fc.PaymentDate <= report.EndDate)
            .SumAsync(fc => fc.AmountPaid);

        var feePending = await _context.FeeCollections
            .Where(fc => fc.DueDate >= report.StartDate && fc.DueDate <= report.EndDate && fc.PaymentStatus != "Paid")
            .SumAsync(fc => fc.AmountDue - fc.AmountPaid);

        report.FeeCollected = feeCollected;
        report.FeePending = feePending;
        report.TotalIncome = feeCollected;
    }

    private async Task GenerateExpenseData(FinancialReport report)
    {
        var totalExpenses = await _context.Expenses
            .Where(e => e.ExpenseDate >= report.StartDate && e.ExpenseDate <= report.EndDate && e.Status == "Paid")
            .SumAsync(e => e.Amount);

        var operationalExpenses = await _context.Expenses
            .Where(e => e.ExpenseDate >= report.StartDate && e.ExpenseDate <= report.EndDate && 
                       e.Status == "Paid" && e.Category != "Salary")
            .SumAsync(e => e.Amount);

        report.TotalExpenses = totalExpenses;
        report.OperationalExpenses = operationalExpenses;
    }

    private async Task GenerateIncomeStatementData(FinancialReport report)
    {
        await GenerateFeeCollectionData(report);
        await GenerateExpenseData(report);

        report.NetProfit = (report.TotalIncome ?? 0) - (report.TotalExpenses ?? 0);
    }

    private async Task GeneratePayrollData(FinancialReport report)
    {
        var salaryPaid = await _context.PayrollEntries
            .Where(p => p.PaymentDate >= report.StartDate && p.PaymentDate <= report.EndDate && p.Status == "Paid")
            .SumAsync(p => p.NetSalary);

        report.SalaryPaid = salaryPaid;
        report.TotalExpenses = salaryPaid;
    }

    private async Task GenerateGeneralFinancialData(FinancialReport report)
    {
        await GenerateFeeCollectionData(report);
        await GenerateExpenseData(report);
        await GeneratePayrollData(report);

        report.NetProfit = (report.TotalIncome ?? 0) - (report.TotalExpenses ?? 0);
    }

    private async Task<List<MonthlyFinancialSummary>> GetMonthlyTrends(DateTime startDate, DateTime endDate)
    {
        var trends = new List<MonthlyFinancialSummary>();
        var current = new DateTime(startDate.Year, startDate.Month, 1);

        while (current <= endDate)
        {
            var nextMonth = current.AddMonths(1);

            var revenue = await _context.FeeCollections
                .Where(fc => fc.PaymentDate >= current && fc.PaymentDate < nextMonth)
                .SumAsync(fc => fc.AmountPaid);

            var expenses = await _context.Expenses
                .Where(e => e.ExpenseDate >= current && e.ExpenseDate < nextMonth && e.Status == "Paid")
                .SumAsync(e => e.Amount);

            var feeCollection = await _context.FeeCollections
                .Where(fc => fc.PaymentDate >= current && fc.PaymentDate < nextMonth)
                .SumAsync(fc => fc.AmountPaid);

            trends.Add(new MonthlyFinancialSummary
            {
                Month = current,
                Revenue = revenue,
                Expenses = expenses,
                NetIncome = revenue - expenses,
                FeeCollection = feeCollection
            });

            current = nextMonth;
        }

        return trends;
    }
}

public class ReviewReportRequest
{
    public string ReviewedBy { get; set; } = string.Empty;
    public string? Comments { get; set; }
}
