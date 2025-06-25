using Ocelot.DependencyInjection;
using Ocelot.Middleware;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add configuration
builder.Configuration.AddJsonFile("ocelot.json", optional: false, reloadOnChange: true);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.WithOrigins(
                "http://localhost:5173", 
                "http://localhost:5174",
                "http://localhost:3000",
                "https://project-review-app-7tx5ua47.devinapps.com",
                "https://attendancepro-auth-api.devinapps.com"
              )
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

// Add JWT Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"] ?? "Hudur_Super_Secret_Key_2024_Enterprise_Grade_Security";

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer("Bearer", options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings["Issuer"] ?? "Hudur",
            ValidAudience = jwtSettings["Audience"] ?? "Hudur.Users",
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
            ClockSkew = TimeSpan.Zero
        };

        options.Events = new JwtBearerEvents
        {
            OnAuthenticationFailed = context =>
            {
                Console.WriteLine($"Authentication failed: {context.Exception.Message}");
                return Task.CompletedTask;
            },
            OnTokenValidated = context =>
            {
                Console.WriteLine($"Token validated for user: {context.Principal?.Identity?.Name}");
                return Task.CompletedTask;
            }
        };
    });

// Add Authorization
builder.Services.AddAuthorization();

// Add Ocelot
builder.Services.AddOcelot();

// Add Health Checks
builder.Services.AddHealthChecks();

// Add Logging
builder.Services.AddLogging(logging =>
{
    logging.AddConsole();
    logging.AddDebug();
});

// Add HTTP Client Factory
builder.Services.AddHttpClient();

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Use CORS
app.UseCors("AllowAll");

// Use HTTPS Redirection
app.UseHttpsRedirection();

// Use Authentication
app.UseAuthentication();

// Use Authorization
app.UseAuthorization();

// Add custom middleware for request/response logging
app.Use(async (context, next) =>
{
    var logger = context.RequestServices.GetRequiredService<ILogger<Program>>();
    
    // Log incoming request
    logger.LogInformation($"Incoming request: {context.Request.Method} {context.Request.Path} from {context.Connection.RemoteIpAddress}");
    
    // Add correlation ID
    var correlationId = Guid.NewGuid().ToString();
    context.Response.Headers.Append("X-Correlation-ID", correlationId);
    
    var stopwatch = System.Diagnostics.Stopwatch.StartNew();
    
    await next();
    
    stopwatch.Stop();
    
    // Log response
    logger.LogInformation($"Response: {context.Response.StatusCode} in {stopwatch.ElapsedMilliseconds}ms [CorrelationId: {correlationId}]");
});

// Add health check endpoint
app.MapHealthChecks("/health");

// Add API Gateway info endpoint
app.MapGet("/api/gateway/info", () => new
{
    Service = "Hudur API Gateway",
    Version = "1.0.0",
    Environment = app.Environment.EnvironmentName,
    Timestamp = DateTime.UtcNow,
    Routes = new[]
    {
        "/api/auth/* -> Authentication Service",
        "/api/attendance/* -> Attendance Service",
        "/api/facerecognition/* -> Face Recognition Service",
        "/api/leave/* -> Leave Management Service",
        "/api/users/* -> User Management Service",
        "/api/tenants/* -> Tenant Management Service",
        "/api/notifications/* -> Notification Service",
        "/api/webhooks/* -> Webhook Service",
        "/api/integrations/* -> Integration Service"
    }
});

// Use Ocelot
await app.UseOcelot();

app.Run();

