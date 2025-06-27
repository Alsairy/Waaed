using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;
using AttendancePlatform.Collaboration.Api.Services;

namespace AttendancePlatform.Collaboration.Api.Hubs
{
    [Authorize]
    public class ChatHub : Hub
    {
        private readonly IChatService _chatService;
        private readonly ILogger<ChatHub> _logger;

        public ChatHub(IChatService chatService, ILogger<ChatHub> logger)
        {
            _chatService = chatService;
            _logger = logger;
        }

        public async Task JoinChannel(string channelId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"channel_{channelId}");
            _logger.LogInformation("User {UserId} joined channel {ChannelId}", Context.UserIdentifier, channelId);
        }

        public async Task LeaveChannel(string channelId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"channel_{channelId}");
            _logger.LogInformation("User {UserId} left channel {ChannelId}", Context.UserIdentifier, channelId);
        }

        public async Task SendMessage(string channelId, string message)
        {
            if (Guid.TryParse(Context.UserIdentifier, out var userId) && Guid.TryParse(channelId, out var channelGuid))
            {
                var chatMessage = await _chatService.SendMessageAsync(userId, channelGuid, null, message);
                await Clients.Group($"channel_{channelId}").SendAsync("ReceiveMessage", chatMessage);
            }
        }

        public override async Task OnConnectedAsync()
        {
            _logger.LogInformation("User {UserId} connected to chat hub", Context.UserIdentifier);
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            _logger.LogInformation("User {UserId} disconnected from chat hub", Context.UserIdentifier);
            await base.OnDisconnectedAsync(exception);
        }
    }
}
