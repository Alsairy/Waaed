using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutoMapper;
using Waaed.HR.Api.Data;
using Waaed.HR.Api.Entities;
using Waaed.HR.Api.DTOs;

namespace Waaed.HR.Api.Controllers;

[ApiController]
[Route("api/hr/[controller]")]
public class RecruitmentController : ControllerBase
{
    private readonly HRDbContext _context;
    private readonly IMapper _mapper;
    private readonly ILogger<RecruitmentController> _logger;

    public RecruitmentController(HRDbContext context, IMapper mapper, ILogger<RecruitmentController> logger)
    {
        _context = context;
        _mapper = mapper;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<RecruitmentDto>>> GetRecruitments(
        [FromQuery] int? positionId = null,
        [FromQuery] int? departmentId = null,
        [FromQuery] string? status = null,
        [FromQuery] string? priority = null,
        [FromQuery] bool? isPublished = null,
        [FromQuery] int? requestedById = null)
    {
        try
        {
            var query = _context.Recruitments
                .Include(r => r.Position)
                .Include(r => r.Department)
                .Include(r => r.RequestedBy)
                .Include(r => r.AssignedTo)
                .Include(r => r.JobApplications)
                .AsQueryable();

            if (positionId.HasValue)
            {
                query = query.Where(r => r.PositionId == positionId.Value);
            }

            if (departmentId.HasValue)
            {
                query = query.Where(r => r.DepartmentId == departmentId.Value);
            }

            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(r => r.Status == status);
            }

            if (!string.IsNullOrEmpty(priority))
            {
                query = query.Where(r => r.Priority == priority);
            }

            if (isPublished.HasValue)
            {
                query = query.Where(r => r.IsPublished == isPublished.Value);
            }

            if (requestedById.HasValue)
            {
                query = query.Where(r => r.RequestedById == requestedById.Value);
            }

            var recruitments = await query
                .OrderByDescending(r => r.PostedDate)
                .ToListAsync();

            var recruitmentDtos = _mapper.Map<IEnumerable<RecruitmentDto>>(recruitments);
            return Ok(recruitmentDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving recruitments");
            return StatusCode(500, "An error occurred while retrieving recruitments");
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<RecruitmentDto>> GetRecruitment(int id)
    {
        try
        {
            var recruitment = await _context.Recruitments
                .Include(r => r.Position)
                .Include(r => r.Department)
                .Include(r => r.RequestedBy)
                .Include(r => r.AssignedTo)
                .Include(r => r.JobApplications)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (recruitment == null)
            {
                return NotFound($"Recruitment with ID {id} not found");
            }

            var recruitmentDto = _mapper.Map<RecruitmentDto>(recruitment);
            return Ok(recruitmentDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving recruitment {Id}", id);
            return StatusCode(500, "An error occurred while retrieving the recruitment");
        }
    }

    [HttpPost]
    public async Task<ActionResult<RecruitmentDto>> CreateRecruitment(CreateRecruitmentDto createDto)
    {
        try
        {
            var position = await _context.Positions.FindAsync(createDto.PositionId);
            if (position == null)
            {
                return BadRequest($"Position with ID {createDto.PositionId} not found");
            }

            var department = await _context.Departments.FindAsync(createDto.DepartmentId);
            if (department == null)
            {
                return BadRequest($"Department with ID {createDto.DepartmentId} not found");
            }

            var requestedBy = await _context.Employees.FindAsync(createDto.RequestedById);
            if (requestedBy == null)
            {
                return BadRequest($"Requested by employee with ID {createDto.RequestedById} not found");
            }

            if (createDto.AssignedToId.HasValue)
            {
                var assignedTo = await _context.Employees.FindAsync(createDto.AssignedToId.Value);
                if (assignedTo == null)
                {
                    return BadRequest($"Assigned to employee with ID {createDto.AssignedToId.Value} not found");
                }
            }

            if (createDto.ClosingDate.HasValue && createDto.ClosingDate.Value < DateTime.Today)
            {
                return BadRequest("Closing date cannot be in the past");
            }

            if (createDto.MinSalary.HasValue && createDto.MaxSalary.HasValue && createDto.MinSalary > createDto.MaxSalary)
            {
                return BadRequest("Minimum salary cannot be greater than maximum salary");
            }

            var recruitment = _mapper.Map<Recruitment>(createDto);
            recruitment.CreatedAt = DateTime.UtcNow;
            recruitment.UpdatedAt = DateTime.UtcNow;

            _context.Recruitments.Add(recruitment);
            await _context.SaveChangesAsync();

            var recruitmentDto = _mapper.Map<RecruitmentDto>(recruitment);
            return CreatedAtAction(nameof(GetRecruitment), new { id = recruitment.Id }, recruitmentDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating recruitment");
            return StatusCode(500, "An error occurred while creating the recruitment");
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateRecruitment(int id, UpdateRecruitmentDto updateDto)
    {
        try
        {
            var recruitment = await _context.Recruitments.FindAsync(id);
            if (recruitment == null)
            {
                return NotFound($"Recruitment with ID {id} not found");
            }

            if (updateDto.AssignedToId.HasValue)
            {
                var assignedTo = await _context.Employees.FindAsync(updateDto.AssignedToId.Value);
                if (assignedTo == null)
                {
                    return BadRequest($"Assigned to employee with ID {updateDto.AssignedToId.Value} not found");
                }
            }

            if (updateDto.ClosingDate.HasValue && updateDto.ClosingDate.Value < DateTime.Today)
            {
                return BadRequest("Closing date cannot be in the past");
            }

            if (updateDto.MinSalary.HasValue && updateDto.MaxSalary.HasValue && updateDto.MinSalary > updateDto.MaxSalary)
            {
                return BadRequest("Minimum salary cannot be greater than maximum salary");
            }

            _mapper.Map(updateDto, recruitment);
            recruitment.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating recruitment {Id}", id);
            return StatusCode(500, "An error occurred while updating the recruitment");
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteRecruitment(int id)
    {
        try
        {
            var recruitment = await _context.Recruitments
                .Include(r => r.JobApplications)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (recruitment == null)
            {
                return NotFound($"Recruitment with ID {id} not found");
            }

            if (recruitment.JobApplications.Any())
            {
                recruitment.Status = "Closed";
                recruitment.UpdatedAt = DateTime.UtcNow;
            }
            else
            {
                _context.Recruitments.Remove(recruitment);
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting recruitment {Id}", id);
            return StatusCode(500, "An error occurred while deleting the recruitment");
        }
    }

    [HttpPost("{id}/publish")]
    public async Task<IActionResult> PublishRecruitment(int id)
    {
        try
        {
            var recruitment = await _context.Recruitments.FindAsync(id);
            if (recruitment == null)
            {
                return NotFound($"Recruitment with ID {id} not found");
            }

            if (recruitment.Status != "Open")
            {
                return BadRequest("Only open recruitments can be published");
            }

            recruitment.IsPublished = true;
            recruitment.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error publishing recruitment {Id}", id);
            return StatusCode(500, "An error occurred while publishing the recruitment");
        }
    }

    [HttpPost("{id}/unpublish")]
    public async Task<IActionResult> UnpublishRecruitment(int id)
    {
        try
        {
            var recruitment = await _context.Recruitments.FindAsync(id);
            if (recruitment == null)
            {
                return NotFound($"Recruitment with ID {id} not found");
            }

            recruitment.IsPublished = false;
            recruitment.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error unpublishing recruitment {Id}", id);
            return StatusCode(500, "An error occurred while unpublishing the recruitment");
        }
    }

    [HttpGet("{id}/applications")]
    public async Task<ActionResult<IEnumerable<JobApplicationDto>>> GetRecruitmentApplications(int id)
    {
        try
        {
            var recruitment = await _context.Recruitments.FindAsync(id);
            if (recruitment == null)
            {
                return NotFound($"Recruitment with ID {id} not found");
            }

            var applications = await _context.JobApplications
                .Include(ja => ja.Recruitment)
                .Include(ja => ja.InterviewedBy)
                .Where(ja => ja.RecruitmentId == id)
                .OrderByDescending(ja => ja.ApplicationDate)
                .ToListAsync();

            var applicationDtos = _mapper.Map<IEnumerable<JobApplicationDto>>(applications);
            return Ok(applicationDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving applications for recruitment {Id}", id);
            return StatusCode(500, "An error occurred while retrieving the recruitment's applications");
        }
    }

    [HttpPost("{id}/applications")]
    public async Task<ActionResult<JobApplicationDto>> CreateJobApplication(int id, CreateJobApplicationDto createDto)
    {
        try
        {
            var recruitment = await _context.Recruitments.FindAsync(id);
            if (recruitment == null)
            {
                return NotFound($"Recruitment with ID {id} not found");
            }

            if (recruitment.Status != "Open" || !recruitment.IsPublished)
            {
                return BadRequest("Recruitment is not open for applications");
            }

            if (recruitment.ClosingDate.HasValue && recruitment.ClosingDate.Value < DateTime.Today)
            {
                return BadRequest("Recruitment application deadline has passed");
            }

            var existingApplication = await _context.JobApplications
                .FirstOrDefaultAsync(ja => ja.RecruitmentId == id && ja.Email == createDto.Email);

            if (existingApplication != null)
            {
                return BadRequest("An application from this email already exists for this recruitment");
            }

            createDto.RecruitmentId = id;
            var jobApplication = _mapper.Map<JobApplication>(createDto);
            jobApplication.CreatedAt = DateTime.UtcNow;
            jobApplication.UpdatedAt = DateTime.UtcNow;

            _context.JobApplications.Add(jobApplication);
            await _context.SaveChangesAsync();

            var jobApplicationDto = _mapper.Map<JobApplicationDto>(jobApplication);
            return CreatedAtAction(nameof(GetJobApplication), new { id = jobApplication.Id }, jobApplicationDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating job application for recruitment {Id}", id);
            return StatusCode(500, "An error occurred while creating the job application");
        }
    }

    [HttpGet("applications/{applicationId}")]
    public async Task<ActionResult<JobApplicationDto>> GetJobApplication(int applicationId)
    {
        try
        {
            var jobApplication = await _context.JobApplications
                .Include(ja => ja.Recruitment)
                .Include(ja => ja.InterviewedBy)
                .FirstOrDefaultAsync(ja => ja.Id == applicationId);

            if (jobApplication == null)
            {
                return NotFound($"Job application with ID {applicationId} not found");
            }

            var jobApplicationDto = _mapper.Map<JobApplicationDto>(jobApplication);
            return Ok(jobApplicationDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving job application {ApplicationId}", applicationId);
            return StatusCode(500, "An error occurred while retrieving the job application");
        }
    }

    [HttpPut("applications/{applicationId}/status")]
    public async Task<IActionResult> UpdateApplicationStatus(int applicationId, [FromBody] UpdateApplicationStatusDto updateDto)
    {
        try
        {
            var jobApplication = await _context.JobApplications.FindAsync(applicationId);
            if (jobApplication == null)
            {
                return NotFound($"Job application with ID {applicationId} not found");
            }

            var validStatuses = new[] { "Applied", "Screening", "Interview Scheduled", "Interviewed", "Offer Extended", "Hired", "Rejected" };
            if (!validStatuses.Contains(updateDto.Status))
            {
                return BadRequest($"Invalid status. Valid statuses are: {string.Join(", ", validStatuses)}");
            }

            jobApplication.Status = updateDto.Status;
            jobApplication.UpdatedAt = DateTime.UtcNow;

            if (updateDto.Status == "Rejected" && !string.IsNullOrEmpty(updateDto.RejectionReason))
            {
                jobApplication.RejectionReason = updateDto.RejectionReason;
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating job application status {ApplicationId}", applicationId);
            return StatusCode(500, "An error occurred while updating the job application status");
        }
    }

    [HttpGet("summary")]
    public async Task<ActionResult<RecruitmentSummaryDto>> GetRecruitmentSummary()
    {
        try
        {
            var totalJobs = await _context.Recruitments.CountAsync();
            var openJobs = await _context.Recruitments.CountAsync(r => r.Status == "Open");
            var closedJobs = await _context.Recruitments.CountAsync(r => r.Status == "Closed");

            var totalApplications = await _context.JobApplications.CountAsync();
            var pendingApplications = await _context.JobApplications.CountAsync(ja => ja.Status == "Applied");
            var interviewScheduled = await _context.JobApplications.CountAsync(ja => ja.Status == "Interview Scheduled");
            var offersExtended = await _context.JobApplications.CountAsync(ja => ja.Status == "Offer Extended");

            var jobsByDepartment = await _context.Recruitments
                .Include(r => r.Department)
                .GroupBy(r => r.Department.Name)
                .Select(g => new { Department = g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.Department, x => x.Count);

            var applicationsByStatus = await _context.JobApplications
                .GroupBy(ja => ja.Status)
                .Select(g => new { Status = g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.Status, x => x.Count);

            var summary = new RecruitmentSummaryDto
            {
                TotalJobs = totalJobs,
                OpenJobs = openJobs,
                ClosedJobs = closedJobs,
                TotalApplications = totalApplications,
                PendingApplications = pendingApplications,
                InterviewScheduled = interviewScheduled,
                OffersExtended = offersExtended,
                JobsByDepartment = jobsByDepartment,
                ApplicationsByStatus = applicationsByStatus
            };

            return Ok(summary);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving recruitment summary");
            return StatusCode(500, "An error occurred while retrieving the recruitment summary");
        }
    }
}

public class UpdateApplicationStatusDto
{
    public string Status { get; set; } = string.Empty;
    public string? RejectionReason { get; set; }
}
