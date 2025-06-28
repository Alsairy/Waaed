using Microsoft.EntityFrameworkCore;
using Waaed.Shared.Domain.Entities;
using Waaed.Alumni.Api.Entities;
using AlumniEntity = Waaed.Alumni.Api.Entities.Alumni;

namespace Waaed.Alumni.Api.Data;

public class AlumniDbContext : DbContext
{
    public AlumniDbContext(DbContextOptions<AlumniDbContext> options) : base(options)
    {
    }

    public DbSet<AlumniEntity> Alumni { get; set; }
    public DbSet<AlumniEvent> AlumniEvents { get; set; }
    public DbSet<AlumniEventRegistration> AlumniEventRegistrations { get; set; }
    public DbSet<AlumniDonation> AlumniDonations { get; set; }
    public DbSet<AlumniJobPosting> AlumniJobPostings { get; set; }
    public DbSet<AlumniJobApplication> AlumniJobApplications { get; set; }
    public DbSet<AlumniMentorship> AlumniMentorships { get; set; }
    public DbSet<AlumniMentorshipSession> AlumniMentorshipSessions { get; set; }
    public DbSet<AlumniAchievement> AlumniAchievements { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<AlumniEntity>(entity =>
        {
            entity.HasIndex(e => e.Email).IsUnique();
            entity.HasIndex(e => e.StudentId).IsUnique();
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");
        });

        modelBuilder.Entity<AlumniEvent>(entity =>
        {
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");
        });

        modelBuilder.Entity<AlumniEventRegistration>(entity =>
        {
            entity.HasOne(e => e.Alumni)
                .WithMany(a => a.AlumniEventRegistrations)
                .HasForeignKey(e => e.AlumniId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Event)
                .WithMany(ev => ev.EventRegistrations)
                .HasForeignKey(e => e.EventId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");
        });

        modelBuilder.Entity<AlumniDonation>(entity =>
        {
            entity.HasOne(d => d.Alumni)
                .WithMany(a => a.AlumniDonations)
                .HasForeignKey(d => d.AlumniId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");
        });

        modelBuilder.Entity<AlumniJobPosting>(entity =>
        {
            entity.HasOne(j => j.PostedByAlumni)
                .WithMany(a => a.AlumniJobPostings)
                .HasForeignKey(j => j.PostedByAlumniId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");
        });

        modelBuilder.Entity<AlumniJobApplication>(entity =>
        {
            entity.HasOne(ja => ja.JobPosting)
                .WithMany(jp => jp.JobApplications)
                .HasForeignKey(ja => ja.JobPostingId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(ja => ja.ApplicantAlumni)
                .WithMany()
                .HasForeignKey(ja => ja.ApplicantAlumniId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");
        });

        modelBuilder.Entity<AlumniMentorship>(entity =>
        {
            entity.HasOne(m => m.MentorAlumni)
                .WithMany(a => a.MentorshipAsMentor)
                .HasForeignKey(m => m.MentorAlumniId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(m => m.MenteeAlumni)
                .WithMany(a => a.MentorshipAsMentee)
                .HasForeignKey(m => m.MenteeAlumniId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");
        });

        modelBuilder.Entity<AlumniMentorshipSession>(entity =>
        {
            entity.HasOne(s => s.Mentorship)
                .WithMany(m => m.MentorshipSessions)
                .HasForeignKey(s => s.MentorshipId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");
        });

        modelBuilder.Entity<AlumniAchievement>(entity =>
        {
            entity.HasOne(a => a.Alumni)
                .WithMany(al => al.AlumniAchievements)
                .HasForeignKey(a => a.AlumniId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");
        });
    }
}
