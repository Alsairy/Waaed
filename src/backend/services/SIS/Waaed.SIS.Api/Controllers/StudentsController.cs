using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutoMapper;
using Waaed.SIS.Api.Data;
using Waaed.SIS.Api.Entities;
using Waaed.SIS.Api.DTOs;

namespace Waaed.SIS.Api.Controllers;

[ApiController]
[Route("api/sis/[controller]")]
public class StudentsController : ControllerBase
{
    private readonly SISDbContext _context;
    private readonly IMapper _mapper;
    private readonly ILogger<StudentsController> _logger;

    public StudentsController(SISDbContext context, IMapper mapper, ILogger<StudentsController> logger)
    {
        _context = context;
        _mapper = mapper;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<StudentDto>>> GetStudents()
    {
        try
        {
            var students = await _context.Students
                .Where(s => !s.IsDeleted)
                .ToListAsync();
            
            var studentDtos = _mapper.Map<IEnumerable<StudentDto>>(students);
            return Ok(new { data = studentDtos });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving students");
            return StatusCode(500, "An error occurred while retrieving students");
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<StudentDto>> GetStudent(Guid id)
    {
        try
        {
            var student = await _context.Students
                .Where(s => s.Id == id && !s.IsDeleted)
                .FirstOrDefaultAsync();
            
            if (student == null)
                return NotFound();
            
            var studentDto = _mapper.Map<StudentDto>(student);
            return Ok(new { data = studentDto });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving student with ID {StudentId}", id);
            return StatusCode(500, "An error occurred while retrieving the student");
        }
    }

    [HttpPost]
    public async Task<ActionResult<StudentDto>> CreateStudent(StudentDto studentDto)
    {
        try
        {
            var student = _mapper.Map<Student>(studentDto);
            student.Id = Guid.NewGuid();
            student.CreatedAt = DateTime.UtcNow;
            
            _context.Students.Add(student);
            await _context.SaveChangesAsync();
            
            var createdStudentDto = _mapper.Map<StudentDto>(student);
            return CreatedAtAction(nameof(GetStudent), new { id = student.Id }, new { data = createdStudentDto });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating student");
            return StatusCode(500, "An error occurred while creating the student");
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateStudent(Guid id, StudentDto studentDto)
    {
        try
        {
            var student = await _context.Students
                .Where(s => s.Id == id && !s.IsDeleted)
                .FirstOrDefaultAsync();
            
            if (student == null)
                return NotFound();
            
            _mapper.Map(studentDto, student);
            student.UpdatedAt = DateTime.UtcNow;
            
            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating student with ID {StudentId}", id);
            return StatusCode(500, "An error occurred while updating the student");
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteStudent(Guid id)
    {
        try
        {
            var student = await _context.Students
                .Where(s => s.Id == id && !s.IsDeleted)
                .FirstOrDefaultAsync();
            
            if (student == null)
                return NotFound();
            
            student.IsDeleted = true;
            student.DeletedAt = DateTime.UtcNow;
            student.UpdatedAt = DateTime.UtcNow;
            
            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting student with ID {StudentId}", id);
            return StatusCode(500, "An error occurred while deleting the student");
        }
    }
}
