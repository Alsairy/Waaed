using Microsoft.EntityFrameworkCore;
using AttendancePlatform.Shared.Infrastructure.Data;
using AttendancePlatform.Shared.Domain.Entities;

namespace AttendancePlatform.Collaboration.Api.Services
{
    public class ScreenSharingService : IScreenSharingService
    {
        private readonly AttendancePlatformDbContext _context;
        private readonly ILogger<ScreenSharingService> _logger;

        public ScreenSharingService(AttendancePlatformDbContext context, ILogger<ScreenSharingService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<ScreenSharingSession> StartScreenSharingAsync(Guid hostId, string sessionName, Guid? conferenceId = null)
        {
            try
            {
                var session = new ScreenSharingSession
                {
                    Id = Guid.NewGuid(),
                    HostId = hostId,
                    ConferenceId = conferenceId,
                    SessionName = sessionName,
                    StartedAt = DateTime.UtcNow,
                    Status = "Active",
                    StreamUrl = $"https://screen.hudur.sa/{Guid.NewGuid():N}",
                    IsRecorded = false
                };

                _context.ScreenSharingSessions.Add(session);

                var participant = new ScreenSharingParticipant
                {
                    Id = Guid.NewGuid(),
                    SessionId = session.Id,
                    UserId = hostId,
                    JoinedAt = DateTime.UtcNow,
                    Permission = "Control"
                };

                _context.ScreenSharingParticipants.Add(participant);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Screen sharing session started successfully. SessionId: {SessionId}, HostId: {HostId}", 
                    session.Id, hostId);
                return session;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error starting screen sharing session. UserId: {UserId}", hostId);
                throw;
            }
        }

        public async Task<bool> StopScreenSharingAsync(Guid sessionId, Guid userId)
        {
            try
            {
                var session = await _context.ScreenSharingSessions
                    .FirstOrDefaultAsync(s => s.Id == sessionId && s.HostId == userId);

                if (session == null)
                    return false;

                session.Status = "Ended";
                session.EndedAt = DateTime.UtcNow;

                var activeParticipants = await _context.ScreenSharingParticipants
                    .Where(p => p.SessionId == sessionId && p.LeftAt == null)
                    .ToListAsync();

                foreach (var participant in activeParticipants)
                {
                    participant.LeftAt = DateTime.UtcNow;
                }

                await _context.SaveChangesAsync();

                _logger.LogInformation("Screen sharing session stopped successfully. SessionId: {SessionId}, HostId: {HostId}", 
                    sessionId, userId);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error stopping screen sharing session. SessionId: {SessionId}, UserId: {UserId}", 
                    sessionId, userId);
                throw;
            }
        }

        public async Task<ScreenSharingSession?> GetSessionAsync(Guid sessionId)
        {
            try
            {
                var session = await _context.ScreenSharingSessions
                    .Include(s => s.Host)
                    .Include(s => s.Participants.Where(p => p.LeftAt == null))
                    .ThenInclude(p => p.User)
                    .FirstOrDefaultAsync(s => s.Id == sessionId && s.Status == "Active");

                return session;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving active screen sharing session. SessionId: {SessionId}", sessionId);
                throw;
            }
        }

        public async Task<IEnumerable<ScreenSharingSession>> GetActiveSessionsAsync()
        {
            try
            {
                var sessions = await _context.ScreenSharingSessions
                    .Include(s => s.Participants)
                    .Where(s => s.Status == "Active")
                    .OrderByDescending(s => s.StartedAt)
                    .ToListAsync();

                return sessions;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving active screen sharing sessions");
                throw;
            }
        }

