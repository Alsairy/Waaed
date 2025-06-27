using System.ComponentModel.DataAnnotations;

namespace AttendancePlatform.Inventory.Api.Entities;

public class Item
{
    public int Id { get; set; }
    
    [Required]
    [StringLength(20)]
    public string ItemCode { get; set; } = string.Empty;
    
    [Required]
    [StringLength(200)]
    public string Name { get; set; } = string.Empty;
    
    [StringLength(1000)]
    public string? Description { get; set; }
    
    [Required]
    [StringLength(100)]
    public string Category { get; set; } = string.Empty;
    
    [StringLength(100)]
    public string? SubCategory { get; set; }
    
    [Required]
    [StringLength(20)]
    public string Unit { get; set; } = string.Empty; // Pieces, Kg, Liters, etc.
    
    public decimal UnitCost { get; set; }
    
    public int CurrentStock { get; set; } = 0;
    
    public int MinimumStock { get; set; } = 0;
    
    public int MaximumStock { get; set; } = 0;
    
    public int ReorderLevel { get; set; } = 0;
    
    public int ReorderQuantity { get; set; } = 0;
    
    public int StoreId { get; set; }
    
    public int? PreferredSupplierId { get; set; }
    
    [StringLength(100)]
    public string? Brand { get; set; }
    
    [StringLength(100)]
    public string? Model { get; set; }
    
    [StringLength(500)]
    public string? Specifications { get; set; }
    
    [StringLength(500)]
    public string? ImagePath { get; set; }
    
    [StringLength(100)]
    public string? Barcode { get; set; }
    
    [Required]
    [StringLength(20)]
    public string Status { get; set; } = "Active"; // Active, Inactive, Discontinued
    
    public bool IsConsumable { get; set; } = true;
    
    public bool RequiresApproval { get; set; } = false;
    
    public DateTime? ExpiryDate { get; set; }
    
    [StringLength(100)]
    public string? Location { get; set; }
    
    [StringLength(1000)]
    public string? Notes { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    public virtual Store Store { get; set; } = null!;
    public virtual Supplier? PreferredSupplier { get; set; }
    public virtual ICollection<IndentItem> IndentItems { get; set; } = new List<IndentItem>();
    public virtual ICollection<PurchaseOrderItem> PurchaseOrderItems { get; set; } = new List<PurchaseOrderItem>();
    public virtual ICollection<GoodsReceiptItem> GoodsReceiptItems { get; set; } = new List<GoodsReceiptItem>();
    public virtual ICollection<IssueItem> IssueItems { get; set; } = new List<IssueItem>();
    public virtual ICollection<StockAdjustment> StockAdjustments { get; set; } = new List<StockAdjustment>();
}
