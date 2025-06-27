using AttendancePlatform.Shared.Domain.DTOs;
using AttendancePlatform.Shared.Domain.Entities;
using AttendancePlatform.Shared.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AttendancePlatform.UserManagement.Api.Services
{
    public class UserManagementService : IUserManagementService
    {
        private readonly AttendancePlatformDbContext _context;
        private readonly ILogger<UserManagementService> _logger;

        public UserManagementService(
            AttendancePlatformDbContext context,
            ILogger<UserManagementService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<IEnumerable<UserDto>> GetAllUsersAsync()
        {
            try
            {
                var users = await _context.Users
                    .Where(u => !u.IsDeleted)
                    .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                    .Select(u => new UserDto
                    {
                        Id = u.Id,
                        FirstName = u.FirstName,
                        LastName = u.LastName,
                        Email = u.Email,
                        PhoneNumber = u.PhoneNumber,
                        EmployeeId = u.EmployeeId,
                        Department = u.Department,
                        Position = u.Position,
                        ProfilePictureUrl = u.ProfilePictureUrl,
                        Status = u.Status.ToString(),
                        Roles = u.UserRoles.Select(ur => ur.Role.Name)
                    })
                    .ToListAsync();

                return users;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving all users");
                throw;
            }
        }

        public async Task<UserDto?> GetUserByIdAsync(Guid id)
        {
            try
            {
                var user = await _context.Users
                    .Where(u => u.Id == id && !u.IsDeleted)
                    .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                    .Select(u => new UserDto
                    {
                        Id = u.Id,
                        FirstName = u.FirstName,
                        LastName = u.LastName,
                        Email = u.Email,
                        PhoneNumber = u.PhoneNumber,
                        EmployeeId = u.EmployeeId,
                        Department = u.Department,
                        Position = u.Position,
                        ProfilePictureUrl = u.ProfilePictureUrl,
                        Status = u.Status.ToString(),
                        Roles = u.UserRoles.Select(ur => ur.Role.Name)
                    })
                    .FirstOrDefaultAsync();

                return user;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user {UserId}", id);
                throw;
            }
        }

        public async Task<UserDto?> GetUserByEmailAsync(string email)
        {
            try
            {
                var user = await _context.Users
                    .Where(u => u.Email == email && !u.IsDeleted)
                    .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                    .Select(u => new UserDto
                    {
                        Id = u.Id,
                        FirstName = u.FirstName,
                        LastName = u.LastName,
                        Email = u.Email,
                        PhoneNumber = u.PhoneNumber,
                        EmployeeId = u.EmployeeId,
                        Department = u.Department,
                        Position = u.Position,
                        ProfilePictureUrl = u.ProfilePictureUrl,
                        Status = u.Status.ToString(),
                        Roles = u.UserRoles.Select(ur => ur.Role.Name)
                    })
                    .FirstOrDefaultAsync();

                return user;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user by email {Email}", email);
                throw;
            }
        }

        public async Task<UserDto> CreateUserAsync(CreateUserDto request)
        {
            try
            {
                var user = new User
                {
                    Id = Guid.NewGuid(),
                    FirstName = request.FirstName,
                    LastName = request.LastName,
                    Email = request.Email,
                    PhoneNumber = request.PhoneNumber,
                    EmployeeId = request.EmployeeId,
                    Department = request.Department,
                    Position = request.Position,
                    HireDate = request.HireDate,
                    ProfilePictureUrl = request.ProfilePictureUrl,
                    ManagerId = request.ManagerId,
                    Status = UserStatus.Active,
                    IsEmailVerified = false,
                    IsPhoneVerified = false,
                    RequirePasswordChange = request.RequirePasswordChange,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.Users.Add(user);

                if (request.RoleIds.Any())
                {
                    var roles = await _context.Roles
                        .Where(r => request.RoleIds.Contains(r.Id))
                        .ToListAsync();

                    foreach (var role in roles)
                    {
                        _context.UserRoles.Add(new UserRole
                        {
                            UserId = user.Id,
                            RoleId = role.Id,
                            AssignedAt = DateTime.UtcNow
                        });
                    }
                }

                await _context.SaveChangesAsync();

                return new UserDto
                {
                    Id = user.Id,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Email = user.Email,
                    PhoneNumber = user.PhoneNumber,
                    EmployeeId = user.EmployeeId,
                    Department = user.Department,
                    Position = user.Position,
                    ProfilePictureUrl = user.ProfilePictureUrl,
                    Status = user.Status.ToString(),
                    Roles = request.RoleIds.Any() ? 
                        await _context.Roles
                            .Where(r => request.RoleIds.Contains(r.Id))
                            .Select(r => r.Name)
                            .ToListAsync() : 
                        new List<string>()
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating user");
                throw;
            }
        }

        public async Task<UserDto?> UpdateUserAsync(Guid id, UpdateUserDto request)
        {
            try
            {
                var user = await _context.Users
                    .Include(u => u.UserRoles)
                    .FirstOrDefaultAsync(u => u.Id == id && !u.IsDeleted);

                if (user == null)
                {
                    return null;
                }

                if (!string.IsNullOrEmpty(request.FirstName))
                    user.FirstName = request.FirstName;
                if (!string.IsNullOrEmpty(request.LastName))
                    user.LastName = request.LastName;
                if (!string.IsNullOrEmpty(request.Email))
                    user.Email = request.Email;
                if (request.PhoneNumber != null)
                    user.PhoneNumber = request.PhoneNumber;
                if (request.EmployeeId != null)
                    user.EmployeeId = request.EmployeeId;
                if (request.Department != null)
                    user.Department = request.Department;
                if (request.Position != null)
                    user.Position = request.Position;
                if (request.HireDate.HasValue)
                    user.HireDate = request.HireDate;
                if (request.ProfilePictureUrl != null)
                    user.ProfilePictureUrl = request.ProfilePictureUrl;
                if (request.ManagerId.HasValue)
                    user.ManagerId = request.ManagerId;

                user.UpdatedAt = DateTime.UtcNow;

                if (request.RoleIds != null)
                {
                    var existingRoles = user.UserRoles.ToList();
                    _context.UserRoles.RemoveRange(existingRoles);

                    foreach (var roleId in request.RoleIds)
                    {
                        _context.UserRoles.Add(new UserRole
                        {
                            UserId = user.Id,
                            RoleId = roleId,
                            AssignedAt = DateTime.UtcNow
                        });
                    }
                }

                await _context.SaveChangesAsync();

                var updatedUser = await _context.Users
                    .Where(u => u.Id == id)
                    .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                    .FirstOrDefaultAsync();

                return new UserDto
                {
                    Id = updatedUser!.Id,
                    FirstName = updatedUser.FirstName,
                    LastName = updatedUser.LastName,
                    Email = updatedUser.Email,
                    PhoneNumber = updatedUser.PhoneNumber,
                    EmployeeId = updatedUser.EmployeeId,
                    Department = updatedUser.Department,
                    Position = updatedUser.Position,
                    ProfilePictureUrl = updatedUser.ProfilePictureUrl,
                    Status = updatedUser.Status.ToString(),
                    Roles = updatedUser.UserRoles.Select(ur => ur.Role.Name)
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user {UserId}", id);
                throw;
            }
        }

        public async Task<bool> DeleteUserAsync(Guid id)
        {
            try
            {
                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Id == id && !u.IsDeleted);

                if (user == null)
                {
                    return false;
                }

                user.IsDeleted = true;
                user.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting user {UserId}", id);
                throw;
            }
        }

        public async Task<bool> AssignRoleAsync(Guid userId, Guid roleId)
        {
            try
            {
                var existingUserRole = await _context.UserRoles
                    .FirstOrDefaultAsync(ur => ur.UserId == userId && ur.RoleId == roleId);

                if (existingUserRole != null)
                {
                    return true; // Already assigned
                }

                var user = await _context.Users.FindAsync(userId);
                var role = await _context.Roles.FindAsync(roleId);

                if (user == null || role == null)
                {
                    return false;
                }

                _context.UserRoles.Add(new UserRole
                {
                    UserId = userId,
                    RoleId = roleId,
                    AssignedAt = DateTime.UtcNow
                });

                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error assigning role {RoleId} to user {UserId}", roleId, userId);
                throw;
            }
        }

        public async Task<bool> RemoveRoleAsync(Guid userId, Guid roleId)
        {
            try
            {
                var userRole = await _context.UserRoles
                    .FirstOrDefaultAsync(ur => ur.UserId == userId && ur.RoleId == roleId);

                if (userRole == null)
                {
                    return false;
                }

                _context.UserRoles.Remove(userRole);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing role {RoleId} from user {UserId}", roleId, userId);
                throw;
            }
        }

        public async Task<IEnumerable<UserDto>> GetUsersByRoleAsync(string roleName)
        {
            try
            {
                var users = await _context.Users
                    .Where(u => !u.IsDeleted && u.UserRoles.Any(ur => ur.Role.Name == roleName))
                    .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                    .Select(u => new UserDto
                    {
                        Id = u.Id,
                        FirstName = u.FirstName,
                        LastName = u.LastName,
                        Email = u.Email,
                        PhoneNumber = u.PhoneNumber,
                        EmployeeId = u.EmployeeId,
                        Department = u.Department,
                        Position = u.Position,
                        ProfilePictureUrl = u.ProfilePictureUrl,
                        Status = u.Status.ToString(),
                        Roles = u.UserRoles.Select(ur => ur.Role.Name)
                    })
                    .ToListAsync();

                return users;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving users by role {RoleName}", roleName);
                throw;
            }
        }

        public async Task<IEnumerable<UserDto>> GetDirectReportsAsync(Guid managerId)
        {
            try
            {
                var directReports = await _context.Users
                    .Where(u => u.ManagerId == managerId && !u.IsDeleted)
                    .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                    .Select(u => new UserDto
                    {
                        Id = u.Id,
                        FirstName = u.FirstName,
                        LastName = u.LastName,
                        Email = u.Email,
                        PhoneNumber = u.PhoneNumber,
                        EmployeeId = u.EmployeeId,
                        Department = u.Department,
                        Position = u.Position,
                        ProfilePictureUrl = u.ProfilePictureUrl,
                        Status = u.Status.ToString(),
                        Roles = u.UserRoles.Select(ur => ur.Role.Name)
                    })
                    .ToListAsync();

                return directReports;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving direct reports for manager {ManagerId}", managerId);
                throw;
            }
        }

        public async Task<bool> SetManagerAsync(Guid userId, Guid managerId)
        {
            try
            {
                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Id == userId && !u.IsDeleted);

                if (user == null)
                {
                    return false;
                }

                var manager = await _context.Users
                    .FirstOrDefaultAsync(u => u.Id == managerId && !u.IsDeleted);

                if (manager == null)
                {
                    return false;
                }

                user.ManagerId = managerId;
                user.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error setting manager {ManagerId} for user {UserId}", managerId, userId);
                throw;
            }
        }

        public async Task<bool> ActivateUserAsync(Guid id)
        {
            try
            {
                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Id == id && !u.IsDeleted);

                if (user == null)
                {
                    return false;
                }

                user.Status = UserStatus.Active;
                user.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error activating user {UserId}", id);
                throw;
            }
        }

        public async Task<bool> DeactivateUserAsync(Guid id)
        {
            try
            {
                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Id == id && !u.IsDeleted);

                if (user == null)
                {
                    return false;
                }

                user.Status = UserStatus.Inactive;
                user.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deactivating user {UserId}", id);
                throw;
            }
        }

        public async Task<bool> SuspendUserAsync(Guid id)
        {
            try
            {
                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Id == id && !u.IsDeleted);

                if (user == null)
                {
                    return false;
                }

                user.Status = UserStatus.Suspended;
                user.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error suspending user {UserId}", id);
                throw;
            }
        }

        public async Task<UserProfileDto?> GetUserProfileAsync(Guid id)
        {
            try
            {
                var user = await _context.Users
                    .Where(u => u.Id == id && !u.IsDeleted)
                    .Include(u => u.Manager)
                    .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                    .FirstOrDefaultAsync();

                if (user == null)
                {
                    return null;
                }

                return new UserProfileDto
                {
                    Id = user.Id,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Email = user.Email,
                    PhoneNumber = user.PhoneNumber,
                    EmployeeId = user.EmployeeId,
                    Department = user.Department,
                    Position = user.Position,
                    HireDate = user.HireDate,
                    ProfilePictureUrl = user.ProfilePictureUrl,
                    Status = user.Status.ToString(),
                    IsEmailVerified = user.IsEmailVerified,
                    IsPhoneVerified = user.IsPhoneVerified,
                    LastLoginAt = user.LastLoginAt,
                    IsTwoFactorEnabled = user.IsTwoFactorEnabled,
                    ManagerName = user.Manager != null ? $"{user.Manager.FirstName} {user.Manager.LastName}" : null,
                    Roles = user.UserRoles.Select(ur => ur.Role.Name),
                    NotificationPreferences = user.NotificationPreferences
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user profile {UserId}", id);
                throw;
            }
        }

        public async Task<UserProfileDto?> UpdateUserProfileAsync(Guid id, UpdateUserProfileDto request)
        {
            try
            {
                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Id == id && !u.IsDeleted);

                if (user == null)
                {
                    return null;
                }

                if (!string.IsNullOrEmpty(request.FirstName))
                    user.FirstName = request.FirstName;
                if (!string.IsNullOrEmpty(request.LastName))
                    user.LastName = request.LastName;
                if (request.PhoneNumber != null)
                    user.PhoneNumber = request.PhoneNumber;
                if (request.ProfilePictureUrl != null)
                    user.ProfilePictureUrl = request.ProfilePictureUrl;
                if (request.NotificationPreferences != null)
                    user.NotificationPreferences = request.NotificationPreferences;
                if (request.IsTwoFactorEnabled.HasValue)
                    user.IsTwoFactorEnabled = request.IsTwoFactorEnabled.Value;

                user.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return await GetUserProfileAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user profile {UserId}", id);
                throw;
            }
        }
    }
}
