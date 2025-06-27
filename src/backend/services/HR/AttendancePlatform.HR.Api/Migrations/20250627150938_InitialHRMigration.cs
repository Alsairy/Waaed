using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AttendancePlatform.HR.Api.Migrations
{
    /// <inheritdoc />
    public partial class InitialHRMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Departments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    Code = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    ParentDepartmentId = table.Column<int>(type: "INTEGER", nullable: true),
                    HeadOfDepartmentId = table.Column<int>(type: "INTEGER", nullable: true),
                    Location = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    Phone = table.Column<string>(type: "TEXT", maxLength: 15, nullable: true),
                    Email = table.Column<string>(type: "TEXT", maxLength: 200, nullable: true),
                    Budget = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    CostCenter = table.Column<string>(type: "TEXT", maxLength: 50, nullable: true),
                    IsActive = table.Column<bool>(type: "INTEGER", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Departments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Departments_Departments_ParentDepartmentId",
                        column: x => x.ParentDepartmentId,
                        principalTable: "Departments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Positions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Title = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    Code = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    DepartmentId = table.Column<int>(type: "INTEGER", nullable: false),
                    Level = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    Grade = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    MinSalary = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    MaxSalary = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Responsibilities = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: true),
                    Requirements = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: true),
                    Skills = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: true),
                    Qualifications = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    ExperienceYears = table.Column<int>(type: "INTEGER", nullable: true),
                    EmploymentType = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false, defaultValue: "Full-Time"),
                    ReportsTo = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    IsActive = table.Column<bool>(type: "INTEGER", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Positions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Positions_Departments_DepartmentId",
                        column: x => x.DepartmentId,
                        principalTable: "Departments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Employees",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    EmployeeId = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    FirstName = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    LastName = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Email = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Phone = table.Column<string>(type: "TEXT", maxLength: 15, nullable: true),
                    Address = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    DateOfBirth = table.Column<DateTime>(type: "TEXT", nullable: false),
                    Gender = table.Column<string>(type: "TEXT", maxLength: 10, nullable: false),
                    MaritalStatus = table.Column<string>(type: "TEXT", maxLength: 20, nullable: true),
                    Nationality = table.Column<string>(type: "TEXT", maxLength: 50, nullable: true),
                    NationalId = table.Column<string>(type: "TEXT", maxLength: 50, nullable: true),
                    PassportNumber = table.Column<string>(type: "TEXT", maxLength: 50, nullable: true),
                    PassportExpiry = table.Column<DateTime>(type: "TEXT", nullable: true),
                    HireDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    TerminationDate = table.Column<DateTime>(type: "TEXT", nullable: true),
                    EmploymentStatus = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false, defaultValue: "Active"),
                    EmploymentType = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false, defaultValue: "Full-Time"),
                    DepartmentId = table.Column<int>(type: "INTEGER", nullable: false),
                    PositionId = table.Column<int>(type: "INTEGER", nullable: false),
                    ManagerId = table.Column<int>(type: "INTEGER", nullable: true),
                    BasicSalary = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    PayrollFrequency = table.Column<string>(type: "TEXT", maxLength: 20, nullable: true),
                    BankAccount = table.Column<string>(type: "TEXT", maxLength: 50, nullable: true),
                    BankName = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    TaxId = table.Column<string>(type: "TEXT", maxLength: 20, nullable: true),
                    SocialSecurityNumber = table.Column<string>(type: "TEXT", maxLength: 20, nullable: true),
                    EmergencyContactName = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    EmergencyContactPhone = table.Column<string>(type: "TEXT", maxLength: 15, nullable: true),
                    EmergencyContactRelation = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    ProfilePicturePath = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    Notes = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: true),
                    IsActive = table.Column<bool>(type: "INTEGER", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Employees", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Employees_Departments_DepartmentId",
                        column: x => x.DepartmentId,
                        principalTable: "Departments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Employees_Employees_ManagerId",
                        column: x => x.ManagerId,
                        principalTable: "Employees",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Employees_Positions_PositionId",
                        column: x => x.PositionId,
                        principalTable: "Positions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "LeaveRequests",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    EmployeeId = table.Column<int>(type: "INTEGER", nullable: false),
                    LeaveType = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    StartDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    EndDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    TotalDays = table.Column<int>(type: "INTEGER", nullable: false),
                    Reason = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: true),
                    Status = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false, defaultValue: "Pending"),
                    RequestDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    ApprovedById = table.Column<int>(type: "INTEGER", nullable: true),
                    ApprovalDate = table.Column<DateTime>(type: "TEXT", nullable: true),
                    ApprovalComments = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    RejectionReason = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    AttachmentPath = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    IsEmergency = table.Column<bool>(type: "INTEGER", nullable: false),
                    ContactDuringLeave = table.Column<string>(type: "TEXT", maxLength: 15, nullable: true),
                    HandoverNotes = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LeaveRequests", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LeaveRequests_Employees_ApprovedById",
                        column: x => x.ApprovedById,
                        principalTable: "Employees",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_LeaveRequests_Employees_EmployeeId",
                        column: x => x.EmployeeId,
                        principalTable: "Employees",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PerformanceReviews",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    EmployeeId = table.Column<int>(type: "INTEGER", nullable: false),
                    ReviewerId = table.Column<int>(type: "INTEGER", nullable: false),
                    ReviewPeriod = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    ReviewDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    PeriodStartDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    PeriodEndDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    Status = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false, defaultValue: "Draft"),
                    OverallRating = table.Column<decimal>(type: "decimal(3,2)", nullable: false),
                    QualityOfWorkRating = table.Column<decimal>(type: "decimal(3,2)", nullable: true),
                    ProductivityRating = table.Column<decimal>(type: "decimal(3,2)", nullable: true),
                    CommunicationRating = table.Column<decimal>(type: "decimal(3,2)", nullable: true),
                    TeamworkRating = table.Column<decimal>(type: "decimal(3,2)", nullable: true),
                    LeadershipRating = table.Column<decimal>(type: "decimal(3,2)", nullable: true),
                    InitiativeRating = table.Column<decimal>(type: "decimal(3,2)", nullable: true),
                    ProblemSolvingRating = table.Column<decimal>(type: "decimal(3,2)", nullable: true),
                    AdaptabilityRating = table.Column<decimal>(type: "decimal(3,2)", nullable: true),
                    Achievements = table.Column<string>(type: "TEXT", maxLength: 2000, nullable: true),
                    AreasOfImprovement = table.Column<string>(type: "TEXT", maxLength: 2000, nullable: true),
                    Goals = table.Column<string>(type: "TEXT", maxLength: 2000, nullable: true),
                    DevelopmentPlan = table.Column<string>(type: "TEXT", maxLength: 2000, nullable: true),
                    EmployeeComments = table.Column<string>(type: "TEXT", maxLength: 2000, nullable: true),
                    ReviewerComments = table.Column<string>(type: "TEXT", maxLength: 2000, nullable: true),
                    HRComments = table.Column<string>(type: "TEXT", maxLength: 2000, nullable: true),
                    RecommendForPromotion = table.Column<bool>(type: "INTEGER", nullable: false),
                    RecommendForTraining = table.Column<bool>(type: "INTEGER", nullable: false),
                    TrainingRecommendations = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    SalaryIncrease = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    BonusRecommendation = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    EmployeeSignedDate = table.Column<DateTime>(type: "TEXT", nullable: true),
                    ReviewerSignedDate = table.Column<DateTime>(type: "TEXT", nullable: true),
                    HRSignedDate = table.Column<DateTime>(type: "TEXT", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PerformanceReviews", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PerformanceReviews_Employees_EmployeeId",
                        column: x => x.EmployeeId,
                        principalTable: "Employees",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PerformanceReviews_Employees_ReviewerId",
                        column: x => x.ReviewerId,
                        principalTable: "Employees",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Recruitments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    JobTitle = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    JobCode = table.Column<string>(type: "TEXT", maxLength: 20, nullable: true),
                    PositionId = table.Column<int>(type: "INTEGER", nullable: false),
                    DepartmentId = table.Column<int>(type: "INTEGER", nullable: false),
                    JobDescription = table.Column<string>(type: "TEXT", maxLength: 2000, nullable: true),
                    Requirements = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: true),
                    Skills = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: true),
                    VacancyCount = table.Column<int>(type: "INTEGER", nullable: false, defaultValue: 1),
                    Priority = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false, defaultValue: "Medium"),
                    Status = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false, defaultValue: "Open"),
                    PostedDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    ClosingDate = table.Column<DateTime>(type: "TEXT", nullable: true),
                    MinSalary = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    MaxSalary = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    EmploymentType = table.Column<string>(type: "TEXT", maxLength: 20, nullable: true),
                    Location = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    IsRemote = table.Column<bool>(type: "INTEGER", nullable: false),
                    ExperienceYears = table.Column<int>(type: "INTEGER", nullable: true),
                    Qualifications = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    RequestedById = table.Column<int>(type: "INTEGER", nullable: false),
                    AssignedToId = table.Column<int>(type: "INTEGER", nullable: true),
                    Notes = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: true),
                    IsPublished = table.Column<bool>(type: "INTEGER", nullable: false),
                    ExternalJobBoardUrls = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Recruitments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Recruitments_Departments_DepartmentId",
                        column: x => x.DepartmentId,
                        principalTable: "Departments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Recruitments_Employees_AssignedToId",
                        column: x => x.AssignedToId,
                        principalTable: "Employees",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Recruitments_Employees_RequestedById",
                        column: x => x.RequestedById,
                        principalTable: "Employees",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Recruitments_Positions_PositionId",
                        column: x => x.PositionId,
                        principalTable: "Positions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "JobApplications",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    RecruitmentId = table.Column<int>(type: "INTEGER", nullable: false),
                    FirstName = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    LastName = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Email = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Phone = table.Column<string>(type: "TEXT", maxLength: 15, nullable: true),
                    Address = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    ResumePath = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    CoverLetterPath = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    CoverLetter = table.Column<string>(type: "TEXT", maxLength: 2000, nullable: true),
                    Status = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false, defaultValue: "Applied"),
                    ApplicationDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    ExperienceYears = table.Column<int>(type: "INTEGER", nullable: true),
                    CurrentCompany = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    CurrentPosition = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    ExpectedSalary = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    NoticePeriod = table.Column<string>(type: "TEXT", maxLength: 20, nullable: true),
                    Skills = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: true),
                    Qualifications = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    InterviewDate = table.Column<DateTime>(type: "TEXT", nullable: true),
                    InterviewType = table.Column<string>(type: "TEXT", maxLength: 20, nullable: true),
                    InterviewNotes = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: true),
                    InterviewRating = table.Column<decimal>(type: "decimal(3,2)", nullable: true),
                    InterviewedById = table.Column<int>(type: "INTEGER", nullable: true),
                    RejectionReason = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_JobApplications", x => x.Id);
                    table.ForeignKey(
                        name: "FK_JobApplications_Employees_InterviewedById",
                        column: x => x.InterviewedById,
                        principalTable: "Employees",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_JobApplications_Recruitments_RecruitmentId",
                        column: x => x.RecruitmentId,
                        principalTable: "Recruitments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Departments_Code",
                table: "Departments",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Departments_HeadOfDepartmentId",
                table: "Departments",
                column: "HeadOfDepartmentId");

            migrationBuilder.CreateIndex(
                name: "IX_Departments_ParentDepartmentId",
                table: "Departments",
                column: "ParentDepartmentId");

            migrationBuilder.CreateIndex(
                name: "IX_Employees_DepartmentId",
                table: "Employees",
                column: "DepartmentId");

            migrationBuilder.CreateIndex(
                name: "IX_Employees_Email",
                table: "Employees",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Employees_EmployeeId",
                table: "Employees",
                column: "EmployeeId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Employees_ManagerId",
                table: "Employees",
                column: "ManagerId");

            migrationBuilder.CreateIndex(
                name: "IX_Employees_PositionId",
                table: "Employees",
                column: "PositionId");

            migrationBuilder.CreateIndex(
                name: "IX_JobApplications_InterviewedById",
                table: "JobApplications",
                column: "InterviewedById");

            migrationBuilder.CreateIndex(
                name: "IX_JobApplications_RecruitmentId",
                table: "JobApplications",
                column: "RecruitmentId");

            migrationBuilder.CreateIndex(
                name: "IX_LeaveRequests_ApprovedById",
                table: "LeaveRequests",
                column: "ApprovedById");

            migrationBuilder.CreateIndex(
                name: "IX_LeaveRequests_EmployeeId",
                table: "LeaveRequests",
                column: "EmployeeId");

            migrationBuilder.CreateIndex(
                name: "IX_PerformanceReviews_EmployeeId",
                table: "PerformanceReviews",
                column: "EmployeeId");

            migrationBuilder.CreateIndex(
                name: "IX_PerformanceReviews_ReviewerId",
                table: "PerformanceReviews",
                column: "ReviewerId");

            migrationBuilder.CreateIndex(
                name: "IX_Positions_Code",
                table: "Positions",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Positions_DepartmentId",
                table: "Positions",
                column: "DepartmentId");

            migrationBuilder.CreateIndex(
                name: "IX_Recruitments_AssignedToId",
                table: "Recruitments",
                column: "AssignedToId");

            migrationBuilder.CreateIndex(
                name: "IX_Recruitments_DepartmentId",
                table: "Recruitments",
                column: "DepartmentId");

            migrationBuilder.CreateIndex(
                name: "IX_Recruitments_PositionId",
                table: "Recruitments",
                column: "PositionId");

            migrationBuilder.CreateIndex(
                name: "IX_Recruitments_RequestedById",
                table: "Recruitments",
                column: "RequestedById");

            migrationBuilder.AddForeignKey(
                name: "FK_Departments_Employees_HeadOfDepartmentId",
                table: "Departments",
                column: "HeadOfDepartmentId",
                principalTable: "Employees",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Departments_Employees_HeadOfDepartmentId",
                table: "Departments");

            migrationBuilder.DropTable(
                name: "JobApplications");

            migrationBuilder.DropTable(
                name: "LeaveRequests");

            migrationBuilder.DropTable(
                name: "PerformanceReviews");

            migrationBuilder.DropTable(
                name: "Recruitments");

            migrationBuilder.DropTable(
                name: "Employees");

            migrationBuilder.DropTable(
                name: "Positions");

            migrationBuilder.DropTable(
                name: "Departments");
        }
    }
}
