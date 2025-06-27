using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutoMapper;
using AttendancePlatform.Inventory.Api.Data;
using AttendancePlatform.Inventory.Api.Entities;
using AttendancePlatform.Inventory.Api.DTOs;

namespace AttendancePlatform.Inventory.Api.Controllers;

[ApiController]
[Route("api/inventory/[controller]")]
public class StockAdjustmentsController : ControllerBase
{
    private readonly InventoryDbContext _context;
    private readonly IMapper _mapper;
    private readonly ILogger<StockAdjustmentsController> _logger;

    public StockAdjustmentsController(InventoryDbContext context, IMapper mapper, ILogger<StockAdjustmentsController> logger)
    {
        _context = context;
        _mapper = mapper;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<StockAdjustmentDto>>> GetStockAdjustments([FromQuery] int? storeId = null, [FromQuery] int? itemId = null, [FromQuery] string? status = null)
    {
        try
        {
            var query = _context.StockAdjustments
                .Include(sa => sa.Store)
                .Include(sa => sa.Item)
                .AsQueryable();

            if (storeId.HasValue)
            {
                query = query.Where(sa => sa.StoreId == storeId.Value);
            }

            if (itemId.HasValue)
            {
                query = query.Where(sa => sa.ItemId == itemId.Value);
            }

            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(sa => sa.Status == status);
            }

            var stockAdjustments = await query.OrderByDescending(sa => sa.AdjustmentDate).ToListAsync();
            var stockAdjustmentDtos = _mapper.Map<IEnumerable<StockAdjustmentDto>>(stockAdjustments);

            Response.Headers.Add("X-Total-Count", stockAdjustments.Count.ToString());
            Response.Headers.Add("X-Page-Number", "1");
            Response.Headers.Add("X-Page-Size", stockAdjustments.Count.ToString());

            return Ok(stockAdjustmentDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving stock adjustments");
            return StatusCode(500, "An error occurred while retrieving stock adjustments");
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<StockAdjustmentDto>> GetStockAdjustment(int id)
    {
        try
        {
            var stockAdjustment = await _context.StockAdjustments
                .Include(sa => sa.Store)
                .Include(sa => sa.Item)
                .FirstOrDefaultAsync(sa => sa.Id == id);

            if (stockAdjustment == null)
            {
                return NotFound($"Stock adjustment with ID {id} not found");
            }

            var stockAdjustmentDto = _mapper.Map<StockAdjustmentDto>(stockAdjustment);
            return Ok(stockAdjustmentDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving stock adjustment {StockAdjustmentId}", id);
            return StatusCode(500, "An error occurred while retrieving the stock adjustment");
        }
    }

    [HttpPost]
    public async Task<ActionResult<StockAdjustmentDto>> CreateStockAdjustment(CreateStockAdjustmentDto createStockAdjustmentDto)
    {
        try
        {
            var store = await _context.Stores.FindAsync(createStockAdjustmentDto.StoreId);
            if (store == null)
            {
                return BadRequest($"Store with ID {createStockAdjustmentDto.StoreId} not found");
            }

            var item = await _context.Items.FindAsync(createStockAdjustmentDto.ItemId);
            if (item == null)
            {
                return BadRequest($"Item with ID {createStockAdjustmentDto.ItemId} not found");
            }

            var stockAdjustment = _mapper.Map<StockAdjustment>(createStockAdjustmentDto);
            stockAdjustment.AdjustmentNumber = await GenerateAdjustmentNumber();
            stockAdjustment.CurrentStock = item.CurrentStock;
            stockAdjustment.AdjustedStock = createStockAdjustmentDto.AdjustmentDirection == "Increase" 
                ? item.CurrentStock + createStockAdjustmentDto.AdjustmentQuantity
                : item.CurrentStock - createStockAdjustmentDto.AdjustmentQuantity;
            stockAdjustment.CreatedAt = DateTime.UtcNow;
            stockAdjustment.UpdatedAt = DateTime.UtcNow;

            if (stockAdjustment.AdjustedStock < 0)
            {
                return BadRequest("Stock adjustment would result in negative stock");
            }

            _context.StockAdjustments.Add(stockAdjustment);
            await _context.SaveChangesAsync();

            var stockAdjustmentDto = _mapper.Map<StockAdjustmentDto>(stockAdjustment);

            Response.Headers.Add("X-Total-Count", "1");
            Response.Headers.Add("X-Page-Number", "1");
            Response.Headers.Add("X-Page-Size", "1");

            return CreatedAtAction(nameof(GetStockAdjustment), new { id = stockAdjustment.Id }, stockAdjustmentDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating stock adjustment");
            return StatusCode(500, "An error occurred while creating the stock adjustment");
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateStockAdjustment(int id, UpdateStockAdjustmentDto updateStockAdjustmentDto)
    {
        try
        {
            var stockAdjustment = await _context.StockAdjustments
                .Include(sa => sa.Item)
                .FirstOrDefaultAsync(sa => sa.Id == id);

            if (stockAdjustment == null)
            {
                return NotFound($"Stock adjustment with ID {id} not found");
            }

            if (stockAdjustment.Status != "Pending")
            {
                return BadRequest("Only pending stock adjustments can be updated");
            }

            _mapper.Map(updateStockAdjustmentDto, stockAdjustment);
            stockAdjustment.AdjustedStock = updateStockAdjustmentDto.AdjustmentDirection == "Increase" 
                ? stockAdjustment.CurrentStock + updateStockAdjustmentDto.AdjustmentQuantity
                : stockAdjustment.CurrentStock - updateStockAdjustmentDto.AdjustmentQuantity;
            stockAdjustment.TotalCostImpact = updateStockAdjustmentDto.UnitCost * updateStockAdjustmentDto.AdjustmentQuantity;
            stockAdjustment.UpdatedAt = DateTime.UtcNow;

            if (stockAdjustment.AdjustedStock < 0)
            {
                return BadRequest("Stock adjustment would result in negative stock");
            }

            await _context.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating stock adjustment {StockAdjustmentId}", id);
            return StatusCode(500, "An error occurred while updating the stock adjustment");
        }
    }

    [HttpPost("{id}/approve")]
    public async Task<IActionResult> ApproveStockAdjustment(int id, ApproveStockAdjustmentDto approveStockAdjustmentDto)
    {
        try
        {
            var stockAdjustment = await _context.StockAdjustments
                .Include(sa => sa.Item)
                .FirstOrDefaultAsync(sa => sa.Id == id);

            if (stockAdjustment == null)
            {
                return NotFound($"Stock adjustment with ID {id} not found");
            }

            if (stockAdjustment.Status != "Pending")
            {
                return BadRequest("Only pending stock adjustments can be approved");
            }

            stockAdjustment.Status = "Approved";
            stockAdjustment.ApprovedBy = approveStockAdjustmentDto.ApprovedBy;
            stockAdjustment.ApprovedDate = DateTime.UtcNow;
            stockAdjustment.Notes = approveStockAdjustmentDto.Notes;
            stockAdjustment.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Stock adjustment approved successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error approving stock adjustment {StockAdjustmentId}", id);
            return StatusCode(500, "An error occurred while approving the stock adjustment");
        }
    }

    [HttpPost("{id}/post")]
    public async Task<IActionResult> PostStockAdjustment(int id)
    {
        try
        {
            var stockAdjustment = await _context.StockAdjustments
                .Include(sa => sa.Item)
                .FirstOrDefaultAsync(sa => sa.Id == id);

            if (stockAdjustment == null)
            {
                return NotFound($"Stock adjustment with ID {id} not found");
            }

            if (stockAdjustment.Status != "Approved")
            {
                return BadRequest("Only approved stock adjustments can be posted");
            }

            if (stockAdjustment.Item != null)
            {
                stockAdjustment.Item.CurrentStock = stockAdjustment.AdjustedStock;
                stockAdjustment.Item.UpdatedAt = DateTime.UtcNow;
            }

            stockAdjustment.Status = "Posted";
            stockAdjustment.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Stock adjustment posted successfully", newStock = stockAdjustment.AdjustedStock });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error posting stock adjustment {StockAdjustmentId}", id);
            return StatusCode(500, "An error occurred while posting the stock adjustment");
        }
    }

    [HttpPost("{id}/reject")]
    public async Task<IActionResult> RejectStockAdjustment(int id, [FromBody] string rejectionReason)
    {
        try
        {
            var stockAdjustment = await _context.StockAdjustments.FindAsync(id);
            if (stockAdjustment == null)
            {
                return NotFound($"Stock adjustment with ID {id} not found");
            }

            if (stockAdjustment.Status != "Pending")
            {
                return BadRequest("Only pending stock adjustments can be rejected");
            }

            stockAdjustment.Status = "Rejected";
            stockAdjustment.Notes = rejectionReason;
            stockAdjustment.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Stock adjustment rejected successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error rejecting stock adjustment {StockAdjustmentId}", id);
            return StatusCode(500, "An error occurred while rejecting the stock adjustment");
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteStockAdjustment(int id)
    {
        try
        {
            var stockAdjustment = await _context.StockAdjustments.FindAsync(id);
            if (stockAdjustment == null)
            {
                return NotFound($"Stock adjustment with ID {id} not found");
            }

            if (stockAdjustment.Status != "Pending")
            {
                return BadRequest("Only pending stock adjustments can be deleted");
            }

            _context.StockAdjustments.Remove(stockAdjustment);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting stock adjustment {StockAdjustmentId}", id);
            return StatusCode(500, "An error occurred while deleting the stock adjustment");
        }
    }

    [HttpGet("pending-approval")]
    public async Task<ActionResult<IEnumerable<StockAdjustmentDto>>> GetPendingApprovalStockAdjustments()
    {
        try
        {
            var stockAdjustments = await _context.StockAdjustments
                .Include(sa => sa.Store)
                .Include(sa => sa.Item)
                .Where(sa => sa.Status == "Pending")
                .OrderBy(sa => sa.AdjustmentDate)
                .ToListAsync();

            var stockAdjustmentDtos = _mapper.Map<IEnumerable<StockAdjustmentDto>>(stockAdjustments);
            return Ok(stockAdjustmentDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving pending approval stock adjustments");
            return StatusCode(500, "An error occurred while retrieving pending approval stock adjustments");
        }
    }

    private async Task<string> GenerateAdjustmentNumber()
    {
        var today = DateTime.UtcNow.ToString("yyyyMMdd");
        var lastAdjustment = await _context.StockAdjustments
            .Where(sa => sa.AdjustmentNumber.StartsWith($"ADJ{today}"))
            .OrderByDescending(sa => sa.AdjustmentNumber)
            .FirstOrDefaultAsync();

        if (lastAdjustment == null)
        {
            return $"ADJ{today}001";
        }

        var lastNumber = int.Parse(lastAdjustment.AdjustmentNumber.Substring(11));
        return $"ADJ{today}{(lastNumber + 1):D3}";
    }
}
