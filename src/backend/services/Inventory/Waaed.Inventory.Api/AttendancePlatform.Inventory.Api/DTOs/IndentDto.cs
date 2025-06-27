namespace AttendancePlatform.Inventory.Api.DTOs;

public class IndentDto
{
    public int Id { get; set; }
    public string IndentNumber { get; set; } = string.Empty;
    public DateTime IndentDate { get; set; }
    public DateTime RequiredDate { get; set; }
    public string RequestedBy { get; set; } = string.Empty;
    public string? Department { get; set; }
    public int StoreId { get; set; }
    public string? StoreName { get; set; }
    public string Status { get; set; } = "Pending";
    public string? ApprovedBy { get; set; }
    public DateTime? ApprovedDate { get; set; }
    public string? ApprovalNotes { get; set; }
    public string? Priority { get; set; }
    public string? Purpose { get; set; }
    public string? Notes { get; set; }
    public decimal TotalEstimatedCost { get; set; }
    public bool IsRecurring { get; set; }
    public string? RecurrencePattern { get; set; }
    public DateTime? NextRecurrenceDate { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public List<IndentItemDto> IndentItems { get; set; } = new List<IndentItemDto>();
}

public class IndentItemDto
{
    public int Id { get; set; }
    public int IndentId { get; set; }
    public int ItemId { get; set; }
    public string? ItemName { get; set; }
    public string? ItemCode { get; set; }
    public string? ItemUnit { get; set; }
    public int RequestedQuantity { get; set; }
    public int? ApprovedQuantity { get; set; }
    public int? IssuedQuantity { get; set; }
    public decimal EstimatedUnitCost { get; set; }
    public decimal EstimatedTotalCost { get; set; }
    public string? Specifications { get; set; }
    public string? Notes { get; set; }
    public string Status { get; set; } = "Pending";
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateIndentDto
{
    public DateTime RequiredDate { get; set; }
    public string RequestedBy { get; set; } = string.Empty;
    public string? Department { get; set; }
    public int StoreId { get; set; }
    public string? Priority { get; set; } = "Normal";
    public string? Purpose { get; set; }
    public string? Notes { get; set; }
    public bool IsRecurring { get; set; } = false;
    public string? RecurrencePattern { get; set; }
    public DateTime? NextRecurrenceDate { get; set; }
    public List<CreateIndentItemDto> IndentItems { get; set; } = new List<CreateIndentItemDto>();
}

public class CreateIndentItemDto
{
    public int ItemId { get; set; }
    public int RequestedQuantity { get; set; }
    public decimal EstimatedUnitCost { get; set; }
    public string? Specifications { get; set; }
    public string? Notes { get; set; }
}

public class UpdateIndentDto
{
    public DateTime RequiredDate { get; set; }
    public string? Department { get; set; }
    public string? Priority { get; set; }
    public string? Purpose { get; set; }
    public string? Notes { get; set; }
    public bool IsRecurring { get; set; }
    public string? RecurrencePattern { get; set; }
    public DateTime? NextRecurrenceDate { get; set; }
}

public class ApproveIndentDto
{
    public string ApprovedBy { get; set; } = string.Empty;
    public string? ApprovalNotes { get; set; }
    public List<ApproveIndentItemDto> IndentItems { get; set; } = new List<ApproveIndentItemDto>();
}

public class ApproveIndentItemDto
{
    public int IndentItemId { get; set; }
    public int? ApprovedQuantity { get; set; }
    public string Status { get; set; } = "Approved";
}
