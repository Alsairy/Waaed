using Waaed.SIS.Api.Extensions;
using Serilog;
using Microsoft.EntityFrameworkCore;
using Waaed.SIS.Api.Data;

var builder = WebApplication.CreateBuilder(args);

Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Debug()
    .WriteTo.Console()
    .WriteTo.File("logs/sis-service-.txt", rollingInterval: RollingInterval.Day)
    .CreateLogger();

builder.Host.UseSerilog();

try
{
    Log.Information("Configuring SIS API services...");
    
    builder.Services.AddControllers();
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen();
    builder.Services.AddSignalR();

    Log.Information("Adding SIS services...");
    builder.Services.AddSISServices(builder.Configuration);

    builder.Services.AddCors(options =>
    {
        options.AddPolicy("AllowAll", policy =>
        {
            policy.AllowAnyOrigin()
                  .AllowAnyMethod()
                  .AllowAnyHeader();
        });
    });

    Log.Information("Building application...");
    var app = builder.Build();

    Log.Information("Ensuring database is created...");
    using (var scope = app.Services.CreateScope())
    {
        var context = scope.ServiceProvider.GetRequiredService<SISDbContext>();
        context.Database.EnsureCreated();
        Log.Information("Database ensured created successfully");
    }

    if (app.Environment.IsDevelopment())
    {
        app.UseSwagger();
        app.UseSwaggerUI();
        Log.Information("Swagger UI enabled for development");
    }

    app.UseCors("AllowAll");
    app.UseAuthentication();
    app.UseAuthorization();
    app.MapControllers();

    Log.Information("Starting SIS API on {Urls}", builder.Configuration["Urls"] ?? "default ports");
    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "SIS API failed to start: {Message}", ex.Message);
    throw;
}
finally
{
    Log.CloseAndFlush();
}
