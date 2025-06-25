using System.Net.Mail;
using System.Net;
using Microsoft.EntityFrameworkCore;
using AttendancePlatform.Shared.Infrastructure.Data;
using AttendancePlatform.Shared.Domain.Entities;

namespace AttendancePlatform.Notifications.Api.Services
{
    public interface IEmailService
    {
        Task<bool> SendEmailAsync(string to, string subject, string body, string? actionUrl = null);
        Task<bool> SendBulkEmailAsync(List<string> recipients, string subject, string body);
        Task<bool> SendTemplatedEmailAsync(string to, string templateName, object data);
    }

    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<EmailService> _logger;
        private readonly INotificationTemplateService _templateService;

        public EmailService(
            IConfiguration configuration,
            ILogger<EmailService> logger,
            INotificationTemplateService templateService)
        {
            _configuration = configuration;
            _logger = logger;
            _templateService = templateService;
        }

        public async Task<bool> SendEmailAsync(string to, string subject, string body, string? actionUrl = null)
        {
            try
            {
                var smtpSettings = _configuration.GetSection("EmailSettings");
                
                using var client = new SmtpClient(smtpSettings["SmtpServer"], int.Parse(smtpSettings["SmtpPort"] ?? "587"))
                {
                    Credentials = new NetworkCredential(smtpSettings["Username"], smtpSettings["Password"]),
                    EnableSsl = bool.Parse(smtpSettings["EnableSsl"] ?? "true")
                };

                var htmlBody = GenerateHtmlEmail(body, actionUrl);

                var message = new MailMessage
                {
                    From = new MailAddress(smtpSettings["FromEmail"] ?? "", smtpSettings["FromName"] ?? ""),
                    Subject = subject,
                    Body = htmlBody,
                    IsBodyHtml = true
                };

                message.To.Add(to);

                await client.SendMailAsync(message);

                _logger.LogInformation($"Email sent successfully to {to}");
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to send email to {to}");
                return false;
            }
        }

        public async Task<bool> SendBulkEmailAsync(List<string> recipients, string subject, string body)
        {
            var tasks = recipients.Select(recipient => SendEmailAsync(recipient, subject, body));
            var results = await Task.WhenAll(tasks);
            return results.All(r => r);
        }

        public async Task<bool> SendTemplatedEmailAsync(string to, string templateName, object data)
        {
            try
            {
                var template = await _templateService.GetTemplateAsync(templateName, "email");
                if (template == null)
                {
                    _logger.LogWarning($"Email template '{templateName}' not found");
                    return false;
                }

                var subject = await _templateService.RenderTemplateAsync(template.Subject, data);
                var body = await _templateService.RenderTemplateAsync(template.Body, data);

                return await SendEmailAsync(to, subject, body);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to send templated email to {to}");
                return false;
            }
        }

