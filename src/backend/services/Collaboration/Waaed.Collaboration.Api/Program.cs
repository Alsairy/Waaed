using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using AttendancePlatform.Shared.Infrastructure.Data;
using AttendancePlatform.Shared.Infrastructure.Extensions;
using AttendancePlatform.Shared.Domain.Entities;
using AttendancePlatform.Collaboration.Api.Services;
using AttendancePlatform.Collaboration.Api.Hubs;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Database
builder.Services.AddDbContext<AttendancePlatformDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// SignalR for real-time communication
builder.Services.AddSignalR();

// Collaboration Services
builder.Services.AddScoped<IChatService, ChatService>();
builder.Services.AddScoped<IVideoConferencingService, VideoConferencingService>();
builder.Services.AddScoped<ITeamCollaborationService, TeamCollaborationService>();
builder.Services.AddScoped<IDocumentCollaborationService, DocumentCollaborationService>();
builder.Services.AddScoped<IPresenceService, PresenceService>();
builder.Services.AddScoped<IScreenSharingService, ScreenSharingService>();

// JWT Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = Encoding.ASCII.GetBytes(jwtSettings["SecretKey"]);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(secretKey),
        ValidateIssuer = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidateAudience = true,
        ValidAudience = jwtSettings["Audience"],
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
    
    // Allow JWT in query string for SignalR
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"];
            var path = context.HttpContext.Request.Path;
            if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs"))
            {
                context.Token = accessToken;
            }
            return Task.CompletedTask;
        }
    };
});

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Health Checks
builder.Services.AddHealthChecks()
    .AddDbContextCheck<AttendancePlatformDbContext>();

// Shared Infrastructure
// Configure shared infrastructure services
builder.Services.AddDbContext<AttendancePlatformDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<IChatService, ChatService>();
builder.Services.AddScoped<IVideoConferencingService, VideoConferencingService>();
builder.Services.AddScoped<ITeamCollaborationService, TeamCollaborationService>();
builder.Services.AddScoped<IDocumentCollaborationService, DocumentCollaborationService>();
builder.Services.AddScoped<IPresenceService, PresenceService>();
builder.Services.AddScoped<IScreenSharingService, ScreenSharingService>();
builder.Services.AddSecurityServices(builder.Configuration);

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");

// app.UseMiddleware<RateLimitingMiddleware>();
// app.UseMiddleware<AuditLoggingMiddleware>();

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapHealthChecks("/health");

// SignalR Hubs
app.MapHub<ChatHub>("/hubs/chat");
app.MapHub<VideoConferencingHub>("/hubs/video");
app.MapHub<TeamCollaborationHub>("/hubs/team");
app.MapHub<DocumentCollaborationHub>("/hubs/document");
app.MapHub<PresenceHub>("/hubs/presence");
app.MapHub<ScreenSharingHub>("/hubs/screen");

app.Run("http://0.0.0.0:5010");

