using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutoMapper;
using AttendancePlatform.Polls.Api.Data;
using AttendancePlatform.Polls.Api.Entities;
using AttendancePlatform.Polls.Api.DTOs;

namespace AttendancePlatform.Polls.Api.Controllers;

[ApiController]
[Route("api/polls")]
public class PollsController : ControllerBase
{
    private readonly PollsDbContext _context;
    private readonly IMapper _mapper;
    private readonly ILogger<PollsController> _logger;

    public PollsController(PollsDbContext context, IMapper mapper, ILogger<PollsController> logger)
    {
        _context = context;
        _mapper = mapper;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<PollDto>>> GetPolls(
        [FromQuery] string? status = null,
        [FromQuery] string? targetAudience = null,
        [FromQuery] int? createdBy = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        try
        {
            var query = _context.Polls.Include(p => p.Options).AsQueryable();

            if (!string.IsNullOrEmpty(status))
                query = query.Where(p => p.Status == status);

            if (!string.IsNullOrEmpty(targetAudience))
                query = query.Where(p => p.TargetAudience == targetAudience);

            if (createdBy.HasValue)
                query = query.Where(p => p.CreatedBy == createdBy.Value);

            var totalCount = await query.CountAsync();
            var polls = await query
                .OrderByDescending(p => p.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var pollDtos = _mapper.Map<List<PollDto>>(polls);

            Response.Headers.Add("X-Total-Count", totalCount.ToString());
            Response.Headers.Add("X-Page", page.ToString());
            Response.Headers.Add("X-Page-Size", pageSize.ToString());

            return Ok(pollDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving polls");
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<PollDto>> GetPoll(int id)
    {
        try
        {
            var poll = await _context.Polls
                .Include(p => p.Options)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (poll == null)
                return NotFound($"Poll with ID {id} not found");

            var pollDto = _mapper.Map<PollDto>(poll);
            return Ok(pollDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving poll {PollId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPost]
    public async Task<ActionResult<PollDto>> CreatePoll(CreatePollDto createPollDto)
    {
        try
        {
            if (createPollDto.Options == null || !createPollDto.Options.Any())
                return BadRequest("Poll must have at least one option");

            if (createPollDto.Options.Count < 2)
                return BadRequest("Poll must have at least two options");

            var poll = _mapper.Map<Poll>(createPollDto);
            poll.CreatedBy = 1; // TODO: Get from authenticated user context
            poll.CreatedAt = DateTime.UtcNow;

            _context.Polls.Add(poll);
            await _context.SaveChangesAsync();

            var pollDto = _mapper.Map<PollDto>(poll);
            return CreatedAtAction(nameof(GetPoll), new { id = poll.Id }, pollDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating poll");
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdatePoll(int id, UpdatePollDto updatePollDto)
    {
        try
        {
            var poll = await _context.Polls.FindAsync(id);
            if (poll == null)
                return NotFound($"Poll with ID {id} not found");

            if (poll.Status == "Active" || poll.Status == "Closed")
                return BadRequest("Cannot update active or closed polls");

            _mapper.Map(updatePollDto, poll);
            poll.LastModified = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating poll {PollId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPost("{id}/activate")]
    public async Task<IActionResult> ActivatePoll(int id)
    {
        try
        {
            var poll = await _context.Polls
                .Include(p => p.Options)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (poll == null)
                return NotFound($"Poll with ID {id} not found");

            if (poll.Status != "Draft")
                return BadRequest("Only draft polls can be activated");

            if (!poll.Options.Any())
                return BadRequest("Poll must have options before activation");

            poll.Status = "Active";
            poll.LastModified = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error activating poll {PollId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPost("{id}/close")]
    public async Task<IActionResult> ClosePoll(int id)
    {
        try
        {
            var poll = await _context.Polls.FindAsync(id);
            if (poll == null)
                return NotFound($"Poll with ID {id} not found");

            if (poll.Status != "Active")
                return BadRequest("Only active polls can be closed");

            poll.Status = "Closed";
            poll.LastModified = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error closing poll {PollId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePoll(int id)
    {
        try
        {
            var poll = await _context.Polls.FindAsync(id);
            if (poll == null)
                return NotFound($"Poll with ID {id} not found");

            if (poll.Status == "Active")
                return BadRequest("Cannot delete active polls");

            _context.Polls.Remove(poll);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting poll {PollId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("{id}/results")]
    public async Task<ActionResult<PollResultDto>> GetPollResults(int id)
    {
        try
        {
            var poll = await _context.Polls
                .Include(p => p.Options)
                .ThenInclude(o => o.Votes)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (poll == null)
                return NotFound($"Poll with ID {id} not found");

            if (poll.Status == "Active" && !poll.ShowResultsAfterVoting)
                return BadRequest("Results not available while poll is active");

            if (poll.Status == "Closed" && !poll.ShowResultsAfterClose)
                return BadRequest("Results not available for this poll");

            var totalVotes = poll.Options.Sum(o => o.VoteCount);
            var results = new PollResultDto
            {
                PollId = poll.Id,
                PollTitle = poll.Title,
                TotalVotes = totalVotes,
                Results = poll.Options.Select(o => new OptionResultDto
                {
                    OptionId = o.Id,
                    OptionText = o.OptionText,
                    VoteCount = o.VoteCount,
                    Percentage = totalVotes > 0 ? (double)o.VoteCount / totalVotes * 100 : 0
                }).ToList()
            };

            return Ok(results);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving poll results {PollId}", id);
            return StatusCode(500, "Internal server error");
        }
    }
}
