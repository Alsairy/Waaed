using System.Net;
using System.Net.Mail;
using System.Text;

namespace AttendancePlatform.Authentication.Api.Services
{
    public interface IEmailService
    {
        Task<bool> SendPasswordResetEmailAsync(string email, string resetToken, string resetUrl);
        Task<bool> SendWelcomeEmailAsync(string email, string firstName, string temporaryPassword);
        Task<bool> SendTwoFactorSetupEmailAsync(string email, string firstName, string qrCodeUri);
        Task<bool> SendAccountLockedEmailAsync(string email, string firstName, DateTime lockedUntil);
    }

    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        public async Task<bool> SendPasswordResetEmailAsync(string email, string resetToken, string resetUrl)
        {
            try
            {
                var subject = "Password Reset Request - Hudur";
                var body = GeneratePasswordResetEmailBody(resetToken, resetUrl);
                
                return await SendEmailAsync(email, subject, body);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send password reset email to {Email}", email);
                return false;
            }
        }

        public async Task<bool> SendWelcomeEmailAsync(string email, string firstName, string temporaryPassword)
        {
            try
            {
                var subject = "Welcome to Hudur";
                var body = GenerateWelcomeEmailBody(firstName, email, temporaryPassword);
                
                return await SendEmailAsync(email, subject, body);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send welcome email to {Email}", email);
                return false;
            }
        }

        public async Task<bool> SendTwoFactorSetupEmailAsync(string email, string firstName, string qrCodeUri)
        {
            try
            {
                var subject = "Two-Factor Authentication Setup - Hudur";
                var body = GenerateTwoFactorSetupEmailBody(firstName, qrCodeUri);
                
                return await SendEmailAsync(email, subject, body);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send 2FA setup email to {Email}", email);
                return false;
            }
        }

        public async Task<bool> SendAccountLockedEmailAsync(string email, string firstName, DateTime lockedUntil)
        {
            try
            {
                var subject = "Account Temporarily Locked - Hudur";
                var body = GenerateAccountLockedEmailBody(firstName, lockedUntil);
                
                return await SendEmailAsync(email, subject, body);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send account locked email to {Email}", email);
                return false;
            }
        }

        private async Task<bool> SendEmailAsync(string toEmail, string subject, string body)
        {
            try
            {
                var smtpHost = _configuration["SMTP_HOST"] ?? "localhost";
                var smtpPort = int.Parse(_configuration["SMTP_PORT"] ?? "587");
                var smtpUser = _configuration["SMTP_USER"] ?? "";
                var smtpPassword = _configuration["SMTP_PASSWORD"] ?? "";
                var fromName = _configuration["SMTP_FROM_NAME"] ?? "Hudur System";

                using var client = new SmtpClient(smtpHost, smtpPort);
                client.EnableSsl = true;
                client.Credentials = new NetworkCredential(smtpUser, smtpPassword);

                using var message = new MailMessage();
                message.From = new MailAddress(smtpUser, fromName);
                message.To.Add(toEmail);
                message.Subject = subject;
                message.Body = body;
                message.IsBodyHtml = true;
                message.BodyEncoding = Encoding.UTF8;

                await client.SendMailAsync(message);
                
                _logger.LogInformation("Email sent successfully to {Email} with subject: {Subject}", toEmail, subject);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send email to {Email}", toEmail);
                return false;
            }
        }

