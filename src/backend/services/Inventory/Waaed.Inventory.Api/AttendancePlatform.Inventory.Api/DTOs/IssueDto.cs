namespace AttendancePlatform.Inventory.Api.DTOs;

public class IssueDto
{
    public int Id { get; set; }
    public string IssueNumber { get; set; } = string.Empty;
    public DateTime IssueDate { get; set; }
    public int StoreId { get; set; }
    public string? StoreName { get; set; }
    public string IssuedTo { get; set; } = string.Empty;
    public string? Department { get; set; }
    public string? EmployeeId { get; set; }
    public string IssuedBy { get; set; } = string.Empty;
    public string? ApprovedBy { get; set; }
    public DateTime? ApprovedDate { get; set; }
    public string IssueType { get; set; } = "Direct";
    public int? IndentId { get; set; }
    public string? IndentNumber { get; set; }
    public int? TransferToStoreId { get; set; }
    public string? TransferToStoreName { get; set; }
    public string Status { get; set; } = "Draft";
    public string? Purpose { get; set; }
    public string? Notes { get; set; }
    public decimal TotalValue { get; set; }
    public bool RequiresReturn { get; set; }
    public DateTime? ExpectedReturnDate { get; set; }
    public DateTime? ActualReturnDate { get; set; }
    public string? ReturnNotes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public List<IssueItemDto> IssueItems { get; set; } = new List<IssueItemDto>();
}

public class IssueItemDto
{
    public int Id { get; set; }
    public int IssueId { get; set; }
    public int ItemId { get; set; }
    public string? ItemName { get; set; }
    public string? ItemCode { get; set; }
    public string? ItemUnit { get; set; }
    public int? IndentItemId { get; set; }
    public int IssuedQuantity { get; set; }
    public int? ReturnedQuantity { get; set; }
    public decimal UnitCost { get; set; }
    public decimal TotalCost { get; set; }
    public string? BatchNumber { get; set; }
    public string? SerialNumbers { get; set; }
    public string? Notes { get; set; }
    public string Status { get; set; } = "Issued";
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateIssueDto
{
    public int StoreId { get; set; }
    public string IssuedTo { get; set; } = string.Empty;
    public string? Department { get; set; }
    public string? EmployeeId { get; set; }
    public string IssuedBy { get; set; } = string.Empty;
    public string IssueType { get; set; } = "Direct";
    public int? IndentId { get; set; }
    public int? TransferToStoreId { get; set; }
    public string? Purpose { get; set; }
    public string? Notes { get; set; }
    public bool RequiresReturn { get; set; } = false;
    public DateTime? ExpectedReturnDate { get; set; }
    public List<CreateIssueItemDto> IssueItems { get; set; } = new List<CreateIssueItemDto>();
}

public class CreateIssueItemDto
{
    public int ItemId { get; set; }
    public int? IndentItemId { get; set; }
    public int IssuedQuantity { get; set; }
    public decimal UnitCost { get; set; }
    public string? BatchNumber { get; set; }
    public string? SerialNumbers { get; set; }
    public string? Notes { get; set; }
}

public class UpdateIssueDto
{
    public string IssuedTo { get; set; } = string.Empty;
    public string? Department { get; set; }
    public string? EmployeeId { get; set; }
    public string? Purpose { get; set; }
    public string? Notes { get; set; }
    public bool RequiresReturn { get; set; }
    public DateTime? ExpectedReturnDate { get; set; }
}

public class ReturnIssueDto
{
    public DateTime ActualReturnDate { get; set; } = DateTime.UtcNow;
    public string? ReturnNotes { get; set; }
    public List<ReturnIssueItemDto> ReturnItems { get; set; } = new List<ReturnIssueItemDto>();
}

public class ReturnIssueItemDto
{
    public int IssueItemId { get; set; }
    public int ReturnedQuantity { get; set; }
    public string? Notes { get; set; }
}
