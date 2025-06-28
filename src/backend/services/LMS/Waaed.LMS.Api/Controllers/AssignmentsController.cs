using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Waaed.LMS.Api.Data;
using Waaed.LMS.Api.DTOs;
using Waaed.LMS.Api.Entities;
using AutoMapper;

namespace Waaed.LMS.Api.Controllers;

[ApiController]
[Route("api/lms/courses/{courseId}/[controller]")]
public class AssignmentsController : ControllerBase
{
    private readonly LMSDbContext _context;
    private readonly IMapper _mapper;
    private readonly ILogger<AssignmentsController> _logger;

    public AssignmentsController(LMSDbContext context, IMapper mapper, ILogger<AssignmentsController> logger)
    {
        _context = context;
        _mapper = mapper;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<AssignmentListDto>>> GetAssignments(
        Guid courseId,
        [FromQuery] string? status = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        try
        {
            var query = _context.Assignments
                .Include(a => a.Submissions)
                .Where(a => a.CourseId == courseId);

            var totalCount = await query.CountAsync();
            var assignments = await query
                .OrderBy(a => a.DueDate ?? DateTime.MaxValue)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var assignmentDtos = assignments.Select(a => new AssignmentListDto
            {
                Id = a.Id,
                Title = a.Title,
                Points = a.Points,
                DueDate = a.DueDate,
                GradingType = a.GradingType.ToString(),
                SubmissionCount = a.Submissions.Count,
                GradedCount = a.Submissions.Count(s => s.Grade != null),
                UpdatedAt = a.UpdatedAt
            });

            Response.Headers.Add("X-Total-Count", totalCount.ToString());
            return Ok(new { data = assignmentDtos, totalCount });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving assignments for course {CourseId}", courseId);
            return StatusCode(500, "An error occurred while retrieving assignments");
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<AssignmentDto>> GetAssignment(Guid courseId, Guid id)
    {
        try
        {
            var assignment = await _context.Assignments
                .Include(a => a.Submissions)
                .Include(a => a.Rubric)
                .FirstOrDefaultAsync(a => a.Id == id && a.CourseId == courseId);

            if (assignment == null)
            {
                return NotFound();
            }

            var assignmentDto = new AssignmentDto
            {
                Id = assignment.Id,
                CourseId = assignment.CourseId,
                Title = assignment.Title,
                Description = assignment.Description,
                Instructions = assignment.Instructions,
                Points = assignment.Points,
                DueDate = assignment.DueDate,
                AvailableFrom = assignment.AvailableFrom,
                AvailableUntil = assignment.AvailableUntil,
                SubmissionType = assignment.SubmissionType.ToString(),
                AllowedFileTypes = assignment.AllowedFileTypes,
                AllowLateSubmissions = assignment.AllowLateSubmissions,
                LatePenaltyPercent = assignment.LatePenaltyPercent,
                MaxAttempts = assignment.MaxAttempts,
                GradingType = assignment.GradingType.ToString(),
                RubricId = assignment.RubricId,
                PeerReviewEnabled = assignment.PeerReviewEnabled,
                PeerReviewCount = assignment.PeerReviewCount,
                PeerReviewDueDate = assignment.PeerReviewDueDate,
                GroupAssignment = assignment.GroupAssignment,
                GroupSetId = assignment.GroupSetId,
                CreatedAt = assignment.CreatedAt,
                UpdatedAt = assignment.UpdatedAt,
                CreatedBy = assignment.CreatedBy,
                SubmissionCount = assignment.Submissions.Count,
                GradedCount = assignment.Submissions.Count(s => s.Grade != null)
            };

            return Ok(new { data = assignmentDto });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving assignment {AssignmentId}", id);
            return StatusCode(500, "An error occurred while retrieving the assignment");
        }
    }

    [HttpPost]
    public async Task<ActionResult<AssignmentDto>> CreateAssignment(Guid courseId, CreateAssignmentDto createAssignmentDto)
    {
        try
        {
            if (!Enum.TryParse<AssignmentSubmissionType>(createAssignmentDto.SubmissionType, out var submissionType))
            {
                return BadRequest("Invalid submission type");
            }

            if (!Enum.TryParse<GradingType>(createAssignmentDto.GradingType, out var gradingType))
            {
                return BadRequest("Invalid grading type");
            }

            var assignment = new Assignment
            {
                Id = Guid.NewGuid(),
                CourseId = courseId,
                Title = createAssignmentDto.Title,
                Description = createAssignmentDto.Description,
                Instructions = createAssignmentDto.Instructions,
                Points = createAssignmentDto.Points,
                DueDate = createAssignmentDto.DueDate,
                AvailableFrom = createAssignmentDto.AvailableFrom,
                AvailableUntil = createAssignmentDto.AvailableUntil,
                SubmissionType = submissionType,
                AllowedFileTypes = createAssignmentDto.AllowedFileTypes,
                AllowLateSubmissions = createAssignmentDto.AllowLateSubmissions,
                LatePenaltyPercent = createAssignmentDto.LatePenaltyPercent,
                MaxAttempts = createAssignmentDto.MaxAttempts,
                GradingType = gradingType,
                RubricId = createAssignmentDto.RubricId,
                PeerReviewEnabled = createAssignmentDto.PeerReviewEnabled,
                PeerReviewCount = createAssignmentDto.PeerReviewCount,
                PeerReviewDueDate = createAssignmentDto.PeerReviewDueDate,
                GroupAssignment = createAssignmentDto.GroupAssignment,
                GroupSetId = createAssignmentDto.GroupSetId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                CreatedBy = "current-user-id"
            };

            _context.Assignments.Add(assignment);
            await _context.SaveChangesAsync();

            var assignmentDto = _mapper.Map<AssignmentDto>(assignment);
            return CreatedAtAction(nameof(GetAssignment), new { courseId, id = assignment.Id }, new { data = assignmentDto });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating assignment");
            return StatusCode(500, "An error occurred while creating the assignment");
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateAssignment(Guid courseId, Guid id, UpdateAssignmentDto updateAssignmentDto)
    {
        try
        {
            var assignment = await _context.Assignments
                .FirstOrDefaultAsync(a => a.Id == id && a.CourseId == courseId);

            if (assignment == null)
            {
                return NotFound();
            }

            assignment.Title = updateAssignmentDto.Title;
            assignment.Description = updateAssignmentDto.Description;
            assignment.Instructions = updateAssignmentDto.Instructions;
            assignment.Points = updateAssignmentDto.Points;
            assignment.DueDate = updateAssignmentDto.DueDate;
            assignment.AvailableFrom = updateAssignmentDto.AvailableFrom;
            assignment.AvailableUntil = updateAssignmentDto.AvailableUntil;
            assignment.AllowLateSubmissions = updateAssignmentDto.AllowLateSubmissions;
            assignment.LatePenaltyPercent = updateAssignmentDto.LatePenaltyPercent;
            assignment.MaxAttempts = updateAssignmentDto.MaxAttempts;
            assignment.RubricId = updateAssignmentDto.RubricId;
            assignment.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating assignment {AssignmentId}", id);
            return StatusCode(500, "An error occurred while updating the assignment");
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteAssignment(Guid courseId, Guid id)
    {
        try
        {
            var assignment = await _context.Assignments
                .FirstOrDefaultAsync(a => a.Id == id && a.CourseId == courseId);

            if (assignment == null)
            {
                return NotFound();
            }

            _context.Assignments.Remove(assignment);
            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting assignment {AssignmentId}", id);
            return StatusCode(500, "An error occurred while deleting the assignment");
        }
    }
}
