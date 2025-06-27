using System.ComponentModel.DataAnnotations;

namespace AttendancePlatform.Inventory.Api.Entities;

public class Supplier
{
    public int Id { get; set; }
    
    [Required]
    [StringLength(20)]
    public string SupplierCode { get; set; } = string.Empty;
    
    [Required]
    [StringLength(200)]
    public string Name { get; set; } = string.Empty;
    
    [StringLength(500)]
    public string? Description { get; set; }
    
    [StringLength(500)]
    public string? Address { get; set; }
    
    [StringLength(100)]
    public string? City { get; set; }
    
    [StringLength(100)]
    public string? State { get; set; }
    
    [StringLength(20)]
    public string? PostalCode { get; set; }
    
    [StringLength(100)]
    public string? Country { get; set; }
    
    [StringLength(100)]
    public string? ContactPerson { get; set; }
    
    [Phone]
    [StringLength(15)]
    public string? Phone { get; set; }
    
    [EmailAddress]
    [StringLength(200)]
    public string? Email { get; set; }
    
    [StringLength(200)]
    public string? Website { get; set; }
    
    [StringLength(50)]
    public string? TaxNumber { get; set; }
    
    [StringLength(50)]
    public string? RegistrationNumber { get; set; }
    
    [Required]
    [StringLength(20)]
    public string Status { get; set; } = "Active"; // Active, Inactive, Blacklisted
    
    [StringLength(50)]
    public string? PaymentTerms { get; set; }
    
    public decimal? CreditLimit { get; set; }
    
    public int? PaymentDays { get; set; }
    
    [Range(1, 5)]
    public int? Rating { get; set; }
    
    [StringLength(1000)]
    public string? Notes { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    public virtual ICollection<Item> PreferredItems { get; set; } = new List<Item>();
    public virtual ICollection<PurchaseOrder> PurchaseOrders { get; set; } = new List<PurchaseOrder>();
}
