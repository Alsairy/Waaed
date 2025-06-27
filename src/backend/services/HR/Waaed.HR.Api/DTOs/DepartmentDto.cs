namespace AttendancePlatform.HR.Api.DTOs;

public class DepartmentDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Code { get; set; } = string.Empty;
    public int? ParentDepartmentId { get; set; }
    public string? ParentDepartmentName { get; set; }
    public int? HeadOfDepartmentId { get; set; }
    public string? HeadOfDepartmentName { get; set; }
    public string? Location { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public decimal? Budget { get; set; }
    public string? CostCenter { get; set; }
    public bool IsActive { get; set; }
    public int EmployeeCount { get; set; }
    public List<DepartmentDto> SubDepartments { get; set; } = new();
}

public class CreateDepartmentDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Code { get; set; } = string.Empty;
    public int? ParentDepartmentId { get; set; }
    public int? HeadOfDepartmentId { get; set; }
    public string? Location { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public decimal? Budget { get; set; }
    public string? CostCenter { get; set; }
}

public class UpdateDepartmentDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Code { get; set; } = string.Empty;
    public int? ParentDepartmentId { get; set; }
    public int? HeadOfDepartmentId { get; set; }
    public string? Location { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public decimal? Budget { get; set; }
    public string? CostCenter { get; set; }
    public bool IsActive { get; set; }
}

public class DepartmentHierarchyDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public int Level { get; set; }
    public List<DepartmentHierarchyDto> Children { get; set; } = new();
}