        public async Task<bool> JoinSessionAsync(Guid sessionId, Guid userId)
        {
            try
            {
                var session = await _context.ScreenSharingSessions
                    .Include(s => s.Participants)
                    .FirstOrDefaultAsync(s => s.Id == sessionId && s.Status == "Active");

                if (session == null)
                    return false;


                var existingParticipant = session.Participants
                    .FirstOrDefault(p => p.UserId == userId && p.LeftAt == null);

                if (existingParticipant != null)
                    return true;

                var participant = new ScreenSharingParticipant
                {
                    Id = Guid.NewGuid(),
                    SessionId = sessionId,
                    UserId = userId,
                    JoinedAt = DateTime.UtcNow,
                    Permission = "View"
                };

                _context.ScreenSharingParticipants.Add(participant);
                await _context.SaveChangesAsync();

                _logger.LogInformation("User joined screen sharing session successfully. SessionId: {SessionId}, UserId: {UserId}", 
                    sessionId, userId);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error joining screen sharing session. SessionId: {SessionId}, UserId: {UserId}", 
                    sessionId, userId);
                throw;
            }
        }

        public async Task<bool> LeaveSessionAsync(Guid sessionId, Guid userId)
        {
            try
            {
                var participant = await _context.ScreenSharingParticipants
                    .FirstOrDefaultAsync(p => p.SessionId == sessionId && p.UserId == userId && p.LeftAt == null);

                if (participant == null)
                    return false;

                participant.LeftAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                _logger.LogInformation("User left screen sharing session successfully. SessionId: {SessionId}, UserId: {UserId}", 
                    sessionId, userId);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error leaving screen sharing session. SessionId: {SessionId}, UserId: {UserId}", 
                    sessionId, userId);
                throw;
            }
        }

        public async Task<IEnumerable<ScreenSharingParticipant>> GetSessionParticipantsAsync(Guid sessionId)
        {
            try
            {
                var participants = await _context.ScreenSharingParticipants
                    .Include(p => p.User)
                    .Where(p => p.SessionId == sessionId && p.LeftAt == null)
                    .ToListAsync();

                return participants;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving session participants. SessionId: {SessionId}", sessionId);
                throw;
            }
        }

        public async Task<bool> GrantControlAsync(Guid sessionId, Guid userId, Guid requesterId)
        {
            try
            {
                var session = await _context.ScreenSharingSessions
                    .FirstOrDefaultAsync(s => s.Id == sessionId && s.HostId == requesterId);

                if (session == null)
                    throw new UnauthorizedAccessException("User not authorized to grant control");

                var participant = await _context.ScreenSharingParticipants
                    .FirstOrDefaultAsync(p => p.SessionId == sessionId && p.UserId == userId && p.LeftAt == null);

                if (participant == null)
                    return false;

                var currentControllers = await _context.ScreenSharingParticipants
                    .Where(p => p.SessionId == sessionId && p.Permission == "Control" && p.UserId != requesterId)
                    .ToListAsync();

                foreach (var controller in currentControllers)
                {
                    controller.Permission = "View";
                }

                participant.Permission = "Control";
                await _context.SaveChangesAsync();

                _logger.LogInformation("Control granted successfully. SessionId: {SessionId}, ParticipantId: {ParticipantId}, RequesterId: {RequesterId}", 
                    sessionId, userId, requesterId);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error granting control. SessionId: {SessionId}, ParticipantId: {ParticipantId}, RequesterId: {RequesterId}", 
                    sessionId, userId, requesterId);
                throw;
            }
        }

        public async Task<bool> RevokeControlAsync(Guid sessionId, Guid userId, Guid requesterId)
        {
            try
            {
                var session = await _context.ScreenSharingSessions
                    .FirstOrDefaultAsync(s => s.Id == sessionId && s.HostId == requesterId);

                if (session == null)
                    throw new UnauthorizedAccessException("User not authorized to revoke control");

                var participant = await _context.ScreenSharingParticipants
                    .FirstOrDefaultAsync(p => p.SessionId == sessionId && p.UserId == userId);

                if (participant == null)
                    return false;

                participant.Permission = "View";
                await _context.SaveChangesAsync();

                _logger.LogInformation("Control revoked successfully. SessionId: {SessionId}, ParticipantId: {ParticipantId}, RequesterId: {RequesterId}", 
                    sessionId, userId, requesterId);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error revoking control. SessionId: {SessionId}, ParticipantId: {ParticipantId}, RequesterId: {RequesterId}", 
                    sessionId, userId, requesterId);
                throw;
            }
        }

    }
}
