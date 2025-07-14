# Environment Setup Guide

## Production Environment Variables

### Required Environment Variables

#### Authentication Service
```bash
# JWT Configuration
JWT_SECRET_KEY="your-super-secure-jwt-secret-key-at-least-32-characters-long"
ENCRYPTION_KEY="your-encryption-key-for-sensitive-data-32-chars"

# Database Configuration
CONNECTION_STRING="Server=your-db-server;Database=Waaed;User Id=your-user;Password=your-password;TrustServerCertificate=true;"
REDIS_CONNECTION="your-redis-server:6379"
```

#### All Backend Services
The following services require JWT_SECRET_KEY configuration:
- Authentication API
- HR API
- Finance API
- Transport API
- Polls API
- Library API
- Tasks API
- LMS API
- CustomReports API
- Alumni API
- Hostel API
- Discipline API
- Blogs API

### Environment Variable Placeholders
All backend services have been configured with placeholder `#{JWT_SECRET_KEY}#` that should be replaced during deployment.

### Security Requirements
- JWT_SECRET_KEY: Minimum 32 characters, cryptographically secure
- ENCRYPTION_KEY: 32 characters, used for sensitive data encryption
- Never commit these values to source control
- Use secure secret management in production (Azure Key Vault, AWS Secrets Manager, etc.)

### Deployment Configuration
1. Replace placeholders in appsettings.json during CI/CD pipeline
2. Use environment-specific configuration files
3. Implement proper secret rotation policies

## Mobile App Environment Configuration

### Environment Configuration File
The mobile app uses environment-based configuration through `/src/mobile/AttendanceMobile/src/config/environment.ts`:

```typescript
// Environment detection based on NODE_ENV
const isDevelopment = process.env.NODE_ENV === 'development' || 
                     process.env.NODE_ENV === undefined ||
                     process.env.NODE_ENV === 'test';
```

### Environment URLs
- **Development**: `http://localhost:5000/api` (local backend services)
- **Staging**: `https://staging.waaed.platform.com/api` (AWS EKS deployment)
- **Production**: `https://app.waaed.platform.com/api` (production deployment)

### Mobile App Service Configuration
All mobile services automatically use the correct environment URLs:
- AuthService: Authentication endpoints
- AttendanceService: Attendance tracking
- FaceRecognitionService: Biometric authentication
- OfflineService: Offline data synchronization

### React Native Best Practices
- Environment switching happens at runtime based on build configuration
- No hardcoded URLs in service files
- Proper TypeScript interfaces for type safety
- Centralized configuration management

## Local Staging Environment Setup

### Overview
The local staging environment provides a complete testing environment that simulates production without requiring cloud infrastructure. It uses Docker Compose with local domain mapping to provide a realistic staging experience.

### Infrastructure
- **Platform**: Docker Compose with local domain mapping
- **Staging URL**: `http://staging-api.waaed.sa` (mapped to localhost)
- **Frontend URL**: `http://localhost:3100`
- **Database**: Local SQL Server container
- **Cache**: Local Redis container

### Prerequisites
- Docker and Docker Compose installed
- sudo access for /etc/hosts modification
- .NET SDK (for local development)
- Node.js and npm/yarn (for frontend development)

### Quick Start
```bash
# 1. Start the staging environment (requires sudo for /etc/hosts)
sudo ./scripts/start-staging.sh

# 2. Verify services are running
docker-compose -f docker-compose.staging.yml ps

# 3. Test health endpoint
curl -X GET http://staging-api.waaed.sa/health -w "\nHTTP Status: %{http_code}\n" -s
```

### Manual Setup Steps

#### 1. Domain Mapping Setup
```bash
# Add staging domain to /etc/hosts (requires sudo)
echo "127.0.0.1 staging-api.waaed.sa" | sudo tee -a /etc/hosts

# Verify domain resolution
ping -c 1 staging-api.waaed.sa
```

