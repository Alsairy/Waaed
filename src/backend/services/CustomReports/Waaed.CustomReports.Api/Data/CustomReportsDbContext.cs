using Microsoft.EntityFrameworkCore;
using Waaed.CustomReports.Api.Entities;
using Waaed.Shared.Domain.Entities;

namespace Waaed.CustomReports.Api.Data;

public class CustomReportsDbContext : DbContext
{
    public CustomReportsDbContext(DbContextOptions<CustomReportsDbContext> options) : base(options)
    {
    }

    public DbSet<ReportTemplate> ReportTemplates { get; set; }
    public DbSet<ReportExecution> ReportExecutions { get; set; }
    public DbSet<ReportSchedule> ReportSchedules { get; set; }
    public DbSet<ReportShare> ReportShares { get; set; }
    public DbSet<ReportDataSource> ReportDataSources { get; set; }
    public DbSet<ReportDataSourceField> ReportDataSourceFields { get; set; }
    public DbSet<ReportDashboard> ReportDashboards { get; set; }
    public DbSet<ReportDashboardWidget> ReportDashboardWidgets { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<ReportTemplate>(entity =>
        {
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");
        });

        modelBuilder.Entity<ReportExecution>(entity =>
        {
            entity.HasOne(re => re.ReportTemplate)
                .WithMany(rt => rt.ReportExecutions)
                .HasForeignKey(re => re.ReportTemplateId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(re => re.ReportSchedule)
                .WithMany(rs => rs.ReportExecutions)
                .HasForeignKey(re => re.ScheduleId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");
        });

        modelBuilder.Entity<ReportSchedule>(entity =>
        {
            entity.HasOne(rs => rs.ReportTemplate)
                .WithMany(rt => rt.ReportSchedules)
                .HasForeignKey(rs => rs.ReportTemplateId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");
        });

        modelBuilder.Entity<ReportShare>(entity =>
        {
            entity.HasOne(rs => rs.ReportTemplate)
                .WithMany(rt => rt.ReportShares)
                .HasForeignKey(rs => rs.ReportTemplateId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");
        });

        modelBuilder.Entity<ReportDataSource>(entity =>
        {
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");
        });

        modelBuilder.Entity<ReportDataSourceField>(entity =>
        {
            entity.HasOne(rdsf => rdsf.DataSource)
                .WithMany(rds => rds.DataSourceFields)
                .HasForeignKey(rdsf => rdsf.DataSourceId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");
        });

        modelBuilder.Entity<ReportDashboard>(entity =>
        {
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");
        });

        modelBuilder.Entity<ReportDashboardWidget>(entity =>
        {
            entity.HasOne(rdw => rdw.Dashboard)
                .WithMany(rd => rd.DashboardWidgets)
                .HasForeignKey(rdw => rdw.DashboardId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(rdw => rdw.ReportTemplate)
                .WithMany()
                .HasForeignKey(rdw => rdw.ReportTemplateId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");
        });
    }
}
