#!/bin/bash
set -e

echo "🚀 Starting Waaed Staging Environment Setup..."

if [ "$EUID" -ne 0 ]; then
  echo "❌ Please run with sudo to modify /etc/hosts"
  echo "Usage: sudo ./scripts/start-staging.sh"
  exit 1
fi

echo "🔧 Setting up local domain mapping..."
if ! grep -q "staging-api.waaed.sa" /etc/hosts; then
  echo "Adding staging-api.waaed.sa to /etc/hosts..."
  echo "127.0.0.1 staging-api.waaed.sa" >> /etc/hosts
  echo "✅ Domain mapping added successfully"
else
  echo "✅ Domain mapping already exists"
fi

if [ ! -f ".env.staging" ]; then
  echo "❌ .env.staging file not found. Please ensure it exists with proper configuration."
  exit 1
fi

echo "🐳 Starting Docker Compose staging environment..."
docker-compose -f docker-compose.staging.yml down --remove-orphans 2>/dev/null || true
docker-compose -f docker-compose.staging.yml up -d

echo "⏳ Waiting for services to be healthy..."
echo "This may take a few minutes for all services to start..."

attempt=0
max_attempts=60
health_check_url="http://staging-api.waaed.sa/health"

until $(curl --output /dev/null --silent --head --fail --connect-timeout 5 --max-time 10 $health_check_url); do
  if [ ${attempt} -eq ${max_attempts} ]; then
    echo "❌ Services failed to start after ${max_attempts} attempts"
    echo "📋 Checking service status..."
    docker-compose -f docker-compose.staging.yml ps
    exit 1
  fi
  
  if [ $((attempt % 10)) -eq 0 ]; then
    echo "⏳ Still waiting... (attempt $((attempt + 1))/${max_attempts})"
  fi
  
  printf '.'
  attempt=$(($attempt+1))
  sleep 10
done

echo ""
echo "✅ Staging environment is ready!"

echo ""
echo "🌐 Available URLs:"
echo "- API Gateway: http://staging-api.waaed.sa"
echo "- API Docs: http://staging-api.waaed.sa/swagger"
echo "- Frontend: http://localhost:3100"

echo ""
echo "📋 Service Status:"
docker-compose -f docker-compose.staging.yml ps
