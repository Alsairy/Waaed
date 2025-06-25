using AttendancePlatform.Shared.Domain.DTOs;

namespace AttendancePlatform.TenantManagement.Api.Services
{
    public interface ITenantManagementService
    {
        Task<IEnumerable<TenantDto>> GetAllTenantsAsync();
        Task<TenantDto?> GetTenantByIdAsync(Guid id);
        Task<TenantDto?> GetCurrentTenantAsync();
        Task<TenantDto> CreateTenantAsync(CreateTenantDto createTenantDto);
        Task<TenantDto?> UpdateTenantAsync(Guid id, UpdateTenantDto updateTenantDto);
        Task<TenantDto?> UpdateTenantBrandingAsync(Guid id, TenantSettingsDto settingsDto);
        Task<bool> SuspendTenantAsync(Guid id);
        Task<bool> ActivateTenantAsync(Guid id);
        Task<TenantUsageDto?> GetTenantUsageAsync(Guid id);
    }
}
