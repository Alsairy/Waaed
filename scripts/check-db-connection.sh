#!/bin/bash
set -euo pipefail

function show_usage() {
  echo "Usage: $0 [options]"
  echo "Test database connectivity to SQL Server"
  echo ""
  echo "Options:"
  echo "  -h, --help         Show this help message"
  echo "  --host HOST        Database host (default: localhost)"
  echo "  --port PORT        Database port (default: 1433)"
  echo "  --user USER        Database user (default: sa)"
  echo "  --name NAME        Database name (default: Waaed)"
  echo "  --password PWD     Database password (required)"
  echo ""
  echo "Environment Variables:"
  echo "  DB_HOST           Database host"
  echo "  DB_PORT           Database port"
  echo "  DB_USER           Database user"
  echo "  DB_NAME           Database name"
  echo "  DB_PASSWORD       Database password (required)"
  echo ""
  echo "Examples:"
  echo "  $0                                    # Use environment variables"
  echo "  DB_PASSWORD=mypass $0                 # Set password via environment"
  echo "  $0 --host myhost --password mypass    # Use command line options"
  exit 0
}

while [[ $# -gt 0 ]]; do
  case $1 in
    -h|--help)
      show_usage
      ;;
    --host)
      DB_HOST="$2"
      shift 2
      ;;
    --port)
      DB_PORT="$2"
      shift 2
      ;;
    --user)
      DB_USER="$2"
      shift 2
      ;;
    --name)
      DB_NAME="$2"
      shift 2
      ;;
    --password)
      DB_PASSWORD="$2"
      shift 2
      ;;
    *)
      echo "Error: Unknown option $1" >&2
      echo "Use --help for usage information" >&2
      exit 1
      ;;
  esac
done

DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-1433}
DB_USER=${DB_USER:-sa}
DB_NAME=${DB_NAME:-Waaed}
DB_PASSWORD=${DB_PASSWORD:-}

if [ -z "$DB_HOST" ]; then
  echo "Error: DB_HOST is not set" >&2
  echo "Use --host option or set DB_HOST environment variable" >&2
  exit 1
fi

if [ -z "$DB_PORT" ]; then
  echo "Error: DB_PORT is not set" >&2
  echo "Use --port option or set DB_PORT environment variable" >&2
  exit 1
fi

if [ -z "$DB_USER" ]; then
  echo "Error: DB_USER is not set" >&2
  echo "Use --user option or set DB_USER environment variable" >&2
  exit 1
fi

if [ -z "$DB_NAME" ]; then
  echo "Error: DB_NAME is not set" >&2
  echo "Use --name option or set DB_NAME environment variable" >&2
  exit 1
fi

if [ -z "$DB_PASSWORD" ]; then
  echo "Error: DB_PASSWORD is not set" >&2
  echo "Use --password option or set DB_PASSWORD environment variable" >&2
  exit 1
fi

if ! [[ "$DB_PORT" =~ ^[0-9]+$ ]]; then
  echo "Error: DB_PORT must be a number, got: $DB_PORT" >&2
  exit 1
fi

if [ "$DB_PORT" -lt 1 ] || [ "$DB_PORT" -gt 65535 ]; then
  echo "Error: DB_PORT must be between 1 and 65535, got: $DB_PORT" >&2
  exit 1
fi

if ! command -v sqlcmd &> /dev/null; then
  echo "Error: sqlcmd is not installed or not in PATH" >&2
  echo "Please install SQL Server command line tools:" >&2
  echo "  - On Ubuntu/Debian: apt-get install mssql-tools" >&2
  echo "  - On RHEL/CentOS: yum install mssql-tools" >&2
  echo "  - On macOS: brew install mssql-tools" >&2
  echo "  - On Windows: Download from Microsoft SQL Server website" >&2
  exit 1
fi

echo "Testing database connection..."
echo "Host: $DB_HOST"
echo "Port: $DB_PORT"
echo "Database: $DB_NAME"
echo "User: $DB_USER"
echo ""

if timeout 30 sqlcmd \
  -S "$DB_HOST,$DB_PORT" \
  -d "$DB_NAME" \
  -U "$DB_USER" \
  -P "$DB_PASSWORD" \
  -Q "SELECT 1 AS ConnectionTest, GETDATE() AS CurrentTime, @@VERSION AS ServerVersion" \
  -h -1 \
  -W 2>&1; then
  echo ""
  echo "✅ Database connection successful"
  exit 0
else
  echo ""
  echo "❌ Database connection failed"
  echo ""
  echo "Troubleshooting tips:"
  echo "1. Verify the database server is running"
  echo "2. Check if the port $DB_PORT is accessible"
  echo "3. Confirm the database '$DB_NAME' exists"
  echo "4. Verify the user '$DB_USER' has access permissions"
  echo "5. Check firewall settings"
  echo "6. Ensure SQL Server is configured to accept connections"
  exit 1
fi