        private string GeneratePasswordResetEmailBody(string resetToken, string resetUrl)
        {
            return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <title>Password Reset</title>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background-color: #007bff; color: white; padding: 20px; text-align: center; }}
        .content {{ padding: 20px; background-color: #f9f9f9; }}
        .button {{ display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px; margin: 10px 0; }}
        .footer {{ padding: 20px; text-align: center; font-size: 12px; color: #666; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>Password Reset Request</h1>
        </div>
        <div class='content'>
            <p>You have requested to reset your password for your Hudur account.</p>
            <p>Click the button below to reset your password:</p>
            <a href='{resetUrl}?token={resetToken}' class='button'>Reset Password</a>
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p><a href='{resetUrl}?token={resetToken}'>{resetUrl}?token={resetToken}</a></p>
            <p><strong>This link will expire in 1 hour for security reasons.</strong></p>
            <p>If you didn't request this password reset, please ignore this email or contact support if you have concerns.</p>
        </div>
        <div class='footer'>
            <p>This is an automated message from Hudur. Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>";
        }

        private string GenerateWelcomeEmailBody(string firstName, string email, string temporaryPassword)
        {
            return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <title>Welcome to Hudur</title>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background-color: #28a745; color: white; padding: 20px; text-align: center; }}
        .content {{ padding: 20px; background-color: #f9f9f9; }}
        .credentials {{ background-color: #e9ecef; padding: 15px; border-radius: 4px; margin: 15px 0; }}
        .footer {{ padding: 20px; text-align: center; font-size: 12px; color: #666; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>Welcome to Hudur!</h1>
        </div>
        <div class='content'>
            <p>Hello {firstName},</p>
            <p>Welcome to Hudur! Your account has been created successfully.</p>
            <div class='credentials'>
                <h3>Your Login Credentials:</h3>
                <p><strong>Email:</strong> {email}</p>
                <p><strong>Temporary Password:</strong> {temporaryPassword}</p>
            </div>
            <p><strong>Important:</strong> Please log in and change your password immediately for security reasons.</p>
            <p>You can access the system at: <a href='https://app.hudur.sa'>https://app.hudur.sa</a></p>
            <p>If you have any questions or need assistance, please contact our support team.</p>
        </div>
        <div class='footer'>
            <p>This is an automated message from Hudur. Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>";
        }

        private string GenerateTwoFactorSetupEmailBody(string firstName, string qrCodeUri)
        {
            return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <title>Two-Factor Authentication Setup</title>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background-color: #ffc107; color: #212529; padding: 20px; text-align: center; }}
        .content {{ padding: 20px; background-color: #f9f9f9; }}
        .qr-code {{ text-align: center; margin: 20px 0; }}
        .footer {{ padding: 20px; text-align: center; font-size: 12px; color: #666; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>Two-Factor Authentication Setup</h1>
        </div>
        <div class='content'>
            <p>Hello {firstName},</p>
            <p>Two-factor authentication has been enabled for your Hudur account for enhanced security.</p>
            <p>To complete the setup:</p>
            <ol>
                <li>Install an authenticator app (Google Authenticator, Authy, etc.)</li>
                <li>Scan the QR code below or manually enter the setup key</li>
                <li>Enter the 6-digit code from your authenticator app to verify</li>
            </ol>
            <div class='qr-code'>
                <p>Setup URI: <code>{qrCodeUri}</code></p>
                <p><em>Use this URI to generate a QR code or manually add to your authenticator app</em></p>
            </div>
            <p>If you didn't request this setup, please contact support immediately.</p>
        </div>
        <div class='footer'>
            <p>This is an automated message from Hudur. Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>";
        }

        private string GenerateAccountLockedEmailBody(string firstName, DateTime lockedUntil)
        {
            return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <title>Account Temporarily Locked</title>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background-color: #dc3545; color: white; padding: 20px; text-align: center; }}
        .content {{ padding: 20px; background-color: #f9f9f9; }}
        .warning {{ background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 4px; margin: 15px 0; }}
        .footer {{ padding: 20px; text-align: center; font-size: 12px; color: #666; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>Account Temporarily Locked</h1>
        </div>
        <div class='content'>
            <p>Hello {firstName},</p>
            <div class='warning'>
                <p><strong>Your Hudur account has been temporarily locked due to multiple failed login attempts.</strong></p>
            </div>
            <p>Your account will be automatically unlocked at: <strong>{lockedUntil:yyyy-MM-dd HH:mm:ss} UTC</strong></p>
            <p>If you believe this was not you, please:</p>
            <ul>
                <li>Change your password immediately after the lockout period</li>
                <li>Enable two-factor authentication for additional security</li>
                <li>Contact support if you suspect unauthorized access</li>
            </ul>
            <p>For immediate assistance, please contact our support team.</p>
        </div>
        <div class='footer'>
            <p>This is an automated message from Hudur. Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>";
        }
    }
}
