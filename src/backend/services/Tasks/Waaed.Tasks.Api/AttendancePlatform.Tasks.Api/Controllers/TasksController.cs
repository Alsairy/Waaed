using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutoMapper;
using AttendancePlatform.Tasks.Api.Data;
using AttendancePlatform.Tasks.Api.Entities;
using AttendancePlatform.Tasks.Api.DTOs;

namespace AttendancePlatform.Tasks.Api.Controllers;

[ApiController]
[Route("api/tasks")]
public class TasksController : ControllerBase
{
    private readonly TasksDbContext _context;
    private readonly IMapper _mapper;
    private readonly ILogger<TasksController> _logger;

    public TasksController(TasksDbContext context, IMapper mapper, ILogger<TasksController> logger)
    {
        _context = context;
        _mapper = mapper;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TaskDto>>> GetTasks(
        [FromQuery] string? status = null,
        [FromQuery] string? priority = null,
        [FromQuery] string? category = null,
        [FromQuery] int? assignedToId = null,
        [FromQuery] int? assignedById = null,
        [FromQuery] bool? isOverdue = null,
        [FromQuery] string? search = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        try
        {
            var query = _context.Tasks
                .Include(t => t.SubTasks)
                .Include(t => t.Comments.Where(c => !c.IsDeleted))
                .Include(t => t.Attachments.Where(a => !a.IsDeleted))
                .Where(t => t.ParentTaskId == null)
                .AsQueryable();

            if (!string.IsNullOrEmpty(status))
                query = query.Where(t => t.Status == status);

            if (!string.IsNullOrEmpty(priority))
                query = query.Where(t => t.Priority == priority);

            if (!string.IsNullOrEmpty(category))
                query = query.Where(t => t.Category == category);

            if (assignedToId.HasValue)
                query = query.Where(t => t.AssignedToId == assignedToId.Value);

            if (assignedById.HasValue)
                query = query.Where(t => t.AssignedById == assignedById.Value);

            if (isOverdue.HasValue && isOverdue.Value)
                query = query.Where(t => t.DueDate.HasValue && t.DueDate.Value < DateTime.UtcNow && t.Status != "Completed");

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(t => t.Title.Contains(search) || 
                                        t.Description.Contains(search) || 
                                        t.Notes.Contains(search) ||
                                        t.Tags.Contains(search));
            }

            var totalCount = await query.CountAsync();
            var tasks = await query
                .OrderByDescending(t => t.Priority == "Critical")
                .ThenByDescending(t => t.Priority == "High")
                .ThenByDescending(t => t.Priority == "Medium")
                .ThenBy(t => t.DueDate)
                .ThenByDescending(t => t.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var taskDtos = _mapper.Map<List<TaskDto>>(tasks);

            Response.Headers["X-Total-Count"] = totalCount.ToString();
            Response.Headers["X-Page"] = page.ToString();
            Response.Headers["X-Page-Size"] = pageSize.ToString();

            return Ok(taskDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving tasks");
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TaskDto>> GetTask(int id)
    {
        try
        {
            var task = await _context.Tasks
                .Include(t => t.SubTasks)
                .Include(t => t.Comments.Where(c => !c.IsDeleted))
                .Include(t => t.Attachments.Where(a => !a.IsDeleted))
                .FirstOrDefaultAsync(t => t.Id == id);

            if (task == null)
                return NotFound($"Task with ID {id} not found");

            var taskDto = _mapper.Map<TaskDto>(task);
            return Ok(taskDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving task {TaskId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPost]
    public async Task<ActionResult<TaskDto>> CreateTask(CreateTaskDto createTaskDto)
    {
        try
        {
            if (createTaskDto.ParentTaskId.HasValue)
            {
                var parentTask = await _context.Tasks.FindAsync(createTaskDto.ParentTaskId.Value);
                if (parentTask == null)
                    return BadRequest($"Parent task with ID {createTaskDto.ParentTaskId.Value} not found");
            }

            var task = _mapper.Map<Entities.Task>(createTaskDto);
            task.AssignedById = 1; // TODO: Get from authenticated user context
            task.AssignedByName = "Current User"; // TODO: Get from authenticated user context
            task.AssignedByRole = "Administrator"; // TODO: Get from authenticated user context
            task.AssignedToName = "Assigned User"; // TODO: Get from user service
            task.AssignedToRole = "User"; // TODO: Get from user service
            task.CreatedAt = DateTime.UtcNow;

            _context.Tasks.Add(task);
            await _context.SaveChangesAsync();

            var taskDto = _mapper.Map<TaskDto>(task);
            return CreatedAtAction(nameof(GetTask), new { id = task.Id }, taskDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating task");
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTask(int id, UpdateTaskDto updateTaskDto)
    {
        try
        {
            var task = await _context.Tasks.FindAsync(id);
            if (task == null)
                return NotFound($"Task with ID {id} not found");

            _mapper.Map(updateTaskDto, task);
            task.UpdatedAt = DateTime.UtcNow;

            if (updateTaskDto.Status == "Completed" && task.CompletedAt == null)
            {
                task.CompletedAt = DateTime.UtcNow;
                task.ProgressPercentage = 100;
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating task {TaskId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPost("{id}/complete")]
    public async Task<IActionResult> CompleteTask(int id)
    {
        try
        {
            var task = await _context.Tasks.FindAsync(id);
            if (task == null)
                return NotFound($"Task with ID {id} not found");

            if (task.Status == "Completed")
                return BadRequest("Task is already completed");

            task.Status = "Completed";
            task.CompletedAt = DateTime.UtcNow;
            task.ProgressPercentage = 100;
            task.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error completing task {TaskId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPost("{id}/start")]
    public async Task<IActionResult> StartTask(int id)
    {
        try
        {
            var task = await _context.Tasks.FindAsync(id);
            if (task == null)
                return NotFound($"Task with ID {id} not found");

            if (task.Status == "Completed")
                return BadRequest("Cannot start a completed task");

            task.Status = "InProgress";
            task.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error starting task {TaskId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPost("{id}/cancel")]
    public async Task<IActionResult> CancelTask(int id)
    {
        try
        {
            var task = await _context.Tasks.FindAsync(id);
            if (task == null)
                return NotFound($"Task with ID {id} not found");

            if (task.Status == "Completed")
                return BadRequest("Cannot cancel a completed task");

            task.Status = "Cancelled";
            task.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error cancelling task {TaskId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPut("{id}/progress")]
    public async Task<IActionResult> UpdateTaskProgress(int id, [FromBody] int progressPercentage)
    {
        try
        {
            if (progressPercentage < 0 || progressPercentage > 100)
                return BadRequest("Progress percentage must be between 0 and 100");

            var task = await _context.Tasks.FindAsync(id);
            if (task == null)
                return NotFound($"Task with ID {id} not found");

            task.ProgressPercentage = progressPercentage;
            task.UpdatedAt = DateTime.UtcNow;

            if (progressPercentage == 100 && task.Status != "Completed")
            {
                task.Status = "Completed";
                task.CompletedAt = DateTime.UtcNow;
            }
            else if (progressPercentage > 0 && task.Status == "Pending")
            {
                task.Status = "InProgress";
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating task progress {TaskId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("overdue")]
    public async Task<ActionResult<IEnumerable<TaskDto>>> GetOverdueTasks(
        [FromQuery] int? assignedToId = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        try
        {
            var query = _context.Tasks
                .Include(t => t.SubTasks)
                .Include(t => t.Comments.Where(c => !c.IsDeleted))
                .Include(t => t.Attachments.Where(a => !a.IsDeleted))
                .Where(t => t.DueDate.HasValue && 
                           t.DueDate.Value < DateTime.UtcNow && 
                           t.Status != "Completed" && 
                           t.Status != "Cancelled");

            if (assignedToId.HasValue)
                query = query.Where(t => t.AssignedToId == assignedToId.Value);

            var totalCount = await query.CountAsync();
            var tasks = await query
                .OrderBy(t => t.DueDate)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var taskDtos = _mapper.Map<List<TaskDto>>(tasks);

            Response.Headers["X-Total-Count"] = totalCount.ToString();
            Response.Headers["X-Page"] = page.ToString();
            Response.Headers["X-Page-Size"] = pageSize.ToString();

            return Ok(taskDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving overdue tasks");
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTask(int id)
    {
        try
        {
            var task = await _context.Tasks
                .Include(t => t.SubTasks)
                .Include(t => t.Comments)
                .Include(t => t.Attachments)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (task == null)
                return NotFound($"Task with ID {id} not found");

            _context.Tasks.Remove(task);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting task {TaskId}", id);
            return StatusCode(500, "Internal server error");
        }
    }
}
