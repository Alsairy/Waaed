using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutoMapper;
using Waaed.HR.Api.Data;
using Waaed.HR.Api.Entities;
using Waaed.HR.Api.DTOs;

namespace Waaed.HR.Api.Controllers;

[ApiController]
[Route("api/hr/[controller]")]
public class DepartmentsController : ControllerBase
{
    private readonly HRDbContext _context;
    private readonly IMapper _mapper;
    private readonly ILogger<DepartmentsController> _logger;

    public DepartmentsController(HRDbContext context, IMapper mapper, ILogger<DepartmentsController> logger)
    {
        _context = context;
        _mapper = mapper;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<DepartmentDto>>> GetDepartments(
        [FromQuery] bool includeInactive = false,
        [FromQuery] int? parentDepartmentId = null)
    {
        try
        {
            var query = _context.Departments
                .Include(d => d.ParentDepartment)
                .Include(d => d.HeadOfDepartment)
                .Include(d => d.Employees)
                .Include(d => d.SubDepartments)
                .AsQueryable();

            if (!includeInactive)
            {
                query = query.Where(d => d.IsActive);
            }

            if (parentDepartmentId.HasValue)
            {
                query = query.Where(d => d.ParentDepartmentId == parentDepartmentId.Value);
            }

            var departments = await query
                .OrderBy(d => d.Name)
                .ToListAsync();

            var departmentDtos = _mapper.Map<IEnumerable<DepartmentDto>>(departments);
            return Ok(departmentDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving departments");
            return StatusCode(500, "An error occurred while retrieving departments");
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<DepartmentDto>> GetDepartment(int id)
    {
        try
        {
            var department = await _context.Departments
                .Include(d => d.ParentDepartment)
                .Include(d => d.HeadOfDepartment)
                .Include(d => d.Employees)
                .Include(d => d.SubDepartments)
                .FirstOrDefaultAsync(d => d.Id == id);

            if (department == null)
            {
                return NotFound($"Department with ID {id} not found");
            }

            var departmentDto = _mapper.Map<DepartmentDto>(department);
            return Ok(departmentDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving department {Id}", id);
            return StatusCode(500, "An error occurred while retrieving the department");
        }
    }

    [HttpPost]
    public async Task<ActionResult<DepartmentDto>> CreateDepartment(CreateDepartmentDto createDto)
    {
        try
        {
            var existingDepartment = await _context.Departments
                .FirstOrDefaultAsync(d => d.Code == createDto.Code);

            if (existingDepartment != null)
            {
                return BadRequest($"Department with code {createDto.Code} already exists");
            }

            if (createDto.ParentDepartmentId.HasValue)
            {
                var parentDepartment = await _context.Departments.FindAsync(createDto.ParentDepartmentId.Value);
                if (parentDepartment == null)
                {
                    return BadRequest($"Parent department with ID {createDto.ParentDepartmentId.Value} not found");
                }
            }

            if (createDto.HeadOfDepartmentId.HasValue)
            {
                var headOfDepartment = await _context.Employees.FindAsync(createDto.HeadOfDepartmentId.Value);
                if (headOfDepartment == null)
                {
                    return BadRequest($"Head of department with ID {createDto.HeadOfDepartmentId.Value} not found");
                }
            }

            var department = _mapper.Map<Department>(createDto);
            department.CreatedAt = DateTime.UtcNow;
            department.UpdatedAt = DateTime.UtcNow;

            _context.Departments.Add(department);
            await _context.SaveChangesAsync();

            var departmentDto = _mapper.Map<DepartmentDto>(department);
            return CreatedAtAction(nameof(GetDepartment), new { id = department.Id }, departmentDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating department");
            return StatusCode(500, "An error occurred while creating the department");
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateDepartment(int id, UpdateDepartmentDto updateDto)
    {
        try
        {
            var department = await _context.Departments.FindAsync(id);
            if (department == null)
            {
                return NotFound($"Department with ID {id} not found");
            }

            var existingDepartment = await _context.Departments
                .FirstOrDefaultAsync(d => d.Code == updateDto.Code && d.Id != id);

            if (existingDepartment != null)
            {
                return BadRequest($"Department with code {updateDto.Code} already exists");
            }

            if (updateDto.ParentDepartmentId.HasValue)
            {
                if (updateDto.ParentDepartmentId.Value == id)
                {
                    return BadRequest("Department cannot be its own parent");
                }

                var parentDepartment = await _context.Departments.FindAsync(updateDto.ParentDepartmentId.Value);
                if (parentDepartment == null)
                {
                    return BadRequest($"Parent department with ID {updateDto.ParentDepartmentId.Value} not found");
                }

                if (await IsCircularReference(id, updateDto.ParentDepartmentId.Value))
                {
                    return BadRequest("Circular reference detected in department hierarchy");
                }
            }

            if (updateDto.HeadOfDepartmentId.HasValue)
            {
                var headOfDepartment = await _context.Employees.FindAsync(updateDto.HeadOfDepartmentId.Value);
                if (headOfDepartment == null)
                {
                    return BadRequest($"Head of department with ID {updateDto.HeadOfDepartmentId.Value} not found");
                }
            }

            _mapper.Map(updateDto, department);
            department.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating department {Id}", id);
            return StatusCode(500, "An error occurred while updating the department");
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteDepartment(int id)
    {
        try
        {
            var department = await _context.Departments
                .Include(d => d.Employees)
                .Include(d => d.SubDepartments)
                .Include(d => d.Positions)
                .FirstOrDefaultAsync(d => d.Id == id);

            if (department == null)
            {
                return NotFound($"Department with ID {id} not found");
            }

            if (department.Employees.Any() || department.SubDepartments.Any() || department.Positions.Any())
            {
                department.IsActive = false;
                department.UpdatedAt = DateTime.UtcNow;
            }
            else
            {
                _context.Departments.Remove(department);
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting department {Id}", id);
            return StatusCode(500, "An error occurred while deleting the department");
        }
    }

    [HttpGet("hierarchy")]
    public async Task<ActionResult<IEnumerable<DepartmentHierarchyDto>>> GetDepartmentHierarchy()
    {
        try
        {
            var departments = await _context.Departments
                .Where(d => d.IsActive)
                .Include(d => d.SubDepartments)
                .ToListAsync();

            var rootDepartments = departments.Where(d => d.ParentDepartmentId == null).ToList();
            var hierarchyDtos = BuildHierarchy(rootDepartments, departments, 0);

            return Ok(hierarchyDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving department hierarchy");
            return StatusCode(500, "An error occurred while retrieving the department hierarchy");
        }
    }

    [HttpGet("{id}/employees")]
    public async Task<ActionResult<IEnumerable<EmployeeDto>>> GetDepartmentEmployees(int id, [FromQuery] bool includeSubDepartments = false)
    {
        try
        {
            var department = await _context.Departments.FindAsync(id);
            if (department == null)
            {
                return NotFound($"Department with ID {id} not found");
            }

            var query = _context.Employees
                .Include(e => e.Department)
                .Include(e => e.Position)
                .Include(e => e.Manager)
                .Where(e => e.IsActive);

            if (includeSubDepartments)
            {
                var departmentIds = await GetDepartmentAndSubDepartmentIds(id);
                query = query.Where(e => departmentIds.Contains(e.DepartmentId));
            }
            else
            {
                query = query.Where(e => e.DepartmentId == id);
            }

            var employees = await query
                .OrderBy(e => e.LastName)
                .ThenBy(e => e.FirstName)
                .ToListAsync();

            var employeeDtos = _mapper.Map<IEnumerable<EmployeeDto>>(employees);
            return Ok(employeeDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving employees for department {Id}", id);
            return StatusCode(500, "An error occurred while retrieving the department's employees");
        }
    }

    private async Task<bool> IsCircularReference(int departmentId, int parentDepartmentId)
    {
        int? currentParentId = parentDepartmentId;
        while (currentParentId.HasValue)
        {
            if (currentParentId.Value == departmentId)
            {
                return true;
            }

            var parentDepartment = await _context.Departments.FindAsync(currentParentId.Value);
            currentParentId = parentDepartment?.ParentDepartmentId;
        }

        return false;
    }

    private List<DepartmentHierarchyDto> BuildHierarchy(List<Department> departments, List<Department> allDepartments, int level)
    {
        var result = new List<DepartmentHierarchyDto>();

        foreach (var department in departments)
        {
            var hierarchyDto = _mapper.Map<DepartmentHierarchyDto>(department);
            hierarchyDto.Level = level;

            var children = allDepartments.Where(d => d.ParentDepartmentId == department.Id).ToList();
            hierarchyDto.Children = BuildHierarchy(children, allDepartments, level + 1);

            result.Add(hierarchyDto);
        }

        return result;
    }

    private async Task<List<int>> GetDepartmentAndSubDepartmentIds(int departmentId)
    {
        var departmentIds = new List<int> { departmentId };
        var subDepartments = await _context.Departments
            .Where(d => d.ParentDepartmentId == departmentId && d.IsActive)
            .ToListAsync();

        foreach (var subDepartment in subDepartments)
        {
            var subDepartmentIds = await GetDepartmentAndSubDepartmentIds(subDepartment.Id);
            departmentIds.AddRange(subDepartmentIds);
        }

        return departmentIds;
    }
}
