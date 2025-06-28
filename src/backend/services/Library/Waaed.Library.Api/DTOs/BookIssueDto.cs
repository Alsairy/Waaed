namespace Waaed.Library.Api.DTOs;

public class BookIssueDto
{
    public int Id { get; set; }
    public int BookId { get; set; }
    public string BookTitle { get; set; } = string.Empty;
    public string BookAuthor { get; set; } = string.Empty;
    public string BookISBN { get; set; } = string.Empty;
    public int MemberId { get; set; }
    public string MemberName { get; set; } = string.Empty;
    public string MembershipId { get; set; } = string.Empty;
    public DateTime IssueDate { get; set; }
    public DateTime DueDate { get; set; }
    public DateTime? ReturnDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public int? IssuedById { get; set; }
    public int? ReturnedById { get; set; }
    public string? IssueNotes { get; set; }
    public string? ReturnNotes { get; set; }
    public decimal? FineAmount { get; set; }
    public bool IsRenewed { get; set; }
    public int RenewalCount { get; set; }
    public int DaysOverdue { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateBookIssueDto
{
    public int BookId { get; set; }
    public int MemberId { get; set; }
    public DateTime? DueDate { get; set; }
    public int? IssuedById { get; set; }
    public string? IssueNotes { get; set; }
}

public class ReturnBookDto
{
    public int? ReturnedById { get; set; }
    public string? ReturnNotes { get; set; }
    public decimal? FineAmount { get; set; }
}

public class RenewBookDto
{
    public DateTime NewDueDate { get; set; }
    public string? RenewalNotes { get; set; }
}

public class BookIssueSearchDto
{
    public int? BookId { get; set; }
    public int? MemberId { get; set; }
    public string? Status { get; set; }
    public DateTime? IssueDateFrom { get; set; }
    public DateTime? IssueDateTo { get; set; }
    public DateTime? DueDateFrom { get; set; }
    public DateTime? DueDateTo { get; set; }
    public bool? OverdueOnly { get; set; }
}

public class BookIssueSummaryDto
{
    public int TotalIssues { get; set; }
    public int ActiveIssues { get; set; }
    public int ReturnedIssues { get; set; }
    public int OverdueIssues { get; set; }
    public int RenewedIssues { get; set; }
    public decimal TotalFines { get; set; }
    public Dictionary<string, int> IssuesByStatus { get; set; } = new();
    public Dictionary<string, int> IssuesByMemberType { get; set; } = new();
}
