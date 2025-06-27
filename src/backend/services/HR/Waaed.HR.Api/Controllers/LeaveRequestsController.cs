using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutoMapper;
using Waaed.HR.Api.Data;
using Waaed.HR.Api.Entities;
using Waaed.HR.Api.DTOs;

namespace Waaed.HR.Api.Controllers;

[ApiController]
[Route("api/hr/[controller]")]
public class LeaveRequestsController : ControllerBase
{
    private readonly HRDbContext _context;
    private readonly IMapper _mapper;
    private readonly ILogger<LeaveRequestsController> _logger;

    public LeaveRequestsController(HRDbContext context, IMapper mapper, ILogger<LeaveRequestsController> logger)
    {
        _context = context;
        _mapper = mapper;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<LeaveRequestDto>>> GetLeaveRequests(
        [FromQuery] int? employeeId = null,
        [FromQuery] string? leaveType = null,
        [FromQuery] string? status = null,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        [FromQuery] int? departmentId = null)
    {
        try
        {
            var query = _context.LeaveRequests
                .Include(lr => lr.Employee)
                .ThenInclude(e => e.Department)
                .Include(lr => lr.ApprovedBy)
                .AsQueryable();

            if (employeeId.HasValue)
            {
                query = query.Where(lr => lr.EmployeeId == employeeId.Value);
            }

            if (!string.IsNullOrEmpty(leaveType))
            {
                query = query.Where(lr => lr.LeaveType == leaveType);
            }

            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(lr => lr.Status == status);
            }

            if (fromDate.HasValue)
            {
                query = query.Where(lr => lr.StartDate >= fromDate.Value);
            }

            if (toDate.HasValue)
            {
                query = query.Where(lr => lr.EndDate <= toDate.Value);
            }

            if (departmentId.HasValue)
            {
                query = query.Where(lr => lr.Employee.DepartmentId == departmentId.Value);
            }

            var leaveRequests = await query
                .OrderByDescending(lr => lr.RequestDate)
                .ToListAsync();

            var leaveRequestDtos = _mapper.Map<IEnumerable<LeaveRequestDto>>(leaveRequests);
            return Ok(leaveRequestDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving leave requests");
            return StatusCode(500, "An error occurred while retrieving leave requests");
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<LeaveRequestDto>> GetLeaveRequest(int id)
    {
        try
        {
            var leaveRequest = await _context.LeaveRequests
                .Include(lr => lr.Employee)
                .Include(lr => lr.ApprovedBy)
                .FirstOrDefaultAsync(lr => lr.Id == id);

            if (leaveRequest == null)
            {
                return NotFound($"Leave request with ID {id} not found");
            }

            var leaveRequestDto = _mapper.Map<LeaveRequestDto>(leaveRequest);
            return Ok(leaveRequestDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving leave request {Id}", id);
            return StatusCode(500, "An error occurred while retrieving the leave request");
        }
    }

    [HttpPost]
    public async Task<ActionResult<LeaveRequestDto>> CreateLeaveRequest(CreateLeaveRequestDto createDto)
    {
        try
        {
            var employee = await _context.Employees.FindAsync(createDto.EmployeeId);
            if (employee == null)
            {
                return BadRequest($"Employee with ID {createDto.EmployeeId} not found");
            }

            if (createDto.StartDate > createDto.EndDate)
            {
                return BadRequest("Start date cannot be after end date");
            }

            if (createDto.StartDate < DateTime.Today)
            {
                return BadRequest("Start date cannot be in the past");
            }

            var overlappingRequests = await _context.LeaveRequests
                .Where(lr => lr.EmployeeId == createDto.EmployeeId &&
                            lr.Status != "Rejected" &&
                            ((lr.StartDate <= createDto.EndDate && lr.EndDate >= createDto.StartDate)))
                .ToListAsync();

            if (overlappingRequests.Any())
            {
                return BadRequest("Leave request overlaps with existing leave request");
            }

            var leaveRequest = _mapper.Map<LeaveRequest>(createDto);
            leaveRequest.CreatedAt = DateTime.UtcNow;
            leaveRequest.UpdatedAt = DateTime.UtcNow;

            _context.LeaveRequests.Add(leaveRequest);
            await _context.SaveChangesAsync();

            var leaveRequestDto = _mapper.Map<LeaveRequestDto>(leaveRequest);
            return CreatedAtAction(nameof(GetLeaveRequest), new { id = leaveRequest.Id }, leaveRequestDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating leave request");
            return StatusCode(500, "An error occurred while creating the leave request");
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateLeaveRequest(int id, UpdateLeaveRequestDto updateDto)
    {
        try
        {
            var leaveRequest = await _context.LeaveRequests.FindAsync(id);
            if (leaveRequest == null)
            {
                return NotFound($"Leave request with ID {id} not found");
            }

            if (leaveRequest.Status != "Pending")
            {
                return BadRequest("Only pending leave requests can be updated");
            }

            if (updateDto.StartDate > updateDto.EndDate)
            {
                return BadRequest("Start date cannot be after end date");
            }

            if (updateDto.StartDate < DateTime.Today)
            {
                return BadRequest("Start date cannot be in the past");
            }

            var overlappingRequests = await _context.LeaveRequests
                .Where(lr => lr.EmployeeId == leaveRequest.EmployeeId &&
                            lr.Id != id &&
                            lr.Status != "Rejected" &&
                            ((lr.StartDate <= updateDto.EndDate && lr.EndDate >= updateDto.StartDate)))
                .ToListAsync();

            if (overlappingRequests.Any())
            {
                return BadRequest("Leave request overlaps with existing leave request");
            }

            _mapper.Map(updateDto, leaveRequest);
            leaveRequest.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating leave request {Id}", id);
            return StatusCode(500, "An error occurred while updating the leave request");
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteLeaveRequest(int id)
    {
        try
        {
            var leaveRequest = await _context.LeaveRequests.FindAsync(id);
            if (leaveRequest == null)
            {
                return NotFound($"Leave request with ID {id} not found");
            }

            if (leaveRequest.Status != "Pending")
            {
                return BadRequest("Only pending leave requests can be deleted");
            }

            _context.LeaveRequests.Remove(leaveRequest);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting leave request {Id}", id);
            return StatusCode(500, "An error occurred while deleting the leave request");
        }
    }

    [HttpPost("{id}/approve")]
    public async Task<IActionResult> ApproveLeaveRequest(int id, ApproveLeaveRequestDto approveDto)
    {
        try
        {
            var leaveRequest = await _context.LeaveRequests.FindAsync(id);
            if (leaveRequest == null)
            {
                return NotFound($"Leave request with ID {id} not found");
            }

            if (leaveRequest.Status != "Pending")
            {
                return BadRequest("Only pending leave requests can be approved");
            }

            var approver = await _context.Employees.FindAsync(approveDto.ApprovedById);
            if (approver == null)
            {
                return BadRequest($"Approver with ID {approveDto.ApprovedById} not found");
            }

            leaveRequest.Status = "Approved";
            leaveRequest.ApprovedById = approveDto.ApprovedById;
            leaveRequest.ApprovalDate = DateTime.UtcNow;
            leaveRequest.ApprovalComments = approveDto.ApprovalComments;
            leaveRequest.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error approving leave request {Id}", id);
            return StatusCode(500, "An error occurred while approving the leave request");
        }
    }

    [HttpPost("{id}/reject")]
    public async Task<IActionResult> RejectLeaveRequest(int id, RejectLeaveRequestDto rejectDto)
    {
        try
        {
            var leaveRequest = await _context.LeaveRequests.FindAsync(id);
            if (leaveRequest == null)
            {
                return NotFound($"Leave request with ID {id} not found");
            }

            if (leaveRequest.Status != "Pending")
            {
                return BadRequest("Only pending leave requests can be rejected");
            }

            var approver = await _context.Employees.FindAsync(rejectDto.ApprovedById);
            if (approver == null)
            {
                return BadRequest($"Approver with ID {rejectDto.ApprovedById} not found");
            }

            leaveRequest.Status = "Rejected";
            leaveRequest.ApprovedById = rejectDto.ApprovedById;
            leaveRequest.ApprovalDate = DateTime.UtcNow;
            leaveRequest.RejectionReason = rejectDto.RejectionReason;
            leaveRequest.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error rejecting leave request {Id}", id);
            return StatusCode(500, "An error occurred while rejecting the leave request");
        }
    }

    [HttpGet("summary")]
    public async Task<ActionResult<LeaveSummaryDto>> GetLeaveSummary()
    {
        try
        {
            var totalRequests = await _context.LeaveRequests.CountAsync();
            var pendingRequests = await _context.LeaveRequests.CountAsync(lr => lr.Status == "Pending");
            var approvedRequests = await _context.LeaveRequests.CountAsync(lr => lr.Status == "Approved");
            var rejectedRequests = await _context.LeaveRequests.CountAsync(lr => lr.Status == "Rejected");

            var requestsByType = await _context.LeaveRequests
                .GroupBy(lr => lr.LeaveType)
                .Select(g => new { Type = g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.Type, x => x.Count);

            var requestsByDepartment = await _context.LeaveRequests
                .Include(lr => lr.Employee)
                .ThenInclude(e => e.Department)
                .GroupBy(lr => lr.Employee.Department.Name)
                .Select(g => new { Department = g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.Department, x => x.Count);

            var summary = new LeaveSummaryDto
            {
                TotalRequests = totalRequests,
                PendingRequests = pendingRequests,
                ApprovedRequests = approvedRequests,
                RejectedRequests = rejectedRequests,
                RequestsByType = requestsByType,
                RequestsByDepartment = requestsByDepartment
            };

            return Ok(summary);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving leave summary");
            return StatusCode(500, "An error occurred while retrieving the leave summary");
        }
    }

    [HttpGet("types")]
    public ActionResult<IEnumerable<string>> GetLeaveTypes()
    {
        var leaveTypes = new[]
        {
            "Annual Leave",
            "Sick Leave",
            "Maternity Leave",
            "Paternity Leave",
            "Emergency Leave",
            "Study Leave",
            "Unpaid Leave",
            "Compassionate Leave"
        };

        return Ok(leaveTypes);
    }

    [HttpGet("employee/{employeeId}/balance")]
    public async Task<ActionResult<IEnumerable<LeaveBalanceDto>>> GetEmployeeLeaveBalance(int employeeId)
    {
        try
        {
            var employee = await _context.Employees.FindAsync(employeeId);
            if (employee == null)
            {
                return NotFound($"Employee with ID {employeeId} not found");
            }

            var leaveTypes = new[] { "Annual Leave", "Sick Leave", "Emergency Leave" };
            var balances = new List<LeaveBalanceDto>();

            foreach (var leaveType in leaveTypes)
            {
                var usedDays = await _context.LeaveRequests
                    .Where(lr => lr.EmployeeId == employeeId && 
                                lr.LeaveType == leaveType && 
                                lr.Status == "Approved" &&
                                lr.StartDate.Year == DateTime.UtcNow.Year)
                    .SumAsync(lr => lr.TotalDays);

                var pendingDays = await _context.LeaveRequests
                    .Where(lr => lr.EmployeeId == employeeId && 
                                lr.LeaveType == leaveType && 
                                lr.Status == "Pending" &&
                                lr.StartDate.Year == DateTime.UtcNow.Year)
                    .SumAsync(lr => lr.TotalDays);

                var totalEntitlement = leaveType switch
                {
                    "Annual Leave" => 21,
                    "Sick Leave" => 10,
                    "Emergency Leave" => 5,
                    _ => 0
                };

                balances.Add(new LeaveBalanceDto
                {
                    EmployeeId = employeeId,
                    EmployeeName = employee.FullName,
                    LeaveType = leaveType,
                    TotalEntitlement = totalEntitlement,
                    UsedDays = usedDays,
                    RemainingDays = totalEntitlement - usedDays,
                    PendingDays = pendingDays
                });
            }

            return Ok(balances);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving leave balance for employee {EmployeeId}", employeeId);
            return StatusCode(500, "An error occurred while retrieving the employee's leave balance");
        }
    }
}
