using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutoMapper;
using AttendancePlatform.Inventory.Api.Data;
using AttendancePlatform.Inventory.Api.Entities;
using AttendancePlatform.Inventory.Api.DTOs;

namespace AttendancePlatform.Inventory.Api.Controllers;

[ApiController]
[Route("api/inventory/[controller]")]
public class IndentsController : ControllerBase
{
    private readonly InventoryDbContext _context;
    private readonly IMapper _mapper;
    private readonly ILogger<IndentsController> _logger;

    public IndentsController(InventoryDbContext context, IMapper mapper, ILogger<IndentsController> logger)
    {
        _context = context;
        _mapper = mapper;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<IndentDto>>> GetIndents([FromQuery] int? storeId = null, [FromQuery] string? status = null)
    {
        try
        {
            var query = _context.Indents
                .Include(i => i.Store)
                .Include(i => i.IndentItems)
                    .ThenInclude(ii => ii.Item)
                .AsQueryable();

            if (storeId.HasValue)
            {
                query = query.Where(i => i.StoreId == storeId.Value);
            }

            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(i => i.Status == status);
            }

            var indents = await query.OrderByDescending(i => i.IndentDate).ToListAsync();
            var indentDtos = _mapper.Map<IEnumerable<IndentDto>>(indents);

            Response.Headers.Add("X-Total-Count", indents.Count.ToString());
            Response.Headers.Add("X-Page-Number", "1");
            Response.Headers.Add("X-Page-Size", indents.Count.ToString());

            return Ok(indentDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving indents");
            return StatusCode(500, "An error occurred while retrieving indents");
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<IndentDto>> GetIndent(int id)
    {
        try
        {
            var indent = await _context.Indents
                .Include(i => i.Store)
                .Include(i => i.IndentItems)
                    .ThenInclude(ii => ii.Item)
                .FirstOrDefaultAsync(i => i.Id == id);

            if (indent == null)
            {
                return NotFound($"Indent with ID {id} not found");
            }

            var indentDto = _mapper.Map<IndentDto>(indent);
            return Ok(indentDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving indent {IndentId}", id);
            return StatusCode(500, "An error occurred while retrieving the indent");
        }
    }

    [HttpPost]
    public async Task<ActionResult<IndentDto>> CreateIndent(CreateIndentDto createIndentDto)
    {
        try
        {
            var store = await _context.Stores.FindAsync(createIndentDto.StoreId);
            if (store == null)
            {
                return BadRequest($"Store with ID {createIndentDto.StoreId} not found");
            }

            foreach (var indentItem in createIndentDto.IndentItems)
            {
                var item = await _context.Items.FindAsync(indentItem.ItemId);
                if (item == null)
                {
                    return BadRequest($"Item with ID {indentItem.ItemId} not found");
                }
            }

            var indent = _mapper.Map<Indent>(createIndentDto);
            indent.IndentNumber = await GenerateIndentNumber();
            indent.CreatedAt = DateTime.UtcNow;
            indent.UpdatedAt = DateTime.UtcNow;

            decimal totalCost = 0;
            foreach (var indentItem in indent.IndentItems)
            {
                indentItem.EstimatedTotalCost = indentItem.EstimatedUnitCost * indentItem.RequestedQuantity;
                totalCost += indentItem.EstimatedTotalCost;
                indentItem.CreatedAt = DateTime.UtcNow;
                indentItem.UpdatedAt = DateTime.UtcNow;
            }

            indent.TotalEstimatedCost = totalCost;

            _context.Indents.Add(indent);
            await _context.SaveChangesAsync();

            var indentDto = _mapper.Map<IndentDto>(indent);

            Response.Headers.Add("X-Total-Count", "1");
            Response.Headers.Add("X-Page-Number", "1");
            Response.Headers.Add("X-Page-Size", "1");

            return CreatedAtAction(nameof(GetIndent), new { id = indent.Id }, indentDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating indent");
            return StatusCode(500, "An error occurred while creating the indent");
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateIndent(int id, UpdateIndentDto updateIndentDto)
    {
        try
        {
            var indent = await _context.Indents.FindAsync(id);
            if (indent == null)
            {
                return NotFound($"Indent with ID {id} not found");
            }

            if (indent.Status != "Pending")
            {
                return BadRequest("Only pending indents can be updated");
            }

            _mapper.Map(updateIndentDto, indent);
            indent.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating indent {IndentId}", id);
            return StatusCode(500, "An error occurred while updating the indent");
        }
    }

    [HttpPost("{id}/approve")]
    public async Task<IActionResult> ApproveIndent(int id, ApproveIndentDto approveIndentDto)
    {
        try
        {
            var indent = await _context.Indents
                .Include(i => i.IndentItems)
                .FirstOrDefaultAsync(i => i.Id == id);

            if (indent == null)
            {
                return NotFound($"Indent with ID {id} not found");
            }

            if (indent.Status != "Pending")
            {
                return BadRequest("Only pending indents can be approved");
            }

            indent.Status = "Approved";
            indent.ApprovedBy = approveIndentDto.ApprovedBy;
            indent.ApprovedDate = DateTime.UtcNow;
            indent.ApprovalNotes = approveIndentDto.ApprovalNotes;
            indent.UpdatedAt = DateTime.UtcNow;

            foreach (var approveItem in approveIndentDto.IndentItems)
            {
                var indentItem = indent.IndentItems.FirstOrDefault(ii => ii.Id == approveItem.IndentItemId);
                if (indentItem != null)
                {
                    indentItem.ApprovedQuantity = approveItem.ApprovedQuantity;
                    indentItem.Status = approveItem.Status;
                    indentItem.UpdatedAt = DateTime.UtcNow;
                }
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "Indent approved successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error approving indent {IndentId}", id);
            return StatusCode(500, "An error occurred while approving the indent");
        }
    }

    [HttpPost("{id}/reject")]
    public async Task<IActionResult> RejectIndent(int id, [FromBody] string rejectionReason)
    {
        try
        {
            var indent = await _context.Indents.FindAsync(id);
            if (indent == null)
            {
                return NotFound($"Indent with ID {id} not found");
            }

            if (indent.Status != "Pending")
            {
                return BadRequest("Only pending indents can be rejected");
            }

            indent.Status = "Rejected";
            indent.ApprovalNotes = rejectionReason;
            indent.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Indent rejected successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error rejecting indent {IndentId}", id);
            return StatusCode(500, "An error occurred while rejecting the indent");
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteIndent(int id)
    {
        try
        {
            var indent = await _context.Indents
                .Include(i => i.IndentItems)
                .FirstOrDefaultAsync(i => i.Id == id);

            if (indent == null)
            {
                return NotFound($"Indent with ID {id} not found");
            }

            if (indent.Status != "Pending")
            {
                return BadRequest("Only pending indents can be deleted");
            }

            _context.Indents.Remove(indent);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting indent {IndentId}", id);
            return StatusCode(500, "An error occurred while deleting the indent");
        }
    }

    [HttpGet("pending-approval")]
    public async Task<ActionResult<IEnumerable<IndentDto>>> GetPendingApprovalIndents()
    {
        try
        {
            var indents = await _context.Indents
                .Include(i => i.Store)
                .Include(i => i.IndentItems)
                    .ThenInclude(ii => ii.Item)
                .Where(i => i.Status == "Pending")
                .OrderBy(i => i.RequiredDate)
                .ToListAsync();

            var indentDtos = _mapper.Map<IEnumerable<IndentDto>>(indents);
            return Ok(indentDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving pending approval indents");
            return StatusCode(500, "An error occurred while retrieving pending approval indents");
        }
    }

    private async Task<string> GenerateIndentNumber()
    {
        var today = DateTime.UtcNow.ToString("yyyyMMdd");
        var lastIndent = await _context.Indents
            .Where(i => i.IndentNumber.StartsWith($"IND{today}"))
            .OrderByDescending(i => i.IndentNumber)
            .FirstOrDefaultAsync();

        if (lastIndent == null)
        {
            return $"IND{today}001";
        }

        var lastNumber = int.Parse(lastIndent.IndentNumber.Substring(11));
        return $"IND{today}{(lastNumber + 1):D3}";
    }
}
