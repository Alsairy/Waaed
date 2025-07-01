using Microsoft.EntityFrameworkCore;
using Waaed.Polls.Api.Entities;

namespace Waaed.Polls.Api.Data;

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
            entity.Property(e => e.Question).IsRequired().HasMaxLength(500);
            entity.Property(e => e.Description).HasMaxLength(2000);
            entity.Property(e => e.TargetAudience).HasMaxLength(50);
            entity.HasIndex(e => e.CreatedBy);
            entity.HasIndex(e => e.StartDate);
            entity.HasIndex(e => e.EndDate);
        });

        modelBuilder.Entity<PollOption>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Text).IsRequired().HasMaxLength(200);
            entity.HasOne(e => e.Poll)
                .WithMany(p => p.Options)
                .HasForeignKey(e => e.PollId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<PollVote>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.Poll)
                .WithMany(p => p.Votes)
                .HasForeignKey(e => e.PollId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.PollOption)
                .WithMany(o => o.Votes)
                .HasForeignKey(e => e.PollOptionId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.HasIndex(e => new { e.PollId, e.UserId });
        });
    }
}
