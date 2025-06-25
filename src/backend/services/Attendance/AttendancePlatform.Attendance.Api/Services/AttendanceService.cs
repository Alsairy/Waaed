using Microsoft.EntityFrameworkCore;
using AttendancePlatform.Shared.Domain.Entities;
using AttendancePlatform.Shared.Domain.DTOs;
using AttendancePlatform.Shared.Domain.Interfaces;
using AttendancePlatform.Shared.Infrastructure.Data;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Processing;
using SixLabors.ImageSharp.Formats.Jpeg;

namespace AttendancePlatform.Attendance.Api.Services
{
    public interface IAttendanceService
    {
        Task<ApiResponse<AttendanceRecordDto>> CheckInAsync(CheckInRequest request, Guid userId);
        Task<ApiResponse<AttendanceRecordDto>> CheckOutAsync(CheckOutRequest request, Guid userId);
        Task<ApiResponse<IEnumerable<AttendanceRecordDto>>> GetUserAttendanceAsync(Guid userId, DateTime? startDate = null, DateTime? endDate = null);
        Task<ApiResponse<IEnumerable<AttendanceRecordDto>>> GetTodayAttendanceAsync(Guid userId);
        Task<ApiResponse<AttendanceRecordDto?>> GetLastAttendanceAsync(Guid userId);
        Task<ApiResponse<bool>> ValidateGeofenceAsync(double latitude, double longitude, Guid userId);
        Task<ApiResponse<bool>> ValidateBeaconAsync(string beaconId, Guid userId);
        Task<ApiResponse<PagedResult<AttendanceRecordDto>>> GetAttendanceReportsAsync(PagedRequest request, Guid? userId = null);
    }

    public class AttendanceService : IAttendanceService
    {
        private readonly AttendancePlatformDbContext _context;
        private readonly ILogger<AttendanceService> _logger;
        private readonly ITenantContext _tenantContext;
        private readonly IDateTimeProvider _dateTimeProvider;

        public AttendanceService(
            AttendancePlatformDbContext context,
            ILogger<AttendanceService> logger,
            ITenantContext tenantContext,
            IDateTimeProvider dateTimeProvider)
        {
            _context = context;
            _logger = logger;
            _tenantContext = tenantContext;
            _dateTimeProvider = dateTimeProvider;
        }

        public async Task<ApiResponse<AttendanceRecordDto>> CheckInAsync(CheckInRequest request, Guid userId)
        {
            try
            {
                // Check if user already checked in today
                var today = _dateTimeProvider.Today;
                var existingCheckIn = await _context.AttendanceRecords
                    .Where(ar => ar.UserId == userId && 
                                ar.Timestamp.Date == today.ToDateTime(TimeOnly.MinValue).Date &&
                                ar.Type == AttendanceType.CheckIn)
                    .OrderByDescending(ar => ar.Timestamp)
                    .FirstOrDefaultAsync();

                if (existingCheckIn != null && !existingCheckIn.IsOfflineRecord)
                {
                    return ApiResponse<AttendanceRecordDto>.ErrorResult("You have already checked in today");
                }

                // Validate geofence if location provided
                bool isWithinGeofence = false;
                Geofence? validGeofence = null;
                
                if (request.Latitude.HasValue && request.Longitude.HasValue)
                {
                    var geofenceValidation = await ValidateGeofenceAsync(request.Latitude.Value, request.Longitude.Value, userId);
                    isWithinGeofence = geofenceValidation.Data;
                    
                    if (isWithinGeofence)
                    {
                        validGeofence = await GetNearestGeofenceAsync(request.Latitude.Value, request.Longitude.Value, userId);
                    }
                }

                // Validate beacon if provided
                bool isValidBeacon = false;
                if (!string.IsNullOrEmpty(request.BeaconId))
                {
                    var beaconValidation = await ValidateBeaconAsync(request.BeaconId, userId);
                    isValidBeacon = beaconValidation.Data;
                }

                // Create attendance record
                var attendanceRecord = new AttendanceRecord
                {
                    UserId = userId,
                    Timestamp = request.IsOffline && request.OfflineTimestamp.HasValue 
                        ? request.OfflineTimestamp.Value 
                        : _dateTimeProvider.UtcNow,
                    Type = AttendanceType.CheckIn,
                    Method = DetermineAttendanceMethod(request),
                    Status = AttendanceStatus.Valid,
                    Latitude = request.Latitude,
                    Longitude = request.Longitude,
                    LocationName = request.LocationName,
                    Address = request.Address,
                    IsWithinGeofence = isWithinGeofence,
                    GeofenceId = validGeofence?.Id,
                    BeaconId = request.BeaconId,
                    BeaconName = await GetBeaconNameAsync(request.BeaconId),
                    IsBiometricVerified = !string.IsNullOrEmpty(request.BiometricData),
                    PhotoUrl = await ProcessPhotoAsync(request.PhotoBase64),
                    DeviceId = request.DeviceId,
                    DeviceType = request.DeviceType,
                    IsOfflineRecord = request.IsOffline,
                    Notes = request.Notes,
                    IsApproved = isWithinGeofence || isValidBeacon, // Auto-approve if within geofence or valid beacon
                    TenantId = _tenantContext.TenantId ?? throw new InvalidOperationException("Tenant context not set")
                };

                _context.AttendanceRecords.Add(attendanceRecord);
                await _context.SaveChangesAsync();

                var dto = await MapToAttendanceRecordDto(attendanceRecord);
                return ApiResponse<AttendanceRecordDto>.SuccessResult(dto, "Check-in successful");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during check-in for user: {UserId}", userId);
                return ApiResponse<AttendanceRecordDto>.ErrorResult("An error occurred during check-in");
            }
        }

