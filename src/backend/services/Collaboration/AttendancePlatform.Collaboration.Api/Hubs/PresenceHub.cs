using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;
using AttendancePlatform.Collaboration.Api.Services;

namespace AttendancePlatform.Collaboration.Api.Hubs
{
    [Authorize]
    public class PresenceHub : Hub
    {
        private readonly IPresenceService _presenceService;
        private readonly ILogger<PresenceHub> _logger;

        public PresenceHub(IPresenceService presenceService, ILogger<PresenceHub> logger)
        {
            _presenceService = presenceService;
            _logger = logger;
        }

        public async Task UpdatePresence(string status, string? message = null)
        {
            if (Guid.TryParse(Context.UserIdentifier, out var userId))
            {
                var presence = await _presenceService.UpdatePresenceAsync(userId, status, message);
                await Clients.All.SendAsync("PresenceUpdated", presence);
            }
        }

        public async Task SetBusy(string? reason = null)
        {
            if (Guid.TryParse(Context.UserIdentifier, out var userId))
            {
                var presence = await _presenceService.SetUserBusyAsync(userId, reason);
                await Clients.All.SendAsync("PresenceUpdated", presence);
            }
        }

        public async Task SetAvailable()
        {
            if (Guid.TryParse(Context.UserIdentifier, out var userId))
            {
                var presence = await _presenceService.SetUserAvailableAsync(userId);
                await Clients.All.SendAsync("PresenceUpdated", presence);
            }
        }

        public override async Task OnConnectedAsync()
        {
            if (Guid.TryParse(Context.UserIdentifier, out var userId))
            {
                await _presenceService.UpdateLastSeenAsync(userId);
                await Clients.All.SendAsync("UserOnline", userId);
            }
            
            _logger.LogInformation("User {UserId} connected to presence hub", Context.UserIdentifier);
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            if (Guid.TryParse(Context.UserIdentifier, out var userId))
            {
                await _presenceService.SetUserOfflineAsync(userId);
                await Clients.All.SendAsync("UserOffline", userId);
            }
            
            _logger.LogInformation("User {UserId} disconnected from presence hub", Context.UserIdentifier);
            await base.OnDisconnectedAsync(exception);
        }
    }
}
