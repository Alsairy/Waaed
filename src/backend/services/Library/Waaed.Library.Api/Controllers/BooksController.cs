using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutoMapper;
using Waaed.Library.Api.Data;
using Waaed.Library.Api.Entities;
using Waaed.Library.Api.DTOs;

namespace Waaed.Library.Api.Controllers;

[ApiController]
[Route("api/library/[controller]")]
public class BooksController : ControllerBase
{
    private readonly LibraryDbContext _context;
    private readonly IMapper _mapper;
    private readonly ILogger<BooksController> _logger;

    public BooksController(LibraryDbContext context, IMapper mapper, ILogger<BooksController> logger)
    {
        _context = context;
        _mapper = mapper;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<BookDto>>> GetBooks(
        [FromQuery] string? title = null,
        [FromQuery] string? author = null,
        [FromQuery] string? isbn = null,
        [FromQuery] string? category = null,
        [FromQuery] string? publisher = null,
        [FromQuery] string? language = null,
        [FromQuery] bool? isDigital = null,
        [FromQuery] bool? isReference = null,
        [FromQuery] bool? availableOnly = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        try
        {
            var query = _context.Books.AsQueryable();

            if (!string.IsNullOrEmpty(title))
            {
                query = query.Where(b => b.Title.Contains(title));
            }

            if (!string.IsNullOrEmpty(author))
            {
                query = query.Where(b => b.Author.Contains(author));
            }

            if (!string.IsNullOrEmpty(isbn))
            {
                query = query.Where(b => b.ISBN.Contains(isbn));
            }

            if (!string.IsNullOrEmpty(category))
            {
                query = query.Where(b => b.Category.Contains(category));
            }

            if (!string.IsNullOrEmpty(publisher))
            {
                query = query.Where(b => b.Publisher != null && b.Publisher.Contains(publisher));
            }

            if (!string.IsNullOrEmpty(language))
            {
                query = query.Where(b => b.Language != null && b.Language.Contains(language));
            }

            if (isDigital.HasValue)
            {
                query = query.Where(b => b.IsDigital == isDigital.Value);
            }

            if (isReference.HasValue)
            {
                query = query.Where(b => b.IsReference == isReference.Value);
            }

            if (availableOnly == true)
            {
                query = query.Where(b => b.AvailableCopies > 0);
            }

            var totalCount = await query.CountAsync();
            var books = await query
                .OrderBy(b => b.Title)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var bookDtos = _mapper.Map<IEnumerable<BookDto>>(books);

            Response.Headers.Add("X-Total-Count", totalCount.ToString());
            Response.Headers.Add("X-Page", page.ToString());
            Response.Headers.Add("X-Page-Size", pageSize.ToString());

            return Ok(bookDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving books");
            return StatusCode(500, "An error occurred while retrieving books");
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<BookDto>> GetBook(int id)
    {
        try
        {
            var book = await _context.Books.FindAsync(id);
            if (book == null)
            {
                return NotFound($"Book with ID {id} not found");
            }

            var bookDto = _mapper.Map<BookDto>(book);
            return Ok(bookDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving book {Id}", id);
            return StatusCode(500, "An error occurred while retrieving the book");
        }
    }

    [HttpPost]
    public async Task<ActionResult<BookDto>> CreateBook(CreateBookDto createDto)
    {
        try
        {
            var existingBook = await _context.Books
                .FirstOrDefaultAsync(b => b.ISBN == createDto.ISBN);

            if (existingBook != null)
            {
                return BadRequest($"Book with ISBN {createDto.ISBN} already exists");
            }

            var book = _mapper.Map<Book>(createDto);
            book.CreatedAt = DateTime.UtcNow;
            book.UpdatedAt = DateTime.UtcNow;

            _context.Books.Add(book);
            await _context.SaveChangesAsync();

            var bookDto = _mapper.Map<BookDto>(book);
            return CreatedAtAction(nameof(GetBook), new { id = book.Id }, bookDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating book");
            return StatusCode(500, "An error occurred while creating the book");
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateBook(int id, UpdateBookDto updateDto)
    {
        try
        {
            var book = await _context.Books.FindAsync(id);
            if (book == null)
            {
                return NotFound($"Book with ID {id} not found");
            }

            var existingBook = await _context.Books
                .FirstOrDefaultAsync(b => b.ISBN == updateDto.ISBN && b.Id != id);

            if (existingBook != null)
            {
                return BadRequest($"Book with ISBN {updateDto.ISBN} already exists");
            }

            _mapper.Map(updateDto, book);
            book.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating book {Id}", id);
            return StatusCode(500, "An error occurred while updating the book");
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteBook(int id)
    {
        try
        {
            var book = await _context.Books
                .Include(b => b.BookIssues)
                .Include(b => b.BookReservations)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (book == null)
            {
                return NotFound($"Book with ID {id} not found");
            }

            if (book.BookIssues.Any(bi => bi.Status == "Issued") || 
                book.BookReservations.Any(br => br.Status == "Active"))
            {
                return BadRequest("Cannot delete book with active issues or reservations");
            }

            _context.Books.Remove(book);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting book {Id}", id);
            return StatusCode(500, "An error occurred while deleting the book");
        }
    }

    [HttpGet("categories")]
    public async Task<ActionResult<IEnumerable<string>>> GetCategories()
    {
        try
        {
            var categories = await _context.Books
                .Select(b => b.Category)
                .Distinct()
                .OrderBy(c => c)
                .ToListAsync();

            return Ok(categories);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving book categories");
            return StatusCode(500, "An error occurred while retrieving book categories");
        }
    }

    [HttpGet("authors")]
    public async Task<ActionResult<IEnumerable<string>>> GetAuthors()
    {
        try
        {
            var authors = await _context.Books
                .Select(b => b.Author)
                .Distinct()
                .OrderBy(a => a)
                .ToListAsync();

            return Ok(authors);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving book authors");
            return StatusCode(500, "An error occurred while retrieving book authors");
        }
    }

    [HttpGet("publishers")]
    public async Task<ActionResult<IEnumerable<string>>> GetPublishers()
    {
        try
        {
            var publishers = await _context.Books
                .Where(b => b.Publisher != null)
                .Select(b => b.Publisher!)
                .Distinct()
                .OrderBy(p => p)
                .ToListAsync();

            return Ok(publishers);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving book publishers");
            return StatusCode(500, "An error occurred while retrieving book publishers");
        }
    }

    [HttpGet("search")]
    public async Task<ActionResult<IEnumerable<BookDto>>> SearchBooks([FromQuery] string query)
    {
        try
        {
            if (string.IsNullOrEmpty(query))
            {
                return BadRequest("Search query cannot be empty");
            }

            var books = await _context.Books
                .Where(b => b.Title.Contains(query) || 
                           b.Author.Contains(query) || 
                           b.ISBN.Contains(query) ||
                           (b.Publisher != null && b.Publisher.Contains(query)) ||
                           b.Category.Contains(query) ||
                           (b.Tags != null && b.Tags.Contains(query)))
                .OrderBy(b => b.Title)
                .Take(50)
                .ToListAsync();

            var bookDtos = _mapper.Map<IEnumerable<BookDto>>(books);
            return Ok(bookDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching books with query: {Query}", query);
            return StatusCode(500, "An error occurred while searching books");
        }
    }

    [HttpGet("summary")]
    public async Task<ActionResult<BookSummaryDto>> GetBookSummary()
    {
        try
        {
            var totalBooks = await _context.Books.CountAsync();
            var availableBooks = await _context.Books.SumAsync(b => b.AvailableCopies);
            var issuedBooks = await _context.Books.SumAsync(b => b.IssuedCopies);
            var reservedBooks = await _context.Books.SumAsync(b => b.ReservedCopies);
            var digitalBooks = await _context.Books.CountAsync(b => b.IsDigital);
            var referenceBooks = await _context.Books.CountAsync(b => b.IsReference);

            var booksByCategory = await _context.Books
                .GroupBy(b => b.Category)
                .Select(g => new { Category = g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.Category, x => x.Count);

            var booksByStatus = await _context.Books
                .GroupBy(b => b.Status)
                .Select(g => new { Status = g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.Status, x => x.Count);

            var summary = new BookSummaryDto
            {
                TotalBooks = totalBooks,
                AvailableBooks = availableBooks,
                IssuedBooks = issuedBooks,
                ReservedBooks = reservedBooks,
                DigitalBooks = digitalBooks,
                ReferenceBooks = referenceBooks,
                BooksByCategory = booksByCategory,
                BooksByStatus = booksByStatus
            };

            return Ok(summary);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving book summary");
            return StatusCode(500, "An error occurred while retrieving the book summary");
        }
    }

    [HttpPost("{id}/update-copies")]
    public async Task<IActionResult> UpdateBookCopies(int id, [FromBody] UpdateBookCopiesDto updateDto)
    {
        try
        {
            var book = await _context.Books.FindAsync(id);
            if (book == null)
            {
                return NotFound($"Book with ID {id} not found");
            }

            if (updateDto.TotalCopies < book.IssuedCopies + book.ReservedCopies)
            {
                return BadRequest("Total copies cannot be less than issued and reserved copies combined");
            }

            book.TotalCopies = updateDto.TotalCopies;
            book.AvailableCopies = updateDto.TotalCopies - book.IssuedCopies - book.ReservedCopies;
            book.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating book copies for book {Id}", id);
            return StatusCode(500, "An error occurred while updating book copies");
        }
    }
}

public class UpdateBookCopiesDto
{
    public int TotalCopies { get; set; }
}
