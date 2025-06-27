using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutoMapper;
using AttendancePlatform.Inventory.Api.Data;
using AttendancePlatform.Inventory.Api.Entities;
using AttendancePlatform.Inventory.Api.DTOs;

namespace AttendancePlatform.Inventory.Api.Controllers;

[ApiController]
[Route("api/inventory/[controller]")]
public class SuppliersController : ControllerBase
{
    private readonly InventoryDbContext _context;
    private readonly IMapper _mapper;
    private readonly ILogger<SuppliersController> _logger;

    public SuppliersController(InventoryDbContext context, IMapper mapper, ILogger<SuppliersController> logger)
    {
        _context = context;
        _mapper = mapper;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<SupplierDto>>> GetSuppliers([FromQuery] string? status = null)
    {
        try
        {
            var query = _context.Suppliers.AsQueryable();

            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(s => s.Status == status);
            }

            var suppliers = await query.OrderBy(s => s.Name).ToListAsync();
            var supplierDtos = _mapper.Map<IEnumerable<SupplierDto>>(suppliers);

            Response.Headers.Add("X-Total-Count", suppliers.Count.ToString());
            Response.Headers.Add("X-Page-Number", "1");
            Response.Headers.Add("X-Page-Size", suppliers.Count.ToString());

            return Ok(supplierDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving suppliers");
            return StatusCode(500, "An error occurred while retrieving suppliers");
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<SupplierDto>> GetSupplier(int id)
    {
        try
        {
            var supplier = await _context.Suppliers.FindAsync(id);

            if (supplier == null)
            {
                return NotFound($"Supplier with ID {id} not found");
            }

            var supplierDto = _mapper.Map<SupplierDto>(supplier);
            return Ok(supplierDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving supplier {SupplierId}", id);
            return StatusCode(500, "An error occurred while retrieving the supplier");
        }
    }

    [HttpPost]
    public async Task<ActionResult<SupplierDto>> CreateSupplier(CreateSupplierDto createSupplierDto)
    {
        try
        {
            var existingSupplier = await _context.Suppliers
                .FirstOrDefaultAsync(s => s.SupplierCode == createSupplierDto.SupplierCode);

            if (existingSupplier != null)
            {
                return BadRequest($"Supplier with code '{createSupplierDto.SupplierCode}' already exists");
            }

            var supplier = _mapper.Map<Supplier>(createSupplierDto);
            supplier.CreatedAt = DateTime.UtcNow;
            supplier.UpdatedAt = DateTime.UtcNow;

            _context.Suppliers.Add(supplier);
            await _context.SaveChangesAsync();

            var supplierDto = _mapper.Map<SupplierDto>(supplier);

            Response.Headers.Add("X-Total-Count", "1");
            Response.Headers.Add("X-Page-Number", "1");
            Response.Headers.Add("X-Page-Size", "1");

            return CreatedAtAction(nameof(GetSupplier), new { id = supplier.Id }, supplierDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating supplier");
            return StatusCode(500, "An error occurred while creating the supplier");
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateSupplier(int id, UpdateSupplierDto updateSupplierDto)
    {
        try
        {
            var supplier = await _context.Suppliers.FindAsync(id);
            if (supplier == null)
            {
                return NotFound($"Supplier with ID {id} not found");
            }

            _mapper.Map(updateSupplierDto, supplier);
            supplier.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating supplier {SupplierId}", id);
            return StatusCode(500, "An error occurred while updating the supplier");
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteSupplier(int id)
    {
        try
        {
            var supplier = await _context.Suppliers
                .Include(s => s.PurchaseOrders)
                .Include(s => s.PreferredItems)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (supplier == null)
            {
                return NotFound($"Supplier with ID {id} not found");
            }

            if (supplier.PurchaseOrders.Any() || supplier.PreferredItems.Any())
            {
                return BadRequest("Cannot delete supplier that has associated purchase orders or preferred items. Please archive the supplier instead.");
            }

            _context.Suppliers.Remove(supplier);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting supplier {SupplierId}", id);
            return StatusCode(500, "An error occurred while deleting the supplier");
        }
    }

    [HttpGet("{id}/purchase-orders")]
    public async Task<ActionResult<IEnumerable<PurchaseOrderDto>>> GetSupplierPurchaseOrders(int id)
    {
        try
        {
            var supplier = await _context.Suppliers.FindAsync(id);
            if (supplier == null)
            {
                return NotFound($"Supplier with ID {id} not found");
            }

            var purchaseOrders = await _context.PurchaseOrders
                .Include(po => po.Supplier)
                .Where(po => po.SupplierId == id)
                .OrderByDescending(po => po.PODate)
                .ToListAsync();

            var purchaseOrderDtos = _mapper.Map<IEnumerable<PurchaseOrderDto>>(purchaseOrders);
            return Ok(purchaseOrderDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving purchase orders for supplier {SupplierId}", id);
            return StatusCode(500, "An error occurred while retrieving supplier purchase orders");
        }
    }

    [HttpGet("{id}/performance")]
    public async Task<ActionResult<object>> GetSupplierPerformance(int id)
    {
        try
        {
            var supplier = await _context.Suppliers.FindAsync(id);
            if (supplier == null)
            {
                return NotFound($"Supplier with ID {id} not found");
            }

            var totalPOs = await _context.PurchaseOrders.CountAsync(po => po.SupplierId == id);
            var completedPOs = await _context.PurchaseOrders.CountAsync(po => po.SupplierId == id && po.Status == "Received");
            var totalValue = await _context.PurchaseOrders
                .Where(po => po.SupplierId == id)
                .SumAsync(po => po.TotalAmount);

            var onTimeDeliveries = await _context.GoodsReceipts
                .Include(gr => gr.PurchaseOrder)
                .Where(gr => gr.SupplierId == id && gr.PurchaseOrder != null && gr.GRNDate <= gr.PurchaseOrder.ExpectedDeliveryDate)
                .CountAsync();

            var totalDeliveries = await _context.GoodsReceipts.CountAsync(gr => gr.SupplierId == id);

            var onTimePercentage = totalDeliveries > 0 ? (double)onTimeDeliveries / totalDeliveries * 100 : 0;
            var completionRate = totalPOs > 0 ? (double)completedPOs / totalPOs * 100 : 0;

            return Ok(new
            {
                TotalPurchaseOrders = totalPOs,
                CompletedPurchaseOrders = completedPOs,
                CompletionRate = completionRate,
                TotalValue = totalValue,
                OnTimeDeliveries = onTimeDeliveries,
                TotalDeliveries = totalDeliveries,
                OnTimePercentage = onTimePercentage
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving performance data for supplier {SupplierId}", id);
            return StatusCode(500, "An error occurred while retrieving supplier performance");
        }
    }
}
