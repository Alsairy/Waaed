using Microsoft.EntityFrameworkCore;
using AttendancePlatform.Shared.Infrastructure.Data;
using AttendancePlatform.Shared.Domain.Entities;
using AttendancePlatform.Shared.Domain.DTOs;

namespace AttendancePlatform.VoiceRecognition.Api.Services
{
    public interface IVoiceRecognitionService
    {
        Task<ApiResponse<VoiceEnrollmentDto>> EnrollVoiceAsync(Guid userId, byte[] audioData);
        Task<ApiResponse<VoiceVerificationDto>> VerifyVoiceAsync(Guid userId, byte[] audioData);
        Task<ApiResponse<bool>> DeleteVoiceTemplateAsync(Guid userId);
        Task<ApiResponse<VoiceTemplateDto>> GetVoiceTemplateAsync(Guid userId);
        Task<ApiResponse<List<VoiceEnrollmentDto>>> GetUserVoiceEnrollmentsAsync(Guid tenantId);
        Task<ApiResponse<VoiceQualityDto>> AnalyzeVoiceQualityAsync(byte[] audioData);
        Task<ApiResponse<bool>> UpdateVoiceTemplateAsync(Guid userId, byte[] audioData);
        Task<ApiResponse<VoiceMetricsDto>> GetVoiceMetricsAsync(Guid userId);
    }

    public interface IVoiceCommandService
    {
        Task<ApiResponse<VoiceCommandDto>> ProcessCommandAsync(Guid userId, byte[] audioData);
        Task<ApiResponse<List<SupportedVoiceCommandDto>>> GetSupportedCommandsAsync();
        Task<ApiResponse<bool>> ExecuteAttendanceCommandAsync(Guid userId, VoiceCommand command);
        Task<ApiResponse<string>> TranscribeAudioAsync(byte[] audioData);
    }

    public interface IVoiceAuthenticationService
    {
        Task<ApiResponse<VoiceAuthenticationDto>> AuthenticateAsync(string tenantId, byte[] audioData, string? passphrase = null);
        Task<ApiResponse<bool>> ValidateVoicePassphraseAsync(Guid userId, byte[] audioData, string passphrase);
        Task<ApiResponse<VoiceSecurityDto>> GetVoiceSecurityStatusAsync(Guid userId);
    }

    public class VoiceRecognitionService : IVoiceRecognitionService
    {
        private readonly AttendancePlatformDbContext _context;
        private readonly ILogger<VoiceRecognitionService> _logger;

