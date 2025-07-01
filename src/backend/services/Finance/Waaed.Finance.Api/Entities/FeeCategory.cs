using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Waaed.Finance.Api.Entities;

public class FeeCategory
{
    [Key]
    public int Id { get; set; }
    
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;
    
    [MaxLength(500)]
    public string? Description { get; set; }
    
    [Required]
    public DateTime AcademicYear { get; set; }
    
    [Required]
    public bool IsActive { get; set; } = true;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    public virtual ICollection<FeeParticular> FeeParticulars { get; set; } = new List<FeeParticular>();
    public virtual ICollection<FeeDiscount> FeeDiscounts { get; set; } = new List<FeeDiscount>();
    public virtual ICollection<FeeCategoryBatch> FeeCategoryBatches { get; set; } = new List<FeeCategoryBatch>();
    public virtual ICollection<FeeCollectionSchedule> FeeCollectionSchedules { get; set; } = new List<FeeCollectionSchedule>();
}

public class FeeParticular
{
    [Key]
    public int Id { get; set; }
    
    [Required]
    public int FeeCategoryId { get; set; }
    
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;
    
    [MaxLength(500)]
    public string? Description { get; set; }
    
    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal Amount { get; set; }
    
    [Required]
    [MaxLength(20)]
    public string ApplicabilityType { get; set; } = "AllStudents"; // AllStudents, StudentCategory, IndividualStudent
    
    [MaxLength(50)]
    public string? StudentCategory { get; set; }
    
    public int? SpecificStudentId { get; set; }
    
    public bool IsTaxable { get; set; } = false;
    
    public int? TaxTypeId { get; set; }
    
    [Required]
    public bool IsActive { get; set; } = true;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    [ForeignKey("FeeCategoryId")]
    public virtual FeeCategory FeeCategory { get; set; } = null!;
    
    [ForeignKey("TaxTypeId")]
    public virtual TaxType? TaxType { get; set; }
}

public class FeeDiscount
{
    [Key]
    public int Id { get; set; }
    
    [Required]
    public int FeeCategoryId { get; set; }
    
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;
    
    [MaxLength(500)]
    public string? Description { get; set; }
    
    [Required]
    [MaxLength(20)]
    public string DiscountType { get; set; } = "Percentage"; // Percentage, FixedAmount
    
    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal DiscountValue { get; set; }
    
    [Required]
    [MaxLength(20)]
    public string ApplicabilityScope { get; set; } = "BatchWide"; // BatchWide, StudentCategory, IndividualStudent
    
    [MaxLength(50)]
    public string? StudentCategory { get; set; }
    
    public int? SpecificStudentId { get; set; }
    
    [MaxLength(50)]
    public string? BatchName { get; set; }
    
    public int Priority { get; set; } = 1; // For handling multiple discounts
    
    [Required]
    public bool IsActive { get; set; } = true;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    [ForeignKey("FeeCategoryId")]
    public virtual FeeCategory FeeCategory { get; set; } = null!;
}

public class TaxType
{
    [Key]
    public int Id { get; set; }
    
    [Required]
    [MaxLength(50)]
    public string Name { get; set; } = string.Empty; // GST, VAT, Service Tax
    
    [MaxLength(200)]
    public string? Description { get; set; }
    
    [Required]
    [Column(TypeName = "decimal(5,2)")]
    public decimal TaxRate { get; set; } // Percentage rate
    
    [Required]
    public bool IsActive { get; set; } = true;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    public virtual ICollection<FeeParticular> FeeParticulars { get; set; } = new List<FeeParticular>();
}

public class FeeCategoryBatch
{
    [Key]
    public int Id { get; set; }
    
    [Required]
    public int FeeCategoryId { get; set; }
    
    [Required]
    [MaxLength(50)]
    public string BatchName { get; set; } = string.Empty;
    
    [MaxLength(50)]
    public string? Grade { get; set; }
    
    [MaxLength(50)]
    public string? Section { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    [ForeignKey("FeeCategoryId")]
    public virtual FeeCategory FeeCategory { get; set; } = null!;
}
