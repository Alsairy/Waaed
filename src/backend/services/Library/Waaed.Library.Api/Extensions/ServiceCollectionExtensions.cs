using Microsoft.EntityFrameworkCore;
using AttendancePlatform.Library.Api.Data;
using AttendancePlatform.Library.Api.Entities;
using System.Reflection;

namespace AttendancePlatform.Library.Api.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddLibraryServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<LibraryDbContext>(options =>
        {
            var connectionString = configuration.GetConnectionString("DefaultConnection");
            options.UseSqlite(connectionString);
        });

        services.AddAutoMapper(Assembly.GetExecutingAssembly());

        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(Assembly.GetExecutingAssembly()));

        services.AddScoped<ILibraryService, LibraryService>();

        return services;
    }
}

public interface ILibraryService
{
    Task<bool> ValidateBookExistsAsync(int bookId);
    Task<bool> ValidateMemberExistsAsync(int memberId);
    Task<bool> CanIssueBookAsync(int bookId, int memberId);
    Task<bool> CanReserveBookAsync(int bookId, int memberId);
    Task<decimal> CalculateOverdueFineAsync(int bookIssueId);
    Task<bool> HasOverdueIssuesAsync(int memberId);
    Task<List<int>> GetExpiredReservationsAsync();
    Task<List<int>> GetOverdueIssuesAsync();
    Task<bool> IsBookAvailableAsync(int bookId);
    Task<int> GetAvailableCopiesAsync(int bookId);
    Task<bool> CanRenewBookAsync(int bookIssueId);
    Task<decimal> GetMemberOutstandingFinesAsync(int memberId);
    Task<bool> IsMemberEligibleForIssueAsync(int memberId);
    Task<List<object>> GetPopularBooksAsync(int count = 10);
    Task<List<object>> GetRecentlyAddedBooksAsync(int count = 10);
    Task<Dictionary<string, object>> GetLibraryDashboardDataAsync();
    Task<bool> ProcessAutomaticFinesAsync();
    Task<bool> ProcessExpiredReservationsAsync();
    Task<List<object>> GetMemberActivityAsync(int memberId);
    Task<List<object>> GetBookHistoryAsync(int bookId);
}

public class LibraryService : ILibraryService
{
    private readonly LibraryDbContext _context;

    public LibraryService(LibraryDbContext context)
    {
        _context = context;
    }

    public async Task<bool> ValidateBookExistsAsync(int bookId)
    {
        return await _context.Books.AnyAsync(b => b.Id == bookId);
    }

    public async Task<bool> ValidateMemberExistsAsync(int memberId)
    {
        return await _context.Members.AnyAsync(m => m.Id == memberId && m.Status == "Active");
    }

    public async Task<bool> CanIssueBookAsync(int bookId, int memberId)
    {
        var book = await _context.Books.FindAsync(bookId);
        var member = await _context.Members.FindAsync(memberId);

        if (book == null || member == null || member.Status != "Active")
            return false;

        if (book.AvailableCopies <= 0)
            return false;

        if (member.CurrentBooksIssued >= member.MaxBooksAllowed)
            return false;

        if (member.OutstandingFines > 0)
            return false;

        var existingIssue = await _context.BookIssues
            .AnyAsync(bi => bi.BookId == bookId && bi.MemberId == memberId && bi.Status == "Issued");

        return !existingIssue;
    }

    public async Task<bool> CanReserveBookAsync(int bookId, int memberId)
    {
        var book = await _context.Books.FindAsync(bookId);
        var member = await _context.Members.FindAsync(memberId);

        if (book == null || member == null || member.Status != "Active")
            return false;

        if (book.AvailableCopies > 0)
            return false;

        var existingReservation = await _context.BookReservations
            .AnyAsync(br => br.BookId == bookId && br.MemberId == memberId && br.Status == "Active");

        var existingIssue = await _context.BookIssues
            .AnyAsync(bi => bi.BookId == bookId && bi.MemberId == memberId && bi.Status == "Issued");

        return !existingReservation && !existingIssue;
    }

