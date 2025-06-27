using System.ComponentModel.DataAnnotations;

namespace AttendancePlatform.Inventory.Api.Entities;

public class PurchaseOrder
{
    public int Id { get; set; }
    
    [Required]
    [StringLength(20)]
    public string PONumber { get; set; } = string.Empty;
    
    public DateTime PODate { get; set; } = DateTime.UtcNow;
    
    public DateTime RequiredDate { get; set; }
    
    public int SupplierId { get; set; }
    
    [Required]
    [StringLength(100)]
    public string CreatedBy { get; set; } = string.Empty;
    
    [StringLength(100)]
    public string? ApprovedBy { get; set; }
    
    public DateTime? ApprovedDate { get; set; }
    
    [Required]
    [StringLength(20)]
    public string Status { get; set; } = "Draft"; // Draft, Sent, Acknowledged, Partially Received, Received, Cancelled, Closed
    
    public decimal SubTotal { get; set; } = 0;
    
    public decimal TaxAmount { get; set; } = 0;
    
    public decimal DiscountAmount { get; set; } = 0;
    
    public decimal TotalAmount { get; set; } = 0;
    
    [StringLength(50)]
    public string? PaymentTerms { get; set; }
    
    [StringLength(500)]
    public string? DeliveryAddress { get; set; }
    
    [StringLength(1000)]
    public string? Terms { get; set; }
    
    [StringLength(1000)]
    public string? Notes { get; set; }
    
    [StringLength(100)]
    public string? ReferenceNumber { get; set; }
    
    public DateTime? ExpectedDeliveryDate { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    public virtual Supplier Supplier { get; set; } = null!;
    public virtual ICollection<PurchaseOrderItem> PurchaseOrderItems { get; set; } = new List<PurchaseOrderItem>();
    public virtual ICollection<GoodsReceipt> GoodsReceipts { get; set; } = new List<GoodsReceipt>();
}

public class PurchaseOrderItem
{
    public int Id { get; set; }
    
    public int PurchaseOrderId { get; set; }
    
    public int ItemId { get; set; }
    
    public int OrderedQuantity { get; set; }
    
    public int ReceivedQuantity { get; set; } = 0;
    
    public decimal UnitPrice { get; set; }
    
    public decimal TotalPrice { get; set; }
    
    public decimal? DiscountPercentage { get; set; }
    
    public decimal? DiscountAmount { get; set; }
    
    public decimal? TaxPercentage { get; set; }
    
    public decimal? TaxAmount { get; set; }
    
    [StringLength(1000)]
    public string? Specifications { get; set; }
    
    [StringLength(1000)]
    public string? Notes { get; set; }
    
    [Required]
    [StringLength(20)]
    public string Status { get; set; } = "Pending"; // Pending, Partially Received, Received, Cancelled
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    public virtual PurchaseOrder PurchaseOrder { get; set; } = null!;
    public virtual Item Item { get; set; } = null!;
}
