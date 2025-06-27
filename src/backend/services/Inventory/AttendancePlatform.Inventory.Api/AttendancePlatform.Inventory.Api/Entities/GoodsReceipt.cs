using System.ComponentModel.DataAnnotations;

namespace AttendancePlatform.Inventory.Api.Entities;

public class GoodsReceipt
{
    public int Id { get; set; }
    
    [Required]
    [StringLength(20)]
    public string GRNNumber { get; set; } = string.Empty;
    
    public DateTime GRNDate { get; set; } = DateTime.UtcNow;
    
    public int? PurchaseOrderId { get; set; }
    
    public int SupplierId { get; set; }
    
    [Required]
    [StringLength(100)]
    public string ReceivedBy { get; set; } = string.Empty;
    
    [StringLength(100)]
    public string? InspectedBy { get; set; }
    
    [StringLength(100)]
    public string? DeliveryNote { get; set; }
    
    [StringLength(100)]
    public string? InvoiceNumber { get; set; }
    
    public DateTime? InvoiceDate { get; set; }
    
    [StringLength(100)]
    public string? VehicleNumber { get; set; }
    
    [StringLength(100)]
    public string? DriverName { get; set; }
    
    [Required]
    [StringLength(20)]
    public string Status { get; set; } = "Draft"; // Draft, Received, Inspected, Accepted, Rejected, Posted
    
    public decimal TotalAmount { get; set; } = 0;
    
    [StringLength(1000)]
    public string? Notes { get; set; }
    
    [StringLength(1000)]
    public string? QualityNotes { get; set; }
    
    public bool IsQualityApproved { get; set; } = false;
    
    public DateTime? QualityApprovedDate { get; set; }
    
    [StringLength(100)]
    public string? QualityApprovedBy { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    public virtual PurchaseOrder? PurchaseOrder { get; set; }
    public virtual Supplier Supplier { get; set; } = null!;
    public virtual ICollection<GoodsReceiptItem> GoodsReceiptItems { get; set; } = new List<GoodsReceiptItem>();
}

public class GoodsReceiptItem
{
    public int Id { get; set; }
    
    public int GoodsReceiptId { get; set; }
    
    public int ItemId { get; set; }
    
    public int? PurchaseOrderItemId { get; set; }
    
    public int OrderedQuantity { get; set; }
    
    public int ReceivedQuantity { get; set; }
    
    public int AcceptedQuantity { get; set; }
    
    public int RejectedQuantity { get; set; } = 0;
    
    public decimal UnitPrice { get; set; }
    
    public decimal TotalPrice { get; set; }
    
    [StringLength(50)]
    public string? BatchNumber { get; set; }
    
    public DateTime? ExpiryDate { get; set; }
    
    [StringLength(100)]
    public string? SerialNumbers { get; set; }
    
    [StringLength(1000)]
    public string? QualityNotes { get; set; }
    
    [StringLength(1000)]
    public string? RejectionReason { get; set; }
    
    [Required]
    [StringLength(20)]
    public string Status { get; set; } = "Received"; // Received, Accepted, Rejected, Partial
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    public virtual GoodsReceipt GoodsReceipt { get; set; } = null!;
    public virtual Item Item { get; set; } = null!;
    public virtual PurchaseOrderItem? PurchaseOrderItem { get; set; }
}
