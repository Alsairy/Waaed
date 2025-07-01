using Microsoft.EntityFrameworkCore;
using Waaed.Discipline.Api.Entities;
using Waaed.Shared.Domain.Entities;

namespace Waaed.Discipline.Api.Data;

public class DisciplineDbContext : DbContext
{
    public DisciplineDbContext(DbContextOptions<DisciplineDbContext> options) : base(options)
    {
    }

    public DbSet<DisciplineIncident> DisciplineIncidents { get; set; }
    public DbSet<DisciplineAction> DisciplineActions { get; set; }
    public DbSet<DisciplineActionProgress> DisciplineActionProgress { get; set; }
    public DbSet<DisciplineHearing> DisciplineHearings { get; set; }
    public DbSet<DisciplineAppeal> DisciplineAppeals { get; set; }
    public DbSet<DisciplinePolicy> DisciplinePolicies { get; set; }
    public DbSet<DisciplinePolicyViolation> DisciplinePolicyViolations { get; set; }
    public DbSet<StudentBehaviorRecord> StudentBehaviorRecords { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<DisciplineIncident>(entity =>
        {
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");
        });

        modelBuilder.Entity<DisciplineAction>(entity =>
        {
            entity.HasOne(da => da.Incident)
                .WithMany(di => di.DisciplineActions)
                .HasForeignKey(da => da.IncidentId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");
        });

        modelBuilder.Entity<DisciplineActionProgress>(entity =>
        {
            entity.HasOne(dap => dap.Action)
                .WithMany(da => da.ActionProgress)
                .HasForeignKey(dap => dap.ActionId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");
        });

        modelBuilder.Entity<DisciplineHearing>(entity =>
        {
            entity.HasOne(dh => dh.Incident)
                .WithMany(di => di.DisciplineHearings)
                .HasForeignKey(dh => dh.IncidentId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");
        });

        modelBuilder.Entity<DisciplineAppeal>(entity =>
        {
            entity.HasOne(da => da.Incident)
                .WithMany(di => di.DisciplineAppeals)
                .HasForeignKey(da => da.IncidentId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(da => da.Action)
                .WithMany()
                .HasForeignKey(da => da.ActionId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(da => da.Hearing)
                .WithMany()
                .HasForeignKey(da => da.HearingId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");
        });

        modelBuilder.Entity<DisciplinePolicy>(entity =>
        {
            entity.HasIndex(e => e.PolicyCode).IsUnique();
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");
        });

        modelBuilder.Entity<DisciplinePolicyViolation>(entity =>
        {
            entity.HasOne(dpv => dpv.Incident)
                .WithMany()
                .HasForeignKey(dpv => dpv.IncidentId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(dpv => dpv.Policy)
                .WithMany(dp => dp.PolicyViolations)
                .HasForeignKey(dpv => dpv.PolicyId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");
        });

        modelBuilder.Entity<StudentBehaviorRecord>(entity =>
        {
            entity.HasOne(sbr => sbr.RelatedIncident)
                .WithMany()
                .HasForeignKey(sbr => sbr.RelatedIncidentId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");
        });
    }
}
