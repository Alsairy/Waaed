﻿// <auto-generated />
using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Waaed.Library.Api.Data;

#nullable disable

namespace Waaed.Library.Api.Migrations
{
    [DbContext(typeof(LibraryDbContext))]
    [Migration("20250628235027_UpdateLibraryModel")]
    partial class UpdateLibraryModel
    {
        /// <inheritdoc />
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder.HasAnnotation("ProductVersion", "8.0.0");

            modelBuilder.Entity("Waaed.Library.Api.Entities.Book", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("INTEGER");

                    b.Property<string>("Author")
                        .IsRequired()
                        .HasMaxLength(200)
                        .HasColumnType("TEXT");

                    b.Property<int>("AvailableCopies")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("INTEGER")
                        .HasDefaultValue(1);

                    b.Property<string>("Category")
                        .IsRequired()
                        .HasMaxLength(100)
                        .HasColumnType("TEXT");

                    b.Property<string>("CoverImagePath")
                        .HasMaxLength(500)
                        .HasColumnType("TEXT");

                    b.Property<DateTime>("CreatedAt")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("TEXT")
                        .HasDefaultValueSql("CURRENT_TIMESTAMP");

                    b.Property<string>("Description")
                        .HasMaxLength(1000)
                        .HasColumnType("TEXT");

                    b.Property<string>("Edition")
                        .HasMaxLength(50)
                        .HasColumnType("TEXT");

                    b.Property<string>("FilePath")
                        .HasMaxLength(500)
                        .HasColumnType("TEXT");

                    b.Property<string>("ISBN")
                        .IsRequired()
                        .HasMaxLength(13)
                        .HasColumnType("TEXT");

                    b.Property<bool>("IsDigital")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("INTEGER")
                        .HasDefaultValue(false);

                    b.Property<bool>("IsReference")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("INTEGER")
                        .HasDefaultValue(false);

                    b.Property<int>("IssuedCopies")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("INTEGER")
                        .HasDefaultValue(0);

                    b.Property<string>("Language")
                        .HasMaxLength(100)
                        .HasColumnType("TEXT");

                    b.Property<string>("Location")
                        .IsRequired()
                        .HasMaxLength(50)
                        .HasColumnType("TEXT");

                    b.Property<int?>("Pages")
                        .HasColumnType("INTEGER");

                    b.Property<decimal?>("Price")
                        .HasColumnType("decimal(10,2)");

                    b.Property<DateTime?>("PublicationDate")
                        .HasColumnType("TEXT");

                    b.Property<string>("Publisher")
                        .HasMaxLength(100)
                        .HasColumnType("TEXT");

                    b.Property<int>("ReservedCopies")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("INTEGER")
                        .HasDefaultValue(0);

                    b.Property<string>("ShelfNumber")
                        .HasMaxLength(20)
                        .HasColumnType("TEXT");

                    b.Property<string>("Status")
                        .IsRequired()
                        .ValueGeneratedOnAdd()
                        .HasMaxLength(20)
                        .HasColumnType("TEXT")
                        .HasDefaultValue("Available");

                    b.Property<string>("SubCategory")
                        .HasMaxLength(100)
                        .HasColumnType("TEXT");

                    b.Property<string>("Tags")
                        .HasMaxLength(500)
                        .HasColumnType("TEXT");

                    b.Property<string>("Title")
                        .IsRequired()
                        .HasMaxLength(200)
                        .HasColumnType("TEXT");

                    b.Property<int>("TotalCopies")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("INTEGER")
                        .HasDefaultValue(1);

                    b.Property<DateTime>("UpdatedAt")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("TEXT")
                        .HasDefaultValueSql("CURRENT_TIMESTAMP");

                    b.HasKey("Id");

                    b.HasIndex("Author");

                    b.HasIndex("Category");

                    b.HasIndex("ISBN")
                        .IsUnique();

                    b.HasIndex("Title");

                    b.ToTable("Books", t =>
                        {
                            t.HasCheckConstraint("CK_Book_Copies", "TotalCopies >= 0 AND AvailableCopies >= 0 AND IssuedCopies >= 0 AND ReservedCopies >= 0");
                        });
                });

