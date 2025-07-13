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
public class CommentsController : ControllerBase
{
    private readonly TasksDbContext _context;
    private readonly IMapper _mapper;
    private readonly ILogger<CommentsController> _logger;
    private readonly ICurrentUserService _currentUserService;

    public CommentsController(TasksDbContext context, IMapper mapper, ILogger<CommentsController> logger, ICurrentUserService currentUserService)
    {
        _context = context;
        _mapper = mapper;
        _logger = logger;
        _currentUserService = currentUserService;
    }

    [HttpGet("task/{taskId}")]
    public async Task<ActionResult<IEnumerable<TaskCommentDto>>> GetCommentsByTask(Guid taskId)
    {
        try
        {
            var comments = await _context.TaskComments
                .Where(c => c.TaskId == taskId && c.ParentCommentId == null)
                .Include(c => c.Replies)
                .OrderBy(c => c.CreatedAt)
                .ToListAsync();

            var commentDtos = _mapper.Map<IEnumerable<TaskCommentDto>>(comments);
            return Ok(commentDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving comments for task {TaskId}", taskId);
            return StatusCode(500, "An error occurred while retrieving comments");
        }
    }

    [HttpPost]
    public async Task<ActionResult<TaskCommentDto>> CreateComment(CreateTaskCommentDto createDto)
    {
        try
        {
            if (!_currentUserService.IsAuthenticated || !_currentUserService.UserId.HasValue)
            {
                return Unauthorized("User authentication required");
            }

            var comment = _mapper.Map<TaskComment>(createDto);
            comment.AuthorId = _currentUserService.UserId.Value;
            comment.CreatedAt = DateTime.UtcNow;
            comment.UpdatedAt = DateTime.UtcNow;

            _context.TaskComments.Add(comment);
            await _context.SaveChangesAsync();

            var commentDto = _mapper.Map<TaskCommentDto>(comment);
            return CreatedAtAction(nameof(GetCommentsByTask), new { taskId = comment.TaskId }, commentDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating task comment");
            return StatusCode(500, "An error occurred while creating the comment");
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<TaskCommentDto>> UpdateComment(Guid id, CreateTaskCommentDto updateDto)
    {
        try
        {
            var comment = await _context.TaskComments.FindAsync(id);
            if (comment == null)
            {
                return NotFound($"Comment with ID {id} not found");
            }

            comment.Content = updateDto.Content;
            comment.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            var commentDto = _mapper.Map<TaskCommentDto>(comment);
            return Ok(commentDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating comment {Id}", id);
            return StatusCode(500, "An error occurred while updating the comment");
        }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteComment(Guid id)
    {
        try
        {
            var comment = await _context.TaskComments.FindAsync(id);
            if (comment == null)
            {
                return NotFound($"Comment with ID {id} not found");
            }

            _context.TaskComments.Remove(comment);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting comment {Id}", id);
            return StatusCode(500, "An error occurred while deleting the comment");
        }
    }
}
