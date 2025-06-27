namespace AttendancePlatform.Polls.Api.DTOs;

public class PollDto
{
    public int Id { get; set; }
    public string Title { get; set; }
    public string Description { get; set; }
    public int CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string Status { get; set; }
    public bool IsAnonymous { get; set; }
    public bool AllowMultipleVotes { get; set; }
    public bool ShowResultsAfterVoting { get; set; }
    public bool ShowResultsAfterClose { get; set; }
    public string TargetAudience { get; set; }
    public int? TargetBatchId { get; set; }
    public int? TargetClassId { get; set; }
    public bool RequireAuthentication { get; set; }
    public int TotalVotes { get; set; }
    public DateTime? LastModified { get; set; }
    public List<PollOptionDto> Options { get; set; } = new List<PollOptionDto>();
}

public class CreatePollDto
{
    public string Title { get; set; }
    public string Description { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public bool IsAnonymous { get; set; } = true;
    public bool AllowMultipleVotes { get; set; } = false;
    public bool ShowResultsAfterVoting { get; set; } = false;
    public bool ShowResultsAfterClose { get; set; } = true;
    public string TargetAudience { get; set; } = "All";
    public int? TargetBatchId { get; set; }
    public int? TargetClassId { get; set; }
    public bool RequireAuthentication { get; set; } = true;
    public List<CreatePollOptionDto> Options { get; set; } = new List<CreatePollOptionDto>();
}

public class UpdatePollDto
{
    public string Title { get; set; }
    public string Description { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public bool ShowResultsAfterVoting { get; set; }
    public bool ShowResultsAfterClose { get; set; }
    public string TargetAudience { get; set; }
    public int? TargetBatchId { get; set; }
    public int? TargetClassId { get; set; }
}
