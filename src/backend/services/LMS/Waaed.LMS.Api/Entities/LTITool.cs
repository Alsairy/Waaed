namespace Waaed.LMS.Api.Entities;

public class LTITool
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string LaunchUrl { get; set; } = string.Empty;
    public string ConsumerKey { get; set; } = string.Empty;
    public string SharedSecret { get; set; } = string.Empty;
    public LTIVersion Version { get; set; }
    public string ClientId { get; set; } = string.Empty;
    public string DeploymentId { get; set; } = string.Empty;
    public string KeysetUrl { get; set; } = string.Empty;
    public string AuthTokenUrl { get; set; } = string.Empty;
    public string AuthLoginUrl { get; set; } = string.Empty;
    public string TargetLinkUri { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public string TenantId { get; set; } = string.Empty;
    public LTIPlacement Placements { get; set; }
    public string CustomFields { get; set; } = string.Empty; // JSON
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public string CreatedBy { get; set; } = string.Empty;

    public virtual ICollection<LTILaunch> Launches { get; set; } = new List<LTILaunch>();
}

public class LTILaunch
{
    public Guid Id { get; set; }
    public Guid LTIToolId { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string CourseId { get; set; } = string.Empty;
    public string ResourceLinkId { get; set; } = string.Empty;
    public string LaunchUrl { get; set; } = string.Empty;
    public string ReturnUrl { get; set; } = string.Empty;
    public LaunchStatus Status { get; set; }
    public DateTime LaunchedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public string ResultSourcedId { get; set; } = string.Empty;
    public decimal? Score { get; set; }

    public virtual LTITool LTITool { get; set; } = null!;
}

public enum LTIVersion
{
    LTI11,
    LTI13
}

[Flags]
public enum LTIPlacement
{
    None = 0,
    CourseNavigation = 1,
    AccountNavigation = 2,
    UserNavigation = 4,
    AssignmentSelection = 8,
    LinkSelection = 16,
    PostGrades = 32,
    ToolConfiguration = 64
}

public enum LaunchStatus
{
    Launched,
    Completed,
    Failed
}
