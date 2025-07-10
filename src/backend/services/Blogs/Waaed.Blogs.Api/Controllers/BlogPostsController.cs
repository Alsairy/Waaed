using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutoMapper;
using Waaed.Blogs.Api.Data;
using Waaed.Blogs.Api.Entities;
using Waaed.Blogs.Api.DTOs;
using Waaed.Shared.Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;

namespace Waaed.Blogs.Api.Controllers;

[ApiController]
[Route("api/blogs/[controller]")]
[Authorize]
public class BlogPostsController : ControllerBase
{
    private readonly BlogsDbContext _context;
    private readonly IMapper _mapper;
    private readonly ILogger<BlogPostsController> _logger;
    private readonly ICurrentUserService _currentUserService;

    public BlogPostsController(BlogsDbContext context, IMapper mapper, ILogger<BlogPostsController> logger, ICurrentUserService currentUserService)
    {
        _context = context;
        _mapper = mapper;
        _logger = logger;
        _currentUserService = currentUserService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<BlogPostDto>>> GetBlogPosts([FromQuery] string? status = null)
    {
        try
        {
            var query = _context.BlogPosts
                .Include(p => p.Category)
                .Include(p => p.Comments)
                .AsQueryable();

            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(p => p.Status == status);
            }

            var posts = await query
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();

            var postDtos = _mapper.Map<IEnumerable<BlogPostDto>>(posts);
            return Ok(postDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving blog posts");
            return StatusCode(500, "An error occurred while retrieving blog posts");
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<BlogPostDto>> GetBlogPost(Guid id)
    {
        try
        {
            var post = await _context.BlogPosts
                .Include(p => p.Category)
                .Include(p => p.Comments)
                .ThenInclude(c => c.Replies)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (post == null)
            {
                return NotFound($"Blog post with ID {id} not found");
            }

            post.ViewCount++;
            await _context.SaveChangesAsync();

            var postDto = _mapper.Map<BlogPostDto>(post);
            return Ok(postDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving blog post {Id}", id);
            return StatusCode(500, "An error occurred while retrieving the blog post");
        }
    }

    [HttpPost]
    public async Task<ActionResult<BlogPostDto>> CreateBlogPost(CreateBlogPostDto createDto)
    {
        try
        {
            if (!_currentUserService.IsAuthenticated || !_currentUserService.UserId.HasValue)
            {
                return Unauthorized("User authentication required");
            }

            var post = _mapper.Map<BlogPost>(createDto);
            post.AuthorId = _currentUserService.UserId.Value;
            post.CreatedAt = DateTime.UtcNow;
            post.UpdatedAt = DateTime.UtcNow;

            if (post.IsPublished)
            {
                post.PublishedAt = DateTime.UtcNow;
                post.Status = "Published";
            }

            _context.BlogPosts.Add(post);
            await _context.SaveChangesAsync();

            var postDto = _mapper.Map<BlogPostDto>(post);
            return CreatedAtAction(nameof(GetBlogPost), new { id = post.Id }, postDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating blog post");
            return StatusCode(500, "An error occurred while creating the blog post");
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<BlogPostDto>> UpdateBlogPost(Guid id, CreateBlogPostDto updateDto)
    {
        try
        {
            var post = await _context.BlogPosts.FindAsync(id);
            if (post == null)
            {
                return NotFound($"Blog post with ID {id} not found");
            }

            _mapper.Map(updateDto, post);
            post.UpdatedAt = DateTime.UtcNow;

            if (post.IsPublished && post.PublishedAt == null)
            {
                post.PublishedAt = DateTime.UtcNow;
                post.Status = "Published";
            }

            await _context.SaveChangesAsync();

            var postDto = _mapper.Map<BlogPostDto>(post);
            return Ok(postDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating blog post {Id}", id);
            return StatusCode(500, "An error occurred while updating the blog post");
        }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteBlogPost(Guid id)
    {
        try
        {
            var post = await _context.BlogPosts.FindAsync(id);
            if (post == null)
            {
                return NotFound($"Blog post with ID {id} not found");
            }

            _context.BlogPosts.Remove(post);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting blog post {Id}", id);
            return StatusCode(500, "An error occurred while deleting the blog post");
        }
    }

    [HttpPost("{id}/publish")]
    public async Task<ActionResult> PublishBlogPost(Guid id)
    {
        try
        {
            var post = await _context.BlogPosts.FindAsync(id);
            if (post == null)
            {
                return NotFound($"Blog post with ID {id} not found");
            }

            post.IsPublished = true;
            post.PublishedAt = DateTime.UtcNow;
            post.Status = "Published";
            post.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Blog post published successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error publishing blog post {Id}", id);
            return StatusCode(500, "An error occurred while publishing the blog post");
        }
    }
}
