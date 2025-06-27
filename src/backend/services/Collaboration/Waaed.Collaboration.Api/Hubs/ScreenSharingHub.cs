using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;
using AttendancePlatform.Collaboration.Api.Services;

namespace AttendancePlatform.Collaboration.Api.Hubs
{
    [Authorize]
    public class ScreenSharingHub : Hub
    {
        private readonly IScreenSharingService _screenSharingService;
        private readonly ILogger<ScreenSharingHub> _logger;

        public ScreenSharingHub(IScreenSharingService screenSharingService, ILogger<ScreenSharingHub> logger)
        {
            _screenSharingService = screenSharingService;
            _logger = logger;
        }

        public async Task StartScreenSharing(string sessionName, string? conferenceId = null)
        {
            if (Guid.TryParse(Context.UserIdentifier, out var userId))
            {
                var confGuid = string.IsNullOrEmpty(conferenceId) ? (Guid?)null : Guid.Parse(conferenceId);
                var session = await _screenSharingService.StartScreenSharingAsync(userId, sessionName, confGuid);
                
                await Groups.AddToGroupAsync(Context.ConnectionId, $"screen_{session.Id}");
                await Clients.All.SendAsync("ScreenSharingStarted", session);
            }
        }

        public async Task JoinScreenSharing(string sessionId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"screen_{sessionId}");
            
            if (Guid.TryParse(Context.UserIdentifier, out var userId) && Guid.TryParse(sessionId, out var sessionGuid))
            {
                await _screenSharingService.JoinSessionAsync(sessionGuid, userId);
                await Clients.Group($"screen_{sessionId}").SendAsync("UserJoinedScreenSharing", userId);
            }
            
            _logger.LogInformation("User {UserId} joined screen sharing session {SessionId}", Context.UserIdentifier, sessionId);
        }

        public async Task LeaveScreenSharing(string sessionId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"screen_{sessionId}");
            
            if (Guid.TryParse(Context.UserIdentifier, out var userId) && Guid.TryParse(sessionId, out var sessionGuid))
            {
                await _screenSharingService.LeaveSessionAsync(sessionGuid, userId);
                await Clients.Group($"screen_{sessionId}").SendAsync("UserLeftScreenSharing", userId);
            }
            
            _logger.LogInformation("User {UserId} left screen sharing session {SessionId}", Context.UserIdentifier, sessionId);
        }

        public async Task StopScreenSharing(string sessionId)
        {
            if (Guid.TryParse(Context.UserIdentifier, out var userId) && Guid.TryParse(sessionId, out var sessionGuid))
            {
                await _screenSharingService.StopScreenSharingAsync(sessionGuid, userId);
                await Clients.Group($"screen_{sessionId}").SendAsync("ScreenSharingStopped", sessionId);
            }
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            _logger.LogInformation("User {UserId} disconnected from screen sharing hub", Context.UserIdentifier);
            await base.OnDisconnectedAsync(exception);
        }
    }
}
