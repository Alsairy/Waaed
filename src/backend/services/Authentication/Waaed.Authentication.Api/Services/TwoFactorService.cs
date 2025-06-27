using System.Security.Cryptography;
using System.Text;
using AttendancePlatform.Shared.Domain.Entities;
using AttendancePlatform.Shared.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AttendancePlatform.Authentication.Api.Services
{
    public interface ITwoFactorService
    {
        Task<string> GenerateSecretAsync();
        Task<bool> ValidateCodeAsync(string secret, string code);
        Task<string> GenerateQrCodeUriAsync(string email, string secret);
        Task<bool> EnableTwoFactorAsync(Guid userId, string secret);
        Task<bool> DisableTwoFactorAsync(Guid userId);
        Task<string> GenerateBackupCodesAsync(Guid userId);
    }

    public class TwoFactorService : ITwoFactorService
    {
        private readonly AttendancePlatformDbContext _context;
        private readonly ILogger<TwoFactorService> _logger;
        private const string ApplicationName = "AttendancePro";

        public TwoFactorService(
            AttendancePlatformDbContext context,
            ILogger<TwoFactorService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<string> GenerateSecretAsync()
        {
            var key = new byte[20];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(key);
            }
            return Base32.ToBase32String(key);
        }

        public async Task<bool> ValidateCodeAsync(string secret, string code)
        {
            if (string.IsNullOrEmpty(secret) || string.IsNullOrEmpty(code))
                return false;

            try
            {
                var secretBytes = Base32.FromBase32String(secret);
                var unixTimestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
                var timestep = unixTimestamp / 30;

                for (int i = -1; i <= 1; i++)
                {
                    var testTimestep = timestep + i;
                    var expectedCode = GenerateTotpCode(secretBytes, testTimestep);
                    if (expectedCode == code)
                    {
                        return true;
                    }
                }

                return false;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating 2FA code");
                return false;
            }
        }

        public async Task<string> GenerateQrCodeUriAsync(string email, string secret)
        {
            var encodedEmail = Uri.EscapeDataString(email);
            var encodedSecret = Uri.EscapeDataString(secret);
            var encodedAppName = Uri.EscapeDataString(ApplicationName);
            
            return $"otpauth://totp/{encodedAppName}:{encodedEmail}?secret={encodedSecret}&issuer={encodedAppName}";
        }

        public async Task<bool> EnableTwoFactorAsync(Guid userId, string secret)
        {
            try
            {
                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                    return false;

                user.TwoFactorSecret = secret;
                user.IsTwoFactorEnabled = true;
                
                await _context.SaveChangesAsync();
                
                _logger.LogInformation("2FA enabled for user {UserId}", userId);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error enabling 2FA for user {UserId}", userId);
                return false;
            }
        }

        public async Task<bool> DisableTwoFactorAsync(Guid userId)
        {
            try
            {
                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                    return false;

                user.TwoFactorSecret = null;
                user.IsTwoFactorEnabled = false;
                
                await _context.SaveChangesAsync();
                
                _logger.LogInformation("2FA disabled for user {UserId}", userId);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error disabling 2FA for user {UserId}", userId);
                return false;
            }
        }

        public async Task<string> GenerateBackupCodesAsync(Guid userId)
        {
            var backupCodes = new List<string>();
            using (var rng = RandomNumberGenerator.Create())
            {
                for (int i = 0; i < 10; i++)
                {
                    var codeBytes = new byte[4];
                    rng.GetBytes(codeBytes);
                    var code = BitConverter.ToUInt32(codeBytes, 0).ToString("D8");
                    backupCodes.Add(code);
                }
            }

            return string.Join(",", backupCodes);
        }

        private string GenerateTotpCode(byte[] secret, long timestep)
        {
            var timestepBytes = BitConverter.GetBytes(timestep);
            if (BitConverter.IsLittleEndian)
                Array.Reverse(timestepBytes);

            using (var hmac = new HMACSHA1(secret))
            {
                var hash = hmac.ComputeHash(timestepBytes);
                var offset = hash[hash.Length - 1] & 0x0F;
                var code = ((hash[offset] & 0x7F) << 24) |
                          ((hash[offset + 1] & 0xFF) << 16) |
                          ((hash[offset + 2] & 0xFF) << 8) |
                          (hash[offset + 3] & 0xFF);
                
                return (code % 1000000).ToString("D6");
            }
        }
    }

    public static class Base32
    {
        private const string Base32Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

        public static string ToBase32String(byte[] input)
        {
            if (input == null || input.Length == 0)
                return string.Empty;

            var output = new StringBuilder();
            var bits = 0;
            var value = 0;

            foreach (var b in input)
            {
                value = (value << 8) | b;
                bits += 8;

                while (bits >= 5)
                {
                    output.Append(Base32Chars[(value >> (bits - 5)) & 31]);
                    bits -= 5;
                }
            }

            if (bits > 0)
            {
                output.Append(Base32Chars[(value << (5 - bits)) & 31]);
            }

            return output.ToString();
        }

        public static byte[] FromBase32String(string input)
        {
            if (string.IsNullOrEmpty(input))
                return new byte[0];

            input = input.ToUpperInvariant();
            var output = new List<byte>();
            var bits = 0;
            var value = 0;

            foreach (var c in input)
            {
                var index = Base32Chars.IndexOf(c);
                if (index < 0)
                    continue;

                value = (value << 5) | index;
                bits += 5;

                if (bits >= 8)
                {
                    output.Add((byte)((value >> (bits - 8)) & 255));
                    bits -= 8;
                }
            }

            return output.ToArray();
        }
    }


}
