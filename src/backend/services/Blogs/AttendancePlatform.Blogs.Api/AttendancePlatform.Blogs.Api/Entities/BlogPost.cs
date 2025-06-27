using System.ComponentModel.DataAnnotations;

namespace AttendancePlatform.Blogs.Api.Entities;

public class BlogPost
{
    public int Id { get; set; }
    
    [Required]
    [MaxLength(200)]
    public string Title { get; set; }
    
    [Required]
    public string Content { get; set; }
    
    public int AuthorId { get; set; }
    
    public int? CategoryId { get; set; }
    
    public DateTime CreatedAt { get; set; }
    
    public DateTime? UpdatedAt { get; set; }
    
    [Required]
    [MaxLength(20)]
    public string Status { get; set; } = "Draft"; // Draft, Published, Archived
    
    [Required]
    [MaxLength(20)]
    public string Visibility { get; set; } = "All"; // All, Staff, Students, Specific
    
    public int? TargetBatchId { get; set; }
    
    public int? TargetClassId { get; set; }
    
    [MaxLength(500)]
    public string Summary { get; set; }
    
    [MaxLength(200)]
    public string FeaturedImage { get; set; }
    
    public bool AllowComments { get; set; } = true;
    
    public int ViewCount { get; set; } = 0;
    
    public int LikeCount { get; set; } = 0;
    
    public bool IsFeatured { get; set; } = false;
    
    [MaxLength(500)]
    public string Tags { get; set; }
    
    public DateTime? PublishedAt { get; set; }
    
    public BlogCategory Category { get; set; }
    public ICollection<BlogComment> Comments { get; set; } = new List<BlogComment>();
}
