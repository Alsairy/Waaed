using Microsoft.EntityFrameworkCore;
using AttendancePlatform.Shared.Domain.Entities;
using AttendancePlatform.Shared.Domain.Interfaces;
using AttendancePlatform.Shared.Infrastructure.Security;

namespace AttendancePlatform.Shared.Infrastructure.Data
{
    public class AttendancePlatformDbContext : DbContext
    {
        private readonly ITenantContext _tenantContext;
        private readonly ICurrentUserService _currentUserService;
        private readonly IDateTimeProvider _dateTimeProvider;

        public AttendancePlatformDbContext(
            DbContextOptions<AttendancePlatformDbContext> options,
            ITenantContext tenantContext,
            ICurrentUserService currentUserService,
            IDateTimeProvider dateTimeProvider) : base(options)
        {
            _tenantContext = tenantContext;
            _currentUserService = currentUserService;
            _dateTimeProvider = dateTimeProvider;
        }

        // Core entities
        public DbSet<Tenant> Tenants { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<UserRole> UserRoles { get; set; }
        public DbSet<Permission> Permissions { get; set; }
        
        // Security and Compliance entities
        public DbSet<ComplianceEvent> ComplianceEvents { get; set; }
        public DbSet<AttendancePlatform.Shared.Domain.Entities.ComplianceReport> ComplianceReports { get; set; }
        public DbSet<RolePermission> RolePermissions { get; set; }

        // Attendance entities
        public DbSet<AttendanceRecord> AttendanceRecords { get; set; }
        public DbSet<Geofence> Geofences { get; set; }
        public DbSet<UserGeofence> UserGeofences { get; set; }
        public DbSet<Beacon> Beacons { get; set; }
        public DbSet<Kiosk> Kiosks { get; set; }
        
        public DbSet<Shift> Shifts { get; set; }
        public DbSet<ShiftTemplate> ShiftTemplates { get; set; }
        public DbSet<ShiftAssignment> ShiftAssignments { get; set; }
        public DbSet<ShiftSwapRequest> ShiftSwapRequests { get; set; }
        public DbSet<ShiftConflict> ShiftConflicts { get; set; }

        public DbSet<RegionalSettings> RegionalSettings { get; set; }
        public DbSet<LocalizedString> LocalizedStrings { get; set; }

        // Advanced workflow entities
        public DbSet<WorkflowStep> WorkflowSteps { get; set; }

        // Leave management entities
        public DbSet<LeaveRequest> LeaveRequests { get; set; }
        public DbSet<LeaveType> LeaveTypes { get; set; }
        public DbSet<UserLeaveBalance> UserLeaveBalances { get; set; }
        public DbSet<PermissionRequest> PermissionRequests { get; set; }
        public DbSet<LeaveApproval> LeaveApprovals { get; set; }

        // Settings and audit entities
        public DbSet<BiometricTemplate> BiometricTemplates { get; set; }
        public DbSet<BiometricVerificationLog> BiometricVerificationLogs { get; set; }
        public DbSet<UserBiometrics> UserBiometrics { get; set; }
        public DbSet<TenantSettings> TenantSettings { get; set; }
        public DbSet<AuditLog> AuditLogs { get; set; }
        
        public DbSet<RefreshToken> RefreshTokens { get; set; }
        public DbSet<PasswordResetToken> PasswordResetTokens { get; set; }
        
        // Advanced enterprise entities
        public DbSet<AuditLogEntry> AuditLogEntries { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<ScheduledNotification> ScheduledNotifications { get; set; }
        public DbSet<NotificationTemplate> NotificationTemplates { get; set; }
        public DbSet<DeviceToken> DeviceTokens { get; set; }
        public DbSet<NotificationPreference> NotificationPreferences { get; set; }
        public DbSet<WorkflowDefinition> WorkflowDefinitions { get; set; }
        public DbSet<WorkflowInstance> WorkflowInstances { get; set; }
        public DbSet<WorkflowTask> WorkflowTasks { get; set; }
        public DbSet<WorkflowExecutionLog> WorkflowExecutionLogs { get; set; }
        public DbSet<WorkflowTemplate> WorkflowTemplates { get; set; }
        public DbSet<WorkflowHistory> WorkflowHistory { get; set; }
        public DbSet<BiometricAuditLog> BiometricAuditLogs { get; set; }
        public DbSet<BiometricBackup> BiometricBackups { get; set; }
        public DbSet<BiometricSession> BiometricSessions { get; set; }
        public DbSet<BiometricDevice> BiometricDevices { get; set; }

        public DbSet<Team> Teams { get; set; }
        public DbSet<TeamMember> TeamMembers { get; set; }
        public DbSet<TeamProject> TeamProjects { get; set; }
        public DbSet<ProjectMember> ProjectMembers { get; set; }
        public DbSet<VideoConference> VideoConferences { get; set; }
        public DbSet<ConferenceParticipant> ConferenceParticipants { get; set; }
        public DbSet<ChatMessage> ChatMessages { get; set; }
        public DbSet<ChatChannel> ChatChannels { get; set; }
        public DbSet<ChannelMember> ChannelMembers { get; set; }
        public DbSet<Document> Documents { get; set; }
        public DbSet<DocumentVersion> DocumentVersions { get; set; }
        public DbSet<ScreenSharingSession> ScreenSharingSessions { get; set; }
        public DbSet<ScreenSharingParticipant> ScreenSharingParticipants { get; set; }
        public DbSet<UserPresence> UserPresences { get; set; }

        public DbSet<WebhookSubscription> WebhookSubscriptions { get; set; }
        public DbSet<WebhookDelivery> WebhookDeliveries { get; set; }
        public DbSet<TenantIntegration> TenantIntegrations { get; set; }
        public DbSet<IntegrationLog> IntegrationLogs { get; set; }
        public DbSet<TenantConfiguration> TenantConfigurations { get; set; }
        public DbSet<BusinessRule> BusinessRules { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Apply configurations
            ConfigureTenant(modelBuilder);
            ConfigureUser(modelBuilder);
            ConfigureRole(modelBuilder);
            ConfigureAttendance(modelBuilder);
            ConfigureGeofence(modelBuilder);
            ConfigureLeaveManagement(modelBuilder);
            ConfigureSettings(modelBuilder);
            ConfigureAudit(modelBuilder);
            ConfigureNotification(modelBuilder);
            ConfigureCompliance(modelBuilder);

            // Apply global query filters for multi-tenancy
            ApplyGlobalFilters(modelBuilder);

            // Seed initial data
            SeedInitialData(modelBuilder);
        }

        private void ConfigureTenant(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Tenant>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Subdomain).IsRequired().HasMaxLength(50);
                entity.HasIndex(e => e.Subdomain).IsUnique();
                entity.Property(e => e.ContactEmail).HasMaxLength(200);
                entity.Property(e => e.ContactPhone).HasMaxLength(20);
                entity.Property(e => e.Address).HasMaxLength(500);
                entity.Property(e => e.City).HasMaxLength(100);
                entity.Property(e => e.Country).HasMaxLength(100);
                entity.Property(e => e.PostalCode).HasMaxLength(20);
                entity.Property(e => e.TimeZone).HasMaxLength(50);
                entity.Property(e => e.Locale).HasMaxLength(10);
                entity.Property(e => e.Currency).HasMaxLength(3);

                // One-to-one relationship with TenantSettings
                entity.HasOne(e => e.Settings)
                      .WithOne()
                      .HasForeignKey<TenantSettings>(e => e.TenantId);
            });
        }

