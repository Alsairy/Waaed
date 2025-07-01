using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Waaed.Finance.Api.Migrations
{
    /// <inheritdoc />
    public partial class UpdateFinanceModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "FeeCategories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    AcademicYear = table.Column<DateTime>(type: "TEXT", nullable: false),
                    IsActive = table.Column<bool>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FeeCategories", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TaxTypes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    Description = table.Column<string>(type: "TEXT", maxLength: 200, nullable: true),
                    TaxRate = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    IsActive = table.Column<bool>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TaxTypes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "FeeCategoryBatches",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    FeeCategoryId = table.Column<int>(type: "INTEGER", nullable: false),
                    BatchName = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    Grade = table.Column<string>(type: "TEXT", maxLength: 50, nullable: true),
                    Section = table.Column<string>(type: "TEXT", maxLength: 50, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FeeCategoryBatches", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FeeCategoryBatches_FeeCategories_FeeCategoryId",
                        column: x => x.FeeCategoryId,
                        principalTable: "FeeCategories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "FeeCollectionSchedules",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    FeeCategoryId = table.Column<int>(type: "INTEGER", nullable: false),
                    CollectionName = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    StartDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    DueDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    EndDate = table.Column<DateTime>(type: "TEXT", nullable: true),
                    Status = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    HasLateFee = table.Column<bool>(type: "INTEGER", nullable: false),
                    LateFeeType = table.Column<string>(type: "TEXT", maxLength: 20, nullable: true),
                    LateFeeAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    LateFeePercentage = table.Column<decimal>(type: "decimal(5,2)", nullable: true),
                    LateFeeRecurrenceType = table.Column<string>(type: "TEXT", maxLength: 20, nullable: true),
                    LateFeeRecurrenceInterval = table.Column<int>(type: "INTEGER", nullable: true),
                    SendNotifications = table.Column<bool>(type: "INTEGER", nullable: false),
                    NotifyOnStart = table.Column<bool>(type: "INTEGER", nullable: false),
                    NotifyBeforeDue = table.Column<bool>(type: "INTEGER", nullable: false),
                    NotifyDaysBefore = table.Column<int>(type: "INTEGER", nullable: true),
                    NotifyOnOverdue = table.Column<bool>(type: "INTEGER", nullable: false),
                    IsActive = table.Column<bool>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FeeCollectionSchedules", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FeeCollectionSchedules_FeeCategories_FeeCategoryId",
                        column: x => x.FeeCategoryId,
                        principalTable: "FeeCategories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "FeeDiscounts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    FeeCategoryId = table.Column<int>(type: "INTEGER", nullable: false),
                    Name = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    DiscountType = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    DiscountValue = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    ApplicabilityScope = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    StudentCategory = table.Column<string>(type: "TEXT", maxLength: 50, nullable: true),
                    SpecificStudentId = table.Column<int>(type: "INTEGER", nullable: true),
                    BatchName = table.Column<string>(type: "TEXT", maxLength: 50, nullable: true),
                    Priority = table.Column<int>(type: "INTEGER", nullable: false),
                    IsActive = table.Column<bool>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FeeDiscounts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FeeDiscounts_FeeCategories_FeeCategoryId",
                        column: x => x.FeeCategoryId,
                        principalTable: "FeeCategories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "FeeParticulars",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    FeeCategoryId = table.Column<int>(type: "INTEGER", nullable: false),
                    Name = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    ApplicabilityType = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    StudentCategory = table.Column<string>(type: "TEXT", maxLength: 50, nullable: true),
                    SpecificStudentId = table.Column<int>(type: "INTEGER", nullable: true),
                    IsTaxable = table.Column<bool>(type: "INTEGER", nullable: false),
                    TaxTypeId = table.Column<int>(type: "INTEGER", nullable: true),
                    IsActive = table.Column<bool>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FeeParticulars", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FeeParticulars_FeeCategories_FeeCategoryId",
                        column: x => x.FeeCategoryId,
                        principalTable: "FeeCategories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_FeeParticulars_TaxTypes_TaxTypeId",
                        column: x => x.TaxTypeId,
                        principalTable: "TaxTypes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "StudentFeeAssignments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    FeeCollectionScheduleId = table.Column<int>(type: "INTEGER", nullable: false),
                    StudentId = table.Column<int>(type: "INTEGER", nullable: false),
                    BaseAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    DiscountAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TaxAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    LateFeeAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TotalAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    PaidAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    BalanceAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    PaymentStatus = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    LastPaymentDate = table.Column<DateTime>(type: "TEXT", nullable: true),
                    OverdueDate = table.Column<DateTime>(type: "TEXT", nullable: true),
                    IsWaived = table.Column<bool>(type: "INTEGER", nullable: false),
                    WaiverReason = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    WaivedBy = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    WaivedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    Remarks = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StudentFeeAssignments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_StudentFeeAssignments_FeeCollectionSchedules_FeeCollectionScheduleId",
                        column: x => x.FeeCollectionScheduleId,
                        principalTable: "FeeCollectionSchedules",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_StudentFeeAssignments_Students_StudentId",
                        column: x => x.StudentId,
                        principalTable: "Students",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "FeePayments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    StudentFeeAssignmentId = table.Column<int>(type: "INTEGER", nullable: false),
                    FeeCollectionScheduleId = table.Column<int>(type: "INTEGER", nullable: true),
                    ReceiptNumber = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    PaymentMethod = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    TransactionReference = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    ChequeNumber = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    BankName = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    ChequeDate = table.Column<DateTime>(type: "TEXT", nullable: true),
                    PaymentDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    PaymentStatus = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    Remarks = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    CollectedBy = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    IsAdvancePayment = table.Column<bool>(type: "INTEGER", nullable: false),
                    IsRefunded = table.Column<bool>(type: "INTEGER", nullable: false),
                    RefundAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    RefundDate = table.Column<DateTime>(type: "TEXT", nullable: true),
                    RefundReason = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FeePayments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FeePayments_FeeCollectionSchedules_FeeCollectionScheduleId",
                        column: x => x.FeeCollectionScheduleId,
                        principalTable: "FeeCollectionSchedules",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_FeePayments_StudentFeeAssignments_StudentFeeAssignmentId",
                        column: x => x.StudentFeeAssignmentId,
                        principalTable: "StudentFeeAssignments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_FeeCategoryBatches_FeeCategoryId",
                table: "FeeCategoryBatches",
                column: "FeeCategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_FeeCollectionSchedules_FeeCategoryId",
                table: "FeeCollectionSchedules",
                column: "FeeCategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_FeeDiscounts_FeeCategoryId",
                table: "FeeDiscounts",
                column: "FeeCategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_FeeParticulars_FeeCategoryId",
                table: "FeeParticulars",
                column: "FeeCategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_FeeParticulars_TaxTypeId",
                table: "FeeParticulars",
                column: "TaxTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_FeePayments_FeeCollectionScheduleId",
                table: "FeePayments",
                column: "FeeCollectionScheduleId");

            migrationBuilder.CreateIndex(
                name: "IX_FeePayments_ReceiptNumber",
                table: "FeePayments",
                column: "ReceiptNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_FeePayments_StudentFeeAssignmentId",
                table: "FeePayments",
                column: "StudentFeeAssignmentId");

            migrationBuilder.CreateIndex(
                name: "IX_StudentFeeAssignments_FeeCollectionScheduleId",
                table: "StudentFeeAssignments",
                column: "FeeCollectionScheduleId");

            migrationBuilder.CreateIndex(
                name: "IX_StudentFeeAssignments_StudentId",
                table: "StudentFeeAssignments",
                column: "StudentId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "FeeCategoryBatches");

            migrationBuilder.DropTable(
                name: "FeeDiscounts");

            migrationBuilder.DropTable(
                name: "FeeParticulars");

            migrationBuilder.DropTable(
                name: "FeePayments");

            migrationBuilder.DropTable(
                name: "TaxTypes");

            migrationBuilder.DropTable(
                name: "StudentFeeAssignments");

            migrationBuilder.DropTable(
                name: "FeeCollectionSchedules");

            migrationBuilder.DropTable(
                name: "FeeCategories");
        }
    }
}
