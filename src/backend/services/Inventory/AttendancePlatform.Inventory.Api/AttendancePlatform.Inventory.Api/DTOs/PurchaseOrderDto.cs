namespace AttendancePlatform.Inventory.Api.DTOs;

public class PurchaseOrderDto
{
    public int Id { get; set; }
    public string PONumber { get; set; } = string.Empty;
    public DateTime PODate { get; set; }
    public DateTime RequiredDate { get; set; }
    public int SupplierId { get; set; }
    public string? SupplierName { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    public string? ApprovedBy { get; set; }
    public DateTime? ApprovedDate { get; set; }
    public string Status { get; set; } = "Draft";
    public decimal SubTotal { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal TotalAmount { get; set; }
    public string? PaymentTerms { get; set; }
    public string? DeliveryAddress { get; set; }
    public string? Terms { get; set; }
    public string? Notes { get; set; }
    public string? ReferenceNumber { get; set; }
    public DateTime? ExpectedDeliveryDate { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public List<PurchaseOrderItemDto> PurchaseOrderItems { get; set; } = new List<PurchaseOrderItemDto>();
}

public class PurchaseOrderItemDto
{
    public int Id { get; set; }
    public int PurchaseOrderId { get; set; }
    public int ItemId { get; set; }
    public string? ItemName { get; set; }
    public string? ItemCode { get; set; }
    public string? ItemUnit { get; set; }
    public int OrderedQuantity { get; set; }
    public int ReceivedQuantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalPrice { get; set; }
    public decimal? DiscountPercentage { get; set; }
    public decimal? DiscountAmount { get; set; }
    public decimal? TaxPercentage { get; set; }
    public decimal? TaxAmount { get; set; }
    public string? Specifications { get; set; }
    public string? Notes { get; set; }
    public string Status { get; set; } = "Pending";
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreatePurchaseOrderDto
{
    public DateTime RequiredDate { get; set; }
    public int SupplierId { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    public string? PaymentTerms { get; set; }
    public string? DeliveryAddress { get; set; }
    public string? Terms { get; set; }
    public string? Notes { get; set; }
    public string? ReferenceNumber { get; set; }
    public DateTime? ExpectedDeliveryDate { get; set; }
    public List<CreatePurchaseOrderItemDto> PurchaseOrderItems { get; set; } = new List<CreatePurchaseOrderItemDto>();
}

public class CreatePurchaseOrderItemDto
{
    public int ItemId { get; set; }
    public int OrderedQuantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal? DiscountPercentage { get; set; }
    public decimal? TaxPercentage { get; set; }
    public string? Specifications { get; set; }
    public string? Notes { get; set; }
}

public class UpdatePurchaseOrderDto
{
    public DateTime RequiredDate { get; set; }
    public string? PaymentTerms { get; set; }
    public string? DeliveryAddress { get; set; }
    public string? Terms { get; set; }
    public string? Notes { get; set; }
    public string? ReferenceNumber { get; set; }
    public DateTime? ExpectedDeliveryDate { get; set; }
}
