using System.ComponentModel.DataAnnotations;

namespace AttendancePlatform.Blogs.Api.Entities;

public class BlogCategory
{
    public int Id { get; set; }
    
    [Required]
    [MaxLength(100)]
    public string Name { get; set; }
    
    [MaxLength(500)]
    public string Description { get; set; }
    
    [MaxLength(50)]
    public string Color { get; set; }
    
    [MaxLength(50)]
    public string Icon { get; set; }
    
    public bool IsActive { get; set; } = true;
    
    public int DisplayOrder { get; set; } = 0;
    
    public DateTime CreatedAt { get; set; }
    
    public int CreatedBy { get; set; }
    
    public int PostCount { get; set; } = 0;
    
    public ICollection<BlogPost> Posts { get; set; } = new List<BlogPost>();
}
