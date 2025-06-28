# Base .NET 8 runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy project files
COPY ["src/backend/gateways/Waaed.ApiGateway/Waaed.ApiGateway.csproj", "src/backend/gateways/Waaed.ApiGateway/"]

# Restore dependencies
RUN dotnet restore "src/backend/gateways/Waaed.ApiGateway/Waaed.ApiGateway.csproj"

# Copy source code
COPY . .

# Build the application
WORKDIR "/src/src/backend/gateways/Waaed.ApiGateway"
RUN dotnet build "Waaed.ApiGateway.csproj" -c Release -o /app/build

# Publish stage
FROM build AS publish
RUN dotnet publish "Waaed.ApiGateway.csproj" -c Release -o /app/publish /p:UseAppHost=false

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

ENTRYPOINT ["dotnet", "Waaed.ApiGateway.dll"]

