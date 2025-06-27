using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutoMapper;
using AttendancePlatform.Blogs.Api.Data;
using AttendancePlatform.Blogs.Api.Entities;
using AttendancePlatform.Blogs.Api.DTOs;

namespace AttendancePlatform.Blogs.Api.Controllers;

[ApiController]
[Route("api/blog-categories")]
public class CategoriesController : ControllerBase
{
    private readonly BlogsDbContext _context;
    private readonly IMapper _mapper;
    private readonly ILogger<CategoriesController> _logger;

    public CategoriesController(BlogsDbContext context, IMapper mapper, ILogger<CategoriesController> logger)
    {
        _context = context;
        _mapper = mapper;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<BlogCategoryDto>>> GetCategories(
        [FromQuery] bool? isActive = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50)
    {
        try
        {
            var query = _context.BlogCategories.AsQueryable();

            if (isActive.HasValue)
                query = query.Where(c => c.IsActive == isActive.Value);

            var totalCount = await query.CountAsync();
            var categories = await query
                .OrderBy(c => c.DisplayOrder)
                .ThenBy(c => c.Name)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var categoryDtos = _mapper.Map<List<BlogCategoryDto>>(categories);

            Response.Headers.Add("X-Total-Count", totalCount.ToString());
            Response.Headers.Add("X-Page", page.ToString());
            Response.Headers.Add("X-Page-Size", pageSize.ToString());

            return Ok(categoryDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving blog categories");
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<BlogCategoryDto>> GetCategory(int id)
    {
        try
        {
            var category = await _context.BlogCategories.FindAsync(id);
            if (category == null)
                return NotFound($"Category with ID {id} not found");

            var categoryDto = _mapper.Map<BlogCategoryDto>(category);
            return Ok(categoryDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving category {CategoryId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPost]
    public async Task<ActionResult<BlogCategoryDto>> CreateCategory(CreateBlogCategoryDto createCategoryDto)
    {
        try
        {
            var existingCategory = await _context.BlogCategories
                .FirstOrDefaultAsync(c => c.Name == createCategoryDto.Name);

            if (existingCategory != null)
                return BadRequest($"Category with name '{createCategoryDto.Name}' already exists");

            var category = _mapper.Map<BlogCategory>(createCategoryDto);
            category.CreatedBy = 1; // TODO: Get from authenticated user context
            category.CreatedAt = DateTime.UtcNow;

            _context.BlogCategories.Add(category);
            await _context.SaveChangesAsync();

            var categoryDto = _mapper.Map<BlogCategoryDto>(category);
            return CreatedAtAction(nameof(GetCategory), new { id = category.Id }, categoryDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating category");
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCategory(int id, UpdateBlogCategoryDto updateCategoryDto)
    {
        try
        {
            var category = await _context.BlogCategories.FindAsync(id);
            if (category == null)
                return NotFound($"Category with ID {id} not found");

            var existingCategory = await _context.BlogCategories
                .FirstOrDefaultAsync(c => c.Name == updateCategoryDto.Name && c.Id != id);

            if (existingCategory != null)
                return BadRequest($"Category with name '{updateCategoryDto.Name}' already exists");

            _mapper.Map(updateCategoryDto, category);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating category {CategoryId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCategory(int id)
    {
        try
        {
            var category = await _context.BlogCategories
                .Include(c => c.Posts)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (category == null)
                return NotFound($"Category with ID {id} not found");

            if (category.Posts.Any())
                return BadRequest("Cannot delete category that has associated blog posts");

            _context.BlogCategories.Remove(category);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting category {CategoryId}", id);
            return StatusCode(500, "Internal server error");
        }
    }
}
