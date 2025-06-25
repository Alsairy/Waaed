using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using AttendancePlatform.Shared.Domain.DTOs;
using AttendancePlatform.Shared.Domain.Entities;
using AttendancePlatform.UserManagement.Api.Services;
using System.Security.Claims;

namespace AttendancePlatform.UserManagement.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UserManagementController : ControllerBase
    {
        private readonly IUserManagementService _userManagementService;
        private readonly ILogger<UserManagementController> _logger;

        public UserManagementController(
            IUserManagementService userManagementService,
            ILogger<UserManagementController> logger)
        {
            _userManagementService = userManagementService;
            _logger = logger;
        }

        /// <summary>
        /// </summary>
        [HttpGet]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<ActionResult<ApiResponse<IEnumerable<UserDto>>>> GetAllUsers()
        {
            try
            {
                var result = await _userManagementService.GetAllUsersAsync();
                return Ok(ApiResponse<IEnumerable<UserDto>>.SuccessResult(result));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving all users");
                return StatusCode(500, ApiResponse<IEnumerable<UserDto>>.ErrorResult("Internal server error"));
            }
        }

        /// <summary>
        /// </summary>
        [HttpGet("{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<ActionResult<ApiResponse<UserDto>>> GetUser(Guid id)
        {
            try
            {
                var result = await _userManagementService.GetUserByIdAsync(id);
                if (result == null)
                {
                    return NotFound(ApiResponse<UserDto>.ErrorResult("User not found"));
                }
                return Ok(ApiResponse<UserDto>.SuccessResult(result));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user {UserId}", id);
                return StatusCode(500, ApiResponse<UserDto>.ErrorResult("Internal server error"));
            }
        }

        /// <summary>
        /// </summary>
        [HttpGet("email/{email}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<ActionResult<ApiResponse<UserDto>>> GetUserByEmail(string email)
        {
            try
            {
                var result = await _userManagementService.GetUserByEmailAsync(email);
                if (result == null)
                {
                    return NotFound(ApiResponse<UserDto>.ErrorResult("User not found"));
                }
                return Ok(ApiResponse<UserDto>.SuccessResult(result));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user by email {Email}", email);
                return StatusCode(500, ApiResponse<UserDto>.ErrorResult("Internal server error"));
            }
        }

        /// <summary>
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ApiResponse<UserDto>>> CreateUser([FromBody] CreateUserDto request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<UserDto>.ErrorResult("Invalid request data"));
            }

            try
            {
                var result = await _userManagementService.CreateUserAsync(request);
                return CreatedAtAction(nameof(GetUser), new { id = result.Id }, ApiResponse<UserDto>.SuccessResult(result));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating user");
                return StatusCode(500, ApiResponse<UserDto>.ErrorResult("Internal server error"));
            }
        }

        /// <summary>
        /// </summary>
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<ActionResult<ApiResponse<UserDto>>> UpdateUser(Guid id, [FromBody] UpdateUserDto request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<UserDto>.ErrorResult("Invalid request data"));
            }

            try
            {
                var result = await _userManagementService.UpdateUserAsync(id, request);
                if (result == null)
                {
                    return NotFound(ApiResponse<UserDto>.ErrorResult("User not found"));
                }
                return Ok(ApiResponse<UserDto>.SuccessResult(result));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user {UserId}", id);
                return StatusCode(500, ApiResponse<UserDto>.ErrorResult("Internal server error"));
            }
        }

        /// <summary>
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ApiResponse<bool>>> DeleteUser(Guid id)
        {
            try
            {
                var result = await _userManagementService.DeleteUserAsync(id);
                return Ok(ApiResponse<bool>.SuccessResult(result));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting user {UserId}", id);
                return StatusCode(500, ApiResponse<bool>.ErrorResult("Internal server error"));
            }
        }

        /// <summary>
        /// </summary>
        [HttpPost("{userId}/roles/{roleId}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ApiResponse<bool>>> AssignRole(Guid userId, Guid roleId)
        {
            try
            {
                var result = await _userManagementService.AssignRoleAsync(userId, roleId);
                return Ok(ApiResponse<bool>.SuccessResult(result));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error assigning role {RoleId} to user {UserId}", roleId, userId);
                return StatusCode(500, ApiResponse<bool>.ErrorResult("Internal server error"));
            }
        }

        /// <summary>
        /// </summary>
        [HttpDelete("{userId}/roles/{roleId}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ApiResponse<bool>>> RemoveRole(Guid userId, Guid roleId)
        {
            try
            {
                var result = await _userManagementService.RemoveRoleAsync(userId, roleId);
                return Ok(ApiResponse<bool>.SuccessResult(result));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing role {RoleId} from user {UserId}", roleId, userId);
                return StatusCode(500, ApiResponse<bool>.ErrorResult("Internal server error"));
            }
        }

        /// <summary>
        /// </summary>
        [HttpGet("role/{roleName}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<ActionResult<ApiResponse<IEnumerable<UserDto>>>> GetUsersByRole(string roleName)
        {
            try
            {
                var result = await _userManagementService.GetUsersByRoleAsync(roleName);
                return Ok(ApiResponse<IEnumerable<UserDto>>.SuccessResult(result));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving users by role {RoleName}", roleName);
                return StatusCode(500, ApiResponse<IEnumerable<UserDto>>.ErrorResult("Internal server error"));
            }
        }

        /// <summary>
        /// </summary>
        [HttpGet("{managerId}/direct-reports")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<ActionResult<ApiResponse<IEnumerable<UserDto>>>> GetDirectReports(Guid managerId)
        {
            try
            {
                var result = await _userManagementService.GetDirectReportsAsync(managerId);
                return Ok(ApiResponse<IEnumerable<UserDto>>.SuccessResult(result));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving direct reports for manager {ManagerId}", managerId);
                return StatusCode(500, ApiResponse<IEnumerable<UserDto>>.ErrorResult("Internal server error"));
            }
        }

        /// <summary>
        /// </summary>
        [HttpPut("{userId}/manager/{managerId}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<ActionResult<ApiResponse<bool>>> SetManager(Guid userId, Guid managerId)
        {
            try
            {
                var result = await _userManagementService.SetManagerAsync(userId, managerId);
                return Ok(ApiResponse<bool>.SuccessResult(result));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error setting manager {ManagerId} for user {UserId}", managerId, userId);
                return StatusCode(500, ApiResponse<bool>.ErrorResult("Internal server error"));
            }
        }

        /// <summary>
        /// </summary>
        [HttpPost("{id}/activate")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ApiResponse<bool>>> ActivateUser(Guid id)
        {
            try
            {
                var result = await _userManagementService.ActivateUserAsync(id);
                return Ok(ApiResponse<bool>.SuccessResult(result));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error activating user {UserId}", id);
                return StatusCode(500, ApiResponse<bool>.ErrorResult("Internal server error"));
            }
        }

        /// <summary>
        /// </summary>
        [HttpPost("{id}/deactivate")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ApiResponse<bool>>> DeactivateUser(Guid id)
        {
            try
            {
                var result = await _userManagementService.DeactivateUserAsync(id);
                return Ok(ApiResponse<bool>.SuccessResult(result));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deactivating user {UserId}", id);
                return StatusCode(500, ApiResponse<bool>.ErrorResult("Internal server error"));
            }
        }

        /// <summary>
        /// </summary>
        [HttpPost("{id}/suspend")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ApiResponse<bool>>> SuspendUser(Guid id)
        {
            try
            {
                var result = await _userManagementService.SuspendUserAsync(id);
                return Ok(ApiResponse<bool>.SuccessResult(result));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error suspending user {UserId}", id);
                return StatusCode(500, ApiResponse<bool>.ErrorResult("Internal server error"));
            }
        }

        /// <summary>
        /// </summary>
        [HttpGet("{id}/profile")]
        public async Task<ActionResult<ApiResponse<UserProfileDto>>> GetUserProfile(Guid id)
        {
            try
            {
                var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var isAdmin = User.IsInRole("Admin");
                var isManager = User.IsInRole("Manager");
                
                if (!isAdmin && !isManager && currentUserId != id.ToString())
                {
                    return Forbid();
                }

                var result = await _userManagementService.GetUserProfileAsync(id);
                if (result == null)
                {
                    return NotFound(ApiResponse<UserProfileDto>.ErrorResult("User profile not found"));
                }
                return Ok(ApiResponse<UserProfileDto>.SuccessResult(result));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user profile {UserId}", id);
                return StatusCode(500, ApiResponse<UserProfileDto>.ErrorResult("Internal server error"));
            }
        }

        /// <summary>
        /// </summary>
        [HttpPut("{id}/profile")]
        public async Task<ActionResult<ApiResponse<UserProfileDto>>> UpdateUserProfile(Guid id, [FromBody] UpdateUserProfileDto request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<UserProfileDto>.ErrorResult("Invalid request data"));
            }

            try
            {
                var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var isAdmin = User.IsInRole("Admin");
                var isManager = User.IsInRole("Manager");
                
                if (!isAdmin && !isManager && currentUserId != id.ToString())
                {
                    return Forbid();
                }

                var result = await _userManagementService.UpdateUserProfileAsync(id, request);
                if (result == null)
                {
                    return NotFound(ApiResponse<UserProfileDto>.ErrorResult("User profile not found"));
                }
                return Ok(ApiResponse<UserProfileDto>.SuccessResult(result));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user profile {UserId}", id);
                return StatusCode(500, ApiResponse<UserProfileDto>.ErrorResult("Internal server error"));
            }
        }

        /// <summary>
        /// Health check endpoint
        /// </summary>
        [HttpGet("health")]
        [AllowAnonymous]
        public ActionResult<object> Health()
        {
            return Ok(new { status = "healthy", timestamp = DateTime.UtcNow, service = "UserManagement" });
        }
    }
}
