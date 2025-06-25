using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;
using AttendancePlatform.Collaboration.Api.Services;

namespace AttendancePlatform.Collaboration.Api.Hubs
{
    [Authorize]
    public class DocumentCollaborationHub : Hub
    {
        private readonly IDocumentCollaborationService _documentService;
        private readonly ILogger<DocumentCollaborationHub> _logger;

        public DocumentCollaborationHub(IDocumentCollaborationService documentService, ILogger<DocumentCollaborationHub> logger)
        {
            _documentService = documentService;
            _logger = logger;
        }

        public async Task JoinDocument(string documentId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"document_{documentId}");
            
            if (Guid.TryParse(Context.UserIdentifier, out var userId) && Guid.TryParse(documentId, out var docGuid))
            {
                await _documentService.LockDocumentAsync(docGuid, userId);
                await Clients.Group($"document_{documentId}").SendAsync("UserJoinedDocument", userId);
            }
            
            _logger.LogInformation("User {UserId} joined document {DocumentId}", Context.UserIdentifier, documentId);
        }

        public async Task LeaveDocument(string documentId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"document_{documentId}");
            
            if (Guid.TryParse(Context.UserIdentifier, out var userId) && Guid.TryParse(documentId, out var docGuid))
            {
                await _documentService.UnlockDocumentAsync(docGuid, userId);
                await Clients.Group($"document_{documentId}").SendAsync("UserLeftDocument", userId);
            }
            
            _logger.LogInformation("User {UserId} left document {DocumentId}", Context.UserIdentifier, documentId);
        }

        public async Task SendDocumentChange(string documentId, string changeType, object data)
        {
            await Clients.Group($"document_{documentId}").SendAsync("DocumentChanged", Context.UserIdentifier, changeType, data);
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            _logger.LogInformation("User {UserId} disconnected from document hub", Context.UserIdentifier);
            await base.OnDisconnectedAsync(exception);
        }
    }
}
