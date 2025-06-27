using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutoMapper;
using AttendancePlatform.Inventory.Api.Data;
using AttendancePlatform.Inventory.Api.Entities;
using AttendancePlatform.Inventory.Api.DTOs;

namespace AttendancePlatform.Inventory.Api.Controllers;

[ApiController]
[Route("api/inventory/[controller]")]
public class IssuesController : ControllerBase
{
    private readonly InventoryDbContext _context;
    private readonly IMapper _mapper;
    private readonly ILogger<IssuesController> _logger;

    public IssuesController(InventoryDbContext context, IMapper mapper, ILogger<IssuesController> logger)
    {
        _context = context;
        _mapper = mapper;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<IssueDto>>> GetIssues([FromQuery] int? storeId = null, [FromQuery] string? status = null, [FromQuery] string? issueType = null)
    {
        try
        {
            var query = _context.Issues
                .Include(i => i.Store)
                .Include(i => i.Indent)
                .Include(i => i.TransferToStore)
                .Include(i => i.IssueItems)
                    .ThenInclude(ii => ii.Item)
                .AsQueryable();

            if (storeId.HasValue)
            {
                query = query.Where(i => i.StoreId == storeId.Value);
            }

            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(i => i.Status == status);
            }

            if (!string.IsNullOrEmpty(issueType))
            {
                query = query.Where(i => i.IssueType == issueType);
            }

            var issues = await query.OrderByDescending(i => i.IssueDate).ToListAsync();
            var issueDtos = _mapper.Map<IEnumerable<IssueDto>>(issues);

            Response.Headers.Add("X-Total-Count", issues.Count.ToString());
            Response.Headers.Add("X-Page-Number", "1");
            Response.Headers.Add("X-Page-Size", issues.Count.ToString());

            return Ok(issueDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving issues");
            return StatusCode(500, "An error occurred while retrieving issues");
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<IssueDto>> GetIssue(int id)
    {
        try
        {
            var issue = await _context.Issues
                .Include(i => i.Store)
                .Include(i => i.Indent)
                .Include(i => i.TransferToStore)
                .Include(i => i.IssueItems)
                    .ThenInclude(ii => ii.Item)
                .FirstOrDefaultAsync(i => i.Id == id);

            if (issue == null)
            {
                return NotFound($"Issue with ID {id} not found");
            }

            var issueDto = _mapper.Map<IssueDto>(issue);
            return Ok(issueDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving issue {IssueId}", id);
            return StatusCode(500, "An error occurred while retrieving the issue");
        }
    }

    [HttpPost]
    public async Task<ActionResult<IssueDto>> CreateIssue(CreateIssueDto createIssueDto)
    {
        try
        {
            var store = await _context.Stores.FindAsync(createIssueDto.StoreId);
            if (store == null)
            {
                return BadRequest($"Store with ID {createIssueDto.StoreId} not found");
            }

            if (createIssueDto.IndentId.HasValue)
            {
                var indent = await _context.Indents.FindAsync(createIssueDto.IndentId.Value);
                if (indent == null)
                {
                    return BadRequest($"Indent with ID {createIssueDto.IndentId.Value} not found");
                }
            }

            if (createIssueDto.TransferToStoreId.HasValue)
            {
                var transferStore = await _context.Stores.FindAsync(createIssueDto.TransferToStoreId.Value);
                if (transferStore == null)
                {
                    return BadRequest($"Transfer to store with ID {createIssueDto.TransferToStoreId.Value} not found");
                }
            }

            foreach (var issueItem in createIssueDto.IssueItems)
            {
                var item = await _context.Items.FindAsync(issueItem.ItemId);
                if (item == null)
                {
                    return BadRequest($"Item with ID {issueItem.ItemId} not found");
                }

                if (item.CurrentStock < issueItem.IssuedQuantity)
                {
                    return BadRequest($"Insufficient stock for item '{item.Name}'. Available: {item.CurrentStock}, Requested: {issueItem.IssuedQuantity}");
                }
            }

            var issue = _mapper.Map<Issue>(createIssueDto);
            issue.IssueNumber = await GenerateIssueNumber();
            issue.CreatedAt = DateTime.UtcNow;
            issue.UpdatedAt = DateTime.UtcNow;

            decimal totalValue = 0;
            foreach (var issueItem in issue.IssueItems)
            {
                issueItem.TotalCost = issueItem.UnitCost * issueItem.IssuedQuantity;
                totalValue += issueItem.TotalCost;
                issueItem.CreatedAt = DateTime.UtcNow;
                issueItem.UpdatedAt = DateTime.UtcNow;

                var item = await _context.Items.FindAsync(issueItem.ItemId);
                if (item != null)
                {
                    item.CurrentStock -= issueItem.IssuedQuantity;
                    item.UpdatedAt = DateTime.UtcNow;
                }
            }

            issue.TotalValue = totalValue;

            _context.Issues.Add(issue);
            await _context.SaveChangesAsync();

            var issueDto = _mapper.Map<IssueDto>(issue);

            Response.Headers.Add("X-Total-Count", "1");
            Response.Headers.Add("X-Page-Number", "1");
            Response.Headers.Add("X-Page-Size", "1");

            return CreatedAtAction(nameof(GetIssue), new { id = issue.Id }, issueDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating issue");
            return StatusCode(500, "An error occurred while creating the issue");
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateIssue(int id, UpdateIssueDto updateIssueDto)
    {
        try
        {
            var issue = await _context.Issues.FindAsync(id);
            if (issue == null)
            {
                return NotFound($"Issue with ID {id} not found");
            }

            if (issue.Status != "Draft")
            {
                return BadRequest("Only draft issues can be updated");
            }

            _mapper.Map(updateIssueDto, issue);
            issue.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating issue {IssueId}", id);
            return StatusCode(500, "An error occurred while updating the issue");
        }
    }

    [HttpPost("{id}/approve")]
    public async Task<IActionResult> ApproveIssue(int id, [FromBody] string approvedBy)
    {
        try
        {
            var issue = await _context.Issues.FindAsync(id);
            if (issue == null)
            {
                return NotFound($"Issue with ID {id} not found");
            }

            if (issue.Status != "Draft")
            {
                return BadRequest("Only draft issues can be approved");
            }

            issue.Status = "Issued";
            issue.ApprovedBy = approvedBy;
            issue.ApprovedDate = DateTime.UtcNow;
            issue.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Issue approved successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error approving issue {IssueId}", id);
            return StatusCode(500, "An error occurred while approving the issue");
        }
    }

    [HttpPost("{id}/return")]
    public async Task<IActionResult> ReturnIssue(int id, ReturnIssueDto returnIssueDto)
    {
        try
        {
            var issue = await _context.Issues
                .Include(i => i.IssueItems)
                    .ThenInclude(ii => ii.Item)
                .FirstOrDefaultAsync(i => i.Id == id);

            if (issue == null)
            {
                return NotFound($"Issue with ID {id} not found");
            }

            if (issue.Status != "Issued")
            {
                return BadRequest("Only issued items can be returned");
            }

            if (!issue.RequiresReturn)
            {
                return BadRequest("This issue does not require return");
            }

            issue.ActualReturnDate = returnIssueDto.ActualReturnDate;
            issue.ReturnNotes = returnIssueDto.ReturnNotes;
            issue.Status = "Received";
            issue.UpdatedAt = DateTime.UtcNow;

            foreach (var returnItem in returnIssueDto.ReturnItems)
            {
                var issueItem = issue.IssueItems.FirstOrDefault(ii => ii.Id == returnItem.IssueItemId);
                if (issueItem != null)
                {
                    issueItem.ReturnedQuantity = (issueItem.ReturnedQuantity ?? 0) + returnItem.ReturnedQuantity;
                    issueItem.Notes = returnItem.Notes;
                    issueItem.UpdatedAt = DateTime.UtcNow;

                    if (issueItem.ReturnedQuantity >= issueItem.IssuedQuantity)
                    {
                        issueItem.Status = "Returned";
                    }
                    else
                    {
                        issueItem.Status = "Partial Return";
                    }

                    if (issueItem.Item != null)
                    {
                        issueItem.Item.CurrentStock += returnItem.ReturnedQuantity;
                        issueItem.Item.UpdatedAt = DateTime.UtcNow;
                    }
                }
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "Items returned successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error returning issue {IssueId}", id);
            return StatusCode(500, "An error occurred while returning the issue");
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteIssue(int id)
    {
        try
        {
            var issue = await _context.Issues
                .Include(i => i.IssueItems)
                .FirstOrDefaultAsync(i => i.Id == id);

            if (issue == null)
            {
                return NotFound($"Issue with ID {id} not found");
            }

            if (issue.Status != "Draft")
            {
                return BadRequest("Only draft issues can be deleted");
            }

            _context.Issues.Remove(issue);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting issue {IssueId}", id);
            return StatusCode(500, "An error occurred while deleting the issue");
        }
    }

    [HttpGet("pending-approval")]
    public async Task<ActionResult<IEnumerable<IssueDto>>> GetPendingApprovalIssues()
    {
        try
        {
            var issues = await _context.Issues
                .Include(i => i.Store)
                .Include(i => i.Indent)
                .Include(i => i.TransferToStore)
                .Include(i => i.IssueItems)
                    .ThenInclude(ii => ii.Item)
                .Where(i => i.Status == "Draft")
                .OrderBy(i => i.IssueDate)
                .ToListAsync();

            var issueDtos = _mapper.Map<IEnumerable<IssueDto>>(issues);
            return Ok(issueDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving pending approval issues");
            return StatusCode(500, "An error occurred while retrieving pending approval issues");
        }
    }

    private async Task<string> GenerateIssueNumber()
    {
        var today = DateTime.UtcNow.ToString("yyyyMMdd");
        var lastIssue = await _context.Issues
            .Where(i => i.IssueNumber.StartsWith($"ISS{today}"))
            .OrderByDescending(i => i.IssueNumber)
            .FirstOrDefaultAsync();

        if (lastIssue == null)
        {
            return $"ISS{today}001";
        }

        var lastNumber = int.Parse(lastIssue.IssueNumber.Substring(11));
        return $"ISS{today}{(lastNumber + 1):D3}";
    }
}
