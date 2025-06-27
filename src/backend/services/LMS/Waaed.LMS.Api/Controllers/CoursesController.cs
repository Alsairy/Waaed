using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Waaed.LMS.Api.Data;
using Waaed.LMS.Api.DTOs;
using Waaed.LMS.Api.Entities;
using AutoMapper;

namespace Waaed.LMS.Api.Controllers;

[ApiController]
[Route("api/lms/[controller]")]
public class CoursesController : ControllerBase
{
    private readonly LMSDbContext _context;
    private readonly IMapper _mapper;
    private readonly ILogger<CoursesController> _logger;

    public CoursesController(LMSDbContext context, IMapper mapper, ILogger<CoursesController> logger)
    {
        _context = context;
        _mapper = mapper;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CourseListDto>>> GetCourses(
        [FromQuery] string? status = null,
        [FromQuery] string? search = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        try
        {
            var query = _context.Courses
                .Include(c => c.Enrollments)
                .AsQueryable();

            if (!string.IsNullOrEmpty(status))
            {
                if (Enum.TryParse<CourseStatus>(status, true, out var courseStatus))
                {
                    query = query.Where(c => c.Status == courseStatus);
                }
            }

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(c => c.Title.Contains(search) || 
                                       c.Code.Contains(search) || 
                                       c.Description.Contains(search));
            }

            var totalCount = await query.CountAsync();
            var courses = await query
                .OrderByDescending(c => c.UpdatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var courseDtos = courses.Select(c => new CourseListDto
            {
                Id = c.Id,
                Title = c.Title,
                Code = c.Code,
                Status = c.Status.ToString(),
                StartDate = c.StartDate,
                EndDate = c.EndDate,
                InstructorName = c.InstructorId,
                EnrollmentCount = c.Enrollments.Count,
                UpdatedAt = c.UpdatedAt
            });

            Response.Headers.Add("X-Total-Count", totalCount.ToString());
            return Ok(new { data = courseDtos, totalCount });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving courses");
            return StatusCode(500, "An error occurred while retrieving courses");
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<CourseDto>> GetCourse(Guid id)
    {
        try
        {
            var course = await _context.Courses
                .Include(c => c.Modules)
                .Include(c => c.Assignments)
                .Include(c => c.Enrollments)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (course == null)
            {
                return NotFound();
            }

            var courseDto = new CourseDto
            {
                Id = course.Id,
                Title = course.Title,
                Code = course.Code,
                Description = course.Description,
                Status = course.Status.ToString(),
                StartDate = course.StartDate,
                EndDate = course.EndDate,
                InstructorId = course.InstructorId,
                InstructorName = course.InstructorId,
                TenantId = course.TenantId,
                TemplateId = course.TemplateId,
                IsTemplate = course.IsTemplate,
                SyllabusContent = course.SyllabusContent,
                Credits = course.Credits,
                Department = course.Department,
                Term = course.Term,
                CreatedAt = course.CreatedAt,
                UpdatedAt = course.UpdatedAt,
                CreatedBy = course.CreatedBy,
                UpdatedBy = course.UpdatedBy,
                EnrollmentCount = course.Enrollments.Count,
                ModuleCount = course.Modules.Count,
                AssignmentCount = course.Assignments.Count
            };

            return Ok(new { data = courseDto });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving course {CourseId}", id);
            return StatusCode(500, "An error occurred while retrieving the course");
        }
    }

    [HttpPost]
    public async Task<ActionResult<CourseDto>> CreateCourse(CreateCourseDto createCourseDto)
    {
        try
        {
            var course = new Course
            {
                Id = Guid.NewGuid(),
                Title = createCourseDto.Title,
                Code = createCourseDto.Code,
                Description = createCourseDto.Description,
                Status = CourseStatus.Draft,
                StartDate = createCourseDto.StartDate,
                EndDate = createCourseDto.EndDate,
                InstructorId = createCourseDto.InstructorId,
                TemplateId = createCourseDto.TemplateId,
                SyllabusContent = createCourseDto.SyllabusContent,
                Credits = createCourseDto.Credits,
                Department = createCourseDto.Department,
                Term = createCourseDto.Term,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                CreatedBy = createCourseDto.InstructorId,
                UpdatedBy = createCourseDto.InstructorId
            };

            _context.Courses.Add(course);
            await _context.SaveChangesAsync();

            var courseDto = _mapper.Map<CourseDto>(course);
            return CreatedAtAction(nameof(GetCourse), new { id = course.Id }, new { data = courseDto });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating course");
            return StatusCode(500, "An error occurred while creating the course");
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCourse(Guid id, UpdateCourseDto updateCourseDto)
    {
        try
        {
            var course = await _context.Courses.FindAsync(id);
            if (course == null)
            {
                return NotFound();
            }

            course.Title = updateCourseDto.Title;
            course.Description = updateCourseDto.Description;
            course.StartDate = updateCourseDto.StartDate;
            course.EndDate = updateCourseDto.EndDate;
            course.SyllabusContent = updateCourseDto.SyllabusContent;
            course.Credits = updateCourseDto.Credits;
            course.Department = updateCourseDto.Department;
            course.Term = updateCourseDto.Term;
            course.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating course {CourseId}", id);
            return StatusCode(500, "An error occurred while updating the course");
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCourse(Guid id)
    {
        try
        {
            var course = await _context.Courses.FindAsync(id);
            if (course == null)
            {
                return NotFound();
            }

            _context.Courses.Remove(course);
            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting course {CourseId}", id);
            return StatusCode(500, "An error occurred while deleting the course");
        }
    }

    [HttpPost("{id}/publish")]
    public async Task<IActionResult> PublishCourse(Guid id)
    {
        try
        {
            var course = await _context.Courses.FindAsync(id);
            if (course == null)
            {
                return NotFound();
            }

            course.Status = CourseStatus.Published;
            course.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error publishing course {CourseId}", id);
            return StatusCode(500, "An error occurred while publishing the course");
        }
    }

    [HttpPost("{id}/archive")]
    public async Task<IActionResult> ArchiveCourse(Guid id)
    {
        try
        {
            var course = await _context.Courses.FindAsync(id);
            if (course == null)
            {
                return NotFound();
            }

            course.Status = CourseStatus.Archived;
            course.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error archiving course {CourseId}", id);
            return StatusCode(500, "An error occurred while archiving the course");
        }
    }

    [HttpPost("{id}/copy")]
    public async Task<ActionResult<CourseDto>> CopyCourse(Guid id, [FromBody] string newTitle)
    {
        try
        {
            var originalCourse = await _context.Courses
                .Include(c => c.Modules)
                    .ThenInclude(m => m.Items)
                .Include(c => c.Assignments)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (originalCourse == null)
            {
                return NotFound();
            }

            var newCourse = new Course
            {
                Id = Guid.NewGuid(),
                Title = newTitle,
                Code = $"{originalCourse.Code}-COPY",
                Description = originalCourse.Description,
                Status = CourseStatus.Draft,
                StartDate = DateTime.UtcNow.AddDays(30),
                EndDate = DateTime.UtcNow.AddDays(120),
                InstructorId = originalCourse.InstructorId,
                SyllabusContent = originalCourse.SyllabusContent,
                Credits = originalCourse.Credits,
                Department = originalCourse.Department,
                Term = originalCourse.Term,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                CreatedBy = originalCourse.InstructorId,
                UpdatedBy = originalCourse.InstructorId
            };

            _context.Courses.Add(newCourse);
            await _context.SaveChangesAsync();

            var courseDto = _mapper.Map<CourseDto>(newCourse);
            return CreatedAtAction(nameof(GetCourse), new { id = newCourse.Id }, new { data = courseDto });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error copying course {CourseId}", id);
            return StatusCode(500, "An error occurred while copying the course");
        }
    }
}
