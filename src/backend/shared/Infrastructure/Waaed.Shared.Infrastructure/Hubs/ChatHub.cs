using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using System.Security.Claims;

namespace AttendancePlatform.Shared.Infrastructure.Hubs;

[Authorize]
public class ChatHub : Hub
{
    private readonly ILogger<ChatHub> _logger;

    public ChatHub(ILogger<ChatHub> logger)
    {
        _logger = logger;
    }

    public async Task JoinChatRoom(string chatRoomId)
    {
        var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!string.IsNullOrEmpty(userId))
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, chatRoomId);
            await Clients.Group(chatRoomId).SendAsync("UserJoinedRoom", new
            {
                UserId = userId,
                ChatRoomId = chatRoomId,
                ConnectionId = Context.ConnectionId,
                Timestamp = DateTime.UtcNow
            });

            _logger.LogInformation("User {UserId} joined chat room {ChatRoomId}", userId, chatRoomId);
        }
    }

    public async Task LeaveChatRoom(string chatRoomId)
    {
        var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!string.IsNullOrEmpty(userId))
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, chatRoomId);
            await Clients.Group(chatRoomId).SendAsync("UserLeftRoom", new
            {
                UserId = userId,
                ChatRoomId = chatRoomId,
                ConnectionId = Context.ConnectionId,
                Timestamp = DateTime.UtcNow
            });

            _logger.LogInformation("User {UserId} left chat room {ChatRoomId}", userId, chatRoomId);
        }
    }

    public async Task SendMessage(string chatRoomId, string message, string messageType = "text")
    {
        var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var userName = Context.User?.FindFirst(ClaimTypes.Name)?.Value ?? 
                       Context.User?.FindFirst(ClaimTypes.Email)?.Value ?? "Unknown";

        if (!string.IsNullOrEmpty(userId))
        {
            var chatMessage = new
            {
                Id = Guid.NewGuid().ToString(),
                ChatRoomId = chatRoomId,
                SenderId = userId,
                SenderName = userName,
                Content = message,
                MessageType = messageType,
                Timestamp = DateTime.UtcNow,
                IsEdited = false
            };

            await Clients.Group(chatRoomId).SendAsync("ReceiveMessage", chatMessage);
            _logger.LogInformation("Message sent by {UserId} to chat room {ChatRoomId}", userId, chatRoomId);
        }
    }

    public async Task SendTypingIndicator(string chatRoomId, bool isTyping)
    {
        var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var userName = Context.User?.FindFirst(ClaimTypes.Name)?.Value ?? 
                       Context.User?.FindFirst(ClaimTypes.Email)?.Value ?? "Unknown";

        if (!string.IsNullOrEmpty(userId))
        {
            await Clients.GroupExcept(chatRoomId, Context.ConnectionId).SendAsync("TypingIndicator", new
            {
                UserId = userId,
                UserName = userName,
                ChatRoomId = chatRoomId,
                IsTyping = isTyping,
                Timestamp = DateTime.UtcNow
            });
        }
    }

    public async Task MarkMessagesAsRead(string chatRoomId, string lastMessageId)
    {
        var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!string.IsNullOrEmpty(userId))
        {
            await Clients.Group(chatRoomId).SendAsync("MessagesMarkedAsRead", new
            {
                UserId = userId,
                ChatRoomId = chatRoomId,
                LastMessageId = lastMessageId,
                Timestamp = DateTime.UtcNow
            });

            _logger.LogInformation("User {UserId} marked messages as read in chat room {ChatRoomId}", 
                userId, chatRoomId);
        }
    }

    public async Task RequestChatHistory(string chatRoomId, int page = 1, int pageSize = 50)
    {
        var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!string.IsNullOrEmpty(userId))
        {
            await Clients.Caller.SendAsync("ChatHistoryRequested", new
            {
                ChatRoomId = chatRoomId,
                Page = page,
                PageSize = pageSize,
                RequestedBy = userId,
                Timestamp = DateTime.UtcNow
            });
        }
    }

    public override async Task OnConnectedAsync()
    {
        var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!string.IsNullOrEmpty(userId))
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"user_{userId}");
            _logger.LogInformation("User {UserId} connected to chat hub with connection {ConnectionId}", 
                userId, Context.ConnectionId);
        }

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!string.IsNullOrEmpty(userId))
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"user_{userId}");
            _logger.LogInformation("User {UserId} disconnected from chat hub with connection {ConnectionId}", 
                userId, Context.ConnectionId);
        }

        await base.OnDisconnectedAsync(exception);
    }
}
