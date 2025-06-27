using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutoMapper;
using AttendancePlatform.Inventory.Api.Data;
using AttendancePlatform.Inventory.Api.Entities;
using AttendancePlatform.Inventory.Api.DTOs;

namespace AttendancePlatform.Inventory.Api.Controllers;

[ApiController]
[Route("api/inventory/[controller]")]
public class StoresController : ControllerBase
{
    private readonly InventoryDbContext _context;
    private readonly IMapper _mapper;
    private readonly ILogger<StoresController> _logger;

    public StoresController(InventoryDbContext context, IMapper mapper, ILogger<StoresController> logger)
    {
        _context = context;
        _mapper = mapper;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<StoreDto>>> GetStores()
    {
        try
        {
            var stores = await _context.Stores
                .Include(s => s.ParentStore)
                .OrderBy(s => s.Name)
                .ToListAsync();

            var storeDtos = _mapper.Map<IEnumerable<StoreDto>>(stores);
            return Ok(storeDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving stores");
            return StatusCode(500, "An error occurred while retrieving stores");
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<StoreDto>> GetStore(int id)
    {
        try
        {
            var store = await _context.Stores
                .Include(s => s.ParentStore)
                .Include(s => s.ChildStores)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (store == null)
            {
                return NotFound($"Store with ID {id} not found");
            }

            var storeDto = _mapper.Map<StoreDto>(store);
            return Ok(storeDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving store {StoreId}", id);
            return StatusCode(500, "An error occurred while retrieving the store");
        }
    }

    [HttpPost]
    public async Task<ActionResult<StoreDto>> CreateStore(CreateStoreDto createStoreDto)
    {
        try
        {
            var existingStore = await _context.Stores
                .FirstOrDefaultAsync(s => s.Code == createStoreDto.Code);

            if (existingStore != null)
            {
                return BadRequest($"Store with code '{createStoreDto.Code}' already exists");
            }

            if (createStoreDto.ParentStoreId.HasValue)
            {
                var parentStore = await _context.Stores
                    .FirstOrDefaultAsync(s => s.Id == createStoreDto.ParentStoreId.Value);

                if (parentStore == null)
                {
                    return BadRequest($"Parent store with ID {createStoreDto.ParentStoreId.Value} not found");
                }
            }

            var store = _mapper.Map<Store>(createStoreDto);
            store.CreatedAt = DateTime.UtcNow;
            store.UpdatedAt = DateTime.UtcNow;

            _context.Stores.Add(store);
            await _context.SaveChangesAsync();

            var storeDto = _mapper.Map<StoreDto>(store);

            Response.Headers.Add("X-Total-Count", "1");
            Response.Headers.Add("X-Page-Number", "1");
            Response.Headers.Add("X-Page-Size", "1");

            return CreatedAtAction(nameof(GetStore), new { id = store.Id }, storeDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating store");
            return StatusCode(500, "An error occurred while creating the store");
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateStore(int id, UpdateStoreDto updateStoreDto)
    {
        try
        {
            var store = await _context.Stores.FindAsync(id);
            if (store == null)
            {
                return NotFound($"Store with ID {id} not found");
            }

            if (updateStoreDto.ParentStoreId.HasValue)
            {
                if (updateStoreDto.ParentStoreId.Value == id)
                {
                    return BadRequest("Store cannot be its own parent");
                }

                var parentStore = await _context.Stores
                    .FirstOrDefaultAsync(s => s.Id == updateStoreDto.ParentStoreId.Value);

                if (parentStore == null)
                {
                    return BadRequest($"Parent store with ID {updateStoreDto.ParentStoreId.Value} not found");
                }
            }

            _mapper.Map(updateStoreDto, store);
            store.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating store {StoreId}", id);
            return StatusCode(500, "An error occurred while updating the store");
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteStore(int id)
    {
        try
        {
            var store = await _context.Stores
                .Include(s => s.Items)
                .Include(s => s.ChildStores)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (store == null)
            {
                return NotFound($"Store with ID {id} not found");
            }

            if (store.Items.Any())
            {
                return BadRequest("Cannot delete store that has items. Please move or delete all items first.");
            }

            if (store.ChildStores.Any())
            {
                return BadRequest("Cannot delete store that has child stores. Please reassign or delete child stores first.");
            }

            _context.Stores.Remove(store);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting store {StoreId}", id);
            return StatusCode(500, "An error occurred while deleting the store");
        }
    }

    [HttpGet("{id}/items")]
    public async Task<ActionResult<IEnumerable<ItemDto>>> GetStoreItems(int id)
    {
        try
        {
            var store = await _context.Stores.FindAsync(id);
            if (store == null)
            {
                return NotFound($"Store with ID {id} not found");
            }

            var items = await _context.Items
                .Include(i => i.Store)
                .Include(i => i.PreferredSupplier)
                .Where(i => i.StoreId == id)
                .OrderBy(i => i.Name)
                .ToListAsync();

            var itemDtos = _mapper.Map<IEnumerable<ItemDto>>(items);
            return Ok(itemDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving items for store {StoreId}", id);
            return StatusCode(500, "An error occurred while retrieving store items");
        }
    }

    [HttpGet("{id}/statistics")]
    public async Task<ActionResult<object>> GetStoreStatistics(int id)
    {
        try
        {
            var store = await _context.Stores.FindAsync(id);
            if (store == null)
            {
                return NotFound($"Store with ID {id} not found");
            }

            var totalItems = await _context.Items.CountAsync(i => i.StoreId == id);
            var activeItems = await _context.Items.CountAsync(i => i.StoreId == id && i.Status == "Active");
            var lowStockItems = await _context.Items.CountAsync(i => i.StoreId == id && i.CurrentStock <= i.MinimumStock);
            var totalStockValue = await _context.Items
                .Where(i => i.StoreId == id)
                .SumAsync(i => i.CurrentStock * i.UnitCost);

            var pendingIndents = await _context.Indents.CountAsync(i => i.StoreId == id && i.Status == "Pending");
            var activeIssues = await _context.Issues.CountAsync(i => i.StoreId == id && i.Status == "Issued");

            return Ok(new
            {
                TotalItems = totalItems,
                ActiveItems = activeItems,
                LowStockItems = lowStockItems,
                TotalStockValue = totalStockValue,
                PendingIndents = pendingIndents,
                ActiveIssues = activeIssues
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving statistics for store {StoreId}", id);
            return StatusCode(500, "An error occurred while retrieving store statistics");
        }
    }
}
