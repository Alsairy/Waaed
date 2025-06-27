using Microsoft.EntityFrameworkCore;
using AttendancePlatform.Shared.Infrastructure.Data;
using AttendancePlatform.Shared.Domain.Entities;
using System.Text.RegularExpressions;

namespace AttendancePlatform.Notifications.Api.Services
{
    public interface INotificationTemplateService
    {
        Task<NotificationTemplate?> GetTemplateAsync(string name, string type);
        Task<NotificationTemplate> CreateTemplateAsync(CreateTemplateRequest request);
        Task<bool> UpdateTemplateAsync(Guid id, UpdateTemplateRequest request);
        Task<bool> DeleteTemplateAsync(Guid id);
        Task<IEnumerable<NotificationTemplate>> GetTemplatesAsync(string? type = null);
        Task<string> RenderTemplateAsync(string template, object data);
        Task<bool> ValidateTemplateAsync(string template);
    }

    public class NotificationTemplateService : INotificationTemplateService
    {
        private readonly AttendancePlatformDbContext _context;
        private readonly ILogger<NotificationTemplateService> _logger;

        public NotificationTemplateService(
            AttendancePlatformDbContext context,
            ILogger<NotificationTemplateService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<NotificationTemplate?> GetTemplateAsync(string name, string type)
        {
            return await _context.NotificationTemplates
                .FirstOrDefaultAsync(t => t.Name == name && t.Type == type && t.IsActive);
        }

        public async Task<NotificationTemplate> CreateTemplateAsync(CreateTemplateRequest request)
        {
            var template = new NotificationTemplate
            {
                Id = Guid.NewGuid(),
                Name = request.Name,
                Type = request.Type,
                Subject = request.Subject,
                Body = request.Body,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.NotificationTemplates.Add(template);
            await _context.SaveChangesAsync();

            _logger.LogInformation($"Created notification template {template.Name} of type {template.Type}");

            return template;
        }

        public async Task<bool> UpdateTemplateAsync(Guid id, UpdateTemplateRequest request)
        {
            var template = await _context.NotificationTemplates.FindAsync(id);
            if (template == null)
                return false;

            template.Subject = request.Subject ?? template.Subject;
            template.Body = request.Body ?? template.Body;
            template.IsActive = request.IsActive ?? template.IsActive;
            template.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation($"Updated notification template {id}");

            return true;
        }

        public async Task<bool> DeleteTemplateAsync(Guid id)
        {
            var template = await _context.NotificationTemplates.FindAsync(id);
            if (template == null)
                return false;

            template.IsActive = false;
            template.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation($"Deleted notification template {id}");

            return true;
        }

        public async Task<IEnumerable<NotificationTemplate>> GetTemplatesAsync(string? type = null)
        {
            var query = _context.NotificationTemplates.Where(t => t.IsActive);

            if (!string.IsNullOrEmpty(type))
                query = query.Where(t => t.Type == type);

            return await query.ToListAsync();
        }

        public async Task<string> RenderTemplateAsync(string template, object data)
        {
            try
            {
                var rendered = template;
                var properties = data.GetType().GetProperties();

                foreach (var property in properties)
                {
                    var value = property.GetValue(data)?.ToString() ?? "";
                    var placeholder = $"{{{{{property.Name}}}}}";
                    rendered = rendered.Replace(placeholder, value);
                }

                // Handle common template functions
                rendered = await ProcessTemplateFunctionsAsync(rendered);

                return rendered;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to render template");
                return template;
            }
        }

        public async Task<bool> ValidateTemplateAsync(string template)
        {
            try
            {
                // Check for balanced braces
                var openBraces = template.Count(c => c == '{');
                var closeBraces = template.Count(c => c == '}');

                if (openBraces != closeBraces)
                    return false;

                // Check for valid placeholder syntax
                var placeholderPattern = @"\{\{[a-zA-Z_][a-zA-Z0-9_]*\}\}";
                var matches = Regex.Matches(template, placeholderPattern);

                // Additional validation logic can be added here

                return await Task.FromResult(true);
            }
            catch
            {
                return false;
            }
        }

        private async Task<string> ProcessTemplateFunctionsAsync(string template)
        {
            // Process date functions
            template = Regex.Replace(template, @"\{\{now\}\}", DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss"));
            template = Regex.Replace(template, @"\{\{today\}\}", DateTime.UtcNow.ToString("yyyy-MM-dd"));
            template = Regex.Replace(template, @"\{\{time\}\}", DateTime.UtcNow.ToString("HH:mm:ss"));

            return await Task.FromResult(template);
        }
    }

    public class CreateTemplateRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string Subject { get; set; } = string.Empty;
        public string Body { get; set; } = string.Empty;
        public string? Language { get; set; }
    }

    public class UpdateTemplateRequest
    {
        public string? Subject { get; set; }
        public string? Body { get; set; }
        public string? Language { get; set; }
        public bool? IsActive { get; set; }
    }
}

