using Microsoft.EntityFrameworkCore;
using Waaed.Hostel.Api.Entities;
using Waaed.Shared.Domain.Entities;

namespace Waaed.Hostel.Api.Data;

public class HostelDbContext : DbContext
{
    public HostelDbContext(DbContextOptions<HostelDbContext> options) : base(options)
    {
    }

    public DbSet<HostelBuilding> HostelBuildings { get; set; }
    public DbSet<HostelRoom> HostelRooms { get; set; }
    public DbSet<HostelAllocation> HostelAllocations { get; set; }
    public DbSet<HostelFeePayment> HostelFeePayments { get; set; }
    public DbSet<HostelComplaint> HostelComplaints { get; set; }
    public DbSet<HostelMaintenance> HostelMaintenance { get; set; }
    public DbSet<HostelVisitor> HostelVisitors { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<HostelBuilding>(entity =>
        {
            entity.HasIndex(e => e.BuildingCode).IsUnique();
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");
        });

        modelBuilder.Entity<HostelRoom>(entity =>
        {
            entity.HasOne(hr => hr.Building)
                .WithMany(hb => hb.Rooms)
                .HasForeignKey(hr => hr.BuildingId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => new { e.BuildingId, e.RoomNumber }).IsUnique();
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");
        });

        modelBuilder.Entity<HostelAllocation>(entity =>
        {
            entity.HasOne(ha => ha.Building)
                .WithMany(hb => hb.Allocations)
                .HasForeignKey(ha => ha.BuildingId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(ha => ha.Room)
                .WithMany(hr => hr.Allocations)
                .HasForeignKey(ha => ha.RoomId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");
        });

        modelBuilder.Entity<HostelFeePayment>(entity =>
        {
            entity.HasOne(hfp => hfp.Allocation)
                .WithMany(ha => ha.FeePayments)
                .HasForeignKey(hfp => hfp.AllocationId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");
        });

        modelBuilder.Entity<HostelComplaint>(entity =>
        {
            entity.HasOne(hc => hc.Allocation)
                .WithMany(ha => ha.Complaints)
                .HasForeignKey(hc => hc.AllocationId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(hc => hc.Room)
                .WithMany(hr => hr.Complaints)
                .HasForeignKey(hc => hc.RoomId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(hc => hc.Building)
                .WithMany()
                .HasForeignKey(hc => hc.BuildingId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");
        });

        modelBuilder.Entity<HostelMaintenance>(entity =>
        {
            entity.HasOne(hm => hm.Building)
                .WithMany(hb => hb.MaintenanceRecords)
                .HasForeignKey(hm => hm.BuildingId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(hm => hm.Room)
                .WithMany(hr => hr.MaintenanceRecords)
                .HasForeignKey(hm => hm.RoomId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");
        });

        modelBuilder.Entity<HostelVisitor>(entity =>
        {
            entity.HasOne(hv => hv.Building)
                .WithMany(hb => hb.Visitors)
                .HasForeignKey(hv => hv.BuildingId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(hv => hv.Allocation)
                .WithMany()
                .HasForeignKey(hv => hv.AllocationId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");
        });
    }
}
