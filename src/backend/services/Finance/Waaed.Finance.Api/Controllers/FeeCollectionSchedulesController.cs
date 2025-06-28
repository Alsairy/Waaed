using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutoMapper;
using Waaed.Finance.Api.Data;
using Waaed.Finance.Api.Entities;
using Waaed.Finance.Api.DTOs;

namespace Waaed.Finance.Api.Controllers;

[ApiController]
[Route("api/finance/[controller]")]
public class FeeCollectionSchedulesController : ControllerBase
{
    private readonly FinanceDbContext _context;
    private readonly IMapper _mapper;
    private readonly ILogger<FeeCollectionSchedulesController> _logger;

    public FeeCollectionSchedulesController(FinanceDbContext context, IMapper mapper, ILogger<FeeCollectionSchedulesController> logger)
    {
        _context = context;
        _mapper = mapper;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<FeeCollectionScheduleDto>>> GetFeeCollectionSchedules(
        [FromQuery] string? status = null,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null)
    {
        try
        {
            var query = _context.FeeCollectionSchedules
                .Include(fcs => fcs.FeeCategory)
                .Include(fcs => fcs.StudentFeeAssignments)
                .ThenInclude(sfa => sfa.Student)
                .Where(fcs => fcs.IsActive)
                .AsQueryable();

            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(fcs => fcs.Status == status);
            }

            if (fromDate.HasValue)
            {
                query = query.Where(fcs => fcs.StartDate >= fromDate.Value);
            }

            if (toDate.HasValue)
            {
                query = query.Where(fcs => fcs.DueDate <= toDate.Value);
            }

            var schedules = await query
                .OrderByDescending(fcs => fcs.CreatedAt)
                .ToListAsync();

            var scheduleDtos = schedules.Select(schedule => MapToScheduleDto(schedule)).ToList();
            return Ok(scheduleDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving fee collection schedules");
            return StatusCode(500, "An error occurred while retrieving fee collection schedules");
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<FeeCollectionScheduleDto>> GetFeeCollectionSchedule(int id)
    {
        try
        {
            var schedule = await _context.FeeCollectionSchedules
                .Include(fcs => fcs.FeeCategory)
                .Include(fcs => fcs.StudentFeeAssignments)
                .ThenInclude(sfa => sfa.Student)
                .Include(fcs => fcs.StudentFeeAssignments)
                .ThenInclude(sfa => sfa.FeePayments)
                .FirstOrDefaultAsync(fcs => fcs.Id == id);

            if (schedule == null)
            {
                return NotFound($"Fee collection schedule with ID {id} not found");
            }

            var scheduleDto = MapToScheduleDto(schedule);
            return Ok(scheduleDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving fee collection schedule {Id}", id);
            return StatusCode(500, "An error occurred while retrieving the fee collection schedule");
        }
    }

    [HttpPost]
    public async Task<ActionResult<FeeCollectionScheduleDto>> CreateFeeCollectionSchedule(CreateFeeCollectionScheduleDto createDto)
    {
        try
        {
            var feeCategory = await _context.FeeCategories
                .Include(fc => fc.FeeParticulars.Where(fp => fp.IsActive))
                .ThenInclude(fp => fp.TaxType)
                .Include(fc => fc.FeeDiscounts.Where(fd => fd.IsActive))
                .Include(fc => fc.FeeCategoryBatches)
                .FirstOrDefaultAsync(fc => fc.Id == createDto.FeeCategoryId);

            if (feeCategory == null)
            {
                return BadRequest($"Fee category with ID {createDto.FeeCategoryId} not found");
            }

            var schedule = _mapper.Map<FeeCollectionSchedule>(createDto);
            schedule.CreatedAt = DateTime.UtcNow;
            schedule.UpdatedAt = DateTime.UtcNow;
            schedule.Status = "Scheduled";

            _context.FeeCollectionSchedules.Add(schedule);
            await _context.SaveChangesAsync();

            await GenerateStudentFeeAssignments(schedule, feeCategory, createDto);

            var scheduleDto = MapToScheduleDto(schedule);
            return CreatedAtAction(nameof(GetFeeCollectionSchedule), new { id = schedule.Id }, scheduleDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating fee collection schedule");
            return StatusCode(500, "An error occurred while creating the fee collection schedule");
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateFeeCollectionSchedule(int id, UpdateFeeCollectionScheduleDto updateDto)
    {
        try
        {
            var schedule = await _context.FeeCollectionSchedules.FindAsync(id);
            if (schedule == null)
            {
                return NotFound($"Fee collection schedule with ID {id} not found");
            }

            var hasPayments = await _context.FeePayments
                .AnyAsync(fp => fp.FeeCollectionScheduleId == id && fp.PaymentStatus == "Completed");

            if (hasPayments && (updateDto.DueDate != schedule.DueDate || updateDto.StartDate != schedule.StartDate))
            {
                return BadRequest("Cannot modify dates after payments have been recorded");
            }

            _mapper.Map(updateDto, schedule);
            schedule.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating fee collection schedule {Id}", id);
            return StatusCode(500, "An error occurred while updating the fee collection schedule");
        }
    }

    [HttpPost("{id}/activate")]
    public async Task<IActionResult> ActivateFeeCollectionSchedule(int id)
    {
        try
        {
            var schedule = await _context.FeeCollectionSchedules.FindAsync(id);
            if (schedule == null)
            {
                return NotFound($"Fee collection schedule with ID {id} not found");
            }

            if (schedule.Status != "Scheduled")
            {
                return BadRequest($"Cannot activate schedule with status {schedule.Status}");
            }

            schedule.Status = "Active";
            schedule.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            if (schedule.SendNotifications && schedule.NotifyOnStart)
            {
                await SendNotifications(schedule, "FeeCollectionStarted");
            }

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error activating fee collection schedule {Id}", id);
            return StatusCode(500, "An error occurred while activating the fee collection schedule");
        }
    }

    [HttpPost("{id}/close")]
    public async Task<IActionResult> CloseFeeCollectionSchedule(int id)
    {
        try
        {
            var schedule = await _context.FeeCollectionSchedules.FindAsync(id);
            if (schedule == null)
            {
                return NotFound($"Fee collection schedule with ID {id} not found");
            }

            schedule.Status = "Closed";
            schedule.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error closing fee collection schedule {Id}", id);
            return StatusCode(500, "An error occurred while closing the fee collection schedule");
        }
    }

    [HttpGet("{id}/assignments")]
    public async Task<ActionResult<IEnumerable<StudentFeeAssignmentDto>>> GetStudentFeeAssignments(
        int id,
        [FromQuery] string? paymentStatus = null,
        [FromQuery] bool? isOverdue = null)
    {
        try
        {
            var query = _context.StudentFeeAssignments
                .Include(sfa => sfa.Student)
                .Include(sfa => sfa.FeePayments)
                .Where(sfa => sfa.FeeCollectionScheduleId == id)
                .AsQueryable();

            if (!string.IsNullOrEmpty(paymentStatus))
            {
                query = query.Where(sfa => sfa.PaymentStatus == paymentStatus);
            }

            if (isOverdue.HasValue && isOverdue.Value)
            {
                query = query.Where(sfa => sfa.OverdueDate.HasValue && sfa.OverdueDate <= DateTime.UtcNow);
            }

            var assignments = await query.ToListAsync();
            var assignmentDtos = _mapper.Map<IEnumerable<StudentFeeAssignmentDto>>(assignments);

            return Ok(assignmentDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving student fee assignments for schedule {Id}", id);
            return StatusCode(500, "An error occurred while retrieving student fee assignments");
        }
    }

    [HttpPost("{id}/process-late-fees")]
    public async Task<IActionResult> ProcessLateFees(int id)
    {
        try
        {
            var schedule = await _context.FeeCollectionSchedules
                .Include(fcs => fcs.StudentFeeAssignments)
                .FirstOrDefaultAsync(fcs => fcs.Id == id);

            if (schedule == null)
            {
                return NotFound($"Fee collection schedule with ID {id} not found");
            }

            if (!schedule.HasLateFee || schedule.DueDate > DateTime.UtcNow)
            {
                return BadRequest("Late fees are not applicable for this schedule");
            }

            var overdueAssignments = schedule.StudentFeeAssignments
                .Where(sfa => sfa.PaymentStatus != "Paid" && sfa.BalanceAmount > 0)
                .ToList();

            foreach (var assignment in overdueAssignments)
            {
                var lateFee = CalculateLateFee(schedule, assignment);
                if (lateFee > 0)
                {
                    assignment.LateFeeAmount += lateFee;
                    assignment.TotalAmount += lateFee;
                    assignment.BalanceAmount += lateFee;
                    assignment.UpdatedAt = DateTime.UtcNow;

                    if (!assignment.OverdueDate.HasValue)
                    {
                        assignment.OverdueDate = DateTime.UtcNow;
                        assignment.PaymentStatus = "Overdue";
                    }
                }
            }

            await _context.SaveChangesAsync();

            return Ok(new { ProcessedAssignments = overdueAssignments.Count });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing late fees for schedule {Id}", id);
            return StatusCode(500, "An error occurred while processing late fees");
        }
    }

    private async Task GenerateStudentFeeAssignments(FeeCollectionSchedule schedule, FeeCategory feeCategory, CreateFeeCollectionScheduleDto createDto)
    {
        var students = new List<Student>();

        if (createDto.TargetStudentIds?.Any() == true)
        {
            students = await _context.Students
                .Where(s => createDto.TargetStudentIds.Contains(s.Id) && s.IsActive)
                .ToListAsync();
        }
        else if (createDto.TargetBatches?.Any() == true)
        {
            students = await _context.Students
                .Where(s => createDto.TargetBatches.Contains(s.Class) && s.IsActive)
                .ToListAsync();
        }
        else
        {
            var categoryBatches = feeCategory.FeeCategoryBatches.Select(fcb => fcb.BatchName).ToList();
            students = await _context.Students
                .Where(s => categoryBatches.Contains(s.Class) && s.IsActive)
                .ToListAsync();
        }

        foreach (var student in students)
        {
            var calculation = CalculateStudentFees(feeCategory, student);
            
            var assignment = new StudentFeeAssignment
            {
                FeeCollectionScheduleId = schedule.Id,
                StudentId = student.Id,
                BaseAmount = calculation.BaseAmount,
                DiscountAmount = calculation.DiscountAmount,
                TaxAmount = calculation.TaxAmount,
                TotalAmount = calculation.TotalAmount,
                BalanceAmount = calculation.TotalAmount,
                PaymentStatus = "Pending",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.StudentFeeAssignments.Add(assignment);
        }

        await _context.SaveChangesAsync();
    }

    private (decimal BaseAmount, decimal DiscountAmount, decimal TaxAmount, decimal TotalAmount) CalculateStudentFees(FeeCategory feeCategory, Student student)
    {
        decimal baseAmount = 0;
        decimal discountAmount = 0;
        decimal taxAmount = 0;

        foreach (var particular in feeCategory.FeeParticulars)
        {
            bool isApplicable = particular.ApplicabilityType switch
            {
                "AllStudents" => true,
                "StudentCategory" => !string.IsNullOrEmpty(particular.StudentCategory),
                "IndividualStudent" => particular.SpecificStudentId == student.Id,
                _ => false
            };

            if (isApplicable)
            {
                baseAmount += particular.Amount;
                
                if (particular.IsTaxable && particular.TaxType != null)
                {
                    taxAmount += particular.Amount * (particular.TaxType.TaxRate / 100);
                }
            }
        }

        foreach (var discount in feeCategory.FeeDiscounts.OrderBy(d => d.Priority))
        {
            bool isApplicable = discount.ApplicabilityScope switch
            {
                "BatchWide" => true,
                "StudentCategory" => !string.IsNullOrEmpty(discount.StudentCategory),
                "IndividualStudent" => discount.SpecificStudentId == student.Id,
                _ => false
            };

            if (isApplicable)
            {
                decimal discountValue = discount.DiscountType == "Percentage" 
                    ? baseAmount * (discount.DiscountValue / 100)
                    : discount.DiscountValue;

                discountAmount += discountValue;
            }
        }

        decimal totalAmount = baseAmount + taxAmount - discountAmount;

        return (
            BaseAmount: baseAmount,
            DiscountAmount: discountAmount,
            TaxAmount: taxAmount,
            TotalAmount: Math.Max(0, totalAmount)
        );
    }

    private decimal CalculateLateFee(FeeCollectionSchedule schedule, StudentFeeAssignment assignment)
    {
        if (!schedule.HasLateFee || schedule.DueDate > DateTime.UtcNow)
            return 0;

        var daysPastDue = (DateTime.UtcNow - schedule.DueDate).Days;
        if (daysPastDue <= 0)
            return 0;

        return schedule.LateFeeType switch
        {
            "FlatOneTime" => assignment.LateFeeAmount > 0 ? 0 : schedule.LateFeeAmount ?? 0,
            "FlatRecurring" => CalculateRecurringFlatFee(schedule, daysPastDue),
            "PercentageOneTime" => assignment.LateFeeAmount > 0 ? 0 : 
                assignment.BaseAmount * ((schedule.LateFeePercentage ?? 0) / 100),
            "PercentageRecurring" => CalculateRecurringPercentageFee(schedule, assignment, daysPastDue),
            _ => 0
        };
    }

    private decimal CalculateRecurringFlatFee(FeeCollectionSchedule schedule, int daysPastDue)
    {
        var interval = schedule.LateFeeRecurrenceInterval ?? 1;
        var periods = schedule.LateFeeRecurrenceType switch
        {
            "Daily" => daysPastDue / interval,
            "Weekly" => daysPastDue / (7 * interval),
            "Monthly" => daysPastDue / (30 * interval),
            _ => 0
        };

        return periods * (schedule.LateFeeAmount ?? 0);
    }

    private decimal CalculateRecurringPercentageFee(FeeCollectionSchedule schedule, StudentFeeAssignment assignment, int daysPastDue)
    {
        var interval = schedule.LateFeeRecurrenceInterval ?? 1;
        var periods = schedule.LateFeeRecurrenceType switch
        {
            "Daily" => daysPastDue / interval,
            "Weekly" => daysPastDue / (7 * interval),
            "Monthly" => daysPastDue / (30 * interval),
            _ => 0
        };

        return periods * assignment.BaseAmount * ((schedule.LateFeePercentage ?? 0) / 100);
    }

    private FeeCollectionScheduleDto MapToScheduleDto(FeeCollectionSchedule schedule)
    {
        var dto = _mapper.Map<FeeCollectionScheduleDto>(schedule);
        
        dto.FeeCategoryName = schedule.FeeCategory?.Name ?? "";
        dto.TotalStudents = schedule.StudentFeeAssignments?.Count ?? 0;
        dto.PaidStudents = schedule.StudentFeeAssignments?.Count(sfa => sfa.PaymentStatus == "Paid") ?? 0;
        dto.PendingStudents = schedule.StudentFeeAssignments?.Count(sfa => sfa.PaymentStatus == "Pending") ?? 0;
        dto.OverdueStudents = schedule.StudentFeeAssignments?.Count(sfa => sfa.PaymentStatus == "Overdue") ?? 0;
        dto.TotalAmount = schedule.StudentFeeAssignments?.Sum(sfa => sfa.TotalAmount) ?? 0;
        dto.CollectedAmount = schedule.StudentFeeAssignments?.Sum(sfa => sfa.PaidAmount) ?? 0;
        dto.PendingAmount = schedule.StudentFeeAssignments?.Sum(sfa => sfa.BalanceAmount) ?? 0;

        return dto;
    }

    private async Task SendNotifications(FeeCollectionSchedule schedule, string notificationType)
    {
        _logger.LogInformation("Sending {NotificationType} notifications for schedule {ScheduleId}", 
            notificationType, schedule.Id);
        
        await Task.CompletedTask;
    }
}

public class CreateFeeCollectionScheduleDto
{
    public int FeeCategoryId { get; set; }
    public string CollectionName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime DueDate { get; set; }
    public DateTime? EndDate { get; set; }
    public bool HasLateFee { get; set; } = false;
    public string? LateFeeType { get; set; }
    public decimal? LateFeeAmount { get; set; }
    public decimal? LateFeePercentage { get; set; }
    public string? LateFeeRecurrenceType { get; set; }
    public int? LateFeeRecurrenceInterval { get; set; }
    public bool SendNotifications { get; set; } = true;
    public bool NotifyOnStart { get; set; } = true;
    public bool NotifyBeforeDue { get; set; } = true;
    public int? NotifyDaysBefore { get; set; } = 3;
    public bool NotifyOnOverdue { get; set; } = true;
    public List<int>? TargetStudentIds { get; set; }
    public List<string>? TargetBatches { get; set; }
}

public class UpdateFeeCollectionScheduleDto
{
    public string CollectionName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime DueDate { get; set; }
    public DateTime? EndDate { get; set; }
    public bool HasLateFee { get; set; }
    public string? LateFeeType { get; set; }
    public decimal? LateFeeAmount { get; set; }
    public decimal? LateFeePercentage { get; set; }
    public string? LateFeeRecurrenceType { get; set; }
    public int? LateFeeRecurrenceInterval { get; set; }
    public bool SendNotifications { get; set; }
    public bool NotifyOnStart { get; set; }
    public bool NotifyBeforeDue { get; set; }
    public int? NotifyDaysBefore { get; set; }
    public bool NotifyOnOverdue { get; set; }
    public bool IsActive { get; set; }
}

public class StudentFeeAssignmentDto
{
    public int Id { get; set; }
    public int FeeCollectionScheduleId { get; set; }
    public int StudentId { get; set; }
    public string StudentName { get; set; } = string.Empty;
    public string StudentNumber { get; set; } = string.Empty;
    public string Class { get; set; } = string.Empty;
    public string Section { get; set; } = string.Empty;
    public string FeeCollectionName { get; set; } = string.Empty;
    public decimal BaseAmount { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal LateFeeAmount { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal PaidAmount { get; set; }
    public decimal BalanceAmount { get; set; }
    public string PaymentStatus { get; set; } = string.Empty;
    public DateTime? LastPaymentDate { get; set; }
    public DateTime? OverdueDate { get; set; }
    public bool IsWaived { get; set; }
    public string? WaiverReason { get; set; }
    public string? WaivedBy { get; set; }
    public DateTime? WaivedAt { get; set; }
    public string? Remarks { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateStudentFeeAssignmentDto
{
    public int FeeCollectionScheduleId { get; set; }
    public int StudentId { get; set; }
    public decimal BaseAmount { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal TotalAmount { get; set; }
}

public class UpdateStudentFeeAssignmentDto
{
    public decimal BaseAmount { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal LateFeeAmount { get; set; }
    public decimal TotalAmount { get; set; }
    public string PaymentStatus { get; set; } = string.Empty;
    public bool IsWaived { get; set; }
    public string? WaiverReason { get; set; }
    public string? WaivedBy { get; set; }
    public string? Remarks { get; set; }
}

public class FeePaymentDto
{
    public int Id { get; set; }
    public int StudentFeeAssignmentId { get; set; }
    public int? FeeCollectionScheduleId { get; set; }
    public string ReceiptNumber { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string PaymentMethod { get; set; } = string.Empty;
    public string? TransactionReference { get; set; }
    public string? ChequeNumber { get; set; }
    public string? BankName { get; set; }
    public DateTime? ChequeDate { get; set; }
    public DateTime PaymentDate { get; set; }
    public string PaymentStatus { get; set; } = string.Empty;
    public string? Remarks { get; set; }
    public string CollectedBy { get; set; } = string.Empty;
    public bool IsAdvancePayment { get; set; }
    public bool IsRefunded { get; set; }
    public decimal? RefundAmount { get; set; }
    public DateTime? RefundDate { get; set; }
    public string? RefundReason { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateFeePaymentDto
{
    public int StudentFeeAssignmentId { get; set; }
    public decimal Amount { get; set; }
    public string PaymentMethod { get; set; } = string.Empty;
    public string? TransactionReference { get; set; }
    public string? ChequeNumber { get; set; }
    public string? BankName { get; set; }
    public DateTime? ChequeDate { get; set; }
    public DateTime PaymentDate { get; set; } = DateTime.UtcNow;
    public string? Remarks { get; set; }
    public string CollectedBy { get; set; } = string.Empty;
    public bool IsAdvancePayment { get; set; } = false;
}

public class UpdateFeePaymentDto
{
    public string? TransactionReference { get; set; }
    public string PaymentStatus { get; set; } = string.Empty;
    public string? Remarks { get; set; }
}
