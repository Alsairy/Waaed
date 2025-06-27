namespace AttendancePlatform.Polls.Api.DTOs;

public class PollOptionDto
{
    public int Id { get; set; }
    public int PollId { get; set; }
    public string OptionText { get; set; }
    public int DisplayOrder { get; set; }
    public int VoteCount { get; set; }
    public DateTime CreatedAt { get; set; }
    public bool IsActive { get; set; }
    public string Description { get; set; }
}

public class CreatePollOptionDto
{
    public string OptionText { get; set; }
    public int DisplayOrder { get; set; }
    public string Description { get; set; }
}

public class UpdatePollOptionDto
{
    public string OptionText { get; set; }
    public int DisplayOrder { get; set; }
    public string Description { get; set; }
    public bool IsActive { get; set; }
}
