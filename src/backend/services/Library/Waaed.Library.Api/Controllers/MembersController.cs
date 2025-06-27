using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutoMapper;
using AttendancePlatform.Library.Api.Data;
using AttendancePlatform.Library.Api.Entities;
using AttendancePlatform.Library.Api.DTOs;

namespace AttendancePlatform.Library.Api.Controllers;

[ApiController]
[Route("api/library/[controller]")]
public class MembersController : ControllerBase
{
    private readonly LibraryDbContext _context;
    private readonly IMapper _mapper;
    private readonly ILogger<MembersController> _logger;

    public MembersController(LibraryDbContext context, IMapper mapper, ILogger<MembersController> logger)
    {
        _context = context;
        _mapper = mapper;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<MemberDto>>> GetMembers(
        [FromQuery] string? memberType = null,
        [FromQuery] string? status = null,
        [FromQuery] string? department = null,
        [FromQuery] string? search = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        try
        {
            var query = _context.Members.AsQueryable();

            if (!string.IsNullOrEmpty(memberType))
            {
                query = query.Where(m => m.MemberType == memberType);
            }

            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(m => m.Status == status);
            }

            if (!string.IsNullOrEmpty(department))
            {
                query = query.Where(m => m.Department != null && m.Department.Contains(department));
            }

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(m => m.FirstName.Contains(search) ||
                                        m.LastName.Contains(search) ||
                                        m.Email.Contains(search) ||
                                        m.MembershipId.Contains(search) ||
                                        (m.StudentId != null && m.StudentId.Contains(search)) ||
                                        (m.EmployeeId != null && m.EmployeeId.Contains(search)));
            }

            var totalCount = await query.CountAsync();
            var members = await query
                .OrderBy(m => m.LastName)
                .ThenBy(m => m.FirstName)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var memberDtos = _mapper.Map<IEnumerable<MemberDto>>(members);

            Response.Headers.Add("X-Total-Count", totalCount.ToString());
            Response.Headers.Add("X-Page", page.ToString());
            Response.Headers.Add("X-Page-Size", pageSize.ToString());

            return Ok(memberDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving members");
            return StatusCode(500, "An error occurred while retrieving members");
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<MemberDto>> GetMember(int id)
    {
        try
        {
            var member = await _context.Members.FindAsync(id);
            if (member == null)
            {
                return NotFound($"Member with ID {id} not found");
            }

            var memberDto = _mapper.Map<MemberDto>(member);
            return Ok(memberDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving member {Id}", id);
            return StatusCode(500, "An error occurred while retrieving the member");
        }
    }

    [HttpPost]
    public async Task<ActionResult<MemberDto>> CreateMember(CreateMemberDto createDto)
    {
        try
        {
            var existingMember = await _context.Members
                .FirstOrDefaultAsync(m => m.MembershipId == createDto.MembershipId || m.Email == createDto.Email);

            if (existingMember != null)
            {
                return BadRequest("Member with this membership ID or email already exists");
            }

            if (!string.IsNullOrEmpty(createDto.StudentId))
            {
                var existingStudent = await _context.Members
                    .FirstOrDefaultAsync(m => m.StudentId == createDto.StudentId);
                if (existingStudent != null)
                {
                    return BadRequest($"Member with student ID {createDto.StudentId} already exists");
                }
            }

            if (!string.IsNullOrEmpty(createDto.EmployeeId))
            {
                var existingEmployee = await _context.Members
                    .FirstOrDefaultAsync(m => m.EmployeeId == createDto.EmployeeId);
                if (existingEmployee != null)
                {
                    return BadRequest($"Member with employee ID {createDto.EmployeeId} already exists");
                }
            }

            var member = _mapper.Map<Member>(createDto);
            member.CreatedAt = DateTime.UtcNow;
            member.UpdatedAt = DateTime.UtcNow;

            _context.Members.Add(member);
            await _context.SaveChangesAsync();

            var memberDto = _mapper.Map<MemberDto>(member);
            return CreatedAtAction(nameof(GetMember), new { id = member.Id }, memberDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating member");
            return StatusCode(500, "An error occurred while creating the member");
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateMember(int id, UpdateMemberDto updateDto)
    {
        try
        {
            var member = await _context.Members.FindAsync(id);
            if (member == null)
            {
                return NotFound($"Member with ID {id} not found");
            }

            var existingMember = await _context.Members
                .FirstOrDefaultAsync(m => m.Email == updateDto.Email && m.Id != id);

            if (existingMember != null)
            {
                return BadRequest($"Member with email {updateDto.Email} already exists");
            }

            if (!string.IsNullOrEmpty(updateDto.StudentId))
            {
                var existingStudent = await _context.Members
                    .FirstOrDefaultAsync(m => m.StudentId == updateDto.StudentId && m.Id != id);
                if (existingStudent != null)
                {
                    return BadRequest($"Member with student ID {updateDto.StudentId} already exists");
                }
            }

            if (!string.IsNullOrEmpty(updateDto.EmployeeId))
            {
                var existingEmployee = await _context.Members
                    .FirstOrDefaultAsync(m => m.EmployeeId == updateDto.EmployeeId && m.Id != id);
                if (existingEmployee != null)
                {
                    return BadRequest($"Member with employee ID {updateDto.EmployeeId} already exists");
                }
            }

            _mapper.Map(updateDto, member);
            member.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating member {Id}", id);
            return StatusCode(500, "An error occurred while updating the member");
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteMember(int id)
    {
        try
        {
            var member = await _context.Members
                .Include(m => m.BookIssues)
                .Include(m => m.BookReservations)
                .Include(m => m.Fines)
                .FirstOrDefaultAsync(m => m.Id == id);

            if (member == null)
            {
                return NotFound($"Member with ID {id} not found");
            }

            if (member.BookIssues.Any(bi => bi.Status == "Issued") || 
                member.BookReservations.Any(br => br.Status == "Active") ||
                member.Fines.Any(f => f.Status == "Pending"))
            {
                member.Status = "Inactive";
                member.UpdatedAt = DateTime.UtcNow;
            }
            else
            {
                _context.Members.Remove(member);
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting member {Id}", id);
            return StatusCode(500, "An error occurred while deleting the member");
        }
    }

    [HttpGet("types")]
    public async Task<ActionResult<IEnumerable<string>>> GetMemberTypes()
    {
        try
        {
            var memberTypes = await _context.Members
                .Select(m => m.MemberType)
                .Distinct()
                .OrderBy(mt => mt)
                .ToListAsync();

            return Ok(memberTypes);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving member types");
            return StatusCode(500, "An error occurred while retrieving member types");
        }
    }

    [HttpGet("departments")]
    public async Task<ActionResult<IEnumerable<string>>> GetDepartments()
    {
        try
        {
            var departments = await _context.Members
                .Where(m => m.Department != null)
                .Select(m => m.Department!)
                .Distinct()
                .OrderBy(d => d)
                .ToListAsync();

            return Ok(departments);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving member departments");
            return StatusCode(500, "An error occurred while retrieving member departments");
        }
    }

    [HttpGet("{id}/issues")]
    public async Task<ActionResult<IEnumerable<BookIssueDto>>> GetMemberIssues(int id)
    {
        try
        {
            var member = await _context.Members.FindAsync(id);
            if (member == null)
            {
                return NotFound($"Member with ID {id} not found");
            }

            var issues = await _context.BookIssues
                .Include(bi => bi.Book)
                .Include(bi => bi.Member)
                .Where(bi => bi.MemberId == id)
                .OrderByDescending(bi => bi.IssueDate)
                .ToListAsync();

            var issueDtos = _mapper.Map<IEnumerable<BookIssueDto>>(issues);
            return Ok(issueDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving issues for member {Id}", id);
            return StatusCode(500, "An error occurred while retrieving the member's issues");
        }
    }

    [HttpGet("{id}/reservations")]
    public async Task<ActionResult<IEnumerable<BookReservationDto>>> GetMemberReservations(int id)
    {
        try
        {
            var member = await _context.Members.FindAsync(id);
            if (member == null)
            {
                return NotFound($"Member with ID {id} not found");
            }

            var reservations = await _context.BookReservations
                .Include(br => br.Book)
                .Include(br => br.Member)
                .Where(br => br.MemberId == id)
                .OrderByDescending(br => br.ReservationDate)
                .ToListAsync();

            var reservationDtos = _mapper.Map<IEnumerable<BookReservationDto>>(reservations);
            return Ok(reservationDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving reservations for member {Id}", id);
            return StatusCode(500, "An error occurred while retrieving the member's reservations");
        }
    }

    [HttpGet("{id}/fines")]
    public async Task<ActionResult<IEnumerable<FineDto>>> GetMemberFines(int id)
    {
        try
        {
            var member = await _context.Members.FindAsync(id);
            if (member == null)
            {
                return NotFound($"Member with ID {id} not found");
            }

            var fines = await _context.Fines
                .Include(f => f.Member)
                .Include(f => f.BookIssue)
                    .ThenInclude(bi => bi!.Book)
                .Where(f => f.MemberId == id)
                .OrderByDescending(f => f.FineDate)
                .ToListAsync();

            var fineDtos = _mapper.Map<IEnumerable<FineDto>>(fines);
            return Ok(fineDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving fines for member {Id}", id);
            return StatusCode(500, "An error occurred while retrieving the member's fines");
        }
    }

    [HttpGet("summary")]
    public async Task<ActionResult<MemberSummaryDto>> GetMemberSummary()
    {
        try
        {
            var totalMembers = await _context.Members.CountAsync();
            var activeMembers = await _context.Members.CountAsync(m => m.Status == "Active");
            var inactiveMembers = await _context.Members.CountAsync(m => m.Status == "Inactive");
            var expiredMembers = await _context.Members.CountAsync(m => m.ExpiryDate < DateTime.UtcNow);

            var membersByType = await _context.Members
                .GroupBy(m => m.MemberType)
                .Select(g => new { Type = g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.Type, x => x.Count);

            var membersByDepartment = await _context.Members
                .Where(m => m.Department != null)
                .GroupBy(m => m.Department!)
                .Select(g => new { Department = g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.Department, x => x.Count);

            var summary = new MemberSummaryDto
            {
                TotalMembers = totalMembers,
                ActiveMembers = activeMembers,
                InactiveMembers = inactiveMembers,
                ExpiredMembers = expiredMembers,
                MembersByType = membersByType,
                MembersByDepartment = membersByDepartment
            };

            return Ok(summary);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving member summary");
            return StatusCode(500, "An error occurred while retrieving the member summary");
        }
    }
}
