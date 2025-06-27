using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AttendancePlatform.LMS.Api.Data;
using AttendancePlatform.LMS.Api.DTOs;
using AttendancePlatform.LMS.Api.Entities;
using AutoMapper;

namespace AttendancePlatform.LMS.Api.Controllers;

[ApiController]
[Route("api/lms/courses/{courseId}/[controller]")]
public class QuizzesController : ControllerBase
{
    private readonly LMSDbContext _context;
    private readonly IMapper _mapper;
    private readonly ILogger<QuizzesController> _logger;

    public QuizzesController(LMSDbContext context, IMapper mapper, ILogger<QuizzesController> logger)
    {
        _context = context;
        _mapper = mapper;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<QuizDto>>> GetQuizzes(
        Guid courseId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        try
        {
            var query = _context.Quizzes
                .Include(q => q.Questions)
                .Include(q => q.Attempts)
                .Where(q => q.CourseId == courseId);

            var totalCount = await query.CountAsync();
            var quizzes = await query
                .OrderByDescending(q => q.UpdatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var quizDtos = quizzes.Select(q => new QuizDto
            {
                Id = q.Id,
                CourseId = q.CourseId,
                Title = q.Title,
                Description = q.Description,
                Instructions = q.Instructions,
                Type = q.Type.ToString(),
                Points = q.Points,
                TimeLimit = q.TimeLimit,
                AllowedAttempts = q.AllowedAttempts,
                ScoringPolicy = q.ScoringPolicy.ToString(),
                AvailableFrom = q.AvailableFrom,
                AvailableUntil = q.AvailableUntil,
                DueDate = q.DueDate,
                ShuffleQuestions = q.ShuffleQuestions,
                ShuffleAnswers = q.ShuffleAnswers,
                ShowCorrectAnswers = q.ShowCorrectAnswers,
                ShowCorrectAnswersAt = q.ShowCorrectAnswersAt,
                OneQuestionAtATime = q.OneQuestionAtATime,
                CantGoBack = q.CantGoBack,
                AccessCode = q.AccessCode,
                RequireLockdownBrowser = q.RequireLockdownBrowser,
                CreatedAt = q.CreatedAt,
                UpdatedAt = q.UpdatedAt,
                CreatedBy = q.CreatedBy,
                QuestionCount = q.Questions.Count,
                AttemptCount = q.Attempts.Count
            });

            Response.Headers.Add("X-Total-Count", totalCount.ToString());
            return Ok(new { data = quizDtos, totalCount });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving quizzes for course {CourseId}", courseId);
            return StatusCode(500, "An error occurred while retrieving quizzes");
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<QuizDto>> GetQuiz(Guid courseId, Guid id)
    {
        try
        {
            var quiz = await _context.Quizzes
                .Include(q => q.Questions)
                .Include(q => q.Attempts)
                .FirstOrDefaultAsync(q => q.Id == id && q.CourseId == courseId);

            if (quiz == null)
            {
                return NotFound();
            }

            var quizDto = _mapper.Map<QuizDto>(quiz);
            return Ok(new { data = quizDto });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving quiz {QuizId}", id);
            return StatusCode(500, "An error occurred while retrieving the quiz");
        }
    }

    [HttpPost]
    public async Task<ActionResult<QuizDto>> CreateQuiz(Guid courseId, CreateQuizDto createQuizDto)
    {
        try
        {
            if (!Enum.TryParse<QuizType>(createQuizDto.Type, out var quizType))
            {
                return BadRequest("Invalid quiz type");
            }

            if (!Enum.TryParse<ScoringPolicy>(createQuizDto.ScoringPolicy, out var scoringPolicy))
            {
                return BadRequest("Invalid scoring policy");
            }

            var quiz = new Quiz
            {
                Id = Guid.NewGuid(),
                CourseId = courseId,
                Title = createQuizDto.Title,
                Description = createQuizDto.Description,
                Instructions = createQuizDto.Instructions,
                Type = quizType,
                Points = createQuizDto.Points,
                TimeLimit = createQuizDto.TimeLimit,
                AllowedAttempts = createQuizDto.AllowedAttempts,
                ScoringPolicy = scoringPolicy,
                AvailableFrom = createQuizDto.AvailableFrom,
                AvailableUntil = createQuizDto.AvailableUntil,
                DueDate = createQuizDto.DueDate,
                ShuffleQuestions = createQuizDto.ShuffleQuestions,
                ShuffleAnswers = createQuizDto.ShuffleAnswers,
                ShowCorrectAnswers = createQuizDto.ShowCorrectAnswers,
                ShowCorrectAnswersAt = createQuizDto.ShowCorrectAnswersAt,
                OneQuestionAtATime = createQuizDto.OneQuestionAtATime,
                CantGoBack = createQuizDto.CantGoBack,
                AccessCode = createQuizDto.AccessCode,
                RequireLockdownBrowser = createQuizDto.RequireLockdownBrowser,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                CreatedBy = "current-user-id"
            };

            _context.Quizzes.Add(quiz);
            await _context.SaveChangesAsync();

            var quizDto = _mapper.Map<QuizDto>(quiz);
            return CreatedAtAction(nameof(GetQuiz), new { courseId, id = quiz.Id }, new { data = quizDto });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating quiz");
            return StatusCode(500, "An error occurred while creating the quiz");
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteQuiz(Guid courseId, Guid id)
    {
        try
        {
            var quiz = await _context.Quizzes
                .FirstOrDefaultAsync(q => q.Id == id && q.CourseId == courseId);

            if (quiz == null)
            {
                return NotFound();
            }

            _context.Quizzes.Remove(quiz);
            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting quiz {QuizId}", id);
            return StatusCode(500, "An error occurred while deleting the quiz");
        }
    }
}
