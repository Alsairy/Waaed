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

## Status
✅ All hardcoded JWT secrets replaced with environment variable placeholders (PR #12)
⚠️ Production deployment requires actual secret values configuration
