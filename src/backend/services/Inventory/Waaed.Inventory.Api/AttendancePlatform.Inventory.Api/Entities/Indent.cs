using System.ComponentModel.DataAnnotations;

namespace AttendancePlatform.Inventory.Api.Entities;

public class Indent
{
    public int Id { get; set; }
    
    [Required]
    [StringLength(20)]
    public string IndentNumber { get; set; } = string.Empty;
    
    public DateTime IndentDate { get; set; } = DateTime.UtcNow;
    
    public DateTime RequiredDate { get; set; }
    
    [Required]
    [StringLength(100)]
    public string RequestedBy { get; set; } = string.Empty;
    
    [StringLength(100)]
    public string? Department { get; set; }
    
    public int StoreId { get; set; }
    
    [Required]
    [StringLength(20)]
    public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected, Partially Fulfilled, Fulfilled, Cancelled
    
    [StringLength(100)]
    public string? ApprovedBy { get; set; }
    
    public DateTime? ApprovedDate { get; set; }
    
    [StringLength(1000)]
    public string? ApprovalNotes { get; set; }
    
    [StringLength(50)]
    public string? Priority { get; set; } = "Normal"; // Low, Normal, High, Urgent
    
    [StringLength(1000)]
    public string? Purpose { get; set; }
    
    [StringLength(1000)]
    public string? Notes { get; set; }
    
    public decimal TotalEstimatedCost { get; set; } = 0;
    
    public bool IsRecurring { get; set; } = false;
    
    [StringLength(50)]
    public string? RecurrencePattern { get; set; }
    
    public DateTime? NextRecurrenceDate { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    public virtual Store Store { get; set; } = null!;
    public virtual ICollection<IndentItem> IndentItems { get; set; } = new List<IndentItem>();
}

public class IndentItem
{
    public int Id { get; set; }
    
    public int IndentId { get; set; }
    
    public int ItemId { get; set; }
    
    public int RequestedQuantity { get; set; }
    
    public int? ApprovedQuantity { get; set; }
    
    public int? IssuedQuantity { get; set; } = 0;
    
    public decimal EstimatedUnitCost { get; set; }
    
    public decimal EstimatedTotalCost { get; set; }
    
    [StringLength(1000)]
    public string? Specifications { get; set; }
    
    [StringLength(1000)]
    public string? Notes { get; set; }
    
    [Required]
    [StringLength(20)]
    public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected, Issued
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    public virtual Indent Indent { get; set; } = null!;
    public virtual Item Item { get; set; } = null!;
}
