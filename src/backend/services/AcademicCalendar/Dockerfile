FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy project files
COPY ["src/backend/services/AcademicCalendar/Waaed.AcademicCalendar.Api/Waaed.AcademicCalendar.Api.csproj", "src/backend/services/AcademicCalendar/Waaed.AcademicCalendar.Api/"]
COPY ["src/backend/shared/Domain/Waaed.Shared.Domain/Waaed.Shared.Domain.csproj", "src/backend/shared/Domain/Waaed.Shared.Domain/"]
COPY ["src/backend/shared/Infrastructure/Waaed.Shared.Infrastructure/Waaed.Shared.Infrastructure.csproj", "src/backend/shared/Infrastructure/Waaed.Shared.Infrastructure/"]

# Restore dependencies
RUN dotnet restore "src/backend/services/AcademicCalendar/Waaed.AcademicCalendar.Api/Waaed.AcademicCalendar.Api.csproj"

# Copy source code
COPY . .
WORKDIR "/src/src/backend/services/AcademicCalendar/Waaed.AcademicCalendar.Api"

# Build the application
RUN dotnet build "Waaed.AcademicCalendar.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "Waaed.AcademicCalendar.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Waaed.AcademicCalendar.Api.dll"]
