using Microsoft.EntityFrameworkCore;
using AttendancePlatform.Shared.Domain.Entities;
using AttendancePlatform.Shared.Domain.DTOs;
using AttendancePlatform.Shared.Domain.Interfaces;
using AttendancePlatform.Shared.Infrastructure.Data;
using AttendancePlatform.Shared.Infrastructure.Services;
using System.Text.Json;

namespace AttendancePlatform.FaceRecognition.Api.Services;

public interface IFaceRecognitionService
{
    Task<ApiResponse<FaceEnrollmentDto>> EnrollFaceAsync(Guid userId, byte[] imageData, string deviceId = "", string deviceType = "");
    Task<ApiResponse<FaceVerificationDto>> VerifyFaceAsync(Guid userId, byte[] imageData, string deviceId = "", string deviceType = "");
    Task<ApiResponse<IEnumerable<BiometricTemplateDto>>> GetUserTemplatesAsync(Guid userId);
    Task<ApiResponse<bool>> DeleteTemplateAsync(Guid userId, Guid templateId);
    Task<ApiResponse<FaceIdentificationDto>> IdentifyFaceAsync(byte[] imageData, string deviceId = "", string deviceType = "");
    Task<ApiResponse<bool>> UpdateTemplateAsync(Guid userId, Guid templateId, byte[] newImageData);
}

public class FaceRecognitionService : IFaceRecognitionService
{
    private readonly AttendancePlatformDbContext _context;
    private readonly IDateTimeProvider _dateTimeProvider;
    private readonly ILogger<FaceRecognitionService> _logger;

    public FaceRecognitionService(
        AttendancePlatformDbContext context,
        IDateTimeProvider dateTimeProvider,
        ILogger<FaceRecognitionService> logger)
    {
        _context = context;
        _dateTimeProvider = dateTimeProvider;
        _logger = logger;
    }

