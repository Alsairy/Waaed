using Microsoft.EntityFrameworkCore;
using AttendancePlatform.Shared.Infrastructure.Data;
using AttendancePlatform.Shared.Domain.Entities;

namespace AttendancePlatform.Collaboration.Api.Services
{
    public interface IChatService
    {
        Task<ChatMessage> SendMessageAsync(Guid senderId, Guid? receiverId, Guid? channelId, string content, string? attachmentUrl = null);
        Task<IEnumerable<ChatMessage>> GetMessagesAsync(Guid? channelId, Guid? userId, int page = 1, int pageSize = 50);
        Task<ChatChannel> CreateChannelAsync(string name, string description, Guid createdById, bool isPrivate = false);
        Task<IEnumerable<ChatChannel>> GetUserChannelsAsync(Guid userId);
        Task<bool> JoinChannelAsync(Guid userId, Guid channelId);
        Task<bool> LeaveChannelAsync(Guid userId, Guid channelId);
        Task<bool> DeleteMessageAsync(Guid messageId, Guid userId);
        Task<ChatMessage> EditMessageAsync(Guid messageId, Guid userId, string newContent);
        Task<IEnumerable<ChatMessage>> SearchMessagesAsync(string query, Guid? channelId, Guid userId);
    }

    public class ChatService : IChatService
    {
        private readonly AttendancePlatformDbContext _context;
        private readonly ILogger<ChatService> _logger;

        public ChatService(AttendancePlatformDbContext context, ILogger<ChatService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<ChatMessage> SendMessageAsync(Guid senderId, Guid? receiverId, Guid? channelId, string content, string? attachmentUrl = null)
        {
            try
            {
                var message = new ChatMessage
                {
                    Id = Guid.NewGuid(),
                    SenderId = senderId,
                    ChannelId = channelId,
                    Content = content,
                    MessageType = string.IsNullOrEmpty(attachmentUrl) ? "Text" : "File",
                    SentAt = DateTime.UtcNow,
                    IsEdited = false
                };

                _context.ChatMessages.Add(message);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Message sent successfully. MessageId: {MessageId}, SenderId: {SenderId}", 
                    message.Id, senderId);

                return message;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending message. SenderId: {SenderId}, ChannelId: {ChannelId}", 
                    senderId, channelId);
                throw;
            }
        }

        public async Task<IEnumerable<ChatMessage>> GetMessagesAsync(Guid? channelId, Guid? userId, int page = 1, int pageSize = 50)
        {
            try
            {
                var query = _context.ChatMessages
                    .Include(m => m.Sender)
                    .Include(m => m.Channel)
                    .AsQueryable();

                if (channelId.HasValue)
                {
                    query = query.Where(m => m.ChannelId == channelId.Value);
                }
                else if (userId.HasValue)
                {
                    query = query.Where(m => m.SenderId == userId.Value);
                }

                var messages = await query
                    .OrderByDescending(m => m.SentAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                return messages.OrderBy(m => m.SentAt);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving messages. ChannelId: {ChannelId}, UserId: {UserId}", 
                    channelId, userId);
                throw;
            }
        }

