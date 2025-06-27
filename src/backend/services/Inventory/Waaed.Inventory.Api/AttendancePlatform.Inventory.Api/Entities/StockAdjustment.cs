using System.ComponentModel.DataAnnotations;

namespace AttendancePlatform.Inventory.Api.Entities;

public class StockAdjustment
{
    public int Id { get; set; }
    
    [Required]
    [StringLength(20)]
    public string AdjustmentNumber { get; set; } = string.Empty;
    
    public DateTime AdjustmentDate { get; set; } = DateTime.UtcNow;
    
    public int StoreId { get; set; }
    
    public int ItemId { get; set; }
    
    [Required]
    [StringLength(50)]
    public string AdjustmentType { get; set; } = string.Empty; // Physical Count, Damage, Loss, Expiry, Transfer In, Transfer Out, Opening Stock
    
    public int CurrentStock { get; set; }
    
    public int AdjustedStock { get; set; }
    
    public int AdjustmentQuantity { get; set; }
    
    [Required]
    [StringLength(20)]
    public string AdjustmentDirection { get; set; } = string.Empty; // Increase, Decrease
    
    [Required]
    [StringLength(100)]
    public string AdjustedBy { get; set; } = string.Empty;
    
    [StringLength(100)]
    public string? ApprovedBy { get; set; }
    
    public DateTime? ApprovedDate { get; set; }
    
    [Required]
    [StringLength(1000)]
    public string Reason { get; set; } = string.Empty;
    
    [StringLength(1000)]
    public string? Notes { get; set; }
    
    [Required]
    [StringLength(20)]
    public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected, Posted
    
    public decimal UnitCost { get; set; }
    
    public decimal TotalCostImpact { get; set; }
    
    [StringLength(100)]
    public string? ReferenceDocument { get; set; }
    
    [StringLength(50)]
    public string? BatchNumber { get; set; }
    
    public DateTime? ExpiryDate { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    public virtual Store Store { get; set; } = null!;
    public virtual Item Item { get; set; } = null!;
}
