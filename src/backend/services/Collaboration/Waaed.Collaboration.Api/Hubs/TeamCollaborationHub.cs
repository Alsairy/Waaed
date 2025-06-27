using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;
using AttendancePlatform.Collaboration.Api.Services;

namespace AttendancePlatform.Collaboration.Api.Hubs
{
    [Authorize]
    public class TeamCollaborationHub : Hub
    {
        private readonly ITeamCollaborationService _teamService;
        private readonly ILogger<TeamCollaborationHub> _logger;

        public TeamCollaborationHub(ITeamCollaborationService teamService, ILogger<TeamCollaborationHub> logger)
        {
            _teamService = teamService;
            _logger = logger;
        }

        public async Task JoinTeam(string teamId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"team_{teamId}");
            await Clients.Group($"team_{teamId}").SendAsync("UserJoinedTeam", Context.UserIdentifier);
            _logger.LogInformation("User {UserId} joined team {TeamId}", Context.UserIdentifier, teamId);
        }

        public async Task LeaveTeam(string teamId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"team_{teamId}");
            await Clients.Group($"team_{teamId}").SendAsync("UserLeftTeam", Context.UserIdentifier);
            _logger.LogInformation("User {UserId} left team {TeamId}", Context.UserIdentifier, teamId);
        }

        public async Task NotifyTeamUpdate(string teamId, string updateType, object data)
        {
            await Clients.Group($"team_{teamId}").SendAsync("TeamUpdate", updateType, data);
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            _logger.LogInformation("User {UserId} disconnected from team hub", Context.UserIdentifier);
            await base.OnDisconnectedAsync(exception);
        }
    }
}