        private void ConfigureUser(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.FirstName).IsRequired().HasMaxLength(100);
                entity.Property(e => e.LastName).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Email).IsRequired().HasMaxLength(200);
                entity.HasIndex(e => new { e.Email, e.TenantId }).IsUnique();
                entity.Property(e => e.PhoneNumber).HasMaxLength(20);
                entity.Property(e => e.EmployeeId).HasMaxLength(50);
                entity.Property(e => e.Department).HasMaxLength(100);
                entity.Property(e => e.Position).HasMaxLength(100);

                // Self-referencing relationship for manager
                entity.HasOne(e => e.Manager)
                      .WithMany(e => e.DirectReports)
                      .HasForeignKey(e => e.ManagerId)
                      .OnDelete(DeleteBehavior.Restrict);

                // Relationship with Tenant
                entity.HasOne(e => e.Tenant)
                      .WithMany(e => e.Users)
                      .HasForeignKey(e => e.TenantId)
                      .OnDelete(DeleteBehavior.Cascade);

                // One-to-one relationship with UserBiometrics
                entity.HasOne(e => e.Biometrics)
                      .WithOne(e => e.User)
                      .HasForeignKey<UserBiometrics>(e => e.UserId);
                
                entity.Ignore("DateOfBirth");
                entity.Ignore("FailedLoginAttempts");
            });
        }

        private void ConfigureRole(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Role>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
                entity.HasIndex(e => new { e.Name, e.TenantId }).IsUnique();
                entity.Property(e => e.Description).HasMaxLength(500);
            });

            modelBuilder.Entity<UserRole>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => new { e.UserId, e.RoleId }).IsUnique();

                entity.HasOne(e => e.User)
                      .WithMany(e => e.UserRoles)
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Role)
                      .WithMany(e => e.UserRoles)
                      .HasForeignKey(e => e.RoleId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Permission>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Resource).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Action).IsRequired().HasMaxLength(50);
                entity.HasIndex(e => new { e.Resource, e.Action }).IsUnique();
                entity.Property(e => e.Description).HasMaxLength(500);
            });

            modelBuilder.Entity<RolePermission>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => new { e.RoleId, e.PermissionId }).IsUnique();

                entity.HasOne(e => e.Role)
                      .WithMany(e => e.RolePermissions)
                      .HasForeignKey(e => e.RoleId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Permission)
                      .WithMany(e => e.RolePermissions)
                      .HasForeignKey(e => e.PermissionId)
                      .OnDelete(DeleteBehavior.Cascade);
            });
        }

        private void ConfigureAttendance(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<AttendanceRecord>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.LocationName).HasMaxLength(200);
                entity.Property(e => e.Address).HasMaxLength(500);
                entity.Property(e => e.BeaconId).HasMaxLength(100);
                entity.Property(e => e.BeaconName).HasMaxLength(100);
                entity.Property(e => e.DeviceId).HasMaxLength(100);
                entity.Property(e => e.DeviceType).HasMaxLength(50);
                entity.Property(e => e.DeviceModel).HasMaxLength(100);
                entity.Property(e => e.AppVersion).HasMaxLength(20);
                entity.Property(e => e.Notes).HasMaxLength(1000);
                entity.Property(e => e.IpAddress).HasMaxLength(45);
                entity.Property(e => e.UserAgent).HasMaxLength(500);

                entity.HasOne(e => e.User)
                      .WithMany(e => e.AttendanceRecords)
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Geofence)
                      .WithMany(e => e.AttendanceRecords)
                      .HasForeignKey(e => e.GeofenceId)
                      .OnDelete(DeleteBehavior.SetNull);

                entity.HasOne(e => e.ApprovedByUser)
                      .WithMany()
                      .HasForeignKey(e => e.ApprovedBy)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasIndex(e => new { e.UserId, e.Timestamp });
                entity.HasIndex(e => e.TenantId);
            });
        }

        private void ConfigureGeofence(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Geofence>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Description).HasMaxLength(500);
                entity.Property(e => e.Address).HasMaxLength(200);
                entity.Property(e => e.City).HasMaxLength(100);
                entity.Property(e => e.Country).HasMaxLength(100);
                entity.Property(e => e.PostalCode).HasMaxLength(20);
                entity.Property(e => e.WorkingDays).HasMaxLength(50);

                entity.HasIndex(e => new { e.Name, e.TenantId }).IsUnique();
            });

            modelBuilder.Entity<UserGeofence>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => new { e.UserId, e.GeofenceId }).IsUnique();

                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Geofence)
                      .WithMany(e => e.UserGeofences)
                      .HasForeignKey(e => e.GeofenceId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Beacon>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
                entity.Property(e => e.BeaconId).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Major).HasMaxLength(100);
                entity.Property(e => e.Minor).HasMaxLength(100);
                entity.Property(e => e.Description).HasMaxLength(500);

                entity.HasIndex(e => new { e.BeaconId, e.TenantId }).IsUnique();

                entity.HasOne(e => e.Geofence)
                      .WithMany(e => e.Beacons)
                      .HasForeignKey(e => e.GeofenceId)
                      .OnDelete(DeleteBehavior.SetNull);
            });
        }

        private void ConfigureLeaveManagement(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<LeaveType>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Description).HasMaxLength(500);
                entity.Property(e => e.Color).HasMaxLength(7);

                entity.HasIndex(e => new { e.Name, e.TenantId }).IsUnique();
            });

            modelBuilder.Entity<LeaveRequest>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Reason).HasMaxLength(1000);
                entity.Property(e => e.ApprovalNotes).HasMaxLength(1000);
                entity.Property(e => e.RejectionReason).HasMaxLength(1000);
                entity.Property(e => e.AttachmentUrls).HasMaxLength(2000);
                entity.Property(e => e.ContactDuringLeave).HasMaxLength(200);

                entity.HasOne(e => e.User)
                      .WithMany(e => e.LeaveRequests)
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.LeaveType)
                      .WithMany(e => e.LeaveRequests)
                      .HasForeignKey(e => e.LeaveTypeId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.ApprovedByUser)
                      .WithMany()
                      .HasForeignKey(e => e.ApprovedBy)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.RejectedByUser)
                      .WithMany()
                      .HasForeignKey(e => e.RejectedBy)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<UserLeaveBalance>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => new { e.UserId, e.LeaveTypeId, e.Year }).IsUnique();

                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.LeaveType)
                      .WithMany(e => e.UserLeaveBalances)
                      .HasForeignKey(e => e.LeaveTypeId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<PermissionRequest>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Reason).IsRequired().HasMaxLength(1000);
                entity.Property(e => e.ApprovalNotes).HasMaxLength(1000);
                entity.Property(e => e.RejectionReason).HasMaxLength(1000);

                entity.HasOne(e => e.User)
                      .WithMany(e => e.PermissionRequests)
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.ApprovedByUser)
                      .WithMany()
                      .HasForeignKey(e => e.ApprovedBy)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.RejectedByUser)
                      .WithMany()
                      .HasForeignKey(e => e.RejectedBy)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<LeaveApproval>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Notes).HasMaxLength(1000);

                entity.HasOne(e => e.LeaveRequest)
                      .WithMany(e => e.LeaveApprovals)
                      .HasForeignKey(e => e.LeaveRequestId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Approver)
                      .WithMany()
                      .HasForeignKey(e => e.ApproverId)
                      .OnDelete(DeleteBehavior.Restrict);
            });
        }

        private void ConfigureSettings(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<UserBiometrics>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.UserId).IsUnique();
            });

            modelBuilder.Entity<TenantSettings>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.TenantId).IsUnique();
                entity.Property(e => e.PayrollSystemIntegrationUrl).HasMaxLength(500);
                entity.Property(e => e.HrSystemIntegrationUrl).HasMaxLength(500);
                entity.Property(e => e.SsoProviderUrl).HasMaxLength(500);
                entity.Property(e => e.CustomBrandingLogoUrl).HasMaxLength(500);
                entity.Property(e => e.CustomBrandingColors).HasMaxLength(1000); // JSON
            });
        }

        private void ConfigureAudit(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<AuditLog>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Action).IsRequired();
                entity.Property(e => e.EntityType).IsRequired().HasMaxLength(100);
                entity.Property(e => e.IpAddress).HasMaxLength(45);
                entity.Property(e => e.UserAgent).HasMaxLength(500);
                entity.Property(e => e.Description).HasMaxLength(500);
                entity.Property(e => e.DeviceId).HasMaxLength(100);
                entity.Property(e => e.DeviceType).HasMaxLength(50);
                entity.Property(e => e.Location).HasMaxLength(100);
                entity.Property(e => e.FailureReason).HasMaxLength(500);
                entity.Property(e => e.SessionId).HasMaxLength(100);

                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.SetNull);

                entity.HasIndex(e => e.Timestamp);
                entity.HasIndex(e => new { e.EntityType, e.Action });
                entity.HasIndex(e => e.TenantId);
            });
        }

        private void ConfigureNotification(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Notification>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.UserId).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Message).IsRequired().HasMaxLength(1000);
                entity.Property(e => e.Type).HasMaxLength(50).HasDefaultValue("info");
                entity.Property(e => e.Data).HasColumnType("nvarchar(max)");
                entity.Property(e => e.ActionUrl).HasMaxLength(500);
                entity.Property(e => e.Priority).HasMaxLength(20).HasDefaultValue("normal");
                entity.Property(e => e.Category).HasMaxLength(100);
                entity.Property(e => e.Source).HasMaxLength(100);
                entity.Property(e => e.CorrelationId).HasMaxLength(50);
                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.IsRead);
                entity.HasIndex(e => e.CreatedAt);
                entity.HasIndex(e => e.ExpiresAt);
            });

            modelBuilder.Entity<ScheduledNotification>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.UserId).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Message).IsRequired().HasMaxLength(1000);
                entity.Property(e => e.Type).HasMaxLength(50).HasDefaultValue("info");
                entity.Property(e => e.Data).HasColumnType("nvarchar(max)");
                entity.Property(e => e.RecurrencePattern).HasMaxLength(100);
                entity.Property(e => e.Status).HasMaxLength(50).HasDefaultValue("pending");
                entity.Property(e => e.ErrorMessage).HasMaxLength(1000);
                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.ScheduledAt);
                entity.HasIndex(e => e.IsProcessed);
                entity.HasIndex(e => e.Status);
            });
        }

        private void ConfigureCompliance(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<ComplianceEvent>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasMaxLength(50);
                entity.Property(e => e.TenantId).IsRequired().HasMaxLength(50);
                entity.Property(e => e.EventType).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Description).IsRequired().HasMaxLength(1000);
                entity.Property(e => e.UserId).HasMaxLength(50);
                entity.Ignore(e => e.Metadata);
                entity.HasIndex(e => e.TenantId);
                entity.HasIndex(e => e.EventType);
                entity.HasIndex(e => e.Timestamp);
            });

            modelBuilder.Entity<AttendancePlatform.Shared.Domain.Entities.ComplianceReport>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.TenantId).IsRequired();
                entity.Property(e => e.Region).IsRequired().HasMaxLength(10);
                entity.Property(e => e.Language).IsRequired().HasMaxLength(10);
                entity.Property(e => e.ReportData).HasColumnType("nvarchar(max)");
                entity.HasIndex(e => e.TenantId);
                entity.HasIndex(e => e.Region);
                entity.HasIndex(e => e.GeneratedAt);
            });

            modelBuilder.Entity<AttendancePlatform.Shared.Domain.Entities.ComplianceViolation>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasMaxLength(50);
                entity.Property(e => e.TenantId).IsRequired().HasMaxLength(50);
                entity.Property(e => e.ViolationType).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Severity).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Description).IsRequired().HasMaxLength(1000);
                entity.Property(e => e.UserId).HasMaxLength(50);
                entity.Property(e => e.Status).IsRequired().HasMaxLength(50);
                entity.HasIndex(e => e.TenantId);
                entity.HasIndex(e => e.ViolationType);
                entity.HasIndex(e => e.Severity);
                entity.HasIndex(e => e.Status);
                
                entity.HasOne(e => e.User)
                    .WithMany()
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Restrict);
                    
                entity.HasOne(e => e.ResolvedByUser)
                    .WithMany()
                    .HasForeignKey(e => e.ResolvedBy)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<AttendancePlatform.Shared.Domain.Entities.ShiftAssignment>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.TenantId).IsRequired();
                
                entity.HasOne(e => e.User)
                    .WithMany()
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Restrict);
                    
                entity.HasOne(e => e.AssignedByUser)
                    .WithMany()
                    .HasForeignKey(e => e.AssignedBy)
                    .OnDelete(DeleteBehavior.Restrict);
                    
                entity.HasOne(e => e.Shift)
                    .WithMany(s => s.Assignments)
                    .HasForeignKey(e => e.ShiftId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<AttendancePlatform.Shared.Domain.Entities.ShiftSwapRequest>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.TenantId).IsRequired();
                
                entity.HasOne(e => e.Requester)
                    .WithMany()
                    .HasForeignKey(e => e.RequesterId)
                    .OnDelete(DeleteBehavior.Restrict);
                    
                entity.HasOne(e => e.TargetUser)
                    .WithMany()
                    .HasForeignKey(e => e.TargetUserId)
                    .OnDelete(DeleteBehavior.Restrict);
                    
                entity.HasOne(e => e.RespondedByUser)
                    .WithMany()
                    .HasForeignKey(e => e.RespondedBy)
                    .OnDelete(DeleteBehavior.Restrict);
                    
                entity.HasOne(e => e.ApprovedByUser)
                    .WithMany()
                    .HasForeignKey(e => e.ApprovedBy)
                    .OnDelete(DeleteBehavior.Restrict);
                    
                entity.HasOne(e => e.OriginalAssignment)
                    .WithMany(sa => sa.SwapRequests)
                    .HasForeignKey(e => e.OriginalAssignmentId)
                    .OnDelete(DeleteBehavior.Restrict);
                    
                entity.HasOne(e => e.TargetAssignment)
                    .WithMany()
                    .HasForeignKey(e => e.TargetAssignmentId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<AttendancePlatform.Shared.Domain.Entities.ShiftConflict>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.TenantId).IsRequired();
                
                entity.HasOne(e => e.User)
                    .WithMany()
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Restrict);
                    
                entity.HasOne(e => e.ResolvedByUser)
                    .WithMany()
                    .HasForeignKey(e => e.ResolvedBy)
                    .OnDelete(DeleteBehavior.Restrict);
                    
                entity.HasOne(e => e.Assignment)
                    .WithMany()
                    .HasForeignKey(e => e.AssignmentId)
                    .OnDelete(DeleteBehavior.Restrict);
            });
        }

        private void ApplyGlobalFilters(ModelBuilder modelBuilder)
        {
            // Apply global query filter for tenant isolation
            foreach (var entityType in modelBuilder.Model.GetEntityTypes())
            {
                if (typeof(ITenantAware).IsAssignableFrom(entityType.ClrType))
                {
                    var method = typeof(AttendancePlatformDbContext)
                        .GetMethod(nameof(GetTenantFilter), System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Static)!
                        .MakeGenericMethod(entityType.ClrType);
                    
                    var filter = method.Invoke(null, new object[] { this });
                    entityType.SetQueryFilter((System.Linq.Expressions.LambdaExpression)filter!);
                }

                // Apply global query filter for soft delete
                if (typeof(ISoftDeletable).IsAssignableFrom(entityType.ClrType))
                {
                    var method = typeof(AttendancePlatformDbContext)
                        .GetMethod(nameof(GetSoftDeleteFilter), System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Static)!
                        .MakeGenericMethod(entityType.ClrType);
                    
                    var filter = method.Invoke(null, new object[] { });
                    entityType.SetQueryFilter((System.Linq.Expressions.LambdaExpression)filter!);
                }
            }
        }

        private static System.Linq.Expressions.LambdaExpression GetTenantFilter<TEntity>(AttendancePlatformDbContext context)
            where TEntity : class, ITenantAware
        {
            System.Linq.Expressions.Expression<Func<TEntity, bool>> filter = x => x.TenantId == context._tenantContext.TenantId;
            return filter;
        }

        private static System.Linq.Expressions.LambdaExpression GetSoftDeleteFilter<TEntity>()
            where TEntity : class, ISoftDeletable
        {
            System.Linq.Expressions.Expression<Func<TEntity, bool>> filter = x => !x.IsDeleted;
            return filter;
        }

        private void SeedInitialData(ModelBuilder modelBuilder)
        {
            // Seed system permissions
            var permissions = new[]
            {
                new Permission { Id = Guid.Parse("581b124f-d825-48db-96d6-b344a6844265"), Name = "View Users", Resource = "User", Action = "Read", Description = "View user information" },
                new Permission { Id = Guid.Parse("581b124f-d825-48db-96d6-b344a6844266"), Name = "Create Users", Resource = "User", Action = "Create", Description = "Create new users" },
                new Permission { Id = Guid.Parse("581b124f-d825-48db-96d6-b344a6844267"), Name = "Update Users", Resource = "User", Action = "Update", Description = "Update user information" },
                new Permission { Id = Guid.Parse("581b124f-d825-48db-96d6-b344a6844268"), Name = "Delete Users", Resource = "User", Action = "Delete", Description = "Delete users" },
                new Permission { Id = Guid.Parse("581b124f-d825-48db-96d6-b344a6844269"), Name = "View Attendance", Resource = "Attendance", Action = "Read", Description = "View attendance records" },
                new Permission { Id = Guid.Parse("581b124f-d825-48db-96d6-b344a684426a"), Name = "Manage Attendance", Resource = "Attendance", Action = "Manage", Description = "Manage attendance records" },
                new Permission { Id = Guid.Parse("581b124f-d825-48db-96d6-b344a684426b"), Name = "View Reports", Resource = "Report", Action = "Read", Description = "View reports" },
                new Permission { Id = Guid.Parse("581b124f-d825-48db-96d6-b344a684426c"), Name = "Manage Settings", Resource = "Settings", Action = "Manage", Description = "Manage system settings" }
            };

            modelBuilder.Entity<Permission>().HasData(permissions);

            var defaultTenant = new Tenant
            {
                Id = Guid.Parse("11111111-1111-1111-1111-111111111111"),
                Name = "Test Organization",
                Subdomain = "test",
                Status = TenantStatus.Active,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "System"
            };

            modelBuilder.Entity<Tenant>().HasData(defaultTenant);

            var roles = new[]
            {
                new Role { Id = Guid.Parse("22222222-2222-2222-2222-222222222222"), Name = "Admin", Description = "System Administrator", TenantId = defaultTenant.Id, CreatedAt = DateTime.UtcNow, CreatedBy = "System" },
                new Role { Id = Guid.Parse("33333333-3333-3333-3333-333333333333"), Name = "Manager", Description = "Department Manager", TenantId = defaultTenant.Id, CreatedAt = DateTime.UtcNow, CreatedBy = "System" },
                new Role { Id = Guid.Parse("44444444-4444-4444-4444-444444444444"), Name = "Employee", Description = "Standard Employee", TenantId = defaultTenant.Id, CreatedAt = DateTime.UtcNow, CreatedBy = "System" }
            };

            modelBuilder.Entity<Role>().HasData(roles);

            var users = new[]
            {
                new User
                {
                    Id = Guid.Parse("55555555-5555-5555-5555-555555555555"),
                    FirstName = "System",
                    LastName = "Administrator",
                    Email = "admin@test.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("AdminPassword123!"),
                    Status = UserStatus.Active,
                    IsEmailVerified = true,
                    TenantId = defaultTenant.Id,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = "System"
                },
                new User
                {
                    Id = Guid.Parse("66666666-6666-6666-6666-666666666666"),
                    FirstName = "Department",
                    LastName = "Manager",
                    Email = "manager@test.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("ManagerPassword123!"),
                    Status = UserStatus.Active,
                    IsEmailVerified = true,
                    TenantId = defaultTenant.Id,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = "System"
                },
                new User
                {
                    Id = Guid.Parse("77777777-7777-7777-7777-777777777777"),
                    FirstName = "John",
                    LastName = "Doe",
                    Email = "john.doe@test.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("TestPassword123!"),
                    Status = UserStatus.Active,
                    IsEmailVerified = true,
                    TenantId = defaultTenant.Id,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = "System"
                }
            };

            modelBuilder.Entity<User>().HasData(users);

            var userRoles = new[]
            {
                new UserRole { Id = Guid.Parse("88888888-8888-8888-8888-888888888888"), UserId = users[0].Id, RoleId = roles[0].Id, TenantId = defaultTenant.Id, CreatedAt = DateTime.UtcNow, CreatedBy = "System" },
                new UserRole { Id = Guid.Parse("99999999-9999-9999-9999-999999999999"), UserId = users[1].Id, RoleId = roles[1].Id, TenantId = defaultTenant.Id, CreatedAt = DateTime.UtcNow, CreatedBy = "System" },
                new UserRole { Id = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"), UserId = users[2].Id, RoleId = roles[2].Id, TenantId = defaultTenant.Id, CreatedAt = DateTime.UtcNow, CreatedBy = "System" }
            };

            modelBuilder.Entity<UserRole>().HasData(userRoles);
        }

        public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            // Update audit fields before saving
            foreach (var entry in ChangeTracker.Entries<BaseEntity>())
            {
                switch (entry.State)
                {
                    case EntityState.Added:
                        entry.Entity.CreatedAt = _dateTimeProvider.UtcNow;
                        entry.Entity.CreatedBy = _currentUserService.UserId?.ToString();
                        break;
                    case EntityState.Modified:
                        entry.Entity.UpdatedAt = _dateTimeProvider.UtcNow;
                        entry.Entity.UpdatedBy = _currentUserService.UserId?.ToString();
                        break;
                }
            }

            // Set tenant ID for new tenant-aware entities
            foreach (var entry in ChangeTracker.Entries<ITenantAware>())
            {
                if (entry.State == EntityState.Added && entry.Entity.TenantId == Guid.Empty)
                {
                    if (_tenantContext.TenantId.HasValue)
                    {
                        entry.Entity.TenantId = _tenantContext.TenantId.Value;
                    }
                }
            }

            return await base.SaveChangesAsync(cancellationToken);
        }
    }
}

