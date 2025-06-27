using System.ComponentModel.DataAnnotations;

namespace AttendancePlatform.LMS.Api.Entities;

public class Course
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public CourseStatus Status { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string InstructorId { get; set; } = string.Empty;
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

    public virtual ICollection<CourseModule> Modules { get; set; } = new List<CourseModule>();
    public virtual ICollection<Assignment> Assignments { get; set; } = new List<Assignment>();
    public virtual ICollection<Quiz> Quizzes { get; set; } = new List<Quiz>();
    public virtual ICollection<Discussion> Discussions { get; set; } = new List<Discussion>();
    public virtual ICollection<Announcement> Announcements { get; set; } = new List<Announcement>();
    public virtual ICollection<CourseEnrollment> Enrollments { get; set; } = new List<CourseEnrollment>();
    public virtual CourseTemplate? Template { get; set; }
}

public enum CourseStatus
{
    Draft,
    Published,
    Archived,
    Completed
}
