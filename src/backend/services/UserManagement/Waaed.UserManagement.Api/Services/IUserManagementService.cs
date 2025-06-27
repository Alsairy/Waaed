using AttendancePlatform.Shared.Domain.DTOs;

namespace AttendancePlatform.UserManagement.Api.Services
{
    public interface IUserManagementService
    {
        Task<IEnumerable<UserDto>> GetAllUsersAsync();
        Task<UserDto?> GetUserByIdAsync(Guid id);
        Task<UserDto?> GetUserByEmailAsync(string email);
        Task<UserDto> CreateUserAsync(CreateUserDto createUserDto);
        Task<UserDto?> UpdateUserAsync(Guid id, UpdateUserDto updateUserDto);
        Task<bool> DeleteUserAsync(Guid id);
        Task<bool> AssignRoleAsync(Guid userId, Guid roleId);
        Task<bool> RemoveRoleAsync(Guid userId, Guid roleId);
        Task<IEnumerable<UserDto>> GetUsersByRoleAsync(string roleName);
        Task<IEnumerable<UserDto>> GetDirectReportsAsync(Guid managerId);
        Task<bool> SetManagerAsync(Guid userId, Guid managerId);
        Task<bool> ActivateUserAsync(Guid id);
        Task<bool> DeactivateUserAsync(Guid id);
        Task<bool> SuspendUserAsync(Guid id);
        Task<UserProfileDto?> GetUserProfileAsync(Guid id);
        Task<UserProfileDto?> UpdateUserProfileAsync(Guid id, UpdateUserProfileDto updateProfileDto);
    }
}
