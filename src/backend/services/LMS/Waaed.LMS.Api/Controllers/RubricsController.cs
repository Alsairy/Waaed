using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Waaed.LMS.Api.Data;
using Waaed.LMS.Api.DTOs;
using Waaed.LMS.Api.Entities;
using AutoMapper;

namespace Waaed.LMS.Api.Controllers;

[ApiController]
[Route("api/lms/[controller]")]
public class RubricsController : ControllerBase
{
    private readonly LMSDbContext _context;
    private readonly IMapper _mapper;
    private readonly ILogger<RubricsController> _logger;

    public RubricsController(LMSDbContext context, IMapper mapper, ILogger<RubricsController> logger)
    {
        _context = context;
        _mapper = mapper;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<RubricDto>>> GetRubrics(
        [FromQuery] bool? isPublic = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        try
        {
            var query = _context.Rubrics
                .Include(r => r.Criteria)
                    .ThenInclude(c => c.Levels)
                .AsQueryable();

            if (isPublic.HasValue)
            {
                query = query.Where(r => r.IsPublic == isPublic.Value);
            }

            var totalCount = await query.CountAsync();
            var rubrics = await query
                .OrderByDescending(r => r.UpdatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var rubricDtos = rubrics.Select(r => new RubricDto
            {
                Id = r.Id,
                Title = r.Title,
                Description = r.Description,
                Type = r.Type.ToString(),
                IsPublic = r.IsPublic,
                TenantId = r.TenantId,
                CreatedAt = r.CreatedAt,
                UpdatedAt = r.UpdatedAt,
                CreatedBy = r.CreatedBy,
                Criteria = r.Criteria.Select(c => new RubricCriterionDto
                {
                    Id = c.Id,
                    RubricId = c.RubricId,
                    Description = c.Description,
                    Points = c.Points,
                    Position = c.Position,
                    LearningOutcomeId = c.LearningOutcomeId,
                    CreatedAt = c.CreatedAt,
                    Levels = c.Levels.Select(l => new RubricLevelDto
                    {
                        Id = l.Id,
                        RubricCriterionId = l.RubricCriterionId,
                        Description = l.Description,
                        Points = l.Points,
                        Position = l.Position
                    }).OrderBy(l => l.Position).ToList()
                }).OrderBy(c => c.Position).ToList()
            });

            Response.Headers.Add("X-Total-Count", totalCount.ToString());
            return Ok(new { data = rubricDtos, totalCount });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving rubrics");
            return StatusCode(500, "An error occurred while retrieving rubrics");
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<RubricDto>> GetRubric(Guid id)
    {
        try
        {
            var rubric = await _context.Rubrics
                .Include(r => r.Criteria)
                    .ThenInclude(c => c.Levels)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (rubric == null)
            {
                return NotFound();
            }

            var rubricDto = _mapper.Map<RubricDto>(rubric);
            return Ok(new { data = rubricDto });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving rubric {RubricId}", id);
            return StatusCode(500, "An error occurred while retrieving the rubric");
        }
    }

    [HttpPost]
    public async Task<ActionResult<RubricDto>> CreateRubric(CreateRubricDto createRubricDto)
    {
        try
        {
            if (!Enum.TryParse<RubricType>(createRubricDto.Type, out var rubricType))
            {
                return BadRequest("Invalid rubric type");
            }

            var rubric = new Rubric
            {
                Id = Guid.NewGuid(),
                Title = createRubricDto.Title,
                Description = createRubricDto.Description,
                Type = rubricType,
                IsPublic = createRubricDto.IsPublic,
                TenantId = "current-tenant-id",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                CreatedBy = "current-user-id"
            };

            foreach (var criterionDto in createRubricDto.Criteria)
            {
                var criterion = new RubricCriterion
                {
                    Id = Guid.NewGuid(),
                    RubricId = rubric.Id,
                    Description = criterionDto.Description,
                    Points = criterionDto.Points,
                    Position = criterionDto.Position,
                    LearningOutcomeId = criterionDto.LearningOutcomeId,
                    CreatedAt = DateTime.UtcNow
                };

                foreach (var levelDto in criterionDto.Levels)
                {
                    var level = new RubricLevel
                    {
                        Id = Guid.NewGuid(),
                        RubricCriterionId = criterion.Id,
                        Description = levelDto.Description,
                        Points = levelDto.Points,
                        Position = levelDto.Position
                    };
                    criterion.Levels.Add(level);
                }

                rubric.Criteria.Add(criterion);
            }

            _context.Rubrics.Add(rubric);
            await _context.SaveChangesAsync();

            var rubricDto = _mapper.Map<RubricDto>(rubric);
            return CreatedAtAction(nameof(GetRubric), new { id = rubric.Id }, new { data = rubricDto });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating rubric");
            return StatusCode(500, "An error occurred while creating the rubric");
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteRubric(Guid id)
    {
        try
        {
            var rubric = await _context.Rubrics.FindAsync(id);
            if (rubric == null)
            {
                return NotFound();
            }

            _context.Rubrics.Remove(rubric);
            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting rubric {RubricId}", id);
            return StatusCode(500, "An error occurred while deleting the rubric");
        }
    }
}
