using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutoMapper;
using Waaed.Finance.Api.Data;
using Waaed.Finance.Api.Entities;
using Waaed.Finance.Api.DTOs;

namespace Waaed.Finance.Api.Controllers;

[ApiController]
[Route("api/finance/[controller]")]
public class FeePaymentsController : ControllerBase
{
    private readonly FinanceDbContext _context;
    private readonly IMapper _mapper;
    private readonly ILogger<FeePaymentsController> _logger;

    public FeePaymentsController(FinanceDbContext context, IMapper mapper, ILogger<FeePaymentsController> logger)
    {
        _context = context;
        _mapper = mapper;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<FeePaymentDto>>> GetFeePayments(
        [FromQuery] int? studentId = null,
        [FromQuery] int? scheduleId = null,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        [FromQuery] string? paymentStatus = null)
    {
        try
        {
            var query = _context.FeePayments
                .Include(fp => fp.StudentFeeAssignment)
                .ThenInclude(sfa => sfa.Student)
                .Include(fp => fp.FeeCollectionSchedule)
                .AsQueryable();

            if (studentId.HasValue)
            {
                query = query.Where(fp => fp.StudentFeeAssignment.StudentId == studentId.Value);
            }

            if (scheduleId.HasValue)
            {
                query = query.Where(fp => fp.FeeCollectionScheduleId == scheduleId.Value);
            }

            if (fromDate.HasValue)
            {
                query = query.Where(fp => fp.PaymentDate >= fromDate.Value);
            }

            if (toDate.HasValue)
            {
                query = query.Where(fp => fp.PaymentDate <= toDate.Value);
            }

            if (!string.IsNullOrEmpty(paymentStatus))
            {
                query = query.Where(fp => fp.PaymentStatus == paymentStatus);
            }

            var payments = await query
                .OrderByDescending(fp => fp.PaymentDate)
                .ToListAsync();

            var paymentDtos = _mapper.Map<IEnumerable<FeePaymentDto>>(payments);
            return Ok(paymentDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving fee payments");
            return StatusCode(500, "An error occurred while retrieving fee payments");
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<FeePaymentDto>> GetFeePayment(int id)
    {
        try
        {
            var payment = await _context.FeePayments
                .Include(fp => fp.StudentFeeAssignment)
                .ThenInclude(sfa => sfa.Student)
                .Include(fp => fp.FeeCollectionSchedule)
                .FirstOrDefaultAsync(fp => fp.Id == id);

            if (payment == null)
            {
                return NotFound($"Fee payment with ID {id} not found");
            }

            var paymentDto = _mapper.Map<FeePaymentDto>(payment);
            return Ok(paymentDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving fee payment {Id}", id);
            return StatusCode(500, "An error occurred while retrieving the fee payment");
        }
    }

    [HttpPost]
    public async Task<ActionResult<FeePaymentDto>> CreateFeePayment(CreateFeePaymentDto createDto)
    {
        try
        {
            var assignment = await _context.StudentFeeAssignments
                .Include(sfa => sfa.Student)
                .Include(sfa => sfa.FeeCollectionSchedule)
                .FirstOrDefaultAsync(sfa => sfa.Id == createDto.StudentFeeAssignmentId);

            if (assignment == null)
            {
                return BadRequest($"Student fee assignment with ID {createDto.StudentFeeAssignmentId} not found");
            }

            if (createDto.Amount > assignment.BalanceAmount)
            {
                return BadRequest($"Payment amount ({createDto.Amount:C}) cannot exceed balance amount ({assignment.BalanceAmount:C})");
            }

            var payment = _mapper.Map<FeePayment>(createDto);
            payment.ReceiptNumber = await GenerateReceiptNumber();
            payment.CreatedAt = DateTime.UtcNow;
            payment.UpdatedAt = DateTime.UtcNow;
            payment.PaymentStatus = "Completed";

            _context.FeePayments.Add(payment);

            assignment.PaidAmount += payment.Amount;
            assignment.BalanceAmount -= payment.Amount;
            assignment.LastPaymentDate = payment.PaymentDate;
            assignment.UpdatedAt = DateTime.UtcNow;

            if (assignment.BalanceAmount <= 0)
            {
                assignment.PaymentStatus = "Paid";
            }
            else if (assignment.PaidAmount > 0)
            {
                assignment.PaymentStatus = "Partial";
            }

            await _context.SaveChangesAsync();

            var paymentDto = _mapper.Map<FeePaymentDto>(payment);
            return CreatedAtAction(nameof(GetFeePayment), new { id = payment.Id }, paymentDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating fee payment");
            return StatusCode(500, "An error occurred while creating the fee payment");
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateFeePayment(int id, UpdateFeePaymentDto updateDto)
    {
        try
        {
            var payment = await _context.FeePayments.FindAsync(id);
            if (payment == null)
            {
                return NotFound($"Fee payment with ID {id} not found");
            }

            if (payment.PaymentStatus == "Completed" && updateDto.PaymentStatus != "Refunded")
            {
                return BadRequest("Cannot modify completed payment unless refunding");
            }

            _mapper.Map(updateDto, payment);
            payment.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating fee payment {Id}", id);
            return StatusCode(500, "An error occurred while updating the fee payment");
        }
    }

    [HttpPost("{id}/refund")]
    public async Task<IActionResult> RefundFeePayment(int id, [FromBody] RefundRequestDto refundRequest)
    {
        try
        {
            var payment = await _context.FeePayments
                .Include(fp => fp.StudentFeeAssignment)
                .FirstOrDefaultAsync(fp => fp.Id == id);

            if (payment == null)
            {
                return NotFound($"Fee payment with ID {id} not found");
            }

            if (payment.IsRefunded)
            {
                return BadRequest("Payment has already been refunded");
            }

            if (refundRequest.RefundAmount > payment.Amount)
            {
                return BadRequest("Refund amount cannot exceed payment amount");
            }

            payment.IsRefunded = true;
            payment.RefundAmount = refundRequest.RefundAmount;
            payment.RefundDate = DateTime.UtcNow;
            payment.RefundReason = refundRequest.RefundReason;
            payment.PaymentStatus = "Refunded";
            payment.UpdatedAt = DateTime.UtcNow;

            var assignment = payment.StudentFeeAssignment;
            assignment.PaidAmount -= refundRequest.RefundAmount;
            assignment.BalanceAmount += refundRequest.RefundAmount;
            assignment.UpdatedAt = DateTime.UtcNow;

            if (assignment.BalanceAmount >= assignment.TotalAmount)
            {
                assignment.PaymentStatus = "Pending";
            }
            else if (assignment.PaidAmount > 0)
            {
                assignment.PaymentStatus = "Partial";
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error refunding fee payment {Id}", id);
            return StatusCode(500, "An error occurred while refunding the fee payment");
        }
    }

    [HttpGet("receipt/{receiptNumber}")]
    public async Task<ActionResult<FeePaymentDto>> GetPaymentByReceiptNumber(string receiptNumber)
    {
        try
        {
            var payment = await _context.FeePayments
                .Include(fp => fp.StudentFeeAssignment)
                .ThenInclude(sfa => sfa.Student)
                .Include(fp => fp.FeeCollectionSchedule)
                .FirstOrDefaultAsync(fp => fp.ReceiptNumber == receiptNumber);

            if (payment == null)
            {
                return NotFound($"Payment with receipt number {receiptNumber} not found");
            }

            var paymentDto = _mapper.Map<FeePaymentDto>(payment);
            return Ok(paymentDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving payment by receipt number {ReceiptNumber}", receiptNumber);
            return StatusCode(500, "An error occurred while retrieving the payment");
        }
    }

    [HttpGet("summary")]
    public async Task<ActionResult<object>> GetPaymentSummary(
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null)
    {
        try
        {
            var query = _context.FeePayments.AsQueryable();

            if (fromDate.HasValue)
            {
                query = query.Where(fp => fp.PaymentDate >= fromDate.Value);
            }

            if (toDate.HasValue)
            {
                query = query.Where(fp => fp.PaymentDate <= toDate.Value);
            }

            var summary = await query
                .Where(fp => fp.PaymentStatus == "Completed")
                .GroupBy(fp => 1)
                .Select(g => new
                {
                    TotalPayments = g.Count(),
                    TotalAmount = g.Sum(fp => fp.Amount),
                    AveragePayment = g.Average(fp => fp.Amount),
                    PaymentMethods = g.GroupBy(fp => fp.PaymentMethod)
                        .Select(pm => new { Method = pm.Key, Count = pm.Count(), Amount = pm.Sum(p => p.Amount) })
                        .ToList()
                })
                .FirstOrDefaultAsync();

            if (summary == null)
            {
                return Ok(new { TotalPayments = 0, TotalAmount = 0m, AveragePayment = 0m, PaymentMethods = new List<object>() });
            }
            
            return Ok(summary);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving payment summary");
            return StatusCode(500, "An error occurred while retrieving payment summary");
        }
    }

    private async Task<string> GenerateReceiptNumber()
    {
        var today = DateTime.UtcNow;
        var prefix = $"RCP{today:yyyyMMdd}";
        
        var lastReceipt = await _context.FeePayments
            .Where(fp => fp.ReceiptNumber.StartsWith(prefix))
            .OrderByDescending(fp => fp.ReceiptNumber)
            .FirstOrDefaultAsync();

        int sequence = 1;
        if (lastReceipt != null)
        {
            var lastSequence = lastReceipt.ReceiptNumber.Substring(prefix.Length);
            if (int.TryParse(lastSequence, out int lastSeq))
            {
                sequence = lastSeq + 1;
            }
        }

        return $"{prefix}{sequence:D4}";
    }
}

public class RefundRequestDto
{
    public decimal RefundAmount { get; set; }
    public string RefundReason { get; set; } = string.Empty;
}
