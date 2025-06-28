namespace Waaed.Library.Api.DTOs;

public class BookDto
{
    public int Id { get; set; }
    public string ISBN { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Author { get; set; } = string.Empty;
    public string? Publisher { get; set; }
    public DateTime? PublicationDate { get; set; }
    public string? Edition { get; set; }
    public string? Language { get; set; }
    public int? Pages { get; set; }
    public string? Description { get; set; }
    public string Category { get; set; } = string.Empty;
    public string? SubCategory { get; set; }
    public string? Tags { get; set; }
    public decimal? Price { get; set; }
    public string Status { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string? ShelfNumber { get; set; }
    public int TotalCopies { get; set; }
    public int AvailableCopies { get; set; }
    public int IssuedCopies { get; set; }
    public int ReservedCopies { get; set; }
    public string? CoverImagePath { get; set; }
    public string? FilePath { get; set; }
    public bool IsDigital { get; set; }
    public bool IsReference { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateBookDto
{
    public string ISBN { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Author { get; set; } = string.Empty;
    public string? Publisher { get; set; }
    public DateTime? PublicationDate { get; set; }
    public string? Edition { get; set; }
    public string? Language { get; set; }
    public int? Pages { get; set; }
    public string? Description { get; set; }
    public string Category { get; set; } = string.Empty;
    public string? SubCategory { get; set; }
    public string? Tags { get; set; }
    public decimal? Price { get; set; }
    public string Location { get; set; } = string.Empty;
    public string? ShelfNumber { get; set; }
    public int TotalCopies { get; set; } = 1;
    public bool IsDigital { get; set; } = false;
    public bool IsReference { get; set; } = false;
}

public class UpdateBookDto
{
    public string ISBN { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Author { get; set; } = string.Empty;
    public string? Publisher { get; set; }
    public DateTime? PublicationDate { get; set; }
    public string? Edition { get; set; }
    public string? Language { get; set; }
    public int? Pages { get; set; }
    public string? Description { get; set; }
    public string Category { get; set; } = string.Empty;
    public string? SubCategory { get; set; }
    public string? Tags { get; set; }
    public decimal? Price { get; set; }
    public string Status { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string? ShelfNumber { get; set; }
    public int TotalCopies { get; set; }
    public bool IsDigital { get; set; }
    public bool IsReference { get; set; }
}

public class BookSearchDto
{
    public string? Title { get; set; }
    public string? Author { get; set; }
    public string? ISBN { get; set; }
    public string? Category { get; set; }
    public string? Publisher { get; set; }
    public string? Language { get; set; }
    public bool? IsDigital { get; set; }
    public bool? IsReference { get; set; }
    public bool? AvailableOnly { get; set; }
}

public class BookSummaryDto
{
    public int TotalBooks { get; set; }
    public int AvailableBooks { get; set; }
    public int IssuedBooks { get; set; }
    public int ReservedBooks { get; set; }
    public int DigitalBooks { get; set; }
    public int ReferenceBooks { get; set; }
    public Dictionary<string, int> BooksByCategory { get; set; } = new();
    public Dictionary<string, int> BooksByStatus { get; set; } = new();
}
