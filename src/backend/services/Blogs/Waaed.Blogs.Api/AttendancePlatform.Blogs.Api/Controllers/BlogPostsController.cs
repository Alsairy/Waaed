using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutoMapper;
using AttendancePlatform.Blogs.Api.Data;
using AttendancePlatform.Blogs.Api.Entities;
using AttendancePlatform.Blogs.Api.DTOs;

namespace AttendancePlatform.Blogs.Api.Controllers;

[ApiController]
[Route("api/blog-posts")]
public class BlogPostsController : ControllerBase
{
    private readonly BlogsDbContext _context;
    private readonly IMapper _mapper;
    private readonly ILogger<BlogPostsController> _logger;

    public BlogPostsController(BlogsDbContext context, IMapper mapper, ILogger<BlogPostsController> logger)
    {
        _context = context;
        _mapper = mapper;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<BlogPostDto>>> GetBlogPosts(
        [FromQuery] string? status = null,
        [FromQuery] string? visibility = null,
        [FromQuery] int? categoryId = null,
        [FromQuery] int? authorId = null,
        [FromQuery] bool? isFeatured = null,
        [FromQuery] string? search = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        try
        {
            var query = _context.BlogPosts
                .Include(p => p.Category)
                .Include(p => p.Comments.Where(c => !c.IsDeleted))
                .AsQueryable();

            if (!string.IsNullOrEmpty(status))
                query = query.Where(p => p.Status == status);

            if (!string.IsNullOrEmpty(visibility))
                query = query.Where(p => p.Visibility == visibility);

            if (categoryId.HasValue)
                query = query.Where(p => p.CategoryId == categoryId.Value);

            if (authorId.HasValue)
                query = query.Where(p => p.AuthorId == authorId.Value);

            if (isFeatured.HasValue)
                query = query.Where(p => p.IsFeatured == isFeatured.Value);

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(p => p.Title.Contains(search) || 
                                        p.Content.Contains(search) || 
                                        p.Summary.Contains(search) ||
                                        p.Tags.Contains(search));
            }

            var totalCount = await query.CountAsync();
            var posts = await query
                .OrderByDescending(p => p.IsFeatured)
                .ThenByDescending(p => p.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var postDtos = _mapper.Map<List<BlogPostDto>>(posts);

            Response.Headers.Add("X-Total-Count", totalCount.ToString());
            Response.Headers.Add("X-Page", page.ToString());
            Response.Headers.Add("X-Page-Size", pageSize.ToString());

            return Ok(postDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving blog posts");
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<BlogPostDto>> GetBlogPost(int id)
    {
        try
        {
            var post = await _context.BlogPosts
                .Include(p => p.Category)
                .Include(p => p.Comments.Where(c => !c.IsDeleted))
                .ThenInclude(c => c.Replies.Where(r => !r.IsDeleted))
                .FirstOrDefaultAsync(p => p.Id == id);

            if (post == null)
                return NotFound($"Blog post with ID {id} not found");

            post.ViewCount++;
            await _context.SaveChangesAsync();

            var postDto = _mapper.Map<BlogPostDto>(post);
            return Ok(postDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving blog post {PostId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPost]
    public async Task<ActionResult<BlogPostDto>> CreateBlogPost(CreateBlogPostDto createPostDto)
    {
        try
        {
            var post = _mapper.Map<BlogPost>(createPostDto);
            post.AuthorId = 1; // TODO: Get from authenticated user context
            post.CreatedAt = DateTime.UtcNow;

            if (createPostDto.CategoryId.HasValue)
            {
                var category = await _context.BlogCategories.FindAsync(createPostDto.CategoryId.Value);
                if (category == null)
                    return BadRequest($"Category with ID {createPostDto.CategoryId.Value} not found");
            }

            _context.BlogPosts.Add(post);
            await _context.SaveChangesAsync();

            if (post.CategoryId.HasValue)
            {
                var category = await _context.BlogCategories.FindAsync(post.CategoryId.Value);
                if (category != null)
                {
                    category.PostCount++;
                    await _context.SaveChangesAsync();
                }
            }

            var postDto = _mapper.Map<BlogPostDto>(post);
            return CreatedAtAction(nameof(GetBlogPost), new { id = post.Id }, postDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating blog post");
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateBlogPost(int id, UpdateBlogPostDto updatePostDto)
    {
        try
        {
            var post = await _context.BlogPosts.FindAsync(id);
            if (post == null)
                return NotFound($"Blog post with ID {id} not found");

            var oldCategoryId = post.CategoryId;

            _mapper.Map(updatePostDto, post);
            post.UpdatedAt = DateTime.UtcNow;

            if (updatePostDto.CategoryId.HasValue && updatePostDto.CategoryId != oldCategoryId)
            {
                var newCategory = await _context.BlogCategories.FindAsync(updatePostDto.CategoryId.Value);
                if (newCategory == null)
                    return BadRequest($"Category with ID {updatePostDto.CategoryId.Value} not found");
            }

            await _context.SaveChangesAsync();

            if (oldCategoryId != updatePostDto.CategoryId)
            {
                if (oldCategoryId.HasValue)
                {
                    var oldCategory = await _context.BlogCategories.FindAsync(oldCategoryId.Value);
                    if (oldCategory != null)
                    {
                        oldCategory.PostCount = Math.Max(0, oldCategory.PostCount - 1);
                    }
                }

                if (updatePostDto.CategoryId.HasValue)
                {
                    var newCategory = await _context.BlogCategories.FindAsync(updatePostDto.CategoryId.Value);
                    if (newCategory != null)
                    {
                        newCategory.PostCount++;
                    }
                }

                await _context.SaveChangesAsync();
            }

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating blog post {PostId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPost("{id}/publish")]
    public async Task<IActionResult> PublishBlogPost(int id)
    {
        try
        {
            var post = await _context.BlogPosts.FindAsync(id);
            if (post == null)
                return NotFound($"Blog post with ID {id} not found");

            if (post.Status == "Published")
                return BadRequest("Blog post is already published");

            post.Status = "Published";
            post.PublishedAt = DateTime.UtcNow;
            post.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error publishing blog post {PostId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPost("{id}/archive")]
    public async Task<IActionResult> ArchiveBlogPost(int id)
    {
        try
        {
            var post = await _context.BlogPosts.FindAsync(id);
            if (post == null)
                return NotFound($"Blog post with ID {id} not found");

            post.Status = "Archived";
            post.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error archiving blog post {PostId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPost("{id}/like")]
    public async Task<IActionResult> LikeBlogPost(int id)
    {
        try
        {
            var post = await _context.BlogPosts.FindAsync(id);
            if (post == null)
                return NotFound($"Blog post with ID {id} not found");

            post.LikeCount++;
            await _context.SaveChangesAsync();

            return Ok(new { LikeCount = post.LikeCount });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error liking blog post {PostId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteBlogPost(int id)
    {
        try
        {
            var post = await _context.BlogPosts
                .Include(p => p.Comments)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (post == null)
                return NotFound($"Blog post with ID {id} not found");

            if (post.CategoryId.HasValue)
            {
                var category = await _context.BlogCategories.FindAsync(post.CategoryId.Value);
                if (category != null)
                {
                    category.PostCount = Math.Max(0, category.PostCount - 1);
                }
            }

            _context.BlogPosts.Remove(post);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting blog post {PostId}", id);
            return StatusCode(500, "Internal server error");
        }
    }
}
