using AutoMapper;
using Waaed.Library.Api.Entities;
using Waaed.Library.Api.DTOs;

namespace Waaed.Library.Api.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<Book, BookDto>()
            .ReverseMap();

        CreateMap<CreateBookDto, Book>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => "Available"))
            .ForMember(dest => dest.AvailableCopies, opt => opt.MapFrom(src => src.TotalCopies))
            .ForMember(dest => dest.IssuedCopies, opt => opt.MapFrom(src => 0))
            .ForMember(dest => dest.ReservedCopies, opt => opt.MapFrom(src => 0))
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.BookIssues, opt => opt.Ignore())
            .ForMember(dest => dest.BookReservations, opt => opt.Ignore())
            .ForMember(dest => dest.BookReviews, opt => opt.Ignore());

        CreateMap<UpdateBookDto, Book>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.BookIssues, opt => opt.Ignore())
            .ForMember(dest => dest.BookReservations, opt => opt.Ignore())
            .ForMember(dest => dest.BookReviews, opt => opt.Ignore());

        CreateMap<Member, MemberDto>()
            .ReverseMap();

        CreateMap<CreateMemberDto, Member>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.FullName, opt => opt.Ignore())
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => "Active"))
            .ForMember(dest => dest.JoinDate, opt => opt.MapFrom(src => DateTime.UtcNow))
            .ForMember(dest => dest.CurrentBooksIssued, opt => opt.MapFrom(src => 0))
            .ForMember(dest => dest.OutstandingFines, opt => opt.MapFrom(src => 0))
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.BookIssues, opt => opt.Ignore())
            .ForMember(dest => dest.BookReservations, opt => opt.Ignore())
            .ForMember(dest => dest.BookReviews, opt => opt.Ignore())
            .ForMember(dest => dest.Fines, opt => opt.Ignore());

        CreateMap<UpdateMemberDto, Member>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.MembershipId, opt => opt.Ignore())
            .ForMember(dest => dest.FullName, opt => opt.Ignore())
            .ForMember(dest => dest.JoinDate, opt => opt.Ignore())
            .ForMember(dest => dest.CurrentBooksIssued, opt => opt.Ignore())
            .ForMember(dest => dest.OutstandingFines, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.BookIssues, opt => opt.Ignore())
            .ForMember(dest => dest.BookReservations, opt => opt.Ignore())
            .ForMember(dest => dest.BookReviews, opt => opt.Ignore())
            .ForMember(dest => dest.Fines, opt => opt.Ignore());

        CreateMap<BookIssue, BookIssueDto>()
            .ForMember(dest => dest.BookTitle, opt => opt.MapFrom(src => src.Book.Title))
            .ForMember(dest => dest.BookAuthor, opt => opt.MapFrom(src => src.Book.Author))
            .ForMember(dest => dest.BookISBN, opt => opt.MapFrom(src => src.Book.ISBN))
            .ForMember(dest => dest.MemberName, opt => opt.MapFrom(src => src.Member.FullName))
            .ForMember(dest => dest.MembershipId, opt => opt.MapFrom(src => src.Member.MembershipId))
            .ForMember(dest => dest.DaysOverdue, opt => opt.MapFrom(src => 
                src.Status == "Issued" && src.DueDate < DateTime.UtcNow 
                    ? (int)(DateTime.UtcNow - src.DueDate).TotalDays 
                    : 0));

        CreateMap<CreateBookIssueDto, BookIssue>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.IssueDate, opt => opt.MapFrom(src => DateTime.UtcNow))
            .ForMember(dest => dest.DueDate, opt => opt.MapFrom(src => 
                src.DueDate ?? DateTime.UtcNow.AddDays(14)))
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => "Issued"))
            .ForMember(dest => dest.IsRenewed, opt => opt.MapFrom(src => false))
            .ForMember(dest => dest.RenewalCount, opt => opt.MapFrom(src => 0))
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.Book, opt => opt.Ignore())
            .ForMember(dest => dest.Member, opt => opt.Ignore());

        CreateMap<BookReservation, BookReservationDto>()
            .ForMember(dest => dest.BookTitle, opt => opt.MapFrom(src => src.Book.Title))
            .ForMember(dest => dest.BookAuthor, opt => opt.MapFrom(src => src.Book.Author))
            .ForMember(dest => dest.BookISBN, opt => opt.MapFrom(src => src.Book.ISBN))
            .ForMember(dest => dest.MemberName, opt => opt.MapFrom(src => src.Member.FullName))
            .ForMember(dest => dest.MembershipId, opt => opt.MapFrom(src => src.Member.MembershipId))
            .ForMember(dest => dest.DaysRemaining, opt => opt.MapFrom(src => 
                src.Status == "Active" && src.ExpiryDate > DateTime.UtcNow 
                    ? (int)(src.ExpiryDate - DateTime.UtcNow).TotalDays 
                    : 0));

        CreateMap<CreateBookReservationDto, BookReservation>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.ReservationDate, opt => opt.MapFrom(src => DateTime.UtcNow))
            .ForMember(dest => dest.ExpiryDate, opt => opt.MapFrom(src => 
                src.ExpiryDate ?? DateTime.UtcNow.AddDays(7)))
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => "Active"))
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.Book, opt => opt.Ignore())
            .ForMember(dest => dest.Member, opt => opt.Ignore());

        CreateMap<UpdateBookReservationDto, BookReservation>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.BookId, opt => opt.Ignore())
            .ForMember(dest => dest.MemberId, opt => opt.Ignore())
            .ForMember(dest => dest.ReservationDate, opt => opt.Ignore())
            .ForMember(dest => dest.NotifiedDate, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.Book, opt => opt.Ignore())
            .ForMember(dest => dest.Member, opt => opt.Ignore());

        CreateMap<Fine, FineDto>()
            .ForMember(dest => dest.MemberName, opt => opt.MapFrom(src => src.Member.FullName))
            .ForMember(dest => dest.MembershipId, opt => opt.MapFrom(src => src.Member.MembershipId))
            .ForMember(dest => dest.BookTitle, opt => opt.MapFrom(src => 
                src.BookIssue != null ? src.BookIssue.Book.Title : null))
            .ForMember(dest => dest.DaysOverdue, opt => opt.MapFrom(src => 
                src.BookIssue != null && src.BookIssue.Status == "Issued" && src.BookIssue.DueDate < DateTime.UtcNow 
                    ? (int)(DateTime.UtcNow - src.BookIssue.DueDate).TotalDays 
                    : 0));

        CreateMap<CreateFineDto, Fine>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.FineDate, opt => opt.MapFrom(src => DateTime.UtcNow))
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => "Pending"))
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.Member, opt => opt.Ignore())
            .ForMember(dest => dest.BookIssue, opt => opt.Ignore());

        CreateMap<BookReview, BookReviewDto>()
            .ForMember(dest => dest.BookTitle, opt => opt.MapFrom(src => src.Book.Title))
            .ForMember(dest => dest.MemberName, opt => opt.MapFrom(src => src.Member.FullName));

        CreateMap<CreateBookReviewDto, BookReview>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.ReviewDate, opt => opt.MapFrom(src => DateTime.UtcNow))
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => "Published"))
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.Book, opt => opt.Ignore())
            .ForMember(dest => dest.Member, opt => opt.Ignore());
    }
}

public class BookReviewDto
{
    public int Id { get; set; }
    public int BookId { get; set; }
    public string BookTitle { get; set; } = string.Empty;
    public int MemberId { get; set; }
    public string MemberName { get; set; } = string.Empty;
    public int Rating { get; set; }
    public string? ReviewText { get; set; }
    public DateTime ReviewDate { get; set; }
    public string Status { get; set; } = string.Empty;
}

public class CreateBookReviewDto
{
    public int BookId { get; set; }
    public int MemberId { get; set; }
    public int Rating { get; set; }
    public string? ReviewText { get; set; }
}
