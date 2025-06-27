using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Waaed.Library.Api.Migrations
{
    /// <inheritdoc />
    public partial class InitialLibraryMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Books",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    ISBN = table.Column<string>(type: "TEXT", maxLength: 13, nullable: false),
                    Title = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Author = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Publisher = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    PublicationDate = table.Column<DateTime>(type: "TEXT", nullable: true),
                    Edition = table.Column<string>(type: "TEXT", maxLength: 50, nullable: true),
                    Language = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    Pages = table.Column<int>(type: "INTEGER", nullable: true),
                    Description = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: true),
                    Category = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    SubCategory = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    Tags = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    Price = table.Column<decimal>(type: "decimal(10,2)", nullable: true),
                    Status = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false, defaultValue: "Available"),
                    Location = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    ShelfNumber = table.Column<string>(type: "TEXT", maxLength: 20, nullable: true),
                    TotalCopies = table.Column<int>(type: "INTEGER", nullable: false, defaultValue: 1),
                    AvailableCopies = table.Column<int>(type: "INTEGER", nullable: false, defaultValue: 1),
                    IssuedCopies = table.Column<int>(type: "INTEGER", nullable: false, defaultValue: 0),
                    ReservedCopies = table.Column<int>(type: "INTEGER", nullable: false, defaultValue: 0),
                    CoverImagePath = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    FilePath = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    IsDigital = table.Column<bool>(type: "INTEGER", nullable: false, defaultValue: false),
                    IsReference = table.Column<bool>(type: "INTEGER", nullable: false, defaultValue: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Books", x => x.Id);
                    table.CheckConstraint("CK_Book_Copies", "TotalCopies >= 0 AND AvailableCopies >= 0 AND IssuedCopies >= 0 AND ReservedCopies >= 0");
                });

            migrationBuilder.CreateTable(
                name: "Members",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    MembershipId = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    FirstName = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    LastName = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Email = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Phone = table.Column<string>(type: "TEXT", maxLength: 15, nullable: true),
                    Address = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    MemberType = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false, defaultValue: "Student"),
                    Status = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false, defaultValue: "Active"),
                    JoinDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    ExpiryDate = table.Column<DateTime>(type: "TEXT", nullable: true),
                    MaxBooksAllowed = table.Column<int>(type: "INTEGER", nullable: false, defaultValue: 5),
                    CurrentBooksIssued = table.Column<int>(type: "INTEGER", nullable: false, defaultValue: 0),
                    OutstandingFines = table.Column<decimal>(type: "decimal(10,2)", nullable: true, defaultValue: 0.0m),
                    Department = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    StudentId = table.Column<string>(type: "TEXT", maxLength: 50, nullable: true),
                    EmployeeId = table.Column<string>(type: "TEXT", maxLength: 50, nullable: true),
                    PhotoPath = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    Notes = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Members", x => x.Id);
                    table.CheckConstraint("CK_Member_Books", "MaxBooksAllowed >= 0 AND CurrentBooksIssued >= 0");
                });

            migrationBuilder.CreateTable(
                name: "BookIssues",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    BookId = table.Column<int>(type: "INTEGER", nullable: false),
                    MemberId = table.Column<int>(type: "INTEGER", nullable: false),
                    IssueDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    DueDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    ReturnDate = table.Column<DateTime>(type: "TEXT", nullable: true),
                    Status = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false, defaultValue: "Issued"),
                    IssuedById = table.Column<int>(type: "INTEGER", nullable: true),
                    ReturnedById = table.Column<int>(type: "INTEGER", nullable: true),
                    IssueNotes = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: true),
                    ReturnNotes = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: true),
                    FineAmount = table.Column<decimal>(type: "decimal(10,2)", nullable: true),
                    IsRenewed = table.Column<bool>(type: "INTEGER", nullable: false, defaultValue: false),
                    RenewalCount = table.Column<int>(type: "INTEGER", nullable: false, defaultValue: 0),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BookIssues", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BookIssues_Books_BookId",
                        column: x => x.BookId,
                        principalTable: "Books",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_BookIssues_Members_MemberId",
                        column: x => x.MemberId,
                        principalTable: "Members",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "BookReservations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    BookId = table.Column<int>(type: "INTEGER", nullable: false),
                    MemberId = table.Column<int>(type: "INTEGER", nullable: false),
                    ReservationDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    ExpiryDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    Status = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false, defaultValue: "Active"),
                    Notes = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: true),
                    NotifiedDate = table.Column<DateTime>(type: "TEXT", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BookReservations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BookReservations_Books_BookId",
                        column: x => x.BookId,
                        principalTable: "Books",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_BookReservations_Members_MemberId",
                        column: x => x.MemberId,
                        principalTable: "Members",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "BookReviews",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    BookId = table.Column<int>(type: "INTEGER", nullable: false),
                    MemberId = table.Column<int>(type: "INTEGER", nullable: false),
                    Rating = table.Column<int>(type: "INTEGER", nullable: false),
                    ReviewText = table.Column<string>(type: "TEXT", maxLength: 2000, nullable: true),
                    ReviewDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    Status = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false, defaultValue: "Published"),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BookReviews", x => x.Id);
                    table.CheckConstraint("CK_BookReview_Rating", "Rating >= 1 AND Rating <= 5");
                    table.ForeignKey(
                        name: "FK_BookReviews_Books_BookId",
                        column: x => x.BookId,
                        principalTable: "Books",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_BookReviews_Members_MemberId",
                        column: x => x.MemberId,
                        principalTable: "Members",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Fines",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    MemberId = table.Column<int>(type: "INTEGER", nullable: false),
                    BookIssueId = table.Column<int>(type: "INTEGER", nullable: true),
                    FineType = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    Description = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: true),
                    FineDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    PaidDate = table.Column<DateTime>(type: "TEXT", nullable: true),
                    Status = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false, defaultValue: "Pending"),
                    PaymentMethod = table.Column<string>(type: "TEXT", maxLength: 50, nullable: true),
                    TransactionId = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Fines", x => x.Id);
                    table.CheckConstraint("CK_Fine_Amount", "Amount >= 0");
                    table.ForeignKey(
                        name: "FK_Fines_BookIssues_BookIssueId",
                        column: x => x.BookIssueId,
                        principalTable: "BookIssues",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Fines_Members_MemberId",
                        column: x => x.MemberId,
                        principalTable: "Members",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_BookIssues_BookId_MemberId_IssueDate",
                table: "BookIssues",
                columns: new[] { "BookId", "MemberId", "IssueDate" });

            migrationBuilder.CreateIndex(
                name: "IX_BookIssues_DueDate",
                table: "BookIssues",
                column: "DueDate");

            migrationBuilder.CreateIndex(
                name: "IX_BookIssues_MemberId",
                table: "BookIssues",
                column: "MemberId");

            migrationBuilder.CreateIndex(
                name: "IX_BookIssues_Status",
                table: "BookIssues",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_BookReservations_BookId_MemberId_ReservationDate",
                table: "BookReservations",
                columns: new[] { "BookId", "MemberId", "ReservationDate" });

            migrationBuilder.CreateIndex(
                name: "IX_BookReservations_ExpiryDate",
                table: "BookReservations",
                column: "ExpiryDate");

            migrationBuilder.CreateIndex(
                name: "IX_BookReservations_MemberId",
                table: "BookReservations",
                column: "MemberId");

            migrationBuilder.CreateIndex(
                name: "IX_BookReservations_Status",
                table: "BookReservations",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_BookReviews_BookId_MemberId",
                table: "BookReviews",
                columns: new[] { "BookId", "MemberId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_BookReviews_MemberId",
                table: "BookReviews",
                column: "MemberId");

            migrationBuilder.CreateIndex(
                name: "IX_BookReviews_Rating",
                table: "BookReviews",
                column: "Rating");

            migrationBuilder.CreateIndex(
                name: "IX_BookReviews_Status",
                table: "BookReviews",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_Books_Author",
                table: "Books",
                column: "Author");

            migrationBuilder.CreateIndex(
                name: "IX_Books_Category",
                table: "Books",
                column: "Category");

            migrationBuilder.CreateIndex(
                name: "IX_Books_ISBN",
                table: "Books",
                column: "ISBN",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Books_Title",
                table: "Books",
                column: "Title");

            migrationBuilder.CreateIndex(
                name: "IX_Fines_BookIssueId",
                table: "Fines",
                column: "BookIssueId");

            migrationBuilder.CreateIndex(
                name: "IX_Fines_FineDate",
                table: "Fines",
                column: "FineDate");

            migrationBuilder.CreateIndex(
                name: "IX_Fines_MemberId",
                table: "Fines",
                column: "MemberId");

            migrationBuilder.CreateIndex(
                name: "IX_Fines_Status",
                table: "Fines",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_Members_Email",
                table: "Members",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Members_EmployeeId",
                table: "Members",
                column: "EmployeeId");

            migrationBuilder.CreateIndex(
                name: "IX_Members_MembershipId",
                table: "Members",
                column: "MembershipId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Members_StudentId",
                table: "Members",
                column: "StudentId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BookReservations");

            migrationBuilder.DropTable(
                name: "BookReviews");

            migrationBuilder.DropTable(
                name: "Fines");

            migrationBuilder.DropTable(
                name: "BookIssues");

            migrationBuilder.DropTable(
                name: "Books");

            migrationBuilder.DropTable(
                name: "Members");
        }
    }
}
