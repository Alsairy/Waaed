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

## Staging Environment Deployment Verification

### Infrastructure
- **Platform**: Kubernetes/Helm on AWS EKS
- **Staging URL**: `https://staging.waaed.platform.com`
- **Previous URL**: `https://app-hgzbalgb.fly.dev` (deprecated)

### Verification Steps

#### 1. Health Check Endpoints
```bash
# Test staging health endpoint
curl -X GET https://staging.waaed.platform.com/health -w "\nHTTP Status: %{http_code}\n" -s

# Expected: HTTP 200 with health status response
```

#### 2. Authentication Endpoints
```bash
# Test authentication login endpoint
curl -X POST https://staging.waaed.platform.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "testpassword"}' \
  -w "\nHTTP Status: %{http_code}\n" -s

# Expected: HTTP 400/401 (endpoint accessible, credentials invalid)
```

#### 3. API Gateway Connectivity
```bash
# Test API gateway routing
curl -X GET https://staging.waaed.platform.com/api/health \
  -H "Accept: application/json" \
  -w "\nHTTP Status: %{http_code}\n" -s
```

#### 4. Mobile App Integration
- Verify mobile app connects to staging environment
- Test authentication flow from mobile app
- Validate offline synchronization with staging backend

### Common Issues
- **URL Mismatch**: Ensure all services use `https://staging.waaed.platform.com`
- **CORS Configuration**: Verify staging allows mobile app origins
- **SSL Certificates**: Confirm valid certificates for staging domain
- **Network Policies**: Check Kubernetes network policies allow traffic

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
