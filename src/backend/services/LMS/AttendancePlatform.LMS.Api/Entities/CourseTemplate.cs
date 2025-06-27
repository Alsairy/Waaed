namespace AttendancePlatform.LMS.Api.Entities;

public class CourseTemplate
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public TemplateType Type { get; set; }
    public bool IsPublic { get; set; }
    public string TenantId { get; set; } = string.Empty;
    public string CourseStructure { get; set; } = string.Empty; // JSON
    public string DefaultSettings { get; set; } = string.Empty; // JSON
    public string Tags { get; set; } = string.Empty;
    public int UsageCount { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public string CreatedBy { get; set; } = string.Empty;

    public virtual ICollection<Course> Courses { get; set; } = new List<Course>();
    public virtual ICollection<TemplateModule> Modules { get; set; } = new List<TemplateModule>();
}

public class TemplateModule
{
    public Guid Id { get; set; }
    public Guid CourseTemplateId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int Position { get; set; }
    public string Content { get; set; } = string.Empty; // JSON
    public DateTime CreatedAt { get; set; }

    public virtual CourseTemplate CourseTemplate { get; set; } = null!;
    public virtual ICollection<TemplateItem> Items { get; set; } = new List<TemplateItem>();
}

public class TemplateItem
{
    public Guid Id { get; set; }
    public Guid TemplateModuleId { get; set; }
    public string Title { get; set; } = string.Empty;
    public TemplateItemType Type { get; set; }
    public string Content { get; set; } = string.Empty; // JSON
    public int Position { get; set; }
    public bool IsRequired { get; set; }
    public int Points { get; set; }
    public DateTime CreatedAt { get; set; }

    public virtual TemplateModule TemplateModule { get; set; } = null!;
}

public enum TemplateType
{
    Course,
    Module,
    Assignment,
    Quiz
}

public enum TemplateItemType
{
    Assignment,
    Quiz,
    Discussion,
    Page,
    File,
    ExternalUrl,
    ExternalTool
}
