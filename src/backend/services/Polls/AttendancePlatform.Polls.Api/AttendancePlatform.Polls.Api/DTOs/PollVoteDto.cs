namespace AttendancePlatform.Polls.Api.DTOs;

public class PollVoteDto
{
    public int Id { get; set; }
    public int PollId { get; set; }
    public int PollOptionId { get; set; }
    public int? UserId { get; set; }
    public string UserRole { get; set; }
    public DateTime VotedAt { get; set; }
    public bool IsAnonymous { get; set; }
}

public class CreateVoteDto
{
    public int PollId { get; set; }
    public int PollOptionId { get; set; }
    public string UserRole { get; set; }
}

public class PollResultDto
{
    public int PollId { get; set; }
    public string PollTitle { get; set; }
    public int TotalVotes { get; set; }
    public List<OptionResultDto> Results { get; set; } = new List<OptionResultDto>();
}

public class OptionResultDto
{
    public int OptionId { get; set; }
    public string OptionText { get; set; }
    public int VoteCount { get; set; }
    public double Percentage { get; set; }
}