        public async Task<ApiResponse<AttendanceRecordDto>> CheckOutAsync(CheckOutRequest request, Guid userId)
        {
            try
            {
                // Check if user has checked in today
                var today = _dateTimeProvider.Today;
                var lastCheckIn = await _context.AttendanceRecords
                    .Where(ar => ar.UserId == userId && 
                                ar.Timestamp.Date == today.ToDateTime(TimeOnly.MinValue).Date &&
                                ar.Type == AttendanceType.CheckIn)
                    .OrderByDescending(ar => ar.Timestamp)
                    .FirstOrDefaultAsync();

                if (lastCheckIn == null)
                {
                    return ApiResponse<AttendanceRecordDto>.ErrorResult("No check-in record found for today");
                }

                // Check if already checked out
                var existingCheckOut = await _context.AttendanceRecords
                    .Where(ar => ar.UserId == userId && 
                                ar.Timestamp.Date == today.ToDateTime(TimeOnly.MinValue).Date &&
                                ar.Type == AttendanceType.CheckOut)
                    .OrderByDescending(ar => ar.Timestamp)
                    .FirstOrDefaultAsync();

                if (existingCheckOut != null && !existingCheckOut.IsOfflineRecord)
                {
                    return ApiResponse<AttendanceRecordDto>.ErrorResult("You have already checked out today");
                }

                // Validate geofence if location provided
                bool isWithinGeofence = false;
                Geofence? validGeofence = null;
                
                if (request.Latitude.HasValue && request.Longitude.HasValue)
                {
                    var geofenceValidation = await ValidateGeofenceAsync(request.Latitude.Value, request.Longitude.Value, userId);
                    isWithinGeofence = geofenceValidation.Data;
                    
                    if (isWithinGeofence)
                    {
                        validGeofence = await GetNearestGeofenceAsync(request.Latitude.Value, request.Longitude.Value, userId);
                    }
                }

                // Validate beacon if provided
                bool isValidBeacon = false;
                if (!string.IsNullOrEmpty(request.BeaconId))
                {
                    var beaconValidation = await ValidateBeaconAsync(request.BeaconId, userId);
                    isValidBeacon = beaconValidation.Data;
                }

                // Create attendance record
                var attendanceRecord = new AttendanceRecord
                {
                    UserId = userId,
                    Timestamp = request.IsOffline && request.OfflineTimestamp.HasValue 
                        ? request.OfflineTimestamp.Value 
                        : _dateTimeProvider.UtcNow,
                    Type = AttendanceType.CheckOut,
                    Method = DetermineAttendanceMethod(request),
                    Status = AttendanceStatus.Valid,
                    Latitude = request.Latitude,
                    Longitude = request.Longitude,
                    LocationName = request.LocationName,
                    Address = request.Address,
                    IsWithinGeofence = isWithinGeofence,
                    GeofenceId = validGeofence?.Id,
                    BeaconId = request.BeaconId,
                    BeaconName = await GetBeaconNameAsync(request.BeaconId),
                    IsBiometricVerified = !string.IsNullOrEmpty(request.BiometricData),
                    PhotoUrl = await ProcessPhotoAsync(request.PhotoBase64),
                    DeviceId = request.DeviceId,
                    DeviceType = request.DeviceType,
                    IsOfflineRecord = request.IsOffline,
                    Notes = request.Notes,
                    IsApproved = isWithinGeofence || isValidBeacon,
                    TenantId = _tenantContext.TenantId ?? throw new InvalidOperationException("Tenant context not set")
                };

                _context.AttendanceRecords.Add(attendanceRecord);
                await _context.SaveChangesAsync();

                var dto = await MapToAttendanceRecordDto(attendanceRecord);
                return ApiResponse<AttendanceRecordDto>.SuccessResult(dto, "Check-out successful");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during check-out for user: {UserId}", userId);
                return ApiResponse<AttendanceRecordDto>.ErrorResult("An error occurred during check-out");
            }
        }

