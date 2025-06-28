using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutoMapper;
using Waaed.Finance.Api.Data;
using Waaed.Finance.Api.Entities;
using Waaed.Finance.Api.DTOs;

namespace Waaed.Finance.Api.Controllers;

[ApiController]
[Route("api/finance/[controller]")]
public class StudentsController : ControllerBase
{
    private readonly FinanceDbContext _context;
    private readonly IMapper _mapper;
    private readonly ILogger<StudentsController> _logger;

    public StudentsController(FinanceDbContext context, IMapper mapper, ILogger<StudentsController> logger)
    {
        _context = context;
        _mapper = mapper;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<StudentDto>>> GetStudents(
        [FromQuery] string? search = null,
        [FromQuery] string? class_ = null,
        [FromQuery] string? section = null,
        [FromQuery] bool? isActive = null)
    {
        try
        {
            var query = _context.Students.AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(s => s.FirstName.Contains(search) || 
                                        s.LastName.Contains(search) || 
                                        s.StudentId.Contains(search) ||
                                        s.RollNumber!.Contains(search));
            }

            if (!string.IsNullOrEmpty(class_))
            {
                query = query.Where(s => s.Class == class_);
            }

            if (!string.IsNullOrEmpty(section))
            {
                query = query.Where(s => s.Section == section);
            }

            if (isActive.HasValue)
            {
                query = query.Where(s => s.IsActive == isActive.Value);
            }

            var students = await query
                .OrderBy(s => s.Class)
                .ThenBy(s => s.Section)
                .ThenBy(s => s.RollNumber)
                .ToListAsync();

            var studentDtos = _mapper.Map<IEnumerable<StudentDto>>(students);
            return Ok(studentDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving students");
            return StatusCode(500, "An error occurred while retrieving students");
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<StudentDto>> GetStudent(int id)
    {
        try
        {
            var student = await _context.Students.FindAsync(id);
            if (student == null)
            {
                return NotFound($"Student with ID {id} not found");
            }

            var studentDto = _mapper.Map<StudentDto>(student);
            return Ok(studentDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving student {Id}", id);
            return StatusCode(500, "An error occurred while retrieving the student");
        }
    }

    [HttpGet("by-student-id/{studentId}")]
    public async Task<ActionResult<StudentDto>> GetStudentByStudentId(string studentId)
    {
        try
        {
            var student = await _context.Students
                .FirstOrDefaultAsync(s => s.StudentId == studentId);

            if (student == null)
            {
                return NotFound($"Student with Student ID {studentId} not found");
            }

            var studentDto = _mapper.Map<StudentDto>(student);
            return Ok(studentDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving student by student ID {StudentId}", studentId);
            return StatusCode(500, "An error occurred while retrieving the student");
        }
    }

    [HttpPost]
    public async Task<ActionResult<StudentDto>> CreateStudent(CreateStudentDto createDto)
    {
        try
        {
            var existingStudent = await _context.Students
                .FirstOrDefaultAsync(s => s.StudentId == createDto.StudentId);

            if (existingStudent != null)
            {
                return BadRequest($"Student with Student ID {createDto.StudentId} already exists");
            }

            var student = _mapper.Map<Student>(createDto);
            student.CreatedAt = DateTime.UtcNow;
            student.UpdatedAt = DateTime.UtcNow;

            _context.Students.Add(student);
            await _context.SaveChangesAsync();

            var studentDto = _mapper.Map<StudentDto>(student);
            return CreatedAtAction(nameof(GetStudent), new { id = student.Id }, studentDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating student");
            return StatusCode(500, "An error occurred while creating the student");
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateStudent(int id, UpdateStudentDto updateDto)
    {
        try
        {
            var student = await _context.Students.FindAsync(id);
            if (student == null)
            {
                return NotFound($"Student with ID {id} not found");
            }

            _mapper.Map(updateDto, student);
            student.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating student {Id}", id);
            return StatusCode(500, "An error occurred while updating the student");
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteStudent(int id)
    {
        try
        {
            var student = await _context.Students
                .Include(s => s.FeeCollections)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (student == null)
            {
                return NotFound($"Student with ID {id} not found");
            }

            if (student.FeeCollections.Any())
            {
                student.IsActive = false;
                student.UpdatedAt = DateTime.UtcNow;
            }
            else
            {
                _context.Students.Remove(student);
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting student {Id}", id);
            return StatusCode(500, "An error occurred while deleting the student");
        }
    }

    [HttpGet("classes")]
    public async Task<ActionResult<IEnumerable<string>>> GetClasses()
    {
        try
        {
            var classes = await _context.Students
                .Where(s => s.IsActive)
                .Select(s => s.Class)
                .Distinct()
                .OrderBy(c => c)
                .ToListAsync();

            return Ok(classes);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving classes");
            return StatusCode(500, "An error occurred while retrieving classes");
        }
    }

    [HttpGet("sections")]
    public async Task<ActionResult<IEnumerable<string>>> GetSections([FromQuery] string? class_ = null)
    {
        try
        {
            var query = _context.Students.Where(s => s.IsActive);

            if (!string.IsNullOrEmpty(class_))
            {
                query = query.Where(s => s.Class == class_);
            }

            var sections = await query
                .Select(s => s.Section)
                .Distinct()
                .OrderBy(s => s)
                .ToListAsync();

            return Ok(sections);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving sections");
            return StatusCode(500, "An error occurred while retrieving sections");
        }
    }

    [HttpGet("{id}/fee-history")]
    public async Task<ActionResult<IEnumerable<FeeCollectionDto>>> GetStudentFeeHistory(int id)
    {
        try
        {
            var student = await _context.Students.FindAsync(id);
            if (student == null)
            {
                return NotFound($"Student with ID {id} not found");
            }

            var feeCollections = await _context.FeeCollections
                .Include(fc => fc.Student)
                .Include(fc => fc.FeeStructure)
                .Where(fc => fc.StudentId == id)
                .OrderByDescending(fc => fc.CreatedAt)
                .ToListAsync();

            var feeCollectionDtos = _mapper.Map<IEnumerable<FeeCollectionDto>>(feeCollections);
            return Ok(feeCollectionDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving fee history for student {Id}", id);
            return StatusCode(500, "An error occurred while retrieving the student's fee history");
        }
    }

    [HttpGet("{id}/outstanding-fees")]
    public async Task<ActionResult<decimal>> GetStudentOutstandingFees(int id)
    {
        try
        {
            var student = await _context.Students.FindAsync(id);
            if (student == null)
            {
                return NotFound($"Student with ID {id} not found");
            }

            var outstandingFees = await _context.FeeCollections
                .Where(fc => fc.StudentId == id && fc.PaymentStatus != "Paid")
                .SumAsync(fc => fc.AmountDue - fc.AmountPaid);

            return Ok(outstandingFees);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving outstanding fees for student {Id}", id);
            return StatusCode(500, "An error occurred while retrieving the student's outstanding fees");
        }
    }

    [HttpPost("bulk-import")]
    public async Task<ActionResult<BulkImportResult>> BulkImportStudents([FromBody] List<CreateStudentDto> students)
    {
        try
        {
            var result = new BulkImportResult();
            var studentsToAdd = new List<Student>();

            foreach (var studentDto in students)
            {
                var existingStudent = await _context.Students
                    .FirstOrDefaultAsync(s => s.StudentId == studentDto.StudentId);

                if (existingStudent != null)
                {
                    result.Errors.Add($"Student with ID {studentDto.StudentId} already exists");
                    result.FailedCount++;
                    continue;
                }

                var student = _mapper.Map<Student>(studentDto);
                student.CreatedAt = DateTime.UtcNow;
                student.UpdatedAt = DateTime.UtcNow;

                studentsToAdd.Add(student);
                result.SuccessCount++;
            }

            if (studentsToAdd.Any())
            {
                _context.Students.AddRange(studentsToAdd);
                await _context.SaveChangesAsync();
            }

            result.TotalProcessed = students.Count;
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error bulk importing students");
            return StatusCode(500, "An error occurred while bulk importing students");
        }
    }
}

public class BulkImportResult
{
    public int TotalProcessed { get; set; }
    public int SuccessCount { get; set; }
    public int FailedCount { get; set; }
    public List<string> Errors { get; set; } = new();
}