    public async Task<decimal> CalculateOverdueFineAsync(int bookIssueId)
    {
        var issue = await _context.BookIssues.FindAsync(bookIssueId);
        if (issue == null || issue.Status != "Issued" || issue.DueDate >= DateTime.UtcNow)
            return 0;

        var overdueDays = (DateTime.UtcNow - issue.DueDate).Days;
        var finePerDay = 1.0m; // $1 per day
        return overdueDays * finePerDay;
    }

    public async Task<bool> HasOverdueIssuesAsync(int memberId)
    {
        return await _context.BookIssues
            .AnyAsync(bi => bi.MemberId == memberId && bi.Status == "Issued" && bi.DueDate < DateTime.UtcNow);
    }

    public async Task<List<int>> GetExpiredReservationsAsync()
    {
        return await _context.BookReservations
            .Where(br => br.Status == "Active" && br.ExpiryDate < DateTime.UtcNow)
            .Select(br => br.Id)
            .ToListAsync();
    }

    public async Task<List<int>> GetOverdueIssuesAsync()
    {
        return await _context.BookIssues
            .Where(bi => bi.Status == "Issued" && bi.DueDate < DateTime.UtcNow)
            .Select(bi => bi.Id)
            .ToListAsync();
    }

    public async Task<bool> IsBookAvailableAsync(int bookId)
    {
        var book = await _context.Books.FindAsync(bookId);
        return book?.AvailableCopies > 0;
    }

    public async Task<int> GetAvailableCopiesAsync(int bookId)
    {
        var book = await _context.Books.FindAsync(bookId);
        return book?.AvailableCopies ?? 0;
    }

    public async Task<bool> CanRenewBookAsync(int bookIssueId)
    {
        var issue = await _context.BookIssues
            .Include(bi => bi.Book)
            .Include(bi => bi.Member)
            .FirstOrDefaultAsync(bi => bi.Id == bookIssueId);

        if (issue == null || issue.Status != "Issued")
            return false;

        if (issue.RenewalCount >= 2)
            return false;

        if (issue.Member.OutstandingFines > 0)
            return false;

        var hasReservation = await _context.BookReservations
            .AnyAsync(br => br.BookId == issue.BookId && br.Status == "Active");

        return !hasReservation;
    }

    public async Task<decimal> GetMemberOutstandingFinesAsync(int memberId)
    {
        return await _context.Fines
            .Where(f => f.MemberId == memberId && f.Status == "Pending")
            .SumAsync(f => f.Amount);
    }

    public async Task<bool> IsMemberEligibleForIssueAsync(int memberId)
    {
        var member = await _context.Members.FindAsync(memberId);
        if (member == null || member.Status != "Active")
            return false;

        if (member.ExpiryDate.HasValue && member.ExpiryDate < DateTime.UtcNow)
            return false;

        if (member.CurrentBooksIssued >= member.MaxBooksAllowed)
            return false;

        if (member.OutstandingFines > 0)
            return false;

        return true;
    }

    public async Task<List<object>> GetPopularBooksAsync(int count = 10)
    {
        return await _context.BookIssues
            .Include(bi => bi.Book)
            .GroupBy(bi => bi.BookId)
            .Select(g => new
            {
                BookId = g.Key,
                Title = g.First().Book.Title,
                Author = g.First().Book.Author,
                IssueCount = g.Count()
            })
            .OrderByDescending(x => x.IssueCount)
            .Take(count)
            .Cast<object>()
            .ToListAsync();
    }

    public async Task<List<object>> GetRecentlyAddedBooksAsync(int count = 10)
    {
        return await _context.Books
            .OrderByDescending(b => b.CreatedAt)
            .Take(count)
            .Select(b => new
            {
                b.Id,
                b.Title,
                b.Author,
                b.Category,
                b.CreatedAt
            })
            .Cast<object>()
            .ToListAsync();
    }

