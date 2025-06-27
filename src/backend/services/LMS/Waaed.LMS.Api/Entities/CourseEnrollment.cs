namespace Waaed.LMS.Api.Entities;

public class CourseEnrollment
{
    public Guid Id { get; set; }
    public Guid CourseId { get; set; }
    public string UserId { get; set; } = string.Empty;
    public EnrollmentRole Role { get; set; }
    public EnrollmentStatus Status { get; set; }
    public DateTime EnrolledAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public string SectionId { get; set; } = string.Empty;
    public bool CanViewGrades { get; set; } = true;
    public bool CanSubmitAssignments { get; set; } = true;
    public bool CanParticipateDiscussions { get; set; } = true;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public virtual Course Course { get; set; } = null!;
}

public enum EnrollmentRole
{
    Student,
    Teacher,
    TeachingAssistant,
    Observer,
    Designer
}

public enum EnrollmentStatus
{
    Active,
    Inactive,
    Completed,
    Withdrawn,
    Invited
}
