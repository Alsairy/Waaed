# Hudur Platform - Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying the Hudur platform in various environments, from development to production. The platform supports multiple deployment methods including Docker Compose, Kubernetes, and Helm.

## Prerequisites

### System Requirements

#### Minimum Requirements
- **CPU**: 4 cores
- **RAM**: 8 GB
- **Storage**: 50 GB SSD
- **Network**: 100 Mbps

#### Recommended Requirements (Production)
- **CPU**: 8+ cores
- **RAM**: 16+ GB
- **Storage**: 200+ GB SSD
- **Network**: 1 Gbps
- **Load Balancer**: Nginx or similar

### Software Dependencies

#### Required Software
- **Docker**: 20.10+
- **Docker Compose**: 2.0+
- **Node.js**: 20.x (for frontend builds)
- **.NET SDK**: 8.0+ (for backend builds)

#### Optional Software (Production)
- **Kubernetes**: 1.25+
- **Helm**: 3.8+
- **kubectl**: Latest version

## Environment Setup

### 1. Clone the Repository

```bash
git clone https://github.com/hudur/platform.git
cd attendance-platform
```

### 2. Environment Configuration

Create environment-specific configuration files:

#### Development Environment (.env.development)
```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=1433
DB_NAME=Hudur
DB_USER=sa
DB_PASSWORD=YourStrong@Passw0rd

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT Configuration
JWT_SECRET=YourSuperSecretKeyThatIsAtLeast32CharactersLong!
JWT_ISSUER=Hudur
JWT_AUDIENCE=HudurUsers
JWT_EXPIRY_MINUTES=60

# Email Configuration
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=noreply@hudur.sa

# SMS Configuration (Twilio)
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Push Notifications (Firebase)
FIREBASE_SERVER_KEY=your-firebase-server-key
FIREBASE_PROJECT_ID=your-project-id

# Face Recognition
FACE_RECOGNITION_THRESHOLD=0.8
FACE_RECOGNITION_MODEL=dlib

# Logging
LOG_LEVEL=Information
LOG_FILE_PATH=/var/log/hudur/

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

#### Production Environment (.env.production)
```bash
# Database Configuration
DB_HOST=sql-server-service
DB_PORT=1433
DB_NAME=Hudur
DB_USER=sa
DB_PASSWORD=${DB_PASSWORD}

# Redis Configuration
REDIS_HOST=redis-service
REDIS_PORT=6379

# JWT Configuration
JWT_SECRET=${JWT_SECRET}
JWT_ISSUER=Hudur
JWT_AUDIENCE=HudurUsers
JWT_EXPIRY_MINUTES=60

# Email Configuration
SMTP_SERVER=${SMTP_SERVER}
SMTP_PORT=587
SMTP_USERNAME=${SMTP_USERNAME}
SMTP_PASSWORD=${SMTP_PASSWORD}
SMTP_FROM_EMAIL=noreply@hudur.sa

# SMS Configuration
TWILIO_ACCOUNT_SID=${TWILIO_ACCOUNT_SID}
TWILIO_AUTH_TOKEN=${TWILIO_AUTH_TOKEN}
TWILIO_PHONE_NUMBER=${TWILIO_PHONE_NUMBER}

# Push Notifications
FIREBASE_SERVER_KEY=${FIREBASE_SERVER_KEY}
FIREBASE_PROJECT_ID=${FIREBASE_PROJECT_ID}

# Security
ENABLE_HTTPS=true
SSL_CERTIFICATE_PATH=/etc/ssl/certs/hudur.crt
SSL_PRIVATE_KEY_PATH=/etc/ssl/private/hudur.key

# Monitoring
PROMETHEUS_ENABLED=true
GRAFANA_ENABLED=true
LOG_LEVEL=Warning
```

## Deployment Methods

### Method 1: Docker Compose (Recommended for Development/Testing)

#### Quick Start

1. **Build and Start Services**
```bash
# Make the build script executable
chmod +x scripts/build-and-deploy.sh

# Run the automated build and deploy script
./scripts/build-and-deploy.sh
```

2. **Manual Docker Compose Deployment**
```bash
# Build all Docker images
docker-compose -f docker-compose.production.yml build

# Start all services
docker-compose -f docker-compose.production.yml up -d

