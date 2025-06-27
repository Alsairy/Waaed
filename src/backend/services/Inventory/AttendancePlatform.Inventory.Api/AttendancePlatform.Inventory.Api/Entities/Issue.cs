using System.ComponentModel.DataAnnotations;

namespace AttendancePlatform.Inventory.Api.Entities;

public class Issue
{
    public int Id { get; set; }
    
    [Required]
    [StringLength(20)]
    public string IssueNumber { get; set; } = string.Empty;
    
    public DateTime IssueDate { get; set; } = DateTime.UtcNow;
    
    public int StoreId { get; set; }
    
    [Required]
    [StringLength(100)]
    public string IssuedTo { get; set; } = string.Empty;
    
    [StringLength(100)]
    public string? Department { get; set; }
    
    [StringLength(100)]
    public string? EmployeeId { get; set; }
    
    [Required]
    [StringLength(100)]
    public string IssuedBy { get; set; } = string.Empty;
    
    [StringLength(100)]
    public string? ApprovedBy { get; set; }
    
    public DateTime? ApprovedDate { get; set; }
    
    [Required]
    [StringLength(20)]
    public string IssueType { get; set; } = "Direct"; // Direct, Against Indent, Transfer, Return
    
    public int? IndentId { get; set; }
    
    public int? TransferToStoreId { get; set; }
    
    [Required]
    [StringLength(20)]
    public string Status { get; set; } = "Draft"; // Draft, Issued, Received, Cancelled
    
    [StringLength(1000)]
    public string? Purpose { get; set; }
    
    [StringLength(1000)]
    public string? Notes { get; set; }
    
    public decimal TotalValue { get; set; } = 0;
    
    public bool RequiresReturn { get; set; } = false;
    
    public DateTime? ExpectedReturnDate { get; set; }
    
    public DateTime? ActualReturnDate { get; set; }
    
    [StringLength(1000)]
    public string? ReturnNotes { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    public virtual Store Store { get; set; } = null!;
    public virtual Indent? Indent { get; set; }
    public virtual Store? TransferToStore { get; set; }
    public virtual ICollection<IssueItem> IssueItems { get; set; } = new List<IssueItem>();
}

public class IssueItem
{
    public int Id { get; set; }
    
    public int IssueId { get; set; }
    
    public int ItemId { get; set; }
    
    public int? IndentItemId { get; set; }
    
    public int IssuedQuantity { get; set; }
    
    public int? ReturnedQuantity { get; set; } = 0;
    
    public decimal UnitCost { get; set; }
    
    public decimal TotalCost { get; set; }
    
    [StringLength(50)]
    public string? BatchNumber { get; set; }
    
    [StringLength(100)]
    public string? SerialNumbers { get; set; }
    
    [StringLength(1000)]
    public string? Notes { get; set; }
    
    [Required]
    [StringLength(20)]
    public string Status { get; set; } = "Issued"; // Issued, Returned, Partial Return
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    public virtual Issue Issue { get; set; } = null!;
    public virtual Item Item { get; set; } = null!;
    public virtual IndentItem? IndentItem { get; set; }
}
