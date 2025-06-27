# Base .NET 8 runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy project files
COPY ["src/backend/services/Collaboration/Waaed.Collaboration.Api/Waaed.Collaboration.Api.csproj", "src/backend/services/Collaboration/Waaed.Collaboration.Api/"]
COPY ["src/backend/shared/Domain/Waaed.Shared.Domain/Waaed.Shared.Domain.csproj", "src/backend/shared/Domain/Waaed.Shared.Domain/"]
COPY ["src/backend/shared/Infrastructure/Waaed.Shared.Infrastructure/Waaed.Shared.Infrastructure.csproj", "src/backend/shared/Infrastructure/Waaed.Shared.Infrastructure/"]

# Restore dependencies
RUN dotnet restore "src/backend/services/Collaboration/Waaed.Collaboration.Api/Waaed.Collaboration.Api.csproj"

# Copy source code
COPY . .

# Build the application
WORKDIR "src/backend/services/Collaboration/Waaed.Collaboration.Api"
RUN dotnet build "Waaed.Collaboration.Api.csproj" -c Release -o /app/build

# Publish stage
FROM build AS publish
RUN dotnet publish "Waaed.Collaboration.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Final stage
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Create non-root user for security
RUN adduser --disabled-password --gecos '' appuser && chown -R appuser /app
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:80/health || exit 1

ENTRYPOINT ["dotnet", "Waaed.Collaboration.Api.dll"]
