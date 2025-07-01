using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutoMapper;
using Waaed.Blogs.Api.Data;
using Waaed.Blogs.Api.Entities;
using Waaed.Blogs.Api.DTOs;

namespace Waaed.Blogs.Api.Controllers;

[ApiController]
[Route("api/blogs/[controller]")]
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
    public async Task<ActionResult<IEnumerable<BlogCategoryDto>>> GetCategories()
    {
        try
        {
            var categories = await _context.BlogCategories
                .Where(c => c.IsActive)
                .OrderBy(c => c.Name)
                .ToListAsync();

            var categoryDtos = _mapper.Map<IEnumerable<BlogCategoryDto>>(categories);
            return Ok(categoryDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving blog categories");
            return StatusCode(500, "An error occurred while retrieving blog categories");
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<BlogCategoryDto>> GetCategory(Guid id)
    {
        try
        {
            var category = await _context.BlogCategories.FindAsync(id);
            if (category == null)
            {
                return NotFound($"Blog category with ID {id} not found");
            }

            var categoryDto = _mapper.Map<BlogCategoryDto>(category);
            return Ok(categoryDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving blog category {Id}", id);
            return StatusCode(500, "An error occurred while retrieving the blog category");
        }
    }

    [HttpPost]
    public async Task<ActionResult<BlogCategoryDto>> CreateCategory(CreateBlogCategoryDto createDto)
    {
        try
        {
            var category = _mapper.Map<BlogCategory>(createDto);
            category.CreatedAt = DateTime.UtcNow;
            category.UpdatedAt = DateTime.UtcNow;

            _context.BlogCategories.Add(category);
            await _context.SaveChangesAsync();

            var categoryDto = _mapper.Map<BlogCategoryDto>(category);
            return CreatedAtAction(nameof(GetCategory), new { id = category.Id }, categoryDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating blog category");
            return StatusCode(500, "An error occurred while creating the blog category");
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<BlogCategoryDto>> UpdateCategory(Guid id, CreateBlogCategoryDto updateDto)
    {
        try
        {
            var category = await _context.BlogCategories.FindAsync(id);
            if (category == null)
            {
                return NotFound($"Blog category with ID {id} not found");
            }

            _mapper.Map(updateDto, category);
            category.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            var categoryDto = _mapper.Map<BlogCategoryDto>(category);
            return Ok(categoryDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating blog category {Id}", id);
            return StatusCode(500, "An error occurred while updating the blog category");
        }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteCategory(Guid id)
    {
        try
        {
            var category = await _context.BlogCategories.FindAsync(id);
            if (category == null)
            {
                return NotFound($"Blog category with ID {id} not found");
            }

            category.IsActive = false;
            category.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting blog category {Id}", id);
            return StatusCode(500, "An error occurred while deleting the blog category");
        }
    }
}