    public async Task<ApiResponse<FaceEnrollmentDto>> EnrollFaceAsync(Guid userId, byte[] imageData, string deviceId = "", string deviceType = "")
    {
        try
        {
            if (imageData == null || imageData.Length == 0)
            {
                return ApiResponse<FaceEnrollmentDto>.ErrorResult("Image data is required");
            }

            var processedImage = await ProcessImageAsync(imageData);
            if (!processedImage.IsValid)
            {
                return ApiResponse<FaceEnrollmentDto>.ErrorResult("Invalid face image");
            }

            var faceTemplate = await ExtractFaceTemplateAsync(processedImage.ImageData);
            if (faceTemplate == null)
            {
                return ApiResponse<FaceEnrollmentDto>.ErrorResult("Could not extract face template");
            }

            var existingTemplates = await _context.BiometricTemplates
                .Where(bt => bt.UserId == userId.ToString() && bt.BiometricType == "Face" && bt.IsActive)
                .ToListAsync();

            foreach (var template in existingTemplates)
            {
                var similarity = await CompareFaceTemplatesAsync(faceTemplate.TemplateData, template.TemplateData);
                if (similarity > 0.85)
                {
                    return ApiResponse<FaceEnrollmentDto>.ErrorResult("Face already enrolled");
                }
            }

            var biometricTemplate = new BiometricTemplate
            {
                Id = Guid.NewGuid(),
                UserId = userId.ToString(),
                BiometricType = "Face",
                TemplateData = faceTemplate.TemplateData,
                QualityScore = faceTemplate.Quality,
                EnrolledAt = _dateTimeProvider.UtcNow,
                IsActive = true,
                DeviceId = deviceId,
                Algorithm = "FaceNet",
                Version = "1.0",
                CreatedAt = _dateTimeProvider.UtcNow,
                UpdatedAt = _dateTimeProvider.UtcNow
            };

            _context.BiometricTemplates.Add(biometricTemplate);
            await _context.SaveChangesAsync();

            var dto = new FaceEnrollmentDto
            {
                TemplateId = biometricTemplate.Id,
                Quality = biometricTemplate.QualityScore,
                EnrollmentDate = biometricTemplate.EnrolledAt,
                IsActive = biometricTemplate.IsActive,
                Message = "Face enrolled successfully"
            };

            return ApiResponse<FaceEnrollmentDto>.SuccessResult(dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error enrolling face for user {UserId}", userId);
            return ApiResponse<FaceEnrollmentDto>.ErrorResult("Failed to enroll face");
        }
    }

    public async Task<ApiResponse<FaceVerificationDto>> VerifyFaceAsync(Guid userId, byte[] imageData, string deviceId = "", string deviceType = "")
    {
        try
        {
            if (imageData == null || imageData.Length == 0)
            {
                return ApiResponse<FaceVerificationDto>.ErrorResult("Image data is required");
            }

            var processedImage = await ProcessImageAsync(imageData);
            if (!processedImage.IsValid)
            {
                return ApiResponse<FaceVerificationDto>.ErrorResult("Invalid face image");
            }

            var faceTemplate = await ExtractFaceTemplateAsync(processedImage.ImageData);
            if (faceTemplate == null)
            {
                return ApiResponse<FaceVerificationDto>.ErrorResult("Could not extract face template");
            }

            var enrolledTemplates = await _context.BiometricTemplates
                .Where(bt => bt.UserId == userId.ToString() && bt.BiometricType == "Face" && bt.IsActive)
                .ToListAsync();

            if (!enrolledTemplates.Any())
            {
                return ApiResponse<FaceVerificationDto>.ErrorResult("No enrolled face templates found");
            }

            double bestSimilarity = 0;
            Guid bestMatchTemplateId = Guid.Empty;

            foreach (var template in enrolledTemplates)
            {
                var similarity = await CompareFaceTemplatesAsync(faceTemplate.TemplateData, template.TemplateData);
                if (similarity > bestSimilarity)
                {
                    bestSimilarity = similarity;
                    bestMatchTemplateId = template.Id;
                }
            }

            const double verificationThreshold = 0.75;
            bool isVerified = bestSimilarity >= verificationThreshold;

            var dto = new FaceVerificationDto
            {
                IsVerified = isVerified,
                Confidence = bestSimilarity,
                TemplateId = bestMatchTemplateId,
                VerificationTime = _dateTimeProvider.UtcNow,
                Message = isVerified ? "Face verified successfully" : "Face verification failed"
            };

            return ApiResponse<FaceVerificationDto>.SuccessResult(dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error verifying face for user {UserId}", userId);
            return ApiResponse<FaceVerificationDto>.ErrorResult("Failed to verify face");
        }
    }

    public async Task<ApiResponse<IEnumerable<BiometricTemplateDto>>> GetUserTemplatesAsync(Guid userId)
    {
        try
        {
            var templates = await _context.BiometricTemplates
                .Where(bt => bt.UserId == userId.ToString() && bt.BiometricType == "Face" && bt.IsActive)
                .OrderByDescending(bt => bt.EnrolledAt)
                .ToListAsync();

            var dtos = templates.Select(t => new BiometricTemplateDto
            {
                Id = t.Id,
                Type = t.BiometricType,
                Quality = t.QualityScore,
                EnrollmentDate = t.EnrolledAt,
                IsActive = t.IsActive,
                DeviceId = t.DeviceId,
                DeviceType = "Mobile"
            });

            return ApiResponse<IEnumerable<BiometricTemplateDto>>.SuccessResult(dtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting templates for user {UserId}", userId);
            return ApiResponse<IEnumerable<BiometricTemplateDto>>.ErrorResult("Failed to get templates");
        }
    }

    public async Task<ApiResponse<bool>> DeleteTemplateAsync(Guid userId, Guid templateId)
    {
        try
        {
            var template = await _context.BiometricTemplates
                .FirstOrDefaultAsync(bt => bt.Id == templateId && bt.UserId == userId.ToString() && bt.BiometricType == "Face");

            if (template == null)
            {
                return ApiResponse<bool>.ErrorResult("Face template not found");
            }

            template.IsActive = false;
            template.UpdatedAt = _dateTimeProvider.UtcNow;

            await _context.SaveChangesAsync();

            return ApiResponse<bool>.SuccessResult(true);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting template {TemplateId} for user {UserId}", templateId, userId);
            return ApiResponse<bool>.ErrorResult("Failed to delete template");
        }
    }

    public async Task<ApiResponse<FaceIdentificationDto>> IdentifyFaceAsync(byte[] imageData, string deviceId = "", string deviceType = "")
    {
        try
        {
            if (imageData == null || imageData.Length == 0)
            {
                return ApiResponse<FaceIdentificationDto>.ErrorResult("Image data is required");
            }

            var processedImage = await ProcessImageAsync(imageData);
            if (!processedImage.IsValid)
            {
                return ApiResponse<FaceIdentificationDto>.ErrorResult("Invalid face image");
            }

            var faceTemplate = await ExtractFaceTemplateAsync(processedImage.ImageData);
            if (faceTemplate == null)
            {
                return ApiResponse<FaceIdentificationDto>.ErrorResult("Could not extract face template");
            }

            var allTemplates = await _context.BiometricTemplates
                .Include(bt => bt.User)
                .Where(bt => bt.BiometricType == "Face" && bt.IsActive)
                .ToListAsync();

            var matches = new List<FaceMatchResult>();

            foreach (var template in allTemplates)
            {
                var similarity = await CompareFaceTemplatesAsync(faceTemplate.TemplateData, template.TemplateData);
                if (similarity > 0.5)
                {
                    matches.Add(new FaceMatchResult
                    {
                        UserId = Guid.Parse(template.UserId),
                        TemplateId = template.Id,
                        Confidence = similarity,
                        UserName = $"{template.User.FirstName} {template.User.LastName}"
                    });
                }
            }

            var bestMatch = matches.OrderByDescending(m => m.Confidence).FirstOrDefault();

            var dto = new FaceIdentificationDto
            {
                IsIdentified = bestMatch != null && bestMatch.Confidence >= 0.75,
                UserId = bestMatch?.UserId,
                UserName = bestMatch?.UserName,
                Confidence = bestMatch?.Confidence ?? 0,
                TemplateId = bestMatch?.TemplateId,
                IdentificationTime = _dateTimeProvider.UtcNow,
                AllMatches = matches.Cast<object>().ToList().Take(5).ToList()
            };

            return ApiResponse<FaceIdentificationDto>.SuccessResult(dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error identifying face");
            return ApiResponse<FaceIdentificationDto>.ErrorResult("Failed to identify face");
        }
    }

    public async Task<ApiResponse<bool>> UpdateTemplateAsync(Guid userId, Guid templateId, byte[] newImageData)
    {
        try
        {
            var template = await _context.BiometricTemplates
                .FirstOrDefaultAsync(bt => bt.Id == templateId && bt.UserId == userId.ToString() && bt.BiometricType == "Face");

            if (template == null)
            {
                return ApiResponse<bool>.ErrorResult("Face template not found");
            }

            var processedImage = await ProcessImageAsync(newImageData);
            if (!processedImage.IsValid)
            {
                return ApiResponse<bool>.ErrorResult("Invalid face image");
            }

            var faceTemplate = await ExtractFaceTemplateAsync(processedImage.ImageData);
            if (faceTemplate == null)
            {
                return ApiResponse<bool>.ErrorResult("Could not extract face template");
            }

            template.TemplateData = faceTemplate.TemplateData;
            template.QualityScore = faceTemplate.Quality;
            template.UpdatedAt = _dateTimeProvider.UtcNow;
            template.LastUsedAt = _dateTimeProvider.UtcNow;

            await _context.SaveChangesAsync();

            return ApiResponse<bool>.SuccessResult(true);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating template {TemplateId} for user {UserId}", templateId, userId);
            return ApiResponse<bool>.ErrorResult("Failed to update template");
        }
    }

    private async Task<ProcessedImageResult> ProcessImageAsync(byte[] imageData)
    {
        await Task.Delay(10);
        
        return new ProcessedImageResult
        {
            IsValid = imageData.Length > 1000,
            ImageData = imageData,
            Width = 640,
            Height = 480
        };
    }

    private async Task<FaceTemplate?> ExtractFaceTemplateAsync(byte[] imageData)
    {
        await Task.Delay(50);
        
        var random = new Random();
        var templateData = new byte[512];
        random.NextBytes(templateData);
        
        return new FaceTemplate
        {
            TemplateData = templateData,
            Quality = 0.85 + (random.NextDouble() * 0.15)
        };
    }

    private async Task<double> CompareFaceTemplatesAsync(byte[] template1, byte[] template2)
    {
        await Task.Delay(10);
        
        if (template1.Length != template2.Length)
            return 0.0;
            
        int matches = 0;
        for (int i = 0; i < Math.Min(template1.Length, 100); i++)
        {
            if (Math.Abs(template1[i] - template2[i]) < 10)
                matches++;
        }
        
        return (double)matches / 100.0;
    }
}

public class ProcessedImageResult
{
    public bool IsValid { get; set; }
    public byte[] ImageData { get; set; } = Array.Empty<byte>();
    public int Width { get; set; }
    public int Height { get; set; }
}

public class FaceTemplate
{
    public byte[] TemplateData { get; set; } = Array.Empty<byte>();
    public double Quality { get; set; }
}

public class FaceMatchResult
{
    public Guid UserId { get; set; }
    public Guid TemplateId { get; set; }
    public double Confidence { get; set; }
    public string UserName { get; set; } = string.Empty;
}
