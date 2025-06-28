namespace Waaed.LMS.Api.DTOs;

public class CourseDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string InstructorId { get; set; } = string.Empty;
    public string InstructorName { get; set; } = string.Empty;
    public string TenantId { get; set; } = string.Empty;
    public Guid? TemplateId { get; set; }
    public bool IsTemplate { get; set; }
    public string SyllabusContent { get; set; } = string.Empty;
    public int Credits { get; set; }
    public string Department { get; set; } = string.Empty;
    public string Term { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    public string UpdatedBy { get; set; } = string.Empty;
    public int EnrollmentCount { get; set; }
    public int ModuleCount { get; set; }
    public int AssignmentCount { get; set; }
}

public class CreateCourseDto
{
    public string Title { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string InstructorId { get; set; } = string.Empty;
    public Guid? TemplateId { get; set; }
    public string SyllabusContent { get; set; } = string.Empty;
    public int Credits { get; set; }
    public string Department { get; set; } = string.Empty;
    public string Term { get; set; } = string.Empty;
}

public class UpdateCourseDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string SyllabusContent { get; set; } = string.Empty;
    public int Credits { get; set; }
    public string Department { get; set; } = string.Empty;
    public string Term { get; set; } = string.Empty;
}

public class CourseListDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string InstructorName { get; set; } = string.Empty;
    public int EnrollmentCount { get; set; }
    public DateTime UpdatedAt { get; set; }
}
