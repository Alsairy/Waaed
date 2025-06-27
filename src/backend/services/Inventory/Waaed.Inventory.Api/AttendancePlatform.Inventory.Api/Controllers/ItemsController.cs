using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutoMapper;
using AttendancePlatform.Inventory.Api.Data;
using AttendancePlatform.Inventory.Api.Entities;
using AttendancePlatform.Inventory.Api.DTOs;

namespace AttendancePlatform.Inventory.Api.Controllers;

[ApiController]
[Route("api/inventory/[controller]")]
public class ItemsController : ControllerBase
{
    private readonly InventoryDbContext _context;
    private readonly IMapper _mapper;
    private readonly ILogger<ItemsController> _logger;

    public ItemsController(InventoryDbContext context, IMapper mapper, ILogger<ItemsController> logger)
    {
        _context = context;
        _mapper = mapper;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ItemDto>>> GetItems([FromQuery] int? storeId = null, [FromQuery] string? category = null, [FromQuery] string? status = null)
    {
        try
        {
            var query = _context.Items
                .Include(i => i.Store)
                .Include(i => i.PreferredSupplier)
                .AsQueryable();

            if (storeId.HasValue)
            {
                query = query.Where(i => i.StoreId == storeId.Value);
            }

            if (!string.IsNullOrEmpty(category))
            {
                query = query.Where(i => i.Category == category);
            }

            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(i => i.Status == status);
            }

            var items = await query.OrderBy(i => i.Name).ToListAsync();
            var itemDtos = _mapper.Map<IEnumerable<ItemDto>>(items);

            Response.Headers.Add("X-Total-Count", items.Count.ToString());
            Response.Headers.Add("X-Page-Number", "1");
            Response.Headers.Add("X-Page-Size", items.Count.ToString());

            return Ok(itemDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving items");
            return StatusCode(500, "An error occurred while retrieving items");
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ItemDto>> GetItem(int id)
    {
        try
        {
            var item = await _context.Items
                .Include(i => i.Store)
                .Include(i => i.PreferredSupplier)
                .FirstOrDefaultAsync(i => i.Id == id);

            if (item == null)
            {
                return NotFound($"Item with ID {id} not found");
            }

            var itemDto = _mapper.Map<ItemDto>(item);
            return Ok(itemDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving item {ItemId}", id);
            return StatusCode(500, "An error occurred while retrieving the item");
        }
    }

    [HttpPost]
    public async Task<ActionResult<ItemDto>> CreateItem(CreateItemDto createItemDto)
    {
        try
        {
            var existingItem = await _context.Items
                .FirstOrDefaultAsync(i => i.ItemCode == createItemDto.ItemCode);

            if (existingItem != null)
            {
                return BadRequest($"Item with code '{createItemDto.ItemCode}' already exists");
            }

            var store = await _context.Stores.FindAsync(createItemDto.StoreId);
            if (store == null)
            {
                return BadRequest($"Store with ID {createItemDto.StoreId} not found");
            }

            if (createItemDto.PreferredSupplierId.HasValue)
            {
                var supplier = await _context.Suppliers.FindAsync(createItemDto.PreferredSupplierId.Value);
                if (supplier == null)
                {
                    return BadRequest($"Supplier with ID {createItemDto.PreferredSupplierId.Value} not found");
                }
            }

            var item = _mapper.Map<Item>(createItemDto);
            item.CreatedAt = DateTime.UtcNow;
            item.UpdatedAt = DateTime.UtcNow;

            _context.Items.Add(item);
            await _context.SaveChangesAsync();

            var itemDto = _mapper.Map<ItemDto>(item);

            Response.Headers.Add("X-Total-Count", "1");
            Response.Headers.Add("X-Page-Number", "1");
            Response.Headers.Add("X-Page-Size", "1");

            return CreatedAtAction(nameof(GetItem), new { id = item.Id }, itemDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating item");
            return StatusCode(500, "An error occurred while creating the item");
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateItem(int id, UpdateItemDto updateItemDto)
    {
        try
        {
            var item = await _context.Items.FindAsync(id);
            if (item == null)
            {
                return NotFound($"Item with ID {id} not found");
            }

            if (updateItemDto.PreferredSupplierId.HasValue)
            {
                var supplier = await _context.Suppliers.FindAsync(updateItemDto.PreferredSupplierId.Value);
                if (supplier == null)
                {
                    return BadRequest($"Supplier with ID {updateItemDto.PreferredSupplierId.Value} not found");
                }
            }

            _mapper.Map(updateItemDto, item);
            item.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating item {ItemId}", id);
            return StatusCode(500, "An error occurred while updating the item");
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteItem(int id)
    {
        try
        {
            var item = await _context.Items
                .Include(i => i.IndentItems)
                .Include(i => i.PurchaseOrderItems)
                .Include(i => i.IssueItems)
                .FirstOrDefaultAsync(i => i.Id == id);

            if (item == null)
            {
                return NotFound($"Item with ID {id} not found");
            }

            if (item.IndentItems.Any() || item.PurchaseOrderItems.Any() || item.IssueItems.Any())
            {
                return BadRequest("Cannot delete item that has associated transactions. Please archive the item instead.");
            }

            _context.Items.Remove(item);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting item {ItemId}", id);
            return StatusCode(500, "An error occurred while deleting the item");
        }
    }

    [HttpGet("low-stock")]
    public async Task<ActionResult<IEnumerable<ItemDto>>> GetLowStockItems([FromQuery] int? storeId = null)
    {
        try
        {
            var query = _context.Items
                .Include(i => i.Store)
                .Include(i => i.PreferredSupplier)
                .Where(i => i.CurrentStock <= i.MinimumStock && i.Status == "Active");

            if (storeId.HasValue)
            {
                query = query.Where(i => i.StoreId == storeId.Value);
            }

            var items = await query.OrderBy(i => i.CurrentStock).ToListAsync();
            var itemDtos = _mapper.Map<IEnumerable<ItemDto>>(items);

            return Ok(itemDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving low stock items");
            return StatusCode(500, "An error occurred while retrieving low stock items");
        }
    }

    [HttpGet("categories")]
    public async Task<ActionResult<IEnumerable<string>>> GetCategories()
    {
        try
        {
            var categories = await _context.Items
                .Where(i => !string.IsNullOrEmpty(i.Category))
                .Select(i => i.Category)
                .Distinct()
                .OrderBy(c => c)
                .ToListAsync();

            return Ok(categories);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving item categories");
            return StatusCode(500, "An error occurred while retrieving item categories");
        }
    }

    [HttpPost("{id}/adjust-stock")]
    public async Task<IActionResult> AdjustStock(int id, [FromBody] CreateStockAdjustmentDto adjustmentDto)
    {
        try
        {
            var item = await _context.Items.FindAsync(id);
            if (item == null)
            {
                return NotFound($"Item with ID {id} not found");
            }

            if (adjustmentDto.ItemId != id)
            {
                return BadRequest("Item ID in URL does not match Item ID in request body");
            }

            var adjustment = _mapper.Map<StockAdjustment>(adjustmentDto);
            adjustment.AdjustmentNumber = await GenerateAdjustmentNumber();
            adjustment.CurrentStock = item.CurrentStock;
            adjustment.AdjustedStock = adjustmentDto.AdjustmentDirection == "Increase" 
                ? item.CurrentStock + adjustmentDto.AdjustmentQuantity
                : item.CurrentStock - adjustmentDto.AdjustmentQuantity;
            adjustment.CreatedAt = DateTime.UtcNow;
            adjustment.UpdatedAt = DateTime.UtcNow;

            if (adjustment.AdjustedStock < 0)
            {
                return BadRequest("Stock adjustment would result in negative stock");
            }

            _context.StockAdjustments.Add(adjustment);

            item.CurrentStock = adjustment.AdjustedStock;
            item.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Stock adjusted successfully", newStock = item.CurrentStock });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adjusting stock for item {ItemId}", id);
            return StatusCode(500, "An error occurred while adjusting stock");
        }
    }

    [HttpGet("{id}/stock-history")]
    public async Task<ActionResult<IEnumerable<StockAdjustmentDto>>> GetStockHistory(int id)
    {
        try
        {
            var item = await _context.Items.FindAsync(id);
            if (item == null)
            {
                return NotFound($"Item with ID {id} not found");
            }

            var adjustments = await _context.StockAdjustments
                .Include(sa => sa.Store)
                .Include(sa => sa.Item)
                .Where(sa => sa.ItemId == id)
                .OrderByDescending(sa => sa.AdjustmentDate)
                .ToListAsync();

            var adjustmentDtos = _mapper.Map<IEnumerable<StockAdjustmentDto>>(adjustments);
            return Ok(adjustmentDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving stock history for item {ItemId}", id);
            return StatusCode(500, "An error occurred while retrieving stock history");
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
