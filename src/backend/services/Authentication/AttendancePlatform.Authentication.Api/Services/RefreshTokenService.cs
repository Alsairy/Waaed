using Microsoft.EntityFrameworkCore;
using AttendancePlatform.Shared.Domain.Entities;
using AttendancePlatform.Shared.Infrastructure.Data;
using System.Security.Cryptography;

namespace AttendancePlatform.Authentication.Api.Services
{
    public interface IRefreshTokenService
    {
        Task<string> GenerateRefreshTokenAsync(Guid userId);
        Task<bool> ValidateRefreshTokenAsync(string refreshToken, Guid userId);
        Task<bool> RevokeRefreshTokenAsync(string refreshToken);
        Task<bool> RevokeAllUserRefreshTokensAsync(Guid userId);
        Task<RefreshToken?> GetRefreshTokenAsync(string token);
        Task CleanupExpiredTokensAsync();
    }

    public class RefreshTokenService : IRefreshTokenService
    {
        private readonly AttendancePlatformDbContext _context;
        private readonly ILogger<RefreshTokenService> _logger;
        private readonly IConfiguration _configuration;

        public RefreshTokenService(
            AttendancePlatformDbContext context,
            ILogger<RefreshTokenService> logger,
            IConfiguration configuration)
        {
            _context = context;
            _logger = logger;
            _configuration = configuration;
        }

        public async Task<string> GenerateRefreshTokenAsync(Guid userId)
        {
            try
            {
                var randomBytes = new byte[64];
                using var rng = RandomNumberGenerator.Create();
                rng.GetBytes(randomBytes);
                var token = Convert.ToBase64String(randomBytes);

                var expirationDays = int.Parse(_configuration["JWT_REFRESH_EXPIRES_IN_DAYS"] ?? "7");
                var expiresAt = DateTime.UtcNow.AddDays(expirationDays);

                var refreshToken = new RefreshToken
                {
                    Token = token,
                    UserId = userId,
                    ExpiresAt = expiresAt,
                    IsRevoked = false,
                    CreatedAt = DateTime.UtcNow
                };

                _context.RefreshTokens.Add(refreshToken);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Refresh token generated for user {UserId}", userId);
                return token;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating refresh token for user {UserId}", userId);
                throw;
            }
        }

        public async Task<bool> ValidateRefreshTokenAsync(string refreshToken, Guid userId)
        {
            try
            {
                var token = await _context.RefreshTokens
                    .FirstOrDefaultAsync(rt => rt.Token == refreshToken && rt.UserId == userId);

                if (token == null)
                {
                    _logger.LogWarning("Refresh token not found for user {UserId}", userId);
                    return false;
                }

                if (token.IsRevoked)
                {
                    _logger.LogWarning("Refresh token is revoked for user {UserId}", userId);
                    return false;
                }

                if (token.ExpiresAt <= DateTime.UtcNow)
                {
                    _logger.LogWarning("Refresh token is expired for user {UserId}", userId);
                    token.IsRevoked = true;
                    await _context.SaveChangesAsync();
                    return false;
                }

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating refresh token for user {UserId}", userId);
                return false;
            }
        }

        public async Task<bool> RevokeRefreshTokenAsync(string refreshToken)
        {
            try
            {
                var token = await _context.RefreshTokens
                    .FirstOrDefaultAsync(rt => rt.Token == refreshToken);

                if (token == null)
                    return false;

                token.IsRevoked = true;
                token.RevokedAt = DateTime.UtcNow;
                
                await _context.SaveChangesAsync();
                
                _logger.LogInformation("Refresh token revoked for user {UserId}", token.UserId);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error revoking refresh token");
                return false;
            }
        }

        public async Task<bool> RevokeAllUserRefreshTokensAsync(Guid userId)
        {
            try
            {
                var tokens = await _context.RefreshTokens
                    .Where(rt => rt.UserId == userId && !rt.IsRevoked)
                    .ToListAsync();

                foreach (var token in tokens)
                {
                    token.IsRevoked = true;
                    token.RevokedAt = DateTime.UtcNow;
                }

                await _context.SaveChangesAsync();
                
                _logger.LogInformation("All refresh tokens revoked for user {UserId}, count: {Count}", userId, tokens.Count);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error revoking all refresh tokens for user {UserId}", userId);
                return false;
            }
        }

        public async Task<RefreshToken?> GetRefreshTokenAsync(string token)
        {
            try
            {
                return await _context.RefreshTokens
                    .Include(rt => rt.User)
                    .FirstOrDefaultAsync(rt => rt.Token == token);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting refresh token");
                return null;
            }
        }

        public async Task CleanupExpiredTokensAsync()
        {
            try
            {
                var expiredTokens = await _context.RefreshTokens
                    .Where(rt => rt.ExpiresAt <= DateTime.UtcNow || rt.IsRevoked)
                    .ToListAsync();

                if (expiredTokens.Any())
                {
                    _context.RefreshTokens.RemoveRange(expiredTokens);
                    await _context.SaveChangesAsync();
                    
                    _logger.LogInformation("Cleaned up {Count} expired/revoked refresh tokens", expiredTokens.Count);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cleaning up expired refresh tokens");
            }
        }
    }
}
