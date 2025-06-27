using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutoMapper;
using AttendancePlatform.Inventory.Api.Data;
using AttendancePlatform.Inventory.Api.Entities;
using AttendancePlatform.Inventory.Api.DTOs;

namespace AttendancePlatform.Inventory.Api.Controllers;

[ApiController]
[Route("api/inventory/[controller]")]
public class PurchaseOrdersController : ControllerBase
{
    private readonly InventoryDbContext _context;
    private readonly IMapper _mapper;
    private readonly ILogger<PurchaseOrdersController> _logger;

    public PurchaseOrdersController(InventoryDbContext context, IMapper mapper, ILogger<PurchaseOrdersController> logger)
    {
        _context = context;
        _mapper = mapper;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<PurchaseOrderDto>>> GetPurchaseOrders([FromQuery] int? supplierId = null, [FromQuery] string? status = null)
    {
        try
        {
            var query = _context.PurchaseOrders
                .Include(po => po.Supplier)
                .Include(po => po.PurchaseOrderItems)
                    .ThenInclude(poi => poi.Item)
                .AsQueryable();

            if (supplierId.HasValue)
            {
                query = query.Where(po => po.SupplierId == supplierId.Value);
            }

            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(po => po.Status == status);
            }

            var purchaseOrders = await query.OrderByDescending(po => po.PODate).ToListAsync();
            var purchaseOrderDtos = _mapper.Map<IEnumerable<PurchaseOrderDto>>(purchaseOrders);

            Response.Headers.Add("X-Total-Count", purchaseOrders.Count.ToString());
            Response.Headers.Add("X-Page-Number", "1");
            Response.Headers.Add("X-Page-Size", purchaseOrders.Count.ToString());

            return Ok(purchaseOrderDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving purchase orders");
            return StatusCode(500, "An error occurred while retrieving purchase orders");
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<PurchaseOrderDto>> GetPurchaseOrder(int id)
    {
        try
        {
            var purchaseOrder = await _context.PurchaseOrders
                .Include(po => po.Supplier)
                .Include(po => po.PurchaseOrderItems)
                    .ThenInclude(poi => poi.Item)
                .FirstOrDefaultAsync(po => po.Id == id);

            if (purchaseOrder == null)
            {
                return NotFound($"Purchase order with ID {id} not found");
            }

            var purchaseOrderDto = _mapper.Map<PurchaseOrderDto>(purchaseOrder);
            return Ok(purchaseOrderDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving purchase order {PurchaseOrderId}", id);
            return StatusCode(500, "An error occurred while retrieving the purchase order");
        }
    }

    [HttpPost]
    public async Task<ActionResult<PurchaseOrderDto>> CreatePurchaseOrder(CreatePurchaseOrderDto createPurchaseOrderDto)
    {
        try
        {
            var supplier = await _context.Suppliers.FindAsync(createPurchaseOrderDto.SupplierId);
            if (supplier == null)
            {
                return BadRequest($"Supplier with ID {createPurchaseOrderDto.SupplierId} not found");
            }

            foreach (var poItem in createPurchaseOrderDto.PurchaseOrderItems)
            {
                var item = await _context.Items.FindAsync(poItem.ItemId);
                if (item == null)
                {
                    return BadRequest($"Item with ID {poItem.ItemId} not found");
                }
            }

            var purchaseOrder = _mapper.Map<PurchaseOrder>(createPurchaseOrderDto);
            purchaseOrder.PONumber = await GeneratePONumber();
            purchaseOrder.CreatedAt = DateTime.UtcNow;
            purchaseOrder.UpdatedAt = DateTime.UtcNow;

            decimal subTotal = 0;
            decimal totalTax = 0;
            decimal totalDiscount = 0;

            foreach (var poItem in purchaseOrder.PurchaseOrderItems)
            {
                var itemSubtotal = poItem.UnitPrice * poItem.OrderedQuantity;
                var discountAmount = poItem.DiscountPercentage.HasValue ? itemSubtotal * (poItem.DiscountPercentage.Value / 100) : 0;
                var afterDiscount = itemSubtotal - discountAmount;
                var taxAmount = poItem.TaxPercentage.HasValue ? afterDiscount * (poItem.TaxPercentage.Value / 100) : 0;

                poItem.DiscountAmount = discountAmount;
                poItem.TaxAmount = taxAmount;
                poItem.TotalPrice = afterDiscount + taxAmount;
                poItem.CreatedAt = DateTime.UtcNow;
                poItem.UpdatedAt = DateTime.UtcNow;

                subTotal += itemSubtotal;
                totalDiscount += discountAmount;
                totalTax += taxAmount;
            }

            purchaseOrder.SubTotal = subTotal;
            purchaseOrder.DiscountAmount = totalDiscount;
            purchaseOrder.TaxAmount = totalTax;
            purchaseOrder.TotalAmount = subTotal - totalDiscount + totalTax;

            _context.PurchaseOrders.Add(purchaseOrder);
            await _context.SaveChangesAsync();

            var purchaseOrderDto = _mapper.Map<PurchaseOrderDto>(purchaseOrder);

            Response.Headers.Add("X-Total-Count", "1");
            Response.Headers.Add("X-Page-Number", "1");
            Response.Headers.Add("X-Page-Size", "1");

            return CreatedAtAction(nameof(GetPurchaseOrder), new { id = purchaseOrder.Id }, purchaseOrderDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating purchase order");
            return StatusCode(500, "An error occurred while creating the purchase order");
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdatePurchaseOrder(int id, UpdatePurchaseOrderDto updatePurchaseOrderDto)
    {
        try
        {
            var purchaseOrder = await _context.PurchaseOrders.FindAsync(id);
            if (purchaseOrder == null)
            {
                return NotFound($"Purchase order with ID {id} not found");
            }

            if (purchaseOrder.Status != "Draft")
            {
                return BadRequest("Only draft purchase orders can be updated");
            }

            _mapper.Map(updatePurchaseOrderDto, purchaseOrder);
            purchaseOrder.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating purchase order {PurchaseOrderId}", id);
            return StatusCode(500, "An error occurred while updating the purchase order");
        }
    }

    [HttpPost("{id}/send")]
    public async Task<IActionResult> SendPurchaseOrder(int id)
    {
        try
        {
            var purchaseOrder = await _context.PurchaseOrders.FindAsync(id);
            if (purchaseOrder == null)
            {
                return NotFound($"Purchase order with ID {id} not found");
            }

            if (purchaseOrder.Status != "Draft")
            {
                return BadRequest("Only draft purchase orders can be sent");
            }

            purchaseOrder.Status = "Sent";
            purchaseOrder.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Purchase order sent successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending purchase order {PurchaseOrderId}", id);
            return StatusCode(500, "An error occurred while sending the purchase order");
        }
    }

    [HttpPost("{id}/approve")]
    public async Task<IActionResult> ApprovePurchaseOrder(int id, [FromBody] string approvedBy)
    {
        try
        {
            var purchaseOrder = await _context.PurchaseOrders.FindAsync(id);
            if (purchaseOrder == null)
            {
                return NotFound($"Purchase order with ID {id} not found");
            }

            if (purchaseOrder.Status != "Draft")
            {
                return BadRequest("Only draft purchase orders can be approved");
            }

            purchaseOrder.Status = "Sent";
            purchaseOrder.ApprovedBy = approvedBy;
            purchaseOrder.ApprovedDate = DateTime.UtcNow;
            purchaseOrder.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Purchase order approved and sent successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error approving purchase order {PurchaseOrderId}", id);
            return StatusCode(500, "An error occurred while approving the purchase order");
        }
    }

    [HttpPost("{id}/cancel")]
    public async Task<IActionResult> CancelPurchaseOrder(int id, [FromBody] string cancellationReason)
    {
        try
        {
            var purchaseOrder = await _context.PurchaseOrders.FindAsync(id);
            if (purchaseOrder == null)
            {
                return NotFound($"Purchase order with ID {id} not found");
            }

            if (purchaseOrder.Status == "Received" || purchaseOrder.Status == "Closed")
            {
                return BadRequest("Cannot cancel received or closed purchase orders");
            }

            purchaseOrder.Status = "Cancelled";
            purchaseOrder.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Purchase order cancelled successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error cancelling purchase order {PurchaseOrderId}", id);
            return StatusCode(500, "An error occurred while cancelling the purchase order");
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePurchaseOrder(int id)
    {
        try
        {
            var purchaseOrder = await _context.PurchaseOrders
                .Include(po => po.PurchaseOrderItems)
                .Include(po => po.GoodsReceipts)
                .FirstOrDefaultAsync(po => po.Id == id);

            if (purchaseOrder == null)
            {
                return NotFound($"Purchase order with ID {id} not found");
            }

            if (purchaseOrder.Status != "Draft")
            {
                return BadRequest("Only draft purchase orders can be deleted");
            }

            if (purchaseOrder.GoodsReceipts.Any())
            {
                return BadRequest("Cannot delete purchase order that has associated goods receipts");
            }

            _context.PurchaseOrders.Remove(purchaseOrder);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting purchase order {PurchaseOrderId}", id);
            return StatusCode(500, "An error occurred while deleting the purchase order");
        }
    }

    [HttpGet("pending-approval")]
    public async Task<ActionResult<IEnumerable<PurchaseOrderDto>>> GetPendingApprovalPurchaseOrders()
    {
        try
        {
            var purchaseOrders = await _context.PurchaseOrders
                .Include(po => po.Supplier)
                .Include(po => po.PurchaseOrderItems)
                    .ThenInclude(poi => poi.Item)
                .Where(po => po.Status == "Draft" && string.IsNullOrEmpty(po.ApprovedBy))
                .OrderBy(po => po.RequiredDate)
                .ToListAsync();

            var purchaseOrderDtos = _mapper.Map<IEnumerable<PurchaseOrderDto>>(purchaseOrders);
            return Ok(purchaseOrderDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving pending approval purchase orders");
            return StatusCode(500, "An error occurred while retrieving pending approval purchase orders");
        }
    }

    private async Task<string> GeneratePONumber()
    {
        var today = DateTime.UtcNow.ToString("yyyyMMdd");
        var lastPO = await _context.PurchaseOrders
            .Where(po => po.PONumber.StartsWith($"PO{today}"))
            .OrderByDescending(po => po.PONumber)
            .FirstOrDefaultAsync();

        if (lastPO == null)
        {
            return $"PO{today}001";
        }

        var lastNumber = int.Parse(lastPO.PONumber.Substring(10));
        return $"PO{today}{(lastNumber + 1):D3}";
    }
}
