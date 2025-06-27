using System.ComponentModel.DataAnnotations;

namespace AttendancePlatform.Inventory.Api.Entities;

public class Store
{
    public int Id { get; set; }
    
    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;
    
    [Required]
    [StringLength(20)]
    public string Code { get; set; } = string.Empty;
    
    [StringLength(500)]
    public string? Description { get; set; }
    
    [StringLength(500)]
    public string? Address { get; set; }
    
    [StringLength(100)]
    public string? ContactPerson { get; set; }
    
    [Phone]
    [StringLength(15)]
    public string? Phone { get; set; }
    
    [EmailAddress]
    [StringLength(200)]
    public string? Email { get; set; }
    
    [Required]
    [StringLength(20)]
    public string Status { get; set; } = "Active"; // Active, Inactive
    
    [StringLength(50)]
    public string? StoreType { get; set; } // Main, Branch, Warehouse
    
    public int? ParentStoreId { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    public virtual Store? ParentStore { get; set; }
    public virtual ICollection<Store> ChildStores { get; set; } = new List<Store>();
    public virtual ICollection<Item> Items { get; set; } = new List<Item>();
    public virtual ICollection<Indent> Indents { get; set; } = new List<Indent>();
    public virtual ICollection<Issue> Issues { get; set; } = new List<Issue>();
    public virtual ICollection<StockAdjustment> StockAdjustments { get; set; } = new List<StockAdjustment>();
}
