using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Waaed.Finance.Api.Migrations
{
    /// <inheritdoc />
    public partial class InitialFinanceMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Budgets",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    Category = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    Department = table.Column<string>(type: "TEXT", maxLength: 50, nullable: true),
                    AllocatedAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    SpentAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    StartDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    EndDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    AcademicYear = table.Column<DateTime>(type: "TEXT", nullable: false),
                    Status = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    CreatedBy = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    ApprovedBy = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    ApprovalDate = table.Column<DateTime>(type: "TEXT", nullable: true),
                    Remarks = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    IsActive = table.Column<bool>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Budgets", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "FeeStructures",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    Class = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    Section = table.Column<string>(type: "TEXT", maxLength: 50, nullable: true),
                    TuitionFee = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    AdmissionFee = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    ExaminationFee = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    LibraryFee = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    LaboratoryFee = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    TransportFee = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    HostelFee = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    MiscellaneousFee = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    TotalFee = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    AcademicYear = table.Column<DateTime>(type: "TEXT", nullable: false),
                    PaymentFrequency = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    IsActive = table.Column<bool>(type: "INTEGER", nullable: false),
                    EffectiveFrom = table.Column<DateTime>(type: "TEXT", nullable: true),
                    EffectiveTo = table.Column<DateTime>(type: "TEXT", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FeeStructures", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "FinancialReports",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    ReportName = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    ReportType = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    Description = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    StartDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    EndDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    GeneratedDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    GeneratedBy = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    TotalIncome = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    TotalExpenses = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    NetProfit = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    FeeCollected = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    FeePending = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    SalaryPaid = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    OperationalExpenses = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    FilePath = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    Status = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    ReviewedBy = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    ReviewDate = table.Column<DateTime>(type: "TEXT", nullable: true),
                    Comments = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FinancialReports", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PayrollEntries",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    EmployeeId = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    EmployeeName = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Department = table.Column<string>(type: "TEXT", maxLength: 50, nullable: true),
                    Designation = table.Column<string>(type: "TEXT", maxLength: 50, nullable: true),
                    BasicSalary = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    HouseRentAllowance = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    MedicalAllowance = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    TransportAllowance = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    OtherAllowances = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    GrossSalary = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    ProvidentFund = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    IncomeTax = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    ProfessionalTax = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    LoanDeduction = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    OtherDeductions = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    TotalDeductions = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    NetSalary = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    PayrollMonth = table.Column<DateTime>(type: "TEXT", nullable: false),
                    WorkingDays = table.Column<int>(type: "INTEGER", nullable: false),
                    PresentDays = table.Column<int>(type: "INTEGER", nullable: false),
                    OvertimeHours = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    OvertimeAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Bonus = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Status = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    ApprovalDate = table.Column<DateTime>(type: "TEXT", nullable: true),
                    ApprovedBy = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    PaymentDate = table.Column<DateTime>(type: "TEXT", nullable: true),
                    PaymentMethod = table.Column<string>(type: "TEXT", maxLength: 50, nullable: true),
                    PaymentReference = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    Remarks = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PayrollEntries", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Students",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    StudentId = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    FirstName = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    LastName = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Class = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    Section = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    RollNumber = table.Column<string>(type: "TEXT", maxLength: 50, nullable: true),
                    AdmissionDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    IsActive = table.Column<bool>(type: "INTEGER", nullable: false),
                    ParentName = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    ParentPhone = table.Column<string>(type: "TEXT", maxLength: 15, nullable: true),
                    ParentEmail = table.Column<string>(type: "TEXT", maxLength: 200, nullable: true),
                    Address = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Students", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Expenses",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Title = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Category = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    SubCategory = table.Column<string>(type: "TEXT", maxLength: 50, nullable: true),
                    ExpenseDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    Vendor = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    InvoiceNumber = table.Column<string>(type: "TEXT", maxLength: 50, nullable: true),
                    PaymentMethod = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    PaymentReference = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    Status = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    ApprovedBy = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    ApprovalDate = table.Column<DateTime>(type: "TEXT", nullable: true),
                    PaidBy = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    PaymentDate = table.Column<DateTime>(type: "TEXT", nullable: true),
                    Remarks = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    Department = table.Column<string>(type: "TEXT", maxLength: 50, nullable: true),
                    BudgetId = table.Column<int>(type: "INTEGER", nullable: true),
                    IsRecurring = table.Column<bool>(type: "INTEGER", nullable: false),
                    RecurrencePattern = table.Column<string>(type: "TEXT", maxLength: 20, nullable: true),
                    NextDueDate = table.Column<DateTime>(type: "TEXT", nullable: true),
                    AttachmentPath = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Expenses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Expenses_Budgets_BudgetId",
                        column: x => x.BudgetId,
                        principalTable: "Budgets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "FeeCollections",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    ReceiptNumber = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    StudentId = table.Column<int>(type: "INTEGER", nullable: false),
                    FeeStructureId = table.Column<int>(type: "INTEGER", nullable: false),
                    AmountDue = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    AmountPaid = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Discount = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    LateFee = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    DueDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    PaymentDate = table.Column<DateTime>(type: "TEXT", nullable: true),
                    PaymentStatus = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    PaymentMethod = table.Column<string>(type: "TEXT", maxLength: 50, nullable: true),
                    TransactionReference = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    Remarks = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    FeeType = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    ForMonth = table.Column<DateTime>(type: "TEXT", nullable: false),
                    AcademicYear = table.Column<DateTime>(type: "TEXT", nullable: false),
                    CollectedBy = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FeeCollections", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FeeCollections_FeeStructures_FeeStructureId",
                        column: x => x.FeeStructureId,
                        principalTable: "FeeStructures",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_FeeCollections_Students_StudentId",
                        column: x => x.StudentId,
                        principalTable: "Students",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Expenses_BudgetId",
                table: "Expenses",
                column: "BudgetId");

            migrationBuilder.CreateIndex(
                name: "IX_FeeCollections_FeeStructureId",
                table: "FeeCollections",
                column: "FeeStructureId");

            migrationBuilder.CreateIndex(
                name: "IX_FeeCollections_ReceiptNumber",
                table: "FeeCollections",
                column: "ReceiptNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_FeeCollections_StudentId",
                table: "FeeCollections",
                column: "StudentId");

            migrationBuilder.CreateIndex(
                name: "IX_PayrollEntries_EmployeeId_PayrollMonth",
                table: "PayrollEntries",
                columns: new[] { "EmployeeId", "PayrollMonth" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Students_StudentId",
                table: "Students",
                column: "StudentId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Expenses");

            migrationBuilder.DropTable(
                name: "FeeCollections");

            migrationBuilder.DropTable(
                name: "FinancialReports");

            migrationBuilder.DropTable(
                name: "PayrollEntries");

            migrationBuilder.DropTable(
                name: "Budgets");

            migrationBuilder.DropTable(
                name: "FeeStructures");

            migrationBuilder.DropTable(
                name: "Students");
        }
    }
}
