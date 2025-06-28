using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutoMapper;
using Waaed.Finance.Api.Data;
using Waaed.Finance.Api.Entities;
using Waaed.Finance.Api.DTOs;

namespace Waaed.Finance.Api.Controllers;

[ApiController]
[Route("api/finance/[controller]")]
public class ExpensesController : ControllerBase
{
    private readonly FinanceDbContext _context;
    private readonly IMapper _mapper;
    private readonly ILogger<ExpensesController> _logger;

    public ExpensesController(FinanceDbContext context, IMapper mapper, ILogger<ExpensesController> logger)
    {
        _context = context;
        _mapper = mapper;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ExpenseDto>>> GetExpenses(
        [FromQuery] string? category = null,
        [FromQuery] string? status = null,
        [FromQuery] string? department = null,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null)
    {
        try
        {
            var query = _context.Expenses
                .Include(e => e.Budget)
                .AsQueryable();

            if (!string.IsNullOrEmpty(category))
            {
                query = query.Where(e => e.Category == category);
            }

            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(e => e.Status == status);
            }

            if (!string.IsNullOrEmpty(department))
            {
                query = query.Where(e => e.Department == department);
            }

            if (fromDate.HasValue)
            {
                query = query.Where(e => e.ExpenseDate >= fromDate.Value);
            }

            if (toDate.HasValue)
            {
                query = query.Where(e => e.ExpenseDate <= toDate.Value);
            }

            var expenses = await query
                .OrderByDescending(e => e.ExpenseDate)
                .ToListAsync();

            var expenseDtos = _mapper.Map<IEnumerable<ExpenseDto>>(expenses);
            return Ok(expenseDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving expenses");
            return StatusCode(500, "An error occurred while retrieving expenses");
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ExpenseDto>> GetExpense(int id)
    {
        try
        {
            var expense = await _context.Expenses
                .Include(e => e.Budget)
                .FirstOrDefaultAsync(e => e.Id == id);

            if (expense == null)
            {
                return NotFound($"Expense with ID {id} not found");
            }

            var expenseDto = _mapper.Map<ExpenseDto>(expense);
            return Ok(expenseDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving expense {Id}", id);
            return StatusCode(500, "An error occurred while retrieving the expense");
        }
    }

    [HttpPost]
    public async Task<ActionResult<ExpenseDto>> CreateExpense(CreateExpenseDto createDto)
    {
        try
        {
            if (createDto.BudgetId.HasValue)
            {
                var budget = await _context.Budgets.FindAsync(createDto.BudgetId.Value);
                if (budget == null)
                {
                    return BadRequest($"Budget with ID {createDto.BudgetId.Value} not found");
                }
            }

            var expense = _mapper.Map<Expense>(createDto);
            expense.CreatedAt = DateTime.UtcNow;
            expense.UpdatedAt = DateTime.UtcNow;

            _context.Expenses.Add(expense);
            await _context.SaveChangesAsync();

            var expenseDto = _mapper.Map<ExpenseDto>(expense);
            return CreatedAtAction(nameof(GetExpense), new { id = expense.Id }, expenseDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating expense");
            return StatusCode(500, "An error occurred while creating the expense");
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateExpense(int id, UpdateExpenseDto updateDto)
    {
        try
        {
            var expense = await _context.Expenses.FindAsync(id);
            if (expense == null)
            {
                return NotFound($"Expense with ID {id} not found");
            }

            if (updateDto.BudgetId.HasValue)
            {
                var budget = await _context.Budgets.FindAsync(updateDto.BudgetId.Value);
                if (budget == null)
                {
                    return BadRequest($"Budget with ID {updateDto.BudgetId.Value} not found");
                }
            }

            _mapper.Map(updateDto, expense);
            expense.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating expense {Id}", id);
            return StatusCode(500, "An error occurred while updating the expense");
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteExpense(int id)
    {
        try
        {
            var expense = await _context.Expenses.FindAsync(id);
            if (expense == null)
            {
                return NotFound($"Expense with ID {id} not found");
            }

            _context.Expenses.Remove(expense);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting expense {Id}", id);
            return StatusCode(500, "An error occurred while deleting the expense");
        }
    }

    [HttpPost("{id}/approve")]
    public async Task<IActionResult> ApproveExpense(int id, [FromBody] string approvedBy)
    {
        try
        {
            var expense = await _context.Expenses.FindAsync(id);
            if (expense == null)
            {
                return NotFound($"Expense with ID {id} not found");
            }

            if (expense.Status != "Pending")
            {
                return BadRequest("Only pending expenses can be approved");
            }

            expense.Status = "Approved";
            expense.ApprovedBy = approvedBy;
            expense.ApprovalDate = DateTime.UtcNow;
            expense.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error approving expense {Id}", id);
            return StatusCode(500, "An error occurred while approving the expense");
        }
    }

    [HttpPost("{id}/pay")]
    public async Task<IActionResult> PayExpense(int id, [FromBody] PayExpenseRequest request)
    {
        try
        {
            var expense = await _context.Expenses
                .Include(e => e.Budget)
                .FirstOrDefaultAsync(e => e.Id == id);

            if (expense == null)
            {
                return NotFound($"Expense with ID {id} not found");
            }

            if (expense.Status != "Approved")
            {
                return BadRequest("Only approved expenses can be paid");
            }

            if (expense.Budget != null)
            {
                if (expense.Budget.SpentAmount + expense.Amount > expense.Budget.AllocatedAmount)
                {
                    return BadRequest("Payment would exceed budget allocation");
                }

                expense.Budget.SpentAmount += expense.Amount;
            }

            expense.Status = "Paid";
            expense.PaidBy = request.PaidBy;
            expense.PaymentDate = DateTime.UtcNow;
            expense.PaymentReference = request.PaymentReference;
            expense.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error paying expense {Id}", id);
            return StatusCode(500, "An error occurred while paying the expense");
        }
    }

    [HttpGet("summary")]
    public async Task<ActionResult<ExpenseSummaryDto>> GetExpenseSummary()
    {
        try
        {
            var totalExpenses = await _context.Expenses.SumAsync(e => e.Amount);
            var pendingExpenses = await _context.Expenses
                .Where(e => e.Status == "Pending")
                .SumAsync(e => e.Amount);
            var approvedExpenses = await _context.Expenses
                .Where(e => e.Status == "Approved")
                .SumAsync(e => e.Amount);
            var paidExpenses = await _context.Expenses
                .Where(e => e.Status == "Paid")
                .SumAsync(e => e.Amount);

            var expensesByCategory = await _context.Expenses
                .GroupBy(e => e.Category)
                .Select(g => new { Category = g.Key, Total = g.Sum(e => e.Amount) })
                .ToDictionaryAsync(x => x.Category, x => x.Total);

            var expensesByDepartment = await _context.Expenses
                .Where(e => !string.IsNullOrEmpty(e.Department))
                .GroupBy(e => e.Department!)
                .Select(g => new { Department = g.Key, Total = g.Sum(e => e.Amount) })
                .ToDictionaryAsync(x => x.Department, x => x.Total);

            var summary = new ExpenseSummaryDto
            {
                TotalExpenses = totalExpenses,
                PendingExpenses = pendingExpenses,
                ApprovedExpenses = approvedExpenses,
                PaidExpenses = paidExpenses,
                ExpensesByCategory = expensesByCategory,
                ExpensesByDepartment = expensesByDepartment
            };

            return Ok(summary);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving expense summary");
            return StatusCode(500, "An error occurred while retrieving the expense summary");
        }
    }

    [HttpGet("categories")]
    public async Task<ActionResult<IEnumerable<string>>> GetExpenseCategories()
    {
        try
        {
            var categories = await _context.Expenses
                .Select(e => e.Category)
                .Distinct()
                .OrderBy(c => c)
                .ToListAsync();

            return Ok(categories);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving expense categories");
            return StatusCode(500, "An error occurred while retrieving expense categories");
        }
    }
}

public class PayExpenseRequest
{
    public string PaidBy { get; set; } = string.Empty;
    public string? PaymentReference { get; set; }
}
