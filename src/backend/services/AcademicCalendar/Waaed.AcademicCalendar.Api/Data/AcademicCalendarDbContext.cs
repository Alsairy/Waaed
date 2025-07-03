using Microsoft.EntityFrameworkCore;
using Waaed.AcademicCalendar.Api.Entities;
using Waaed.Shared.Infrastructure.Data;

namespace Waaed.AcademicCalendar.Api.Data
{
    public class AcademicCalendarDbContext : BaseDbContext
    {
        public AcademicCalendarDbContext(DbContextOptions<AcademicCalendarDbContext> options) : base(options)
        {
        }

        public DbSet<AcademicYear> AcademicYears { get; set; }
        public DbSet<Semester> Semesters { get; set; }
        public DbSet<AcademicEvent> AcademicEvents { get; set; }
        public DbSet<Holiday> Holidays { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<AcademicYear>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
                entity.Property(e => e.StartDate).IsRequired();
                entity.Property(e => e.EndDate).IsRequired();
                entity.Property(e => e.TenantId).IsRequired();
                entity.HasIndex(e => new { e.TenantId, e.Name }).IsUnique();
                entity.HasIndex(e => e.TenantId);
            });

            modelBuilder.Entity<Semester>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Type).IsRequired();
                entity.Property(e => e.StartDate).IsRequired();
                entity.Property(e => e.EndDate).IsRequired();
                entity.Property(e => e.AcademicYearId).IsRequired();
                entity.Property(e => e.TenantId).IsRequired();
                
                entity.HasOne(e => e.AcademicYear)
                    .WithMany(ay => ay.Semesters)
                    .HasForeignKey(e => e.AcademicYearId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => new { e.TenantId, e.AcademicYearId, e.Name }).IsUnique();
                entity.HasIndex(e => e.TenantId);
            });

            modelBuilder.Entity<AcademicEvent>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
                entity.Property(e => e.StartDate).IsRequired();
                entity.Property(e => e.Type).IsRequired();
                entity.Property(e => e.Priority).IsRequired();
                entity.Property(e => e.TenantId).IsRequired();
                entity.Property(e => e.CreatedBy).IsRequired();

                entity.HasOne(e => e.AcademicYear)
                    .WithMany(ay => ay.AcademicEvents)
                    .HasForeignKey(e => e.AcademicYearId)
                    .OnDelete(DeleteBehavior.SetNull);

                entity.HasOne(e => e.Semester)
                    .WithMany(s => s.AcademicEvents)
                    .HasForeignKey(e => e.SemesterId)
                    .OnDelete(DeleteBehavior.SetNull);

                entity.HasIndex(e => e.TenantId);
                entity.HasIndex(e => e.StartDate);
                entity.HasIndex(e => e.Type);
            });

            modelBuilder.Entity<Holiday>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Date).IsRequired();
                entity.Property(e => e.Type).IsRequired();
                entity.Property(e => e.TenantId).IsRequired();

                entity.HasOne(e => e.AcademicYear)
                    .WithMany(ay => ay.Holidays)
                    .HasForeignKey(e => e.AcademicYearId)
                    .OnDelete(DeleteBehavior.SetNull);

                entity.HasIndex(e => e.TenantId);
                entity.HasIndex(e => e.Date);
                entity.HasIndex(e => e.Type);
            });
        }
    }
}
