using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutoMapper;
using Waaed.Library.Api.Data;
using Waaed.Library.Api.Entities;
using Waaed.Library.Api.DTOs;
using Waaed.Library.Api.Extensions;

namespace Waaed.Library.Api.Controllers;

[ApiController]
[Route("api/library/[controller]")]
public class CirculationController : ControllerBase
{
    private readonly LibraryDbContext _context;
    private readonly IMapper _mapper;
    private readonly ILogger<CirculationController> _logger;
    private readonly ILibraryService _libraryService;

    public CirculationController(LibraryDbContext context, IMapper mapper, ILogger<CirculationController> logger, ILibraryService libraryService)
    {
        _context = context;
        _mapper = mapper;
        _logger = logger;
        _libraryService = libraryService;
    }

    [HttpGet("dashboard")]
    public async Task<ActionResult<Dictionary<string, object>>> GetCirculationDashboard()
    {
        try
        {
            var dashboardData = await _libraryService.GetLibraryDashboardDataAsync();
            return Ok(dashboardData);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving circulation dashboard data");
            return StatusCode(500, "An error occurred while retrieving dashboard data");
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

    [HttpGet("popular-books")]
    public async Task<ActionResult<IEnumerable<object>>> GetPopularBooks([FromQuery] int count = 10)
    {
        try
        {
            var popularBooks = await _libraryService.GetPopularBooksAsync(count);
            return Ok(popularBooks);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving popular books");
            return StatusCode(500, "An error occurred while retrieving popular books");
        }
    }

    [HttpGet("recent-additions")]
    public async Task<ActionResult<IEnumerable<object>>> GetRecentlyAddedBooks([FromQuery] int count = 10)
    {
        try
        {
            var recentBooks = await _libraryService.GetRecentlyAddedBooksAsync(count);
            return Ok(recentBooks);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving recently added books");
            return StatusCode(500, "An error occurred while retrieving recently added books");
        }
    }

    [HttpPost("process-automatic-fines")]
    public async Task<IActionResult> ProcessAutomaticFines()
    {
        try
        {
            var result = await _libraryService.ProcessAutomaticFinesAsync();
            if (result)
            {
                return Ok(new { message = "Automatic fines processed successfully" });
            }
            return BadRequest("Failed to process automatic fines");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing automatic fines");
            return StatusCode(500, "An error occurred while processing automatic fines");
        }
    }

    [HttpPost("process-expired-reservations")]
    public async Task<IActionResult> ProcessExpiredReservations()
    {
        try
        {
            var result = await _libraryService.ProcessExpiredReservationsAsync();
            if (result)
            {
                return Ok(new { message = "Expired reservations processed successfully" });
            }
            return Ok(new { message = "No expired reservations found" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing expired reservations");
            return StatusCode(500, "An error occurred while processing expired reservations");
        }
    }

    [HttpGet("member/{memberId}/activity")]
    public async Task<ActionResult<IEnumerable<object>>> GetMemberActivity(int memberId)
    {
        try
        {
            var memberExists = await _libraryService.ValidateMemberExistsAsync(memberId);
            if (!memberExists)
            {
                return NotFound($"Member with ID {memberId} not found");
            }

            var activity = await _libraryService.GetMemberActivityAsync(memberId);
            return Ok(activity);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving member activity for member {MemberId}", memberId);
            return StatusCode(500, "An error occurred while retrieving member activity");
        }
    }

    [HttpGet("book/{bookId}/history")]
    public async Task<ActionResult<IEnumerable<object>>> GetBookHistory(int bookId)
    {
        try
        {
            var bookExists = await _libraryService.ValidateBookExistsAsync(bookId);
            if (!bookExists)
            {
                return NotFound($"Book with ID {bookId} not found");
            }

            var history = await _libraryService.GetBookHistoryAsync(bookId);
            return Ok(history);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving book history for book {BookId}", bookId);
            return StatusCode(500, "An error occurred while retrieving book history");
        }
    }

    [HttpGet("availability/{bookId}")]
    public async Task<ActionResult<object>> CheckBookAvailability(int bookId)
    {
        try
        {
            var bookExists = await _libraryService.ValidateBookExistsAsync(bookId);
            if (!bookExists)
            {
                return NotFound($"Book with ID {bookId} not found");
            }

            var isAvailable = await _libraryService.IsBookAvailableAsync(bookId);
            var availableCopies = await _libraryService.GetAvailableCopiesAsync(bookId);

            return Ok(new
            {
                BookId = bookId,
                IsAvailable = isAvailable,
                AvailableCopies = availableCopies
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking book availability for book {BookId}", bookId);
            return StatusCode(500, "An error occurred while checking book availability");
        }
    }

    [HttpGet("member/{memberId}/eligibility")]
    public async Task<ActionResult<object>> CheckMemberEligibility(int memberId)
    {
        try
        {
            var memberExists = await _libraryService.ValidateMemberExistsAsync(memberId);
            if (!memberExists)
            {
                return NotFound($"Member with ID {memberId} not found");
            }

            var isEligible = await _libraryService.IsMemberEligibleForIssueAsync(memberId);
            var outstandingFines = await _libraryService.GetMemberOutstandingFinesAsync(memberId);
            var hasOverdueIssues = await _libraryService.HasOverdueIssuesAsync(memberId);

            return Ok(new
            {
                MemberId = memberId,
                IsEligible = isEligible,
                OutstandingFines = outstandingFines,
                HasOverdueIssues = hasOverdueIssues
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking member eligibility for member {MemberId}", memberId);
            return StatusCode(500, "An error occurred while checking member eligibility");
        }
    }

    [HttpGet("statistics")]
    public async Task<ActionResult<object>> GetCirculationStatistics()
    {
        try
        {
            var totalBooks = await _context.Books.CountAsync();
            var totalMembers = await _context.Members.CountAsync(m => m.Status == "Active");
            var activeIssues = await _context.BookIssues.CountAsync(bi => bi.Status == "Issued");
            var overdueIssues = await _context.BookIssues.CountAsync(bi => bi.Status == "Issued" && bi.DueDate < DateTime.UtcNow);
            var activeReservations = await _context.BookReservations.CountAsync(br => br.Status == "Active");
            var totalFines = await _context.Fines.Where(f => f.Status == "Pending").SumAsync(f => f.Amount);

            var issuesThisMonth = await _context.BookIssues
                .CountAsync(bi => bi.IssueDate >= DateTime.UtcNow.AddDays(-30));

            var returnsThisMonth = await _context.BookIssues
                .CountAsync(bi => bi.ReturnDate.HasValue && bi.ReturnDate >= DateTime.UtcNow.AddDays(-30));

            var topCategories = await _context.BookIssues
                .Include(bi => bi.Book)
                .GroupBy(bi => bi.Book.Category)
                .Select(g => new { Category = g.Key, Count = g.Count() })
                .OrderByDescending(x => x.Count)
                .Take(5)
                .ToListAsync();

            return Ok(new
            {
                TotalBooks = totalBooks,
                TotalMembers = totalMembers,
                ActiveIssues = activeIssues,
                OverdueIssues = overdueIssues,
                ActiveReservations = activeReservations,
                TotalPendingFines = totalFines,
                IssuesThisMonth = issuesThisMonth,
                ReturnsThisMonth = returnsThisMonth,
                TopCategories = topCategories
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving circulation statistics");
            return StatusCode(500, "An error occurred while retrieving circulation statistics");
        }
    }
}
