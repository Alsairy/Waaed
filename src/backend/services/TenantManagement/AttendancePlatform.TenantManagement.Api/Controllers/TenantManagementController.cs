using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using AttendancePlatform.Shared.Domain.DTOs;
using AttendancePlatform.Shared.Domain.Entities;
using AttendancePlatform.TenantManagement.Api.Services;
using System.Security.Claims;

namespace AttendancePlatform.TenantManagement.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class TenantManagementController : ControllerBase
    {
        private readonly ITenantManagementService _tenantManagementService;
        private readonly ILogger<TenantManagementController> _logger;

        public TenantManagementController(
            ITenantManagementService tenantManagementService,
            ILogger<TenantManagementController> logger)
        {
            _tenantManagementService = tenantManagementService;
            _logger = logger;
        }

        /// <summary>
        /// </summary>
        [HttpGet]
        [Authorize(Roles = "SuperAdmin")]
        public async Task<ActionResult<ApiResponse<IEnumerable<TenantDto>>>> GetAllTenants()
        {
            try
            {
                var result = await _tenantManagementService.GetAllTenantsAsync();
                return Ok(ApiResponse<IEnumerable<TenantDto>>.SuccessResult(result));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving all tenants");
                return StatusCode(500, ApiResponse<IEnumerable<TenantDto>>.ErrorResult("Internal server error"));
            }
        }

        /// <summary>
        /// </summary>
        [HttpGet("current")]
        public async Task<ActionResult<ApiResponse<TenantDto>>> GetCurrentTenant()
        {
            try
            {
                var tenantId = User.FindFirst("TenantId")?.Value;
                if (string.IsNullOrEmpty(tenantId))
                {
                    return BadRequest(ApiResponse<TenantDto>.ErrorResult("Tenant ID not found in token"));
                }

                var result = await _tenantManagementService.GetTenantByIdAsync(Guid.Parse(tenantId));
                if (result == null)
                {
                    return NotFound(ApiResponse<TenantDto>.ErrorResult("Tenant not found"));
                }
                return Ok(ApiResponse<TenantDto>.SuccessResult(result));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving current tenant");
                return StatusCode(500, ApiResponse<TenantDto>.ErrorResult("Internal server error"));
            }
        }

        /// <summary>
        /// </summary>
        [HttpGet("{id}")]
        [Authorize(Roles = "SuperAdmin,Admin")]
        public async Task<ActionResult<ApiResponse<TenantDto>>> GetTenant(Guid id)
        {
            try
            {
                var result = await _tenantManagementService.GetTenantByIdAsync(id);
                if (result == null)
                {
                    return NotFound(ApiResponse<TenantDto>.ErrorResult("Tenant not found"));
                }
                return Ok(ApiResponse<TenantDto>.SuccessResult(result));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving tenant {TenantId}", id);
                return StatusCode(500, ApiResponse<TenantDto>.ErrorResult("Internal server error"));
            }
        }

        /// <summary>
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "SuperAdmin")]
        public async Task<ActionResult<ApiResponse<TenantDto>>> CreateTenant([FromBody] CreateTenantDto request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<TenantDto>.ErrorResult("Invalid request data"));
            }

            try
            {
                var result = await _tenantManagementService.CreateTenantAsync(request);
                return CreatedAtAction(nameof(GetTenant), new { id = result.Id }, ApiResponse<TenantDto>.SuccessResult(result));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating tenant");
                return StatusCode(500, ApiResponse<TenantDto>.ErrorResult("Internal server error"));
            }
        }

        /// <summary>
        /// </summary>
        [HttpPut("{id}")]
        [Authorize(Roles = "SuperAdmin,Admin")]
        public async Task<ActionResult<ApiResponse<TenantDto>>> UpdateTenant(Guid id, [FromBody] UpdateTenantDto request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<TenantDto>.ErrorResult("Invalid request data"));
            }

            try
            {
                var result = await _tenantManagementService.UpdateTenantAsync(id, request);
                if (result == null)
                {
                    return NotFound(ApiResponse<TenantDto>.ErrorResult("Tenant not found"));
                }
                return Ok(ApiResponse<TenantDto>.SuccessResult(result));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating tenant {TenantId}", id);
                return StatusCode(500, ApiResponse<TenantDto>.ErrorResult("Internal server error"));
            }
        }

        /// <summary>
        /// </summary>
        [HttpPut("{id}/branding")]
        [Authorize(Roles = "SuperAdmin,Admin")]
        public async Task<ActionResult<ApiResponse<TenantDto>>> UpdateTenantBranding(Guid id, [FromBody] TenantSettingsDto request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<TenantDto>.ErrorResult("Invalid request data"));
            }

            try
            {
                request.TenantId = id;
                var result = await _tenantManagementService.UpdateTenantBrandingAsync(id, request);
                if (result == null)
                {
                    return NotFound(ApiResponse<TenantDto>.ErrorResult("Tenant not found"));
                }
                return Ok(ApiResponse<TenantDto>.SuccessResult(result));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating tenant branding {TenantId}", id);
                return StatusCode(500, ApiResponse<TenantDto>.ErrorResult("Internal server error"));
            }
        }

        /// <summary>
        /// </summary>
        [HttpPost("{id}/suspend")]
        [Authorize(Roles = "SuperAdmin")]
        public async Task<ActionResult<ApiResponse<bool>>> SuspendTenant(Guid id)
        {
            try
            {
                var result = await _tenantManagementService.SuspendTenantAsync(id);
                return Ok(ApiResponse<bool>.SuccessResult(result));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error suspending tenant {TenantId}", id);
                return StatusCode(500, ApiResponse<bool>.ErrorResult("Internal server error"));
            }
        }

        /// <summary>
        /// </summary>
        [HttpPost("{id}/activate")]
        [Authorize(Roles = "SuperAdmin")]
        public async Task<ActionResult<ApiResponse<bool>>> ActivateTenant(Guid id)
        {
            try
            {
                var result = await _tenantManagementService.ActivateTenantAsync(id);
                return Ok(ApiResponse<bool>.SuccessResult(result));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error activating tenant {TenantId}", id);
                return StatusCode(500, ApiResponse<bool>.ErrorResult("Internal server error"));
            }
        }

        /// <summary>
        /// </summary>
        [HttpGet("{id}/usage")]
        [Authorize(Roles = "SuperAdmin,Admin")]
        public async Task<ActionResult<ApiResponse<TenantUsageDto>>> GetTenantUsage(Guid id)
        {
            try
            {
                var result = await _tenantManagementService.GetTenantUsageAsync(id);
                if (result == null)
                {
                    return NotFound(ApiResponse<TenantUsageDto>.ErrorResult("Tenant not found"));
                }
                return Ok(ApiResponse<TenantUsageDto>.SuccessResult(result));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving tenant usage {TenantId}", id);
                return StatusCode(500, ApiResponse<TenantUsageDto>.ErrorResult("Internal server error"));
            }
        }

        /// <summary>
        /// Health check endpoint
        /// </summary>
        [HttpGet("health")]
        [AllowAnonymous]
        public ActionResult<object> Health()
        {
            return Ok(new { status = "healthy", timestamp = DateTime.UtcNow, service = "TenantManagement" });
        }
    }
}
