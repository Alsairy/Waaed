using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Waaed.LMS.Api.Migrations
{
    /// <inheritdoc />
    public partial class InitialSQLiteMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CourseTemplates",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: false),
                    Category = table.Column<string>(type: "TEXT", nullable: false),
                    Type = table.Column<int>(type: "INTEGER", nullable: false),
                    IsPublic = table.Column<bool>(type: "INTEGER", nullable: false),
                    TenantId = table.Column<string>(type: "TEXT", nullable: false),
                    CourseStructure = table.Column<string>(type: "TEXT", nullable: false),
                    DefaultSettings = table.Column<string>(type: "TEXT", nullable: false),
                    Tags = table.Column<string>(type: "TEXT", nullable: false),
                    UsageCount = table.Column<int>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    CreatedBy = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CourseTemplates", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "LearningOutcomes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    Title = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: false),
                    Code = table.Column<string>(type: "TEXT", nullable: false),
                    Scope = table.Column<int>(type: "INTEGER", nullable: false),
                    ScopeId = table.Column<string>(type: "TEXT", nullable: false),
                    MasteryThreshold = table.Column<decimal>(type: "TEXT", nullable: false),
                    MasteryScale = table.Column<string>(type: "TEXT", nullable: false),
                    IsActive = table.Column<bool>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    CreatedBy = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LearningOutcomes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "LTITools",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "TEXT", nullable: false),
                    LaunchUrl = table.Column<string>(type: "TEXT", maxLength: 500, nullable: false),
                    ConsumerKey = table.Column<string>(type: "TEXT", nullable: false),
                    SharedSecret = table.Column<string>(type: "TEXT", nullable: false),
                    Version = table.Column<int>(type: "INTEGER", nullable: false),
                    ClientId = table.Column<string>(type: "TEXT", nullable: false),
                    DeploymentId = table.Column<string>(type: "TEXT", nullable: false),
                    KeysetUrl = table.Column<string>(type: "TEXT", nullable: false),
                    AuthTokenUrl = table.Column<string>(type: "TEXT", nullable: false),
                    AuthLoginUrl = table.Column<string>(type: "TEXT", nullable: false),
                    TargetLinkUri = table.Column<string>(type: "TEXT", nullable: false),
                    IsActive = table.Column<bool>(type: "INTEGER", nullable: false),
                    TenantId = table.Column<string>(type: "TEXT", nullable: false),
                    Placements = table.Column<int>(type: "INTEGER", nullable: false),
                    CustomFields = table.Column<string>(type: "TEXT", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    CreatedBy = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LTITools", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Rubrics",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    Title = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "TEXT", maxLength: 2000, nullable: false),
                    Type = table.Column<int>(type: "INTEGER", nullable: false),
                    IsPublic = table.Column<bool>(type: "INTEGER", nullable: false),
                    TenantId = table.Column<string>(type: "TEXT", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    CreatedBy = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Rubrics", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Courses",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    Title = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Code = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    Description = table.Column<string>(type: "TEXT", maxLength: 2000, nullable: false),
                    Status = table.Column<int>(type: "INTEGER", nullable: false),
                    StartDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    EndDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    InstructorId = table.Column<string>(type: "TEXT", nullable: false),
                    TenantId = table.Column<string>(type: "TEXT", nullable: false),
                    TemplateId = table.Column<Guid>(type: "TEXT", nullable: true),
                    IsTemplate = table.Column<bool>(type: "INTEGER", nullable: false),
                    SyllabusContent = table.Column<string>(type: "TEXT", nullable: false),
                    Credits = table.Column<int>(type: "INTEGER", nullable: false),
                    Department = table.Column<string>(type: "TEXT", nullable: false),
                    Term = table.Column<string>(type: "TEXT", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    CreatedBy = table.Column<string>(type: "TEXT", nullable: false),
                    UpdatedBy = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Courses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Courses_CourseTemplates_TemplateId",
                        column: x => x.TemplateId,
                        principalTable: "CourseTemplates",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "TemplateModules",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    CourseTemplateId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Title = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "TEXT", nullable: false),
                    Position = table.Column<int>(type: "INTEGER", nullable: false),
                    Content = table.Column<string>(type: "TEXT", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TemplateModules", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TemplateModules_CourseTemplates_CourseTemplateId",
                        column: x => x.CourseTemplateId,
                        principalTable: "CourseTemplates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "OutcomeResults",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    LearningOutcomeId = table.Column<Guid>(type: "TEXT", nullable: false),
                    StudentId = table.Column<string>(type: "TEXT", nullable: false),
                    CourseId = table.Column<string>(type: "TEXT", nullable: false),
                    Score = table.Column<decimal>(type: "TEXT", nullable: false),
                    MasteryLevel = table.Column<int>(type: "INTEGER", nullable: false),
                    AttemptCount = table.Column<int>(type: "INTEGER", nullable: false),
                    LastAssessed = table.Column<DateTime>(type: "TEXT", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OutcomeResults", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OutcomeResults_LearningOutcomes_LearningOutcomeId",
                        column: x => x.LearningOutcomeId,
                        principalTable: "LearningOutcomes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "LTILaunches",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    LTIToolId = table.Column<Guid>(type: "TEXT", nullable: false),
                    UserId = table.Column<string>(type: "TEXT", nullable: false),
                    CourseId = table.Column<string>(type: "TEXT", nullable: false),
                    ResourceLinkId = table.Column<string>(type: "TEXT", nullable: false),
                    LaunchUrl = table.Column<string>(type: "TEXT", nullable: false),
                    ReturnUrl = table.Column<string>(type: "TEXT", nullable: false),
                    Status = table.Column<int>(type: "INTEGER", nullable: false),
                    LaunchedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    ResultSourcedId = table.Column<string>(type: "TEXT", nullable: false),
                    Score = table.Column<decimal>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LTILaunches", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LTILaunches_LTITools_LTIToolId",
                        column: x => x.LTIToolId,
                        principalTable: "LTITools",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RubricCriteria",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    RubricId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Description = table.Column<string>(type: "TEXT", maxLength: 500, nullable: false),
                    Points = table.Column<decimal>(type: "TEXT", nullable: false),
                    Position = table.Column<int>(type: "INTEGER", nullable: false),
                    LearningOutcomeId = table.Column<Guid>(type: "TEXT", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RubricCriteria", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RubricCriteria_LearningOutcomes_LearningOutcomeId",
                        column: x => x.LearningOutcomeId,
                        principalTable: "LearningOutcomes",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_RubricCriteria_Rubrics_RubricId",
                        column: x => x.RubricId,
                        principalTable: "Rubrics",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Announcements",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    CourseId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Title = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Content = table.Column<string>(type: "TEXT", maxLength: 5000, nullable: false),
                    IsPublished = table.Column<bool>(type: "INTEGER", nullable: false),
                    PublishAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    DelayedPostAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    AllowComments = table.Column<bool>(type: "INTEGER", nullable: false),
                    RequireInitialPost = table.Column<bool>(type: "INTEGER", nullable: false),
                    AttachmentUrls = table.Column<string>(type: "TEXT", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    CreatedBy = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Announcements", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Announcements_Courses_CourseId",
                        column: x => x.CourseId,
                        principalTable: "Courses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Assignments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    CourseId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Title = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "TEXT", maxLength: 2000, nullable: false),
                    Instructions = table.Column<string>(type: "TEXT", nullable: false),
                    Points = table.Column<int>(type: "INTEGER", nullable: false),
                    DueDate = table.Column<DateTime>(type: "TEXT", nullable: true),
                    AvailableFrom = table.Column<DateTime>(type: "TEXT", nullable: true),
                    AvailableUntil = table.Column<DateTime>(type: "TEXT", nullable: true),
                    SubmissionType = table.Column<int>(type: "INTEGER", nullable: false),
                    AllowedFileTypes = table.Column<string>(type: "TEXT", nullable: false),
                    AllowLateSubmissions = table.Column<bool>(type: "INTEGER", nullable: false),
                    LatePenaltyPercent = table.Column<int>(type: "INTEGER", nullable: true),
                    MaxAttempts = table.Column<int>(type: "INTEGER", nullable: false),
                    GradingType = table.Column<int>(type: "INTEGER", nullable: false),
                    RubricId = table.Column<Guid>(type: "TEXT", nullable: true),
                    PeerReviewEnabled = table.Column<bool>(type: "INTEGER", nullable: false),
                    PeerReviewCount = table.Column<int>(type: "INTEGER", nullable: false),
                    PeerReviewDueDate = table.Column<DateTime>(type: "TEXT", nullable: true),
                    GroupAssignment = table.Column<bool>(type: "INTEGER", nullable: false),
                    GroupSetId = table.Column<Guid>(type: "TEXT", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    CreatedBy = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Assignments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Assignments_Courses_CourseId",
                        column: x => x.CourseId,
                        principalTable: "Courses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Assignments_Rubrics_RubricId",
                        column: x => x.RubricId,
                        principalTable: "Rubrics",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Conferences",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    CourseId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Title = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: false),
                    Type = table.Column<int>(type: "INTEGER", nullable: false),
                    ScheduledStart = table.Column<DateTime>(type: "TEXT", nullable: false),
                    ScheduledEnd = table.Column<DateTime>(type: "TEXT", nullable: false),
                    ActualStart = table.Column<DateTime>(type: "TEXT", nullable: true),
                    ActualEnd = table.Column<DateTime>(type: "TEXT", nullable: true),
                    Status = table.Column<int>(type: "INTEGER", nullable: false),
                    MeetingId = table.Column<string>(type: "TEXT", nullable: false),
                    ModeratorPassword = table.Column<string>(type: "TEXT", nullable: false),
                    AttendeePassword = table.Column<string>(type: "TEXT", nullable: false),
                    JoinUrl = table.Column<string>(type: "TEXT", nullable: false),
                    ModeratorUrl = table.Column<string>(type: "TEXT", nullable: false),
                    RecordingEnabled = table.Column<bool>(type: "INTEGER", nullable: false),
                    RecordingUrl = table.Column<string>(type: "TEXT", nullable: false),
                    IsRecurring = table.Column<bool>(type: "INTEGER", nullable: false),
                    RecurrencePattern = table.Column<string>(type: "TEXT", nullable: false),
                    MaxParticipants = table.Column<int>(type: "INTEGER", nullable: false),
                    RequireModeratorApproval = table.Column<bool>(type: "INTEGER", nullable: false),
                    MuteOnStart = table.Column<bool>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    CreatedBy = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Conferences", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Conferences_Courses_CourseId",
                        column: x => x.CourseId,
                        principalTable: "Courses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CourseEnrollments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    CourseId = table.Column<Guid>(type: "TEXT", nullable: false),
                    UserId = table.Column<string>(type: "TEXT", nullable: false),
                    Role = table.Column<int>(type: "INTEGER", nullable: false),
                    Status = table.Column<int>(type: "INTEGER", nullable: false),
                    EnrolledAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    SectionId = table.Column<string>(type: "TEXT", nullable: false),
                    CanViewGrades = table.Column<bool>(type: "INTEGER", nullable: false),
                    CanSubmitAssignments = table.Column<bool>(type: "INTEGER", nullable: false),
                    CanParticipateDiscussions = table.Column<bool>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CourseEnrollments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CourseEnrollments_Courses_CourseId",
                        column: x => x.CourseId,
                        principalTable: "Courses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CourseModules",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    CourseId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Title = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "TEXT", maxLength: 2000, nullable: false),
                    Position = table.Column<int>(type: "INTEGER", nullable: false),
                    IsPublished = table.Column<bool>(type: "INTEGER", nullable: false),
                    PublishAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    UnlockAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    LockAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    Prerequisites = table.Column<string>(type: "TEXT", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CourseModules", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CourseModules_Courses_CourseId",
                        column: x => x.CourseId,
                        principalTable: "Courses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Discussions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    CourseId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Title = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "TEXT", maxLength: 2000, nullable: false),
                    Type = table.Column<int>(type: "INTEGER", nullable: false),
                    IsGraded = table.Column<bool>(type: "INTEGER", nullable: false),
                    Points = table.Column<int>(type: "INTEGER", nullable: false),
                    DueDate = table.Column<DateTime>(type: "TEXT", nullable: true),
                    AvailableFrom = table.Column<DateTime>(type: "TEXT", nullable: true),
                    AvailableUntil = table.Column<DateTime>(type: "TEXT", nullable: true),
                    RequireInitialPost = table.Column<bool>(type: "INTEGER", nullable: false),
                    AllowRating = table.Column<bool>(type: "INTEGER", nullable: false),
                    SortByRating = table.Column<bool>(type: "INTEGER", nullable: false),
                    OnlyGradersCanRate = table.Column<bool>(type: "INTEGER", nullable: false),
                    IsAnnouncement = table.Column<bool>(type: "INTEGER", nullable: false),
                    IsPinned = table.Column<bool>(type: "INTEGER", nullable: false),
                    IsLocked = table.Column<bool>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    CreatedBy = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Discussions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Discussions_Courses_CourseId",
                        column: x => x.CourseId,
                        principalTable: "Courses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Quizzes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    CourseId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Title = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "TEXT", maxLength: 2000, nullable: false),
                    Instructions = table.Column<string>(type: "TEXT", nullable: false),
                    Type = table.Column<int>(type: "INTEGER", nullable: false),
                    Points = table.Column<int>(type: "INTEGER", nullable: false),
                    TimeLimit = table.Column<int>(type: "INTEGER", nullable: false),
                    AllowedAttempts = table.Column<int>(type: "INTEGER", nullable: false),
                    ScoringPolicy = table.Column<int>(type: "INTEGER", nullable: false),
                    AvailableFrom = table.Column<DateTime>(type: "TEXT", nullable: true),
                    AvailableUntil = table.Column<DateTime>(type: "TEXT", nullable: true),
                    DueDate = table.Column<DateTime>(type: "TEXT", nullable: true),
                    ShuffleQuestions = table.Column<bool>(type: "INTEGER", nullable: false),
                    ShuffleAnswers = table.Column<bool>(type: "INTEGER", nullable: false),
                    ShowCorrectAnswers = table.Column<bool>(type: "INTEGER", nullable: false),
                    ShowCorrectAnswersAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    OneQuestionAtATime = table.Column<bool>(type: "INTEGER", nullable: false),
                    CantGoBack = table.Column<bool>(type: "INTEGER", nullable: false),
                    AccessCode = table.Column<string>(type: "TEXT", nullable: false),
                    RequireLockdownBrowser = table.Column<bool>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    CreatedBy = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Quizzes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Quizzes_Courses_CourseId",
                        column: x => x.CourseId,
                        principalTable: "Courses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SCORMPackages",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    CourseId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Title = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "TEXT", nullable: false),
                    FilePath = table.Column<string>(type: "TEXT", maxLength: 500, nullable: false),
                    ManifestPath = table.Column<string>(type: "TEXT", nullable: false),
                    Version = table.Column<int>(type: "INTEGER", nullable: false),
                    Identifier = table.Column<string>(type: "TEXT", nullable: false),
                    IsGraded = table.Column<bool>(type: "INTEGER", nullable: false),
                    Points = table.Column<int>(type: "INTEGER", nullable: false),
                    DueDate = table.Column<DateTime>(type: "TEXT", nullable: true),
                    AvailableFrom = table.Column<DateTime>(type: "TEXT", nullable: true),
                    AvailableUntil = table.Column<DateTime>(type: "TEXT", nullable: true),
                    MaxAttempts = table.Column<int>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    CreatedBy = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SCORMPackages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SCORMPackages_Courses_CourseId",
                        column: x => x.CourseId,
                        principalTable: "Courses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TemplateItems",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    TemplateModuleId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Title = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Type = table.Column<int>(type: "INTEGER", nullable: false),
                    Content = table.Column<string>(type: "TEXT", nullable: false),
                    Position = table.Column<int>(type: "INTEGER", nullable: false),
                    IsRequired = table.Column<bool>(type: "INTEGER", nullable: false),
                    Points = table.Column<int>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TemplateItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TemplateItems_TemplateModules_TemplateModuleId",
                        column: x => x.TemplateModuleId,
                        principalTable: "TemplateModules",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RubricLevels",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    RubricCriterionId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Description = table.Column<string>(type: "TEXT", maxLength: 500, nullable: false),
                    Points = table.Column<decimal>(type: "TEXT", nullable: false),
                    Position = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RubricLevels", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RubricLevels_RubricCriteria_RubricCriterionId",
                        column: x => x.RubricCriterionId,
                        principalTable: "RubricCriteria",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AnnouncementComments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    AnnouncementId = table.Column<Guid>(type: "TEXT", nullable: false),
                    AuthorId = table.Column<string>(type: "TEXT", nullable: false),
                    Content = table.Column<string>(type: "TEXT", maxLength: 2000, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AnnouncementComments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AnnouncementComments_Announcements_AnnouncementId",
                        column: x => x.AnnouncementId,
                        principalTable: "Announcements",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Submissions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    AssignmentId = table.Column<Guid>(type: "TEXT", nullable: false),
                    StudentId = table.Column<string>(type: "TEXT", nullable: false),
                    Content = table.Column<string>(type: "TEXT", nullable: false),
                    AttachmentUrls = table.Column<string>(type: "TEXT", nullable: false),
                    ExternalUrl = table.Column<string>(type: "TEXT", nullable: false),
                    Status = table.Column<int>(type: "INTEGER", nullable: false),
                    SubmittedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    IsLate = table.Column<bool>(type: "INTEGER", nullable: false),
                    AttemptNumber = table.Column<int>(type: "INTEGER", nullable: false),
                    WorkflowState = table.Column<string>(type: "TEXT", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Submissions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Submissions_Assignments_AssignmentId",
                        column: x => x.AssignmentId,
                        principalTable: "Assignments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ConferenceParticipants",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    ConferenceId = table.Column<Guid>(type: "TEXT", nullable: false),
                    UserId = table.Column<string>(type: "TEXT", nullable: false),
                    Role = table.Column<int>(type: "INTEGER", nullable: false),
                    JoinedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    LeftAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    Duration = table.Column<int>(type: "INTEGER", nullable: false),
                    IsPresent = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ConferenceParticipants", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ConferenceParticipants_Conferences_ConferenceId",
                        column: x => x.ConferenceId,
                        principalTable: "Conferences",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ConferenceRecordings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    ConferenceId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Title = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Url = table.Column<string>(type: "TEXT", nullable: false),
                    PlaybackUrl = table.Column<string>(type: "TEXT", nullable: false),
                    FileSize = table.Column<long>(type: "INTEGER", nullable: false),
                    Duration = table.Column<int>(type: "INTEGER", nullable: false),
                    Format = table.Column<int>(type: "INTEGER", nullable: false),
                    IsPublished = table.Column<bool>(type: "INTEGER", nullable: false),
                    RecordedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    PublishedAt = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ConferenceRecordings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ConferenceRecordings_Conferences_ConferenceId",
                        column: x => x.ConferenceId,
                        principalTable: "Conferences",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ModuleItems",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    ModuleId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Title = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Type = table.Column<int>(type: "INTEGER", nullable: false),
                    ContentId = table.Column<string>(type: "TEXT", nullable: false),
                    Position = table.Column<int>(type: "INTEGER", nullable: false),
                    IsRequired = table.Column<bool>(type: "INTEGER", nullable: false),
                    Points = table.Column<int>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ModuleItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ModuleItems_CourseModules_ModuleId",
                        column: x => x.ModuleId,
                        principalTable: "CourseModules",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "DiscussionPosts",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    DiscussionId = table.Column<Guid>(type: "TEXT", nullable: false),
                    ParentPostId = table.Column<Guid>(type: "TEXT", nullable: true),
                    AuthorId = table.Column<string>(type: "TEXT", nullable: false),
                    Content = table.Column<string>(type: "TEXT", maxLength: 5000, nullable: false),
                    AttachmentUrls = table.Column<string>(type: "TEXT", nullable: false),
                    Rating = table.Column<int>(type: "INTEGER", nullable: false),
                    RatingCount = table.Column<int>(type: "INTEGER", nullable: false),
                    IsDeleted = table.Column<bool>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DiscussionPosts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DiscussionPosts_DiscussionPosts_ParentPostId",
                        column: x => x.ParentPostId,
                        principalTable: "DiscussionPosts",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_DiscussionPosts_Discussions_DiscussionId",
                        column: x => x.DiscussionId,
                        principalTable: "Discussions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "OutcomeAlignments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    LearningOutcomeId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Type = table.Column<int>(type: "INTEGER", nullable: false),
                    ContentId = table.Column<string>(type: "TEXT", nullable: false),
                    Weight = table.Column<decimal>(type: "TEXT", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    AssignmentId = table.Column<Guid>(type: "TEXT", nullable: true),
                    LearningOutcomeId1 = table.Column<Guid>(type: "TEXT", nullable: true),
                    QuizId = table.Column<Guid>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OutcomeAlignments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OutcomeAlignments_Assignments_AssignmentId",
                        column: x => x.AssignmentId,
                        principalTable: "Assignments",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_OutcomeAlignments_LearningOutcomes_LearningOutcomeId",
                        column: x => x.LearningOutcomeId,
                        principalTable: "LearningOutcomes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_OutcomeAlignments_LearningOutcomes_LearningOutcomeId1",
                        column: x => x.LearningOutcomeId1,
                        principalTable: "LearningOutcomes",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_OutcomeAlignments_Quizzes_QuizId",
                        column: x => x.QuizId,
                        principalTable: "Quizzes",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Questions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    QuizId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Text = table.Column<string>(type: "TEXT", maxLength: 2000, nullable: false),
                    Type = table.Column<int>(type: "INTEGER", nullable: false),
                    Points = table.Column<decimal>(type: "TEXT", nullable: false),
                    Position = table.Column<int>(type: "INTEGER", nullable: false),
                    CorrectAnswer = table.Column<string>(type: "TEXT", nullable: false),
                    AnswerChoices = table.Column<string>(type: "TEXT", nullable: false),
                    Feedback = table.Column<string>(type: "TEXT", nullable: false),
                    LearningOutcomeId = table.Column<Guid>(type: "TEXT", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Questions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Questions_LearningOutcomes_LearningOutcomeId",
                        column: x => x.LearningOutcomeId,
                        principalTable: "LearningOutcomes",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Questions_Quizzes_QuizId",
                        column: x => x.QuizId,
                        principalTable: "Quizzes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "QuizAttempts",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    QuizId = table.Column<Guid>(type: "TEXT", nullable: false),
                    StudentId = table.Column<string>(type: "TEXT", nullable: false),
                    AttemptNumber = table.Column<int>(type: "INTEGER", nullable: false),
                    Status = table.Column<int>(type: "INTEGER", nullable: false),
                    StartedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    SubmittedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    Score = table.Column<decimal>(type: "TEXT", nullable: false),
                    TimeSpent = table.Column<int>(type: "INTEGER", nullable: false),
                    WorkflowState = table.Column<string>(type: "TEXT", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    QuizId1 = table.Column<Guid>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QuizAttempts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_QuizAttempts_Quizzes_QuizId",
                        column: x => x.QuizId,
                        principalTable: "Quizzes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_QuizAttempts_Quizzes_QuizId1",
                        column: x => x.QuizId1,
                        principalTable: "Quizzes",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "SCORMAttempts",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    SCORMPackageId = table.Column<Guid>(type: "TEXT", nullable: false),
                    StudentId = table.Column<string>(type: "TEXT", nullable: false),
                    AttemptNumber = table.Column<int>(type: "INTEGER", nullable: false),
                    Status = table.Column<int>(type: "INTEGER", nullable: false),
                    Score = table.Column<decimal>(type: "TEXT", nullable: true),
                    CompletionStatus = table.Column<string>(type: "TEXT", nullable: false),
                    SuccessStatus = table.Column<string>(type: "TEXT", nullable: false),
                    TimeSpent = table.Column<int>(type: "INTEGER", nullable: false),
                    SuspendData = table.Column<string>(type: "TEXT", nullable: false),
                    StartedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    LastAccessed = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SCORMAttempts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SCORMAttempts_SCORMPackages_SCORMPackageId",
                        column: x => x.SCORMPackageId,
                        principalTable: "SCORMPackages",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Grades",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    AssignmentId = table.Column<Guid>(type: "TEXT", nullable: false),
                    StudentId = table.Column<string>(type: "TEXT", nullable: false),
                    SubmissionId = table.Column<Guid>(type: "TEXT", nullable: true),
                    Points = table.Column<decimal>(type: "TEXT", nullable: false),
                    PercentageScore = table.Column<decimal>(type: "TEXT", nullable: true),
                    LetterGrade = table.Column<string>(type: "TEXT", nullable: false),
                    Status = table.Column<int>(type: "INTEGER", nullable: false),
                    Comments = table.Column<string>(type: "TEXT", nullable: false),
                    ExcusedFromGrading = table.Column<bool>(type: "INTEGER", nullable: false),
                    GradedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    GradedBy = table.Column<string>(type: "TEXT", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Grades", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Grades_Assignments_AssignmentId",
                        column: x => x.AssignmentId,
                        principalTable: "Assignments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Grades_Submissions_SubmissionId",
                        column: x => x.SubmissionId,
                        principalTable: "Submissions",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "SubmissionComments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    SubmissionId = table.Column<Guid>(type: "TEXT", nullable: false),
                    AuthorId = table.Column<string>(type: "TEXT", nullable: false),
                    Comment = table.Column<string>(type: "TEXT", maxLength: 2000, nullable: false),
                    AttachmentUrls = table.Column<string>(type: "TEXT", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SubmissionComments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SubmissionComments_Submissions_SubmissionId",
                        column: x => x.SubmissionId,
                        principalTable: "Submissions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PostRatings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    PostId = table.Column<Guid>(type: "TEXT", nullable: false),
                    UserId = table.Column<string>(type: "TEXT", nullable: false),
                    Rating = table.Column<int>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PostRatings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PostRatings_DiscussionPosts_PostId",
                        column: x => x.PostId,
                        principalTable: "DiscussionPosts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "QuestionResponses",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    QuizAttemptId = table.Column<Guid>(type: "TEXT", nullable: false),
                    QuestionId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Response = table.Column<string>(type: "TEXT", nullable: false),
                    IsCorrect = table.Column<bool>(type: "INTEGER", nullable: false),
                    Points = table.Column<decimal>(type: "TEXT", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QuestionResponses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_QuestionResponses_Questions_QuestionId",
                        column: x => x.QuestionId,
                        principalTable: "Questions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_QuestionResponses_QuizAttempts_QuizAttemptId",
                        column: x => x.QuizAttemptId,
                        principalTable: "QuizAttempts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SCORMInteractions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    SCORMAttemptId = table.Column<Guid>(type: "TEXT", nullable: false),
                    InteractionId = table.Column<string>(type: "TEXT", nullable: false),
                    Type = table.Column<string>(type: "TEXT", nullable: false),
                    StudentResponse = table.Column<string>(type: "TEXT", nullable: false),
                    CorrectResponse = table.Column<string>(type: "TEXT", nullable: false),
                    Result = table.Column<string>(type: "TEXT", nullable: false),
                    Weighting = table.Column<decimal>(type: "TEXT", nullable: true),
                    Latency = table.Column<int>(type: "INTEGER", nullable: true),
                    Timestamp = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SCORMInteractions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SCORMInteractions_SCORMAttempts_SCORMAttemptId",
                        column: x => x.SCORMAttemptId,
                        principalTable: "SCORMAttempts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RubricAssessments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    GradeId = table.Column<Guid>(type: "TEXT", nullable: false),
                    RubricCriterionId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Points = table.Column<decimal>(type: "TEXT", nullable: false),
                    Comments = table.Column<string>(type: "TEXT", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RubricAssessments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RubricAssessments_Grades_GradeId",
                        column: x => x.GradeId,
                        principalTable: "Grades",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RubricAssessments_RubricCriteria_RubricCriterionId",
                        column: x => x.RubricCriterionId,
                        principalTable: "RubricCriteria",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AnnouncementComments_AnnouncementId",
                table: "AnnouncementComments",
                column: "AnnouncementId");

            migrationBuilder.CreateIndex(
                name: "IX_Announcements_CourseId",
                table: "Announcements",
                column: "CourseId");

            migrationBuilder.CreateIndex(
                name: "IX_Assignments_CourseId",
                table: "Assignments",
                column: "CourseId");

            migrationBuilder.CreateIndex(
                name: "IX_Assignments_RubricId",
                table: "Assignments",
                column: "RubricId");

            migrationBuilder.CreateIndex(
                name: "IX_ConferenceParticipants_ConferenceId",
                table: "ConferenceParticipants",
                column: "ConferenceId");

            migrationBuilder.CreateIndex(
                name: "IX_ConferenceRecordings_ConferenceId",
                table: "ConferenceRecordings",
                column: "ConferenceId");

            migrationBuilder.CreateIndex(
                name: "IX_Conferences_CourseId",
                table: "Conferences",
                column: "CourseId");

            migrationBuilder.CreateIndex(
                name: "IX_CourseEnrollments_CourseId",
                table: "CourseEnrollments",
                column: "CourseId");

            migrationBuilder.CreateIndex(
                name: "IX_CourseModules_CourseId",
                table: "CourseModules",
                column: "CourseId");

            migrationBuilder.CreateIndex(
                name: "IX_Courses_TemplateId",
                table: "Courses",
                column: "TemplateId");

            migrationBuilder.CreateIndex(
                name: "IX_DiscussionPosts_DiscussionId",
                table: "DiscussionPosts",
                column: "DiscussionId");

            migrationBuilder.CreateIndex(
                name: "IX_DiscussionPosts_ParentPostId",
                table: "DiscussionPosts",
                column: "ParentPostId");

            migrationBuilder.CreateIndex(
                name: "IX_Discussions_CourseId",
                table: "Discussions",
                column: "CourseId");

            migrationBuilder.CreateIndex(
                name: "IX_Grades_AssignmentId",
                table: "Grades",
                column: "AssignmentId");

            migrationBuilder.CreateIndex(
                name: "IX_Grades_SubmissionId",
                table: "Grades",
                column: "SubmissionId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_LTILaunches_LTIToolId",
                table: "LTILaunches",
                column: "LTIToolId");

            migrationBuilder.CreateIndex(
                name: "IX_ModuleItems_ModuleId",
                table: "ModuleItems",
                column: "ModuleId");

            migrationBuilder.CreateIndex(
                name: "IX_OutcomeAlignments_AssignmentId",
                table: "OutcomeAlignments",
                column: "AssignmentId");

            migrationBuilder.CreateIndex(
                name: "IX_OutcomeAlignments_LearningOutcomeId",
                table: "OutcomeAlignments",
                column: "LearningOutcomeId");

            migrationBuilder.CreateIndex(
                name: "IX_OutcomeAlignments_LearningOutcomeId1",
                table: "OutcomeAlignments",
                column: "LearningOutcomeId1");

            migrationBuilder.CreateIndex(
                name: "IX_OutcomeAlignments_QuizId",
                table: "OutcomeAlignments",
                column: "QuizId");

            migrationBuilder.CreateIndex(
                name: "IX_OutcomeResults_LearningOutcomeId",
                table: "OutcomeResults",
                column: "LearningOutcomeId");

            migrationBuilder.CreateIndex(
                name: "IX_PostRatings_PostId",
                table: "PostRatings",
                column: "PostId");

            migrationBuilder.CreateIndex(
                name: "IX_QuestionResponses_QuestionId",
                table: "QuestionResponses",
                column: "QuestionId");

            migrationBuilder.CreateIndex(
                name: "IX_QuestionResponses_QuizAttemptId",
                table: "QuestionResponses",
                column: "QuizAttemptId");

            migrationBuilder.CreateIndex(
                name: "IX_Questions_LearningOutcomeId",
                table: "Questions",
                column: "LearningOutcomeId");

            migrationBuilder.CreateIndex(
                name: "IX_Questions_QuizId",
                table: "Questions",
                column: "QuizId");

            migrationBuilder.CreateIndex(
                name: "IX_QuizAttempts_QuizId",
                table: "QuizAttempts",
                column: "QuizId");

            migrationBuilder.CreateIndex(
                name: "IX_QuizAttempts_QuizId1",
                table: "QuizAttempts",
                column: "QuizId1");

            migrationBuilder.CreateIndex(
                name: "IX_Quizzes_CourseId",
                table: "Quizzes",
                column: "CourseId");

            migrationBuilder.CreateIndex(
                name: "IX_RubricAssessments_GradeId",
                table: "RubricAssessments",
                column: "GradeId");

            migrationBuilder.CreateIndex(
                name: "IX_RubricAssessments_RubricCriterionId",
                table: "RubricAssessments",
                column: "RubricCriterionId");

            migrationBuilder.CreateIndex(
                name: "IX_RubricCriteria_LearningOutcomeId",
                table: "RubricCriteria",
                column: "LearningOutcomeId");

            migrationBuilder.CreateIndex(
                name: "IX_RubricCriteria_RubricId",
                table: "RubricCriteria",
                column: "RubricId");

            migrationBuilder.CreateIndex(
                name: "IX_RubricLevels_RubricCriterionId",
                table: "RubricLevels",
                column: "RubricCriterionId");

            migrationBuilder.CreateIndex(
                name: "IX_SCORMAttempts_SCORMPackageId",
                table: "SCORMAttempts",
                column: "SCORMPackageId");

            migrationBuilder.CreateIndex(
                name: "IX_SCORMInteractions_SCORMAttemptId",
                table: "SCORMInteractions",
                column: "SCORMAttemptId");

            migrationBuilder.CreateIndex(
                name: "IX_SCORMPackages_CourseId",
                table: "SCORMPackages",
                column: "CourseId");

            migrationBuilder.CreateIndex(
                name: "IX_SubmissionComments_SubmissionId",
                table: "SubmissionComments",
                column: "SubmissionId");

            migrationBuilder.CreateIndex(
                name: "IX_Submissions_AssignmentId",
                table: "Submissions",
                column: "AssignmentId");

            migrationBuilder.CreateIndex(
                name: "IX_TemplateItems_TemplateModuleId",
                table: "TemplateItems",
                column: "TemplateModuleId");

            migrationBuilder.CreateIndex(
                name: "IX_TemplateModules_CourseTemplateId",
                table: "TemplateModules",
                column: "CourseTemplateId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AnnouncementComments");

            migrationBuilder.DropTable(
                name: "ConferenceParticipants");

            migrationBuilder.DropTable(
                name: "ConferenceRecordings");

            migrationBuilder.DropTable(
                name: "CourseEnrollments");

            migrationBuilder.DropTable(
                name: "LTILaunches");

            migrationBuilder.DropTable(
                name: "ModuleItems");

            migrationBuilder.DropTable(
                name: "OutcomeAlignments");

            migrationBuilder.DropTable(
                name: "OutcomeResults");

            migrationBuilder.DropTable(
                name: "PostRatings");

            migrationBuilder.DropTable(
                name: "QuestionResponses");

            migrationBuilder.DropTable(
                name: "RubricAssessments");

            migrationBuilder.DropTable(
                name: "RubricLevels");

            migrationBuilder.DropTable(
                name: "SCORMInteractions");

            migrationBuilder.DropTable(
                name: "SubmissionComments");

            migrationBuilder.DropTable(
                name: "TemplateItems");

            migrationBuilder.DropTable(
                name: "Announcements");

            migrationBuilder.DropTable(
                name: "Conferences");

            migrationBuilder.DropTable(
                name: "LTITools");

            migrationBuilder.DropTable(
                name: "CourseModules");

            migrationBuilder.DropTable(
                name: "DiscussionPosts");

            migrationBuilder.DropTable(
                name: "Questions");

            migrationBuilder.DropTable(
                name: "QuizAttempts");

            migrationBuilder.DropTable(
                name: "Grades");

            migrationBuilder.DropTable(
                name: "RubricCriteria");

            migrationBuilder.DropTable(
                name: "SCORMAttempts");

            migrationBuilder.DropTable(
                name: "TemplateModules");

            migrationBuilder.DropTable(
                name: "Discussions");

            migrationBuilder.DropTable(
                name: "Quizzes");

            migrationBuilder.DropTable(
                name: "Submissions");

            migrationBuilder.DropTable(
                name: "LearningOutcomes");

            migrationBuilder.DropTable(
                name: "SCORMPackages");

            migrationBuilder.DropTable(
                name: "Assignments");

            migrationBuilder.DropTable(
                name: "Courses");

            migrationBuilder.DropTable(
                name: "Rubrics");

            migrationBuilder.DropTable(
                name: "CourseTemplates");
        }
    }
}
