using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AttendancePlatform.LMS.Api.Data;
using AttendancePlatform.LMS.Api.DTOs;
using AttendancePlatform.LMS.Api.Entities;
using AutoMapper;

namespace AttendancePlatform.LMS.Api.Controllers;

[ApiController]
[Route("api/lms/courses/{courseId}/[controller]")]
public class DiscussionsController : ControllerBase
{
    private readonly LMSDbContext _context;
    private readonly IMapper _mapper;
    private readonly ILogger<DiscussionsController> _logger;

    public DiscussionsController(LMSDbContext context, IMapper mapper, ILogger<DiscussionsController> logger)
    {
        _context = context;
        _mapper = mapper;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<DiscussionDto>>> GetDiscussions(
        Guid courseId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        try
        {
            var query = _context.Discussions
                .Include(d => d.Posts)
                .Where(d => d.CourseId == courseId);

            var totalCount = await query.CountAsync();
            var discussions = await query
                .OrderByDescending(d => d.UpdatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var discussionDtos = discussions.Select(d => new DiscussionDto
            {
                Id = d.Id,
                CourseId = d.CourseId,
                Title = d.Title,
                Description = d.Description,
                Type = d.Type.ToString(),
                IsGraded = d.IsGraded,
                Points = d.Points,
                DueDate = d.DueDate,
                AvailableFrom = d.AvailableFrom,
                AvailableUntil = d.AvailableUntil,
                RequireInitialPost = d.RequireInitialPost,
                AllowRating = d.AllowRating,
                SortByRating = d.SortByRating,
                OnlyGradersCanRate = d.OnlyGradersCanRate,
                IsAnnouncement = d.IsAnnouncement,
                IsPinned = d.IsPinned,
                IsLocked = d.IsLocked,
                CreatedAt = d.CreatedAt,
                UpdatedAt = d.UpdatedAt,
                CreatedBy = d.CreatedBy,
                PostCount = d.Posts.Count,
                ParticipantCount = d.Posts.Select(p => p.AuthorId).Distinct().Count()
            });

            Response.Headers.Add("X-Total-Count", totalCount.ToString());
            return Ok(new { data = discussionDtos, totalCount });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving discussions for course {CourseId}", courseId);
            return StatusCode(500, "An error occurred while retrieving discussions");
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<DiscussionDto>> GetDiscussion(Guid courseId, Guid id)
    {
        try
        {
            var discussion = await _context.Discussions
                .Include(d => d.Posts)
                .FirstOrDefaultAsync(d => d.Id == id && d.CourseId == courseId);

            if (discussion == null)
            {
                return NotFound();
            }

            var discussionDto = _mapper.Map<DiscussionDto>(discussion);
            return Ok(new { data = discussionDto });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving discussion {DiscussionId}", id);
            return StatusCode(500, "An error occurred while retrieving the discussion");
        }
    }

    [HttpPost]
    public async Task<ActionResult<DiscussionDto>> CreateDiscussion(Guid courseId, CreateDiscussionDto createDiscussionDto)
    {
        try
        {
            if (!Enum.TryParse<DiscussionType>(createDiscussionDto.Type, out var discussionType))
            {
                return BadRequest("Invalid discussion type");
            }

            var discussion = new Discussion
            {
                Id = Guid.NewGuid(),
                CourseId = courseId,
                Title = createDiscussionDto.Title,
                Description = createDiscussionDto.Description,
                Type = discussionType,
                IsGraded = createDiscussionDto.IsGraded,
                Points = createDiscussionDto.Points,
                DueDate = createDiscussionDto.DueDate,
                AvailableFrom = createDiscussionDto.AvailableFrom,
                AvailableUntil = createDiscussionDto.AvailableUntil,
                RequireInitialPost = createDiscussionDto.RequireInitialPost,
                AllowRating = createDiscussionDto.AllowRating,
                SortByRating = createDiscussionDto.SortByRating,
                OnlyGradersCanRate = createDiscussionDto.OnlyGradersCanRate,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                CreatedBy = "current-user-id"
            };

            _context.Discussions.Add(discussion);
            await _context.SaveChangesAsync();

            var discussionDto = _mapper.Map<DiscussionDto>(discussion);
            return CreatedAtAction(nameof(GetDiscussion), new { courseId, id = discussion.Id }, new { data = discussionDto });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating discussion");
            return StatusCode(500, "An error occurred while creating the discussion");
        }
    }

    [HttpGet("{id}/posts")]
    public async Task<ActionResult<IEnumerable<DiscussionPostDto>>> GetDiscussionPosts(
        Guid courseId,
        Guid id,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        try
        {
            var query = _context.DiscussionPosts
                .Include(p => p.Replies)
                .Where(p => p.DiscussionId == id && p.ParentPostId == null);

            var totalCount = await query.CountAsync();
            var posts = await query
                .OrderByDescending(p => p.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var postDtos = posts.Select(p => new DiscussionPostDto
            {
                Id = p.Id,
                DiscussionId = p.DiscussionId,
                ParentPostId = p.ParentPostId,
                AuthorId = p.AuthorId,
                AuthorName = p.AuthorId,
                Content = p.Content,
                AttachmentUrls = p.AttachmentUrls,
                Rating = p.Rating,
                RatingCount = p.RatingCount,
                IsDeleted = p.IsDeleted,
                CreatedAt = p.CreatedAt,
                UpdatedAt = p.UpdatedAt,
                ReplyCount = p.Replies.Count
            });

            Response.Headers.Add("X-Total-Count", totalCount.ToString());
            return Ok(new { data = postDtos, totalCount });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving discussion posts for discussion {DiscussionId}", id);
            return StatusCode(500, "An error occurred while retrieving discussion posts");
        }
    }

    [HttpPost("{id}/posts")]
    public async Task<ActionResult<DiscussionPostDto>> CreateDiscussionPost(
        Guid courseId,
        Guid id,
        CreateDiscussionPostDto createPostDto)
    {
        try
        {
            var post = new DiscussionPost
            {
                Id = Guid.NewGuid(),
                DiscussionId = id,
                ParentPostId = createPostDto.ParentPostId,
                AuthorId = "current-user-id",
                Content = createPostDto.Content,
                AttachmentUrls = createPostDto.AttachmentUrls,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.DiscussionPosts.Add(post);
            await _context.SaveChangesAsync();

            var postDto = new DiscussionPostDto
            {
                Id = post.Id,
                DiscussionId = post.DiscussionId,
                ParentPostId = post.ParentPostId,
                AuthorId = post.AuthorId,
                AuthorName = post.AuthorId,
                Content = post.Content,
                AttachmentUrls = post.AttachmentUrls,
                Rating = post.Rating,
                RatingCount = post.RatingCount,
                IsDeleted = post.IsDeleted,
                CreatedAt = post.CreatedAt,
                UpdatedAt = post.UpdatedAt,
                ReplyCount = 0
            };

            return CreatedAtAction(nameof(GetDiscussionPosts), new { courseId, id }, new { data = postDto });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating discussion post");
            return StatusCode(500, "An error occurred while creating the discussion post");
        }
    }
}
