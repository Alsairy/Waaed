#!/bin/bash


set -e

if [ -n "${GITHUB_ACTIONS}" ]; then
    echo "🔧 Running in GitHub Actions CI/CD environment"
    CI_MODE=true
    INTERACTIVE=false
else
    echo "🔧 Running in local development environment"
    CI_MODE=false
    INTERACTIVE=true
fi

echo "🔐 Generating secure secrets for Waaed Platform..."

JWT_SECRET=$(openssl rand -base64 48 | tr -d "=+/" | cut -c1-64)
DB_PASSWORD=$(openssl rand -base64 24 | tr -d "=+/" | cut -c1-32)
REDIS_PASSWORD=$(openssl rand -base64 24 | tr -d "=+/" | cut -c1-32)
GRAFANA_PASSWORD=$(openssl rand -base64 12 | tr -d "=+/" | cut -c1-16)
ENCRYPTION_KEY=$(openssl rand -base64 24 | tr -d "=+/" | cut -c1-32)

API_KEY=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-43)
WEBHOOK_SECRET=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-43)
SESSION_SECRET=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-43)

if [ "$CI_MODE" = true ]; then
    OUTPUT_FILE="${SECRETS_OUTPUT_FILE:-.env.production}"
    
    if [ -n "${GITHUB_OUTPUT}" ]; then
        echo "jwt_secret=${JWT_SECRET}" >> "${GITHUB_OUTPUT}"
        echo "db_password=${DB_PASSWORD}" >> "${GITHUB_OUTPUT}"
        echo "redis_password=${REDIS_PASSWORD}" >> "${GITHUB_OUTPUT}"
        echo "grafana_password=${GRAFANA_PASSWORD}" >> "${GITHUB_OUTPUT}"
        echo "encryption_key=${ENCRYPTION_KEY}" >> "${GITHUB_OUTPUT}"
        echo "api_key=${API_KEY}" >> "${GITHUB_OUTPUT}"
        echo "webhook_secret=${WEBHOOK_SECRET}" >> "${GITHUB_OUTPUT}"
        echo "session_secret=${SESSION_SECRET}" >> "${GITHUB_OUTPUT}"
    fi
else
    OUTPUT_FILE=".env.production"
fi

cat > "${OUTPUT_FILE}" << EOF

DB_SERVER=sql-server
DB_NAME=Waaed
DB_USER=sa
DB_PASSWORD=${DB_PASSWORD}
DB_TRUST_SERVER_CERTIFICATE=true

JWT_SECRET_KEY=${JWT_SECRET}
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

REDIS_URL=redis://redis:6379
REDIS_PASSWORD=${REDIS_PASSWORD}

API_GATEWAY_PORT=5000
CORS_ORIGINS=https://yourdomain.com,https://app.yourdomain.com

AUTH_SERVICE_PORT=5001
ATTENDANCE_SERVICE_PORT=5002
FACE_RECOGNITION_SERVICE_PORT=5003
LEAVE_MANAGEMENT_SERVICE_PORT=5004
ANALYTICS_SERVICE_PORT=5005
BI_SERVICE_PORT=5006
NOTIFICATIONS_SERVICE_PORT=5007
WEBHOOKS_SERVICE_PORT=5008
INTEGRATIONS_SERVICE_PORT=5009
WORKFLOW_SERVICE_PORT=5010
COLLABORATION_SERVICE_PORT=5011
EVENT_SOURCING_SERVICE_PORT=5012

LMS_SERVICE_PORT=5013
FINANCE_SERVICE_PORT=5014
HR_SERVICE_PORT=5015
LIBRARY_SERVICE_PORT=5016
INVENTORY_SERVICE_PORT=5017
POLLS_SERVICE_PORT=5018
BLOGS_SERVICE_PORT=5019
TASKS_SERVICE_PORT=5020

GRAFANA_ADMIN_PASSWORD=${GRAFANA_PASSWORD}
PROMETHEUS_PORT=9090
GRAFANA_PORT=3001

SMTP_HOST=smtp.yourdomain.com
SMTP_PORT=587
SMTP_USER=noreply@yourdomain.com
SMTP_PASSWORD=CHANGE_THIS_SMTP_PASSWORD_IN_PRODUCTION
SMTP_FROM_NAME=Waaed System

SMS_PROVIDER=twilio
SMS_ACCOUNT_SID=CHANGE_THIS_SMS_SID_IN_PRODUCTION
SMS_AUTH_TOKEN=CHANGE_THIS_SMS_TOKEN_IN_PRODUCTION
SMS_FROM_NUMBER=+1234567890

