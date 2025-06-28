namespace Waaed.LMS.Api.DTOs;

public class EnrollmentDto
{
    public Guid Id { get; set; }
    public Guid CourseId { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string UserEmail { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime EnrolledAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public string SectionId { get; set; } = string.Empty;
    public bool CanViewGrades { get; set; }
    public bool CanSubmitAssignments { get; set; }
    public bool CanParticipateDiscussions { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateEnrollmentDto
{
    public Guid CourseId { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string SectionId { get; set; } = string.Empty;
    public bool CanViewGrades { get; set; } = true;
    public bool CanSubmitAssignments { get; set; } = true;
    public bool CanParticipateDiscussions { get; set; } = true;
}

public class UpdateEnrollmentDto
{
    public string Role { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string SectionId { get; set; } = string.Empty;
    public bool CanViewGrades { get; set; }
    public bool CanSubmitAssignments { get; set; }
    public bool CanParticipateDiscussions { get; set; }
}

public class BulkEnrollmentDto
{
    public Guid CourseId { get; set; }
    public List<string> UserIds { get; set; } = new();
    public string Role { get; set; } = string.Empty;
    public string SectionId { get; set; } = string.Empty;
}
