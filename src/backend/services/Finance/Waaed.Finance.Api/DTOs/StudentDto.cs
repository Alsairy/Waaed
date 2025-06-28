namespace Waaed.Finance.Api.DTOs;

public class StudentDto
{
    public int Id { get; set; }
    public string StudentId { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Class { get; set; } = string.Empty;
    public string Section { get; set; } = string.Empty;
    public string? RollNumber { get; set; }
    public DateTime AdmissionDate { get; set; }
    public bool IsActive { get; set; }
    public string? ParentName { get; set; }
    public string? ParentPhone { get; set; }
    public string? ParentEmail { get; set; }
    public string? Address { get; set; }
}

public class CreateStudentDto
{
    public string StudentId { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Class { get; set; } = string.Empty;
    public string Section { get; set; } = string.Empty;
    public string? RollNumber { get; set; }
    public DateTime AdmissionDate { get; set; }
    public string? ParentName { get; set; }
    public string? ParentPhone { get; set; }
    public string? ParentEmail { get; set; }
    public string? Address { get; set; }
}

public class UpdateStudentDto
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Class { get; set; } = string.Empty;
    public string Section { get; set; } = string.Empty;
    public string? RollNumber { get; set; }
    public bool IsActive { get; set; }
    public string? ParentName { get; set; }
    public string? ParentPhone { get; set; }
    public string? ParentEmail { get; set; }
    public string? Address { get; set; }
}
