namespace Waaed.Library.Api.DTOs;

public class BookReservationDto
{
    public int Id { get; set; }
    public int BookId { get; set; }
    public string BookTitle { get; set; } = string.Empty;
    public string BookAuthor { get; set; } = string.Empty;
    public string BookISBN { get; set; } = string.Empty;
    public int MemberId { get; set; }
    public string MemberName { get; set; } = string.Empty;
    public string MembershipId { get; set; } = string.Empty;
    public DateTime ReservationDate { get; set; }
    public DateTime ExpiryDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public DateTime? NotifiedDate { get; set; }
    public int DaysRemaining { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateBookReservationDto
{
    public int BookId { get; set; }
    public int MemberId { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public string? Notes { get; set; }
}

public class UpdateBookReservationDto
{
    public DateTime ExpiryDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? Notes { get; set; }
}

public class BookReservationSummaryDto
{
    public int TotalReservations { get; set; }
    public int ActiveReservations { get; set; }
    public int ExpiredReservations { get; set; }
    public int FulfilledReservations { get; set; }
    public int CancelledReservations { get; set; }
    public Dictionary<string, int> ReservationsByStatus { get; set; } = new();
    public Dictionary<string, int> ReservationsByMemberType { get; set; } = new();
}
