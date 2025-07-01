using Microsoft.EntityFrameworkCore;
using Waaed.Transport.Api.Entities;
using Waaed.Shared.Domain.Entities;
using RouteEntity = Waaed.Transport.Api.Entities.Route;

namespace Waaed.Transport.Api.Data;

public class TransportDbContext : DbContext
{
    public TransportDbContext(DbContextOptions<TransportDbContext> options) : base(options)
    {
    }

    public DbSet<Vehicle> Vehicles { get; set; }
    public DbSet<Driver> Drivers { get; set; }
    public DbSet<RouteEntity> Routes { get; set; }
    public DbSet<RouteStop> RouteStops { get; set; }
    public DbSet<RouteAssignment> RouteAssignments { get; set; }
    public DbSet<StudentTransportAssignment> StudentTransportAssignments { get; set; }
    public DbSet<TripRecord> TripRecords { get; set; }
    public DbSet<StudentAttendanceRecord> StudentAttendanceRecords { get; set; }
    public DbSet<VehicleMaintenanceRecord> VehicleMaintenanceRecords { get; set; }
    public DbSet<VehicleFuelRecord> VehicleFuelRecords { get; set; }
    public DbSet<VehicleInspection> VehicleInspections { get; set; }
    public DbSet<DriverPerformanceRecord> DriverPerformanceRecords { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Vehicle>(entity =>
        {
            entity.HasIndex(e => e.VehicleNumber).IsUnique();
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");
        });

        modelBuilder.Entity<Driver>(entity =>
        {
            entity.HasIndex(e => e.EmployeeId).IsUnique();
            entity.HasIndex(e => e.Email).IsUnique();
            entity.HasIndex(e => e.LicenseNumber).IsUnique();
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");
        });

        modelBuilder.Entity<RouteEntity>(entity =>
        {
            entity.HasIndex(e => e.RouteCode).IsUnique();
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");
        });

        modelBuilder.Entity<RouteStop>(entity =>
        {
            entity.HasOne(rs => rs.Route)
                .WithMany(r => r.RouteStops)
                .HasForeignKey(rs => rs.RouteId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");
        });

        modelBuilder.Entity<RouteAssignment>(entity =>
        {
            entity.HasOne(ra => ra.Route)
                .WithMany(r => r.RouteAssignments)
                .HasForeignKey(ra => ra.RouteId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(ra => ra.Vehicle)
                .WithMany(v => v.RouteAssignments)
                .HasForeignKey(ra => ra.VehicleId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(ra => ra.Driver)
                .WithMany(d => d.RouteAssignments)
                .HasForeignKey(ra => ra.DriverId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(ra => ra.Escort)
                .WithMany()
                .HasForeignKey(ra => ra.EscortId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");
        });

        modelBuilder.Entity<StudentTransportAssignment>(entity =>
        {
            entity.HasOne(sta => sta.Route)
                .WithMany(r => r.StudentAssignments)
                .HasForeignKey(sta => sta.RouteId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(sta => sta.PickupStop)
                .WithMany(rs => rs.StudentAssignments)
                .HasForeignKey(sta => sta.PickupStopId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(sta => sta.DropStop)
                .WithMany()
                .HasForeignKey(sta => sta.DropStopId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");
        });

        modelBuilder.Entity<TripRecord>(entity =>
        {
            entity.HasOne(tr => tr.Route)
                .WithMany(r => r.TripRecords)
                .HasForeignKey(tr => tr.RouteId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(tr => tr.Vehicle)
                .WithMany()
                .HasForeignKey(tr => tr.VehicleId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(tr => tr.Driver)
                .WithMany(d => d.TripRecords)
                .HasForeignKey(tr => tr.DriverId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(tr => tr.Escort)
                .WithMany()
                .HasForeignKey(tr => tr.EscortId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");
        });

        modelBuilder.Entity<StudentAttendanceRecord>(entity =>
        {
            entity.HasOne(sar => sar.TripRecord)
                .WithMany(tr => tr.AttendanceRecords)
                .HasForeignKey(sar => sar.TripRecordId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(sar => sar.StudentTransportAssignment)
                .WithMany(sta => sta.AttendanceRecords)
                .HasForeignKey(sar => sar.StudentTransportAssignmentId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");
        });

        modelBuilder.Entity<VehicleMaintenanceRecord>(entity =>
        {
            entity.HasOne(vmr => vmr.Vehicle)
                .WithMany(v => v.MaintenanceRecords)
                .HasForeignKey(vmr => vmr.VehicleId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");
        });

        modelBuilder.Entity<VehicleFuelRecord>(entity =>
        {
            entity.HasOne(vfr => vfr.Vehicle)
                .WithMany(v => v.FuelRecords)
                .HasForeignKey(vfr => vfr.VehicleId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");
        });

        modelBuilder.Entity<VehicleInspection>(entity =>
        {
            entity.HasOne(vi => vi.Vehicle)
                .WithMany(v => v.Inspections)
                .HasForeignKey(vi => vi.VehicleId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");
        });

        modelBuilder.Entity<DriverPerformanceRecord>(entity =>
        {
            entity.HasOne(dpr => dpr.Driver)
                .WithMany(d => d.PerformanceRecords)
                .HasForeignKey(dpr => dpr.DriverId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");
        });
    }
}