# Check service status
docker-compose -f docker-compose.production.yml ps

# View logs
docker-compose -f docker-compose.production.yml logs -f
```

#### Service URLs (Docker Compose)
- **Frontend**: http://localhost:3000
- **API Gateway**: http://localhost:5000
- **Grafana**: http://localhost:3001 (admin/admin123)
- **Prometheus**: http://localhost:9090

### Method 2: Kubernetes Deployment

#### Prerequisites
- Kubernetes cluster (1.25+)
- kubectl configured
- Sufficient cluster resources

#### Deployment Steps

1. **Create Namespace and Apply Base Configuration**
```bash
kubectl apply -f k8s/base/namespace-and-config.yaml
```

2. **Deploy Database Services**
```bash
kubectl apply -f k8s/base/database.yaml

# Wait for databases to be ready
kubectl wait --for=condition=ready pod -l app=sql-server -n hudur --timeout=300s
kubectl wait --for=condition=ready pod -l app=redis -n hudur --timeout=300s
```

3. **Deploy Backend Services**
```bash
kubectl apply -f k8s/base/backend-services.yaml

# Wait for services to be ready
kubectl wait --for=condition=ready pod -l tier=backend -n hudur --timeout=300s
```

4. **Deploy Additional Services and Frontend**
```bash
kubectl apply -f k8s/base/additional-services.yaml

# Wait for frontend to be ready
kubectl wait --for=condition=ready pod -l tier=frontend -n hudur --timeout=300s
```

5. **Apply Auto-scaling and Policies**
```bash
kubectl apply -f k8s/base/autoscaling-and-policies.yaml
```

6. **Deploy Monitoring (Optional)**
```bash
kubectl apply -f k8s/monitoring/
```

#### Verify Deployment
```bash
# Check all pods
kubectl get pods -n hudur

# Check services
kubectl get services -n hudur

# Check ingress (if configured)
kubectl get ingress -n hudur

# View logs
kubectl logs -f deployment/api-gateway -n hudur
```

### Method 3: Helm Deployment (Recommended for Production)

#### Prerequisites
- Helm 3.8+
- Kubernetes cluster
- kubectl configured

#### Deployment Steps

1. **Add Required Helm Repositories**
```bash
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update
```

2. **Install Hudur Platform**
```bash
# Install with default values
helm install hudur ./helm/hudur \
  --namespace hudur \
  --create-namespace

# Install with custom values
helm install hudur ./helm/hudur \
  --namespace hudur \
  --create-namespace \
  --values ./helm/hudur/values-production.yaml
```

3. **Verify Installation**
```bash
# Check Helm release status
helm status hudur -n hudur

# List all releases
helm list -n hudur

# Check pods
kubectl get pods -n hudur
```

#### Helm Configuration Options

Create a custom values file for production:

```yaml
# values-production.yaml
global:
  imageRegistry: "your-registry.com"
  imagePullSecrets:
    - name: registry-secret

# Enable production features
postgresql:
  enabled: true
  auth:
    postgresPassword: "your-secure-password"
  primary:
    persistence:
      size: 100Gi

redis:
  enabled: true
  auth:
    enabled: true
    password: "your-redis-password"

# Configure ingress
ingress:
  enabled: true
  className: "nginx"
  hosts:
    - host: api.yourdomain.com
      paths:
        - path: /
          pathType: Prefix
          service: api-gateway
    - host: app.yourdomain.com
      paths:
        - path: /
          pathType: Prefix
          service: frontend
  tls:
    - secretName: hudur-tls
      hosts:
        - api.yourdomain.com
        - app.yourdomain.com

# Enable monitoring
monitoring:
  enabled: true
  prometheus:
    retention: "30d"
    storage: "100Gi"
  grafana:
    adminPassword: "your-grafana-password"
```

## Database Setup

### SQL Server Configuration

#### Initial Database Setup
```sql
-- Create database
CREATE DATABASE Hudur;
GO

-- Create login and user
CREATE LOGIN hudur_user WITH PASSWORD = 'YourSecurePassword123!';
GO

USE Hudur;
GO

CREATE USER hudur_user FOR LOGIN hudur_user;
GO

