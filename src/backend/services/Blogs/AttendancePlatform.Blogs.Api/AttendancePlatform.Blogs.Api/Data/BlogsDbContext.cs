using Microsoft.EntityFrameworkCore;
using AttendancePlatform.Blogs.Api.Entities;

namespace AttendancePlatform.Blogs.Api.Data;

public class BlogsDbContext : DbContext
{
    public BlogsDbContext(DbContextOptions<BlogsDbContext> options) : base(options)
    {
    }

    public DbSet<BlogPost> BlogPosts { get; set; }
    public DbSet<BlogComment> BlogComments { get; set; }
    public DbSet<BlogCategory> BlogCategories { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<BlogPost>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Content).IsRequired();
            entity.Property(e => e.Status).IsRequired().HasMaxLength(20);
            entity.Property(e => e.Visibility).IsRequired().HasMaxLength(20);
            entity.Property(e => e.Summary).HasMaxLength(500);
            entity.Property(e => e.FeaturedImage).HasMaxLength(200);
            entity.Property(e => e.Tags).HasMaxLength(500);
            entity.Property(e => e.CreatedAt).IsRequired();
            
            entity.HasOne(e => e.Category)
                .WithMany(e => e.Posts)
                .HasForeignKey(e => e.CategoryId)
                .OnDelete(DeleteBehavior.SetNull);
                
            entity.HasMany(e => e.Comments)
                .WithOne(e => e.Post)
                .HasForeignKey(e => e.PostId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<BlogComment>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Content).IsRequired().HasMaxLength(1000);
            entity.Property(e => e.CommenterName).HasMaxLength(100);
            entity.Property(e => e.CommenterRole).HasMaxLength(100);
            entity.Property(e => e.CreatedAt).IsRequired();
            
            entity.HasOne(e => e.ParentComment)
                .WithMany(e => e.Replies)
                .HasForeignKey(e => e.ParentCommentId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<BlogCategory>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.Property(e => e.Color).HasMaxLength(50);
            entity.Property(e => e.Icon).HasMaxLength(50);
            entity.Property(e => e.CreatedAt).IsRequired();
            
            entity.HasIndex(e => e.Name).IsUnique();
        });
    }
}
