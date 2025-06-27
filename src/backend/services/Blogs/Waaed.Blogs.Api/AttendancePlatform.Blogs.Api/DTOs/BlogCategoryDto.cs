namespace AttendancePlatform.Blogs.Api.DTOs;

public class BlogCategoryDto
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }
    public string Color { get; set; }
    public string Icon { get; set; }
    public bool IsActive { get; set; }
    public int DisplayOrder { get; set; }
    public DateTime CreatedAt { get; set; }
    public int CreatedBy { get; set; }
    public int PostCount { get; set; }
}

public class CreateBlogCategoryDto
{
    public string Name { get; set; }
    public string Description { get; set; }
    public string Color { get; set; }
    public string Icon { get; set; }
    public int DisplayOrder { get; set; } = 0;
}

public class UpdateBlogCategoryDto
{
    public string Name { get; set; }
    public string Description { get; set; }
    public string Color { get; set; }
    public string Icon { get; set; }
    public bool IsActive { get; set; }
    public int DisplayOrder { get; set; }
}
