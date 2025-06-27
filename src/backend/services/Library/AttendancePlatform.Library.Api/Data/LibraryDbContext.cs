using Microsoft.EntityFrameworkCore;
using AttendancePlatform.Library.Api.Entities;

namespace AttendancePlatform.Library.Api.Data;

public class LibraryDbContext : DbContext
{
    public LibraryDbContext(DbContextOptions<LibraryDbContext> options) : base(options)
    {
    }

    public DbSet<Book> Books { get; set; }
    public DbSet<Member> Members { get; set; }
    public DbSet<BookIssue> BookIssues { get; set; }
    public DbSet<BookReservation> BookReservations { get; set; }
    public DbSet<Fine> Fines { get; set; }
    public DbSet<BookReview> BookReviews { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Book>(entity =>
        {
            entity.HasKey(b => b.Id);
            entity.HasIndex(b => b.ISBN).IsUnique();
            entity.HasIndex(b => b.Title);
            entity.HasIndex(b => b.Author);
            entity.HasIndex(b => b.Category);
            
            entity.Property(b => b.ISBN).IsRequired().HasMaxLength(13);
            entity.Property(b => b.Title).IsRequired().HasMaxLength(200);
            entity.Property(b => b.Author).IsRequired().HasMaxLength(200);
            entity.Property(b => b.Publisher).HasMaxLength(100);
            entity.Property(b => b.Edition).HasMaxLength(50);
            entity.Property(b => b.Language).HasMaxLength(100);
            entity.Property(b => b.Description).HasMaxLength(1000);
            entity.Property(b => b.Category).IsRequired().HasMaxLength(100);
            entity.Property(b => b.SubCategory).HasMaxLength(100);
            entity.Property(b => b.Tags).HasMaxLength(500);
            entity.Property(b => b.Status).IsRequired().HasMaxLength(20).HasDefaultValue("Available");
            entity.Property(b => b.Location).IsRequired().HasMaxLength(50);
            entity.Property(b => b.ShelfNumber).HasMaxLength(20);
            entity.Property(b => b.TotalCopies).HasDefaultValue(1);
            entity.Property(b => b.AvailableCopies).HasDefaultValue(1);
            entity.Property(b => b.IssuedCopies).HasDefaultValue(0);
            entity.Property(b => b.ReservedCopies).HasDefaultValue(0);
            entity.Property(b => b.CoverImagePath).HasMaxLength(500);
            entity.Property(b => b.FilePath).HasMaxLength(500);
            entity.Property(b => b.IsDigital).HasDefaultValue(false);
            entity.Property(b => b.IsReference).HasDefaultValue(false);
            entity.Property(b => b.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            entity.Property(b => b.UpdatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            
            entity.Property(b => b.Price).HasColumnType("decimal(10,2)");
        });

        modelBuilder.Entity<Member>(entity =>
        {
            entity.HasKey(m => m.Id);
            entity.HasIndex(m => m.MembershipId).IsUnique();
            entity.HasIndex(m => m.Email).IsUnique();
            entity.HasIndex(m => m.StudentId);
            entity.HasIndex(m => m.EmployeeId);
            
            entity.Property(m => m.MembershipId).IsRequired().HasMaxLength(20);
            entity.Property(m => m.FirstName).IsRequired().HasMaxLength(100);
            entity.Property(m => m.LastName).IsRequired().HasMaxLength(100);
            entity.Property(m => m.Email).IsRequired().HasMaxLength(200);
            entity.Property(m => m.Phone).HasMaxLength(15);
            entity.Property(m => m.Address).HasMaxLength(500);
            entity.Property(m => m.MemberType).IsRequired().HasMaxLength(20).HasDefaultValue("Student");
            entity.Property(m => m.Status).IsRequired().HasMaxLength(20).HasDefaultValue("Active");
            entity.Property(m => m.MaxBooksAllowed).HasDefaultValue(5);
            entity.Property(m => m.CurrentBooksIssued).HasDefaultValue(0);
            entity.Property(m => m.OutstandingFines).HasColumnType("decimal(10,2)").HasDefaultValue(0.0m);
            entity.Property(m => m.Department).HasMaxLength(100);
            entity.Property(m => m.StudentId).HasMaxLength(50);
            entity.Property(m => m.EmployeeId).HasMaxLength(50);
            entity.Property(m => m.PhotoPath).HasMaxLength(500);
            entity.Property(m => m.Notes).HasMaxLength(1000);
            entity.Property(m => m.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            entity.Property(m => m.UpdatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
        });

        modelBuilder.Entity<BookIssue>(entity =>
        {
            entity.HasKey(bi => bi.Id);
            entity.HasIndex(bi => new { bi.BookId, bi.MemberId, bi.IssueDate });
            entity.HasIndex(bi => bi.Status);
            entity.HasIndex(bi => bi.DueDate);
            
            entity.Property(bi => bi.Status).IsRequired().HasMaxLength(20).HasDefaultValue("Issued");
            entity.Property(bi => bi.IssueNotes).HasMaxLength(1000);
            entity.Property(bi => bi.ReturnNotes).HasMaxLength(1000);
            entity.Property(bi => bi.FineAmount).HasColumnType("decimal(10,2)");
            entity.Property(bi => bi.IsRenewed).HasDefaultValue(false);
            entity.Property(bi => bi.RenewalCount).HasDefaultValue(0);
            entity.Property(bi => bi.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            entity.Property(bi => bi.UpdatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.HasOne(bi => bi.Book)
                .WithMany(b => b.BookIssues)
                .HasForeignKey(bi => bi.BookId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(bi => bi.Member)
                .WithMany(m => m.BookIssues)
                .HasForeignKey(bi => bi.MemberId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<BookReservation>(entity =>
        {
            entity.HasKey(br => br.Id);
            entity.HasIndex(br => new { br.BookId, br.MemberId, br.ReservationDate });
            entity.HasIndex(br => br.Status);
            entity.HasIndex(br => br.ExpiryDate);
            
            entity.Property(br => br.Status).IsRequired().HasMaxLength(20).HasDefaultValue("Active");
            entity.Property(br => br.Notes).HasMaxLength(1000);
            entity.Property(br => br.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            entity.Property(br => br.UpdatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.HasOne(br => br.Book)
                .WithMany(b => b.BookReservations)
                .HasForeignKey(br => br.BookId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(br => br.Member)
                .WithMany(m => m.BookReservations)
                .HasForeignKey(br => br.MemberId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Fine>(entity =>
        {
            entity.HasKey(f => f.Id);
            entity.HasIndex(f => f.MemberId);
            entity.HasIndex(f => f.Status);
            entity.HasIndex(f => f.FineDate);
            
            entity.Property(f => f.FineType).IsRequired().HasMaxLength(50);
            entity.Property(f => f.Amount).HasColumnType("decimal(10,2)");
            entity.Property(f => f.Description).HasMaxLength(1000);
            entity.Property(f => f.Status).IsRequired().HasMaxLength(20).HasDefaultValue("Pending");
            entity.Property(f => f.PaymentMethod).HasMaxLength(50);
            entity.Property(f => f.TransactionId).HasMaxLength(100);
            entity.Property(f => f.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            entity.Property(f => f.UpdatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.HasOne(f => f.Member)
                .WithMany(m => m.Fines)
                .HasForeignKey(f => f.MemberId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(f => f.BookIssue)
                .WithMany()
                .HasForeignKey(f => f.BookIssueId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<BookReview>(entity =>
        {
            entity.HasKey(br => br.Id);
            entity.HasIndex(br => new { br.BookId, br.MemberId }).IsUnique();
            entity.HasIndex(br => br.Rating);
            entity.HasIndex(br => br.Status);
            
            entity.Property(br => br.Rating).IsRequired();
            entity.Property(br => br.ReviewText).HasMaxLength(2000);
            entity.Property(br => br.Status).IsRequired().HasMaxLength(20).HasDefaultValue("Published");
            entity.Property(br => br.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            entity.Property(br => br.UpdatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.HasOne(br => br.Book)
                .WithMany(b => b.BookReviews)
                .HasForeignKey(br => br.BookId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(br => br.Member)
                .WithMany(m => m.BookReviews)
                .HasForeignKey(br => br.MemberId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasCheckConstraint("CK_BookReview_Rating", "Rating >= 1 AND Rating <= 5");
        });

        modelBuilder.Entity<Book>()
            .HasCheckConstraint("CK_Book_Copies", "TotalCopies >= 0 AND AvailableCopies >= 0 AND IssuedCopies >= 0 AND ReservedCopies >= 0");

        modelBuilder.Entity<Member>()
            .HasCheckConstraint("CK_Member_Books", "MaxBooksAllowed >= 0 AND CurrentBooksIssued >= 0");

        modelBuilder.Entity<Fine>()
            .HasCheckConstraint("CK_Fine_Amount", "Amount >= 0");
    }
}