            modelBuilder.Entity("Waaed.Library.Api.Entities.BookIssue", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("INTEGER");

                    b.Property<int>("BookId")
                        .HasColumnType("INTEGER");

                    b.Property<DateTime>("CreatedAt")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("TEXT")
                        .HasDefaultValueSql("CURRENT_TIMESTAMP");

                    b.Property<DateTime>("DueDate")
                        .HasColumnType("TEXT");

                    b.Property<decimal?>("FineAmount")
                        .HasColumnType("decimal(10,2)");

                    b.Property<bool>("IsRenewed")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("INTEGER")
                        .HasDefaultValue(false);

                    b.Property<DateTime>("IssueDate")
                        .HasColumnType("TEXT");

                    b.Property<string>("IssueNotes")
                        .HasMaxLength(1000)
                        .HasColumnType("TEXT");

                    b.Property<int?>("IssuedById")
                        .HasColumnType("INTEGER");

                    b.Property<int>("MemberId")
                        .HasColumnType("INTEGER");

                    b.Property<int>("RenewalCount")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("INTEGER")
                        .HasDefaultValue(0);

                    b.Property<DateTime?>("ReturnDate")
                        .HasColumnType("TEXT");

                    b.Property<string>("ReturnNotes")
                        .HasMaxLength(1000)
                        .HasColumnType("TEXT");

                    b.Property<int?>("ReturnedById")
                        .HasColumnType("INTEGER");

                    b.Property<string>("Status")
                        .IsRequired()
                        .ValueGeneratedOnAdd()
                        .HasMaxLength(20)
                        .HasColumnType("TEXT")
                        .HasDefaultValue("Issued");

                    b.Property<DateTime>("UpdatedAt")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("TEXT")
                        .HasDefaultValueSql("CURRENT_TIMESTAMP");

                    b.HasKey("Id");

                    b.HasIndex("DueDate");

                    b.HasIndex("MemberId");

                    b.HasIndex("Status");

                    b.HasIndex("BookId", "MemberId", "IssueDate");

                    b.ToTable("BookIssues");
                });

            modelBuilder.Entity("Waaed.Library.Api.Entities.BookReservation", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("INTEGER");

                    b.Property<int>("BookId")
                        .HasColumnType("INTEGER");

                    b.Property<DateTime>("CreatedAt")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("TEXT")
                        .HasDefaultValueSql("CURRENT_TIMESTAMP");

                    b.Property<DateTime>("ExpiryDate")
                        .HasColumnType("TEXT");

                    b.Property<int>("MemberId")
                        .HasColumnType("INTEGER");

                    b.Property<string>("Notes")
                        .HasMaxLength(1000)
                        .HasColumnType("TEXT");

                    b.Property<DateTime?>("NotifiedDate")
                        .HasColumnType("TEXT");

                    b.Property<DateTime>("ReservationDate")
                        .HasColumnType("TEXT");

                    b.Property<string>("Status")
                        .IsRequired()
                        .ValueGeneratedOnAdd()
                        .HasMaxLength(20)
                        .HasColumnType("TEXT")
                        .HasDefaultValue("Active");

                    b.Property<DateTime>("UpdatedAt")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("TEXT")
                        .HasDefaultValueSql("CURRENT_TIMESTAMP");

                    b.HasKey("Id");

                    b.HasIndex("ExpiryDate");

                    b.HasIndex("MemberId");

                    b.HasIndex("Status");

                    b.HasIndex("BookId", "MemberId", "ReservationDate");

                    b.ToTable("BookReservations");
                });

            modelBuilder.Entity("Waaed.Library.Api.Entities.BookReview", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("INTEGER");

                    b.Property<int>("BookId")
                        .HasColumnType("INTEGER");

                    b.Property<DateTime>("CreatedAt")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("TEXT")
                        .HasDefaultValueSql("CURRENT_TIMESTAMP");

                    b.Property<int>("MemberId")
                        .HasColumnType("INTEGER");

                    b.Property<int>("Rating")
                        .HasColumnType("INTEGER");

                    b.Property<DateTime>("ReviewDate")
                        .HasColumnType("TEXT");

                    b.Property<string>("ReviewText")
                        .HasMaxLength(2000)
                        .HasColumnType("TEXT");

                    b.Property<string>("Status")
                        .IsRequired()
                        .ValueGeneratedOnAdd()
                        .HasMaxLength(20)
                        .HasColumnType("TEXT")
                        .HasDefaultValue("Published");

                    b.Property<DateTime>("UpdatedAt")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("TEXT")
                        .HasDefaultValueSql("CURRENT_TIMESTAMP");

                    b.HasKey("Id");

                    b.HasIndex("MemberId");

                    b.HasIndex("Rating");

                    b.HasIndex("Status");

                    b.HasIndex("BookId", "MemberId")
                        .IsUnique();

                    b.ToTable("BookReviews", t =>
                        {
                            t.HasCheckConstraint("CK_BookReview_Rating", "Rating >= 1 AND Rating <= 5");
                        });
                });

            modelBuilder.Entity("Waaed.Library.Api.Entities.Fine", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("INTEGER");

                    b.Property<decimal>("Amount")
                        .HasColumnType("decimal(10,2)");

                    b.Property<int?>("BookIssueId")
                        .HasColumnType("INTEGER");

                    b.Property<DateTime>("CreatedAt")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("TEXT")
                        .HasDefaultValueSql("CURRENT_TIMESTAMP");

                    b.Property<string>("Description")
                        .HasMaxLength(1000)
                        .HasColumnType("TEXT");

                    b.Property<DateTime>("FineDate")
                        .HasColumnType("TEXT");

                    b.Property<string>("FineType")
                        .IsRequired()
                        .HasMaxLength(50)
                        .HasColumnType("TEXT");

                    b.Property<int>("MemberId")
                        .HasColumnType("INTEGER");

                    b.Property<DateTime?>("PaidDate")
                        .HasColumnType("TEXT");

                    b.Property<string>("PaymentMethod")
                        .HasMaxLength(50)
                        .HasColumnType("TEXT");

                    b.Property<string>("Status")
                        .IsRequired()
                        .ValueGeneratedOnAdd()
                        .HasMaxLength(20)
                        .HasColumnType("TEXT")
                        .HasDefaultValue("Pending");

                    b.Property<string>("TransactionId")
                        .HasMaxLength(100)
                        .HasColumnType("TEXT");

                    b.Property<DateTime>("UpdatedAt")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("TEXT")
                        .HasDefaultValueSql("CURRENT_TIMESTAMP");

                    b.HasKey("Id");

                    b.HasIndex("BookIssueId");

                    b.HasIndex("FineDate");

                    b.HasIndex("MemberId");

                    b.HasIndex("Status");

                    b.ToTable("Fines", t =>
                        {
                            t.HasCheckConstraint("CK_Fine_Amount", "Amount >= 0");
                        });
                });

            modelBuilder.Entity("Waaed.Library.Api.Entities.Member", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("INTEGER");

                    b.Property<string>("Address")
                        .HasMaxLength(500)
                        .HasColumnType("TEXT");

                    b.Property<DateTime>("CreatedAt")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("TEXT")
                        .HasDefaultValueSql("CURRENT_TIMESTAMP");

                    b.Property<int>("CurrentBooksIssued")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("INTEGER")
                        .HasDefaultValue(0);

                    b.Property<string>("Department")
                        .HasMaxLength(100)
                        .HasColumnType("TEXT");

                    b.Property<string>("Email")
                        .IsRequired()
                        .HasMaxLength(200)
                        .HasColumnType("TEXT");

                    b.Property<string>("EmployeeId")
                        .HasMaxLength(50)
                        .HasColumnType("TEXT");

                    b.Property<DateTime?>("ExpiryDate")
                        .HasColumnType("TEXT");

                    b.Property<string>("FirstName")
                        .IsRequired()
                        .HasMaxLength(100)
                        .HasColumnType("TEXT");

                    b.Property<DateTime>("JoinDate")
                        .HasColumnType("TEXT");

                    b.Property<string>("LastName")
                        .IsRequired()
                        .HasMaxLength(100)
                        .HasColumnType("TEXT");

                    b.Property<int>("MaxBooksAllowed")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("INTEGER")
                        .HasDefaultValue(5);

                    b.Property<string>("MemberType")
                        .IsRequired()
                        .ValueGeneratedOnAdd()
                        .HasMaxLength(20)
                        .HasColumnType("TEXT")
                        .HasDefaultValue("Student");

                    b.Property<string>("MembershipId")
                        .IsRequired()
                        .HasMaxLength(20)
                        .HasColumnType("TEXT");

                    b.Property<string>("Notes")
                        .HasMaxLength(1000)
                        .HasColumnType("TEXT");

                    b.Property<decimal?>("OutstandingFines")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("decimal(10,2)")
                        .HasDefaultValue(0.0m);

                    b.Property<string>("Phone")
                        .HasMaxLength(15)
                        .HasColumnType("TEXT");

                    b.Property<string>("PhotoPath")
                        .HasMaxLength(500)
                        .HasColumnType("TEXT");

                    b.Property<string>("Status")
                        .IsRequired()
                        .ValueGeneratedOnAdd()
                        .HasMaxLength(20)
                        .HasColumnType("TEXT")
                        .HasDefaultValue("Active");

                    b.Property<string>("StudentId")
                        .HasMaxLength(50)
                        .HasColumnType("TEXT");

                    b.Property<DateTime>("UpdatedAt")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("TEXT")
                        .HasDefaultValueSql("CURRENT_TIMESTAMP");

                    b.HasKey("Id");

                    b.HasIndex("Email")
                        .IsUnique();

                    b.HasIndex("EmployeeId");

                    b.HasIndex("MembershipId")
                        .IsUnique();

                    b.HasIndex("StudentId");

                    b.ToTable("Members", t =>
                        {
                            t.HasCheckConstraint("CK_Member_Books", "MaxBooksAllowed >= 0 AND CurrentBooksIssued >= 0");
                        });
                });

            modelBuilder.Entity("Waaed.Library.Api.Entities.BookIssue", b =>
                {
                    b.HasOne("Waaed.Library.Api.Entities.Book", "Book")
                        .WithMany("BookIssues")
                        .HasForeignKey("BookId")
                        .OnDelete(DeleteBehavior.Restrict)
                        .IsRequired();

                    b.HasOne("Waaed.Library.Api.Entities.Member", "Member")
                        .WithMany("BookIssues")
                        .HasForeignKey("MemberId")
                        .OnDelete(DeleteBehavior.Restrict)
                        .IsRequired();

                    b.Navigation("Book");

                    b.Navigation("Member");
                });

            modelBuilder.Entity("Waaed.Library.Api.Entities.BookReservation", b =>
                {
                    b.HasOne("Waaed.Library.Api.Entities.Book", "Book")
                        .WithMany("BookReservations")
                        .HasForeignKey("BookId")
                        .OnDelete(DeleteBehavior.Restrict)
                        .IsRequired();

                    b.HasOne("Waaed.Library.Api.Entities.Member", "Member")
                        .WithMany("BookReservations")
                        .HasForeignKey("MemberId")
                        .OnDelete(DeleteBehavior.Restrict)
                        .IsRequired();

                    b.Navigation("Book");

                    b.Navigation("Member");
                });

            modelBuilder.Entity("Waaed.Library.Api.Entities.BookReview", b =>
                {
                    b.HasOne("Waaed.Library.Api.Entities.Book", "Book")
                        .WithMany("BookReviews")
                        .HasForeignKey("BookId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Waaed.Library.Api.Entities.Member", "Member")
                        .WithMany("BookReviews")
                        .HasForeignKey("MemberId")
                        .OnDelete(DeleteBehavior.Restrict)
                        .IsRequired();

                    b.Navigation("Book");

                    b.Navigation("Member");
                });

            modelBuilder.Entity("Waaed.Library.Api.Entities.Fine", b =>
                {
                    b.HasOne("Waaed.Library.Api.Entities.BookIssue", "BookIssue")
                        .WithMany()
                        .HasForeignKey("BookIssueId")
                        .OnDelete(DeleteBehavior.SetNull);

                    b.HasOne("Waaed.Library.Api.Entities.Member", "Member")
                        .WithMany("Fines")
                        .HasForeignKey("MemberId")
                        .OnDelete(DeleteBehavior.Restrict)
                        .IsRequired();

                    b.Navigation("BookIssue");

                    b.Navigation("Member");
                });

            modelBuilder.Entity("Waaed.Library.Api.Entities.Book", b =>
                {
                    b.Navigation("BookIssues");

                    b.Navigation("BookReservations");

                    b.Navigation("BookReviews");
                });

            modelBuilder.Entity("Waaed.Library.Api.Entities.Member", b =>
                {
                    b.Navigation("BookIssues");

                    b.Navigation("BookReservations");

                    b.Navigation("BookReviews");

                    b.Navigation("Fines");
                });
#pragma warning restore 612, 618
        }
    }
}