        public async Task<ChatChannel> CreateChannelAsync(string name, string description, Guid createdById, bool isPrivate = false)
        {
            try
            {
                var channel = new ChatChannel
                {
                    Id = Guid.NewGuid(),
                    Name = name,
                    Description = description,
                    CreatedById = createdById,
                    CreatedAt = DateTime.UtcNow,
                    ChannelType = isPrivate ? "Private" : "Public",
                    IsActive = true
                };

                _context.ChatChannels.Add(channel);

                var membership = new ChannelMember
                {
                    Id = Guid.NewGuid(),
                    UserId = createdById,
                    ChannelId = channel.Id,
                    JoinedAt = DateTime.UtcNow,
                    Role = "Admin"
                };

                _context.ChannelMembers.Add(membership);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Channel created successfully. ChannelId: {ChannelId}, Name: {Name}", 
                    channel.Id, name);

                return channel;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating channel. Name: {Name}, CreatedById: {CreatedById}", 
                    name, createdById);
                throw;
            }
        }

        public async Task<IEnumerable<ChatChannel>> GetUserChannelsAsync(Guid userId)
        {
            try
            {
                var channels = await _context.ChannelMembers
                    .Include(cm => cm.Channel)
                    .Where(cm => cm.UserId == userId && cm.Channel.IsActive)
                    .Select(cm => cm.Channel)
                    .ToListAsync();

                return channels;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user channels. UserId: {UserId}", userId);
                throw;
            }
        }

        public async Task<bool> JoinChannelAsync(Guid userId, Guid channelId)
        {
            try
            {
                var existingMembership = await _context.ChannelMembers
                    .FirstOrDefaultAsync(cm => cm.UserId == userId && cm.ChannelId == channelId);

                if (existingMembership != null)
                    return false;

                var membership = new ChannelMember
                {
                    Id = Guid.NewGuid(),
                    UserId = userId,
                    ChannelId = channelId,
                    JoinedAt = DateTime.UtcNow,
                    Role = "Member"
                };

                _context.ChannelMembers.Add(membership);
                await _context.SaveChangesAsync();

                _logger.LogInformation("User joined channel successfully. UserId: {UserId}, ChannelId: {ChannelId}", 
                    userId, channelId);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error joining channel. UserId: {UserId}, ChannelId: {ChannelId}", 
                    userId, channelId);
                throw;
            }
        }

        public async Task<bool> LeaveChannelAsync(Guid userId, Guid channelId)
        {
            try
            {
                var membership = await _context.ChannelMembers
                    .FirstOrDefaultAsync(cm => cm.UserId == userId && cm.ChannelId == channelId);

                if (membership == null)
                    return false;

                _context.ChannelMembers.Remove(membership);
                await _context.SaveChangesAsync();

                _logger.LogInformation("User left channel successfully. UserId: {UserId}, ChannelId: {ChannelId}", 
                    userId, channelId);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error leaving channel. UserId: {UserId}, ChannelId: {ChannelId}", 
                    userId, channelId);
                throw;
            }
        }

        public async Task<bool> DeleteMessageAsync(Guid messageId, Guid userId)
        {
            try
            {
                var message = await _context.ChatMessages
                    .FirstOrDefaultAsync(m => m.Id == messageId && m.SenderId == userId);

                if (message == null)
                    return false;

                _context.ChatMessages.Remove(message);

                await _context.SaveChangesAsync();

                _logger.LogInformation("Message deleted successfully. MessageId: {MessageId}, UserId: {UserId}", 
                    messageId, userId);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting message. MessageId: {MessageId}, UserId: {UserId}", 
                    messageId, userId);
                throw;
            }
        }

        public async Task<ChatMessage> EditMessageAsync(Guid messageId, Guid userId, string newContent)
        {
            try
            {
                var message = await _context.ChatMessages
                    .FirstOrDefaultAsync(m => m.Id == messageId && m.SenderId == userId);

                if (message == null)
                    throw new UnauthorizedAccessException("Message not found or user not authorized to edit");

                message.Content = newContent;
                message.IsEdited = true;
                message.EditedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                _logger.LogInformation("Message edited successfully. MessageId: {MessageId}, UserId: {UserId}", 
                    messageId, userId);

                return message;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error editing message. MessageId: {MessageId}, UserId: {UserId}", 
                    messageId, userId);
                throw;
            }
        }

        public async Task<IEnumerable<ChatMessage>> SearchMessagesAsync(string query, Guid? channelId, Guid userId)
        {
            try
            {
                var messagesQuery = _context.ChatMessages
                    .Include(m => m.Sender)
                    .Where(m => m.Content.Contains(query));

                if (channelId.HasValue)
                {
                    messagesQuery = messagesQuery.Where(m => m.ChannelId == channelId.Value);
                }
                else
                {
                    messagesQuery = messagesQuery.Where(m => m.SenderId == userId);
                }

                var messages = await messagesQuery
                    .OrderByDescending(m => m.SentAt)
                    .Take(100)
                    .ToListAsync();

                return messages;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching messages. Query: {Query}, ChannelId: {ChannelId}, UserId: {UserId}", 
                    query, channelId, userId);
                throw;
            }
        }
    }
}
