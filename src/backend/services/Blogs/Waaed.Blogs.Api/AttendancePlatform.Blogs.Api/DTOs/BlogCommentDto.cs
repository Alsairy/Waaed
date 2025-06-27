namespace AttendancePlatform.Blogs.Api.DTOs;

public class BlogCommentDto
{
    public int Id { get; set; }
    public int PostId { get; set; }
    public int CommenterId { get; set; }
    public string Content { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public bool IsApproved { get; set; }
    public bool IsDeleted { get; set; }
    public int? ParentCommentId { get; set; }
    public string CommenterName { get; set; }
    public string CommenterRole { get; set; }
    public int LikeCount { get; set; }
    public List<BlogCommentDto> Replies { get; set; } = new List<BlogCommentDto>();
}

public class CreateBlogCommentDto
{
    public int PostId { get; set; }
    public string Content { get; set; }
    public int? ParentCommentId { get; set; }
}

public class UpdateBlogCommentDto
{
    public string Content { get; set; }
}
