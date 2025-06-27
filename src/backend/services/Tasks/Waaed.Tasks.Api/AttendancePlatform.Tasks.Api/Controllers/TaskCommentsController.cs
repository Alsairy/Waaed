using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutoMapper;
using AttendancePlatform.Tasks.Api.Data;
using AttendancePlatform.Tasks.Api.Entities;
using AttendancePlatform.Tasks.Api.DTOs;

namespace AttendancePlatform.Tasks.Api.Controllers;

[ApiController]
[Route("api/task-comments")]
public class TaskCommentsController : ControllerBase
{
    private readonly TasksDbContext _context;
    private readonly IMapper _mapper;
    private readonly ILogger<TaskCommentsController> _logger;

    public TaskCommentsController(TasksDbContext context, IMapper mapper, ILogger<TaskCommentsController> logger)
    {
        _context = context;
        _mapper = mapper;
        _logger = logger;
    }

    [HttpGet("task/{taskId}")]
    public async Task<ActionResult<IEnumerable<TaskCommentDto>>> GetTaskComments(
        int taskId,
        [FromQuery] bool includeInternal = false,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        try
        {
            var task = await _context.Tasks.FindAsync(taskId);
            if (task == null)
                return NotFound($"Task with ID {taskId} not found");

            var query = _context.TaskComments
                .Where(c => c.TaskId == taskId && !c.IsDeleted);

            if (!includeInternal)
                query = query.Where(c => !c.IsInternal);

            var totalCount = await query.CountAsync();
            var comments = await query
                .OrderByDescending(c => c.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var commentDtos = _mapper.Map<List<TaskCommentDto>>(comments);

            Response.Headers["X-Total-Count"] = totalCount.ToString();
            Response.Headers["X-Page"] = page.ToString();
            Response.Headers["X-Page-Size"] = pageSize.ToString();

            return Ok(commentDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving comments for task {TaskId}", taskId);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TaskCommentDto>> GetTaskComment(int id)
    {
        try
        {
            var comment = await _context.TaskComments
                .FirstOrDefaultAsync(c => c.Id == id && !c.IsDeleted);

            if (comment == null)
                return NotFound($"Comment with ID {id} not found");

            var commentDto = _mapper.Map<TaskCommentDto>(comment);
            return Ok(commentDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving comment {CommentId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPost]
    public async Task<ActionResult<TaskCommentDto>> CreateTaskComment(CreateTaskCommentDto createCommentDto)
    {
        try
        {
            var task = await _context.Tasks.FindAsync(createCommentDto.TaskId);
            if (task == null)
                return NotFound($"Task with ID {createCommentDto.TaskId} not found");

            var comment = _mapper.Map<TaskComment>(createCommentDto);
            comment.CommenterId = 1; // TODO: Get from authenticated user context
            comment.CommenterName = "Current User"; // TODO: Get from authenticated user context
            comment.CommenterRole = "User"; // TODO: Get from authenticated user context
            comment.CreatedAt = DateTime.UtcNow;

            _context.TaskComments.Add(comment);
            await _context.SaveChangesAsync();

            var commentDto = _mapper.Map<TaskCommentDto>(comment);
            return CreatedAtAction(nameof(GetTaskComment), new { id = comment.Id }, commentDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating task comment");
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTaskComment(int id, UpdateTaskCommentDto updateCommentDto)
    {
        try
        {
            var comment = await _context.TaskComments.FindAsync(id);
            if (comment == null)
                return NotFound($"Comment with ID {id} not found");

            if (comment.IsDeleted)
                return BadRequest("Cannot update deleted comment");

            var userId = 1; // TODO: Get from authenticated user context
            if (comment.CommenterId != userId)
                return Forbid("You can only update your own comments");

            _mapper.Map(updateCommentDto, comment);
            comment.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating comment {CommentId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTaskComment(int id)
    {
        try
        {
            var comment = await _context.TaskComments.FindAsync(id);
            if (comment == null)
                return NotFound($"Comment with ID {id} not found");

            var userId = 1; // TODO: Get from authenticated user context
            if (comment.CommenterId != userId)
                return Forbid("You can only delete your own comments");

            comment.IsDeleted = true;
            comment.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting comment {CommentId}", id);
            return StatusCode(500, "Internal server error");
        }
    }
}
