using Microsoft.EntityFrameworkCore;
using AttendancePlatform.HR.Api.Entities;

namespace AttendancePlatform.HR.Api.Data;

public class HRDbContext : DbContext
{
    public HRDbContext(DbContextOptions<HRDbContext> options) : base(options)
    {
    }

    public DbSet<Employee> Employees { get; set; }
    public DbSet<Department> Departments { get; set; }
    public DbSet<Position> Positions { get; set; }
    public DbSet<LeaveRequest> LeaveRequests { get; set; }
    public DbSet<PerformanceReview> PerformanceReviews { get; set; }
    public DbSet<Recruitment> Recruitments { get; set; }
    public DbSet<JobApplication> JobApplications { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Employee>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.EmployeeId).IsUnique();
            entity.HasIndex(e => e.Email).IsUnique();
            entity.Property(e => e.EmployeeId).IsRequired().HasMaxLength(50);
            entity.Property(e => e.FirstName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.LastName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Phone).HasMaxLength(15);
            entity.Property(e => e.Address).HasMaxLength(500);
            entity.Property(e => e.Gender).IsRequired().HasMaxLength(10);
            entity.Property(e => e.MaritalStatus).HasMaxLength(20);
            entity.Property(e => e.Nationality).HasMaxLength(50);
            entity.Property(e => e.NationalId).HasMaxLength(50);
            entity.Property(e => e.PassportNumber).HasMaxLength(50);
            entity.Property(e => e.EmploymentStatus).IsRequired().HasMaxLength(20).HasDefaultValue("Active");
            entity.Property(e => e.EmploymentType).IsRequired().HasMaxLength(20).HasDefaultValue("Full-Time");
            entity.Property(e => e.BasicSalary).HasColumnType("decimal(18,2)");
            entity.Property(e => e.PayrollFrequency).HasMaxLength(20);
            entity.Property(e => e.BankAccount).HasMaxLength(50);
            entity.Property(e => e.BankName).HasMaxLength(100);
            entity.Property(e => e.TaxId).HasMaxLength(20);
            entity.Property(e => e.SocialSecurityNumber).HasMaxLength(20);
            entity.Property(e => e.EmergencyContactName).HasMaxLength(500);
            entity.Property(e => e.EmergencyContactPhone).HasMaxLength(15);
            entity.Property(e => e.EmergencyContactRelation).HasMaxLength(100);
            entity.Property(e => e.ProfilePicturePath).HasMaxLength(500);
            entity.Property(e => e.Notes).HasMaxLength(1000);
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.HasOne(e => e.Department)
                  .WithMany(d => d.Employees)
                  .HasForeignKey(e => e.DepartmentId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Position)
                  .WithMany(p => p.Employees)
                  .HasForeignKey(e => e.PositionId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Manager)
                  .WithMany(e => e.Subordinates)
                  .HasForeignKey(e => e.ManagerId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasMany(e => e.LeaveRequests)
                  .WithOne(lr => lr.Employee)
                  .HasForeignKey(lr => lr.EmployeeId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(e => e.PerformanceReviews)
                  .WithOne(pr => pr.Employee)
                  .HasForeignKey(pr => pr.EmployeeId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(e => e.ConductedReviews)
                  .WithOne(pr => pr.Reviewer)
                  .HasForeignKey(pr => pr.ReviewerId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Department>(entity =>
        {
            entity.HasKey(d => d.Id);
            entity.HasIndex(d => d.Code).IsUnique();
            entity.Property(d => d.Name).IsRequired().HasMaxLength(100);
            entity.Property(d => d.Description).HasMaxLength(500);
            entity.Property(d => d.Code).IsRequired().HasMaxLength(20);
            entity.Property(d => d.Location).HasMaxLength(500);
            entity.Property(d => d.Phone).HasMaxLength(15);
            entity.Property(d => d.Email).HasMaxLength(200);
            entity.Property(d => d.Budget).HasColumnType("decimal(18,2)");
            entity.Property(d => d.CostCenter).HasMaxLength(50);
            entity.Property(d => d.IsActive).HasDefaultValue(true);
            entity.Property(d => d.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            entity.Property(d => d.UpdatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.HasOne(d => d.ParentDepartment)
                  .WithMany(d => d.SubDepartments)
                  .HasForeignKey(d => d.ParentDepartmentId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(d => d.HeadOfDepartment)
                  .WithMany()
                  .HasForeignKey(d => d.HeadOfDepartmentId)
                  .OnDelete(DeleteBehavior.SetNull);

            entity.HasMany(d => d.Positions)
                  .WithOne(p => p.Department)
                  .HasForeignKey(p => p.DepartmentId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Position>(entity =>
        {
            entity.HasKey(p => p.Id);
            entity.HasIndex(p => p.Code).IsUnique();
            entity.Property(p => p.Title).IsRequired().HasMaxLength(100);
            entity.Property(p => p.Description).HasMaxLength(500);
            entity.Property(p => p.Code).IsRequired().HasMaxLength(20);
            entity.Property(p => p.Level).IsRequired().HasMaxLength(20);
            entity.Property(p => p.Grade).IsRequired().HasMaxLength(20);
            entity.Property(p => p.MinSalary).HasColumnType("decimal(18,2)");
            entity.Property(p => p.MaxSalary).HasColumnType("decimal(18,2)");
            entity.Property(p => p.Responsibilities).HasMaxLength(1000);
            entity.Property(p => p.Requirements).HasMaxLength(1000);
            entity.Property(p => p.Skills).HasMaxLength(1000);
            entity.Property(p => p.Qualifications).HasMaxLength(500);
            entity.Property(p => p.EmploymentType).IsRequired().HasMaxLength(20).HasDefaultValue("Full-Time");
            entity.Property(p => p.ReportsTo).HasMaxLength(500);
            entity.Property(p => p.IsActive).HasDefaultValue(true);
            entity.Property(p => p.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            entity.Property(p => p.UpdatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.HasMany(p => p.Recruitments)
                  .WithOne(r => r.Position)
                  .HasForeignKey(r => r.PositionId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<LeaveRequest>(entity =>
        {
            entity.HasKey(lr => lr.Id);
            entity.Property(lr => lr.LeaveType).IsRequired().HasMaxLength(20);
            entity.Property(lr => lr.Reason).HasMaxLength(1000);
            entity.Property(lr => lr.Status).IsRequired().HasMaxLength(20).HasDefaultValue("Pending");
            entity.Property(lr => lr.ApprovalComments).HasMaxLength(500);
            entity.Property(lr => lr.RejectionReason).HasMaxLength(500);
            entity.Property(lr => lr.AttachmentPath).HasMaxLength(500);
            entity.Property(lr => lr.ContactDuringLeave).HasMaxLength(15);
            entity.Property(lr => lr.HandoverNotes).HasMaxLength(500);
            entity.Property(lr => lr.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            entity.Property(lr => lr.UpdatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.HasOne(lr => lr.ApprovedBy)
                  .WithMany()
                  .HasForeignKey(lr => lr.ApprovedById)
                  .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<PerformanceReview>(entity =>
        {
            entity.HasKey(pr => pr.Id);
            entity.Property(pr => pr.ReviewPeriod).IsRequired().HasMaxLength(20);
            entity.Property(pr => pr.Status).IsRequired().HasMaxLength(20).HasDefaultValue("Draft");
            entity.Property(pr => pr.OverallRating).HasColumnType("decimal(3,2)");
            entity.Property(pr => pr.QualityOfWorkRating).HasColumnType("decimal(3,2)");
            entity.Property(pr => pr.ProductivityRating).HasColumnType("decimal(3,2)");
            entity.Property(pr => pr.CommunicationRating).HasColumnType("decimal(3,2)");
            entity.Property(pr => pr.TeamworkRating).HasColumnType("decimal(3,2)");
            entity.Property(pr => pr.LeadershipRating).HasColumnType("decimal(3,2)");
            entity.Property(pr => pr.InitiativeRating).HasColumnType("decimal(3,2)");
            entity.Property(pr => pr.ProblemSolvingRating).HasColumnType("decimal(3,2)");
            entity.Property(pr => pr.AdaptabilityRating).HasColumnType("decimal(3,2)");
            entity.Property(pr => pr.Achievements).HasMaxLength(2000);
            entity.Property(pr => pr.AreasOfImprovement).HasMaxLength(2000);
            entity.Property(pr => pr.Goals).HasMaxLength(2000);
            entity.Property(pr => pr.DevelopmentPlan).HasMaxLength(2000);
            entity.Property(pr => pr.EmployeeComments).HasMaxLength(2000);
            entity.Property(pr => pr.ReviewerComments).HasMaxLength(2000);
            entity.Property(pr => pr.HRComments).HasMaxLength(2000);
            entity.Property(pr => pr.TrainingRecommendations).HasMaxLength(500);
            entity.Property(pr => pr.SalaryIncrease).HasColumnType("decimal(18,2)");
            entity.Property(pr => pr.BonusRecommendation).HasColumnType("decimal(18,2)");
            entity.Property(pr => pr.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            entity.Property(pr => pr.UpdatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
        });

        modelBuilder.Entity<Recruitment>(entity =>
        {
            entity.HasKey(r => r.Id);
            entity.Property(r => r.JobTitle).IsRequired().HasMaxLength(100);
            entity.Property(r => r.JobCode).HasMaxLength(20);
            entity.Property(r => r.JobDescription).HasMaxLength(2000);
            entity.Property(r => r.Requirements).HasMaxLength(1000);
            entity.Property(r => r.Skills).HasMaxLength(1000);
            entity.Property(r => r.VacancyCount).HasDefaultValue(1);
            entity.Property(r => r.Priority).IsRequired().HasMaxLength(20).HasDefaultValue("Medium");
            entity.Property(r => r.Status).IsRequired().HasMaxLength(20).HasDefaultValue("Open");
            entity.Property(r => r.MinSalary).HasColumnType("decimal(18,2)");
            entity.Property(r => r.MaxSalary).HasColumnType("decimal(18,2)");
            entity.Property(r => r.EmploymentType).HasMaxLength(20);
            entity.Property(r => r.Location).HasMaxLength(500);
            entity.Property(r => r.Qualifications).HasMaxLength(500);
            entity.Property(r => r.Notes).HasMaxLength(1000);
            entity.Property(r => r.ExternalJobBoardUrls).HasMaxLength(500);
            entity.Property(r => r.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            entity.Property(r => r.UpdatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.HasOne(r => r.RequestedBy)
                  .WithMany()
                  .HasForeignKey(r => r.RequestedById)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(r => r.AssignedTo)
                  .WithMany()
                  .HasForeignKey(r => r.AssignedToId)
                  .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(r => r.Department)
                  .WithMany()
                  .HasForeignKey(r => r.DepartmentId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasMany(r => r.JobApplications)
                  .WithOne(ja => ja.Recruitment)
                  .HasForeignKey(ja => ja.RecruitmentId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<JobApplication>(entity =>
        {
            entity.HasKey(ja => ja.Id);
            entity.Property(ja => ja.FirstName).IsRequired().HasMaxLength(100);
            entity.Property(ja => ja.LastName).IsRequired().HasMaxLength(100);
            entity.Property(ja => ja.Email).IsRequired().HasMaxLength(200);
            entity.Property(ja => ja.Phone).HasMaxLength(15);
            entity.Property(ja => ja.Address).HasMaxLength(500);
            entity.Property(ja => ja.ResumePath).HasMaxLength(500);
            entity.Property(ja => ja.CoverLetterPath).HasMaxLength(500);
            entity.Property(ja => ja.CoverLetter).HasMaxLength(2000);
            entity.Property(ja => ja.Status).IsRequired().HasMaxLength(20).HasDefaultValue("Applied");
            entity.Property(ja => ja.CurrentCompany).HasMaxLength(500);
            entity.Property(ja => ja.CurrentPosition).HasMaxLength(100);
            entity.Property(ja => ja.ExpectedSalary).HasColumnType("decimal(18,2)");
            entity.Property(ja => ja.NoticePeriod).HasMaxLength(20);
            entity.Property(ja => ja.Skills).HasMaxLength(1000);
            entity.Property(ja => ja.Qualifications).HasMaxLength(500);
            entity.Property(ja => ja.InterviewType).HasMaxLength(20);
            entity.Property(ja => ja.InterviewNotes).HasMaxLength(1000);
            entity.Property(ja => ja.InterviewRating).HasColumnType("decimal(3,2)");
            entity.Property(ja => ja.RejectionReason).HasMaxLength(500);
            entity.Property(ja => ja.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            entity.Property(ja => ja.UpdatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.HasOne(ja => ja.InterviewedBy)
                  .WithMany()
                  .HasForeignKey(ja => ja.InterviewedById)
                  .OnDelete(DeleteBehavior.SetNull);
        });
    }
}
