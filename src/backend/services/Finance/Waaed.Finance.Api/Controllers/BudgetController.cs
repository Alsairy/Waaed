using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutoMapper;
using Waaed.Finance.Api.Data;
using Waaed.Finance.Api.Entities;
using Waaed.Finance.Api.DTOs;

namespace Waaed.Finance.Api.Controllers;

[ApiController]
[Route("api/finance/[controller]")]
public class BudgetController : ControllerBase
{
    private readonly FinanceDbContext _context;
    private readonly IMapper _mapper;
    private readonly ILogger<BudgetController> _logger;

    public BudgetController(FinanceDbContext context, IMapper mapper, ILogger<BudgetController> logger)
    {
        _context = context;
        _mapper = mapper;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<BudgetDto>>> GetBudgets(
        [FromQuery] string? category = null,
        [FromQuery] string? department = null,
        [FromQuery] string? status = null,
        [FromQuery] DateTime? academicYear = null)
    {
        try
        {
            var query = _context.Budgets
                .Include(b => b.Expenses)
                .AsQueryable();

            if (!string.IsNullOrEmpty(category))
            {
                query = query.Where(b => b.Category == category);
            }

            if (!string.IsNullOrEmpty(department))
            {
                query = query.Where(b => b.Department == department);
            }

            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(b => b.Status == status);
            }

            if (academicYear.HasValue)
            {
                query = query.Where(b => b.AcademicYear.Year == academicYear.Value.Year);
            }

            var budgets = await query
                .OrderByDescending(b => b.CreatedAt)
                .ToListAsync();

            var budgetDtos = _mapper.Map<IEnumerable<BudgetDto>>(budgets);
            return Ok(budgetDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving budgets: {Message}. StackTrace: {StackTrace}", ex.Message, ex.StackTrace);
            return StatusCode(500, $"An error occurred while retrieving budgets: {ex.Message}");
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<BudgetDto>> GetBudget(int id)
    {
        try
        {
            var budget = await _context.Budgets
                .Include(b => b.Expenses)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (budget == null)
            {
                return NotFound($"Budget with ID {id} not found");
            }

            var budgetDto = _mapper.Map<BudgetDto>(budget);
            return Ok(budgetDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving budget {Id}", id);
            return StatusCode(500, "An error occurred while retrieving the budget");
        }
    }

    [HttpPost]
    public async Task<ActionResult<BudgetDto>> CreateBudget(CreateBudgetDto createDto)
    {
        try
        {
            var budget = _mapper.Map<Budget>(createDto);
            budget.CreatedAt = DateTime.UtcNow;
            budget.UpdatedAt = DateTime.UtcNow;

            _context.Budgets.Add(budget);
            await _context.SaveChangesAsync();

            var budgetDto = _mapper.Map<BudgetDto>(budget);
            return CreatedAtAction(nameof(GetBudget), new { id = budget.Id }, budgetDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating budget");
            return StatusCode(500, "An error occurred while creating the budget");
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateBudget(int id, UpdateBudgetDto updateDto)
    {
        try
        {
            var budget = await _context.Budgets.FindAsync(id);
            if (budget == null)
            {
                return NotFound($"Budget with ID {id} not found");
            }

            _mapper.Map(updateDto, budget);
            budget.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating budget {Id}", id);
            return StatusCode(500, "An error occurred while updating the budget");
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteBudget(int id)
    {
        try
        {
            var budget = await _context.Budgets
                .Include(b => b.Expenses)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (budget == null)
            {
                return NotFound($"Budget with ID {id} not found");
            }

            if (budget.Expenses.Any())
            {
                return BadRequest("Cannot delete budget with associated expenses");
            }

            _context.Budgets.Remove(budget);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting budget {Id}", id);
            return StatusCode(500, "An error occurred while deleting the budget");
        }
    }

    [HttpPost("{id}/approve")]
    public async Task<IActionResult> ApproveBudget(int id, [FromBody] string approvedBy)
    {
        try
        {
            var budget = await _context.Budgets.FindAsync(id);
            if (budget == null)
            {
                return NotFound($"Budget with ID {id} not found");
            }

            if (budget.Status != "Active")
            {
                return BadRequest("Only active budgets can be approved");
            }

            budget.ApprovedBy = approvedBy;
            budget.ApprovalDate = DateTime.UtcNow;
            budget.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error approving budget {Id}", id);
            return StatusCode(500, "An error occurred while approving the budget");
        }
    }

    [HttpGet("summary")]
    public async Task<ActionResult<BudgetSummaryDto>> GetBudgetSummary()
    {
        try
        {
            var totalAllocated = await _context.Budgets
                .Where(b => b.IsActive)
                .SumAsync(b => b.AllocatedAmount);

            var totalSpent = await _context.Budgets
                .Where(b => b.IsActive)
                .SumAsync(b => b.SpentAmount);

            var totalRemaining = totalAllocated - totalSpent;

            var activeBudgets = await _context.Budgets
                .CountAsync(b => b.Status == "Active");

            var completedBudgets = await _context.Budgets
                .CountAsync(b => b.Status == "Completed");

            var budgetsByCategory = await _context.Budgets
                .Where(b => b.IsActive)
                .GroupBy(b => b.Category)
                .Select(g => new { Category = g.Key, Total = g.Sum(b => b.AllocatedAmount) })
                .ToDictionaryAsync(x => x.Category, x => x.Total);

            var budgetsByDepartment = await _context.Budgets
                .Where(b => b.IsActive && !string.IsNullOrEmpty(b.Department))
                .GroupBy(b => b.Department!)
                .Select(g => new { Department = g.Key, Total = g.Sum(b => b.AllocatedAmount) })
                .ToDictionaryAsync(x => x.Department, x => x.Total);

            var summary = new BudgetSummaryDto
            {
                TotalAllocated = totalAllocated,
                TotalSpent = totalSpent,
                TotalRemaining = totalRemaining,
                ActiveBudgets = activeBudgets,
                CompletedBudgets = completedBudgets,
                BudgetsByCategory = budgetsByCategory,
                BudgetsByDepartment = budgetsByDepartment
            };

            return Ok(summary);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving budget summary");
            return StatusCode(500, "An error occurred while retrieving the budget summary");
        }
    }

    [HttpGet("categories")]
    public async Task<ActionResult<IEnumerable<string>>> GetBudgetCategories()
    {
        try
        {
            var categories = await _context.Budgets
                .Select(b => b.Category)
                .Distinct()
                .OrderBy(c => c)
                .ToListAsync();

            return Ok(categories);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving budget categories");
            return StatusCode(500, "An error occurred while retrieving budget categories");
        }
    }

    [HttpGet("departments")]
    public async Task<ActionResult<IEnumerable<string>>> GetBudgetDepartments()
    {
        try
        {
            var departments = await _context.Budgets
                .Where(b => !string.IsNullOrEmpty(b.Department))
                .Select(b => b.Department!)
                .Distinct()
                .OrderBy(d => d)
                .ToListAsync();

            return Ok(departments);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving budget departments");
            return StatusCode(500, "An error occurred while retrieving budget departments");
        }
    }
}
