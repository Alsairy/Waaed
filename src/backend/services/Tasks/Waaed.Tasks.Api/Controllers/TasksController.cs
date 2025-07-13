using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutoMapper;
using Waaed.Tasks.Api.Data;
using Waaed.Tasks.Api.Entities;
using Waaed.Tasks.Api.DTOs;
using Waaed.Shared.Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;

namespace Waaed.Tasks.Api.Controllers;

[ApiController]
[Route("api/tasks/[controller]")]
[Authorize]
public class TasksController : ControllerBase
{
    private readonly TasksDbContext _context;
    private readonly IMapper _mapper;
    private readonly ILogger<TasksController> _logger;
    private readonly ICurrentUserService _currentUserService;

    public TasksController(TasksDbContext context, IMapper mapper, ILogger<TasksController> logger, ICurrentUserService currentUserService)
    {
        _context = context;
        _mapper = mapper;
        _logger = logger;
        _currentUserService = currentUserService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TaskDto>>> GetTasks([FromQuery] string? status = null, [FromQuery] Guid? assignedTo = null)
    {
        try
        {
            var query = _context.Tasks
                .Include(t => t.Comments)
                .Include(t => t.Attachments)
                .AsQueryable();

            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(t => t.Status == status);
            }

            if (assignedTo.HasValue)
            {
                query = query.Where(t => t.AssignedTo == assignedTo.Value);
            }

            var tasks = await query
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();

            var taskDtos = _mapper.Map<IEnumerable<TaskDto>>(tasks);
            return Ok(taskDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving tasks");
            return StatusCode(500, "An error occurred while retrieving tasks");
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TaskDto>> GetTask(Guid id)
    {
        try
        {
            var task = await _context.Tasks
                .Include(t => t.Comments)
                .ThenInclude(c => c.Replies)
                .Include(t => t.Attachments)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (task == null)
            {
                return NotFound($"Task with ID {id} not found");
            }

            var taskDto = _mapper.Map<TaskDto>(task);
            return Ok(taskDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving task {Id}", id);
            return StatusCode(500, "An error occurred while retrieving the task");
        }
    }

    [HttpPost]
    public async Task<ActionResult<TaskDto>> CreateTask(CreateTaskDto createDto)
    {
        try
        {
            if (!_currentUserService.IsAuthenticated || !_currentUserService.UserId.HasValue)
            {
                return Unauthorized("User authentication required");
            }

            var task = _mapper.Map<Entities.Task>(createDto);
            task.CreatedBy = _currentUserService.UserId.Value;
            task.Status = "Not Started";
            task.CreatedAt = DateTime.UtcNow;
            task.UpdatedAt = DateTime.UtcNow;

            _context.Tasks.Add(task);
            await _context.SaveChangesAsync();

            var taskDto = _mapper.Map<TaskDto>(task);
            return CreatedAtAction(nameof(GetTask), new { id = task.Id }, taskDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating task");
            return StatusCode(500, "An error occurred while creating the task");
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<TaskDto>> UpdateTask(Guid id, CreateTaskDto updateDto)
    {
        try
        {
            var task = await _context.Tasks.FindAsync(id);
            if (task == null)
            {
                return NotFound($"Task with ID {id} not found");
            }

            _mapper.Map(updateDto, task);
            task.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            var taskDto = _mapper.Map<TaskDto>(task);
            return Ok(taskDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating task {Id}", id);
            return StatusCode(500, "An error occurred while updating the task");
        }
    }

    [HttpPut("{id}/status")]
    public async Task<ActionResult> UpdateTaskStatus(Guid id, [FromBody] string status)
    {
        try
        {
            var task = await _context.Tasks.FindAsync(id);
            if (task == null)
            {
                return NotFound($"Task with ID {id} not found");
            }

            task.Status = status;
            task.UpdatedAt = DateTime.UtcNow;

            if (status == "Completed")
            {
                task.CompletedAt = DateTime.UtcNow;
                task.Progress = 100;
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "Task status updated successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating task status {Id}", id);
            return StatusCode(500, "An error occurred while updating the task status");
        }
    }

    [HttpPut("{id}/progress")]
    public async Task<ActionResult> UpdateTaskProgress(Guid id, [FromBody] int progress)
    {
        try
        {
            var task = await _context.Tasks.FindAsync(id);
            if (task == null)
            {
                return NotFound($"Task with ID {id} not found");
            }

            task.Progress = Math.Max(0, Math.Min(100, progress));
            task.UpdatedAt = DateTime.UtcNow;

            if (task.Progress == 100 && task.Status != "Completed")
            {
                task.Status = "Completed";
                task.CompletedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "Task progress updated successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating task progress {Id}", id);
            return StatusCode(500, "An error occurred while updating the task progress");
        }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteTask(Guid id)
    {
        try
        {
            var task = await _context.Tasks.FindAsync(id);
            if (task == null)
            {
                return NotFound($"Task with ID {id} not found");
            }

            _context.Tasks.Remove(task);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting task {Id}", id);
            return StatusCode(500, "An error occurred while deleting the task");
        }
    }
}
