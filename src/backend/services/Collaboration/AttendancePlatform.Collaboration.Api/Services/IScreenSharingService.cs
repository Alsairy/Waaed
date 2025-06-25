using AttendancePlatform.Shared.Domain.Entities;

namespace AttendancePlatform.Collaboration.Api.Services
{
    public interface IScreenSharingService
    {
        Task<ScreenSharingSession> StartScreenSharingAsync(Guid hostId, string sessionName, Guid? conferenceId = null);
        Task<bool> StopScreenSharingAsync(Guid sessionId, Guid userId);
        Task<ScreenSharingSession?> GetSessionAsync(Guid sessionId);
        Task<IEnumerable<ScreenSharingSession>> GetActiveSessionsAsync();
        Task<bool> JoinSessionAsync(Guid sessionId, Guid userId);
        Task<bool> LeaveSessionAsync(Guid sessionId, Guid userId);
        Task<IEnumerable<ScreenSharingParticipant>> GetSessionParticipantsAsync(Guid sessionId);
        Task<bool> GrantControlAsync(Guid sessionId, Guid userId, Guid requesterId);
        Task<bool> RevokeControlAsync(Guid sessionId, Guid userId, Guid requesterId);
    }
}
