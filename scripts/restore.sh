#!/bin/bash


set -e

BACKUP_DIR="/var/backups/hudur"
RESTORE_DATE="$1"

DB_HOST="${DB_HOST:-localhost}"
DB_NAME="${DB_NAME:-AttendancePlatform}"
DB_USER="${DB_USER:-sa}"
DB_PASSWORD="${DB_PASSWORD}"

if [ -z "$RESTORE_DATE" ]; then
    echo "Usage: $0 <backup_date>"
    echo "Available backups:"
    ls -la "$BACKUP_DIR" | grep "database_" | awk '{print $9}' | sed 's/database_//' | sed 's/.bak//'
    exit 1
fi

echo "Starting Hudur restore for date: $RESTORE_DATE"

DATABASE_BACKUP="$BACKUP_DIR/database_$RESTORE_DATE.bak"
CONFIG_BACKUP="$BACKUP_DIR/config_$RESTORE_DATE.tar.gz"

if [ ! -f "$DATABASE_BACKUP" ]; then
    echo "Error: Database backup file not found: $DATABASE_BACKUP"
    exit 1
fi

echo "Stopping Hudur services..."
docker-compose -f docker-compose.production.yml down

echo "Restoring database..."
sqlcmd -S "$DB_HOST" -U "$DB_USER" -P "$DB_PASSWORD" -Q "RESTORE DATABASE [$DB_NAME] FROM DISK = '$DATABASE_BACKUP' WITH REPLACE"

if [ -f "$CONFIG_BACKUP" ]; then
    echo "Restoring configuration files..."
    tar -xzf "$CONFIG_BACKUP" -C /
fi

REDIS_BACKUP="$BACKUP_DIR/redis_$RESTORE_DATE.rdb"
if [ -f "$REDIS_BACKUP" ]; then
    echo "Restoring Redis data..."
    cp "$REDIS_BACKUP" /var/lib/redis/dump.rdb
    chown redis:redis /var/lib/redis/dump.rdb
fi

UPLOADS_BACKUP="$BACKUP_DIR/uploads_$RESTORE_DATE.tar.gz"
if [ -f "$UPLOADS_BACKUP" ]; then
    echo "Restoring file uploads..."
    mkdir -p /var/lib/hudur/uploads
    tar -xzf "$UPLOADS_BACKUP" -C /
fi

echo "Starting Hudur services..."
docker-compose -f docker-compose.production.yml up -d

echo "Waiting for services to be ready..."
sleep 30

echo "Verifying restore..."
curl -f http://localhost/health || echo "Warning: Health check failed"

echo "Restore completed successfully at $(date)"
echo "Please verify that all services are working correctly"
