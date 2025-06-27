using AttendancePlatform.Shared.Domain.DTOs;
using AttendancePlatform.Shared.Domain.Entities;
using AttendancePlatform.Shared.Domain.Interfaces;
using AttendancePlatform.Shared.Infrastructure.Services;
using AttendancePlatform.Attendance.Api.Controllers;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;
using System.Linq;

namespace AttendancePlatform.Attendance.Api.Services
{
    public class KioskService : IKioskService
    {
        private readonly IRepository<Kiosk> _kioskRepository;
        private readonly IRepository<User> _userRepository;
        private readonly IRepository<AttendanceRecord> _attendanceRepository;
        private readonly ILogger<KioskService> _logger;
        private readonly ICacheService _cacheService;

        public KioskService(
            IRepository<Kiosk> kioskRepository,
            IRepository<User> userRepository,
            IRepository<AttendanceRecord> attendanceRepository,
            ILogger<KioskService> logger,
            ICacheService cacheService)
        {
            _kioskRepository = kioskRepository;
            _userRepository = userRepository;
            _attendanceRepository = attendanceRepository;
            _cacheService = cacheService;
            _logger = logger;
            _cacheService = cacheService;
        }

        public async Task<KioskDto> RegisterKioskAsync(RegisterKioskRequest request)
        {
            try
            {
                var accessCode = GenerateAccessCode();
                var kiosk = new Kiosk
                {
                    Id = Guid.NewGuid(),
                    Name = request.Name,
                    Location = request.Location,
                    Description = request.Description,
                    AccessCode = HashAccessCode(accessCode),
                    Status = KioskStatus.Active,
                    CreatedAt = DateTime.UtcNow,
                    LastActivity = DateTime.UtcNow,
                    AllowedGeofences = request.AllowedGeofences
                };

                await _kioskRepository.AddAsync(kiosk);

                _logger.LogInformation("Kiosk {KioskId} registered successfully", kiosk.Id);

                return new KioskDto
                {
                    Id = kiosk.Id.ToString(),
                    Name = kiosk.Name,
                    Location = kiosk.Location,
                    Description = kiosk.Description,
                    Status = kiosk.Status,
                    CreatedAt = kiosk.CreatedAt,
                    LastActivity = kiosk.LastActivity,
                    AllowedGeofences = kiosk.AllowedGeofences
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error registering kiosk");
                throw;
            }
        }

        public async Task<KioskAuthResult> AuthenticateKioskAsync(string kioskId, string accessCode)
        {
            try
            {
                var kiosk = await _kioskRepository.GetByIdAsync(Guid.Parse(kioskId));
                if (kiosk == null)
                {
                    return new KioskAuthResult
                    {
                        IsSuccess = false,
                        Message = "Kiosk not found"
                    };
                }

                if (kiosk.Status != KioskStatus.Active)
                {
                    return new KioskAuthResult
                    {
                        IsSuccess = false,
                        Message = "Kiosk is not active"
                    };
                }

                if (!VerifyAccessCode(accessCode, kiosk.AccessCode))
                {
                    return new KioskAuthResult
                    {
                        IsSuccess = false,
                        Message = "Invalid access code"
                    };
                }

                var token = $"kiosk_token_{kioskId}_{DateTime.UtcNow.Ticks}";
                var expiresAt = DateTime.UtcNow.AddHours(8);

                kiosk.LastActivity = DateTime.UtcNow;
                await _kioskRepository.UpdateAsync(kiosk);

                await _cacheService.SetAsync($"kiosk_session_{kioskId}", token, TimeSpan.FromHours(8));

                return new KioskAuthResult
                {
                    IsSuccess = true,
                    Token = token,
                    KioskId = kioskId,
                    Message = "Authentication successful",
                    ExpiresAt = expiresAt
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error authenticating kiosk {KioskId}", kioskId);
                throw;
            }
        }

        public async Task<EmployeeDto?> LookupEmployeeAsync(string employeeId, string? biometricData)
        {
            try
            {
                var user = await _userRepository.Query()
                    .FirstOrDefaultAsync(u => u.EmployeeId == employeeId || u.Id.ToString() == employeeId);

                if (user == null)
                {
                    return null;
                }

                if (!string.IsNullOrEmpty(biometricData))
                {
                    var isValidBiometric = await ValidateBiometricDataAsync(user.Id.ToString(), biometricData);
                    if (!isValidBiometric)
                    {
                        _logger.LogWarning("Biometric validation failed for user {UserId}", user.Id);
                        return null;
                    }
                }

                return new EmployeeDto
                {
                    Id = user.Id.ToString(),
                    EmployeeId = user.EmployeeId,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Email = user.Email,
                    Department = user.Department,
                    Position = user.Position,
                    IsActive = true
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error looking up employee {EmployeeId}", employeeId);
                throw;
            }
        }

        public async Task<KioskStatusDto> GetKioskStatusAsync(string kioskId)
        {
            try
            {
                var kiosk = await _kioskRepository.GetByIdAsync(Guid.Parse(kioskId));
                if (kiosk == null)
                {
                    throw new ArgumentException("Kiosk not found");
                }

                var today = DateTime.UtcNow.Date;
                var todayCheckIns = await _attendanceRepository.Query()
                    .CountAsync(a => a.KioskId.ToString() == kioskId &&
                                   a.Timestamp.Date == today && 
                                   a.Type == AttendanceType.CheckIn);

                var todayCheckOuts = await _attendanceRepository.Query()
                    .CountAsync(a => a.KioskId.ToString() == kioskId &&
                                   a.Timestamp.Date == today && 
                                   a.Type == AttendanceType.CheckOut);

                var isOnline = await _cacheService.ExistsAsync($"kiosk_session_{kioskId}");

                return new KioskStatusDto
                {
                    KioskId = kioskId,
                    Status = kiosk.Status,
                    LastActivity = kiosk.LastActivity,
                    TodayCheckIns = todayCheckIns,
                    TodayCheckOuts = todayCheckOuts,
                    IsOnline = isOnline,
                    Version = "1.0.0"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting kiosk status for {KioskId}", kioskId);
                throw;
            }
        }

        public async Task<List<KioskActivityDto>> GetRecentActivityAsync(string kioskId, int limit)
        {
            try
            {
                var activities = await _attendanceRepository.Query()
                    .Where(a => a.KioskId.ToString() == kioskId)
                    .OrderByDescending(a => a.Timestamp)
                    .Take(limit)
                    .Include(a => a.User)
                    .Select(a => new KioskActivityDto
                    {
                        Id = a.Id.ToString(),
                        EmployeeId = a.User.EmployeeId,
                        EmployeeName = $"{a.User.FirstName} {a.User.LastName}",
                        Method = a.Method,
                        Timestamp = a.Timestamp,
                        Action = a.Type.ToString(),
                        IsSuccessful = true
                    })
                    .ToListAsync();

                return activities;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting recent activity for kiosk {KioskId}", kioskId);
                throw;
            }
        }

        public async Task<bool> ValidateKioskLocationAsync(string kioskId, LocationInfo location)
        {
            try
            {
                var kiosk = await _kioskRepository.GetByIdAsync(Guid.Parse(kioskId));
                if (kiosk == null || kiosk.AllowedGeofences == null || !kiosk.AllowedGeofences.Any())
                {
                    return true;
                }

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating kiosk location for {KioskId}", kioskId);
                return false;
            }
        }

        public async Task<bool> UpdateKioskStatusAsync(string kioskId, KioskStatus status)
        {
            try
            {
                var kiosk = await _kioskRepository.GetByIdAsync(Guid.Parse(kioskId));
                if (kiosk == null)
                {
                    return false;
                }

                kiosk.Status = status;
                kiosk.LastActivity = DateTime.UtcNow;
                await _kioskRepository.UpdateAsync(kiosk);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating kiosk status for {KioskId}", kioskId);
                return false;
            }
        }

        private string GenerateAccessCode()
        {
            var random = new Random();
            return random.Next(100000, 999999).ToString();
        }

        private string HashAccessCode(string accessCode)
        {
            using var sha256 = SHA256.Create();
            var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(accessCode));
            return Convert.ToBase64String(hashedBytes);
        }

        private bool VerifyAccessCode(string accessCode, string hashedAccessCode)
        {
            var hashedInput = HashAccessCode(accessCode);
            return hashedInput == hashedAccessCode;
        }

        private async Task<bool> ValidateBiometricDataAsync(string userId, string biometricData)
        {
            return true;
        }
    }

    public class EmployeeDto
    {
        public string Id { get; set; } = string.Empty;
        public string EmployeeId { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public string Position { get; set; } = string.Empty;
        public bool IsActive { get; set; }
    }
}
