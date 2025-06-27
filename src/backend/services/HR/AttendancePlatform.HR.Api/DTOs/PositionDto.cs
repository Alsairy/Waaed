namespace AttendancePlatform.HR.Api.DTOs;

public class PositionDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Code { get; set; } = string.Empty;
    public int DepartmentId { get; set; }
    public string DepartmentName { get; set; } = string.Empty;
    public string Level { get; set; } = string.Empty;
    public string Grade { get; set; } = string.Empty;
    public decimal MinSalary { get; set; }
    public decimal MaxSalary { get; set; }
    public string? Responsibilities { get; set; }
    public string? Requirements { get; set; }
    public string? Skills { get; set; }
    public string? Qualifications { get; set; }
    public int? ExperienceYears { get; set; }
    public string EmploymentType { get; set; } = string.Empty;
    public string? ReportsTo { get; set; }
    public bool IsActive { get; set; }
    public int EmployeeCount { get; set; }
}

public class CreatePositionDto
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Code { get; set; } = string.Empty;
    public int DepartmentId { get; set; }
    public string Level { get; set; } = string.Empty;
    public string Grade { get; set; } = string.Empty;
    public decimal MinSalary { get; set; }
    public decimal MaxSalary { get; set; }
    public string? Responsibilities { get; set; }
    public string? Requirements { get; set; }
    public string? Skills { get; set; }
    public string? Qualifications { get; set; }
    public int? ExperienceYears { get; set; }
    public string EmploymentType { get; set; } = "Full-Time";
    public string? ReportsTo { get; set; }
}

public class UpdatePositionDto
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Code { get; set; } = string.Empty;
    public int DepartmentId { get; set; }
    public string Level { get; set; } = string.Empty;
    public string Grade { get; set; } = string.Empty;
    public decimal MinSalary { get; set; }
    public decimal MaxSalary { get; set; }
    public string? Responsibilities { get; set; }
    public string? Requirements { get; set; }
    public string? Skills { get; set; }
    public string? Qualifications { get; set; }
    public int? ExperienceYears { get; set; }
    public string EmploymentType { get; set; } = string.Empty;
    public string? ReportsTo { get; set; }
    public bool IsActive { get; set; }
}
