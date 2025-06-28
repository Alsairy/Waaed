namespace Waaed.LMS.Api.Entities;

public class CourseModule
{
    public Guid Id { get; set; }
    public Guid CourseId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int Position { get; set; }
    public bool IsPublished { get; set; }
    public DateTime? PublishAt { get; set; }
    public DateTime? UnlockAt { get; set; }
    public DateTime? LockAt { get; set; }
    public string Prerequisites { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public virtual Course Course { get; set; } = null!;
    public virtual ICollection<ModuleItem> Items { get; set; } = new List<ModuleItem>();
}

public class ModuleItem
{
    public Guid Id { get; set; }
    public Guid ModuleId { get; set; }
    public string Title { get; set; } = string.Empty;
    public ModuleItemType Type { get; set; }
    public string ContentId { get; set; } = string.Empty;
    public int Position { get; set; }
    public bool IsRequired { get; set; }
    public int Points { get; set; }
    public DateTime CreatedAt { get; set; }

    public virtual CourseModule Module { get; set; } = null!;
}

public enum ModuleItemType
{
    Assignment,
    Quiz,
    Discussion,
    Page,
    File,
    ExternalUrl,
    ExternalTool,
    SCORM
}
