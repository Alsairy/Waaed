using Microsoft.EntityFrameworkCore;
using AttendancePlatform.Shared.Infrastructure.Data;
using AttendancePlatform.Shared.Domain.Entities;

namespace AttendancePlatform.Collaboration.Api.Services
{
    public interface IPresenceService
    {
        Task<UserPresence> UpdatePresenceAsync(Guid userId, string status, string? customMessage = null);
        Task<UserPresence?> GetUserPresenceAsync(Guid userId);
        Task<IEnumerable<UserPresence>> GetTeamPresenceAsync(Guid teamId);
        Task<bool> SetUserOfflineAsync(Guid userId);
        Task<IEnumerable<UserPresence>> GetOnlineUsersAsync();
        Task<bool> UpdateLastSeenAsync(Guid userId);
        Task<UserPresence> SetUserBusyAsync(Guid userId, string? reason = null);
        Task<UserPresence> SetUserAvailableAsync(Guid userId);
    }

    public class PresenceService : IPresenceService
    {
        private readonly AttendancePlatformDbContext _context;
        private readonly ILogger<PresenceService> _logger;

        public PresenceService(AttendancePlatformDbContext context, ILogger<PresenceService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<UserPresence> UpdatePresenceAsync(Guid userId, string status, string? customMessage = null)
        {
            try
            {
                var presence = await _context.UserPresences
                    .FirstOrDefaultAsync(up => up.UserId == userId);

                if (presence == null)
                {
                    presence = new UserPresence
                    {
                        Id = Guid.NewGuid(),
                        UserId = userId,
                        Status = status,
                        StatusMessage = customMessage,
                        LastSeen = DateTime.UtcNow,
                        IsOnline = status != "Offline"
                    };

                    _context.UserPresences.Add(presence);
                }
                else
                {
                    presence.Status = status;
                    presence.StatusMessage = customMessage;
                    presence.LastSeen = DateTime.UtcNow;
                    presence.IsOnline = status != "Offline";
                }

                await _context.SaveChangesAsync();

                _logger.LogInformation("User presence updated successfully. UserId: {UserId}, Status: {Status}", 
                    userId, status);
                return presence;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user presence. UserId: {UserId}, Status: {Status}", userId, status);
                throw;
            }
        }

        public async Task<UserPresence?> GetUserPresenceAsync(Guid userId)
        {
            try
            {
                var presence = await _context.UserPresences
                    .Include(up => up.User)
                    .FirstOrDefaultAsync(up => up.UserId == userId);

                if (presence != null && presence.LastSeen < DateTime.UtcNow.AddMinutes(-5) && presence.IsOnline)
                {
                    presence.IsOnline = false;
                    presence.Status = "Away";
                    await _context.SaveChangesAsync();
                }

                return presence;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user presence. UserId: {UserId}", userId);
                throw;
            }
        }

        public async Task<IEnumerable<UserPresence>> GetTeamPresenceAsync(Guid teamId)
        {
            try
            {
                var teamMemberIds = await _context.TeamMembers
                    .Where(tm => tm.TeamId == teamId)
                    .Select(tm => tm.UserId)
                    .ToListAsync();

                var presences = await _context.UserPresences
                    .Include(up => up.User)
                    .Where(up => teamMemberIds.Contains(up.UserId))
                    .ToListAsync();

                foreach (var presence in presences.Where(p => p.LastSeen < DateTime.UtcNow.AddMinutes(-5) && p.IsOnline))
                {
                    presence.IsOnline = false;
                    presence.Status = "Away";
                }

                await _context.SaveChangesAsync();

                return presences;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving team presence. TeamId: {TeamId}", teamId);
                throw;
            }
        }

        public async Task<bool> SetUserOfflineAsync(Guid userId)
        {
            try
            {
                var presence = await _context.UserPresences
                    .FirstOrDefaultAsync(up => up.UserId == userId);

                if (presence == null)
                    return false;

                presence.Status = "Offline";
                presence.IsOnline = false;
                presence.LastSeen = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                _logger.LogInformation("User set to offline successfully. UserId: {UserId}", userId);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error setting user offline. UserId: {UserId}", userId);
                throw;
            }
        }

        public async Task<IEnumerable<UserPresence>> GetOnlineUsersAsync()
        {
            try
            {
                var cutoffTime = DateTime.UtcNow.AddMinutes(-5);
                
                var onlinePresences = await _context.UserPresences
                    .Include(up => up.User)
                    .Where(up => up.IsOnline && up.LastSeen > cutoffTime)
                    .ToListAsync();

                var stalePresences = await _context.UserPresences
                    .Where(up => up.IsOnline && up.LastSeen <= cutoffTime)
                    .ToListAsync();

                foreach (var presence in stalePresences)
                {
                    presence.IsOnline = false;
                    presence.Status = "Away";
                }

                if (stalePresences.Any())
                {
                    await _context.SaveChangesAsync();
                }

                return onlinePresences;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving online users");
                throw;
            }
        }

        public async Task<bool> UpdateLastSeenAsync(Guid userId)
        {
            try
            {
                var presence = await _context.UserPresences
                    .FirstOrDefaultAsync(up => up.UserId == userId);

                if (presence == null)
                {
                    presence = new UserPresence
                    {
                        Id = Guid.NewGuid(),
                        UserId = userId,
                        Status = "Online",
                        LastSeen = DateTime.UtcNow,
                        IsOnline = true
                    };

                    _context.UserPresences.Add(presence);
                }
                else
                {
                    presence.LastSeen = DateTime.UtcNow;
                    if (!presence.IsOnline)
                    {
                        presence.IsOnline = true;
                        presence.Status = "Online";
                    }
                }

                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating last seen. UserId: {UserId}", userId);
                throw;
            }
        }

        public async Task<UserPresence> SetUserBusyAsync(Guid userId, string? reason = null)
        {
            try
            {
                var presence = await _context.UserPresences
                    .FirstOrDefaultAsync(up => up.UserId == userId);

                if (presence == null)
                {
                    presence = new UserPresence
                    {
                        Id = Guid.NewGuid(),
                        UserId = userId,
                        Status = "Busy",
                        StatusMessage = reason,
                        LastSeen = DateTime.UtcNow,
                        IsOnline = true
                    };

                    _context.UserPresences.Add(presence);
                }
                else
                {
                    presence.Status = "Busy";
                    presence.StatusMessage = reason;
                    presence.LastSeen = DateTime.UtcNow;
                    presence.IsOnline = true;
                }

                await _context.SaveChangesAsync();

                _logger.LogInformation("User set to busy successfully. UserId: {UserId}, Reason: {Reason}", userId, reason);
                return presence;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error setting user busy. UserId: {UserId}", userId);
                throw;
            }
        }

        public async Task<UserPresence> SetUserAvailableAsync(Guid userId)
        {
            try
            {
                var presence = await _context.UserPresences
                    .FirstOrDefaultAsync(up => up.UserId == userId);

                if (presence == null)
                {
                    presence = new UserPresence
                    {
                        Id = Guid.NewGuid(),
                        UserId = userId,
                        Status = "Available",
                        LastSeen = DateTime.UtcNow,
                        IsOnline = true
                    };

                    _context.UserPresences.Add(presence);
                }
                else
                {
                    presence.Status = "Available";
                    presence.StatusMessage = null;
                    presence.LastSeen = DateTime.UtcNow;
                    presence.IsOnline = true;
                }

                await _context.SaveChangesAsync();

                _logger.LogInformation("User set to available successfully. UserId: {UserId}", userId);
                return presence;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error setting user available. UserId: {UserId}", userId);
                throw;
            }
        }
    }
}