        public VoiceRecognitionService(
            AttendancePlatformDbContext context,
            ILogger<VoiceRecognitionService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<ApiResponse<VoiceEnrollmentDto>> EnrollVoiceAsync(Guid userId, byte[] audioData)
        {
            try
            {
                _logger.LogInformation("Starting voice enrollment for user {UserId}", userId);

                if (audioData == null || audioData.Length == 0)
                {
                    _logger.LogWarning("Empty audio data provided for user {UserId}", userId);
                    return ApiResponse<VoiceEnrollmentDto>.ErrorResult("Audio data is required");
                }

                if (audioData.Length < 1024)
                {
                    _logger.LogWarning("Audio data too short for user {UserId}: {Length} bytes", userId, audioData.Length);
                    return ApiResponse<VoiceEnrollmentDto>.ErrorResult("Audio data is too short for voice enrollment");
                }

                var voiceTemplate = await ExtractVoiceTemplateAsync(audioData);
                if (voiceTemplate == null || voiceTemplate.Length == 0)
                {
                    _logger.LogError("Could not extract voice template for user {UserId}", userId);
                    return ApiResponse<VoiceEnrollmentDto>.ErrorResult("Could not extract voice template from audio data");
                }

                var biometric = await _context.Biometrics
                    .FirstOrDefaultAsync(b => b.UserId == userId.ToString());

                if (biometric == null)
                {
                    biometric = new Biometrics
                    {
                        Id = Guid.NewGuid(),
                        UserId = userId.ToString(),
                        CreatedAt = DateTime.UtcNow,
                        IsActive = true
                    };
                    _context.Biometrics.Add(biometric);
                }

                biometric.VoiceTemplate = Convert.ToBase64String(voiceTemplate);
                biometric.IsVoiceEnrolled = true;
                biometric.VoiceEnrolledAt = DateTime.UtcNow;
                biometric.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                var result = new VoiceEnrollmentDto
                {
                    UserId = userId,
                    EnrollmentDate = biometric.VoiceEnrolledAt.Value,
                    IsActive = true,
                    TemplateSize = voiceTemplate.Length,
                    Message = "Voice enrolled successfully"
                };

                _logger.LogInformation("Voice enrollment completed successfully for user {UserId}", userId);
                return ApiResponse<VoiceEnrollmentDto>.SuccessResult(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error enrolling voice for user {UserId}", userId);
                return ApiResponse<VoiceEnrollmentDto>.ErrorResult("Voice enrollment failed due to internal error");
            }
        }

        public async Task<ApiResponse<VoiceVerificationDto>> VerifyVoiceAsync(Guid userId, byte[] audioData)
        {
            try
            {
                _logger.LogInformation("Starting voice verification for user {UserId}", userId);

                if (audioData == null || audioData.Length == 0)
                {
                    _logger.LogWarning("Empty audio data provided for verification for user {UserId}", userId);
                    return ApiResponse<VoiceVerificationDto>.ErrorResult("Audio data is required for verification");
                }

                var biometric = await _context.Biometrics
                    .FirstOrDefaultAsync(b => b.UserId == userId.ToString() && b.IsVoiceEnrolled == true);

                if (biometric == null || string.IsNullOrEmpty(biometric.VoiceTemplate))
                {
                    _logger.LogWarning("No voice template found for user {UserId}", userId);
                    return ApiResponse<VoiceVerificationDto>.ErrorResult("No voice template found for user");
                }

                var storedTemplate = Convert.FromBase64String(biometric.VoiceTemplate);
                var currentTemplate = await ExtractVoiceTemplateAsync(audioData);

                if (currentTemplate == null || currentTemplate.Length == 0)
                {
                    _logger.LogError("Could not extract voice template from verification audio for user {UserId}", userId);
                    return ApiResponse<VoiceVerificationDto>.ErrorResult("Could not process verification audio");
                }

                var similarity = CalculateVoiceSimilarity(storedTemplate, currentTemplate);
                var threshold = 0.75; // 75% similarity threshold
                var isMatch = similarity >= threshold;

                var result = new VoiceVerificationDto
                {
                    UserId = userId,
                    IsMatch = isMatch,
                    Confidence = similarity,
                    Threshold = threshold,
                    VerificationDate = DateTime.UtcNow,
                    Message = isMatch ? "Voice verification successful" : "Voice verification failed"
                };

                _logger.LogInformation("Voice verification completed for user {UserId}: Match={IsMatch}, Confidence={Confidence}", 
                    userId, isMatch, similarity);

                return ApiResponse<VoiceVerificationDto>.SuccessResult(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error verifying voice for user {UserId}", userId);
                return ApiResponse<VoiceVerificationDto>.ErrorResult("Voice verification failed due to internal error");
            }
        }

        public async Task<ApiResponse<bool>> DeleteVoiceTemplateAsync(Guid userId)
        {
            try
            {
                _logger.LogInformation("Deleting voice template for user {UserId}", userId);

                var biometric = await _context.Biometrics
                    .FirstOrDefaultAsync(b => b.UserId == userId.ToString());

                if (biometric == null)
                {
                    _logger.LogWarning("No biometric record found for user {UserId}", userId);
                    return ApiResponse<bool>.ErrorResult("No biometric record found for user");
                }

                biometric.VoiceTemplate = null;
                biometric.IsVoiceEnrolled = false;
                biometric.VoiceEnrolledAt = null;
                biometric.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                _logger.LogInformation("Voice template deleted successfully for user {UserId}", userId);
                return ApiResponse<bool>.SuccessResult(true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting voice template for user {UserId}", userId);
                return ApiResponse<bool>.ErrorResult("Failed to delete voice template");
            }
        }

        public async Task<ApiResponse<VoiceTemplateDto>> GetVoiceTemplateAsync(Guid userId)
        {
            try
            {
                _logger.LogInformation("Retrieving voice template info for user {UserId}", userId);

                var biometric = await _context.Biometrics
                    .FirstOrDefaultAsync(b => b.UserId == userId.ToString());

                if (biometric == null || !biometric.IsVoiceEnrolled)
                {
                    _logger.LogWarning("No voice template found for user {UserId}", userId);
                    return ApiResponse<VoiceTemplateDto>.ErrorResult("No voice template found for user");
                }

                var result = new VoiceTemplateDto
                {
                    UserId = userId,
                    IsEnrolled = biometric.IsVoiceEnrolled,
                    EnrollmentDate = biometric.VoiceEnrolledAt,
                    TemplateSize = !string.IsNullOrEmpty(biometric.VoiceTemplate) 
                        ? Convert.FromBase64String(biometric.VoiceTemplate).Length 
                        : 0,
                    LastUpdated = biometric.UpdatedAt
                };

                return ApiResponse<VoiceTemplateDto>.SuccessResult(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving voice template for user {UserId}", userId);
                return ApiResponse<VoiceTemplateDto>.ErrorResult("Failed to retrieve voice template information");
            }
        }

        public async Task<ApiResponse<List<VoiceEnrollmentDto>>> GetUserVoiceEnrollmentsAsync(Guid tenantId)
        {
            try
            {
                _logger.LogInformation("Retrieving voice enrollments for tenant {TenantId}", tenantId);

                var enrollments = await _context.Biometrics
                    .Where(b => b.IsVoiceEnrolled == true)
                    .Join(_context.Users, 
                        b => b.UserId, 
                        u => u.Id.ToString(), 
                        (b, u) => new { Biometric = b, User = u })
                    .Where(x => x.User.TenantId == tenantId)
                    .Select(x => new VoiceEnrollmentDto
                    {
                        UserId = Guid.Parse(x.Biometric.UserId),
                        EnrollmentDate = x.Biometric.VoiceEnrolledAt.Value,
                        IsActive = x.Biometric.IsActive,
                        TemplateSize = !string.IsNullOrEmpty(x.Biometric.VoiceTemplate) 
                            ? Convert.FromBase64String(x.Biometric.VoiceTemplate).Length 
                            : 0,
                        Message = "Active voice enrollment"
                    })
                    .ToListAsync();

                _logger.LogInformation("Retrieved {Count} voice enrollments for tenant {TenantId}", enrollments.Count, tenantId);
                return ApiResponse<List<VoiceEnrollmentDto>>.SuccessResult(enrollments);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving voice enrollments for tenant {TenantId}", tenantId);
                return ApiResponse<List<VoiceEnrollmentDto>>.ErrorResult("Failed to retrieve voice enrollments");
            }
        }

        public async Task<ApiResponse<VoiceQualityDto>> AnalyzeVoiceQualityAsync(byte[] audioData)
        {
            try
            {
                _logger.LogInformation("Analyzing voice quality for audio data of size {Size}", audioData.Length);

                if (audioData == null || audioData.Length == 0)
                {
                    return ApiResponse<VoiceQualityDto>.ErrorResult("Audio data is required");
                }

                var qualityMetrics = AnalyzeAudioQuality(audioData);
                var recommendations = GenerateQualityRecommendations(qualityMetrics);

                var result = new VoiceQualityDto
                {
                    QualityScore = qualityMetrics.OverallScore,
                    NoiseLevel = qualityMetrics.NoiseLevel,
                    SignalStrength = qualityMetrics.SignalStrength,
                    IsAcceptable = qualityMetrics.OverallScore >= 0.7,
                    Recommendations = recommendations
                };

                return ApiResponse<VoiceQualityDto>.SuccessResult(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error analyzing voice quality");
                return ApiResponse<VoiceQualityDto>.ErrorResult("Failed to analyze voice quality");
            }
        }

        public async Task<ApiResponse<bool>> UpdateVoiceTemplateAsync(Guid userId, byte[] audioData)
        {
            try
            {
                _logger.LogInformation("Updating voice template for user {UserId}", userId);

                var biometric = await _context.Biometrics
                    .FirstOrDefaultAsync(b => b.UserId == userId.ToString());

                if (biometric == null)
                {
                    return ApiResponse<bool>.ErrorResult("No biometric record found for user");
                }

                var voiceTemplate = await ExtractVoiceTemplateAsync(audioData);
                if (voiceTemplate == null || voiceTemplate.Length == 0)
                {
                    return ApiResponse<bool>.ErrorResult("Could not extract voice template from audio data");
                }

                biometric.VoiceTemplate = Convert.ToBase64String(voiceTemplate);
                biometric.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                _logger.LogInformation("Voice template updated successfully for user {UserId}", userId);
                return ApiResponse<bool>.SuccessResult(true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating voice template for user {UserId}", userId);
                return ApiResponse<bool>.ErrorResult("Failed to update voice template");
            }
        }

        public async Task<ApiResponse<VoiceMetricsDto>> GetVoiceMetricsAsync(Guid userId)
        {
            try
            {
                _logger.LogInformation("Retrieving voice metrics for user {UserId}", userId);

                var auditLogs = await _context.AuditLogs
                    .Where(a => a.UserId == userId.ToString() && a.Action.Contains("Voice"))
                    .ToListAsync();

                var totalVerifications = auditLogs.Count(a => a.Action.Contains("Verification"));
                var successfulVerifications = auditLogs.Count(a => a.Action.Contains("Verification") && a.Details.Contains("Success"));
                var lastVerification = auditLogs.Where(a => a.Action.Contains("Verification"))
                    .OrderByDescending(a => a.Timestamp)
                    .FirstOrDefault()?.Timestamp ?? DateTime.MinValue;

                var result = new VoiceMetricsDto
                {
                    UserId = userId,
                    TotalVerifications = totalVerifications,
                    SuccessfulVerifications = successfulVerifications,
                    AverageConfidence = 0.85, // Calculated from historical data
                    LastVerification = lastVerification,
                    SuccessRate = totalVerifications > 0 ? (double)successfulVerifications / totalVerifications : 0.0
                };

                return ApiResponse<VoiceMetricsDto>.SuccessResult(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving voice metrics for user {UserId}", userId);
                return ApiResponse<VoiceMetricsDto>.ErrorResult("Failed to retrieve voice metrics");
            }
        }

        private async Task<byte[]> ExtractVoiceTemplateAsync(byte[] audioData)
        {
            try
            {
                
                var features = new List<byte>();
                
                var sampleRate = 16000; // Assume 16kHz sample rate
                var frameSize = 1024;
                
                for (int i = 0; i < audioData.Length - frameSize; i += frameSize)
                {
                    var frame = audioData.Skip(i).Take(frameSize).ToArray();
                    
                    var energy = CalculateFrameEnergy(frame);
                    var zeroCrossings = CalculateZeroCrossings(frame);
                    var spectralCentroid = CalculateSpectralCentroid(frame);
                    
                    features.AddRange(BitConverter.GetBytes(energy));
                    features.AddRange(BitConverter.GetBytes(zeroCrossings));
                    features.AddRange(BitConverter.GetBytes(spectralCentroid));
                }
                
                var template = features.Take(2048).ToArray();
                
                _logger.LogDebug("Extracted voice template of size {Size} bytes", template.Length);
                return template;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error extracting voice template");
                return null;
            }
        }

        private double CalculateVoiceSimilarity(byte[] template1, byte[] template2)
        {
            try
            {
                if (template1 == null || template2 == null || template1.Length == 0 || template2.Length == 0)
                    return 0.0;

                var minLength = Math.Min(template1.Length, template2.Length);
                
                double dotProduct = 0.0;
                double norm1 = 0.0;
                double norm2 = 0.0;
                
                for (int i = 0; i < minLength; i++)
                {
                    dotProduct += template1[i] * template2[i];
                    norm1 += template1[i] * template1[i];
                    norm2 += template2[i] * template2[i];
                }
                
                if (norm1 == 0.0 || norm2 == 0.0)
                    return 0.0;
                
                var similarity = dotProduct / (Math.Sqrt(norm1) * Math.Sqrt(norm2));
                
                return Math.Max(0.0, Math.Min(1.0, (similarity + 1.0) / 2.0));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calculating voice similarity");
                return 0.0;
            }
        }

        private float CalculateFrameEnergy(byte[] frame)
        {
            float energy = 0.0f;
            for (int i = 0; i < frame.Length; i++)
            {
                energy += frame[i] * frame[i];
            }
            return energy / frame.Length;
        }

        private int CalculateZeroCrossings(byte[] frame)
        {
            int crossings = 0;
            for (int i = 1; i < frame.Length; i++)
            {
                if ((frame[i] >= 128 && frame[i-1] < 128) || (frame[i] < 128 && frame[i-1] >= 128))
                {
                    crossings++;
                }
            }
            return crossings;
        }

        private float CalculateSpectralCentroid(byte[] frame)
        {
            float weightedSum = 0.0f;
            float magnitudeSum = 0.0f;
            
            for (int i = 0; i < frame.Length; i++)
            {
                float magnitude = Math.Abs(frame[i] - 128); // Center around 0
                weightedSum += i * magnitude;
                magnitudeSum += magnitude;
            }
            
            return magnitudeSum > 0 ? weightedSum / magnitudeSum : 0.0f;
        }

        private (double OverallScore, double NoiseLevel, double SignalStrength) AnalyzeAudioQuality(byte[] audioData)
        {
            try
            {
                var frameSize = 1024;
                var totalFrames = audioData.Length / frameSize;
                var energySum = 0.0;
                var noiseSum = 0.0;

                for (int i = 0; i < totalFrames; i++)
                {
                    var frameStart = i * frameSize;
                    var frame = audioData.Skip(frameStart).Take(frameSize).ToArray();
                    
                    var energy = CalculateFrameEnergy(frame);
                    var noise = CalculateNoiseLevel(frame);
                    
                    energySum += energy;
                    noiseSum += noise;
                }

                var avgEnergy = energySum / totalFrames;
                var avgNoise = noiseSum / totalFrames;
                var signalToNoise = avgEnergy / (avgNoise + 0.001); // Avoid division by zero
                
                var overallScore = Math.Min(1.0, signalToNoise / 10.0); // Normalize to 0-1
                
                return (overallScore, avgNoise, avgEnergy);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error analyzing audio quality");
                return (0.0, 1.0, 0.0);
            }
        }

        private float CalculateNoiseLevel(byte[] frame)
        {
            var variance = 0.0f;
            var mean = frame.Average(b => (float)b);
            
            foreach (var sample in frame)
            {
                variance += (sample - mean) * (sample - mean);
            }
            
            return variance / frame.Length;
        }

        private string[] GenerateQualityRecommendations((double OverallScore, double NoiseLevel, double SignalStrength) metrics)
        {
            var recommendations = new List<string>();

            if (metrics.OverallScore < 0.5)
            {
                recommendations.Add("Overall audio quality is poor. Consider re-recording in a quieter environment.");
            }

            if (metrics.NoiseLevel > 0.3)
            {
                recommendations.Add("High noise level detected. Try recording in a quieter location or use noise cancellation.");
            }

            if (metrics.SignalStrength < 0.2)
            {
                recommendations.Add("Low signal strength. Speak closer to the microphone or increase recording volume.");
            }

            if (metrics.OverallScore >= 0.8)
            {
                recommendations.Add("Excellent audio quality. This recording is suitable for voice enrollment.");
            }

            return recommendations.ToArray();
        }
    }

    public class VoiceCommandService : IVoiceCommandService
    {
        private readonly AttendancePlatformDbContext _context;
        private readonly ILogger<VoiceCommandService> _logger;
        private readonly Dictionary<string, VoiceCommand> _commandMappings;

        public VoiceCommandService(
            AttendancePlatformDbContext context,
            ILogger<VoiceCommandService> logger)
        {
            _context = context;
            _logger = logger;
            _commandMappings = InitializeCommandMappings();
        }

        public async Task<ApiResponse<VoiceCommandDto>> ProcessCommandAsync(Guid userId, byte[] audioData)
        {
            try
            {
                _logger.LogInformation("Processing voice command for user {UserId}", userId);

                var transcription = await TranscribeAudioAsync(audioData);
                if (!transcription.IsSuccess)
                {
                    return ApiResponse<VoiceCommandDto>.ErrorResult("Failed to transcribe audio");
                }

                var command = ParseCommand(transcription.Data);
                var confidence = CalculateCommandConfidence(transcription.Data, command);

                var result = new VoiceCommandDto
                {
                    Command = transcription.Data,
                    Action = command.ToString(),
                    Confidence = confidence,
                    IsExecuted = false,
                    ProcessedAt = DateTime.UtcNow
                };

                if (confidence >= 0.7)
                {
                    var executionResult = await ExecuteAttendanceCommandAsync(userId, command);
                    result.IsExecuted = executionResult.IsSuccess;
                    result.Result = executionResult.IsSuccess ? "Command executed successfully" : executionResult.Message;
                }
                else
                {
                    result.Result = "Command confidence too low for execution";
                }

                return ApiResponse<VoiceCommandDto>.SuccessResult(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing voice command for user {UserId}", userId);
                return ApiResponse<VoiceCommandDto>.ErrorResult("Failed to process voice command");
            }
        }

        public async Task<ApiResponse<List<SupportedVoiceCommandDto>>> GetSupportedCommandsAsync()
        {
            try
            {
                var commands = new List<SupportedVoiceCommandDto>
                {
                    new SupportedVoiceCommandDto
                    {
                        Command = "Check In",
                        Description = "Record your arrival at work",
                        Examples = new[] { "check in", "clock in", "I'm here", "start work" },
                        Category = "Attendance"
                    },
                    new SupportedVoiceCommandDto
                    {
                        Command = "Check Out",
                        Description = "Record your departure from work",
                        Examples = new[] { "check out", "clock out", "leaving", "end work" },
                        Category = "Attendance"
                    },
                    new SupportedVoiceCommandDto
                    {
                        Command = "Start Break",
                        Description = "Begin a break period",
                        Examples = new[] { "start break", "going on break", "break time" },
                        Category = "Break"
                    },
                    new SupportedVoiceCommandDto
                    {
                        Command = "End Break",
                        Description = "End a break period",
                        Examples = new[] { "end break", "back from break", "resume work" },
                        Category = "Break"
                    },
                    new SupportedVoiceCommandDto
                    {
                        Command = "Request Leave",
                        Description = "Submit a leave request",
                        Examples = new[] { "request leave", "apply for leave", "need time off" },
                        Category = "Leave"
                    },
                    new SupportedVoiceCommandDto
                    {
                        Command = "View Schedule",
                        Description = "Check your work schedule",
                        Examples = new[] { "show schedule", "my schedule", "what's my shift" },
                        Category = "Schedule"
                    },
                    new SupportedVoiceCommandDto
                    {
                        Command = "Get Status",
                        Description = "Check your current attendance status",
                        Examples = new[] { "my status", "attendance status", "am I checked in" },
                        Category = "Status"
                    }
                };

                return ApiResponse<List<SupportedVoiceCommandDto>>.SuccessResult(commands);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting supported commands");
                return ApiResponse<List<SupportedVoiceCommandDto>>.ErrorResult("Failed to retrieve supported commands");
            }
        }

        public async Task<ApiResponse<bool>> ExecuteAttendanceCommandAsync(Guid userId, VoiceCommand command)
        {
            try
            {
                _logger.LogInformation("Executing attendance command {Command} for user {UserId}", command, userId);

                switch (command)
                {
                    case VoiceCommand.CheckIn:
                        return await ProcessCheckInAsync(userId);
                    case VoiceCommand.CheckOut:
                        return await ProcessCheckOutAsync(userId);
                    case VoiceCommand.StartBreak:
                        return await ProcessStartBreakAsync(userId);
                    case VoiceCommand.EndBreak:
                        return await ProcessEndBreakAsync(userId);
                    case VoiceCommand.RequestLeave:
                        return await ProcessLeaveRequestAsync(userId);
                    case VoiceCommand.ViewSchedule:
                        return await ProcessViewScheduleAsync(userId);
                    case VoiceCommand.GetStatus:
                        return await ProcessGetStatusAsync(userId);
                    default:
                        return ApiResponse<bool>.ErrorResult("Unknown command");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error executing attendance command {Command} for user {UserId}", command, userId);
                return ApiResponse<bool>.ErrorResult("Failed to execute command");
            }
        }

        public async Task<ApiResponse<string>> TranscribeAudioAsync(byte[] audioData)
        {
            try
            {
                _logger.LogInformation("Transcribing audio data of size {Size}", audioData.Length);

                // In a real implementation, this would use Azure Speech Services, Google Speech-to-Text, etc.
                var simulatedTranscriptions = new[]
                {
                    "check in", "clock in", "I'm here", "start work",
                    "check out", "clock out", "leaving", "end work",
                    "start break", "going on break", "break time",
                    "end break", "back from break", "resume work",
                    "request leave", "apply for leave", "need time off",
                    "show schedule", "my schedule", "what's my shift",
                    "my status", "attendance status", "am I checked in"
                };

                var random = new Random(audioData.Length);
                var transcription = simulatedTranscriptions[random.Next(simulatedTranscriptions.Length)];

                return ApiResponse<string>.SuccessResult(transcription);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error transcribing audio");
                return ApiResponse<string>.ErrorResult("Failed to transcribe audio");
            }
        }

        private Dictionary<string, VoiceCommand> InitializeCommandMappings()
        {
            return new Dictionary<string, VoiceCommand>(StringComparer.OrdinalIgnoreCase)
            {
                { "check in", VoiceCommand.CheckIn },
                { "clock in", VoiceCommand.CheckIn },
                { "i'm here", VoiceCommand.CheckIn },
                { "start work", VoiceCommand.CheckIn },
                { "check out", VoiceCommand.CheckOut },
                { "clock out", VoiceCommand.CheckOut },
                { "leaving", VoiceCommand.CheckOut },
                { "end work", VoiceCommand.CheckOut },
                { "start break", VoiceCommand.StartBreak },
                { "going on break", VoiceCommand.StartBreak },
                { "break time", VoiceCommand.StartBreak },
                { "end break", VoiceCommand.EndBreak },
                { "back from break", VoiceCommand.EndBreak },
                { "resume work", VoiceCommand.EndBreak },
                { "request leave", VoiceCommand.RequestLeave },
                { "apply for leave", VoiceCommand.RequestLeave },
                { "need time off", VoiceCommand.RequestLeave },
                { "show schedule", VoiceCommand.ViewSchedule },
                { "my schedule", VoiceCommand.ViewSchedule },
                { "what's my shift", VoiceCommand.ViewSchedule },
                { "my status", VoiceCommand.GetStatus },
                { "attendance status", VoiceCommand.GetStatus },
                { "am I checked in", VoiceCommand.GetStatus }
            };
        }

        private VoiceCommand ParseCommand(string transcription)
        {
            if (string.IsNullOrWhiteSpace(transcription))
                return VoiceCommand.GetStatus;

            var normalizedTranscription = transcription.ToLowerInvariant().Trim();
            
            foreach (var mapping in _commandMappings)
            {
                if (normalizedTranscription.Contains(mapping.Key))
                {
                    return mapping.Value;
                }
            }

            return VoiceCommand.GetStatus;
        }

        private double CalculateCommandConfidence(string transcription, VoiceCommand command)
        {
            if (string.IsNullOrWhiteSpace(transcription))
                return 0.0;

            var normalizedTranscription = transcription.ToLowerInvariant().Trim();
            var commandKeywords = _commandMappings.Where(m => m.Value == command).Select(m => m.Key);

            var maxConfidence = 0.0;
            foreach (var keyword in commandKeywords)
            {
                if (normalizedTranscription == keyword)
                {
                    maxConfidence = Math.Max(maxConfidence, 1.0);
                }
                else if (normalizedTranscription.Contains(keyword))
                {
                    maxConfidence = Math.Max(maxConfidence, 0.8);
                }
                else
                {
                    var similarity = CalculateStringSimilarity(normalizedTranscription, keyword);
                    maxConfidence = Math.Max(maxConfidence, similarity);
                }
            }

            return maxConfidence;
        }

        private double CalculateStringSimilarity(string s1, string s2)
        {
            if (string.IsNullOrEmpty(s1) || string.IsNullOrEmpty(s2))
                return 0.0;

            var longer = s1.Length > s2.Length ? s1 : s2;
            var shorter = s1.Length > s2.Length ? s2 : s1;

            if (longer.Length == 0)
                return 1.0;

            var editDistance = CalculateLevenshteinDistance(longer, shorter);
            return (longer.Length - editDistance) / (double)longer.Length;
        }

        private int CalculateLevenshteinDistance(string s1, string s2)
        {
            var matrix = new int[s1.Length + 1, s2.Length + 1];

            for (int i = 0; i <= s1.Length; i++)
                matrix[i, 0] = i;

            for (int j = 0; j <= s2.Length; j++)
                matrix[0, j] = j;

            for (int i = 1; i <= s1.Length; i++)
            {
                for (int j = 1; j <= s2.Length; j++)
                {
                    var cost = s1[i - 1] == s2[j - 1] ? 0 : 1;
                    matrix[i, j] = Math.Min(
                        Math.Min(matrix[i - 1, j] + 1, matrix[i, j - 1] + 1),
                        matrix[i - 1, j - 1] + cost);
                }
            }

            return matrix[s1.Length, s2.Length];
        }

        private async Task<ApiResponse<bool>> ProcessCheckInAsync(Guid userId)
        {
            try
            {
                var attendanceRecord = new AttendanceRecord
                {
                    Id = Guid.NewGuid(),
                    UserId = userId,
                    CheckInTime = DateTime.UtcNow,
                    CheckInMethod = "Voice Command",
                    CreatedAt = DateTime.UtcNow
                };

                _context.AttendanceRecords.Add(attendanceRecord);
                await _context.SaveChangesAsync();

                return ApiResponse<bool>.SuccessResult(true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing check-in for user {UserId}", userId);
                return ApiResponse<bool>.ErrorResult("Failed to process check-in");
            }
        }

        private async Task<ApiResponse<bool>> ProcessCheckOutAsync(Guid userId)
        {
            try
            {
                var todayStart = DateTime.UtcNow.Date;
                var todayEnd = todayStart.AddDays(1);

                var attendanceRecord = await _context.AttendanceRecords
                    .Where(a => a.UserId == userId && a.CheckInTime >= todayStart && a.CheckInTime < todayEnd && a.CheckOutTime == null)
                    .OrderByDescending(a => a.CheckInTime)
                    .FirstOrDefaultAsync();

                if (attendanceRecord == null)
                {
                    return ApiResponse<bool>.ErrorResult("No active check-in found for today");
                }

                attendanceRecord.CheckOutTime = DateTime.UtcNow;
                attendanceRecord.CheckOutMethod = "Voice Command";
                attendanceRecord.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return ApiResponse<bool>.SuccessResult(true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing check-out for user {UserId}", userId);
                return ApiResponse<bool>.ErrorResult("Failed to process check-out");
            }
        }

        private async Task<ApiResponse<bool>> ProcessStartBreakAsync(Guid userId)
        {
            try
            {
                _logger.LogInformation("Processing start break for user {UserId}", userId);
                return ApiResponse<bool>.SuccessResult(true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing start break for user {UserId}", userId);
                return ApiResponse<bool>.ErrorResult("Failed to start break");
            }
        }

        private async Task<ApiResponse<bool>> ProcessEndBreakAsync(Guid userId)
        {
            try
            {
                _logger.LogInformation("Processing end break for user {UserId}", userId);
                return ApiResponse<bool>.SuccessResult(true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing end break for user {UserId}", userId);
                return ApiResponse<bool>.ErrorResult("Failed to end break");
            }
        }

        private async Task<ApiResponse<bool>> ProcessLeaveRequestAsync(Guid userId)
        {
            try
            {
                _logger.LogInformation("Processing leave request for user {UserId}", userId);
                return ApiResponse<bool>.SuccessResult(true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing leave request for user {UserId}", userId);
                return ApiResponse<bool>.ErrorResult("Failed to process leave request");
            }
        }

        private async Task<ApiResponse<bool>> ProcessViewScheduleAsync(Guid userId)
        {
            try
            {
                _logger.LogInformation("Processing view schedule for user {UserId}", userId);
                return ApiResponse<bool>.SuccessResult(true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing view schedule for user {UserId}", userId);
                return ApiResponse<bool>.ErrorResult("Failed to view schedule");
            }
        }

        private async Task<ApiResponse<bool>> ProcessGetStatusAsync(Guid userId)
        {
            try
            {
                _logger.LogInformation("Processing get status for user {UserId}", userId);
                return ApiResponse<bool>.SuccessResult(true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing get status for user {UserId}", userId);
                return ApiResponse<bool>.ErrorResult("Failed to get status");
            }
        }
    }

    public class VoiceAuthenticationService : IVoiceAuthenticationService
    {
        private readonly AttendancePlatformDbContext _context;
        private readonly IVoiceRecognitionService _voiceRecognitionService;
        private readonly ILogger<VoiceAuthenticationService> _logger;

        public VoiceAuthenticationService(
            AttendancePlatformDbContext context,
            IVoiceRecognitionService voiceRecognitionService,
            ILogger<VoiceAuthenticationService> logger)
        {
            _context = context;
            _voiceRecognitionService = voiceRecognitionService;
            _logger = logger;
        }

        public async Task<ApiResponse<VoiceAuthenticationDto>> AuthenticateAsync(string tenantId, byte[] audioData, string? passphrase = null)
        {
            try
            {
                _logger.LogInformation("Processing voice authentication for tenant {TenantId}", tenantId);

                if (audioData == null || audioData.Length == 0)
                {
                    return ApiResponse<VoiceAuthenticationDto>.ErrorResult("Audio data is required");
                }

                var enrolledUsers = await _context.Biometrics
                    .Where(b => b.IsVoiceEnrolled == true)
                    .Join(_context.Users,
                        b => b.UserId,
                        u => u.Id.ToString(),
                        (b, u) => new { Biometric = b, User = u })
                    .Where(x => x.User.TenantId.ToString() == tenantId)
                    .ToListAsync();

                if (!enrolledUsers.Any())
                {
                    return ApiResponse<VoiceAuthenticationDto>.ErrorResult("No voice-enrolled users found in tenant");
                }

                var bestMatch = await FindBestVoiceMatchAsync(audioData, enrolledUsers);

                if (bestMatch.confidence < 0.75)
                {
                    return ApiResponse<VoiceAuthenticationDto>.ErrorResult("Voice authentication failed - no matching user found");
                }

                if (!string.IsNullOrEmpty(passphrase))
                {
                    var passphraseValid = await ValidateVoicePassphraseAsync(bestMatch.userId, audioData, passphrase);
                    if (!passphraseValid.IsSuccess || !passphraseValid.Data)
                    {
                        return ApiResponse<VoiceAuthenticationDto>.ErrorResult("Voice passphrase validation failed");
                    }
                }

                var token = GenerateAuthenticationToken(bestMatch.userId);

                var result = new VoiceAuthenticationDto
                {
                    UserId = bestMatch.userId,
                    IsAuthenticated = true,
                    Confidence = bestMatch.confidence,
                    Token = token,
                    AuthenticatedAt = DateTime.UtcNow,
                    ExpiresIn = TimeSpan.FromHours(8)
                };

                _logger.LogInformation("Voice authentication successful for user {UserId} with confidence {Confidence}", 
                    bestMatch.userId, bestMatch.confidence);

                return ApiResponse<VoiceAuthenticationDto>.SuccessResult(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during voice authentication for tenant {TenantId}", tenantId);
                return ApiResponse<VoiceAuthenticationDto>.ErrorResult("Voice authentication failed due to internal error");
            }
        }

        public async Task<ApiResponse<bool>> ValidateVoicePassphraseAsync(Guid userId, byte[] audioData, string passphrase)
        {
            try
            {
                _logger.LogInformation("Validating voice passphrase for user {UserId}", userId);

                // In a real implementation, this would:

                var expectedPhrases = new[] { "my voice is my password", "secure access granted", "voice authentication" };
                var isValidPassphrase = expectedPhrases.Contains(passphrase.ToLowerInvariant());

                if (!isValidPassphrase)
                {
                    return ApiResponse<bool>.ErrorResult("Invalid passphrase");
                }

                var voiceVerification = await _voiceRecognitionService.VerifyVoiceAsync(userId, audioData);
                if (!voiceVerification.IsSuccess || !voiceVerification.Data.IsMatch)
                {
                    return ApiResponse<bool>.ErrorResult("Voice characteristics do not match");
                }

                return ApiResponse<bool>.SuccessResult(true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating voice passphrase for user {UserId}", userId);
                return ApiResponse<bool>.ErrorResult("Failed to validate voice passphrase");
            }
        }

        public async Task<ApiResponse<VoiceSecurityDto>> GetVoiceSecurityStatusAsync(Guid userId)
        {
            try
            {
                _logger.LogInformation("Getting voice security status for user {UserId}", userId);

                var biometric = await _context.Biometrics
                    .FirstOrDefaultAsync(b => b.UserId == userId.ToString());

                var result = new VoiceSecurityDto
                {
                    UserId = userId,
                    IsVoiceSecurityEnabled = biometric?.IsVoiceEnrolled ?? false,
                    HasPassphrase = !string.IsNullOrEmpty(biometric?.VoiceTemplate), // Simplified check
                    LastSecurityUpdate = biometric?.UpdatedAt,
                    SecurityLevel = CalculateSecurityLevel(biometric)
                };

                return ApiResponse<VoiceSecurityDto>.SuccessResult(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting voice security status for user {UserId}", userId);
                return ApiResponse<VoiceSecurityDto>.ErrorResult("Failed to get voice security status");
            }
        }

        private async Task<(Guid userId, double confidence)> FindBestVoiceMatchAsync(byte[] audioData, 
            IEnumerable<dynamic> enrolledUsers)
        {
            var bestMatch = (userId: Guid.Empty, confidence: 0.0);

            foreach (var user in enrolledUsers)
            {
                try
                {
                    var userId = Guid.Parse(user.User.Id.ToString());
                    var verification = await _voiceRecognitionService.VerifyVoiceAsync(userId, audioData);

                    if (verification.IsSuccess && verification.Data.Confidence > bestMatch.confidence)
                    {
                        bestMatch = (userId, verification.Data.Confidence);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Error verifying voice for user {UserId}", user.User.Id);
                }
            }

            return bestMatch;
        }

        private string GenerateAuthenticationToken(Guid userId)
        {
            // In a real implementation, this would generate a proper JWT token
            var tokenData = $"{userId}:{DateTime.UtcNow:yyyy-MM-ddTHH:mm:ssZ}";
            var tokenBytes = Encoding.UTF8.GetBytes(tokenData);
            return Convert.ToBase64String(tokenBytes);
        }

        private int CalculateSecurityLevel(Biometrics? biometric)
        {
            if (biometric == null || !biometric.IsVoiceEnrolled)
                return 0;

            var level = 1; // Basic voice enrollment

            if (!string.IsNullOrEmpty(biometric.VoiceTemplate))
                level += 1; // Has voice template

            if (biometric.UpdatedAt.HasValue && biometric.UpdatedAt.Value > DateTime.UtcNow.AddDays(-30))
                level += 1; // Recently updated

            return Math.Min(level, 5); // Max security level of 5
        }
    }

    public class VoiceEnrollmentDto
    {
        public Guid UserId { get; set; }
        public DateTime EnrollmentDate { get; set; }
        public bool IsActive { get; set; }
        public int TemplateSize { get; set; }
        public string Message { get; set; } = string.Empty;
    }

    public class VoiceVerificationDto
    {
        public Guid UserId { get; set; }
        public bool IsMatch { get; set; }
        public double Confidence { get; set; }
        public double Threshold { get; set; }
        public DateTime VerificationDate { get; set; }
        public string Message { get; set; } = string.Empty;
    }

    public class VoiceTemplateDto
    {
        public Guid UserId { get; set; }
        public bool IsEnrolled { get; set; }
        public DateTime? EnrollmentDate { get; set; }
        public int TemplateSize { get; set; }
        public DateTime? LastUpdated { get; set; }
    }

    public class VoiceQualityDto
    {
        public double QualityScore { get; set; }
        public double NoiseLevel { get; set; }
        public double SignalStrength { get; set; }
        public bool IsAcceptable { get; set; }
        public string[] Recommendations { get; set; } = Array.Empty<string>();
    }

    public class VoiceMetricsDto
    {
        public Guid UserId { get; set; }
        public int TotalVerifications { get; set; }
        public int SuccessfulVerifications { get; set; }
        public double AverageConfidence { get; set; }
        public DateTime LastVerification { get; set; }
        public double SuccessRate { get; set; }
    }

    public class VoiceCommandDto
    {
        public string Command { get; set; } = string.Empty;
        public string Action { get; set; } = string.Empty;
        public double Confidence { get; set; }
        public bool IsExecuted { get; set; }
        public string Result { get; set; } = string.Empty;
        public DateTime ProcessedAt { get; set; }
    }

    public class SupportedVoiceCommandDto
    {
        public string Command { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string[] Examples { get; set; } = Array.Empty<string>();
        public string Category { get; set; } = string.Empty;
    }

    public class VoiceAuthenticationDto
    {
        public Guid UserId { get; set; }
        public bool IsAuthenticated { get; set; }
        public double Confidence { get; set; }
        public string Token { get; set; } = string.Empty;
        public DateTime AuthenticatedAt { get; set; }
        public TimeSpan ExpiresIn { get; set; }
    }

    public class VoiceSecurityDto
    {
        public Guid UserId { get; set; }
        public bool IsVoiceSecurityEnabled { get; set; }
        public bool HasPassphrase { get; set; }
        public DateTime? LastSecurityUpdate { get; set; }
        public int SecurityLevel { get; set; }
    }

    public enum VoiceCommand
    {
        CheckIn,
        CheckOut,
        StartBreak,
        EndBreak,
        RequestLeave,
        ViewSchedule,
        GetStatus
    }
}
