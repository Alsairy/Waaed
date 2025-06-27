namespace Waaed.Library.Api.DTOs;

public class MemberDto
{
    public int Id { get; set; }
    public string MembershipId { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public string MemberType { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime JoinDate { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public int MaxBooksAllowed { get; set; }
    public int CurrentBooksIssued { get; set; }
    public decimal? OutstandingFines { get; set; }
    public string? Department { get; set; }
    public string? StudentId { get; set; }
    public string? EmployeeId { get; set; }
    public string? PhotoPath { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateMemberDto
{
    public string MembershipId { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public string MemberType { get; set; } = "Student";
    public DateTime? ExpiryDate { get; set; }
    public int MaxBooksAllowed { get; set; } = 5;
    public string? Department { get; set; }
    public string? StudentId { get; set; }
    public string? EmployeeId { get; set; }
    public string? Notes { get; set; }
}

public class UpdateMemberDto
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public string MemberType { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime? ExpiryDate { get; set; }
    public int MaxBooksAllowed { get; set; }
    public string? Department { get; set; }
    public string? StudentId { get; set; }
    public string? EmployeeId { get; set; }
    public string? Notes { get; set; }
}

public class MemberSummaryDto
{
    public int TotalMembers { get; set; }
    public int ActiveMembers { get; set; }
    public int InactiveMembers { get; set; }
    public int ExpiredMembers { get; set; }
    public Dictionary<string, int> MembersByType { get; set; } = new();
    public Dictionary<string, int> MembersByDepartment { get; set; } = new();
}
