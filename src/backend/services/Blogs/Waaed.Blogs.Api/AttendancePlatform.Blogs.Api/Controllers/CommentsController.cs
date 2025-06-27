using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutoMapper;
using AttendancePlatform.Blogs.Api.Data;
using AttendancePlatform.Blogs.Api.Entities;
using AttendancePlatform.Blogs.Api.DTOs;

namespace AttendancePlatform.Blogs.Api.Controllers;

[ApiController]
[Route("api/comments")]
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
    public async Task<ActionResult<IEnumerable<BlogCommentDto>>> GetPostComments(
        int postId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        try
        {
            var post = await _context.BlogPosts.FindAsync(postId);
            if (post == null)
                return NotFound($"Blog post with ID {postId} not found");

            var query = _context.BlogComments
                .Where(c => c.PostId == postId && !c.IsDeleted && c.ParentCommentId == null)
                .Include(c => c.Replies.Where(r => !r.IsDeleted))
                .OrderByDescending(c => c.CreatedAt);

            var totalCount = await query.CountAsync();
            var comments = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var commentDtos = _mapper.Map<List<BlogCommentDto>>(comments);

            Response.Headers.Add("X-Total-Count", totalCount.ToString());
            Response.Headers.Add("X-Page", page.ToString());
            Response.Headers.Add("X-Page-Size", pageSize.ToString());

            return Ok(commentDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving comments for post {PostId}", postId);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<BlogCommentDto>> GetComment(int id)
    {
        try
        {
            var comment = await _context.BlogComments
                .Include(c => c.Replies.Where(r => !r.IsDeleted))
                .FirstOrDefaultAsync(c => c.Id == id && !c.IsDeleted);

            if (comment == null)
                return NotFound($"Comment with ID {id} not found");

            var commentDto = _mapper.Map<BlogCommentDto>(comment);
            return Ok(commentDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving comment {CommentId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPost]
    public async Task<ActionResult<BlogCommentDto>> CreateComment(CreateBlogCommentDto createCommentDto)
    {
        try
        {
            var post = await _context.BlogPosts.FindAsync(createCommentDto.PostId);
            if (post == null)
                return NotFound($"Blog post with ID {createCommentDto.PostId} not found");

            if (!post.AllowComments)
                return BadRequest("Comments are not allowed on this post");

            if (createCommentDto.ParentCommentId.HasValue)
            {
                var parentComment = await _context.BlogComments.FindAsync(createCommentDto.ParentCommentId.Value);
                if (parentComment == null)
                    return NotFound($"Parent comment with ID {createCommentDto.ParentCommentId.Value} not found");

                if (parentComment.PostId != createCommentDto.PostId)
                    return BadRequest("Parent comment does not belong to the specified post");
            }

            var comment = _mapper.Map<BlogComment>(createCommentDto);
            comment.CommenterId = 1; // TODO: Get from authenticated user context
            comment.CommenterName = "Current User"; // TODO: Get from authenticated user context
            comment.CommenterRole = "User"; // TODO: Get from authenticated user context
            comment.CreatedAt = DateTime.UtcNow;

            _context.BlogComments.Add(comment);
            await _context.SaveChangesAsync();

            var commentDto = _mapper.Map<BlogCommentDto>(comment);
            return CreatedAtAction(nameof(GetComment), new { id = comment.Id }, commentDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating comment");
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateComment(int id, UpdateBlogCommentDto updateCommentDto)
    {
        try
        {
            var comment = await _context.BlogComments.FindAsync(id);
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

    [HttpPost("{id}/approve")]
    public async Task<IActionResult> ApproveComment(int id)
    {
        try
        {
            var comment = await _context.BlogComments.FindAsync(id);
            if (comment == null)
                return NotFound($"Comment with ID {id} not found");

            comment.IsApproved = true;
            await _context.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error approving comment {CommentId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPost("{id}/like")]
    public async Task<IActionResult> LikeComment(int id)
    {
        try
        {
            var comment = await _context.BlogComments.FindAsync(id);
            if (comment == null)
                return NotFound($"Comment with ID {id} not found");

            if (comment.IsDeleted)
                return BadRequest("Cannot like deleted comment");

            comment.LikeCount++;
            await _context.SaveChangesAsync();

            return Ok(new { LikeCount = comment.LikeCount });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error liking comment {CommentId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteComment(int id)
    {
        try
        {
            var comment = await _context.BlogComments
                .Include(c => c.Replies)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (comment == null)
                return NotFound($"Comment with ID {id} not found");

            var userId = 1; // TODO: Get from authenticated user context
            if (comment.CommenterId != userId)
                return Forbid("You can only delete your own comments");

            comment.IsDeleted = true;
            comment.UpdatedAt = DateTime.UtcNow;

            foreach (var reply in comment.Replies)
            {
                reply.IsDeleted = true;
                reply.UpdatedAt = DateTime.UtcNow;
            }

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
