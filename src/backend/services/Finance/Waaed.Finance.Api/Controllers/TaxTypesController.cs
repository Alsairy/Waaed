using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutoMapper;
using Waaed.Finance.Api.Data;
using Waaed.Finance.Api.Entities;
using Waaed.Finance.Api.DTOs;

namespace Waaed.Finance.Api.Controllers;

[ApiController]
[Route("api/finance/[controller]")]
public class TaxTypesController : ControllerBase
{
    private readonly FinanceDbContext _context;
    private readonly IMapper _mapper;
    private readonly ILogger<TaxTypesController> _logger;

    public TaxTypesController(FinanceDbContext context, IMapper mapper, ILogger<TaxTypesController> logger)
    {
        _context = context;
        _mapper = mapper;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TaxTypeDto>>> GetTaxTypes()
    {
        try
        {
            var taxTypes = await _context.TaxTypes
                .Where(tt => tt.IsActive)
                .OrderBy(tt => tt.Name)
                .ToListAsync();

            var taxTypeDtos = _mapper.Map<IEnumerable<TaxTypeDto>>(taxTypes);
            return Ok(taxTypeDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving tax types");
            return StatusCode(500, "An error occurred while retrieving tax types");
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TaxTypeDto>> GetTaxType(int id)
    {
        try
        {
            var taxType = await _context.TaxTypes.FindAsync(id);
            if (taxType == null)
            {
                return NotFound($"Tax type with ID {id} not found");
            }

            var taxTypeDto = _mapper.Map<TaxTypeDto>(taxType);
            return Ok(taxTypeDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving tax type {Id}", id);
            return StatusCode(500, "An error occurred while retrieving the tax type");
        }
    }

    [HttpPost]
    public async Task<ActionResult<TaxTypeDto>> CreateTaxType(CreateTaxTypeDto createDto)
    {
        try
        {
            var taxType = _mapper.Map<TaxType>(createDto);
            taxType.CreatedAt = DateTime.UtcNow;
            taxType.UpdatedAt = DateTime.UtcNow;

            _context.TaxTypes.Add(taxType);
            await _context.SaveChangesAsync();

            var taxTypeDto = _mapper.Map<TaxTypeDto>(taxType);
            return CreatedAtAction(nameof(GetTaxType), new { id = taxType.Id }, taxTypeDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating tax type");
            return StatusCode(500, "An error occurred while creating the tax type");
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTaxType(int id, UpdateTaxTypeDto updateDto)
    {
        try
        {
            var taxType = await _context.TaxTypes.FindAsync(id);
            if (taxType == null)
            {
                return NotFound($"Tax type with ID {id} not found");
            }

            _mapper.Map(updateDto, taxType);
            taxType.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating tax type {Id}", id);
            return StatusCode(500, "An error occurred while updating the tax type");
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTaxType(int id)
    {
        try
        {
            var taxType = await _context.TaxTypes.FindAsync(id);
            if (taxType == null)
            {
                return NotFound($"Tax type with ID {id} not found");
            }

            var isInUse = await _context.FeeParticulars.AnyAsync(fp => fp.TaxTypeId == id);
            if (isInUse)
            {
                return BadRequest("Cannot delete tax type as it is being used by fee particulars");
            }

            taxType.IsActive = false;
            taxType.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting tax type {Id}", id);
            return StatusCode(500, "An error occurred while deleting the tax type");
        }
    }
}
