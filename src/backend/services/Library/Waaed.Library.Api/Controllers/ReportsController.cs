using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AttendancePlatform.Library.Api.Data;

namespace AttendancePlatform.Library.Api.Controllers;

[ApiController]
[Route("api/library/[controller]")]
public class ReportsController : ControllerBase
{
    private readonly LibraryDbContext _context;
    private readonly ILogger<ReportsController> _logger;

    public ReportsController(LibraryDbContext context, ILogger<ReportsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet("circulation-summary")]
    public async Task<ActionResult<object>> GetCirculationSummary(
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        try
        {
            var start = startDate ?? DateTime.UtcNow.AddDays(-30);
            var end = endDate ?? DateTime.UtcNow;

            var totalIssues = await _context.BookIssues
                .CountAsync(bi => bi.IssueDate >= start && bi.IssueDate <= end);

            var totalReturns = await _context.BookIssues
                .CountAsync(bi => bi.ReturnDate.HasValue && bi.ReturnDate >= start && bi.ReturnDate <= end);

            var overdueBooks = await _context.BookIssues
                .CountAsync(bi => bi.Status == "Issued" && bi.DueDate < DateTime.UtcNow);

            var activeReservations = await _context.BookReservations
                .CountAsync(br => br.Status == "Active");

            var totalFinesCollected = await _context.Fines
                .Where(f => f.Status == "Paid" && f.PaidDate >= start && f.PaidDate <= end)
                .SumAsync(f => f.Amount);

            return Ok(new
            {
                Period = new { StartDate = start, EndDate = end },
                TotalIssues = totalIssues,
                TotalReturns = totalReturns,
                OverdueBooks = overdueBooks,
                ActiveReservations = activeReservations,
                TotalFinesCollected = totalFinesCollected
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating circulation summary report");
            return StatusCode(500, "An error occurred while generating the circulation summary report");
        }
    }

    [HttpGet("popular-books")]
    public async Task<ActionResult<IEnumerable<object>>> GetPopularBooksReport(
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        [FromQuery] int limit = 20)
    {
        try
        {
            var start = startDate ?? DateTime.UtcNow.AddDays(-90);
            var end = endDate ?? DateTime.UtcNow;

            var popularBooks = await _context.BookIssues
                .Include(bi => bi.Book)
                .Where(bi => bi.IssueDate >= start && bi.IssueDate <= end)
                .GroupBy(bi => new { bi.BookId, bi.Book.Title, bi.Book.Author, bi.Book.Category })
                .Select(g => new
                {
                    BookId = g.Key.BookId,
                    Title = g.Key.Title,
                    Author = g.Key.Author,
                    Category = g.Key.Category,
                    IssueCount = g.Count(),
                    LastIssued = g.Max(bi => bi.IssueDate)
                })
                .OrderByDescending(x => x.IssueCount)
                .Take(limit)
                .ToListAsync();

            return Ok(popularBooks);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating popular books report");
            return StatusCode(500, "An error occurred while generating the popular books report");
        }
    }

    [HttpGet("member-activity")]
    public async Task<ActionResult<IEnumerable<object>>> GetMemberActivityReport(
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        [FromQuery] int limit = 50)
    {
        try
        {
            var start = startDate ?? DateTime.UtcNow.AddDays(-30);
            var end = endDate ?? DateTime.UtcNow;

            var memberActivity = await _context.BookIssues
                .Include(bi => bi.Member)
                .Where(bi => bi.IssueDate >= start && bi.IssueDate <= end)
                .GroupBy(bi => new { bi.MemberId, bi.Member.FirstName, bi.Member.LastName, bi.Member.MembershipId, bi.Member.MemberType })
                .Select(g => new
                {
                    MemberId = g.Key.MemberId,
                    MemberName = $"{g.Key.FirstName} {g.Key.LastName}",
                    MembershipId = g.Key.MembershipId,
                    MemberType = g.Key.MemberType,
                    TotalIssues = g.Count(),
                    BooksReturned = g.Count(bi => bi.ReturnDate.HasValue),
                    OverdueBooks = g.Count(bi => bi.Status == "Issued" && bi.DueDate < DateTime.UtcNow),
                    LastActivity = g.Max(bi => bi.IssueDate)
                })
                .OrderByDescending(x => x.TotalIssues)
                .Take(limit)
                .ToListAsync();

            return Ok(memberActivity);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating member activity report");
            return StatusCode(500, "An error occurred while generating the member activity report");
        }
    }

    [HttpGet("overdue-report")]
    public async Task<ActionResult<IEnumerable<object>>> GetOverdueReport()
    {
        try
        {
            var overdueBooks = await _context.BookIssues
                .Include(bi => bi.Book)
                .Include(bi => bi.Member)
                .Where(bi => bi.Status == "Issued" && bi.DueDate < DateTime.UtcNow)
                .Select(bi => new
                {
                    IssueId = bi.Id,
                    BookTitle = bi.Book.Title,
                    BookAuthor = bi.Book.Author,
                    MemberName = $"{bi.Member.FirstName} {bi.Member.LastName}",
                    MembershipId = bi.Member.MembershipId,
                    MemberType = bi.Member.MemberType,
                    IssueDate = bi.IssueDate,
                    DueDate = bi.DueDate,
                    DaysOverdue = (int)(DateTime.UtcNow - bi.DueDate).TotalDays,
                    FineAmount = bi.FineAmount,
                    MemberContact = bi.Member.Email
                })
                .OrderBy(x => x.DueDate)
                .ToListAsync();

            return Ok(overdueBooks);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating overdue report");
            return StatusCode(500, "An error occurred while generating the overdue report");
        }
    }

    [HttpGet("fine-collection")]
    public async Task<ActionResult<object>> GetFineCollectionReport(
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        try
        {
            var start = startDate ?? DateTime.UtcNow.AddDays(-30);
            var end = endDate ?? DateTime.UtcNow;

            var finesSummary = await _context.Fines
                .Where(f => f.FineDate >= start && f.FineDate <= end)
                .GroupBy(f => f.Status)
                .Select(g => new
                {
                    Status = g.Key,
                    Count = g.Count(),
                    TotalAmount = g.Sum(f => f.Amount)
                })
                .ToListAsync();

            var finesByType = await _context.Fines
                .Where(f => f.FineDate >= start && f.FineDate <= end)
                .GroupBy(f => f.FineType)
                .Select(g => new
                {
                    FineType = g.Key,
                    Count = g.Count(),
                    TotalAmount = g.Sum(f => f.Amount)
                })
                .ToListAsync();

            var totalFinesGenerated = await _context.Fines
                .Where(f => f.FineDate >= start && f.FineDate <= end)
                .SumAsync(f => f.Amount);

            var totalFinesCollected = await _context.Fines
                .Where(f => f.Status == "Paid" && f.PaidDate >= start && f.PaidDate <= end)
                .SumAsync(f => f.Amount);

            return Ok(new
            {
                Period = new { StartDate = start, EndDate = end },
                TotalFinesGenerated = totalFinesGenerated,
                TotalFinesCollected = totalFinesCollected,
                CollectionRate = totalFinesGenerated > 0 ? (totalFinesCollected / totalFinesGenerated) * 100 : 0,
                FinesByStatus = finesSummary,
                FinesByType = finesByType
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating fine collection report");
            return StatusCode(500, "An error occurred while generating the fine collection report");
        }
    }

    [HttpGet("inventory-status")]
    public async Task<ActionResult<object>> GetInventoryStatusReport()
    {
        try
        {
            var totalBooks = await _context.Books.CountAsync();
            var availableBooks = await _context.Books.SumAsync(b => b.AvailableCopies);
            var issuedBooks = await _context.Books.SumAsync(b => b.TotalCopies - b.AvailableCopies);

            var booksByCategory = await _context.Books
                .GroupBy(b => b.Category)
                .Select(g => new
                {
                    Category = g.Key,
                    TotalBooks = g.Count(),
                    TotalCopies = g.Sum(b => b.TotalCopies),
                    AvailableCopies = g.Sum(b => b.AvailableCopies),
                    IssuedCopies = g.Sum(b => b.TotalCopies - b.AvailableCopies)
                })
                .OrderByDescending(x => x.TotalBooks)
                .ToListAsync();

            var lowStockBooks = await _context.Books
                .Where(b => b.AvailableCopies <= 2)
                .Select(b => new
                {
                    b.Id,
                    b.Title,
                    b.Author,
                    b.Category,
                    b.TotalCopies,
                    b.AvailableCopies
                })
                .OrderBy(b => b.AvailableCopies)
                .ToListAsync();

            return Ok(new
            {
                TotalUniqueBooks = totalBooks,
                TotalAvailableCopies = availableBooks,
                TotalIssuedCopies = issuedBooks,
                BooksByCategory = booksByCategory,
                LowStockBooks = lowStockBooks
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating inventory status report");
            return StatusCode(500, "An error occurred while generating the inventory status report");
        }
    }

    [HttpGet("monthly-statistics")]
    public async Task<ActionResult<IEnumerable<object>>> GetMonthlyStatistics([FromQuery] int months = 12)
    {
        try
        {
            var monthlyStats = new List<object>();
            var currentDate = DateTime.UtcNow;

            for (int i = 0; i < months; i++)
            {
                var monthStart = new DateTime(currentDate.Year, currentDate.Month, 1).AddMonths(-i);
                var monthEnd = monthStart.AddMonths(1).AddDays(-1);

                var issues = await _context.BookIssues
                    .CountAsync(bi => bi.IssueDate >= monthStart && bi.IssueDate <= monthEnd);

                var returns = await _context.BookIssues
                    .CountAsync(bi => bi.ReturnDate.HasValue && bi.ReturnDate >= monthStart && bi.ReturnDate <= monthEnd);

                var newMembers = await _context.Members
                    .CountAsync(m => m.JoinDate >= monthStart && m.JoinDate <= monthEnd);

                var finesCollected = await _context.Fines
                    .Where(f => f.Status == "Paid" && f.PaidDate >= monthStart && f.PaidDate <= monthEnd)
                    .SumAsync(f => f.Amount);

                monthlyStats.Add(new
                {
                    Month = monthStart.ToString("yyyy-MM"),
                    MonthName = monthStart.ToString("MMMM yyyy"),
                    Issues = issues,
                    Returns = returns,
                    NewMembers = newMembers,
                    FinesCollected = finesCollected
                });
            }

            return Ok(monthlyStats.OrderBy(x => ((dynamic)x).Month));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating monthly statistics report");
            return StatusCode(500, "An error occurred while generating the monthly statistics report");
        }
    }
}
