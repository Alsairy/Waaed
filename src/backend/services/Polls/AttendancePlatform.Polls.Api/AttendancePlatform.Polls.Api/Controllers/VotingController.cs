using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutoMapper;
using AttendancePlatform.Polls.Api.Data;
using AttendancePlatform.Polls.Api.Entities;
using AttendancePlatform.Polls.Api.DTOs;

namespace AttendancePlatform.Polls.Api.Controllers;

[ApiController]
[Route("api/voting")]
public class VotingController : ControllerBase
{
    private readonly PollsDbContext _context;
    private readonly IMapper _mapper;
    private readonly ILogger<VotingController> _logger;

    public VotingController(PollsDbContext context, IMapper mapper, ILogger<VotingController> logger)
    {
        _context = context;
        _mapper = mapper;
        _logger = logger;
    }

    [HttpPost("vote")]
    public async Task<ActionResult<PollVoteDto>> CastVote(CreateVoteDto createVoteDto)
    {
        try
        {
            var poll = await _context.Polls
                .Include(p => p.Options)
                .FirstOrDefaultAsync(p => p.Id == createVoteDto.PollId);

            if (poll == null)
                return NotFound($"Poll with ID {createVoteDto.PollId} not found");

            if (poll.Status != "Active")
                return BadRequest("Poll is not active for voting");

            if (poll.EndDate.HasValue && DateTime.UtcNow > poll.EndDate.Value)
                return BadRequest("Poll voting period has ended");

            var option = poll.Options.FirstOrDefault(o => o.Id == createVoteDto.PollOptionId);
            if (option == null)
                return NotFound($"Poll option with ID {createVoteDto.PollOptionId} not found");

            if (!option.IsActive)
                return BadRequest("Selected option is not active");

            var userId = 1; // TODO: Get from authenticated user context
            var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
            var userAgent = HttpContext.Request.Headers["User-Agent"].ToString();
            var sessionId = HttpContext.Session.Id;

            if (!poll.AllowMultipleVotes)
            {
                var existingVote = await _context.PollVotes
                    .FirstOrDefaultAsync(v => v.PollId == poll.Id && 
                        ((!poll.IsAnonymous && v.UserId == userId) || 
                         (poll.IsAnonymous && v.SessionId == sessionId)));

                if (existingVote != null)
                    return BadRequest("You have already voted in this poll");
            }

            var vote = new PollVote
            {
                PollId = poll.Id,
                PollOptionId = option.Id,
                UserId = poll.IsAnonymous ? null : userId,
                UserRole = createVoteDto.UserRole,
                VotedAt = DateTime.UtcNow,
                IpAddress = ipAddress,
                UserAgent = userAgent,
                IsAnonymous = poll.IsAnonymous,
                SessionId = sessionId
            };

            _context.PollVotes.Add(vote);

            option.VoteCount++;
            poll.TotalVotes++;

            await _context.SaveChangesAsync();

            var voteDto = _mapper.Map<PollVoteDto>(vote);
            return Ok(voteDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error casting vote for poll {PollId}", createVoteDto.PollId);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("poll/{pollId}/user-vote")]
    public async Task<ActionResult<PollVoteDto>> GetUserVote(int pollId)
    {
        try
        {
            var poll = await _context.Polls.FindAsync(pollId);
            if (poll == null)
                return NotFound($"Poll with ID {pollId} not found");

            var userId = 1; // TODO: Get from authenticated user context
            var sessionId = HttpContext.Session.Id;

            var vote = await _context.PollVotes
                .FirstOrDefaultAsync(v => v.PollId == pollId && 
                    ((!poll.IsAnonymous && v.UserId == userId) || 
                     (poll.IsAnonymous && v.SessionId == sessionId)));

            if (vote == null)
                return NotFound("No vote found for this user in this poll");

            var voteDto = _mapper.Map<PollVoteDto>(vote);
            return Ok(voteDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving user vote for poll {PollId}", pollId);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpDelete("vote/{voteId}")]
    public async Task<IActionResult> RemoveVote(int voteId)
    {
        try
        {
            var vote = await _context.PollVotes
                .Include(v => v.Poll)
                .Include(v => v.PollOption)
                .FirstOrDefaultAsync(v => v.Id == voteId);

            if (vote == null)
                return NotFound($"Vote with ID {voteId} not found");

            var userId = 1; // TODO: Get from authenticated user context

            if (!vote.IsAnonymous && vote.UserId != userId)
                return Forbid("You can only remove your own votes");

            if (vote.Poll.Status != "Active")
                return BadRequest("Cannot remove votes from inactive polls");

            vote.PollOption.VoteCount = Math.Max(0, vote.PollOption.VoteCount - 1);
            vote.Poll.TotalVotes = Math.Max(0, vote.Poll.TotalVotes - 1);

            _context.PollVotes.Remove(vote);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error removing vote {VoteId}", voteId);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("poll/{pollId}/votes")]
    public async Task<ActionResult<IEnumerable<PollVoteDto>>> GetPollVotes(
        int pollId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50)
    {
        try
        {
            var poll = await _context.Polls.FindAsync(pollId);
            if (poll == null)
                return NotFound($"Poll with ID {pollId} not found");

            var userId = 1; // TODO: Get from authenticated user context
            if (poll.IsAnonymous && poll.CreatedBy != userId)
                return Forbid("Cannot view votes for anonymous polls");

            var query = _context.PollVotes
                .Where(v => v.PollId == pollId)
                .OrderByDescending(v => v.VotedAt);

            var totalCount = await query.CountAsync();
            var votes = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var voteDtos = _mapper.Map<List<PollVoteDto>>(votes);

            Response.Headers.Add("X-Total-Count", totalCount.ToString());
            Response.Headers.Add("X-Page", page.ToString());
            Response.Headers.Add("X-Page-Size", pageSize.ToString());

            return Ok(voteDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving votes for poll {PollId}", pollId);
            return StatusCode(500, "Internal server error");
        }
    }
}