-- Grant permissions
ALTER ROLE db_owner ADD MEMBER hudur_user;
GO
```

#### Database Migration
```bash
# Run Entity Framework migrations
dotnet ef database update --project src/backend/shared/Infrastructure/Hudur.Shared.Infrastructure

# Or use the migration script
./scripts/migrate-database.sh
```

### Redis Configuration

#### Redis Security Configuration
```bash
# Connect to Redis container
docker exec -it redis-container redis-cli

# Set password (if not set via environment)
CONFIG SET requirepass "your-redis-password"

# Save configuration
CONFIG REWRITE
```

## SSL/TLS Configuration

### Certificate Generation

#### Using Let's Encrypt (Production)
```bash
# Install certbot
sudo apt-get install certbot

# Generate certificates
sudo certbot certonly --standalone -d api.yourdomain.com -d app.yourdomain.com

# Create Kubernetes secret
kubectl create secret tls hudur-tls \
  --cert=/etc/letsencrypt/live/yourdomain.com/fullchain.pem \
  --key=/etc/letsencrypt/live/yourdomain.com/privkey.pem \
  -n hudur
```

#### Using Self-Signed Certificates (Development)
```bash
# Generate self-signed certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout hudur.key \
  -out hudur.crt \
  -subj "/CN=localhost"

# Create Kubernetes secret
kubectl create secret tls hudur-tls \
  --cert=hudur.crt \
  --key=hudur.key \
  -n hudur
```

## Monitoring and Logging

### Prometheus Configuration

#### Custom Metrics Configuration
```yaml
# prometheus-config.yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'hudur-services'
    kubernetes_sd_configs:
    - role: endpoints
      namespaces:
        names:
        - hudur
    relabel_configs:
    - source_labels: [__meta_kubernetes_service_annotation_prometheus_io_scrape]
      action: keep
      regex: true
```

### Grafana Dashboard Setup

#### Import Pre-built Dashboards
```bash
# Access Grafana
kubectl port-forward service/grafana-service 3000:3000 -n monitoring

# Login with admin/admin123
# Import dashboard from: ./monitoring/grafana-dashboards/
```

### Centralized Logging

#### ELK Stack Integration (Optional)
```yaml
# elasticsearch.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: elasticsearch
spec:
  replicas: 1
  selector:
    matchLabels:
      app: elasticsearch
  template:
    metadata:
      labels:
        app: elasticsearch
    spec:
      containers:
      - name: elasticsearch
        image: docker.elastic.co/elasticsearch/elasticsearch:8.8.0
        env:
        - name: discovery.type
          value: single-node
        - name: ES_JAVA_OPTS
          value: "-Xms512m -Xmx512m"
```

## Backup and Disaster Recovery

### Database Backup

#### Automated Backup Script
```bash
#!/bin/bash
# backup-database.sh

BACKUP_DIR="/backups/database"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="hudur_backup_${DATE}.bak"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup SQL Server database
kubectl exec -it deployment/sql-server -n hudur -- \
  /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P $DB_PASSWORD \
  -Q "BACKUP DATABASE Hudur TO DISK = '/var/opt/mssql/backup/${BACKUP_FILE}'"

# Copy backup file from container
kubectl cp hudur/sql-server-pod:/var/opt/mssql/backup/${BACKUP_FILE} \
  ${BACKUP_DIR}/${BACKUP_FILE}

echo "Database backup completed: ${BACKUP_DIR}/${BACKUP_FILE}"
```

#### Backup Restoration
```bash
#!/bin/bash
# restore-database.sh

BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
  echo "Usage: $0 <backup-file>"
  exit 1
fi

# Copy backup file to container
kubectl cp $BACKUP_FILE hudur/sql-server-pod:/var/opt/mssql/backup/

# Restore database
kubectl exec -it deployment/sql-server -n hudur -- \
  /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P $DB_PASSWORD \
  -Q "RESTORE DATABASE Hudur FROM DISK = '/var/opt/mssql/backup/$(basename $BACKUP_FILE)'"
```

### Application Data Backup

#### Redis Backup
```bash
# Create Redis backup
kubectl exec -it deployment/redis -n hudur -- redis-cli BGSAVE

