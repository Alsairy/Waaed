using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutoMapper;
using Waaed.Finance.Api.Data;
using Waaed.Finance.Api.Entities;
using Waaed.Finance.Api.DTOs;

namespace Waaed.Finance.Api.Controllers;

[ApiController]
[Route("api/finance/[controller]")]
public class FeeCategoriesController : ControllerBase
{
    private readonly FinanceDbContext _context;
    private readonly IMapper _mapper;
    private readonly ILogger<FeeCategoriesController> _logger;

    public FeeCategoriesController(FinanceDbContext context, IMapper mapper, ILogger<FeeCategoriesController> logger)
    {
        _context = context;
        _mapper = mapper;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<FeeCategoryDto>>> GetFeeCategories()
    {
        try
        {
            var feeCategories = await _context.FeeCategories
                .Include(fc => fc.FeeParticulars.Where(fp => fp.IsActive))
                .ThenInclude(fp => fp.TaxType)
                .Include(fc => fc.FeeDiscounts.Where(fd => fd.IsActive))
                .Include(fc => fc.FeeCategoryBatches)
                .Where(fc => fc.IsActive)
                .OrderBy(fc => fc.Name)
                .ToListAsync();

            var feeCategoryDtos = _mapper.Map<IEnumerable<FeeCategoryDto>>(feeCategories);
            return Ok(feeCategoryDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving fee categories");
            return StatusCode(500, "An error occurred while retrieving fee categories");
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<FeeCategoryDto>> GetFeeCategory(int id)
    {
        try
        {
            var feeCategory = await _context.FeeCategories
                .Include(fc => fc.FeeParticulars.Where(fp => fp.IsActive))
                .ThenInclude(fp => fp.TaxType)
                .Include(fc => fc.FeeDiscounts.Where(fd => fd.IsActive))
                .Include(fc => fc.FeeCategoryBatches)
                .FirstOrDefaultAsync(fc => fc.Id == id);

            if (feeCategory == null)
            {
                return NotFound($"Fee category with ID {id} not found");
            }

            var feeCategoryDto = _mapper.Map<FeeCategoryDto>(feeCategory);
            return Ok(feeCategoryDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving fee category {Id}", id);
            return StatusCode(500, "An error occurred while retrieving the fee category");
        }
    }

    [HttpPost]
    public async Task<ActionResult<FeeCategoryDto>> CreateFeeCategory(CreateFeeCategoryDto createDto)
    {
        try
        {
            var feeCategory = _mapper.Map<FeeCategory>(createDto);
            feeCategory.CreatedAt = DateTime.UtcNow;
            feeCategory.UpdatedAt = DateTime.UtcNow;

            foreach (var batchName in createDto.BatchNames)
            {
                feeCategory.FeeCategoryBatches.Add(new FeeCategoryBatch
                {
                    BatchName = batchName,
                    CreatedAt = DateTime.UtcNow
                });
            }

            _context.FeeCategories.Add(feeCategory);
            await _context.SaveChangesAsync();

            var feeCategoryDto = _mapper.Map<FeeCategoryDto>(feeCategory);
            return CreatedAtAction(nameof(GetFeeCategory), new { id = feeCategory.Id }, feeCategoryDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating fee category");
            return StatusCode(500, "An error occurred while creating the fee category");
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateFeeCategory(int id, UpdateFeeCategoryDto updateDto)
    {
        try
        {
            var feeCategory = await _context.FeeCategories.FindAsync(id);
            if (feeCategory == null)
            {
                return NotFound($"Fee category with ID {id} not found");
            }

            _mapper.Map(updateDto, feeCategory);
            feeCategory.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating fee category {Id}", id);
            return StatusCode(500, "An error occurred while updating the fee category");
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteFeeCategory(int id)
    {
        try
        {
            var feeCategory = await _context.FeeCategories.FindAsync(id);
            if (feeCategory == null)
            {
                return NotFound($"Fee category with ID {id} not found");
            }

            feeCategory.IsActive = false;
            feeCategory.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting fee category {Id}", id);
            return StatusCode(500, "An error occurred while deleting the fee category");
        }
    }

    [HttpPost("{id}/particulars")]
    public async Task<ActionResult<FeeParticularDto>> AddFeeParticular(int id, CreateFeeParticularDto createDto)
    {
        try
        {
            var feeCategory = await _context.FeeCategories.FindAsync(id);
            if (feeCategory == null)
            {
                return NotFound($"Fee category with ID {id} not found");
            }

            var feeParticular = _mapper.Map<FeeParticular>(createDto);
            feeParticular.FeeCategoryId = id;
            feeParticular.CreatedAt = DateTime.UtcNow;
            feeParticular.UpdatedAt = DateTime.UtcNow;

            _context.FeeParticulars.Add(feeParticular);
            await _context.SaveChangesAsync();

            var feeParticularDto = _mapper.Map<FeeParticularDto>(feeParticular);
            return Ok(feeParticularDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding fee particular to category {Id}", id);
            return StatusCode(500, "An error occurred while adding the fee particular");
        }
    }

    [HttpPost("{id}/discounts")]
    public async Task<ActionResult<FeeDiscountDto>> AddFeeDiscount(int id, CreateFeeDiscountDto createDto)
    {
        try
        {
            var feeCategory = await _context.FeeCategories.FindAsync(id);
            if (feeCategory == null)
            {
                return NotFound($"Fee category with ID {id} not found");
            }

            var feeDiscount = _mapper.Map<FeeDiscount>(createDto);
            feeDiscount.FeeCategoryId = id;
            feeDiscount.CreatedAt = DateTime.UtcNow;
            feeDiscount.UpdatedAt = DateTime.UtcNow;

            _context.FeeDiscounts.Add(feeDiscount);
            await _context.SaveChangesAsync();

            var feeDiscountDto = _mapper.Map<FeeDiscountDto>(feeDiscount);
            return Ok(feeDiscountDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding fee discount to category {Id}", id);
            return StatusCode(500, "An error occurred while adding the fee discount");
        }
    }

    [HttpGet("{id}/calculate-fees")]
    public async Task<ActionResult<object>> CalculateFeesForCategory(int id, [FromQuery] int? studentId = null)
    {
        try
        {
            var feeCategory = await _context.FeeCategories
                .Include(fc => fc.FeeParticulars.Where(fp => fp.IsActive))
                .ThenInclude(fp => fp.TaxType)
                .Include(fc => fc.FeeDiscounts.Where(fd => fd.IsActive))
                .FirstOrDefaultAsync(fc => fc.Id == id && fc.IsActive);

            if (feeCategory == null)
            {
                return NotFound($"Fee category with ID {id} not found");
            }

            var calculations = new List<object>();

            if (studentId.HasValue)
            {
                var student = await _context.Students.FindAsync(studentId.Value);
                if (student == null)
                {
                    return NotFound($"Student with ID {studentId} not found");
                }

                var calculation = CalculateStudentFees(feeCategory, student);
                calculations.Add(calculation);
            }
            else
            {
                var students = await _context.Students.Where(s => s.IsActive).ToListAsync();
                foreach (var student in students)
                {
                    var calculation = CalculateStudentFees(feeCategory, student);
                    calculations.Add(calculation);
                }
            }

            return Ok(calculations);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calculating fees for category {Id}", id);
            return StatusCode(500, "An error occurred while calculating fees");
        }
    }

    private object CalculateStudentFees(FeeCategory feeCategory, Student student)
    {
        decimal baseAmount = 0;
        decimal discountAmount = 0;
        decimal taxAmount = 0;

        var applicableParticulars = new List<object>();

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

                applicableParticulars.Add(new
                {
                    Name = particular.Name,
                    Amount = particular.Amount,
                    IsTaxable = particular.IsTaxable,
                    TaxRate = particular.TaxType?.TaxRate,
                    TaxAmount = particular.IsTaxable && particular.TaxType != null 
                        ? particular.Amount * (particular.TaxType.TaxRate / 100) : 0
                });
            }
        }

        var applicableDiscounts = new List<object>();
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

                applicableDiscounts.Add(new
                {
                    Name = discount.Name,
                    Type = discount.DiscountType,
                    Value = discount.DiscountValue,
                    DiscountAmount = discountValue
                });
            }
        }

        decimal totalAmount = baseAmount + taxAmount - discountAmount;

        return new
        {
            StudentId = student.Id,
            StudentName = $"{student.FirstName} {student.LastName}",
            StudentNumber = student.StudentId,
            BaseAmount = baseAmount,
            TaxAmount = taxAmount,
            DiscountAmount = discountAmount,
            TotalAmount = Math.Max(0, totalAmount),
            ApplicableParticulars = applicableParticulars,
            ApplicableDiscounts = applicableDiscounts
        };
    }
}
