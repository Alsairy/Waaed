using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutoMapper;
using AttendancePlatform.Tasks.Api.Data;
using AttendancePlatform.Tasks.Api.Entities;
using AttendancePlatform.Tasks.Api.DTOs;

namespace AttendancePlatform.Tasks.Api.Controllers;

[ApiController]
[Route("api/task-attachments")]
public class TaskAttachmentsController : ControllerBase
{
    private readonly TasksDbContext _context;
    private readonly IMapper _mapper;
    private readonly ILogger<TaskAttachmentsController> _logger;

    public TaskAttachmentsController(TasksDbContext context, IMapper mapper, ILogger<TaskAttachmentsController> logger)
    {
        _context = context;
        _mapper = mapper;
        _logger = logger;
    }

    [HttpGet("task/{taskId}")]
    public async Task<ActionResult<IEnumerable<TaskAttachmentDto>>> GetTaskAttachments(
        int taskId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        try
        {
            var task = await _context.Tasks.FindAsync(taskId);
            if (task == null)
                return NotFound($"Task with ID {taskId} not found");

            var query = _context.TaskAttachments
                .Where(a => a.TaskId == taskId && !a.IsDeleted);

            var totalCount = await query.CountAsync();
            var attachments = await query
                .OrderByDescending(a => a.UploadedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var attachmentDtos = _mapper.Map<List<TaskAttachmentDto>>(attachments);

            Response.Headers["X-Total-Count"] = totalCount.ToString();
            Response.Headers["X-Page"] = page.ToString();
            Response.Headers["X-Page-Size"] = pageSize.ToString();

            return Ok(attachmentDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving attachments for task {TaskId}", taskId);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TaskAttachmentDto>> GetTaskAttachment(int id)
    {
        try
        {
            var attachment = await _context.TaskAttachments
                .FirstOrDefaultAsync(a => a.Id == id && !a.IsDeleted);

            if (attachment == null)
                return NotFound($"Attachment with ID {id} not found");

            var attachmentDto = _mapper.Map<TaskAttachmentDto>(attachment);
            return Ok(attachmentDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving attachment {AttachmentId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPost]
    public async Task<ActionResult<TaskAttachmentDto>> CreateTaskAttachment(CreateTaskAttachmentDto createAttachmentDto)
    {
        try
        {
            var task = await _context.Tasks.FindAsync(createAttachmentDto.TaskId);
            if (task == null)
                return NotFound($"Task with ID {createAttachmentDto.TaskId} not found");

            var attachment = _mapper.Map<TaskAttachment>(createAttachmentDto);
            attachment.UploadedById = 1; // TODO: Get from authenticated user context
            attachment.UploadedByName = "Current User"; // TODO: Get from authenticated user context
            attachment.UploadedByRole = "User"; // TODO: Get from authenticated user context
            attachment.UploadedAt = DateTime.UtcNow;

            _context.TaskAttachments.Add(attachment);
            await _context.SaveChangesAsync();

            var attachmentDto = _mapper.Map<TaskAttachmentDto>(attachment);
            return CreatedAtAction(nameof(GetTaskAttachment), new { id = attachment.Id }, attachmentDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating task attachment");
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTaskAttachment(int id, UpdateTaskAttachmentDto updateAttachmentDto)
    {
        try
        {
            var attachment = await _context.TaskAttachments.FindAsync(id);
            if (attachment == null)
                return NotFound($"Attachment with ID {id} not found");

            if (attachment.IsDeleted)
                return BadRequest("Cannot update deleted attachment");

            var userId = 1; // TODO: Get from authenticated user context
            if (attachment.UploadedById != userId)
                return Forbid("You can only update your own attachments");

            _mapper.Map(updateAttachmentDto, attachment);

            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating attachment {AttachmentId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTaskAttachment(int id)
    {
        try
        {
            var attachment = await _context.TaskAttachments.FindAsync(id);
            if (attachment == null)
                return NotFound($"Attachment with ID {id} not found");

            var userId = 1; // TODO: Get from authenticated user context
            if (attachment.UploadedById != userId)
                return Forbid("You can only delete your own attachments");

            attachment.IsDeleted = true;

            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting attachment {AttachmentId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("{id}/download")]
    public async Task<IActionResult> DownloadTaskAttachment(int id)
    {
        try
        {
            var attachment = await _context.TaskAttachments
                .FirstOrDefaultAsync(a => a.Id == id && !a.IsDeleted);

            if (attachment == null)
                return NotFound($"Attachment with ID {id} not found");

            return Ok(new { Message = "File download endpoint - implementation needed", FilePath = attachment.FilePath });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error downloading attachment {AttachmentId}", id);
            return StatusCode(500, "Internal server error");
        }
    }
}