    public async Task<Dictionary<string, object>> GetLibraryDashboardDataAsync()
    {
        var totalBooks = await _context.Books.CountAsync();
        var totalMembers = await _context.Members.CountAsync(m => m.Status == "Active");
        var activeIssues = await _context.BookIssues.CountAsync(bi => bi.Status == "Issued");
        var overdueIssues = await _context.BookIssues.CountAsync(bi => bi.Status == "Issued" && bi.DueDate < DateTime.UtcNow);
        var activeReservations = await _context.BookReservations.CountAsync(br => br.Status == "Active");
        var pendingFines = await _context.Fines.Where(f => f.Status == "Pending").SumAsync(f => f.Amount);

        return new Dictionary<string, object>
        {
            ["totalBooks"] = totalBooks,
            ["totalMembers"] = totalMembers,
            ["activeIssues"] = activeIssues,
            ["overdueIssues"] = overdueIssues,
            ["activeReservations"] = activeReservations,
            ["pendingFines"] = pendingFines
        };
    }

    public async Task<bool> ProcessAutomaticFinesAsync()
    {
        var overdueIssues = await _context.BookIssues
            .Include(bi => bi.Member)
            .Where(bi => bi.Status == "Issued" && bi.DueDate < DateTime.UtcNow && bi.FineAmount == null)
            .ToListAsync();

        foreach (var issue in overdueIssues)
        {
            var fineAmount = await CalculateOverdueFineAsync(issue.Id);
            if (fineAmount > 0)
            {
                var fine = new Fine
                {
                    MemberId = issue.MemberId,
                    BookIssueId = issue.Id,
                    FineType = "Late Return",
                    Amount = fineAmount,
                    Description = $"Automatic fine for overdue book: {issue.Book?.Title}",
                    FineDate = DateTime.UtcNow,
                    Status = "Pending",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.Fines.Add(fine);
                issue.FineAmount = fineAmount;
                issue.Member.OutstandingFines = (issue.Member.OutstandingFines ?? 0) + fineAmount;
            }
        }

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ProcessExpiredReservationsAsync()
    {
        var expiredReservations = await _context.BookReservations
            .Include(br => br.Book)
            .Where(br => br.Status == "Active" && br.ExpiryDate < DateTime.UtcNow)
            .ToListAsync();

        foreach (var reservation in expiredReservations)
        {
            reservation.Status = "Expired";
            reservation.UpdatedAt = DateTime.UtcNow;
            reservation.Book.ReservedCopies--;
            reservation.Book.UpdatedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();
        return expiredReservations.Any();
    }

    public async Task<List<object>> GetMemberActivityAsync(int memberId)
    {
        var issues = await _context.BookIssues
            .Include(bi => bi.Book)
            .Where(bi => bi.MemberId == memberId)
            .OrderByDescending(bi => bi.IssueDate)
            .Take(20)
            .Select(bi => new
            {
                Type = "Issue",
                BookTitle = bi.Book.Title,
                Date = bi.IssueDate,
                Status = bi.Status,
                DueDate = bi.DueDate,
                ReturnDate = bi.ReturnDate
            })
            .Cast<object>()
            .ToListAsync();

        return issues;
    }

    public async Task<List<object>> GetBookHistoryAsync(int bookId)
    {
        return await _context.BookIssues
            .Include(bi => bi.Member)
            .Where(bi => bi.BookId == bookId)
            .OrderByDescending(bi => bi.IssueDate)
            .Take(20)
            .Select(bi => new
            {
                MemberName = bi.Member.FullName,
                MembershipId = bi.Member.MembershipId,
                IssueDate = bi.IssueDate,
                DueDate = bi.DueDate,
                ReturnDate = bi.ReturnDate,
                Status = bi.Status
            })
            .Cast<object>()
            .ToListAsync();
    }
}
