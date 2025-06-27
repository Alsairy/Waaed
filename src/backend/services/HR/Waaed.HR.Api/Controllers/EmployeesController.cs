using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutoMapper;
using AttendancePlatform.HR.Api.Data;
using AttendancePlatform.HR.Api.Entities;
using AttendancePlatform.HR.Api.DTOs;

namespace AttendancePlatform.HR.Api.Controllers;

[ApiController]
[Route("api/hr/[controller]")]
public class EmployeesController : ControllerBase
{
    private readonly HRDbContext _context;
    private readonly IMapper _mapper;
    private readonly ILogger<EmployeesController> _logger;

    public EmployeesController(HRDbContext context, IMapper mapper, ILogger<EmployeesController> logger)
    {
        _context = context;
        _mapper = mapper;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<EmployeeDto>>> GetEmployees(
        [FromQuery] string? search = null,
        [FromQuery] int? departmentId = null,
        [FromQuery] int? positionId = null,
        [FromQuery] string? employmentStatus = null,
        [FromQuery] string? employmentType = null,
        [FromQuery] bool? isActive = null)
    {
        try
        {
            var query = _context.Employees
                .Include(e => e.Department)
                .Include(e => e.Position)
                .Include(e => e.Manager)
                .AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(e => e.FirstName.Contains(search) || 
                                        e.LastName.Contains(search) || 
                                        e.EmployeeId.Contains(search) ||
                                        e.Email.Contains(search));
            }

            if (departmentId.HasValue)
            {
                query = query.Where(e => e.DepartmentId == departmentId.Value);
            }

            if (positionId.HasValue)
            {
                query = query.Where(e => e.PositionId == positionId.Value);
            }

            if (!string.IsNullOrEmpty(employmentStatus))
            {
                query = query.Where(e => e.EmploymentStatus == employmentStatus);
            }

            if (!string.IsNullOrEmpty(employmentType))
            {
                query = query.Where(e => e.EmploymentType == employmentType);
            }

            if (isActive.HasValue)
            {
                query = query.Where(e => e.IsActive == isActive.Value);
            }

            var employees = await query
                .OrderBy(e => e.Department.Name)
                .ThenBy(e => e.LastName)
                .ThenBy(e => e.FirstName)
                .ToListAsync();

            var employeeDtos = _mapper.Map<IEnumerable<EmployeeDto>>(employees);
            return Ok(employeeDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving employees");
            return StatusCode(500, "An error occurred while retrieving employees");
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<EmployeeDto>> GetEmployee(int id)
    {
        try
        {
            var employee = await _context.Employees
                .Include(e => e.Department)
                .Include(e => e.Position)
                .Include(e => e.Manager)
                .FirstOrDefaultAsync(e => e.Id == id);

            if (employee == null)
            {
                return NotFound($"Employee with ID {id} not found");
            }

            var employeeDto = _mapper.Map<EmployeeDto>(employee);
            return Ok(employeeDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving employee {Id}", id);
            return StatusCode(500, "An error occurred while retrieving the employee");
        }
    }

    [HttpGet("by-employee-id/{employeeId}")]
    public async Task<ActionResult<EmployeeDto>> GetEmployeeByEmployeeId(string employeeId)
    {
        try
        {
            var employee = await _context.Employees
                .Include(e => e.Department)
                .Include(e => e.Position)
                .Include(e => e.Manager)
                .FirstOrDefaultAsync(e => e.EmployeeId == employeeId);

            if (employee == null)
            {
                return NotFound($"Employee with Employee ID {employeeId} not found");
            }

            var employeeDto = _mapper.Map<EmployeeDto>(employee);
            return Ok(employeeDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving employee by employee ID {EmployeeId}", employeeId);
            return StatusCode(500, "An error occurred while retrieving the employee");
        }
    }

    [HttpPost]
    public async Task<ActionResult<EmployeeDto>> CreateEmployee(CreateEmployeeDto createDto)
    {
        try
        {
            var existingEmployee = await _context.Employees
                .FirstOrDefaultAsync(e => e.EmployeeId == createDto.EmployeeId || e.Email == createDto.Email);

            if (existingEmployee != null)
            {
                return BadRequest($"Employee with Employee ID {createDto.EmployeeId} or Email {createDto.Email} already exists");
            }

            var department = await _context.Departments.FindAsync(createDto.DepartmentId);
            if (department == null)
            {
                return BadRequest($"Department with ID {createDto.DepartmentId} not found");
            }

            var position = await _context.Positions.FindAsync(createDto.PositionId);
            if (position == null)
            {
                return BadRequest($"Position with ID {createDto.PositionId} not found");
            }

            if (createDto.ManagerId.HasValue)
            {
                var manager = await _context.Employees.FindAsync(createDto.ManagerId.Value);
                if (manager == null)
                {
                    return BadRequest($"Manager with ID {createDto.ManagerId.Value} not found");
                }
            }

            var employee = _mapper.Map<Employee>(createDto);
            employee.CreatedAt = DateTime.UtcNow;
            employee.UpdatedAt = DateTime.UtcNow;

            _context.Employees.Add(employee);
            await _context.SaveChangesAsync();

            var employeeDto = _mapper.Map<EmployeeDto>(employee);
            return CreatedAtAction(nameof(GetEmployee), new { id = employee.Id }, employeeDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating employee");
            return StatusCode(500, "An error occurred while creating the employee");
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateEmployee(int id, UpdateEmployeeDto updateDto)
    {
        try
        {
            var employee = await _context.Employees.FindAsync(id);
            if (employee == null)
            {
                return NotFound($"Employee with ID {id} not found");
            }

            var department = await _context.Departments.FindAsync(updateDto.DepartmentId);
            if (department == null)
            {
                return BadRequest($"Department with ID {updateDto.DepartmentId} not found");
            }

            var position = await _context.Positions.FindAsync(updateDto.PositionId);
            if (position == null)
            {
                return BadRequest($"Position with ID {updateDto.PositionId} not found");
            }

            if (updateDto.ManagerId.HasValue)
            {
                var manager = await _context.Employees.FindAsync(updateDto.ManagerId.Value);
                if (manager == null)
                {
                    return BadRequest($"Manager with ID {updateDto.ManagerId.Value} not found");
                }

                if (updateDto.ManagerId.Value == id)
                {
                    return BadRequest("Employee cannot be their own manager");
                }
            }

            _mapper.Map(updateDto, employee);
            employee.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating employee {Id}", id);
            return StatusCode(500, "An error occurred while updating the employee");
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteEmployee(int id)
    {
        try
        {
            var employee = await _context.Employees
                .Include(e => e.Subordinates)
                .Include(e => e.LeaveRequests)
                .Include(e => e.PerformanceReviews)
                .FirstOrDefaultAsync(e => e.Id == id);

            if (employee == null)
            {
                return NotFound($"Employee with ID {id} not found");
            }

            if (employee.Subordinates.Any() || employee.LeaveRequests.Any() || employee.PerformanceReviews.Any())
            {
                employee.IsActive = false;
                employee.EmploymentStatus = "Terminated";
                employee.TerminationDate = DateTime.UtcNow;
                employee.UpdatedAt = DateTime.UtcNow;
            }
            else
            {
                _context.Employees.Remove(employee);
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting employee {Id}", id);
            return StatusCode(500, "An error occurred while deleting the employee");
        }
    }

    [HttpGet("summary")]
    public async Task<ActionResult<EmployeeSummaryDto>> GetEmployeeSummary()
    {
        try
        {
            var totalEmployees = await _context.Employees.CountAsync();
            var activeEmployees = await _context.Employees.CountAsync(e => e.IsActive);
            var inactiveEmployees = totalEmployees - activeEmployees;

            var currentMonth = DateTime.UtcNow.Date.AddDays(1 - DateTime.UtcNow.Day);
            var newHiresThisMonth = await _context.Employees
                .CountAsync(e => e.HireDate >= currentMonth);

            var terminationsThisMonth = await _context.Employees
                .CountAsync(e => e.TerminationDate >= currentMonth);

            var employeesByDepartment = await _context.Employees
                .Where(e => e.IsActive)
                .Include(e => e.Department)
                .GroupBy(e => e.Department.Name)
                .Select(g => new { Department = g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.Department, x => x.Count);

            var employeesByPosition = await _context.Employees
                .Where(e => e.IsActive)
                .Include(e => e.Position)
                .GroupBy(e => e.Position.Title)
                .Select(g => new { Position = g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.Position, x => x.Count);

            var employeesByEmploymentType = await _context.Employees
                .Where(e => e.IsActive)
                .GroupBy(e => e.EmploymentType)
                .Select(g => new { Type = g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.Type, x => x.Count);

            var summary = new EmployeeSummaryDto
            {
                TotalEmployees = totalEmployees,
                ActiveEmployees = activeEmployees,
                InactiveEmployees = inactiveEmployees,
                NewHiresThisMonth = newHiresThisMonth,
                TerminationsThisMonth = terminationsThisMonth,
                EmployeesByDepartment = employeesByDepartment,
                EmployeesByPosition = employeesByPosition,
                EmployeesByEmploymentType = employeesByEmploymentType
            };

            return Ok(summary);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving employee summary");
            return StatusCode(500, "An error occurred while retrieving the employee summary");
        }
    }

    [HttpGet("{id}/subordinates")]
    public async Task<ActionResult<IEnumerable<EmployeeDto>>> GetEmployeeSubordinates(int id)
    {
        try
        {
            var employee = await _context.Employees.FindAsync(id);
            if (employee == null)
            {
                return NotFound($"Employee with ID {id} not found");
            }

            var subordinates = await _context.Employees
                .Include(e => e.Department)
                .Include(e => e.Position)
                .Where(e => e.ManagerId == id && e.IsActive)
                .OrderBy(e => e.LastName)
                .ThenBy(e => e.FirstName)
                .ToListAsync();

            var subordinateDtos = _mapper.Map<IEnumerable<EmployeeDto>>(subordinates);
            return Ok(subordinateDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving subordinates for employee {Id}", id);
            return StatusCode(500, "An error occurred while retrieving the employee's subordinates");
        }
    }

    [HttpPost("bulk-import")]
    public async Task<ActionResult<BulkImportResult>> BulkImportEmployees([FromBody] List<CreateEmployeeDto> employees)
    {
        try
        {
            var result = new BulkImportResult();
            var employeesToAdd = new List<Employee>();

            foreach (var employeeDto in employees)
            {
                var existingEmployee = await _context.Employees
                    .FirstOrDefaultAsync(e => e.EmployeeId == employeeDto.EmployeeId || e.Email == employeeDto.Email);

                if (existingEmployee != null)
                {
                    result.Errors.Add($"Employee with ID {employeeDto.EmployeeId} or Email {employeeDto.Email} already exists");
                    result.FailedCount++;
                    continue;
                }

                var department = await _context.Departments.FindAsync(employeeDto.DepartmentId);
                if (department == null)
                {
                    result.Errors.Add($"Department with ID {employeeDto.DepartmentId} not found for employee {employeeDto.EmployeeId}");
                    result.FailedCount++;
                    continue;
                }

                var position = await _context.Positions.FindAsync(employeeDto.PositionId);
                if (position == null)
                {
                    result.Errors.Add($"Position with ID {employeeDto.PositionId} not found for employee {employeeDto.EmployeeId}");
                    result.FailedCount++;
                    continue;
                }

                var employee = _mapper.Map<Employee>(employeeDto);
                employee.CreatedAt = DateTime.UtcNow;
                employee.UpdatedAt = DateTime.UtcNow;

                employeesToAdd.Add(employee);
                result.SuccessCount++;
            }

            if (employeesToAdd.Any())
            {
                _context.Employees.AddRange(employeesToAdd);
                await _context.SaveChangesAsync();
            }

            result.TotalProcessed = employees.Count;
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error bulk importing employees");
            return StatusCode(500, "An error occurred while bulk importing employees");
        }
    }
}

public class BulkImportResult
{
    public int TotalProcessed { get; set; }
    public int SuccessCount { get; set; }
    public int FailedCount { get; set; }
    public List<string> Errors { get; set; } = new();
}
