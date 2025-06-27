namespace AttendancePlatform.HR.Api.DTOs;

public class EmployeeDto
{
    public int Id { get; set; }
    public string EmployeeId { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public DateTime DateOfBirth { get; set; }
    public string Gender { get; set; } = string.Empty;
    public string? MaritalStatus { get; set; }
    public string? Nationality { get; set; }
    public string? NationalId { get; set; }
    public string? PassportNumber { get; set; }
    public DateTime? PassportExpiry { get; set; }
    public DateTime HireDate { get; set; }
    public DateTime? TerminationDate { get; set; }
    public string EmploymentStatus { get; set; } = string.Empty;
    public string EmploymentType { get; set; } = string.Empty;
    public int DepartmentId { get; set; }
    public string DepartmentName { get; set; } = string.Empty;
    public int PositionId { get; set; }
    public string PositionTitle { get; set; } = string.Empty;
    public int? ManagerId { get; set; }
    public string? ManagerName { get; set; }
    public decimal BasicSalary { get; set; }
    public string? PayrollFrequency { get; set; }
    public string? BankAccount { get; set; }
    public string? BankName { get; set; }
    public string? TaxId { get; set; }
    public string? SocialSecurityNumber { get; set; }
    public string? EmergencyContactName { get; set; }
    public string? EmergencyContactPhone { get; set; }
    public string? EmergencyContactRelation { get; set; }
    public string? ProfilePicturePath { get; set; }
    public string? Notes { get; set; }
    public bool IsActive { get; set; }
}

public class CreateEmployeeDto
{
    public string EmployeeId { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public DateTime DateOfBirth { get; set; }
    public string Gender { get; set; } = string.Empty;
    public string? MaritalStatus { get; set; }
    public string? Nationality { get; set; }
    public string? NationalId { get; set; }
    public string? PassportNumber { get; set; }
    public DateTime? PassportExpiry { get; set; }
    public DateTime HireDate { get; set; }
    public string EmploymentStatus { get; set; } = "Active";
    public string EmploymentType { get; set; } = "Full-Time";
    public int DepartmentId { get; set; }
    public int PositionId { get; set; }
    public int? ManagerId { get; set; }
    public decimal BasicSalary { get; set; }
    public string? PayrollFrequency { get; set; }
    public string? BankAccount { get; set; }
    public string? BankName { get; set; }
    public string? TaxId { get; set; }
    public string? SocialSecurityNumber { get; set; }
    public string? EmergencyContactName { get; set; }
    public string? EmergencyContactPhone { get; set; }
    public string? EmergencyContactRelation { get; set; }
    public string? Notes { get; set; }
}

public class UpdateEmployeeDto
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public DateTime DateOfBirth { get; set; }
    public string Gender { get; set; } = string.Empty;
    public string? MaritalStatus { get; set; }
    public string? Nationality { get; set; }
    public string? NationalId { get; set; }
    public string? PassportNumber { get; set; }
    public DateTime? PassportExpiry { get; set; }
    public DateTime? TerminationDate { get; set; }
    public string EmploymentStatus { get; set; } = string.Empty;
    public string EmploymentType { get; set; } = string.Empty;
    public int DepartmentId { get; set; }
    public int PositionId { get; set; }
    public int? ManagerId { get; set; }
    public decimal BasicSalary { get; set; }
    public string? PayrollFrequency { get; set; }
    public string? BankAccount { get; set; }
    public string? BankName { get; set; }
    public string? TaxId { get; set; }
    public string? SocialSecurityNumber { get; set; }
    public string? EmergencyContactName { get; set; }
    public string? EmergencyContactPhone { get; set; }
    public string? EmergencyContactRelation { get; set; }
    public string? Notes { get; set; }
    public bool IsActive { get; set; }
}

public class EmployeeSummaryDto
{
    public int TotalEmployees { get; set; }
    public int ActiveEmployees { get; set; }
    public int InactiveEmployees { get; set; }
    public int NewHiresThisMonth { get; set; }
    public int TerminationsThisMonth { get; set; }
    public Dictionary<string, int> EmployeesByDepartment { get; set; } = new();
    public Dictionary<string, int> EmployeesByPosition { get; set; } = new();
    public Dictionary<string, int> EmployeesByEmploymentType { get; set; } = new();
}
