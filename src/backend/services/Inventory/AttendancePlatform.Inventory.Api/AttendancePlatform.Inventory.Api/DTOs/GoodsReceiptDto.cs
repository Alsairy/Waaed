namespace AttendancePlatform.Inventory.Api.DTOs;

public class GoodsReceiptDto
{
    public int Id { get; set; }
    public string GRNNumber { get; set; } = string.Empty;
    public DateTime GRNDate { get; set; }
    public int? PurchaseOrderId { get; set; }
    public string? PurchaseOrderNumber { get; set; }
    public int SupplierId { get; set; }
    public string? SupplierName { get; set; }
    public string ReceivedBy { get; set; } = string.Empty;
    public string? InspectedBy { get; set; }
    public string? DeliveryNote { get; set; }
    public string? InvoiceNumber { get; set; }
    public DateTime? InvoiceDate { get; set; }
    public string? VehicleNumber { get; set; }
    public string? DriverName { get; set; }
    public string Status { get; set; } = "Draft";
    public decimal TotalAmount { get; set; }
    public string? Notes { get; set; }
    public string? QualityNotes { get; set; }
    public bool IsQualityApproved { get; set; }
    public DateTime? QualityApprovedDate { get; set; }
    public string? QualityApprovedBy { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public List<GoodsReceiptItemDto> GoodsReceiptItems { get; set; } = new List<GoodsReceiptItemDto>();
}

public class GoodsReceiptItemDto
{
    public int Id { get; set; }
    public int GoodsReceiptId { get; set; }
    public int ItemId { get; set; }
    public string? ItemName { get; set; }
    public string? ItemCode { get; set; }
    public string? ItemUnit { get; set; }
    public int? PurchaseOrderItemId { get; set; }
    public int OrderedQuantity { get; set; }
    public int ReceivedQuantity { get; set; }
    public int AcceptedQuantity { get; set; }
    public int RejectedQuantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalPrice { get; set; }
    public string? BatchNumber { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public string? SerialNumbers { get; set; }
    public string? QualityNotes { get; set; }
    public string? RejectionReason { get; set; }
    public string Status { get; set; } = "Received";
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateGoodsReceiptDto
{
    public int? PurchaseOrderId { get; set; }
    public int SupplierId { get; set; }
    public string ReceivedBy { get; set; } = string.Empty;
    public string? DeliveryNote { get; set; }
    public string? InvoiceNumber { get; set; }
    public DateTime? InvoiceDate { get; set; }
    public string? VehicleNumber { get; set; }
    public string? DriverName { get; set; }
    public string? Notes { get; set; }
    public List<CreateGoodsReceiptItemDto> GoodsReceiptItems { get; set; } = new List<CreateGoodsReceiptItemDto>();
}

public class CreateGoodsReceiptItemDto
{
    public int ItemId { get; set; }
    public int? PurchaseOrderItemId { get; set; }
    public int OrderedQuantity { get; set; }
    public int ReceivedQuantity { get; set; }
    public int AcceptedQuantity { get; set; }
    public int RejectedQuantity { get; set; } = 0;
    public decimal UnitPrice { get; set; }
    public string? BatchNumber { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public string? SerialNumbers { get; set; }
    public string? QualityNotes { get; set; }
    public string? RejectionReason { get; set; }
}

public class UpdateGoodsReceiptDto
{
    public string? InspectedBy { get; set; }
    public string? InvoiceNumber { get; set; }
    public DateTime? InvoiceDate { get; set; }
    public string? VehicleNumber { get; set; }
    public string? DriverName { get; set; }
    public string? Notes { get; set; }
    public string? QualityNotes { get; set; }
}

public class QualityApprovalDto
{
    public bool IsQualityApproved { get; set; }
    public string QualityApprovedBy { get; set; } = string.Empty;
    public string? QualityNotes { get; set; }
    public List<QualityApprovalItemDto> Items { get; set; } = new List<QualityApprovalItemDto>();
}

public class QualityApprovalItemDto
{
    public int GoodsReceiptItemId { get; set; }
    public int AcceptedQuantity { get; set; }
    public int RejectedQuantity { get; set; }
    public string? QualityNotes { get; set; }
    public string? RejectionReason { get; set; }
}
