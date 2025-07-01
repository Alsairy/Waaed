using Waaed.Shared.Domain.Entities;

namespace Waaed.Blogs.Api.Entities;

public class BlogPost : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string Summary { get; set; } = string.Empty;
    public string Status { get; set; } = "Draft"; // Draft, Published
    public bool IsPublished { get; set; }
    public DateTime? PublishedAt { get; set; }
    public Guid AuthorId { get; set; }
    public Guid? CategoryId { get; set; }
    public string Tags { get; set; } = string.Empty;
    public int ViewCount { get; set; }
    
    public virtual BlogCategory? Category { get; set; }
    public virtual ICollection<BlogComment> Comments { get; set; } = new List<BlogComment>();
}

public class BlogCategory : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Color { get; set; } = "#000000";
    public bool IsActive { get; set; } = true;
    
    public virtual ICollection<BlogPost> BlogPosts { get; set; } = new List<BlogPost>();
}

public class BlogComment : BaseEntity
{
    public string Content { get; set; } = string.Empty;
    public Guid BlogPostId { get; set; }
    public Guid AuthorId { get; set; }
    public Guid? ParentCommentId { get; set; }
    public bool IsApproved { get; set; } = true;
    
    public virtual BlogPost BlogPost { get; set; } = null!;
    public virtual BlogComment? ParentComment { get; set; }
    public virtual ICollection<BlogComment> Replies { get; set; } = new List<BlogComment>();
}
