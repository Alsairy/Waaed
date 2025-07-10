using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutoMapper;
using Waaed.Polls.Api.Data;
using Waaed.Polls.Api.Entities;
using Waaed.Polls.Api.DTOs;
using Waaed.Shared.Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;

namespace Waaed.Polls.Api.Controllers;

[ApiController]
[Route("api/polls/[controller]")]
[Authorize]
public class PollsController : ControllerBase
{
    private readonly PollsDbContext _context;
    private readonly IMapper _mapper;
    private readonly ILogger<PollsController> _logger;
    private readonly ICurrentUserService _currentUserService;

    public PollsController(PollsDbContext context, IMapper mapper, ILogger<PollsController> logger, ICurrentUserService currentUserService)
    {
        _context = context;
        _mapper = mapper;
        _logger = logger;
        _currentUserService = currentUserService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<PollDto>>> GetPolls()
    {
        try
        {
            var polls = await _context.Polls
                .Include(p => p.Options)
                .Include(p => p.Votes)
                .Where(p => p.IsActive)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();

            var pollDtos = _mapper.Map<IEnumerable<PollDto>>(polls);
            return Ok(pollDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving polls");
            return StatusCode(500, "An error occurred while retrieving polls");
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<PollDto>> GetPoll(Guid id)
    {
        try
        {
            var poll = await _context.Polls
                .Include(p => p.Options)
                .Include(p => p.Votes)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (poll == null)
            {
                return NotFound($"Poll with ID {id} not found");
            }

            var pollDto = _mapper.Map<PollDto>(poll);
            return Ok(pollDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving poll {Id}", id);
            return StatusCode(500, "An error occurred while retrieving the poll");
        }
    }

    [HttpPost]
    public async Task<ActionResult<PollDto>> CreatePoll(CreatePollDto createDto)
    {
        try
        {
            if (!_currentUserService.IsAuthenticated || !_currentUserService.UserId.HasValue)
            {
                return Unauthorized("User authentication required");
            }

            var poll = _mapper.Map<Poll>(createDto);
            poll.CreatedBy = _currentUserService.UserId.Value;
            poll.CreatedAt = DateTime.UtcNow;
            poll.UpdatedAt = DateTime.UtcNow;

            _context.Polls.Add(poll);
            await _context.SaveChangesAsync();

            var pollDto = _mapper.Map<PollDto>(poll);
            return CreatedAtAction(nameof(GetPoll), new { id = poll.Id }, pollDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating poll");
            return StatusCode(500, "An error occurred while creating the poll");
        }
    }

    [HttpPost("{id}/vote")]
    public async Task<ActionResult> VotePoll(Guid id, VotePollDto voteDto)
    {
        try
        {
            if (!_currentUserService.IsAuthenticated || !_currentUserService.UserId.HasValue)
            {
                return Unauthorized("User authentication required");
            }

            var poll = await _context.Polls
                .Include(p => p.Options)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (poll == null)
            {
                return NotFound($"Poll with ID {id} not found");
            }

            if (DateTime.UtcNow < poll.StartDate || DateTime.UtcNow > poll.EndDate)
            {
                return BadRequest("Poll is not currently active");
            }

            var userId = _currentUserService.UserId.Value;

            if (!poll.AllowMultipleVotes)
            {
                var existingVote = await _context.PollVotes
                    .FirstOrDefaultAsync(v => v.PollId == id && v.UserId == userId);

                if (existingVote != null)
                {
                    return BadRequest("You have already voted in this poll");
                }
            }

            var vote = new PollVote
            {
                Id = Guid.NewGuid(),
                PollId = id,
                PollOptionId = voteDto.PollOptionId,
                UserId = userId,
                VotedAt = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.PollVotes.Add(vote);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Vote recorded successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error voting in poll {Id}", id);
            return StatusCode(500, "An error occurred while recording your vote");
        }
    }

    [HttpGet("{id}/results")]
    public async Task<ActionResult<PollDto>> GetPollResults(Guid id)
    {
        try
        {
            var poll = await _context.Polls
                .Include(p => p.Options)
                .ThenInclude(o => o.Votes)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (poll == null)
            {
                return NotFound($"Poll with ID {id} not found");
            }

            var pollDto = _mapper.Map<PollDto>(poll);
            
            var totalVotes = poll.Votes.Count;
            pollDto.TotalVotes = totalVotes;

            foreach (var option in pollDto.Options)
            {
                var optionVotes = poll.Options.First(o => o.Id == option.Id).Votes.Count;
                option.VoteCount = optionVotes;
                option.VotePercentage = totalVotes > 0 ? (double)optionVotes / totalVotes * 100 : 0;
            }

            return Ok(pollDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving poll results {Id}", id);
            return StatusCode(500, "An error occurred while retrieving poll results");
        }
    }
}
