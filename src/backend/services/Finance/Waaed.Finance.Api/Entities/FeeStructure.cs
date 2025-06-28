using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Waaed.Finance.Api.Entities;

public class FeeStructure
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
    public string Class { get; set; } = string.Empty;
    
    [MaxLength(50)]
    public string? Section { get; set; }
    
    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal TuitionFee { get; set; }
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal? AdmissionFee { get; set; }
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal? ExaminationFee { get; set; }
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal? LibraryFee { get; set; }
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal? LaboratoryFee { get; set; }
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal? TransportFee { get; set; }
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal? HostelFee { get; set; }
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal? MiscellaneousFee { get; set; }
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal TotalFee { get; set; }
    
    [Required]
    public DateTime AcademicYear { get; set; }
    
    [Required]
    [MaxLength(20)]
    public string PaymentFrequency { get; set; } = "Monthly"; // Monthly, Quarterly, Annually
    
    [Required]
    public bool IsActive { get; set; } = true;
    
    public DateTime? EffectiveFrom { get; set; }
    public DateTime? EffectiveTo { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    public virtual ICollection<FeeCollection> FeeCollections { get; set; } = new List<FeeCollection>();
}
