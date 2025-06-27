using System.ComponentModel.DataAnnotations;

namespace Waaed.Library.Api.Entities;

public class Book
{
    public int Id { get; set; }
    
    [Required]
    [MaxLength(13)]
    public string ISBN { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(200)]
    public string Author { get; set; } = string.Empty;
    
    [MaxLength(100)]
    public string? Publisher { get; set; }
    
    public DateTime? PublicationDate { get; set; }
    
    [MaxLength(50)]
    public string? Edition { get; set; }
    
    [MaxLength(100)]
    public string? Language { get; set; }
    
    public int? Pages { get; set; }
    
    [MaxLength(1000)]
    public string? Description { get; set; }
    
    [Required]
    [MaxLength(100)]
    public string Category { get; set; } = string.Empty;
    
    [MaxLength(100)]
    public string? SubCategory { get; set; }
    
    [MaxLength(500)]
    public string? Tags { get; set; }
    
    public decimal? Price { get; set; }
    
    [Required]
    [MaxLength(20)]
    public string Status { get; set; } = "Available";
    
    [Required]
    [MaxLength(50)]
    public string Location { get; set; } = string.Empty;
    
    [MaxLength(20)]
    public string? ShelfNumber { get; set; }
    
    public int TotalCopies { get; set; } = 1;
    
    public int AvailableCopies { get; set; } = 1;
    
    public int IssuedCopies { get; set; } = 0;
    
    public int ReservedCopies { get; set; } = 0;
    
    [MaxLength(500)]
    public string? CoverImagePath { get; set; }
    
    [MaxLength(500)]
    public string? FilePath { get; set; }
    
    public bool IsDigital { get; set; } = false;
    
    public bool IsReference { get; set; } = false;
    
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    
    public ICollection<BookIssue> BookIssues { get; set; } = new List<BookIssue>();
    public ICollection<BookReservation> BookReservations { get; set; } = new List<BookReservation>();
    public ICollection<BookReview> BookReviews { get; set; } = new List<BookReview>();
}

public class Member
{
    public int Id { get; set; }
    
    [Required]
    [MaxLength(20)]
    public string MembershipId { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(100)]
    public string FirstName { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(100)]
    public string LastName { get; set; } = string.Empty;
    
    public string FullName => $"{FirstName} {LastName}";
    
    [Required]
    [EmailAddress]
    [MaxLength(200)]
    public string Email { get; set; } = string.Empty;
    
    [MaxLength(15)]
    public string? Phone { get; set; }
    
    [MaxLength(500)]
    public string? Address { get; set; }
    
    [Required]
    [MaxLength(20)]
    public string MemberType { get; set; } = "Student";
    
    [Required]
    [MaxLength(20)]
    public string Status { get; set; } = "Active";
    
    public DateTime JoinDate { get; set; }
    
    public DateTime? ExpiryDate { get; set; }
    
    public int MaxBooksAllowed { get; set; } = 5;
    
    public int CurrentBooksIssued { get; set; } = 0;
    
    public decimal? OutstandingFines { get; set; } = 0;
    
    [MaxLength(100)]
    public string? Department { get; set; }
    
    [MaxLength(50)]
    public string? StudentId { get; set; }
    
    [MaxLength(50)]
    public string? EmployeeId { get; set; }
    
    [MaxLength(500)]
    public string? PhotoPath { get; set; }
    
    [MaxLength(1000)]
    public string? Notes { get; set; }
    
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    
    public ICollection<BookIssue> BookIssues { get; set; } = new List<BookIssue>();
    public ICollection<BookReservation> BookReservations { get; set; } = new List<BookReservation>();
    public ICollection<BookReview> BookReviews { get; set; } = new List<BookReview>();
    public ICollection<Fine> Fines { get; set; } = new List<Fine>();
}

public class BookIssue
{
    public int Id { get; set; }
    
    public int BookId { get; set; }
    public Book Book { get; set; } = null!;
    
    public int MemberId { get; set; }
    public Member Member { get; set; } = null!;
    
    public DateTime IssueDate { get; set; }
    
    public DateTime DueDate { get; set; }
    
    public DateTime? ReturnDate { get; set; }
    
    [Required]
    [MaxLength(20)]
    public string Status { get; set; } = "Issued";
    
    public int? IssuedById { get; set; }
    
    public int? ReturnedById { get; set; }
    
    [MaxLength(1000)]
    public string? IssueNotes { get; set; }
    
    [MaxLength(1000)]
    public string? ReturnNotes { get; set; }
    
    public decimal? FineAmount { get; set; }
    
    public bool IsRenewed { get; set; } = false;
    
    public int RenewalCount { get; set; } = 0;
    
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class BookReservation
{
    public int Id { get; set; }
    
    public int BookId { get; set; }
    public Book Book { get; set; } = null!;
    
    public int MemberId { get; set; }
    public Member Member { get; set; } = null!;
    
    public DateTime ReservationDate { get; set; }
    
    public DateTime ExpiryDate { get; set; }
    
    [Required]
    [MaxLength(20)]
    public string Status { get; set; } = "Active";
    
    [MaxLength(1000)]
    public string? Notes { get; set; }
    
    public DateTime? NotifiedDate { get; set; }
    
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class Fine
{
    public int Id { get; set; }
    
    public int MemberId { get; set; }
    public Member Member { get; set; } = null!;
    
    public int? BookIssueId { get; set; }
    public BookIssue? BookIssue { get; set; }
    
    [Required]
    [MaxLength(50)]
    public string FineType { get; set; } = string.Empty;
    
    public decimal Amount { get; set; }
    
    [MaxLength(1000)]
    public string? Description { get; set; }
    
    public DateTime FineDate { get; set; }
    
    public DateTime? PaidDate { get; set; }
    
    [Required]
    [MaxLength(20)]
    public string Status { get; set; } = "Pending";
    
    [MaxLength(50)]
    public string? PaymentMethod { get; set; }
    
    [MaxLength(100)]
    public string? TransactionId { get; set; }
    
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class BookReview
{
    public int Id { get; set; }
    
    public int BookId { get; set; }
    public Book Book { get; set; } = null!;
    
    public int MemberId { get; set; }
    public Member Member { get; set; } = null!;
    
    public int Rating { get; set; }
    
    [MaxLength(2000)]
    public string? ReviewText { get; set; }
    
    public DateTime ReviewDate { get; set; }
    
    [Required]
    [MaxLength(20)]
    public string Status { get; set; } = "Published";
    
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
