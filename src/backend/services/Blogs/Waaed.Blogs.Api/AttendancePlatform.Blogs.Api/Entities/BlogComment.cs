using System.ComponentModel.DataAnnotations;

namespace AttendancePlatform.Blogs.Api.Entities;

public class BlogComment
{
    public int Id { get; set; }
    
    public int PostId { get; set; }
    
    public int CommenterId { get; set; }
    
    [Required]
    [MaxLength(1000)]
    public string Content { get; set; }
    
    public DateTime CreatedAt { get; set; }
    
    public DateTime? UpdatedAt { get; set; }
    
    public bool IsApproved { get; set; } = true;
    
    public bool IsDeleted { get; set; } = false;
    
    public int? ParentCommentId { get; set; }
    
    [MaxLength(100)]
    public string CommenterName { get; set; }
    
    [MaxLength(100)]
    public string CommenterRole { get; set; }
    
    public int LikeCount { get; set; } = 0;
    
    public BlogPost Post { get; set; }
    public BlogComment ParentComment { get; set; }
    public ICollection<BlogComment> Replies { get; set; } = new List<BlogComment>();
}