#### 2. Environment Configuration
Create `.env.staging` file with the following configuration:
```bash
# Copy the template and customize
cp .env.staging.template .env.staging

# Required environment variables:
JWT_SECRET_KEY="your-generated-32-character-secure-key"
ENCRYPTION_KEY="your-generated-32-character-encryption-key"
DB_PASSWORD="your-secure-database-password"
```

#### 3. Generate Secure Keys
```bash
# Generate JWT secret key (32+ characters)
openssl rand -base64 32

# Generate encryption key (32 characters hex)
openssl rand -hex 16

# Update .env.staging with generated keys
```

#### 4. Start Staging Services
```bash
# Start all staging services
docker-compose -f docker-compose.staging.yml up -d

# Monitor startup logs
docker-compose -f docker-compose.staging.yml logs -f

# Check service health
docker-compose -f docker-compose.staging.yml ps
```

### Service Configuration

#### Backend Services
All backend services are configured to:
- Use staging environment variables from `.env.staging`
- Connect to local SQL Server and Redis containers
- Run on different ports than development (5100+ range)
- Accept connections from staging domain

#### Frontend Configuration
The frontend is configured to:
- Connect to `http://staging-api.waaed.sa` for API calls
- Run on port 3100 to avoid conflicts with development
- Use staging-specific environment variables

#### Mobile App Configuration
Mobile app environment configuration in `/src/mobile/AttendanceMobile/src/config/environment.ts`:
```typescript
staging: {
  apiUrl: 'http://staging-api.waaed.sa',
  authUrl: 'http://staging-api.waaed.sa',
  faceRecognitionUrl: 'http://staging-api.waaed.sa',
  attendanceUrl: 'http://staging-api.waaed.sa'
}
```

### Verification Steps

#### 1. Health Check Endpoints
```bash
# Test staging health endpoint
curl -X GET http://staging-api.waaed.sa/health -w "\nHTTP Status: %{http_code}\n" -s

# Expected: HTTP 200 with health status response
```

#### 2. Authentication Endpoints
```bash
# Test authentication login endpoint
curl -X POST http://staging-api.waaed.sa/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "testpassword"}' \
  -w "\nHTTP Status: %{http_code}\n" -s

# Expected: HTTP 400/401 (endpoint accessible, credentials invalid)
```

#### 3. API Gateway Connectivity
```bash
# Test API gateway routing
curl -X GET http://staging-api.waaed.sa/api/health \
  -H "Accept: application/json" \
  -w "\nHTTP Status: %{http_code}\n" -s
```

#### 4. Frontend Integration
```bash
# Start frontend in staging mode
cd src/frontend/attendancepro-frontend
npm run dev

# Access frontend at http://localhost:3100
# Verify API calls go to staging-api.waaed.sa
```

#### 5. Mobile App Integration
```bash
# Set NODE_ENV to staging for mobile app
export NODE_ENV=staging

# Start mobile app development server
cd src/mobile/AttendanceMobile
npm start

# Verify mobile app connects to staging environment
```

### Troubleshooting Guide

#### Common Issues

**1. Domain Resolution Fails**
```bash
# Symptom: curl: (6) Could not resolve host: staging-api.waaed.sa
# Solution: Verify /etc/hosts entry
grep staging-api.waaed.sa /etc/hosts

# If missing, add the entry:
echo "127.0.0.1 staging-api.waaed.sa" | sudo tee -a /etc/hosts
```

**2. Services Fail to Start**
```bash
# Check service logs
docker-compose -f docker-compose.staging.yml logs [service-name]

# Common causes:
# - Missing .env.staging file
# - Invalid environment variables
# - Port conflicts with development environment
```

**3. Database Connection Issues**
```bash
# Verify SQL Server container is running
docker-compose -f docker-compose.staging.yml ps sqlserver

# Check database logs
docker-compose -f docker-compose.staging.yml logs sqlserver

# Reset database if needed
docker-compose -f docker-compose.staging.yml down -v
docker-compose -f docker-compose.staging.yml up -d
```

