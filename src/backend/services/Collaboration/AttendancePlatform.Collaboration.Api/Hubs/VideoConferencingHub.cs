using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;
using AttendancePlatform.Collaboration.Api.Services;

namespace AttendancePlatform.Collaboration.Api.Hubs
{
    [Authorize]
    public class VideoConferencingHub : Hub
    {
        private readonly IVideoConferencingService _videoService;
        private readonly ILogger<VideoConferencingHub> _logger;

        public VideoConferencingHub(IVideoConferencingService videoService, ILogger<VideoConferencingHub> logger)
        {
            _videoService = videoService;
            _logger = logger;
        }

        public async Task JoinConference(string conferenceId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"conference_{conferenceId}");
            
            if (Guid.TryParse(Context.UserIdentifier, out var userId) && Guid.TryParse(conferenceId, out var confGuid))
            {
                await _videoService.JoinConferenceAsync(confGuid, userId);
                await Clients.Group($"conference_{conferenceId}").SendAsync("UserJoined", userId);
            }
            
            _logger.LogInformation("User {UserId} joined conference {ConferenceId}", Context.UserIdentifier, conferenceId);
        }

        public async Task LeaveConference(string conferenceId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"conference_{conferenceId}");
            
            if (Guid.TryParse(Context.UserIdentifier, out var userId) && Guid.TryParse(conferenceId, out var confGuid))
            {
                await _videoService.LeaveConferenceAsync(confGuid, userId);
                await Clients.Group($"conference_{conferenceId}").SendAsync("UserLeft", userId);
            }
            
            _logger.LogInformation("User {UserId} left conference {ConferenceId}", Context.UserIdentifier, conferenceId);
        }

        public async Task SendSignal(string conferenceId, string signal, object data)
        {
            await Clients.Group($"conference_{conferenceId}").SendAsync("ReceiveSignal", Context.UserIdentifier, signal, data);
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            _logger.LogInformation("User {UserId} disconnected from video hub", Context.UserIdentifier);
            await base.OnDisconnectedAsync(exception);
        }
    }
}
