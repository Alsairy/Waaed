using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutoMapper;
using AttendancePlatform.Library.Api.Data;
using AttendancePlatform.Library.Api.Entities;
using AttendancePlatform.Library.Api.DTOs;

namespace AttendancePlatform.Library.Api.Controllers;

[ApiController]
[Route("api/library/[controller]")]
public class BookReservationsController : ControllerBase
{
    private readonly LibraryDbContext _context;
    private readonly IMapper _mapper;
    private readonly ILogger<BookReservationsController> _logger;

    public BookReservationsController(LibraryDbContext context, IMapper mapper, ILogger<BookReservationsController> logger)
    {
        _context = context;
        _mapper = mapper;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<BookReservationDto>>> GetBookReservations(
        [FromQuery] int? bookId = null,
        [FromQuery] int? memberId = null,
        [FromQuery] string? status = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        try
        {
            var query = _context.BookReservations
                .Include(br => br.Book)
                .Include(br => br.Member)
                .AsQueryable();

            if (bookId.HasValue)
            {
                query = query.Where(br => br.BookId == bookId.Value);
            }

            if (memberId.HasValue)
            {
                query = query.Where(br => br.MemberId == memberId.Value);
            }

            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(br => br.Status == status);
            }

            var totalCount = await query.CountAsync();
            var reservations = await query
                .OrderByDescending(br => br.ReservationDate)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var reservationDtos = _mapper.Map<IEnumerable<BookReservationDto>>(reservations);

            Response.Headers.Add("X-Total-Count", totalCount.ToString());
            Response.Headers.Add("X-Page", page.ToString());
            Response.Headers.Add("X-Page-Size", pageSize.ToString());

            return Ok(reservationDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving book reservations");
            return StatusCode(500, "An error occurred while retrieving book reservations");
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<BookReservationDto>> GetBookReservation(int id)
    {
        try
        {
            var reservation = await _context.BookReservations
                .Include(br => br.Book)
                .Include(br => br.Member)
                .FirstOrDefaultAsync(br => br.Id == id);

            if (reservation == null)
            {
                return NotFound($"Book reservation with ID {id} not found");
            }

            var reservationDto = _mapper.Map<BookReservationDto>(reservation);
            return Ok(reservationDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving book reservation {Id}", id);
            return StatusCode(500, "An error occurred while retrieving the book reservation");
        }
    }

    [HttpPost]
    public async Task<ActionResult<BookReservationDto>> CreateBookReservation(CreateBookReservationDto createDto)
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

            if (book.AvailableCopies > 0)
            {
                return BadRequest("Book is currently available and does not need reservation");
            }

            var existingReservation = await _context.BookReservations
                .FirstOrDefaultAsync(br => br.BookId == createDto.BookId && 
                                          br.MemberId == createDto.MemberId && 
                                          br.Status == "Active");

            if (existingReservation != null)
            {
                return BadRequest("Member already has an active reservation for this book");
            }

            var existingIssue = await _context.BookIssues
                .FirstOrDefaultAsync(bi => bi.BookId == createDto.BookId && 
                                          bi.MemberId == createDto.MemberId && 
                                          bi.Status == "Issued");

            if (existingIssue != null)
            {
                return BadRequest("Member already has this book issued");
            }

            var reservation = _mapper.Map<BookReservation>(createDto);
            reservation.CreatedAt = DateTime.UtcNow;
            reservation.UpdatedAt = DateTime.UtcNow;

            book.ReservedCopies++;
            book.UpdatedAt = DateTime.UtcNow;

            _context.BookReservations.Add(reservation);
            await _context.SaveChangesAsync();

            var reservationDto = _mapper.Map<BookReservationDto>(reservation);
            return CreatedAtAction(nameof(GetBookReservation), new { id = reservation.Id }, reservationDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating book reservation");
            return StatusCode(500, "An error occurred while creating the book reservation");
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateBookReservation(int id, UpdateBookReservationDto updateDto)
    {
        try
        {
            var reservation = await _context.BookReservations
                .Include(br => br.Book)
                .FirstOrDefaultAsync(br => br.Id == id);

            if (reservation == null)
            {
                return NotFound($"Book reservation with ID {id} not found");
            }

            var oldStatus = reservation.Status;
            _mapper.Map(updateDto, reservation);
            reservation.UpdatedAt = DateTime.UtcNow;

            if (oldStatus == "Active" && updateDto.Status != "Active")
            {
                reservation.Book.ReservedCopies--;
                reservation.Book.UpdatedAt = DateTime.UtcNow;
            }
            else if (oldStatus != "Active" && updateDto.Status == "Active")
            {
                reservation.Book.ReservedCopies++;
                reservation.Book.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating book reservation {Id}", id);
            return StatusCode(500, "An error occurred while updating the book reservation");
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteBookReservation(int id)
    {
        try
        {
            var reservation = await _context.BookReservations
                .Include(br => br.Book)
                .FirstOrDefaultAsync(br => br.Id == id);

            if (reservation == null)
            {
                return NotFound($"Book reservation with ID {id} not found");
            }

            if (reservation.Status == "Active")
            {
                reservation.Book.ReservedCopies--;
                reservation.Book.UpdatedAt = DateTime.UtcNow;
            }

            _context.BookReservations.Remove(reservation);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting book reservation {Id}", id);
            return StatusCode(500, "An error occurred while deleting the book reservation");
        }
    }

    [HttpPost("{id}/fulfill")]
    public async Task<IActionResult> FulfillReservation(int id)
    {
        try
        {
            var reservation = await _context.BookReservations
                .Include(br => br.Book)
                .Include(br => br.Member)
                .FirstOrDefaultAsync(br => br.Id == id);

            if (reservation == null)
            {
                return NotFound($"Book reservation with ID {id} not found");
            }

            if (reservation.Status != "Active")
            {
                return BadRequest("Reservation is not active");
            }

            if (reservation.Book.AvailableCopies <= 0)
            {
                return BadRequest("No available copies to fulfill reservation");
            }

            if (reservation.Member.CurrentBooksIssued >= reservation.Member.MaxBooksAllowed)
            {
                return BadRequest($"Member has reached maximum book limit ({reservation.Member.MaxBooksAllowed})");
            }

            var bookIssue = new BookIssue
            {
                BookId = reservation.BookId,
                MemberId = reservation.MemberId,
                IssueDate = DateTime.UtcNow,
                DueDate = DateTime.UtcNow.AddDays(14),
                Status = "Issued",
                IssueNotes = $"Issued from reservation #{reservation.Id}",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            reservation.Status = "Fulfilled";
            reservation.UpdatedAt = DateTime.UtcNow;

            reservation.Book.AvailableCopies--;
            reservation.Book.IssuedCopies++;
            reservation.Book.ReservedCopies--;
            reservation.Book.UpdatedAt = DateTime.UtcNow;

            reservation.Member.CurrentBooksIssued++;
            reservation.Member.UpdatedAt = DateTime.UtcNow;

            _context.BookIssues.Add(bookIssue);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fulfilling book reservation {Id}", id);
            return StatusCode(500, "An error occurred while fulfilling the book reservation");
        }
    }

    [HttpPost("{id}/notify")]
    public async Task<IActionResult> NotifyMember(int id)
    {
        try
        {
            var reservation = await _context.BookReservations.FindAsync(id);
            if (reservation == null)
            {
                return NotFound($"Book reservation with ID {id} not found");
            }

            if (reservation.Status != "Active")
            {
                return BadRequest("Reservation is not active");
            }

            reservation.NotifiedDate = DateTime.UtcNow;
            reservation.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error notifying member for reservation {Id}", id);
            return StatusCode(500, "An error occurred while notifying the member");
        }
    }

    [HttpGet("expired")]
    public async Task<ActionResult<IEnumerable<BookReservationDto>>> GetExpiredReservations()
    {
        try
        {
            var expiredReservations = await _context.BookReservations
                .Include(br => br.Book)
                .Include(br => br.Member)
                .Where(br => br.Status == "Active" && br.ExpiryDate < DateTime.UtcNow)
                .OrderBy(br => br.ExpiryDate)
                .ToListAsync();

            var reservationDtos = _mapper.Map<IEnumerable<BookReservationDto>>(expiredReservations);
            return Ok(reservationDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving expired reservations");
            return StatusCode(500, "An error occurred while retrieving expired reservations");
        }
    }

    [HttpGet("summary")]
    public async Task<ActionResult<BookReservationSummaryDto>> GetBookReservationSummary()
    {
        try
        {
            var totalReservations = await _context.BookReservations.CountAsync();
            var activeReservations = await _context.BookReservations.CountAsync(br => br.Status == "Active");
            var expiredReservations = await _context.BookReservations.CountAsync(br => br.Status == "Active" && br.ExpiryDate < DateTime.UtcNow);
            var fulfilledReservations = await _context.BookReservations.CountAsync(br => br.Status == "Fulfilled");
            var cancelledReservations = await _context.BookReservations.CountAsync(br => br.Status == "Cancelled");

            var reservationsByStatus = await _context.BookReservations
                .GroupBy(br => br.Status)
                .Select(g => new { Status = g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.Status, x => x.Count);

            var reservationsByMemberType = await _context.BookReservations
                .Include(br => br.Member)
                .GroupBy(br => br.Member.MemberType)
                .Select(g => new { MemberType = g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.MemberType, x => x.Count);

            var summary = new BookReservationSummaryDto
            {
                TotalReservations = totalReservations,
                ActiveReservations = activeReservations,
                ExpiredReservations = expiredReservations,
                FulfilledReservations = fulfilledReservations,
                CancelledReservations = cancelledReservations,
                ReservationsByStatus = reservationsByStatus,
                ReservationsByMemberType = reservationsByMemberType
            };

            return Ok(summary);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving book reservation summary");
            return StatusCode(500, "An error occurred while retrieving the book reservation summary");
        }
    }
}
