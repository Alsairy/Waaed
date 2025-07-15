#!/bin/bash
set -euo pipefail

DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-1433}
DB_USER=${DB_USER:-sa}
DB_NAME=${DB_NAME:-Waaed}
DB_PASSWORD=${DB_PASSWORD:-}

if [ -z "$DB_PASSWORD" ]; then
  echo "Error: DB_PASSWORD is not set" >&2
  exit 1
fi

if ! command -v sqlcmd &> /dev/null; then
  echo "Error: sqlcmd is not installed or not in PATH" >&2
  echo "Please install SQL Server command line tools" >&2
  exit 1
fi

echo "Testing database connection to $DB_HOST:$DB_PORT..."
echo "Database: $DB_NAME"
echo "User: $DB_USER"

if sqlcmd \
  -S "$DB_HOST,$DB_PORT" \
  -d "$DB_NAME" \
  -U "$DB_USER" \
  -P "$DB_PASSWORD" \
  -Q "SELECT 1 as ConnectionTest" \
  -h -1 \
  -W 2>&1; then
  echo "✅ Database connection successful"
  exit 0
else
  echo "❌ Database connection failed"
  exit 1
fi
