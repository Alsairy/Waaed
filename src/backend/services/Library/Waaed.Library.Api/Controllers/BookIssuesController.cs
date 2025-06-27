using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutoMapper;
using AttendancePlatform.Library.Api.Data;
using AttendancePlatform.Library.Api.Entities;
using AttendancePlatform.Library.Api.DTOs;

namespace AttendancePlatform.Library.Api.Controllers;

[ApiController]
[Route("api/library/[controller]")]
public class BookIssuesController : ControllerBase
{
    private readonly LibraryDbContext _context;
    private readonly IMapper _mapper;
    private readonly ILogger<BookIssuesController> _logger;

    public BookIssuesController(LibraryDbContext context, IMapper mapper, ILogger<BookIssuesController> logger)
    {
        _context = context;
        _mapper = mapper;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<BookIssueDto>>> GetBookIssues(
        [FromQuery] int? bookId = null,
        [FromQuery] int? memberId = null,
        [FromQuery] string? status = null,
        [FromQuery] DateTime? issueDateFrom = null,
        [FromQuery] DateTime? issueDateTo = null,
        [FromQuery] DateTime? dueDateFrom = null,
        [FromQuery] DateTime? dueDateTo = null,
        [FromQuery] bool? overdueOnly = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        try
        {
            var query = _context.BookIssues
                .Include(bi => bi.Book)
                .Include(bi => bi.Member)
                .AsQueryable();

            if (bookId.HasValue)
            {
                query = query.Where(bi => bi.BookId == bookId.Value);
            }

            if (memberId.HasValue)
            {
                query = query.Where(bi => bi.MemberId == memberId.Value);
            }

            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(bi => bi.Status == status);
            }

            if (issueDateFrom.HasValue)
            {
                query = query.Where(bi => bi.IssueDate >= issueDateFrom.Value);
            }

            if (issueDateTo.HasValue)
            {
                query = query.Where(bi => bi.IssueDate <= issueDateTo.Value);
            }

            if (dueDateFrom.HasValue)
            {
                query = query.Where(bi => bi.DueDate >= dueDateFrom.Value);
            }

            if (dueDateTo.HasValue)
            {
                query = query.Where(bi => bi.DueDate <= dueDateTo.Value);
            }

            if (overdueOnly == true)
            {
                query = query.Where(bi => bi.Status == "Issued" && bi.DueDate < DateTime.UtcNow);
            }

            var totalCount = await query.CountAsync();
            var issues = await query
                .OrderByDescending(bi => bi.IssueDate)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var issueDtos = _mapper.Map<IEnumerable<BookIssueDto>>(issues);

            Response.Headers.Add("X-Total-Count", totalCount.ToString());
            Response.Headers.Add("X-Page", page.ToString());
            Response.Headers.Add("X-Page-Size", pageSize.ToString());

            return Ok(issueDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving book issues");
            return StatusCode(500, "An error occurred while retrieving book issues");
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<BookIssueDto>> GetBookIssue(int id)
    {
        try
        {
            var issue = await _context.BookIssues
                .Include(bi => bi.Book)
                .Include(bi => bi.Member)
                .FirstOrDefaultAsync(bi => bi.Id == id);

            if (issue == null)
            {
                return NotFound($"Book issue with ID {id} not found");
            }

            var issueDto = _mapper.Map<BookIssueDto>(issue);
            return Ok(issueDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving book issue {Id}", id);
            return StatusCode(500, "An error occurred while retrieving the book issue");
        }
    }

    [HttpPost]
    public async Task<ActionResult<BookIssueDto>> IssueBook(CreateBookIssueDto createDto)
    {
        try
        {
            var book = await _context.Books.FindAsync(createDto.BookId);
            if (book == null)
            {
                return BadRequest($"Book with ID {createDto.BookId} not found");
            }

            var member = await _context.Members.FindAsync(createDto.MemberId);
            if (member == null)
            {
                return BadRequest($"Member with ID {createDto.MemberId} not found");
            }

            if (member.Status != "Active")
            {
                return BadRequest("Member is not active");
            }

            if (book.AvailableCopies <= 0)
            {
                return BadRequest("No available copies of this book");
            }

            if (member.CurrentBooksIssued >= member.MaxBooksAllowed)
            {
                return BadRequest($"Member has reached maximum book limit ({member.MaxBooksAllowed})");
            }

            if (member.OutstandingFines > 0)
            {
                return BadRequest("Member has outstanding fines that must be paid before issuing new books");
            }

            var existingIssue = await _context.BookIssues
                .FirstOrDefaultAsync(bi => bi.BookId == createDto.BookId && 
                                          bi.MemberId == createDto.MemberId && 
                                          bi.Status == "Issued");

            if (existingIssue != null)
            {
                return BadRequest("Member already has this book issued");
            }

            var bookIssue = _mapper.Map<BookIssue>(createDto);
            bookIssue.CreatedAt = DateTime.UtcNow;
            bookIssue.UpdatedAt = DateTime.UtcNow;

            book.AvailableCopies--;
            book.IssuedCopies++;
            book.UpdatedAt = DateTime.UtcNow;

            member.CurrentBooksIssued++;
            member.UpdatedAt = DateTime.UtcNow;

            _context.BookIssues.Add(bookIssue);
            await _context.SaveChangesAsync();

            var issueDto = _mapper.Map<BookIssueDto>(bookIssue);
            return CreatedAtAction(nameof(GetBookIssue), new { id = bookIssue.Id }, issueDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error issuing book");
            return StatusCode(500, "An error occurred while issuing the book");
        }
    }

    [HttpPost("{id}/return")]
    public async Task<IActionResult> ReturnBook(int id, ReturnBookDto returnDto)
    {
        try
        {
            var issue = await _context.BookIssues
                .Include(bi => bi.Book)
                .Include(bi => bi.Member)
                .FirstOrDefaultAsync(bi => bi.Id == id);

            if (issue == null)
            {
                return NotFound($"Book issue with ID {id} not found");
            }

            if (issue.Status != "Issued")
            {
                return BadRequest("Book is not currently issued");
            }

            issue.ReturnDate = DateTime.UtcNow;
            issue.Status = "Returned";
            issue.ReturnedById = returnDto.ReturnedById;
            issue.ReturnNotes = returnDto.ReturnNotes;
            issue.UpdatedAt = DateTime.UtcNow;

            if (returnDto.FineAmount.HasValue && returnDto.FineAmount > 0)
            {
                issue.FineAmount = returnDto.FineAmount;

                var fine = new Fine
                {
                    MemberId = issue.MemberId,
                    BookIssueId = issue.Id,
                    FineType = "Late Return",
                    Amount = returnDto.FineAmount.Value,
                    Description = $"Late return fine for book: {issue.Book.Title}",
                    FineDate = DateTime.UtcNow,
                    Status = "Pending",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.Fines.Add(fine);
                issue.Member.OutstandingFines = (issue.Member.OutstandingFines ?? 0) + returnDto.FineAmount.Value;
            }

            issue.Book.AvailableCopies++;
            issue.Book.IssuedCopies--;
            issue.Book.UpdatedAt = DateTime.UtcNow;

            issue.Member.CurrentBooksIssued--;
            issue.Member.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error returning book {Id}", id);
            return StatusCode(500, "An error occurred while returning the book");
        }
    }

    [HttpPost("{id}/renew")]
    public async Task<IActionResult> RenewBook(int id, RenewBookDto renewDto)
    {
        try
        {
            var issue = await _context.BookIssues
                .Include(bi => bi.Book)
                .Include(bi => bi.Member)
                .FirstOrDefaultAsync(bi => bi.Id == id);

            if (issue == null)
            {
                return NotFound($"Book issue with ID {id} not found");
            }

            if (issue.Status != "Issued")
            {
                return BadRequest("Book is not currently issued");
            }

            if (issue.RenewalCount >= 2)
            {
                return BadRequest("Maximum renewal limit reached");
            }

            var hasReservation = await _context.BookReservations
                .AnyAsync(br => br.BookId == issue.BookId && br.Status == "Active");

            if (hasReservation)
            {
                return BadRequest("Book has active reservations and cannot be renewed");
            }

            if (issue.Member.OutstandingFines > 0)
            {
                return BadRequest("Member has outstanding fines and cannot renew books");
            }

            issue.DueDate = renewDto.NewDueDate;
            issue.IsRenewed = true;
            issue.RenewalCount++;
            issue.UpdatedAt = DateTime.UtcNow;

            if (!string.IsNullOrEmpty(renewDto.RenewalNotes))
            {
                issue.IssueNotes = (issue.IssueNotes ?? "") + $"\nRenewal {issue.RenewalCount}: {renewDto.RenewalNotes}";
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error renewing book {Id}", id);
            return StatusCode(500, "An error occurred while renewing the book");
        }
    }

    [HttpGet("overdue")]
    public async Task<ActionResult<IEnumerable<BookIssueDto>>> GetOverdueBooks()
    {
        try
        {
            var overdueIssues = await _context.BookIssues
                .Include(bi => bi.Book)
                .Include(bi => bi.Member)
                .Where(bi => bi.Status == "Issued" && bi.DueDate < DateTime.UtcNow)
                .OrderBy(bi => bi.DueDate)
                .ToListAsync();

            var issueDtos = _mapper.Map<IEnumerable<BookIssueDto>>(overdueIssues);
            return Ok(issueDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving overdue books");
            return StatusCode(500, "An error occurred while retrieving overdue books");
        }
    }

    [HttpGet("summary")]
    public async Task<ActionResult<BookIssueSummaryDto>> GetBookIssueSummary()
    {
        try
        {
            var totalIssues = await _context.BookIssues.CountAsync();
            var activeIssues = await _context.BookIssues.CountAsync(bi => bi.Status == "Issued");
            var returnedIssues = await _context.BookIssues.CountAsync(bi => bi.Status == "Returned");
            var overdueIssues = await _context.BookIssues.CountAsync(bi => bi.Status == "Issued" && bi.DueDate < DateTime.UtcNow);
            var renewedIssues = await _context.BookIssues.CountAsync(bi => bi.IsRenewed);
            var totalFines = await _context.BookIssues.Where(bi => bi.FineAmount.HasValue).SumAsync(bi => bi.FineAmount!.Value);

            var issuesByStatus = await _context.BookIssues
                .GroupBy(bi => bi.Status)
                .Select(g => new { Status = g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.Status, x => x.Count);

            var issuesByMemberType = await _context.BookIssues
                .Include(bi => bi.Member)
                .GroupBy(bi => bi.Member.MemberType)
                .Select(g => new { MemberType = g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.MemberType, x => x.Count);

            var summary = new BookIssueSummaryDto
            {
                TotalIssues = totalIssues,
                ActiveIssues = activeIssues,
                ReturnedIssues = returnedIssues,
                OverdueIssues = overdueIssues,
                RenewedIssues = renewedIssues,
                TotalFines = totalFines,
                IssuesByStatus = issuesByStatus,
                IssuesByMemberType = issuesByMemberType
            };

            return Ok(summary);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving book issue summary");
            return StatusCode(500, "An error occurred while retrieving the book issue summary");
        }
    }
}
