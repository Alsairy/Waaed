namespace AttendancePlatform.Inventory.Api.DTOs;

public class StockAdjustmentDto
{
    public int Id { get; set; }
    public string AdjustmentNumber { get; set; } = string.Empty;
    public DateTime AdjustmentDate { get; set; }
    public int StoreId { get; set; }
    public string? StoreName { get; set; }
    public int ItemId { get; set; }
    public string? ItemName { get; set; }
    public string? ItemCode { get; set; }
    public string? ItemUnit { get; set; }
    public string AdjustmentType { get; set; } = string.Empty;
    public int CurrentStock { get; set; }
    public int AdjustedStock { get; set; }
    public int AdjustmentQuantity { get; set; }
    public string AdjustmentDirection { get; set; } = string.Empty;
    public string AdjustedBy { get; set; } = string.Empty;
    public string? ApprovedBy { get; set; }
    public DateTime? ApprovedDate { get; set; }
    public string Reason { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public string Status { get; set; } = "Pending";
    public decimal UnitCost { get; set; }
    public decimal TotalCostImpact { get; set; }
    public string? ReferenceDocument { get; set; }
    public string? BatchNumber { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateStockAdjustmentDto
{
    public int StoreId { get; set; }
    public int ItemId { get; set; }
    public string AdjustmentType { get; set; } = string.Empty;
    public int AdjustmentQuantity { get; set; }
    public string AdjustmentDirection { get; set; } = string.Empty;
    public string AdjustedBy { get; set; } = string.Empty;
    public string Reason { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public decimal UnitCost { get; set; }
    public string? ReferenceDocument { get; set; }
    public string? BatchNumber { get; set; }
    public DateTime? ExpiryDate { get; set; }
}

public class UpdateStockAdjustmentDto
{
    public string AdjustmentType { get; set; } = string.Empty;
    public int AdjustmentQuantity { get; set; }
    public string AdjustmentDirection { get; set; } = string.Empty;
    public string Reason { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public decimal UnitCost { get; set; }
    public string? ReferenceDocument { get; set; }
    public string? BatchNumber { get; set; }
    public DateTime? ExpiryDate { get; set; }
}

public class ApproveStockAdjustmentDto
{
    public string ApprovedBy { get; set; } = string.Empty;
    public string? Notes { get; set; }
}