STORAGE_TYPE=local
STORAGE_PATH=/app/uploads
AWS_ACCESS_KEY_ID=CHANGE_THIS_AWS_KEY_IN_PRODUCTION
AWS_SECRET_ACCESS_KEY=CHANGE_THIS_AWS_SECRET_IN_PRODUCTION
AWS_BUCKET_NAME=waaed-uploads
AWS_REGION=us-east-1

FACE_RECOGNITION_CONFIDENCE_THRESHOLD=0.85
FACE_RECOGNITION_MODEL_PATH=/app/models/face_recognition

MICROSOFT_CLIENT_ID=CHANGE_THIS_MICROSOFT_CLIENT_ID
MICROSOFT_CLIENT_SECRET=CHANGE_THIS_MICROSOFT_CLIENT_SECRET
GOOGLE_CLIENT_ID=CHANGE_THIS_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=CHANGE_THIS_GOOGLE_CLIENT_SECRET
SALESFORCE_CLIENT_ID=CHANGE_THIS_SALESFORCE_CLIENT_ID
SALESFORCE_CLIENT_SECRET=CHANGE_THIS_SALESFORCE_CLIENT_SECRET

ENCRYPTION_KEY=${ENCRYPTION_KEY}
API_KEY=${API_KEY}
WEBHOOK_SECRET=${WEBHOOK_SECRET}
SESSION_SECRET=${SESSION_SECRET}
RATE_LIMIT_REQUESTS_PER_MINUTE=100
ACCOUNT_LOCKOUT_ATTEMPTS=5
ACCOUNT_LOCKOUT_DURATION_MINUTES=30

LOG_LEVEL=Information
LOG_TO_FILE=true
LOG_FILE_PATH=/app/logs/waaed.log
LOG_MAX_FILE_SIZE_MB=100
LOG_MAX_FILES=10

HEALTH_CHECK_TIMEOUT_SECONDS=30
HEALTH_CHECK_INTERVAL_SECONDS=60

CONNECTION_POOL_SIZE=100
QUERY_TIMEOUT_SECONDS=30
CACHE_EXPIRATION_MINUTES=60

CI_ENABLED=${CI_MODE:-false}
BUILD_NUMBER=${GITHUB_RUN_NUMBER:-0}
COMMIT_SHA=${GITHUB_SHA:-unknown}
BRANCH_NAME=${GITHUB_REF_NAME:-local}
DEPLOYMENT_ENVIRONMENT=${DEPLOYMENT_ENVIRONMENT:-production}
EOF

echo "✅ Secrets generated successfully!"
echo "📁 Generated ${OUTPUT_FILE} with secure secrets"
echo ""
echo "🔐 Generated secrets:"
echo "   JWT Secret: ${JWT_SECRET:0:10}... (64 chars)"
echo "   DB Password: ${DB_PASSWORD:0:8}... (32 chars)"
echo "   Redis Password: ${REDIS_PASSWORD:0:8}... (32 chars)"
echo "   Grafana Password: ${GRAFANA_PASSWORD:0:6}... (16 chars)"
echo "   Encryption Key: ${ENCRYPTION_KEY:0:8}... (32 chars)"
echo "   API Key: ${API_KEY:0:8}... (43 chars)"
echo "   Webhook Secret: ${WEBHOOK_SECRET:0:8}... (43 chars)"
echo "   Session Secret: ${SESSION_SECRET:0:8}... (43 chars)"

if [ "$CI_MODE" = true ]; then
    echo ""
    echo "🔧 CI/CD Information:"
    echo "   Environment: ${DEPLOYMENT_ENVIRONMENT:-production}"
    echo "   Build Number: ${GITHUB_RUN_NUMBER:-0}"
    echo "   Commit SHA: ${GITHUB_SHA:0:8}..."
    echo "   Branch: ${GITHUB_REF_NAME:-local}"
    
    if [ -n "${GITHUB_OUTPUT}" ]; then
        echo "   GitHub Actions outputs set: ✅"
    fi
fi

echo ""
echo "⚠️  IMPORTANT: Store these secrets securely and never commit them to version control!"
echo "⚠️  Update the remaining placeholder values in ${OUTPUT_FILE} before deployment"

if [ "$CI_MODE" = true ] && [ -n "${GITHUB_STEP_SUMMARY}" ]; then
    cat >> "${GITHUB_STEP_SUMMARY}" << EOF

- **Environment**: ${DEPLOYMENT_ENVIRONMENT:-production}
- **Generated Secrets**: 8 secure secrets
- **Output File**: ${OUTPUT_FILE}
- **CI/CD Mode**: Enabled

- JWT Secret (64 chars)
- Database Password (32 chars)
- Redis Password (32 chars)
- Grafana Password (16 chars)
- Encryption Key (32 chars)
- API Key (43 chars)
- Webhook Secret (43 chars)
- Session Secret (43 chars)

⚠️ **Security Note**: All secrets are generated with high entropy and are ready for production use.
EOF
fi
