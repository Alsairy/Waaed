using Microsoft.EntityFrameworkCore;
using AttendancePlatform.Polls.Api.Entities;

namespace AttendancePlatform.Polls.Api.Data;

public class PollsDbContext : DbContext
{
    public PollsDbContext(DbContextOptions<PollsDbContext> options) : base(options)
    {
    }

    public DbSet<Poll> Polls { get; set; }
    public DbSet<PollOption> PollOptions { get; set; }
    public DbSet<PollVote> PollVotes { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Poll>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Description).HasMaxLength(1000);
            entity.Property(e => e.Status).IsRequired().HasMaxLength(20);
            entity.Property(e => e.TargetAudience).HasMaxLength(100);
            entity.Property(e => e.CreatedAt).IsRequired();
            
            entity.HasMany(e => e.Options)
                .WithOne(e => e.Poll)
                .HasForeignKey(e => e.PollId)
                .OnDelete(DeleteBehavior.Cascade);
                
            entity.HasMany(e => e.Votes)
                .WithOne(e => e.Poll)
                .HasForeignKey(e => e.PollId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<PollOption>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.OptionText).IsRequired().HasMaxLength(300);
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.Property(e => e.CreatedAt).IsRequired();
            
            entity.HasMany(e => e.Votes)
                .WithOne(e => e.PollOption)
                .HasForeignKey(e => e.PollOptionId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<PollVote>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.UserRole).HasMaxLength(100);
            entity.Property(e => e.IpAddress).HasMaxLength(45);
            entity.Property(e => e.UserAgent).HasMaxLength(500);
            entity.Property(e => e.SessionId).HasMaxLength(100);
            entity.Property(e => e.VotedAt).IsRequired();
            
            entity.HasIndex(e => new { e.PollId, e.UserId })
                .IsUnique()
                .HasFilter("[UserId] IS NOT NULL");
        });
    }
}
