namespace AttendancePlatform.Blogs.Api.DTOs;

public class BlogPostDto
{
    public int Id { get; set; }
    public string Title { get; set; }
    public string Content { get; set; }
    public int AuthorId { get; set; }
    public int? CategoryId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string Status { get; set; }
    public string Visibility { get; set; }
    public int? TargetBatchId { get; set; }
    public int? TargetClassId { get; set; }
    public string Summary { get; set; }
    public string FeaturedImage { get; set; }
    public bool AllowComments { get; set; }
    public int ViewCount { get; set; }
    public int LikeCount { get; set; }
    public bool IsFeatured { get; set; }
    public string Tags { get; set; }
    public DateTime? PublishedAt { get; set; }
    public BlogCategoryDto Category { get; set; }
    public List<BlogCommentDto> Comments { get; set; } = new List<BlogCommentDto>();
}

public class CreateBlogPostDto
{
    public string Title { get; set; }
    public string Content { get; set; }
    public int? CategoryId { get; set; }
    public string Visibility { get; set; } = "All";
    public int? TargetBatchId { get; set; }
    public int? TargetClassId { get; set; }
    public string Summary { get; set; }
    public string FeaturedImage { get; set; }
    public bool AllowComments { get; set; } = true;
    public bool IsFeatured { get; set; } = false;
    public string Tags { get; set; }
}

public class UpdateBlogPostDto
{
    public string Title { get; set; }
    public string Content { get; set; }
    public int? CategoryId { get; set; }
    public string Visibility { get; set; }
    public int? TargetBatchId { get; set; }
    public int? TargetClassId { get; set; }
    public string Summary { get; set; }
    public string FeaturedImage { get; set; }
    public bool AllowComments { get; set; }
    public bool IsFeatured { get; set; }
    public string Tags { get; set; }
}
