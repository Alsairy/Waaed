namespace Waaed.LMS.Api.DTOs;

public class DiscussionDto
{
    public Guid Id { get; set; }
    public Guid CourseId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
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
    public int PostCount { get; set; }
    public int ParticipantCount { get; set; }
}

public class DiscussionPostDto
{
    public Guid Id { get; set; }
    public Guid DiscussionId { get; set; }
    public Guid? ParentPostId { get; set; }
    public string AuthorId { get; set; } = string.Empty;
    public string AuthorName { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string AttachmentUrls { get; set; } = string.Empty;
    public int Rating { get; set; }
    public int RatingCount { get; set; }
    public bool IsDeleted { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public int ReplyCount { get; set; }
}

public class CreateDiscussionDto
{
    public Guid CourseId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public bool IsGraded { get; set; }
    public int Points { get; set; }
    public DateTime? DueDate { get; set; }
    public DateTime? AvailableFrom { get; set; }
    public DateTime? AvailableUntil { get; set; }
    public bool RequireInitialPost { get; set; }
    public bool AllowRating { get; set; }
    public bool SortByRating { get; set; }
    public bool OnlyGradersCanRate { get; set; }
}

public class CreateDiscussionPostDto
{
    public Guid DiscussionId { get; set; }
    public Guid? ParentPostId { get; set; }
    public string Content { get; set; } = string.Empty;
    public string AttachmentUrls { get; set; } = string.Empty;
}
