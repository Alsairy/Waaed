using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Waaed.Finance.Api.Entities;

public class Budget
{
    [Key]
    public int Id { get; set; }
    
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;
    
    [MaxLength(500)]
    public string? Description { get; set; }
    
    [Required]
    [MaxLength(50)]
    public string Category { get; set; } = string.Empty;
    
    [MaxLength(50)]
    public string? Department { get; set; }
    
    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal AllocatedAmount { get; set; }
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal SpentAmount { get; set; } = 0;
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal RemainingAmount => AllocatedAmount - SpentAmount;
    
    [Required]
    public DateTime StartDate { get; set; }
    
    [Required]
    public DateTime EndDate { get; set; }
    
    [Required]
    public DateTime AcademicYear { get; set; }
    
    [Required]
    [MaxLength(20)]
    public string Status { get; set; } = "Active"; // Active, Completed, Suspended, Cancelled
    
    [MaxLength(100)]
    public string? CreatedBy { get; set; }
    
    [MaxLength(100)]
    public string? ApprovedBy { get; set; }
    
    public DateTime? ApprovalDate { get; set; }
    
    [MaxLength(500)]
    public string? Remarks { get; set; }
    
    [Required]
    public bool IsActive { get; set; } = true;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    public virtual ICollection<Expense> Expenses { get; set; } = new List<Expense>();
}