        public async Task<ApiResponse<IEnumerable<AttendanceRecordDto>>> GetUserAttendanceAsync(Guid userId, DateTime? startDate = null, DateTime? endDate = null)
        {
            try
            {
                var query = _context.AttendanceRecords
                    .Where(ar => ar.UserId == userId);

                if (startDate.HasValue)
                {
                    query = query.Where(ar => ar.Timestamp >= startDate.Value);
                }

                if (endDate.HasValue)
                {
                    query = query.Where(ar => ar.Timestamp <= endDate.Value);
                }

                var records = await query
                    .OrderByDescending(ar => ar.Timestamp)
                    .ToListAsync();

                var dtos = new List<AttendanceRecordDto>();
                foreach (var record in records)
                {
                    dtos.Add(await MapToAttendanceRecordDto(record));
                }

                return ApiResponse<IEnumerable<AttendanceRecordDto>>.SuccessResult(dtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting attendance for user: {UserId}", userId);
                return ApiResponse<IEnumerable<AttendanceRecordDto>>.ErrorResult("An error occurred while retrieving attendance records");
            }
        }

        public async Task<ApiResponse<IEnumerable<AttendanceRecordDto>>> GetTodayAttendanceAsync(Guid userId)
        {
            var today = _dateTimeProvider.Today;
            return await GetUserAttendanceAsync(userId, today.ToDateTime(TimeOnly.MinValue), today.ToDateTime(TimeOnly.MaxValue));
        }

        public async Task<ApiResponse<AttendanceRecordDto?>> GetLastAttendanceAsync(Guid userId)
        {
            try
            {
                var lastRecord = await _context.AttendanceRecords
                    .Where(ar => ar.UserId == userId)
                    .OrderByDescending(ar => ar.Timestamp)
                    .FirstOrDefaultAsync();

                if (lastRecord == null)
                {
                    return ApiResponse<AttendanceRecordDto?>.SuccessResult(null);
                }

                var dto = await MapToAttendanceRecordDto(lastRecord);
                return ApiResponse<AttendanceRecordDto?>.SuccessResult(dto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting last attendance for user: {UserId}", userId);
                return ApiResponse<AttendanceRecordDto?>.ErrorResult("An error occurred while retrieving last attendance record");
            }
        }

        public async Task<ApiResponse<bool>> ValidateGeofenceAsync(double latitude, double longitude, Guid userId)
        {
            try
            {
                var userGeofences = await _context.UserGeofences
                    .Include(ug => ug.Geofence)
                    .Where(ug => ug.UserId == userId && ug.Geofence.IsActive)
                    .Select(ug => ug.Geofence)
                    .ToListAsync();

                foreach (var geofence in userGeofences)
                {
                    var distance = CalculateDistance(latitude, longitude, geofence.Latitude, geofence.Longitude);
                    if (distance <= geofence.Radius)
                    {
                        return ApiResponse<bool>.SuccessResult(true);
                    }
                }

                return ApiResponse<bool>.SuccessResult(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating geofence for user: {UserId}", userId);
                return ApiResponse<bool>.ErrorResult("An error occurred while validating geofence");
            }
        }

        public async Task<ApiResponse<bool>> ValidateBeaconAsync(string beaconId, Guid userId)
        {
            try
            {
                var beacon = await _context.Beacons
                    .Include(b => b.Geofence)
                        .ThenInclude(g => g.UserGeofences)
                    .FirstOrDefaultAsync(b => b.BeaconId == beaconId && b.IsActive);

                if (beacon == null)
                {
                    return ApiResponse<bool>.SuccessResult(false);
                }

                // Check if user has access to this beacon's geofence
                var hasAccess = beacon.Geofence?.UserGeofences?.Any(ug => ug.UserId == userId) ?? false;
                return ApiResponse<bool>.SuccessResult(hasAccess);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating beacon for user: {UserId}", userId);
                return ApiResponse<bool>.ErrorResult("An error occurred while validating beacon");
            }
        }

        public async Task<ApiResponse<PagedResult<AttendanceRecordDto>>> GetAttendanceReportsAsync(PagedRequest request, Guid? userId = null)
        {
            try
            {
                var query = _context.AttendanceRecords.AsQueryable();

                if (userId.HasValue)
                {
                    query = query.Where(ar => ar.UserId == userId.Value);
                }

                if (!string.IsNullOrEmpty(request.SearchTerm))
                {
                    query = query.Where(ar => ar.User.FirstName.Contains(request.SearchTerm) ||
                                             ar.User.LastName.Contains(request.SearchTerm) ||
                                             ar.User.Email.Contains(request.SearchTerm) ||
                                             ar.User.EmployeeId.Contains(request.SearchTerm));
                }

                var totalCount = await query.CountAsync();

                if (!string.IsNullOrEmpty(request.SortBy))
                {
                    query = request.SortDescending
                        ? query.OrderByDescending(ar => EF.Property<object>(ar, request.SortBy))
                        : query.OrderBy(ar => EF.Property<object>(ar, request.SortBy));
                }
                else
                {
                    query = query.OrderByDescending(ar => ar.Timestamp);
                }

                var records = await query
                    .Skip((request.PageNumber - 1) * request.PageSize)
                    .Take(request.PageSize)
                    .Include(ar => ar.User)
                    .ToListAsync();

                var dtos = new List<AttendanceRecordDto>();
                foreach (var record in records)
                {
                    dtos.Add(await MapToAttendanceRecordDto(record));
                }

                var result = new PagedResult<AttendanceRecordDto>
                {
                    Items = dtos,
                    TotalCount = totalCount,
                    PageNumber = request.PageNumber,
                    PageSize = request.PageSize
                };

                return ApiResponse<PagedResult<AttendanceRecordDto>>.SuccessResult(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting attendance reports");
                return ApiResponse<PagedResult<AttendanceRecordDto>>.ErrorResult("An error occurred while retrieving attendance reports");
            }
        }

        private AttendanceMethod DetermineAttendanceMethod(CheckInRequest request)
        {
            if (!string.IsNullOrEmpty(request.BiometricData))
                return AttendanceMethod.Biometric;
            
            if (!string.IsNullOrEmpty(request.BeaconId))
                return AttendanceMethod.Beacon;
            
            if (request.Latitude.HasValue && request.Longitude.HasValue)
                return AttendanceMethod.GPS;
            
            return AttendanceMethod.Manual;
        }

        private AttendanceMethod DetermineAttendanceMethod(CheckOutRequest request)
        {
            if (!string.IsNullOrEmpty(request.BiometricData))
                return AttendanceMethod.Biometric;
            
            if (!string.IsNullOrEmpty(request.BeaconId))
                return AttendanceMethod.Beacon;
            
            if (request.Latitude.HasValue && request.Longitude.HasValue)
                return AttendanceMethod.GPS;
            
            return AttendanceMethod.Manual;
        }

        private async Task<string?> GetBeaconNameAsync(string? beaconId)
        {
            if (string.IsNullOrEmpty(beaconId))
                return null;

            var beacon = await _context.Beacons
                .FirstOrDefaultAsync(b => b.BeaconId == beaconId);
            
            return beacon?.Name;
        }

        private async Task<string?> ProcessPhotoAsync(string? photoBase64)
        {
            if (string.IsNullOrEmpty(photoBase64))
                return null;

            try
            {
                var photoBytes = Convert.FromBase64String(photoBase64);
                
                if (photoBytes.Length > 5 * 1024 * 1024) // 5MB limit
                {
                    _logger.LogWarning("Photo size exceeds limit: {Size} bytes", photoBytes.Length);
                    throw new ArgumentException("Photo size exceeds 5MB limit");
                }

                var fileName = $"attendance_{Guid.NewGuid()}.jpg";
                var photoDirectory = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "photos");
                
                if (!Directory.Exists(photoDirectory))
                {
                    Directory.CreateDirectory(photoDirectory);
                }

                var filePath = Path.Combine(photoDirectory, fileName);
                
                using (var image = SixLabors.ImageSharp.Image.Load(photoBytes))
                {
                    if (image.Width > 1920 || image.Height > 1080)
                    {
                        image.Mutate(x => x.Resize(new ResizeOptions
                        {
                            Size = new Size(1920, 1080),
                            Mode = ResizeMode.Max
                        }));
                    }

                    await image.SaveAsJpegAsync(filePath, new JpegEncoder
                    {
                        Quality = 85
                    });
                }

                var photoUrl = $"/photos/{fileName}";
                
                _logger.LogInformation("Photo processed and saved successfully. PhotoUrl: {PhotoUrl}, Size: {Size} bytes", 
                    photoUrl, photoBytes.Length);

                return photoUrl;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing photo");
                throw new InvalidOperationException("Failed to process photo", ex);
            }
        }

        private async Task<Geofence?> GetNearestGeofenceAsync(double latitude, double longitude, Guid userId)
        {
            var userGeofences = await _context.UserGeofences
                .Include(ug => ug.Geofence)
                .Where(ug => ug.UserId == userId && ug.Geofence.IsActive)
                .Select(ug => ug.Geofence)
                .ToListAsync();

            Geofence? nearestGeofence = null;
            double minDistance = double.MaxValue;

            foreach (var geofence in userGeofences)
            {
                var distance = CalculateDistance(latitude, longitude, geofence.Latitude, geofence.Longitude);
                if (distance <= geofence.Radius && distance < minDistance)
                {
                    minDistance = distance;
                    nearestGeofence = geofence;
                }
            }

            return nearestGeofence;
        }

        private double CalculateDistance(double lat1, double lon1, double lat2, double lon2)
        {
            // Haversine formula to calculate distance between two points
            const double R = 6371000; // Earth's radius in meters
            
            var dLat = ToRadians(lat2 - lat1);
            var dLon = ToRadians(lon2 - lon1);
            
            var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                    Math.Cos(ToRadians(lat1)) * Math.Cos(ToRadians(lat2)) *
                    Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
            
            var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
            
            return R * c;
        }

        private double ToRadians(double degrees)
        {
            return degrees * Math.PI / 180;
        }

        private async Task<AttendanceRecordDto> MapToAttendanceRecordDto(AttendanceRecord record)
        {
            var user = record.User ?? await _context.Users.FindAsync(record.UserId);
            
            return new AttendanceRecordDto
            {
                Id = record.Id,
                UserId = record.UserId,
                UserName = user != null ? $"{user.FirstName} {user.LastName}" : "Unknown",
                Timestamp = record.Timestamp,
                Type = record.Type.ToString(),
                Method = record.Method.ToString(),
                Status = record.Status.ToString(),
                Latitude = record.Latitude,
                Longitude = record.Longitude,
                LocationName = record.LocationName,
                Address = record.Address,
                IsWithinGeofence = record.IsWithinGeofence,
                BeaconId = record.BeaconId,
                IsBiometricVerified = record.IsBiometricVerified,
                PhotoUrl = record.PhotoUrl,
                IsOfflineRecord = record.IsOfflineRecord,
                IsApproved = record.IsApproved,
                Notes = record.Notes
            };
        }
    }
}

