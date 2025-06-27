using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutoMapper;
using AttendancePlatform.Library.Api.Data;
using AttendancePlatform.Library.Api.Entities;
using AttendancePlatform.Library.Api.DTOs;

namespace AttendancePlatform.Library.Api.Controllers;

[ApiController]
[Route("api/library/[controller]")]
public class FinesController : ControllerBase
{
    private readonly LibraryDbContext _context;
    private readonly IMapper _mapper;
    private readonly ILogger<FinesController> _logger;

    public FinesController(LibraryDbContext context, IMapper mapper, ILogger<FinesController> logger)
    {
        _context = context;
        _mapper = mapper;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<FineDto>>> GetFines(
        [FromQuery] int? memberId = null,
        [FromQuery] string? status = null,
        [FromQuery] string? fineType = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        try
        {
            var query = _context.Fines
                .Include(f => f.Member)
                .Include(f => f.BookIssue)
                    .ThenInclude(bi => bi!.Book)
                .AsQueryable();

            if (memberId.HasValue)
            {
                query = query.Where(f => f.MemberId == memberId.Value);
            }

            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(f => f.Status == status);
            }

            if (!string.IsNullOrEmpty(fineType))
            {
                query = query.Where(f => f.FineType == fineType);
            }

            var totalCount = await query.CountAsync();
            var fines = await query
                .OrderByDescending(f => f.FineDate)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var fineDtos = _mapper.Map<IEnumerable<FineDto>>(fines);

            Response.Headers.Add("X-Total-Count", totalCount.ToString());
            Response.Headers.Add("X-Page", page.ToString());
            Response.Headers.Add("X-Page-Size", pageSize.ToString());

            return Ok(fineDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving fines");
            return StatusCode(500, "An error occurred while retrieving fines");
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<FineDto>> GetFine(int id)
    {
        try
        {
            var fine = await _context.Fines
                .Include(f => f.Member)
                .Include(f => f.BookIssue)
                    .ThenInclude(bi => bi!.Book)
                .FirstOrDefaultAsync(f => f.Id == id);

            if (fine == null)
            {
                return NotFound($"Fine with ID {id} not found");
            }

            var fineDto = _mapper.Map<FineDto>(fine);
            return Ok(fineDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving fine {Id}", id);
            return StatusCode(500, "An error occurred while retrieving the fine");
        }
    }

    [HttpPost]
    public async Task<ActionResult<FineDto>> CreateFine(CreateFineDto createDto)
    {
        try
        {
            var member = await _context.Members.FindAsync(createDto.MemberId);
            if (member == null)
            {
                return BadRequest($"Member with ID {createDto.MemberId} not found");
            }

            if (createDto.BookIssueId.HasValue)
            {
                var bookIssue = await _context.BookIssues.FindAsync(createDto.BookIssueId.Value);
                if (bookIssue == null)
                {
                    return BadRequest($"Book issue with ID {createDto.BookIssueId} not found");
                }
            }

            var fine = _mapper.Map<Fine>(createDto);
            fine.CreatedAt = DateTime.UtcNow;
            fine.UpdatedAt = DateTime.UtcNow;

            member.OutstandingFines = (member.OutstandingFines ?? 0) + createDto.Amount;
            member.UpdatedAt = DateTime.UtcNow;

            _context.Fines.Add(fine);
            await _context.SaveChangesAsync();

            var fineDto = _mapper.Map<FineDto>(fine);
            return CreatedAtAction(nameof(GetFine), new { id = fine.Id }, fineDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating fine");
            return StatusCode(500, "An error occurred while creating the fine");
        }
    }

    [HttpPost("{id}/pay")]
    public async Task<IActionResult> PayFine(int id, PayFineDto payDto)
    {
        try
        {
            var fine = await _context.Fines
                .Include(f => f.Member)
                .FirstOrDefaultAsync(f => f.Id == id);

            if (fine == null)
            {
                return NotFound($"Fine with ID {id} not found");
            }

            if (fine.Status != "Pending")
            {
                return BadRequest("Fine is not in pending status");
            }

            var amountToPay = payDto.AmountPaid ?? fine.Amount;

            if (amountToPay > fine.Amount)
            {
                return BadRequest("Payment amount cannot exceed fine amount");
            }

            fine.Status = amountToPay >= fine.Amount ? "Paid" : "Partial";
            fine.PaidDate = DateTime.UtcNow;
            fine.PaymentMethod = payDto.PaymentMethod;
            fine.TransactionId = payDto.TransactionId;
            fine.UpdatedAt = DateTime.UtcNow;

            fine.Member.OutstandingFines = Math.Max(0, (fine.Member.OutstandingFines ?? 0) - amountToPay);
            fine.Member.UpdatedAt = DateTime.UtcNow;

            if (amountToPay < fine.Amount)
            {
                var remainingFine = new Fine
                {
                    MemberId = fine.MemberId,
                    BookIssueId = fine.BookIssueId,
                    FineType = fine.FineType,
                    Amount = fine.Amount - amountToPay,
                    Description = $"Remaining amount from fine #{fine.Id}",
                    FineDate = DateTime.UtcNow,
                    Status = "Pending",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.Fines.Add(remainingFine);
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error paying fine {Id}", id);
            return StatusCode(500, "An error occurred while processing the fine payment");
        }
    }

    [HttpPost("{id}/waive")]
    public async Task<IActionResult> WaiveFine(int id, [FromBody] string? reason = null)
    {
        try
        {
            var fine = await _context.Fines
                .Include(f => f.Member)
                .FirstOrDefaultAsync(f => f.Id == id);

            if (fine == null)
            {
                return NotFound($"Fine with ID {id} not found");
            }

            if (fine.Status != "Pending")
            {
                return BadRequest("Fine is not in pending status");
            }

            fine.Status = "Waived";
            fine.PaidDate = DateTime.UtcNow;
            fine.PaymentMethod = "Waived";
            fine.Description = (fine.Description ?? "") + $"\nWaived: {reason ?? "No reason provided"}";
            fine.UpdatedAt = DateTime.UtcNow;

            fine.Member.OutstandingFines = Math.Max(0, (fine.Member.OutstandingFines ?? 0) - fine.Amount);
            fine.Member.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error waiving fine {Id}", id);
            return StatusCode(500, "An error occurred while waiving the fine");
        }
    }

    [HttpGet("pending")]
    public async Task<ActionResult<IEnumerable<FineDto>>> GetPendingFines()
    {
        try
        {
            var pendingFines = await _context.Fines
                .Include(f => f.Member)
                .Include(f => f.BookIssue)
                    .ThenInclude(bi => bi!.Book)
                .Where(f => f.Status == "Pending")
                .OrderByDescending(f => f.FineDate)
                .ToListAsync();

            var fineDtos = _mapper.Map<IEnumerable<FineDto>>(pendingFines);
            return Ok(fineDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving pending fines");
            return StatusCode(500, "An error occurred while retrieving pending fines");
        }
    }

    [HttpGet("summary")]
    public async Task<ActionResult<FineSummaryDto>> GetFineSummary()
    {
        try
        {
            var totalFines = await _context.Fines.CountAsync();
            var pendingFines = await _context.Fines.CountAsync(f => f.Status == "Pending");
            var paidFines = await _context.Fines.CountAsync(f => f.Status == "Paid");
            var waivedFines = await _context.Fines.CountAsync(f => f.Status == "Waived");

            var totalAmount = await _context.Fines.SumAsync(f => f.Amount);
            var pendingAmount = await _context.Fines.Where(f => f.Status == "Pending").SumAsync(f => f.Amount);
            var paidAmount = await _context.Fines.Where(f => f.Status == "Paid").SumAsync(f => f.Amount);
            var waivedAmount = await _context.Fines.Where(f => f.Status == "Waived").SumAsync(f => f.Amount);

            var finesByType = await _context.Fines
                .GroupBy(f => f.FineType)
                .Select(g => new { Type = g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.Type, x => x.Count);

            var amountByType = await _context.Fines
                .GroupBy(f => f.FineType)
                .Select(g => new { Type = g.Key, Amount = g.Sum(f => f.Amount) })
                .ToDictionaryAsync(x => x.Type, x => x.Amount);

            var summary = new FineSummaryDto
            {
                TotalFines = totalFines,
                PendingFines = pendingFines,
                PaidFines = paidFines,
                WaivedFines = waivedFines,
                TotalAmount = totalAmount,
                PendingAmount = pendingAmount,
                PaidAmount = paidAmount,
                WaivedAmount = waivedAmount,
                FinesByType = finesByType,
                AmountByType = amountByType
            };

            return Ok(summary);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving fine summary");
            return StatusCode(500, "An error occurred while retrieving the fine summary");
        }
    }
}
