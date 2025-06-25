#!/bin/bash


set -e

BACKUP_DIR="/var/backups/hudur"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

DB_HOST="${DB_HOST:-localhost}"
DB_NAME="${DB_NAME:-AttendancePlatform}"
DB_USER="${DB_USER:-sa}"
DB_PASSWORD="${DB_PASSWORD}"

mkdir -p "$BACKUP_DIR"

echo "Starting Hudur backup at $(date)"

echo "Backing up database..."
sqlcmd -S "$DB_HOST" -U "$DB_USER" -P "$DB_PASSWORD" -Q "BACKUP DATABASE [$DB_NAME] TO DISK = '$BACKUP_DIR/database_$DATE.bak' WITH FORMAT, INIT, COMPRESSION"

echo "Backing up configuration files..."
tar -czf "$BACKUP_DIR/config_$DATE.tar.gz" \
    .env.production \
    docker-compose.production.yml \
    k8s/ \
    helm/ \
    monitoring/

echo "Backing up application logs..."
if [ -d "/var/log/hudur" ]; then
    tar -czf "$BACKUP_DIR/logs_$DATE.tar.gz" /var/log/hudur/
fi

echo "Backing up Redis data..."
if command -v redis-cli &> /dev/null; then
    redis-cli --rdb "$BACKUP_DIR/redis_$DATE.rdb"
fi

if [ -d "/var/lib/hudur/uploads" ]; then
    echo "Backing up file uploads..."
    tar -czf "$BACKUP_DIR/uploads_$DATE.tar.gz" /var/lib/hudur/uploads/
fi

echo "Cleaning up old backups..."
find "$BACKUP_DIR" -name "*.bak" -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -name "*.rdb" -mtime +$RETENTION_DAYS -delete

echo "Creating backup manifest..."
cat > "$BACKUP_DIR/manifest_$DATE.txt" << EOF
Hudur Backup Manifest
Created: $(date)
Database: database_$DATE.bak
Config: config_$DATE.tar.gz
Logs: logs_$DATE.tar.gz
Redis: redis_$DATE.rdb
Uploads: uploads_$DATE.tar.gz

Backup completed successfully at $(date)
EOF

echo "Backup completed successfully at $(date)"
echo "Backup files created in: $BACKUP_DIR"

if [ -n "$AWS_S3_BUCKET" ]; then
    echo "Uploading backups to S3..."
    aws s3 sync "$BACKUP_DIR" "s3://$AWS_S3_BUCKET/hudur-backups/" --exclude "*" --include "*_$DATE.*"
fi

if [ -n "$AZURE_STORAGE_ACCOUNT" ]; then
    echo "Uploading backups to Azure Storage..."
    az storage blob upload-batch --destination hudur-backups --source "$BACKUP_DIR" --pattern "*_$DATE.*"
fi
