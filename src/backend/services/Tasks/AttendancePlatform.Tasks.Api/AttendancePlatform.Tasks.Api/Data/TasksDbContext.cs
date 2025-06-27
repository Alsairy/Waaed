using Microsoft.EntityFrameworkCore;
using AttendancePlatform.Tasks.Api.Entities;

namespace AttendancePlatform.Tasks.Api.Data;

public class TasksDbContext : DbContext
{
    public TasksDbContext(DbContextOptions<TasksDbContext> options) : base(options)
    {
    }

    public DbSet<Entities.Task> Tasks { get; set; }
    public DbSet<TaskComment> TaskComments { get; set; }
    public DbSet<TaskAttachment> TaskAttachments { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Entities.Task>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Description).IsRequired();
            entity.Property(e => e.Status).IsRequired().HasMaxLength(20);
            entity.Property(e => e.Priority).IsRequired().HasMaxLength(20);
            entity.Property(e => e.Category).HasMaxLength(20);
            entity.Property(e => e.Tags).HasMaxLength(500);
            entity.Property(e => e.Notes).HasMaxLength(1000);
            entity.Property(e => e.RecurrencePattern).HasMaxLength(50);
            entity.Property(e => e.AssignedByName).HasMaxLength(100);
            entity.Property(e => e.AssignedToName).HasMaxLength(100);
            entity.Property(e => e.AssignedByRole).HasMaxLength(100);
            entity.Property(e => e.AssignedToRole).HasMaxLength(100);
            entity.Property(e => e.CreatedAt).IsRequired();
            
            entity.HasOne(e => e.ParentTask)
                .WithMany(e => e.SubTasks)
                .HasForeignKey(e => e.ParentTaskId)
                .OnDelete(DeleteBehavior.Restrict);
                
            entity.HasMany(e => e.Comments)
                .WithOne(e => e.Task)
                .HasForeignKey(e => e.TaskId)
                .OnDelete(DeleteBehavior.Cascade);
                
            entity.HasMany(e => e.Attachments)
                .WithOne(e => e.Task)
                .HasForeignKey(e => e.TaskId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<TaskComment>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Content).IsRequired().HasMaxLength(1000);
            entity.Property(e => e.CommenterName).HasMaxLength(100);
            entity.Property(e => e.CommenterRole).HasMaxLength(100);
            entity.Property(e => e.CommentType).HasMaxLength(20);
            entity.Property(e => e.CreatedAt).IsRequired();
        });

        modelBuilder.Entity<TaskAttachment>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.FileName).IsRequired().HasMaxLength(255);
            entity.Property(e => e.FilePath).IsRequired().HasMaxLength(500);
            entity.Property(e => e.FileType).HasMaxLength(100);
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.Property(e => e.UploadedByName).HasMaxLength(100);
            entity.Property(e => e.UploadedByRole).HasMaxLength(100);
            entity.Property(e => e.UploadedAt).IsRequired();
        });
    }
}
