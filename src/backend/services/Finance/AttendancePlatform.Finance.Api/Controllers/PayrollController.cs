using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutoMapper;
using AttendancePlatform.Finance.Api.Data;
using AttendancePlatform.Finance.Api.Entities;
using AttendancePlatform.Finance.Api.DTOs;

namespace AttendancePlatform.Finance.Api.Controllers;

[ApiController]
[Route("api/finance/[controller]")]
public class PayrollController : ControllerBase
{
    private readonly FinanceDbContext _context;
    private readonly IMapper _mapper;
    private readonly ILogger<PayrollController> _logger;

    public PayrollController(FinanceDbContext context, IMapper mapper, ILogger<PayrollController> logger)
    {
        _context = context;
        _mapper = mapper;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<PayrollEntryDto>>> GetPayrollEntries(
        [FromQuery] string? employeeId = null,
        [FromQuery] string? department = null,
        [FromQuery] DateTime? payrollMonth = null,
        [FromQuery] string? status = null)
    {
        try
        {
            var query = _context.PayrollEntries.AsQueryable();

            if (!string.IsNullOrEmpty(employeeId))
            {
                query = query.Where(p => p.EmployeeId == employeeId);
            }

            if (!string.IsNullOrEmpty(department))
            {
                query = query.Where(p => p.Department == department);
            }

            if (payrollMonth.HasValue)
            {
                query = query.Where(p => p.PayrollMonth.Year == payrollMonth.Value.Year && 
                                        p.PayrollMonth.Month == payrollMonth.Value.Month);
            }

            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(p => p.Status == status);
            }

            var payrollEntries = await query
                .OrderByDescending(p => p.PayrollMonth)
                .ThenBy(p => p.EmployeeName)
                .ToListAsync();

            var payrollDtos = _mapper.Map<IEnumerable<PayrollEntryDto>>(payrollEntries);
            return Ok(payrollDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving payroll entries");
            return StatusCode(500, "An error occurred while retrieving payroll entries");
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<PayrollEntryDto>> GetPayrollEntry(int id)
    {
        try
        {
            var payrollEntry = await _context.PayrollEntries.FindAsync(id);
            if (payrollEntry == null)
            {
                return NotFound($"Payroll entry with ID {id} not found");
            }

            var payrollDto = _mapper.Map<PayrollEntryDto>(payrollEntry);
            return Ok(payrollDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving payroll entry {Id}", id);
            return StatusCode(500, "An error occurred while retrieving the payroll entry");
        }
    }

    [HttpPost]
    public async Task<ActionResult<PayrollEntryDto>> CreatePayrollEntry(CreatePayrollEntryDto createDto)
    {
        try
        {
            var existingEntry = await _context.PayrollEntries
                .FirstOrDefaultAsync(p => p.EmployeeId == createDto.EmployeeId && 
                                         p.PayrollMonth.Year == createDto.PayrollMonth.Year &&
                                         p.PayrollMonth.Month == createDto.PayrollMonth.Month);

            if (existingEntry != null)
            {
                return BadRequest($"Payroll entry already exists for employee {createDto.EmployeeId} for {createDto.PayrollMonth:yyyy-MM}");
            }

            var payrollEntry = _mapper.Map<PayrollEntry>(createDto);
            payrollEntry.CreatedAt = DateTime.UtcNow;
            payrollEntry.UpdatedAt = DateTime.UtcNow;

            _context.PayrollEntries.Add(payrollEntry);
            await _context.SaveChangesAsync();

            var payrollDto = _mapper.Map<PayrollEntryDto>(payrollEntry);
            return CreatedAtAction(nameof(GetPayrollEntry), new { id = payrollEntry.Id }, payrollDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating payroll entry");
            return StatusCode(500, "An error occurred while creating the payroll entry");
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdatePayrollEntry(int id, UpdatePayrollEntryDto updateDto)
    {
        try
        {
            var payrollEntry = await _context.PayrollEntries.FindAsync(id);
            if (payrollEntry == null)
            {
                return NotFound($"Payroll entry with ID {id} not found");
            }

            _mapper.Map(updateDto, payrollEntry);
            payrollEntry.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating payroll entry {Id}", id);
            return StatusCode(500, "An error occurred while updating the payroll entry");
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePayrollEntry(int id)
    {
        try
        {
            var payrollEntry = await _context.PayrollEntries.FindAsync(id);
            if (payrollEntry == null)
            {
                return NotFound($"Payroll entry with ID {id} not found");
            }

            if (payrollEntry.Status == "Paid")
            {
                return BadRequest("Cannot delete paid payroll entries");
            }

            _context.PayrollEntries.Remove(payrollEntry);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting payroll entry {Id}", id);
            return StatusCode(500, "An error occurred while deleting the payroll entry");
        }
    }

    [HttpPost("{id}/approve")]
    public async Task<IActionResult> ApprovePayrollEntry(int id, [FromBody] string approvedBy)
    {
        try
        {
            var payrollEntry = await _context.PayrollEntries.FindAsync(id);
            if (payrollEntry == null)
            {
                return NotFound($"Payroll entry with ID {id} not found");
            }

            if (payrollEntry.Status != "Draft")
            {
                return BadRequest("Only draft payroll entries can be approved");
            }

            payrollEntry.Status = "Approved";
            payrollEntry.ApprovedBy = approvedBy;
            payrollEntry.ApprovalDate = DateTime.UtcNow;
            payrollEntry.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error approving payroll entry {Id}", id);
            return StatusCode(500, "An error occurred while approving the payroll entry");
        }
    }

    [HttpPost("{id}/pay")]
    public async Task<IActionResult> PayPayrollEntry(int id, [FromBody] PayPayrollRequest request)
    {
        try
        {
            var payrollEntry = await _context.PayrollEntries.FindAsync(id);
            if (payrollEntry == null)
            {
                return NotFound($"Payroll entry with ID {id} not found");
            }

            if (payrollEntry.Status != "Approved")
            {
                return BadRequest("Only approved payroll entries can be paid");
            }

            payrollEntry.Status = "Paid";
            payrollEntry.PaymentDate = DateTime.UtcNow;
            payrollEntry.PaymentMethod = request.PaymentMethod;
            payrollEntry.PaymentReference = request.PaymentReference;
            payrollEntry.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error paying payroll entry {Id}", id);
            return StatusCode(500, "An error occurred while paying the payroll entry");
        }
    }

    [HttpGet("summary")]
    public async Task<ActionResult<PayrollSummaryDto>> GetPayrollSummary(
        [FromQuery] DateTime? payrollMonth = null)
    {
        try
        {
            var query = _context.PayrollEntries.AsQueryable();

            if (payrollMonth.HasValue)
            {
                query = query.Where(p => p.PayrollMonth.Year == payrollMonth.Value.Year && 
                                        p.PayrollMonth.Month == payrollMonth.Value.Month);
            }

            var totalGrossSalary = await query.SumAsync(p => p.GrossSalary);
            var totalDeductions = await query.SumAsync(p => p.TotalDeductions);
            var totalNetSalary = await query.SumAsync(p => p.NetSalary);
            var totalEmployees = await query.CountAsync();
            var processedPayrolls = await query.CountAsync(p => p.Status == "Paid");
            var pendingPayrolls = await query.CountAsync(p => p.Status == "Draft" || p.Status == "Approved");

            var salaryByDepartment = await query
                .Where(p => !string.IsNullOrEmpty(p.Department))
                .GroupBy(p => p.Department!)
                .Select(g => new { Department = g.Key, Total = g.Sum(p => p.NetSalary) })
                .ToDictionaryAsync(x => x.Department, x => x.Total);

            var summary = new PayrollSummaryDto
            {
                TotalGrossSalary = totalGrossSalary,
                TotalDeductions = totalDeductions,
                TotalNetSalary = totalNetSalary,
                TotalEmployees = totalEmployees,
                ProcessedPayrolls = processedPayrolls,
                PendingPayrolls = pendingPayrolls,
                SalaryByDepartment = salaryByDepartment
            };

            return Ok(summary);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving payroll summary");
            return StatusCode(500, "An error occurred while retrieving the payroll summary");
        }
    }

    [HttpPost("bulk-create")]
    public async Task<ActionResult<IEnumerable<PayrollEntryDto>>> BulkCreatePayrollEntries(
        [FromBody] BulkCreatePayrollRequest request)
    {
        try
        {
            var payrollEntries = new List<PayrollEntry>();

            foreach (var employeeId in request.EmployeeIds)
            {
                var existingEntry = await _context.PayrollEntries
                    .FirstOrDefaultAsync(p => p.EmployeeId == employeeId && 
                                             p.PayrollMonth.Year == request.PayrollMonth.Year &&
                                             p.PayrollMonth.Month == request.PayrollMonth.Month);

                if (existingEntry != null)
                {
                    continue;
                }

                var payrollEntry = new PayrollEntry
                {
                    EmployeeId = employeeId,
                    EmployeeName = request.EmployeeNames.GetValueOrDefault(employeeId, employeeId),
                    Department = request.Departments.GetValueOrDefault(employeeId),
                    Designation = request.Designations.GetValueOrDefault(employeeId),
                    BasicSalary = request.BasicSalaries.GetValueOrDefault(employeeId, 0),
                    PayrollMonth = request.PayrollMonth,
                    WorkingDays = request.WorkingDays,
                    PresentDays = request.PresentDays.GetValueOrDefault(employeeId, request.WorkingDays),
                    GrossSalary = request.BasicSalaries.GetValueOrDefault(employeeId, 0),
                    TotalDeductions = 0,
                    NetSalary = request.BasicSalaries.GetValueOrDefault(employeeId, 0),
                    Status = "Draft",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                payrollEntries.Add(payrollEntry);
            }

            _context.PayrollEntries.AddRange(payrollEntries);
            await _context.SaveChangesAsync();

            var payrollDtos = _mapper.Map<IEnumerable<PayrollEntryDto>>(payrollEntries);
            return Ok(payrollDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error bulk creating payroll entries");
            return StatusCode(500, "An error occurred while bulk creating payroll entries");
        }
    }
}

public class PayPayrollRequest
{
    public string PaymentMethod { get; set; } = string.Empty;
    public string? PaymentReference { get; set; }
}

public class BulkCreatePayrollRequest
{
    public List<string> EmployeeIds { get; set; } = new();
    public Dictionary<string, string> EmployeeNames { get; set; } = new();
    public Dictionary<string, string> Departments { get; set; } = new();
    public Dictionary<string, string> Designations { get; set; } = new();
    public Dictionary<string, decimal> BasicSalaries { get; set; } = new();
    public DateTime PayrollMonth { get; set; }
    public int WorkingDays { get; set; }
    public Dictionary<string, int> PresentDays { get; set; } = new();
}