# Copy RDB file
kubectl cp hudur/redis-pod:/data/dump.rdb ./backups/redis/dump_$(date +%Y%m%d).rdb
```

## Performance Optimization

### Resource Allocation

#### Production Resource Recommendations
```yaml
# Resource limits for production
resources:
  api-gateway:
    requests:
      memory: "512Mi"
      cpu: "250m"
    limits:
      memory: "1Gi"
      cpu: "500m"
  
  attendance-service:
    requests:
      memory: "512Mi"
      cpu: "250m"
    limits:
      memory: "1Gi"
      cpu: "500m"
  
  face-recognition-service:
    requests:
      memory: "1Gi"
      cpu: "500m"
    limits:
      memory: "2Gi"
      cpu: "1000m"
```

### Database Optimization

#### SQL Server Performance Tuning
```sql
-- Enable query store
ALTER DATABASE Hudur SET QUERY_STORE = ON;

-- Configure memory settings
EXEC sp_configure 'max server memory (MB)', 4096;
RECONFIGURE;

-- Create indexes for performance
CREATE INDEX IX_AttendanceRecords_UserId_CheckInTime 
ON AttendanceRecords (UserId, CheckInTime);

CREATE INDEX IX_Users_Email 
ON Users (Email);
```

## Security Hardening

### Container Security

#### Security Best Practices
```dockerfile
# Use non-root user
RUN adduser --disabled-password --gecos '' appuser
USER appuser

# Remove unnecessary packages
RUN apt-get remove --purge -y wget curl && \
    apt-get autoremove -y && \
    apt-get clean

# Set read-only filesystem
VOLUME ["/tmp"]
```

### Network Security

#### Network Policies
```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: hudur-network-policy
  namespace: hudur
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: hudur
  egress:
  - to:
    - namespaceSelector:
        matchLabels:
          name: hudur
```

## Troubleshooting

### Common Issues

#### 1. Database Connection Issues
```bash
# Check database connectivity
kubectl exec -it deployment/api-gateway -n hudur -- \
  curl -f http://sql-server-service:1433

# Check database logs
kubectl logs deployment/sql-server -n hudur
```

#### 2. Service Discovery Issues
```bash
# Check service endpoints
kubectl get endpoints -n hudur

# Check DNS resolution
kubectl exec -it deployment/api-gateway -n hudur -- \
  nslookup authentication-service
```

#### 3. Memory Issues
```bash
# Check resource usage
kubectl top pods -n hudur

# Check resource limits
kubectl describe pod <pod-name> -n hudur
```

### Log Analysis

#### Centralized Log Viewing
```bash
# View all service logs
kubectl logs -f -l tier=backend -n hudur

# View specific service logs
kubectl logs -f deployment/attendance-service -n hudur

# View logs with timestamps
kubectl logs --timestamps=true deployment/api-gateway -n hudur
```

## Maintenance

### Regular Maintenance Tasks

#### Weekly Tasks
- Review system logs for errors
- Check resource utilization
- Verify backup integrity
- Update security patches

#### Monthly Tasks
- Database maintenance and optimization
- Certificate renewal check
- Performance review
- Capacity planning review

### Update Procedures

#### Rolling Updates
```bash
# Update specific service
kubectl set image deployment/attendance-service \
  attendance-service=hudur/attendance-service:v1.1.0 \
  -n hudur

# Check rollout status
kubectl rollout status deployment/attendance-service -n hudur

# Rollback if needed
kubectl rollout undo deployment/attendance-service -n hudur
```

#### Helm Updates
```bash
# Update Helm chart
helm upgrade hudur ./helm/hudur \
  --namespace hudur \
  --values ./helm/hudur/values-production.yaml

# Check upgrade status
helm status hudur -n hudur
```

## Support and Resources

### Documentation
- **API Documentation**: `/docs/API_DOCUMENTATION.md`
- **User Manual**: `/docs/USER_MANUAL.md`
- **Architecture Guide**: `/docs/ARCHITECTURE.md`

### Monitoring URLs
- **Grafana**: http://your-domain.com:3001
- **Prometheus**: http://your-domain.com:9090
- **Application**: http://your-domain.com

### Support Contacts
- **Technical Support**: support@hudur.sa
- **Emergency**: +1-800-ATTENDANCE
- **Documentation**: https://docs.hudur.sa

This deployment guide provides comprehensive instructions for deploying the Hudur platform in various environments. Follow the appropriate section based on your deployment requirements and infrastructure setup.

