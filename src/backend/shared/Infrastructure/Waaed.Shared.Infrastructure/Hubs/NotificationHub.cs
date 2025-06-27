using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace AttendancePlatform.Shared.Infrastructure.Hubs;

[Authorize]
public class NotificationHub : Hub
{
    public async Task JoinUserGroup()
    {
        var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!string.IsNullOrEmpty(userId))
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"user_{userId}");
        }
    }

    public async Task JoinTenantGroup()
    {
        var tenantId = Context.User?.FindFirst("tenant_id")?.Value;
        if (!string.IsNullOrEmpty(tenantId))
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"tenant_{tenantId}");
        }
    }

    public async Task JoinRoleGroup(string role)
    {
        var userRoles = Context.User?.FindAll(ClaimTypes.Role)?.Select(c => c.Value);
        if (userRoles?.Contains(role) == true)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"role_{role}");
        }
    }

    public async Task LeaveUserGroup()
    {
        var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!string.IsNullOrEmpty(userId))
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"user_{userId}");
        }
    }

    public async Task LeaveTenantGroup()
    {
        var tenantId = Context.User?.FindFirst("tenant_id")?.Value;
        if (!string.IsNullOrEmpty(tenantId))
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"tenant_{tenantId}");
        }
    }

    public async Task LeaveRoleGroup(string role)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"role_{role}");
    }

    public override async Task OnConnectedAsync()
    {
        await JoinUserGroup();
        await JoinTenantGroup();
        
        var userRoles = Context.User?.FindAll(ClaimTypes.Role)?.Select(c => c.Value);
        if (userRoles != null)
        {
            foreach (var role in userRoles)
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, $"role_{role}");
            }
        }

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        await LeaveUserGroup();
        await LeaveTenantGroup();
        
        var userRoles = Context.User?.FindAll(ClaimTypes.Role)?.Select(c => c.Value);
        if (userRoles != null)
        {
            foreach (var role in userRoles)
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"role_{role}");
            }
        }

        await base.OnDisconnectedAsync(exception);
    }

    public async Task MarkNotificationAsRead(string notificationId)
    {
        await Clients.Caller.SendAsync("NotificationMarkedAsRead", notificationId);
    }

    public async Task RequestNotificationCount()
    {
        var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!string.IsNullOrEmpty(userId))
        {
            await Clients.Caller.SendAsync("NotificationCountRequested", userId);
        }
    }
}