        private string GenerateHtmlEmail(string body, string? actionUrl = null)
        {
            var html = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Hudur Notification</title>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: #2563eb; color: white; padding: 20px; text-align: center; }}
        .content {{ padding: 20px; background: #f9f9f9; }}
        .footer {{ padding: 20px; text-align: center; color: #666; font-size: 12px; }}
        .button {{ display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 4px; margin: 10px 0; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>Hudur</h1>
        </div>
        <div class='content'>
            <p>{body}</p>
            {(actionUrl != null ? $"<a href='{actionUrl}' class='button'>Take Action</a>" : "")}
        </div>
        <div class='footer'>
            <p>This is an automated message from Hudur. Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>";

            return html;
        }
    }

    public interface ISmsService
    {
        Task<bool> SendSmsAsync(string phoneNumber, string message);
        Task<bool> SendBulkSmsAsync(List<string> phoneNumbers, string message);
    }

    public class SmsService : ISmsService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<SmsService> _logger;
        private readonly IHttpClientFactory _httpClientFactory;

        public SmsService(
            IConfiguration configuration,
            ILogger<SmsService> logger,
            IHttpClientFactory httpClientFactory)
        {
            _configuration = configuration;
            _logger = logger;
            _httpClientFactory = httpClientFactory;
        }

        public async Task<bool> SendSmsAsync(string phoneNumber, string message)
        {
            try
            {
                var smsSettings = _configuration.GetSection("SmsSettings");
                var provider = smsSettings["Provider"];

                return provider?.ToLower() switch
                {
                    "twilio" => await SendTwilioSmsAsync(phoneNumber, message),
                    "aws" => await SendAwsSmsAsync(phoneNumber, message),
                    _ => await SendGenericSmsAsync(phoneNumber, message)
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to send SMS to {phoneNumber}");
                return false;
            }
        }

        public async Task<bool> SendBulkSmsAsync(List<string> phoneNumbers, string message)
        {
            var tasks = phoneNumbers.Select(phone => SendSmsAsync(phone, message));
            var results = await Task.WhenAll(tasks);
            return results.All(r => r);
        }

        private async Task<bool> SendTwilioSmsAsync(string phoneNumber, string message)
        {
            // Twilio SMS implementation
            var smsSettings = _configuration.GetSection("SmsSettings");
            var accountSid = smsSettings["AccountSid"];
            var authToken = smsSettings["AuthToken"];
            var fromNumber = smsSettings["FromNumber"];

            using var client = _httpClientFactory.CreateClient();
            var credentials = Convert.ToBase64String(System.Text.Encoding.ASCII.GetBytes($"{accountSid}:{authToken}"));
            client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Basic", credentials);

            var content = new FormUrlEncodedContent(new[]
            {
                new KeyValuePair<string, string>("From", fromNumber ?? ""),
                new KeyValuePair<string, string>("To", phoneNumber),
                new KeyValuePair<string, string>("Body", message)
            });

            var response = await client.PostAsync($"https://api.twilio.com/2010-04-01/Accounts/{accountSid}/Messages.json", content);

            if (response.IsSuccessStatusCode)
            {
                _logger.LogInformation($"SMS sent successfully to {phoneNumber} via Twilio");
                return true;
            }

            _logger.LogWarning($"Failed to send SMS via Twilio: {response.StatusCode}");
            return false;
        }

        private async Task<bool> SendAwsSmsAsync(string phoneNumber, string message)
        {
            // AWS SNS SMS implementation placeholder
            _logger.LogInformation($"AWS SMS would be sent to {phoneNumber}: {message}");
            return await Task.FromResult(true);
        }

        private async Task<bool> SendGenericSmsAsync(string phoneNumber, string message)
        {
            // Generic SMS implementation placeholder
            _logger.LogInformation($"Generic SMS would be sent to {phoneNumber}: {message}");
            return await Task.FromResult(true);
        }
    }

    public interface IPushNotificationService
    {
        Task<bool> SendPushNotificationAsync(Guid userId, string title, string body, string? data = null, string? actionUrl = null);
        Task<bool> SendBulkPushNotificationAsync(List<Guid> userIds, string title, string body, string? data = null);
        Task<bool> RegisterDeviceTokenAsync(Guid userId, string deviceToken, string platform);
        Task<bool> UnregisterDeviceTokenAsync(Guid userId, string deviceToken);
    }

    public class PushNotificationService : IPushNotificationService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<PushNotificationService> _logger;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly AttendancePlatformDbContext _context;

        public PushNotificationService(
            IConfiguration configuration,
            ILogger<PushNotificationService> logger,
            IHttpClientFactory httpClientFactory,
            AttendancePlatformDbContext context)
        {
            _configuration = configuration;
            _logger = logger;
            _httpClientFactory = httpClientFactory;
            _context = context;
        }

        public async Task<bool> SendPushNotificationAsync(Guid userId, string title, string body, string? data = null, string? actionUrl = null)
        {
            try
            {
                var deviceTokens = await _context.DeviceTokens
                    .Where(dt => dt.UserId == userId && dt.IsActive)
                    .ToListAsync();

                if (!deviceTokens.Any())
                {
                    _logger.LogInformation($"No device tokens found for user {userId}");
                    return true;
                }

                var tasks = deviceTokens.Select(token => 
                    SendPushToDeviceAsync(token.Token, token.Platform, title, body, data, actionUrl));

                var results = await Task.WhenAll(tasks);
                return results.Any(r => r);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to send push notification to user {userId}");
                return false;
            }
        }

        public async Task<bool> SendBulkPushNotificationAsync(List<Guid> userIds, string title, string body, string? data = null)
        {
            var tasks = userIds.Select(userId => SendPushNotificationAsync(userId, title, body, data));
            var results = await Task.WhenAll(tasks);
            return results.Any(r => r);
        }

        public async Task<bool> RegisterDeviceTokenAsync(Guid userId, string deviceToken, string platform)
        {
            try
            {
                var existingToken = await _context.DeviceTokens
                    .FirstOrDefaultAsync(dt => dt.UserId == userId && dt.Token == deviceToken);

                if (existingToken == null)
                {
                    var newToken = new DeviceToken
                    {
                        Id = Guid.NewGuid(),
                        UserId = userId,
                        Token = deviceToken,
                        Platform = platform,
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    };

                    _context.DeviceTokens.Add(newToken);
                }
                else
                {
                    existingToken.IsActive = true;
                    existingToken.UpdatedAt = DateTime.UtcNow;
                }

                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to register device token for user {userId}");
                return false;
            }
        }

        public async Task<bool> UnregisterDeviceTokenAsync(Guid userId, string deviceToken)
        {
            try
            {
                var token = await _context.DeviceTokens
                    .FirstOrDefaultAsync(dt => dt.UserId == userId && dt.Token == deviceToken);

                if (token != null)
                {
                    token.IsActive = false;
                    token.UpdatedAt = DateTime.UtcNow;
                    await _context.SaveChangesAsync();
                }

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to unregister device token for user {userId}");
                return false;
            }
        }

        private async Task<bool> SendPushToDeviceAsync(string deviceToken, string platform, string title, string body, string? data, string? actionUrl)
        {
            return platform.ToLower() switch
            {
                "ios" => await SendApnsPushAsync(deviceToken, title, body, data, actionUrl),
                "android" => await SendFcmPushAsync(deviceToken, title, body, data, actionUrl),
                _ => false
            };
        }

        private async Task<bool> SendFcmPushAsync(string deviceToken, string title, string body, string? data, string? actionUrl)
        {
            try
            {
                var pushSettings = _configuration.GetSection("PushNotificationSettings:Firebase");
                var serverKey = pushSettings["ServerKey"];

                using var client = _httpClientFactory.CreateClient();
                client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("key", $"={serverKey}");

                var payload = new
                {
                    to = deviceToken,
                    notification = new
                    {
                        title,
                        body,
                        click_action = actionUrl
                    },
                    data = data != null ? System.Text.Json.JsonSerializer.Deserialize<object>(data) : null
                };

                var json = System.Text.Json.JsonSerializer.Serialize(payload);
                var content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");

                var response = await client.PostAsync("https://fcm.googleapis.com/fcm/send", content);

                if (response.IsSuccessStatusCode)
                {
                    _logger.LogInformation($"FCM push notification sent successfully to {deviceToken}");
                    return true;
                }

                _logger.LogWarning($"Failed to send FCM push notification: {response.StatusCode}");
                return false;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Exception sending FCM push notification to {deviceToken}");
                return false;
            }
        }

        private async Task<bool> SendApnsPushAsync(string deviceToken, string title, string body, string? data, string? actionUrl)
        {
            // APNS implementation placeholder
            _logger.LogInformation($"APNS push notification would be sent to {deviceToken}: {title} - {body}");
            return await Task.FromResult(true);
        }
    }


}

