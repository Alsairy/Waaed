using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutoMapper;
using Waaed.Tasks.Api.Data;
using Waaed.Tasks.Api.Entities;
using Waaed.Tasks.Api.DTOs;

namespace Waaed.Tasks.Api.Controllers;

[ApiController]
[Route("api/tasks/[controller]")]
public class AttachmentsController : ControllerBase
{
    private readonly TasksDbContext _context;
    private readonly IMapper _mapper;
    private readonly ILogger<AttachmentsController> _logger;

    public AttachmentsController(TasksDbContext context, IMapper mapper, ILogger<AttachmentsController> logger)
    {
        _context = context;
        _mapper = mapper;
        _logger = logger;
    }

    [HttpGet("task/{taskId}")]
    public async Task<ActionResult<IEnumerable<TaskAttachmentDto>>> GetAttachmentsByTask(Guid taskId)
    {
        try
        {
            var attachments = await _context.TaskAttachments
                .Where(a => a.TaskId == taskId)
                .OrderBy(a => a.CreatedAt)
                .ToListAsync();

            var attachmentDtos = _mapper.Map<IEnumerable<TaskAttachmentDto>>(attachments);
            return Ok(attachmentDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving attachments for task {TaskId}", taskId);
            return StatusCode(500, "An error occurred while retrieving attachments");
        }
    }

    [HttpPost]
    public async Task<ActionResult<TaskAttachmentDto>> UploadAttachment([FromForm] IFormFile file, [FromForm] Guid taskId)
    {
        try
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest("No file provided");
            }

            var uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "uploads", "tasks");
            Directory.CreateDirectory(uploadsPath);

            var fileName = $"{Guid.NewGuid()}_{file.FileName}";
            var filePath = Path.Combine(uploadsPath, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var attachment = new TaskAttachment
            {
                Id = Guid.NewGuid(),
                TaskId = taskId,
                FileName = file.FileName,
                FilePath = filePath,
                FileType = file.ContentType,
                FileSize = file.Length,
                UploadedBy = Guid.NewGuid(), // TODO: Get from authenticated user
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.TaskAttachments.Add(attachment);
            await _context.SaveChangesAsync();

            var attachmentDto = _mapper.Map<TaskAttachmentDto>(attachment);
            return CreatedAtAction(nameof(GetAttachmentsByTask), new { taskId = attachment.TaskId }, attachmentDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading task attachment");
            return StatusCode(500, "An error occurred while uploading the attachment");
        }
    }

    [HttpGet("{id}/download")]
    public async Task<ActionResult> DownloadAttachment(Guid id)
    {
        try
        {
            var attachment = await _context.TaskAttachments.FindAsync(id);
            if (attachment == null)
            {
                return NotFound($"Attachment with ID {id} not found");
            }

            if (!System.IO.File.Exists(attachment.FilePath))
            {
                return NotFound("File not found on disk");
            }

            var fileBytes = await System.IO.File.ReadAllBytesAsync(attachment.FilePath);
            return File(fileBytes, attachment.FileType, attachment.FileName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error downloading attachment {Id}", id);
            return StatusCode(500, "An error occurred while downloading the attachment");
        }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteAttachment(Guid id)
    {
        try
        {
            var attachment = await _context.TaskAttachments.FindAsync(id);
            if (attachment == null)
            {
                return NotFound($"Attachment with ID {id} not found");
            }

            if (System.IO.File.Exists(attachment.FilePath))
            {
                System.IO.File.Delete(attachment.FilePath);
            }

            _context.TaskAttachments.Remove(attachment);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting attachment {Id}", id);
            return StatusCode(500, "An error occurred while deleting the attachment");
        }
    }
}
