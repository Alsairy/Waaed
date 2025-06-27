using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutoMapper;
using AttendancePlatform.Inventory.Api.Data;
using AttendancePlatform.Inventory.Api.Entities;
using AttendancePlatform.Inventory.Api.DTOs;

namespace AttendancePlatform.Inventory.Api.Controllers;

[ApiController]
[Route("api/inventory/[controller]")]
public class GoodsReceiptsController : ControllerBase
{
    private readonly InventoryDbContext _context;
    private readonly IMapper _mapper;
    private readonly ILogger<GoodsReceiptsController> _logger;

    public GoodsReceiptsController(InventoryDbContext context, IMapper mapper, ILogger<GoodsReceiptsController> logger)
    {
        _context = context;
        _mapper = mapper;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<GoodsReceiptDto>>> GetGoodsReceipts([FromQuery] int? supplierId = null, [FromQuery] string? status = null)
    {
        try
        {
            var query = _context.GoodsReceipts
                .Include(gr => gr.Supplier)
                .Include(gr => gr.PurchaseOrder)
                .Include(gr => gr.GoodsReceiptItems)
                    .ThenInclude(gri => gri.Item)
                .AsQueryable();

            if (supplierId.HasValue)
            {
                query = query.Where(gr => gr.SupplierId == supplierId.Value);
            }

            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(gr => gr.Status == status);
            }

            var goodsReceipts = await query.OrderByDescending(gr => gr.GRNDate).ToListAsync();
            var goodsReceiptDtos = _mapper.Map<IEnumerable<GoodsReceiptDto>>(goodsReceipts);

            Response.Headers.Add("X-Total-Count", goodsReceipts.Count.ToString());
            Response.Headers.Add("X-Page-Number", "1");
            Response.Headers.Add("X-Page-Size", goodsReceipts.Count.ToString());

            return Ok(goodsReceiptDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving goods receipts");
            return StatusCode(500, "An error occurred while retrieving goods receipts");
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<GoodsReceiptDto>> GetGoodsReceipt(int id)
    {
        try
        {
            var goodsReceipt = await _context.GoodsReceipts
                .Include(gr => gr.Supplier)
                .Include(gr => gr.PurchaseOrder)
                .Include(gr => gr.GoodsReceiptItems)
                    .ThenInclude(gri => gri.Item)
                .FirstOrDefaultAsync(gr => gr.Id == id);

            if (goodsReceipt == null)
            {
                return NotFound($"Goods receipt with ID {id} not found");
            }

            var goodsReceiptDto = _mapper.Map<GoodsReceiptDto>(goodsReceipt);
            return Ok(goodsReceiptDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving goods receipt {GoodsReceiptId}", id);
            return StatusCode(500, "An error occurred while retrieving the goods receipt");
        }
    }

    [HttpPost]
    public async Task<ActionResult<GoodsReceiptDto>> CreateGoodsReceipt(CreateGoodsReceiptDto createGoodsReceiptDto)
    {
        try
        {
            var supplier = await _context.Suppliers.FindAsync(createGoodsReceiptDto.SupplierId);
            if (supplier == null)
            {
                return BadRequest($"Supplier with ID {createGoodsReceiptDto.SupplierId} not found");
            }

            if (createGoodsReceiptDto.PurchaseOrderId.HasValue)
            {
                var purchaseOrder = await _context.PurchaseOrders.FindAsync(createGoodsReceiptDto.PurchaseOrderId.Value);
                if (purchaseOrder == null)
                {
                    return BadRequest($"Purchase order with ID {createGoodsReceiptDto.PurchaseOrderId.Value} not found");
                }
            }

            foreach (var grItem in createGoodsReceiptDto.GoodsReceiptItems)
            {
                var item = await _context.Items.FindAsync(grItem.ItemId);
                if (item == null)
                {
                    return BadRequest($"Item with ID {grItem.ItemId} not found");
                }
            }

            var goodsReceipt = _mapper.Map<GoodsReceipt>(createGoodsReceiptDto);
            goodsReceipt.GRNNumber = await GenerateGRNNumber();
            goodsReceipt.CreatedAt = DateTime.UtcNow;
            goodsReceipt.UpdatedAt = DateTime.UtcNow;

            decimal totalAmount = 0;
            foreach (var grItem in goodsReceipt.GoodsReceiptItems)
            {
                grItem.TotalPrice = grItem.UnitPrice * grItem.ReceivedQuantity;
                totalAmount += grItem.TotalPrice;
                grItem.CreatedAt = DateTime.UtcNow;
                grItem.UpdatedAt = DateTime.UtcNow;
            }

            goodsReceipt.TotalAmount = totalAmount;

            _context.GoodsReceipts.Add(goodsReceipt);
            await _context.SaveChangesAsync();

            var goodsReceiptDto = _mapper.Map<GoodsReceiptDto>(goodsReceipt);

            Response.Headers.Add("X-Total-Count", "1");
            Response.Headers.Add("X-Page-Number", "1");
            Response.Headers.Add("X-Page-Size", "1");

            return CreatedAtAction(nameof(GetGoodsReceipt), new { id = goodsReceipt.Id }, goodsReceiptDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating goods receipt");
            return StatusCode(500, "An error occurred while creating the goods receipt");
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateGoodsReceipt(int id, UpdateGoodsReceiptDto updateGoodsReceiptDto)
    {
        try
        {
            var goodsReceipt = await _context.GoodsReceipts.FindAsync(id);
            if (goodsReceipt == null)
            {
                return NotFound($"Goods receipt with ID {id} not found");
            }

            if (goodsReceipt.Status == "Posted")
            {
                return BadRequest("Posted goods receipts cannot be updated");
            }

            _mapper.Map(updateGoodsReceiptDto, goodsReceipt);
            goodsReceipt.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating goods receipt {GoodsReceiptId}", id);
            return StatusCode(500, "An error occurred while updating the goods receipt");
        }
    }

    [HttpPost("{id}/quality-approval")]
    public async Task<IActionResult> QualityApproval(int id, QualityApprovalDto qualityApprovalDto)
    {
        try
        {
            var goodsReceipt = await _context.GoodsReceipts
                .Include(gr => gr.GoodsReceiptItems)
                    .ThenInclude(gri => gri.Item)
                .FirstOrDefaultAsync(gr => gr.Id == id);

            if (goodsReceipt == null)
            {
                return NotFound($"Goods receipt with ID {id} not found");
            }

            if (goodsReceipt.Status != "Received")
            {
                return BadRequest("Only received goods receipts can undergo quality approval");
            }

            goodsReceipt.IsQualityApproved = qualityApprovalDto.IsQualityApproved;
            goodsReceipt.QualityApprovedBy = qualityApprovalDto.QualityApprovedBy;
            goodsReceipt.QualityApprovedDate = DateTime.UtcNow;
            goodsReceipt.QualityNotes = qualityApprovalDto.QualityNotes;
            goodsReceipt.Status = qualityApprovalDto.IsQualityApproved ? "Accepted" : "Rejected";
            goodsReceipt.UpdatedAt = DateTime.UtcNow;

            foreach (var approvalItem in qualityApprovalDto.Items)
            {
                var grItem = goodsReceipt.GoodsReceiptItems.FirstOrDefault(gri => gri.Id == approvalItem.GoodsReceiptItemId);
                if (grItem != null)
                {
                    grItem.AcceptedQuantity = approvalItem.AcceptedQuantity;
                    grItem.RejectedQuantity = approvalItem.RejectedQuantity;
                    grItem.QualityNotes = approvalItem.QualityNotes;
                    grItem.RejectionReason = approvalItem.RejectionReason;
                    grItem.UpdatedAt = DateTime.UtcNow;

                    if (approvalItem.RejectedQuantity > 0)
                    {
                        grItem.Status = approvalItem.AcceptedQuantity > 0 ? "Partial" : "Rejected";
                    }
                    else
                    {
                        grItem.Status = "Accepted";
                    }
                }
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "Quality approval completed successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing quality approval for goods receipt {GoodsReceiptId}", id);
            return StatusCode(500, "An error occurred while processing quality approval");
        }
    }

    [HttpPost("{id}/post")]
    public async Task<IActionResult> PostGoodsReceipt(int id)
    {
        try
        {
            var goodsReceipt = await _context.GoodsReceipts
                .Include(gr => gr.GoodsReceiptItems)
                    .ThenInclude(gri => gri.Item)
                .Include(gr => gr.PurchaseOrder)
                    .ThenInclude(po => po.PurchaseOrderItems)
                .FirstOrDefaultAsync(gr => gr.Id == id);

            if (goodsReceipt == null)
            {
                return NotFound($"Goods receipt with ID {id} not found");
            }

            if (goodsReceipt.Status != "Accepted")
            {
                return BadRequest("Only accepted goods receipts can be posted");
            }

            foreach (var grItem in goodsReceipt.GoodsReceiptItems)
            {
                if (grItem.Item != null)
                {
                    grItem.Item.CurrentStock += grItem.AcceptedQuantity;
                    grItem.Item.UpdatedAt = DateTime.UtcNow;
                }

                if (grItem.PurchaseOrderItem != null)
                {
                    grItem.PurchaseOrderItem.ReceivedQuantity += grItem.AcceptedQuantity;
                    grItem.PurchaseOrderItem.UpdatedAt = DateTime.UtcNow;

                    if (grItem.PurchaseOrderItem.ReceivedQuantity >= grItem.PurchaseOrderItem.OrderedQuantity)
                    {
                        grItem.PurchaseOrderItem.Status = "Received";
                    }
                    else
                    {
                        grItem.PurchaseOrderItem.Status = "Partially Received";
                    }
                }
            }

            if (goodsReceipt.PurchaseOrder != null)
            {
                var allItemsReceived = goodsReceipt.PurchaseOrder.PurchaseOrderItems
                    .All(poi => poi.ReceivedQuantity >= poi.OrderedQuantity);

                if (allItemsReceived)
                {
                    goodsReceipt.PurchaseOrder.Status = "Received";
                }
                else
                {
                    goodsReceipt.PurchaseOrder.Status = "Partially Received";
                }
                goodsReceipt.PurchaseOrder.UpdatedAt = DateTime.UtcNow;
            }

            goodsReceipt.Status = "Posted";
            goodsReceipt.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Goods receipt posted successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error posting goods receipt {GoodsReceiptId}", id);
            return StatusCode(500, "An error occurred while posting the goods receipt");
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteGoodsReceipt(int id)
    {
        try
        {
            var goodsReceipt = await _context.GoodsReceipts
                .Include(gr => gr.GoodsReceiptItems)
                .FirstOrDefaultAsync(gr => gr.Id == id);

            if (goodsReceipt == null)
            {
                return NotFound($"Goods receipt with ID {id} not found");
            }

            if (goodsReceipt.Status == "Posted")
            {
                return BadRequest("Posted goods receipts cannot be deleted");
            }

            _context.GoodsReceipts.Remove(goodsReceipt);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting goods receipt {GoodsReceiptId}", id);
            return StatusCode(500, "An error occurred while deleting the goods receipt");
        }
    }

    private async Task<string> GenerateGRNNumber()
    {
        var today = DateTime.UtcNow.ToString("yyyyMMdd");
        var lastGRN = await _context.GoodsReceipts
            .Where(gr => gr.GRNNumber.StartsWith($"GRN{today}"))
            .OrderByDescending(gr => gr.GRNNumber)
            .FirstOrDefaultAsync();

        if (lastGRN == null)
        {
            return $"GRN{today}001";
        }

        var lastNumber = int.Parse(lastGRN.GRNNumber.Substring(11));
        return $"GRN{today}{(lastNumber + 1):D3}";
    }
}
