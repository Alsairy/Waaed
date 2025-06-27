using AttendancePlatform.Shared.Domain.DTOs;
using AttendancePlatform.Shared.Domain.Entities;
using AttendancePlatform.Shared.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AttendancePlatform.TenantManagement.Api.Services
{
    public class TenantManagementService : ITenantManagementService
    {
        private readonly AttendancePlatformDbContext _context;
        private readonly ILogger<TenantManagementService> _logger;

        public TenantManagementService(
            AttendancePlatformDbContext context,
            ILogger<TenantManagementService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<IEnumerable<TenantDto>> GetAllTenantsAsync()
        {
            try
            {
                var tenants = await _context.Tenants
                    .Where(t => !t.IsDeleted)
                    .Select(t => new TenantDto
                    {
                        Id = t.Id,
                        Name = t.Name,
                        Description = t.Description,
                        LogoUrl = t.LogoUrl,
                        PrimaryColor = t.PrimaryColor,
                        SecondaryColor = t.SecondaryColor,
                        Status = t.Status.ToString(),
                        SubscriptionStartDate = t.SubscriptionStartDate,
                        SubscriptionEndDate = t.SubscriptionEndDate,
                        MaxUsers = t.MaxUsers,
                        TimeZone = t.TimeZone,
                        Locale = t.Locale,
                        Currency = t.Currency,
                        CreatedAt = t.CreatedAt,
                        UpdatedAt = t.UpdatedAt
                    })
                    .ToListAsync();

                return tenants;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving all tenants");
                throw;
            }
        }

        public async Task<TenantDto?> GetTenantByIdAsync(Guid id)
        {
            try
            {
                var tenant = await _context.Tenants
                    .Where(t => t.Id == id && !t.IsDeleted)
                    .Select(t => new TenantDto
                    {
                        Id = t.Id,
                        Name = t.Name,
                        Description = t.Description,
                        LogoUrl = t.LogoUrl,
                        PrimaryColor = t.PrimaryColor,
                        SecondaryColor = t.SecondaryColor,
                        Status = t.Status.ToString(),
                        SubscriptionStartDate = t.SubscriptionStartDate,
                        SubscriptionEndDate = t.SubscriptionEndDate,
                        MaxUsers = t.MaxUsers,
                        TimeZone = t.TimeZone,
                        Locale = t.Locale,
                        Currency = t.Currency,
                        CreatedAt = t.CreatedAt,
                        UpdatedAt = t.UpdatedAt
                    })
                    .FirstOrDefaultAsync();

                return tenant;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving tenant {TenantId}", id);
                throw;
            }
        }

        public async Task<TenantDto?> GetCurrentTenantAsync()
        {
            try
            {
                var tenant = await _context.Tenants
                    .Where(t => !t.IsDeleted)
                    .Select(t => new TenantDto
                    {
                        Id = t.Id,
                        Name = t.Name,
                        Description = t.Description,
                        LogoUrl = t.LogoUrl,
                        PrimaryColor = t.PrimaryColor,
                        SecondaryColor = t.SecondaryColor,
                        Status = t.Status.ToString(),
                        SubscriptionStartDate = t.SubscriptionStartDate,
                        SubscriptionEndDate = t.SubscriptionEndDate,
                        MaxUsers = t.MaxUsers,
                        TimeZone = t.TimeZone,
                        Locale = t.Locale,
                        Currency = t.Currency,
                        CreatedAt = t.CreatedAt,
                        UpdatedAt = t.UpdatedAt
                    })
                    .FirstOrDefaultAsync();

                return tenant;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving current tenant");
                throw;
            }
        }

        public async Task<TenantDto> CreateTenantAsync(CreateTenantDto request)
        {
            try
            {
                var tenant = new Tenant
                {
                    Id = Guid.NewGuid(),
                    Name = request.Name,
                    Description = request.Description,
                    LogoUrl = request.LogoUrl,
                    PrimaryColor = request.PrimaryColor,
                    SecondaryColor = request.SecondaryColor,
                    Status = TenantStatus.Active,
                    SubscriptionStartDate = request.SubscriptionStartDate,
                    SubscriptionEndDate = request.SubscriptionEndDate,
                    MaxUsers = request.MaxUsers,
                    TimeZone = request.TimeZone,
                    Locale = request.Locale,
                    Currency = request.Currency,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.Tenants.Add(tenant);
                await _context.SaveChangesAsync();

                return new TenantDto
                {
                    Id = tenant.Id,
                    Name = tenant.Name,
                    Description = tenant.Description,
                    LogoUrl = tenant.LogoUrl,
                    PrimaryColor = tenant.PrimaryColor,
                    SecondaryColor = tenant.SecondaryColor,
                    Status = tenant.Status.ToString(),
                    SubscriptionStartDate = tenant.SubscriptionStartDate,
                    SubscriptionEndDate = tenant.SubscriptionEndDate,
                    MaxUsers = tenant.MaxUsers,
                    TimeZone = tenant.TimeZone,
                    Locale = tenant.Locale,
                    Currency = tenant.Currency,
                    CreatedAt = tenant.CreatedAt,
                    UpdatedAt = tenant.UpdatedAt
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating tenant");
                throw;
            }
        }

        public async Task<TenantDto?> UpdateTenantAsync(Guid id, UpdateTenantDto request)
        {
            try
            {
                var tenant = await _context.Tenants
                    .FirstOrDefaultAsync(t => t.Id == id && !t.IsDeleted);

                if (tenant == null)
                {
                    return null;
                }

                if (!string.IsNullOrEmpty(request.Name))
                    tenant.Name = request.Name;
                if (request.Description != null)
                    tenant.Description = request.Description;
                if (request.MaxUsers.HasValue)
                    tenant.MaxUsers = request.MaxUsers.Value;
                if (!string.IsNullOrEmpty(request.TimeZone))
                    tenant.TimeZone = request.TimeZone;
                if (!string.IsNullOrEmpty(request.Locale))
                    tenant.Locale = request.Locale;
                if (!string.IsNullOrEmpty(request.Currency))
                    tenant.Currency = request.Currency;
                if (request.SubscriptionStartDate.HasValue)
                    tenant.SubscriptionStartDate = request.SubscriptionStartDate;
                if (request.SubscriptionEndDate.HasValue)
                    tenant.SubscriptionEndDate = request.SubscriptionEndDate;
                if (!string.IsNullOrEmpty(request.LogoUrl))
                    tenant.LogoUrl = request.LogoUrl;
                if (!string.IsNullOrEmpty(request.PrimaryColor))
                    tenant.PrimaryColor = request.PrimaryColor;
                if (!string.IsNullOrEmpty(request.SecondaryColor))
                    tenant.SecondaryColor = request.SecondaryColor;
                
                tenant.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return new TenantDto
                {
                    Id = tenant.Id,
                    Name = tenant.Name,
                    Description = tenant.Description,
                    LogoUrl = tenant.LogoUrl,
                    PrimaryColor = tenant.PrimaryColor,
                    SecondaryColor = tenant.SecondaryColor,
                    Status = tenant.Status.ToString(),
                    SubscriptionStartDate = tenant.SubscriptionStartDate,
                    SubscriptionEndDate = tenant.SubscriptionEndDate,
                    MaxUsers = tenant.MaxUsers,
                    TimeZone = tenant.TimeZone,
                    Locale = tenant.Locale,
                    Currency = tenant.Currency,
                    CreatedAt = tenant.CreatedAt,
                    UpdatedAt = tenant.UpdatedAt
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating tenant {TenantId}", id);
                throw;
            }
        }

        public async Task<TenantDto?> UpdateTenantBrandingAsync(Guid id, TenantSettingsDto request)
        {
            try
            {
                var tenant = await _context.Tenants
                    .FirstOrDefaultAsync(t => t.Id == id && !t.IsDeleted);

                if (tenant == null)
                {
                    return null;
                }

                if (!string.IsNullOrEmpty(request.LogoUrl))
                    tenant.LogoUrl = request.LogoUrl;
                if (!string.IsNullOrEmpty(request.PrimaryColor))
                    tenant.PrimaryColor = request.PrimaryColor;
                if (!string.IsNullOrEmpty(request.SecondaryColor))
                    tenant.SecondaryColor = request.SecondaryColor;
                if (!string.IsNullOrEmpty(request.TimeZone))
                    tenant.TimeZone = request.TimeZone;
                if (!string.IsNullOrEmpty(request.Locale))
                    tenant.Locale = request.Locale;
                if (!string.IsNullOrEmpty(request.Currency))
                    tenant.Currency = request.Currency;
                
                tenant.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return new TenantDto
                {
                    Id = tenant.Id,
                    Name = tenant.Name,
                    Description = tenant.Description,
                    LogoUrl = tenant.LogoUrl,
                    PrimaryColor = tenant.PrimaryColor,
                    SecondaryColor = tenant.SecondaryColor,
                    Status = tenant.Status.ToString(),
                    SubscriptionStartDate = tenant.SubscriptionStartDate,
                    SubscriptionEndDate = tenant.SubscriptionEndDate,
                    MaxUsers = tenant.MaxUsers,
                    TimeZone = tenant.TimeZone,
                    Locale = tenant.Locale,
                    Currency = tenant.Currency,
                    CreatedAt = tenant.CreatedAt,
                    UpdatedAt = tenant.UpdatedAt
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating tenant branding {TenantId}", id);
                throw;
            }
        }

        public async Task<bool> SuspendTenantAsync(Guid id)
        {
            try
            {
                var tenant = await _context.Tenants
                    .FirstOrDefaultAsync(t => t.Id == id && !t.IsDeleted);

                if (tenant == null)
                {
                    return false;
                }

                tenant.Status = TenantStatus.Suspended;
                tenant.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error suspending tenant {TenantId}", id);
                throw;
            }
        }

        public async Task<bool> ActivateTenantAsync(Guid id)
        {
            try
            {
                var tenant = await _context.Tenants
                    .FirstOrDefaultAsync(t => t.Id == id && !t.IsDeleted);

                if (tenant == null)
                {
                    return false;
                }

                tenant.Status = TenantStatus.Active;
                tenant.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error activating tenant {TenantId}", id);
                throw;
            }
        }

        public async Task<TenantUsageDto?> GetTenantUsageAsync(Guid id)
        {
            try
            {
                var tenant = await _context.Tenants
                    .FirstOrDefaultAsync(t => t.Id == id && !t.IsDeleted);

                if (tenant == null)
                {
                    return null;
                }

                var activeUsers = await _context.Users
                    .CountAsync(u => u.TenantId == id && !u.IsDeleted && u.Status == UserStatus.Active);

                var totalUsers = await _context.Users
                    .CountAsync(u => u.TenantId == id && !u.IsDeleted);

                var attendanceRecordsThisMonth = await _context.AttendanceRecords
                    .CountAsync(a => a.TenantId == id && 
                               a.Timestamp.Month == DateTime.UtcNow.Month &&
                               a.Timestamp.Year == DateTime.UtcNow.Year);

                var leaveRequestsThisMonth = 0; // TODO: Add when LeaveRequests table is available

                var lastActivity = await _context.AttendanceRecords
                    .Where(a => a.TenantId == id)
                    .OrderByDescending(a => a.Timestamp)
                    .Select(a => a.Timestamp)
                    .FirstOrDefaultAsync();

                return new TenantUsageDto
                {
                    TenantId = id,
                    ActiveUsers = activeUsers,
                    TotalUsers = totalUsers,
                    AttendanceRecordsThisMonth = attendanceRecordsThisMonth,
                    LeaveRequestsThisMonth = leaveRequestsThisMonth,
                    LastActivity = lastActivity
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving tenant usage {TenantId}", id);
                throw;
            }
        }
    }
}
