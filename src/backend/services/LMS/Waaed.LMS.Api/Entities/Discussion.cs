namespace Waaed.LMS.Api.Entities;

public class Discussion
{
    public Guid Id { get; set; }
    public Guid CourseId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DiscussionType Type { get; set; }
    public bool IsGraded { get; set; }
    public int Points { get; set; }
    public DateTime? DueDate { get; set; }
    public DateTime? AvailableFrom { get; set; }
    public DateTime? AvailableUntil { get; set; }
    public bool RequireInitialPost { get; set; }
    public bool AllowRating { get; set; }
    public bool SortByRating { get; set; }
    public bool OnlyGradersCanRate { get; set; }
    public bool IsAnnouncement { get; set; }
    public bool IsPinned { get; set; }
    public bool IsLocked { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public string CreatedBy { get; set; } = string.Empty;

    public virtual Course Course { get; set; } = null!;
    public virtual ICollection<DiscussionPost> Posts { get; set; } = new List<DiscussionPost>();
}

public class DiscussionPost
{
    public Guid Id { get; set; }
    public Guid DiscussionId { get; set; }
    public Guid? ParentPostId { get; set; }
    public string AuthorId { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string AttachmentUrls { get; set; } = string.Empty;
    public int Rating { get; set; }
    public int RatingCount { get; set; }
    public bool IsDeleted { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public virtual Discussion Discussion { get; set; } = null!;
    public virtual DiscussionPost? ParentPost { get; set; }
    public virtual ICollection<DiscussionPost> Replies { get; set; } = new List<DiscussionPost>();
    public virtual ICollection<PostRating> Ratings { get; set; } = new List<PostRating>();
}

public class PostRating
{
    public Guid Id { get; set; }
    public Guid PostId { get; set; }
    public string UserId { get; set; } = string.Empty;
    public int Rating { get; set; }
    public DateTime CreatedAt { get; set; }

    public virtual DiscussionPost Post { get; set; } = null!;
}

public enum DiscussionType
{
    Threaded,
    SideComment,
    NotThreaded
}
