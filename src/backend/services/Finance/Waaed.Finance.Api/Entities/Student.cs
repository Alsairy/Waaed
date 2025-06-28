using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Waaed.Finance.Api.Entities;

public class Student
{
    [Key]
    public int Id { get; set; }
    
    [Required]
    [MaxLength(50)]
    public string StudentId { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(100)]
    public string FirstName { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(100)]
    public string LastName { get; set; } = string.Empty;
    
    [MaxLength(200)]
    public string FullName => $"{FirstName} {LastName}";
    
    [Required]
    [MaxLength(50)]
    public string Class { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(50)]
    public string Section { get; set; } = string.Empty;
    
    [MaxLength(50)]
    public string? RollNumber { get; set; }
    
    [Required]
    public DateTime AdmissionDate { get; set; }
    
    [Required]
    public bool IsActive { get; set; } = true;
    
    [MaxLength(100)]
    public string? ParentName { get; set; }
    
    [MaxLength(15)]
    public string? ParentPhone { get; set; }
    
    [MaxLength(200)]
    public string? ParentEmail { get; set; }
    
    [MaxLength(500)]
    public string? Address { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    public virtual ICollection<FeeCollection> FeeCollections { get; set; } = new List<FeeCollection>();
}
