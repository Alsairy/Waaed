using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutoMapper;
using Waaed.HR.Api.Data;
using Waaed.HR.Api.Entities;
using Waaed.HR.Api.DTOs;

namespace Waaed.HR.Api.Controllers;

[ApiController]
[Route("api/hr/[controller]")]
public class PositionsController : ControllerBase
{
    private readonly HRDbContext _context;
    private readonly IMapper _mapper;
    private readonly ILogger<PositionsController> _logger;

    public PositionsController(HRDbContext context, IMapper mapper, ILogger<PositionsController> logger)
    {
        _context = context;
        _mapper = mapper;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<PositionDto>>> GetPositions(
        [FromQuery] int? departmentId = null,
        [FromQuery] string? level = null,
        [FromQuery] string? grade = null,
        [FromQuery] string? employmentType = null,
        [FromQuery] bool includeInactive = false)
    {
        try
        {
            var query = _context.Positions
                .Include(p => p.Department)
                .Include(p => p.Employees)
                .AsQueryable();

            if (!includeInactive)
            {
                query = query.Where(p => p.IsActive);
            }

            if (departmentId.HasValue)
            {
                query = query.Where(p => p.DepartmentId == departmentId.Value);
            }

            if (!string.IsNullOrEmpty(level))
            {
                query = query.Where(p => p.Level == level);
            }

            if (!string.IsNullOrEmpty(grade))
            {
                query = query.Where(p => p.Grade == grade);
            }

            if (!string.IsNullOrEmpty(employmentType))
            {
                query = query.Where(p => p.EmploymentType == employmentType);
            }

            var positions = await query
                .OrderBy(p => p.Department.Name)
                .ThenBy(p => p.Level)
                .ThenBy(p => p.Title)
                .ToListAsync();

            var positionDtos = _mapper.Map<IEnumerable<PositionDto>>(positions);
            return Ok(positionDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving positions");
            return StatusCode(500, "An error occurred while retrieving positions");
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<PositionDto>> GetPosition(int id)
    {
        try
        {
            var position = await _context.Positions
                .Include(p => p.Department)
                .Include(p => p.Employees)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (position == null)
            {
                return NotFound($"Position with ID {id} not found");
            }

            var positionDto = _mapper.Map<PositionDto>(position);
            return Ok(positionDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving position {Id}", id);
            return StatusCode(500, "An error occurred while retrieving the position");
        }
    }

    [HttpPost]
    public async Task<ActionResult<PositionDto>> CreatePosition(CreatePositionDto createDto)
    {
        try
        {
            var existingPosition = await _context.Positions
                .FirstOrDefaultAsync(p => p.Code == createDto.Code);

            if (existingPosition != null)
            {
                return BadRequest($"Position with code {createDto.Code} already exists");
            }

            var department = await _context.Departments.FindAsync(createDto.DepartmentId);
            if (department == null)
            {
                return BadRequest($"Department with ID {createDto.DepartmentId} not found");
            }

            if (createDto.MinSalary > createDto.MaxSalary)
            {
                return BadRequest("Minimum salary cannot be greater than maximum salary");
            }

            var position = _mapper.Map<Position>(createDto);
            position.CreatedAt = DateTime.UtcNow;
            position.UpdatedAt = DateTime.UtcNow;

            _context.Positions.Add(position);
            await _context.SaveChangesAsync();

            var positionDto = _mapper.Map<PositionDto>(position);
            return CreatedAtAction(nameof(GetPosition), new { id = position.Id }, positionDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating position");
            return StatusCode(500, "An error occurred while creating the position");
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdatePosition(int id, UpdatePositionDto updateDto)
    {
        try
        {
            var position = await _context.Positions.FindAsync(id);
            if (position == null)
            {
                return NotFound($"Position with ID {id} not found");
            }

            var existingPosition = await _context.Positions
                .FirstOrDefaultAsync(p => p.Code == updateDto.Code && p.Id != id);

            if (existingPosition != null)
            {
                return BadRequest($"Position with code {updateDto.Code} already exists");
            }

            var department = await _context.Departments.FindAsync(updateDto.DepartmentId);
            if (department == null)
            {
                return BadRequest($"Department with ID {updateDto.DepartmentId} not found");
            }

            if (updateDto.MinSalary > updateDto.MaxSalary)
            {
                return BadRequest("Minimum salary cannot be greater than maximum salary");
            }

            _mapper.Map(updateDto, position);
            position.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating position {Id}", id);
            return StatusCode(500, "An error occurred while updating the position");
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePosition(int id)
    {
        try
        {
            var position = await _context.Positions
                .Include(p => p.Employees)
                .Include(p => p.Recruitments)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (position == null)
            {
                return NotFound($"Position with ID {id} not found");
            }

            if (position.Employees.Any() || position.Recruitments.Any())
            {
                position.IsActive = false;
                position.UpdatedAt = DateTime.UtcNow;
            }
            else
            {
                _context.Positions.Remove(position);
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting position {Id}", id);
            return StatusCode(500, "An error occurred while deleting the position");
        }
    }

    [HttpGet("levels")]
    public async Task<ActionResult<IEnumerable<string>>> GetPositionLevels()
    {
        try
        {
            var levels = await _context.Positions
                .Where(p => p.IsActive)
                .Select(p => p.Level)
                .Distinct()
                .OrderBy(l => l)
                .ToListAsync();

            return Ok(levels);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving position levels");
            return StatusCode(500, "An error occurred while retrieving position levels");
        }
    }

    [HttpGet("grades")]
    public async Task<ActionResult<IEnumerable<string>>> GetPositionGrades()
    {
        try
        {
            var grades = await _context.Positions
                .Where(p => p.IsActive)
                .Select(p => p.Grade)
                .Distinct()
                .OrderBy(g => g)
                .ToListAsync();

            return Ok(grades);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving position grades");
            return StatusCode(500, "An error occurred while retrieving position grades");
        }
    }

    [HttpGet("{id}/employees")]
    public async Task<ActionResult<IEnumerable<EmployeeDto>>> GetPositionEmployees(int id)
    {
        try
        {
            var position = await _context.Positions.FindAsync(id);
            if (position == null)
            {
                return NotFound($"Position with ID {id} not found");
            }

            var employees = await _context.Employees
                .Include(e => e.Department)
                .Include(e => e.Position)
                .Include(e => e.Manager)
                .Where(e => e.PositionId == id && e.IsActive)
                .OrderBy(e => e.LastName)
                .ThenBy(e => e.FirstName)
                .ToListAsync();

            var employeeDtos = _mapper.Map<IEnumerable<EmployeeDto>>(employees);
            return Ok(employeeDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving employees for position {Id}", id);
            return StatusCode(500, "An error occurred while retrieving the position's employees");
        }
    }

    [HttpGet("by-department/{departmentId}")]
    public async Task<ActionResult<IEnumerable<PositionDto>>> GetPositionsByDepartment(int departmentId)
    {
        try
        {
            var department = await _context.Departments.FindAsync(departmentId);
            if (department == null)
            {
                return NotFound($"Department with ID {departmentId} not found");
            }

            var positions = await _context.Positions
                .Include(p => p.Department)
                .Include(p => p.Employees)
                .Where(p => p.DepartmentId == departmentId && p.IsActive)
                .OrderBy(p => p.Level)
                .ThenBy(p => p.Title)
                .ToListAsync();

            var positionDtos = _mapper.Map<IEnumerable<PositionDto>>(positions);
            return Ok(positionDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving positions for department {DepartmentId}", departmentId);
            return StatusCode(500, "An error occurred while retrieving the department's positions");
        }
    }
}
