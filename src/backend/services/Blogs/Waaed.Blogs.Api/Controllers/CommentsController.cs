using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutoMapper;
using Waaed.Blogs.Api.Data;
using Waaed.Blogs.Api.Entities;
using Waaed.Blogs.Api.DTOs;

namespace Waaed.Blogs.Api.Controllers;

[ApiController]
[Route("api/blogs/[controller]")]
public class CommentsController : ControllerBase
{
    private readonly BlogsDbContext _context;
    private readonly IMapper _mapper;
    private readonly ILogger<CommentsController> _logger;

    public CommentsController(BlogsDbContext context, IMapper mapper, ILogger<CommentsController> logger)
    {
        _context = context;
        _mapper = mapper;
        _logger = logger;
    }

    [HttpGet("post/{postId}")]
    public async Task<ActionResult<IEnumerable<BlogCommentDto>>> GetCommentsByPost(Guid postId)
    {
        try
        {
            var comments = await _context.BlogComments
                .Where(c => c.BlogPostId == postId && c.ParentCommentId == null)
                .Include(c => c.Replies)
                .OrderBy(c => c.CreatedAt)
                .ToListAsync();

            var commentDtos = _mapper.Map<IEnumerable<BlogCommentDto>>(comments);
            return Ok(commentDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving comments for post {PostId}", postId);
            return StatusCode(500, "An error occurred while retrieving comments");
        }
    }

    [HttpPost]
    public async Task<ActionResult<BlogCommentDto>> CreateComment(CreateBlogCommentDto createDto)
    {
        try
        {
            var comment = _mapper.Map<BlogComment>(createDto);
            comment.AuthorId = Guid.NewGuid(); // TODO: Get from authenticated user
            comment.CreatedAt = DateTime.UtcNow;
            comment.UpdatedAt = DateTime.UtcNow;

            _context.BlogComments.Add(comment);
            await _context.SaveChangesAsync();

            var commentDto = _mapper.Map<BlogCommentDto>(comment);
            return CreatedAtAction(nameof(GetCommentsByPost), new { postId = comment.BlogPostId }, commentDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating blog comment");
            return StatusCode(500, "An error occurred while creating the comment");
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<BlogCommentDto>> UpdateComment(Guid id, CreateBlogCommentDto updateDto)
    {
        try
        {
            var comment = await _context.BlogComments.FindAsync(id);
            if (comment == null)
            {
                return NotFound($"Comment with ID {id} not found");
            }

            comment.Content = updateDto.Content;
            comment.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            var commentDto = _mapper.Map<BlogCommentDto>(comment);
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
            var comment = await _context.BlogComments.FindAsync(id);
            if (comment == null)
            {
                return NotFound($"Comment with ID {id} not found");
            }

            _context.BlogComments.Remove(comment);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting comment {Id}", id);
            return StatusCode(500, "An error occurred while deleting the comment");
        }
    }

    [HttpPost("{id}/approve")]
    public async Task<ActionResult> ApproveComment(Guid id)
    {
        try
        {
            var comment = await _context.BlogComments.FindAsync(id);
            if (comment == null)
            {
                return NotFound($"Comment with ID {id} not found");
            }

            comment.IsApproved = true;
            comment.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Comment approved successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error approving comment {Id}", id);
            return StatusCode(500, "An error occurred while approving the comment");
        }
    }
}
