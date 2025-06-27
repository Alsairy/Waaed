using Microsoft.EntityFrameworkCore;
using AttendancePlatform.LMS.Api.Entities;

namespace AttendancePlatform.LMS.Api.Data;

public class LMSDbContext : DbContext
{
    public LMSDbContext(DbContextOptions<LMSDbContext> options) : base(options) { }

    public DbSet<Course> Courses { get; set; }
    public DbSet<CourseModule> CourseModules { get; set; }
    public DbSet<ModuleItem> ModuleItems { get; set; }
    public DbSet<Assignment> Assignments { get; set; }
    public DbSet<Submission> Submissions { get; set; }
    public DbSet<SubmissionComment> SubmissionComments { get; set; }
    public DbSet<Grade> Grades { get; set; }
    public DbSet<Rubric> Rubrics { get; set; }
    public DbSet<RubricCriterion> RubricCriteria { get; set; }
    public DbSet<RubricLevel> RubricLevels { get; set; }
    public DbSet<RubricAssessment> RubricAssessments { get; set; }
    public DbSet<LearningOutcome> LearningOutcomes { get; set; }
    public DbSet<OutcomeAlignment> OutcomeAlignments { get; set; }
    public DbSet<OutcomeResult> OutcomeResults { get; set; }
    public DbSet<Quiz> Quizzes { get; set; }
    public DbSet<Question> Questions { get; set; }
    public DbSet<QuizAttempt> QuizAttempts { get; set; }
    public DbSet<QuestionResponse> QuestionResponses { get; set; }
    public DbSet<Discussion> Discussions { get; set; }
    public DbSet<DiscussionPost> DiscussionPosts { get; set; }
    public DbSet<PostRating> PostRatings { get; set; }
    public DbSet<Announcement> Announcements { get; set; }
    public DbSet<AnnouncementComment> AnnouncementComments { get; set; }
    public DbSet<CourseEnrollment> CourseEnrollments { get; set; }
    public DbSet<LTITool> LTITools { get; set; }
    public DbSet<LTILaunch> LTILaunches { get; set; }
    public DbSet<SCORMPackage> SCORMPackages { get; set; }
    public DbSet<SCORMAttempt> SCORMAttempts { get; set; }
    public DbSet<SCORMInteraction> SCORMInteractions { get; set; }
    public DbSet<Conference> Conferences { get; set; }
    public DbSet<ConferenceParticipant> ConferenceParticipants { get; set; }
    public DbSet<ConferenceRecording> ConferenceRecordings { get; set; }
    public DbSet<CourseTemplate> CourseTemplates { get; set; }
    public DbSet<TemplateModule> TemplateModules { get; set; }
    public DbSet<TemplateItem> TemplateItems { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Course>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Code).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Description).HasMaxLength(2000);
            entity.Property(e => e.Status).IsRequired();
            entity.Property(e => e.CreatedAt).IsRequired();
            entity.Property(e => e.UpdatedAt).IsRequired();
        });

        modelBuilder.Entity<CourseModule>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Description).HasMaxLength(2000);
            entity.Property(e => e.Position).IsRequired();
            entity.HasOne(e => e.Course)
                  .WithMany(c => c.Modules)
                  .HasForeignKey(e => e.CourseId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Assignment>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Description).HasMaxLength(2000);
            entity.Property(e => e.Points).IsRequired();
            entity.HasOne(e => e.Course)
                  .WithMany(c => c.Assignments)
                  .HasForeignKey(e => e.CourseId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Submission>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.Assignment)
                  .WithMany(a => a.Submissions)
                  .HasForeignKey(e => e.AssignmentId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Grade>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Points).IsRequired();
            entity.HasOne(e => e.Assignment)
                  .WithMany()
                  .HasForeignKey(e => e.AssignmentId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Rubric>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Description).HasMaxLength(2000);
        });

        modelBuilder.Entity<RubricCriterion>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Description).IsRequired().HasMaxLength(500);
            entity.Property(e => e.Points).IsRequired();
            entity.HasOne(e => e.Rubric)
                  .WithMany(r => r.Criteria)
                  .HasForeignKey(e => e.RubricId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<LearningOutcome>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Description).HasMaxLength(1000);
        });

        modelBuilder.Entity<OutcomeAlignment>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.LearningOutcome)
                  .WithMany()
                  .HasForeignKey(e => e.LearningOutcomeId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Quiz>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Description).HasMaxLength(2000);
            entity.HasOne(e => e.Course)
                  .WithMany(c => c.Quizzes)
                  .HasForeignKey(e => e.CourseId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Question>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Text).IsRequired().HasMaxLength(2000);
            entity.Property(e => e.Type).IsRequired();
            entity.HasOne(e => e.Quiz)
                  .WithMany(q => q.Questions)
                  .HasForeignKey(e => e.QuizId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<QuizAttempt>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.Quiz)
                  .WithMany()
                  .HasForeignKey(e => e.QuizId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Discussion>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Description).HasMaxLength(2000);
            entity.HasOne(e => e.Course)
                  .WithMany(c => c.Discussions)
                  .HasForeignKey(e => e.CourseId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<DiscussionPost>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Content).IsRequired().HasMaxLength(5000);
            entity.HasOne(e => e.Discussion)
                  .WithMany(d => d.Posts)
                  .HasForeignKey(e => e.DiscussionId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Announcement>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Content).IsRequired().HasMaxLength(5000);
            entity.HasOne(e => e.Course)
                  .WithMany(c => c.Announcements)
                  .HasForeignKey(e => e.CourseId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<CourseEnrollment>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Role).IsRequired();
            entity.Property(e => e.Status).IsRequired();
            entity.HasOne(e => e.Course)
                  .WithMany(c => c.Enrollments)
                  .HasForeignKey(e => e.CourseId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<LTITool>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.LaunchUrl).IsRequired().HasMaxLength(500);
        });

        modelBuilder.Entity<SCORMPackage>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            entity.Property(e => e.FilePath).IsRequired().HasMaxLength(500);
            entity.HasOne(e => e.Course)
                  .WithMany()
                  .HasForeignKey(e => e.CourseId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Conference>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Description).HasMaxLength(1000);
            entity.HasOne(e => e.Course)
                  .WithMany()
                  .HasForeignKey(e => e.CourseId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<CourseTemplate>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Description).HasMaxLength(1000);
        });

        modelBuilder.Entity<ModuleItem>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            entity.HasOne(e => e.Module)
                  .WithMany(m => m.Items)
                  .HasForeignKey(e => e.ModuleId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<SubmissionComment>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Comment).IsRequired().HasMaxLength(2000);
            entity.HasOne(e => e.Submission)
                  .WithMany(s => s.Comments)
                  .HasForeignKey(e => e.SubmissionId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<RubricLevel>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Description).IsRequired().HasMaxLength(500);
            entity.HasOne(e => e.RubricCriterion)
                  .WithMany(rc => rc.Levels)
                  .HasForeignKey(e => e.RubricCriterionId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<RubricAssessment>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.Grade)
                  .WithMany(g => g.RubricAssessments)
                  .HasForeignKey(e => e.GradeId)
                  .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.RubricCriterion)
                  .WithMany(rc => rc.Assessments)
                  .HasForeignKey(e => e.RubricCriterionId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<OutcomeResult>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.LearningOutcome)
                  .WithMany(lo => lo.Results)
                  .HasForeignKey(e => e.LearningOutcomeId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<QuestionResponse>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.QuizAttempt)
                  .WithMany(qa => qa.Responses)
                  .HasForeignKey(e => e.QuizAttemptId)
                  .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.Question)
                  .WithMany(q => q.Responses)
                  .HasForeignKey(e => e.QuestionId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<PostRating>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.Post)
                  .WithMany(p => p.Ratings)
                  .HasForeignKey(e => e.PostId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<AnnouncementComment>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Content).IsRequired().HasMaxLength(2000);
            entity.HasOne(e => e.Announcement)
                  .WithMany(a => a.Comments)
                  .HasForeignKey(e => e.AnnouncementId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<LTILaunch>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.LTITool)
                  .WithMany(lt => lt.Launches)
                  .HasForeignKey(e => e.LTIToolId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<SCORMAttempt>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.SCORMPackage)
                  .WithMany(sp => sp.Attempts)
                  .HasForeignKey(e => e.SCORMPackageId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<SCORMInteraction>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.SCORMAttempt)
                  .WithMany(sa => sa.Interactions)
                  .HasForeignKey(e => e.SCORMAttemptId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<ConferenceParticipant>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.Conference)
                  .WithMany(c => c.Participants)
                  .HasForeignKey(e => e.ConferenceId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<ConferenceRecording>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            entity.HasOne(e => e.Conference)
                  .WithMany(c => c.Recordings)
                  .HasForeignKey(e => e.ConferenceId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<TemplateModule>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            entity.HasOne(e => e.CourseTemplate)
                  .WithMany(ct => ct.Modules)
                  .HasForeignKey(e => e.CourseTemplateId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<TemplateItem>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            entity.HasOne(e => e.TemplateModule)
                  .WithMany(tm => tm.Items)
                  .HasForeignKey(e => e.TemplateModuleId)
                  .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
