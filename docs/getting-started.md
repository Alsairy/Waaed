# 🚀 Getting Started with Hudur

Welcome to Hudur! This guide will help you get the platform up and running quickly.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Docker & Docker Compose** (recommended for quick start)
- **Git** for version control
- **.NET 8 SDK** (for backend development)
- **Node.js 18+** (for frontend development)
- **PostgreSQL 15+** (if running without Docker)
- **Redis 7+** (if running without Docker)

## 🎯 Quick Start Options

### Option 1: Docker Compose (Recommended)

The fastest way to get Hudur running:

```bash
# Clone the repository
git clone https://github.com/your-org/hudur.git
cd hudur

# Copy environment configuration
cp .env.example .env

# Start all services
docker-compose up -d

# Check service status
docker-compose ps
```

**Access the application:**
- Web App: http://localhost:3000
- API Gateway: http://localhost:5000
- API Documentation: http://localhost:5000/swagger

### Option 2: Development Setup

For active development:

```bash
# Clone and setup
git clone https://github.com/your-org/hudur.git
cd hudur

# Backend setup
cd src/backend
dotnet restore
dotnet ef database update
dotnet run --project services/Authentication/Hudur.Authentication.Api

# Frontend setup (new terminal)
cd src/frontend/attendance-web-app
npm install
npm start

# Mobile setup (new terminal)
cd src/mobile/AttendanceMobile
npm install
npx react-native run-ios  # or run-android
```

## 🔑 Default Credentials

```
Email: admin@hudur.sa
Password: Admin123!
```

## 🎯 First Steps

1. **Login** with default credentials
2. **Create your organization** profile
3. **Add users** and assign roles
4. **Configure attendance methods** (GPS, Face Recognition, etc.)
5. **Set up geofences** for office locations
6. **Test mobile app** attendance tracking

## 📱 Mobile App Setup

### iOS Development
```bash
cd src/mobile/AttendanceMobile
npx pod-install ios
npx react-native run-ios
```

### Android Development
```bash
cd src/mobile/AttendanceMobile
npx react-native run-android
```

## 🔧 Configuration

### Environment Variables

Key configuration options in `.env`:

```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/hudur

# JWT Authentication
JWT_SECRET=your-super-secret-key

# Face Recognition (optional)
FACE_API_ENDPOINT=https://your-face-api
FACE_API_KEY=your-api-key

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Feature Flags

Enable/disable features:

```bash
ENABLE_FACE_RECOGNITION=true
ENABLE_GPS_TRACKING=true
ENABLE_OFFLINE_MODE=true
ENABLE_ANALYTICS=true
```

## 🧪 Testing

Run the test suite:

```bash
# Backend tests
cd src/backend
dotnet test

# Frontend tests
cd src/frontend/attendance-web-app
npm test

# Mobile tests
cd src/mobile/AttendanceMobile
npm test
```

## 📊 Monitoring

Access monitoring dashboards:

- **Application Metrics**: http://localhost:3001 (Grafana)
- **System Health**: http://localhost:9090 (Prometheus)
- **API Health**: http://localhost:5000/health

## 🔍 Troubleshooting

### Common Issues

**Database Connection Issues:**
```bash
# Check PostgreSQL is running
docker-compose ps postgres

# View database logs
docker-compose logs postgres
```

**Port Conflicts:**
```bash
# Check what's using port 3000
lsof -i :3000

# Use different ports in docker-compose.yml
```

**Mobile App Issues:**
```bash
# Clear React Native cache
npx react-native start --reset-cache

# Clean build
cd ios && xcodebuild clean
cd android && ./gradlew clean
```

## 📚 Next Steps

- **[API Documentation](../docs/API_DOCUMENTATION.md)** - Explore the REST API
- **[User Manual](../docs/USER_MANUAL.md)** - Learn platform features
- **[Developer Guide](../docs/DEVELOPER_GUIDE.md)** - Development best practices
- **[Deployment Guide](../docs/DEPLOYMENT_GUIDE.md)** - Production deployment

## 🆘 Getting Help

- **Documentation**: Check the `/docs` folder
- **Issues**: [GitHub Issues](https://github.com/your-org/hudur/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/hudur/discussions)
- **Email**: support@hudur.sa

---

**Ready to build something amazing? Let's get started! 🚀**

