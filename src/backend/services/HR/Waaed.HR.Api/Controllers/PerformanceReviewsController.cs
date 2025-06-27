using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutoMapper;
using Waaed.HR.Api.Data;
using Waaed.HR.Api.Entities;
using Waaed.HR.Api.DTOs;

namespace Waaed.HR.Api.Controllers;

[ApiController]
[Route("api/hr/[controller]")]
public class PerformanceReviewsController : ControllerBase
{
    private readonly HRDbContext _context;
    private readonly IMapper _mapper;
    private readonly ILogger<PerformanceReviewsController> _logger;

    public PerformanceReviewsController(HRDbContext context, IMapper mapper, ILogger<PerformanceReviewsController> logger)
    {
        _context = context;
        _mapper = mapper;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<PerformanceReviewDto>>> GetPerformanceReviews(
        [FromQuery] int? employeeId = null,
        [FromQuery] int? reviewerId = null,
        [FromQuery] string? reviewPeriod = null,
        [FromQuery] string? status = null,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        [FromQuery] int? departmentId = null)
    {
        try
        {
            var query = _context.PerformanceReviews
                .Include(pr => pr.Employee)
                .ThenInclude(e => e.Department)
                .Include(pr => pr.Reviewer)
                .AsQueryable();

            if (employeeId.HasValue)
            {
                query = query.Where(pr => pr.EmployeeId == employeeId.Value);
            }

            if (reviewerId.HasValue)
            {
                query = query.Where(pr => pr.ReviewerId == reviewerId.Value);
            }

            if (!string.IsNullOrEmpty(reviewPeriod))
            {
                query = query.Where(pr => pr.ReviewPeriod == reviewPeriod);
            }

            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(pr => pr.Status == status);
            }

            if (fromDate.HasValue)
            {
                query = query.Where(pr => pr.ReviewDate >= fromDate.Value);
            }

            if (toDate.HasValue)
            {
                query = query.Where(pr => pr.ReviewDate <= toDate.Value);
            }

            if (departmentId.HasValue)
            {
                query = query.Where(pr => pr.Employee.DepartmentId == departmentId.Value);
            }

            var performanceReviews = await query
                .OrderByDescending(pr => pr.ReviewDate)
                .ToListAsync();

            var performanceReviewDtos = _mapper.Map<IEnumerable<PerformanceReviewDto>>(performanceReviews);
            return Ok(performanceReviewDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving performance reviews");
            return StatusCode(500, "An error occurred while retrieving performance reviews");
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<PerformanceReviewDto>> GetPerformanceReview(int id)
    {
        try
        {
            var performanceReview = await _context.PerformanceReviews
                .Include(pr => pr.Employee)
                .Include(pr => pr.Reviewer)
                .FirstOrDefaultAsync(pr => pr.Id == id);

            if (performanceReview == null)
            {
                return NotFound($"Performance review with ID {id} not found");
            }

            var performanceReviewDto = _mapper.Map<PerformanceReviewDto>(performanceReview);
            return Ok(performanceReviewDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving performance review {Id}", id);
            return StatusCode(500, "An error occurred while retrieving the performance review");
        }
    }

    [HttpPost]
    public async Task<ActionResult<PerformanceReviewDto>> CreatePerformanceReview(CreatePerformanceReviewDto createDto)
    {
        try
        {
            var employee = await _context.Employees.FindAsync(createDto.EmployeeId);
            if (employee == null)
            {
                return BadRequest($"Employee with ID {createDto.EmployeeId} not found");
            }

            var reviewer = await _context.Employees.FindAsync(createDto.ReviewerId);
            if (reviewer == null)
            {
                return BadRequest($"Reviewer with ID {createDto.ReviewerId} not found");
            }

            if (createDto.PeriodStartDate > createDto.PeriodEndDate)
            {
                return BadRequest("Period start date cannot be after period end date");
            }

            if (createDto.OverallRating < 0 || createDto.OverallRating > 5)
            {
                return BadRequest("Overall rating must be between 0 and 5");
            }

            var existingReview = await _context.PerformanceReviews
                .FirstOrDefaultAsync(pr => pr.EmployeeId == createDto.EmployeeId &&
                                          pr.ReviewPeriod == createDto.ReviewPeriod &&
                                          pr.PeriodStartDate == createDto.PeriodStartDate &&
                                          pr.PeriodEndDate == createDto.PeriodEndDate);

            if (existingReview != null)
            {
                return BadRequest("Performance review for this employee and period already exists");
            }

            var performanceReview = _mapper.Map<PerformanceReview>(createDto);
            performanceReview.CreatedAt = DateTime.UtcNow;
            performanceReview.UpdatedAt = DateTime.UtcNow;

            _context.PerformanceReviews.Add(performanceReview);
            await _context.SaveChangesAsync();

            var performanceReviewDto = _mapper.Map<PerformanceReviewDto>(performanceReview);
            return CreatedAtAction(nameof(GetPerformanceReview), new { id = performanceReview.Id }, performanceReviewDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating performance review");
            return StatusCode(500, "An error occurred while creating the performance review");
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdatePerformanceReview(int id, UpdatePerformanceReviewDto updateDto)
    {
        try
        {
            var performanceReview = await _context.PerformanceReviews.FindAsync(id);
            if (performanceReview == null)
            {
                return NotFound($"Performance review with ID {id} not found");
            }

            if (updateDto.PeriodStartDate > updateDto.PeriodEndDate)
            {
                return BadRequest("Period start date cannot be after period end date");
            }

            if (updateDto.OverallRating < 0 || updateDto.OverallRating > 5)
            {
                return BadRequest("Overall rating must be between 0 and 5");
            }

            _mapper.Map(updateDto, performanceReview);
            performanceReview.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating performance review {Id}", id);
            return StatusCode(500, "An error occurred while updating the performance review");
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePerformanceReview(int id)
    {
        try
        {
            var performanceReview = await _context.PerformanceReviews.FindAsync(id);
            if (performanceReview == null)
            {
                return NotFound($"Performance review with ID {id} not found");
            }

            if (performanceReview.Status == "Completed" && performanceReview.EmployeeSignedDate.HasValue)
            {
                return BadRequest("Cannot delete a completed and signed performance review");
            }

            _context.PerformanceReviews.Remove(performanceReview);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting performance review {Id}", id);
            return StatusCode(500, "An error occurred while deleting the performance review");
        }
    }

    [HttpPost("{id}/employee-sign")]
    public async Task<IActionResult> EmployeeSignReview(int id)
    {
        try
        {
            var performanceReview = await _context.PerformanceReviews.FindAsync(id);
            if (performanceReview == null)
            {
                return NotFound($"Performance review with ID {id} not found");
            }

            if (performanceReview.Status != "In Progress" && performanceReview.Status != "Pending Employee Signature")
            {
                return BadRequest("Performance review must be in progress or pending employee signature to be signed");
            }

            performanceReview.EmployeeSignedDate = DateTime.UtcNow;
            performanceReview.Status = "Pending HR Approval";
            performanceReview.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error signing performance review {Id} by employee", id);
            return StatusCode(500, "An error occurred while signing the performance review");
        }
    }

    [HttpPost("{id}/reviewer-sign")]
    public async Task<IActionResult> ReviewerSignReview(int id)
    {
        try
        {
            var performanceReview = await _context.PerformanceReviews.FindAsync(id);
            if (performanceReview == null)
            {
                return NotFound($"Performance review with ID {id} not found");
            }

            if (performanceReview.Status != "Draft" && performanceReview.Status != "In Progress")
            {
                return BadRequest("Performance review must be in draft or in progress status to be signed by reviewer");
            }

            performanceReview.ReviewerSignedDate = DateTime.UtcNow;
            performanceReview.Status = "Pending Employee Signature";
            performanceReview.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error signing performance review {Id} by reviewer", id);
            return StatusCode(500, "An error occurred while signing the performance review");
        }
    }

    [HttpPost("{id}/hr-approve")]
    public async Task<IActionResult> HRApproveReview(int id, [FromBody] string? hrComments = null)
    {
        try
        {
            var performanceReview = await _context.PerformanceReviews.FindAsync(id);
            if (performanceReview == null)
            {
                return NotFound($"Performance review with ID {id} not found");
            }

            if (performanceReview.Status != "Pending HR Approval")
            {
                return BadRequest("Performance review must be pending HR approval to be approved");
            }

            performanceReview.HRSignedDate = DateTime.UtcNow;
            performanceReview.HRComments = hrComments;
            performanceReview.Status = "Completed";
            performanceReview.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error approving performance review {Id} by HR", id);
            return StatusCode(500, "An error occurred while approving the performance review");
        }
    }

    [HttpGet("summary")]
    public async Task<ActionResult<PerformanceReviewSummaryDto>> GetPerformanceReviewSummary()
    {
        try
        {
            var totalReviews = await _context.PerformanceReviews.CountAsync();
            var completedReviews = await _context.PerformanceReviews.CountAsync(pr => pr.Status == "Completed");
            var pendingReviews = await _context.PerformanceReviews.CountAsync(pr => pr.Status != "Completed");

            var averageRating = await _context.PerformanceReviews
                .Where(pr => pr.Status == "Completed")
                .AverageAsync(pr => (double?)pr.OverallRating) ?? 0;

            var promotionRecommendations = await _context.PerformanceReviews
                .CountAsync(pr => pr.RecommendForPromotion && pr.Status == "Completed");

            var trainingRecommendations = await _context.PerformanceReviews
                .CountAsync(pr => pr.RecommendForTraining && pr.Status == "Completed");

            var averageRatingByDepartment = await _context.PerformanceReviews
                .Where(pr => pr.Status == "Completed")
                .Include(pr => pr.Employee)
                .ThenInclude(e => e.Department)
                .GroupBy(pr => pr.Employee.Department.Name)
                .Select(g => new { Department = g.Key, AverageRating = g.Average(pr => pr.OverallRating) })
                .ToDictionaryAsync(x => x.Department, x => x.AverageRating);

            var summary = new PerformanceReviewSummaryDto
            {
                TotalReviews = totalReviews,
                CompletedReviews = completedReviews,
                PendingReviews = pendingReviews,
                AverageRating = (decimal)averageRating,
                PromotionRecommendations = promotionRecommendations,
                TrainingRecommendations = trainingRecommendations,
                AverageRatingByDepartment = averageRatingByDepartment
            };

            return Ok(summary);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving performance review summary");
            return StatusCode(500, "An error occurred while retrieving the performance review summary");
        }
    }

    [HttpGet("periods")]
    public ActionResult<IEnumerable<string>> GetReviewPeriods()
    {
        var reviewPeriods = new[]
        {
            "Q1 2024",
            "Q2 2024",
            "Q3 2024",
            "Q4 2024",
            "Annual 2024",
            "Mid-Year 2024",
            "Probation Review"
        };

        return Ok(reviewPeriods);
    }

    [HttpGet("employee/{employeeId}")]
    public async Task<ActionResult<IEnumerable<PerformanceReviewDto>>> GetEmployeePerformanceReviews(int employeeId)
    {
        try
        {
            var employee = await _context.Employees.FindAsync(employeeId);
            if (employee == null)
            {
                return NotFound($"Employee with ID {employeeId} not found");
            }

            var performanceReviews = await _context.PerformanceReviews
                .Include(pr => pr.Employee)
                .Include(pr => pr.Reviewer)
                .Where(pr => pr.EmployeeId == employeeId)
                .OrderByDescending(pr => pr.ReviewDate)
                .ToListAsync();

            var performanceReviewDtos = _mapper.Map<IEnumerable<PerformanceReviewDto>>(performanceReviews);
            return Ok(performanceReviewDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving performance reviews for employee {EmployeeId}", employeeId);
            return StatusCode(500, "An error occurred while retrieving the employee's performance reviews");
        }
    }

    [HttpGet("reviewer/{reviewerId}")]
    public async Task<ActionResult<IEnumerable<PerformanceReviewDto>>> GetReviewerPerformanceReviews(int reviewerId)
    {
        try
        {
            var reviewer = await _context.Employees.FindAsync(reviewerId);
            if (reviewer == null)
            {
                return NotFound($"Reviewer with ID {reviewerId} not found");
            }

            var performanceReviews = await _context.PerformanceReviews
                .Include(pr => pr.Employee)
                .Include(pr => pr.Reviewer)
                .Where(pr => pr.ReviewerId == reviewerId)
                .OrderByDescending(pr => pr.ReviewDate)
                .ToListAsync();

            var performanceReviewDtos = _mapper.Map<IEnumerable<PerformanceReviewDto>>(performanceReviews);
            return Ok(performanceReviewDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving performance reviews for reviewer {ReviewerId}", reviewerId);
            return StatusCode(500, "An error occurred while retrieving the reviewer's performance reviews");
        }
    }
}