**4. Authentication Service Startup Fails**
```bash
# Common cause: Missing JWT_SECRET_KEY or ENCRYPTION_KEY
# Verify .env.staging contains:
grep -E "(JWT_SECRET_KEY|ENCRYPTION_KEY)" .env.staging

# Generate new keys if missing:
echo "JWT_SECRET_KEY=$(openssl rand -base64 32)" >> .env.staging
echo "ENCRYPTION_KEY=$(openssl rand -hex 16)" >> .env.staging
```

**5. CORS Issues**
```bash
# Symptom: Browser console shows CORS errors
# Solution: Verify SecurityHeadersMiddleware allows staging domain
# Check: src/backend/shared/Infrastructure/Waaed.Shared.Infrastructure/Middleware/SecurityHeadersMiddleware.cs
```

**6. Mobile App Connection Issues**
```bash
# Verify mobile app environment configuration
cat src/mobile/AttendanceMobile/src/config/environment.ts

# Ensure staging URLs point to staging-api.waaed.sa
# Restart mobile development server after changes
```

#### Performance Issues
```bash
# Monitor resource usage
docker stats

# Check service response times
time curl -X GET http://staging-api.waaed.sa/health

# Scale services if needed
docker-compose -f docker-compose.staging.yml up -d --scale api-gateway=2
```

#### Cleanup and Reset
```bash
# Stop all staging services
docker-compose -f docker-compose.staging.yml down

# Remove volumes (resets database)
docker-compose -f docker-compose.staging.yml down -v

# Remove staging domain from /etc/hosts
sudo sed -i '/staging-api.waaed.sa/d' /etc/hosts

# Clean up Docker resources
docker system prune -f
```

### Development Workflow

#### Testing Changes in Staging
1. Make code changes in development environment
2. Build and deploy to staging environment:
   ```bash
   # Rebuild specific service
   docker-compose -f docker-compose.staging.yml build [service-name]
   docker-compose -f docker-compose.staging.yml up -d [service-name]
   ```
3. Test changes using staging URLs
4. Verify integration with frontend and mobile app

#### Staging vs Development
- **Development**: Uses localhost:5000, immediate code changes
- **Staging**: Uses staging-api.waaed.sa, containerized environment
- **Production**: Uses production domain, cloud infrastructure

### Security Considerations
- Staging environment uses HTTP (not HTTPS) for local testing
- Generated keys are for local testing only
- Never use staging keys in production
- Staging database contains test data only
- Regular cleanup of staging environment recommended

## Environment Variable Configuration Process

### JWT_SECRET_KEY Configuration
1. **Generate Secure Key**:
   ```bash
   # Generate 32+ character cryptographically secure key
   openssl rand -base64 32
   ```

2. **Set in Environment**:
   ```bash
   export JWT_SECRET_KEY="your-generated-secure-key-here"
   ```

3. **Deployment Configuration**:
   - Replace `#{JWT_SECRET_KEY}#` placeholders during CI/CD
   - Use secure secret management (Azure Key Vault, AWS Secrets Manager)
   - Never commit actual values to source control

### ENCRYPTION_KEY Configuration
1. **Generate Encryption Key**:
   ```bash
   # Generate 32-character encryption key
   openssl rand -hex 16
   ```

2. **Environment Setup**:
   ```bash
   export ENCRYPTION_KEY="your-32-character-encryption-key"
   ```

### Mobile App Environment Variables
Mobile app environment configuration is handled through:
- Build-time environment detection
- Runtime configuration switching
- No environment variables needed for mobile deployment

### Verification Commands
```bash
# Verify environment variables are set
echo "JWT_SECRET_KEY length: ${#JWT_SECRET_KEY}"
echo "ENCRYPTION_KEY length: ${#ENCRYPTION_KEY}"

# Test backend service startup with environment variables
docker-compose up authentication-api
```

## Status
✅ All hardcoded JWT secrets replaced with environment variable placeholders (PR #12)
✅ Mobile app environment configuration implemented with proper URL management
✅ Staging environment URL updated from Fly.io to AWS EKS deployment
⚠️ Production deployment requires actual secret values configuration
⚠️ Staging environment authentication endpoints need verification testing
