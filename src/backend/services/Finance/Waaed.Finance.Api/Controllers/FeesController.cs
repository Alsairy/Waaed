using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutoMapper;
using Waaed.Finance.Api.Data;
using Waaed.Finance.Api.Entities;
using Waaed.Finance.Api.DTOs;

namespace Waaed.Finance.Api.Controllers;

[ApiController]
[Route("api/finance/[controller]")]
public class FeesController : ControllerBase
{
    private readonly FinanceDbContext _context;
    private readonly IMapper _mapper;
    private readonly ILogger<FeesController> _logger;

    public FeesController(FinanceDbContext context, IMapper mapper, ILogger<FeesController> logger)
    {
        _context = context;
        _mapper = mapper;
        _logger = logger;
    }

    [HttpGet("structures")]
    public async Task<ActionResult<IEnumerable<FeeStructureDto>>> GetFeeStructures()
    {
        try
        {
            var feeStructures = await _context.FeeStructures
                .Where(fs => fs.IsActive)
                .OrderBy(fs => fs.Class)
                .ThenBy(fs => fs.Section)
                .ToListAsync();

            var feeStructureDtos = _mapper.Map<IEnumerable<FeeStructureDto>>(feeStructures);
            return Ok(feeStructureDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving fee structures");
            return StatusCode(500, "An error occurred while retrieving fee structures");
        }
    }

    [HttpGet("structures/{id}")]
    public async Task<ActionResult<FeeStructureDto>> GetFeeStructure(int id)
    {
        try
        {
            var feeStructure = await _context.FeeStructures.FindAsync(id);
            if (feeStructure == null)
            {
                return NotFound($"Fee structure with ID {id} not found");
            }

            var feeStructureDto = _mapper.Map<FeeStructureDto>(feeStructure);
            return Ok(feeStructureDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving fee structure {Id}", id);
            return StatusCode(500, "An error occurred while retrieving the fee structure");
        }
    }

    [HttpPost("structures")]
    public async Task<ActionResult<FeeStructureDto>> CreateFeeStructure(CreateFeeStructureDto createDto)
    {
        try
        {
            var feeStructure = _mapper.Map<FeeStructure>(createDto);
            feeStructure.CreatedAt = DateTime.UtcNow;
            feeStructure.UpdatedAt = DateTime.UtcNow;

            _context.FeeStructures.Add(feeStructure);
            await _context.SaveChangesAsync();

            var feeStructureDto = _mapper.Map<FeeStructureDto>(feeStructure);
            return CreatedAtAction(nameof(GetFeeStructure), new { id = feeStructure.Id }, feeStructureDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating fee structure");
            return StatusCode(500, "An error occurred while creating the fee structure");
        }
    }

    [HttpPut("structures/{id}")]
    public async Task<IActionResult> UpdateFeeStructure(int id, UpdateFeeStructureDto updateDto)
    {
        try
        {
            var feeStructure = await _context.FeeStructures.FindAsync(id);
            if (feeStructure == null)
            {
                return NotFound($"Fee structure with ID {id} not found");
            }

            _mapper.Map(updateDto, feeStructure);
            feeStructure.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating fee structure {Id}", id);
            return StatusCode(500, "An error occurred while updating the fee structure");
        }
    }

    [HttpDelete("structures/{id}")]
    public async Task<IActionResult> DeleteFeeStructure(int id)
    {
        try
        {
            var feeStructure = await _context.FeeStructures.FindAsync(id);
            if (feeStructure == null)
            {
                return NotFound($"Fee structure with ID {id} not found");
            }

            feeStructure.IsActive = false;
            feeStructure.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting fee structure {Id}", id);
            return StatusCode(500, "An error occurred while deleting the fee structure");
        }
    }

    [HttpGet("collections")]
    public async Task<ActionResult<IEnumerable<FeeCollectionDto>>> GetFeeCollections(
        [FromQuery] string? studentId = null,
        [FromQuery] string? paymentStatus = null,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null)
    {
        try
        {
            var query = _context.FeeCollections
                .Include(fc => fc.Student)
                .Include(fc => fc.FeeStructure)
                .AsQueryable();

            if (!string.IsNullOrEmpty(studentId))
            {
                query = query.Where(fc => fc.Student.StudentId == studentId);
            }

            if (!string.IsNullOrEmpty(paymentStatus))
            {
                query = query.Where(fc => fc.PaymentStatus == paymentStatus);
            }

            if (fromDate.HasValue)
            {
                query = query.Where(fc => fc.CreatedAt >= fromDate.Value);
            }

            if (toDate.HasValue)
            {
                query = query.Where(fc => fc.CreatedAt <= toDate.Value);
            }

            var feeCollections = await query
                .OrderByDescending(fc => fc.CreatedAt)
                .ToListAsync();

            var feeCollectionDtos = _mapper.Map<IEnumerable<FeeCollectionDto>>(feeCollections);
            return Ok(feeCollectionDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving fee collections");
            return StatusCode(500, "An error occurred while retrieving fee collections");
        }
    }

    [HttpGet("collections/{id}")]
    public async Task<ActionResult<FeeCollectionDto>> GetFeeCollection(int id)
    {
        try
        {
            var feeCollection = await _context.FeeCollections
                .Include(fc => fc.Student)
                .Include(fc => fc.FeeStructure)
                .FirstOrDefaultAsync(fc => fc.Id == id);

            if (feeCollection == null)
            {
                return NotFound($"Fee collection with ID {id} not found");
            }

            var feeCollectionDto = _mapper.Map<FeeCollectionDto>(feeCollection);
            return Ok(feeCollectionDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving fee collection {Id}", id);
            return StatusCode(500, "An error occurred while retrieving the fee collection");
        }
    }

    [HttpPost("collections")]
    public async Task<ActionResult<FeeCollectionDto>> CreateFeeCollection(CreateFeeCollectionDto createDto)
    {
        try
        {
            var student = await _context.Students.FindAsync(createDto.StudentId);
            if (student == null)
            {
                return BadRequest($"Student with ID {createDto.StudentId} not found");
            }

            var feeStructure = await _context.FeeStructures.FindAsync(createDto.FeeStructureId);
            if (feeStructure == null)
            {
                return BadRequest($"Fee structure with ID {createDto.FeeStructureId} not found");
            }

            var feeCollection = _mapper.Map<FeeCollection>(createDto);
            feeCollection.CreatedAt = DateTime.UtcNow;
            feeCollection.UpdatedAt = DateTime.UtcNow;

            _context.FeeCollections.Add(feeCollection);
            await _context.SaveChangesAsync();

            var feeCollectionDto = _mapper.Map<FeeCollectionDto>(feeCollection);
            return CreatedAtAction(nameof(GetFeeCollection), new { id = feeCollection.Id }, feeCollectionDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating fee collection");
            return StatusCode(500, "An error occurred while creating the fee collection");
        }
    }

    [HttpPut("collections/{id}")]
    public async Task<IActionResult> UpdateFeeCollection(int id, UpdateFeeCollectionDto updateDto)
    {
        try
        {
            var feeCollection = await _context.FeeCollections.FindAsync(id);
            if (feeCollection == null)
            {
                return NotFound($"Fee collection with ID {id} not found");
            }

            _mapper.Map(updateDto, feeCollection);
            feeCollection.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating fee collection {Id}", id);
            return StatusCode(500, "An error occurred while updating the fee collection");
        }
    }

    [HttpGet("summary")]
    public async Task<ActionResult<FeeCollectionSummaryDto>> GetFeeCollectionSummary()
    {
        try
        {
            var totalDue = await _context.FeeCollections.SumAsync(fc => fc.AmountDue);
            var totalPaid = await _context.FeeCollections.SumAsync(fc => fc.AmountPaid);
            var totalPending = totalDue - totalPaid;
            var totalOverdue = await _context.FeeCollections
                .Where(fc => fc.DueDate < DateTime.UtcNow && fc.PaymentStatus != "Paid")
                .SumAsync(fc => fc.AmountDue - fc.AmountPaid);

            var totalStudents = await _context.Students.CountAsync(s => s.IsActive);
            var paidStudents = await _context.FeeCollections
                .Where(fc => fc.PaymentStatus == "Paid")
                .Select(fc => fc.StudentId)
                .Distinct()
                .CountAsync();
            var pendingStudents = await _context.FeeCollections
                .Where(fc => fc.PaymentStatus == "Pending")
                .Select(fc => fc.StudentId)
                .Distinct()
                .CountAsync();
            var overdueStudents = await _context.FeeCollections
                .Where(fc => fc.DueDate < DateTime.UtcNow && fc.PaymentStatus != "Paid")
                .Select(fc => fc.StudentId)
                .Distinct()
                .CountAsync();

            var summary = new FeeCollectionSummaryDto
            {
                TotalDue = totalDue,
                TotalPaid = totalPaid,
                TotalPending = totalPending,
                TotalOverdue = totalOverdue,
                TotalStudents = totalStudents,
                PaidStudents = paidStudents,
                PendingStudents = pendingStudents,
                OverdueStudents = overdueStudents
            };

            return Ok(summary);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving fee collection summary");
            return StatusCode(500, "An error occurred while retrieving the fee collection summary");
        }
    }
}
