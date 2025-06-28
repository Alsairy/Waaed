namespace Waaed.LMS.Api.Entities;

public class Announcement
{
    public Guid Id { get; set; }
    public Guid CourseId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public bool IsPublished { get; set; }
    public DateTime? PublishAt { get; set; }
    public DateTime? DelayedPostAt { get; set; }
    public bool AllowComments { get; set; }
    public bool RequireInitialPost { get; set; }
    public string AttachmentUrls { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public string CreatedBy { get; set; } = string.Empty;

    public virtual Course Course { get; set; } = null!;
    public virtual ICollection<AnnouncementComment> Comments { get; set; } = new List<AnnouncementComment>();
}

public class AnnouncementComment
{
    public Guid Id { get; set; }
    public Guid AnnouncementId { get; set; }
    public string AuthorId { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }

    public virtual Announcement Announcement { get; set; } = null!;
}
