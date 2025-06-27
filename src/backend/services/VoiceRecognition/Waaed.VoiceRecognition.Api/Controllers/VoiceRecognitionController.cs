using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using AttendancePlatform.VoiceRecognition.Api.Services;
using AttendancePlatform.Shared.Domain.DTOs;

namespace AttendancePlatform.VoiceRecognition.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class VoiceRecognitionController : ControllerBase
    {
        private readonly IVoiceRecognitionService _voiceRecognitionService;
        private readonly IVoiceCommandService _voiceCommandService;
        private readonly IVoiceAuthenticationService _voiceAuthenticationService;
        private readonly ILogger<VoiceRecognitionController> _logger;

        public VoiceRecognitionController(
            IVoiceRecognitionService voiceRecognitionService,
            IVoiceCommandService voiceCommandService,
            IVoiceAuthenticationService voiceAuthenticationService,
            ILogger<VoiceRecognitionController> logger)
        {
            _voiceRecognitionService = voiceRecognitionService;
            _voiceCommandService = voiceCommandService;
            _voiceAuthenticationService = voiceAuthenticationService;
            _logger = logger;
        }

        [HttpPost("enroll")]
        public async Task<ActionResult<VoiceEnrollmentDto>> EnrollVoice([FromForm] VoiceEnrollmentRequest request)
        {
            try
            {
                if (request.AudioFile == null || request.AudioFile.Length == 0)
                {
                    return BadRequest(new { message = "Audio file is required" });
                }

                using var memoryStream = new MemoryStream();
                await request.AudioFile.CopyToAsync(memoryStream);
                var audioData = memoryStream.ToArray();

                var result = await _voiceRecognitionService.EnrollVoiceAsync(request.UserId, audioData);
                
                if (result.IsSuccess)
                {
                    return Ok(result);
                }
                
                return BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error enrolling voice for user {UserId}", request.UserId);
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        [HttpPost("verify")]
        public async Task<ActionResult<VoiceVerificationDto>> VerifyVoice([FromForm] VoiceVerificationRequest request)
        {
            try
            {
                if (request.AudioFile == null || request.AudioFile.Length == 0)
                {
                    return BadRequest(new { message = "Audio file is required" });
                }

                using var memoryStream = new MemoryStream();
                await request.AudioFile.CopyToAsync(memoryStream);
                var audioData = memoryStream.ToArray();

                var result = await _voiceRecognitionService.VerifyVoiceAsync(request.UserId, audioData);
                
                if (result.IsSuccess)
                {
                    return Ok(result);
                }
                
                return BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error verifying voice for user {UserId}", request.UserId);
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        [HttpPost("authenticate")]
        public async Task<ActionResult<VoiceAuthenticationDto>> AuthenticateWithVoice([FromForm] VoiceAuthenticationRequest request)
        {
            try
            {
                if (request.AudioFile == null || request.AudioFile.Length == 0)
                {
                    return BadRequest(new { message = "Audio file is required" });
                }

                using var memoryStream = new MemoryStream();
                await request.AudioFile.CopyToAsync(memoryStream);
                var audioData = memoryStream.ToArray();

                var result = await _voiceAuthenticationService.AuthenticateAsync(request.TenantId, audioData, request.Passphrase);
                
                if (result.IsSuccess)
                {
                    return Ok(result);
                }
                
                return Unauthorized(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error authenticating with voice for tenant {TenantId}", request.TenantId);
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        [HttpPost("command")]
        public async Task<ActionResult<VoiceCommandDto>> ProcessVoiceCommand([FromForm] VoiceCommandRequest request)
        {
            try
            {
                if (request.AudioFile == null || request.AudioFile.Length == 0)
                {
                    return BadRequest(new { message = "Audio file is required" });
                }

                using var memoryStream = new MemoryStream();
                await request.AudioFile.CopyToAsync(memoryStream);
                var audioData = memoryStream.ToArray();

                var result = await _voiceCommandService.ProcessCommandAsync(request.UserId, audioData);
                
                if (result.IsSuccess)
                {
                    return Ok(result);
                }
                
                return BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing voice command for user {UserId}", request.UserId);
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        [HttpGet("template/{userId}")]
        public async Task<ActionResult<VoiceTemplateDto>> GetVoiceTemplate(Guid userId)
        {
            try
            {
                var result = await _voiceRecognitionService.GetVoiceTemplateAsync(userId);
                
                if (result.IsSuccess)
                {
                    return Ok(result);
                }
                
                return NotFound(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting voice template for user {UserId}", userId);
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        [HttpDelete("template/{userId}")]
        public async Task<ActionResult> DeleteVoiceTemplate(Guid userId)
        {
            try
            {
                var result = await _voiceRecognitionService.DeleteVoiceTemplateAsync(userId);
                
                if (result.IsSuccess)
                {
                    return NoContent();
                }
                
                return BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting voice template for user {UserId}", userId);
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        [HttpGet("enrollments/{tenantId}")]
        public async Task<ActionResult<List<VoiceEnrollmentDto>>> GetVoiceEnrollments(Guid tenantId)
        {
            try
            {
                var result = await _voiceRecognitionService.GetUserVoiceEnrollmentsAsync(tenantId);
                
                if (result.IsSuccess)
                {
                    return Ok(result);
                }
                
                return BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting voice enrollments for tenant {TenantId}", tenantId);
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        [HttpGet("commands/supported")]
        public async Task<ActionResult<List<SupportedVoiceCommandDto>>> GetSupportedCommands()
        {
            try
            {
                var result = await _voiceCommandService.GetSupportedCommandsAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting supported voice commands");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }
    }

    public class VoiceEnrollmentRequest
    {
        public Guid UserId { get; set; }
        public IFormFile AudioFile { get; set; } = null!;
    }

    public class VoiceVerificationRequest
    {
        public Guid UserId { get; set; }
        public IFormFile AudioFile { get; set; } = null!;
    }

    public class VoiceAuthenticationRequest
    {
        public string TenantId { get; set; } = string.Empty;
        public IFormFile AudioFile { get; set; } = null!;
        public string? Passphrase { get; set; }
    }

    public class VoiceCommandRequest
    {
        public Guid UserId { get; set; }
        public IFormFile AudioFile { get; set; } = null!;
    }
}
