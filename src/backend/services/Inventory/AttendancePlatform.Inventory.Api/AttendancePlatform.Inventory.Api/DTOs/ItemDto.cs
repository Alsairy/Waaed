namespace AttendancePlatform.Inventory.Api.DTOs;

public class ItemDto
{
    public int Id { get; set; }
    public string ItemCode { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Category { get; set; } = string.Empty;
    public string? SubCategory { get; set; }
    public string Unit { get; set; } = string.Empty;
    public decimal UnitCost { get; set; }
    public int CurrentStock { get; set; }
    public int MinimumStock { get; set; }
    public int MaximumStock { get; set; }
    public int ReorderLevel { get; set; }
    public int ReorderQuantity { get; set; }
    public int StoreId { get; set; }
    public string? StoreName { get; set; }
    public int? PreferredSupplierId { get; set; }
    public string? PreferredSupplierName { get; set; }
    public string? Brand { get; set; }
    public string? Model { get; set; }
    public string? Specifications { get; set; }
    public string? ImagePath { get; set; }
    public string? Barcode { get; set; }
    public string Status { get; set; } = "Active";
    public bool IsConsumable { get; set; }
    public bool RequiresApproval { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public string? Location { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateItemDto
{
    public string ItemCode { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Category { get; set; } = string.Empty;
    public string? SubCategory { get; set; }
    public string Unit { get; set; } = string.Empty;
    public decimal UnitCost { get; set; }
    public int CurrentStock { get; set; }
    public int MinimumStock { get; set; }
    public int MaximumStock { get; set; }
    public int ReorderLevel { get; set; }
    public int ReorderQuantity { get; set; }
    public int StoreId { get; set; }
    public int? PreferredSupplierId { get; set; }
    public string? Brand { get; set; }
    public string? Model { get; set; }
    public string? Specifications { get; set; }
    public string? ImagePath { get; set; }
    public string? Barcode { get; set; }
    public string Status { get; set; } = "Active";
    public bool IsConsumable { get; set; } = true;
    public bool RequiresApproval { get; set; } = false;
    public DateTime? ExpiryDate { get; set; }
    public string? Location { get; set; }
    public string? Notes { get; set; }
}

public class UpdateItemDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Category { get; set; } = string.Empty;
    public string? SubCategory { get; set; }
    public string Unit { get; set; } = string.Empty;
    public decimal UnitCost { get; set; }
    public int MinimumStock { get; set; }
    public int MaximumStock { get; set; }
    public int ReorderLevel { get; set; }
    public int ReorderQuantity { get; set; }
    public int? PreferredSupplierId { get; set; }
    public string? Brand { get; set; }
    public string? Model { get; set; }
    public string? Specifications { get; set; }
    public string? ImagePath { get; set; }
    public string? Barcode { get; set; }
    public string Status { get; set; } = "Active";
    public bool IsConsumable { get; set; }
    public bool RequiresApproval { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public string? Location { get; set; }
    public string? Notes { get; set; }
}
