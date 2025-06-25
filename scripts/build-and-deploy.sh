#!/bin/bash

# Hudur Platform Build and Deploy Script
# This script builds all Docker images and deploys the platform

set -e

echo "🚀 Starting Hudur Platform Build and Deploy Process..."

# Configuration
REGISTRY="hudur"
VERSION="1.0.0"
NAMESPACE="hudur"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to build Docker image
build_image() {
    local service_name=$1
    local dockerfile_path=$2
    local image_name="${REGISTRY}/${service_name}:${VERSION}"
    
    print_status "Building ${service_name} image..."
    
    if docker build -t "${image_name}" -f "${dockerfile_path}" .; then
        print_success "Successfully built ${image_name}"
        
        # Tag as latest
        docker tag "${image_name}" "${REGISTRY}/${service_name}:latest"
        print_success "Tagged ${image_name} as latest"
    else
        print_error "Failed to build ${image_name}"
        exit 1
    fi
}

# Function to push Docker image
push_image() {
    local service_name=$1
    local image_name="${REGISTRY}/${service_name}:${VERSION}"
    
    print_status "Pushing ${service_name} image..."
    
    if docker push "${image_name}" && docker push "${REGISTRY}/${service_name}:latest"; then
        print_success "Successfully pushed ${image_name}"
    else
        print_warning "Failed to push ${image_name} (registry might not be configured)"
    fi
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

print_status "Docker is running. Proceeding with build..."

# Build all service images
print_status "Building backend services..."

build_image "api-gateway" "src/backend/gateways/Dockerfile"
build_image "authentication-service" "src/backend/services/Authentication/Dockerfile"
build_image "attendance-service" "src/backend/services/Attendance/Dockerfile"
build_image "face-recognition-service" "src/backend/services/FaceRecognition/Dockerfile"
build_image "leave-management-service" "src/backend/services/LeaveManagement/Dockerfile"
build_image "notifications-service" "src/backend/services/Notifications/Dockerfile"
build_image "webhooks-service" "src/backend/services/Webhooks/Dockerfile"
build_image "integrations-service" "src/backend/services/Integrations/Dockerfile"

print_status "Building frontend..."
build_image "frontend" "src/frontend/Dockerfile"

print_success "All images built successfully!"

# Ask user if they want to push images
read -p "Do you want to push images to registry? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Pushing images to registry..."
    
    push_image "api-gateway"
    push_image "authentication-service"
    push_image "attendance-service"
    push_image "face-recognition-service"
    push_image "leave-management-service"
    push_image "notifications-service"
    push_image "webhooks-service"
    push_image "integrations-service"
    push_image "frontend"
    
    print_success "All images pushed successfully!"
fi

# Ask user about deployment method
echo
print_status "Choose deployment method:"
echo "1) Docker Compose (Local/Development)"
echo "2) Kubernetes (Production)"
echo "3) Helm Chart (Production with Helm)"
echo "4) Skip deployment"

read -p "Enter your choice (1-4): " -n 1 -r
echo

case $REPLY in
    1)
        print_status "Deploying with Docker Compose..."
        
        # Stop existing containers
        docker-compose -f docker-compose.production.yml down
        
        # Start new containers
        docker-compose -f docker-compose.production.yml up -d
        
        print_success "Docker Compose deployment completed!"
        print_status "Services are starting up. You can check status with:"
        echo "  docker-compose -f docker-compose.production.yml ps"
        echo "  docker-compose -f docker-compose.production.yml logs -f"
        ;;
    2)
        print_status "Deploying to Kubernetes..."
        
        # Check if kubectl is available
        if ! command -v kubectl &> /dev/null; then
            print_error "kubectl is not installed. Please install kubectl and try again."
            exit 1
        fi
        
        # Apply Kubernetes manifests
        kubectl apply -f k8s/base/namespace-and-config.yaml
        kubectl apply -f k8s/base/database.yaml
        kubectl apply -f k8s/base/backend-services.yaml
        kubectl apply -f k8s/base/additional-services.yaml
        kubectl apply -f k8s/base/autoscaling-and-policies.yaml
        
        # Apply monitoring if requested
        read -p "Do you want to deploy monitoring stack? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            kubectl apply -f k8s/monitoring/
            print_success "Monitoring stack deployed!"
        fi
        
        print_success "Kubernetes deployment completed!"
        print_status "You can check the deployment status with:"
        echo "  kubectl get pods -n ${NAMESPACE}"
        echo "  kubectl get services -n ${NAMESPACE}"
        ;;
    3)
        print_status "Deploying with Helm..."
        
        # Check if helm is available
        if ! command -v helm &> /dev/null; then
            print_error "Helm is not installed. Please install Helm and try again."
            exit 1
        fi
        
        # Install or upgrade the Helm chart
        helm upgrade --install hudur ./helm/hudur \
            --namespace ${NAMESPACE} \
            --create-namespace \
            --set image.tag=${VERSION}
        
        print_success "Helm deployment completed!"
        print_status "You can check the deployment status with:"
        echo "  helm status hudur -n ${NAMESPACE}"
        echo "  kubectl get pods -n ${NAMESPACE}"
        ;;
    4)
        print_status "Skipping deployment."
        ;;
    *)
        print_warning "Invalid choice. Skipping deployment."
        ;;
esac

print_success "🎉 Hudur Platform build process completed!"

# Display useful information
echo
print_status "📋 Useful Commands:"
echo "  • View Docker images: docker images | grep hudur"
echo "  • Check Docker Compose status: docker-compose -f docker-compose.production.yml ps"
echo "  • View Kubernetes pods: kubectl get pods -n ${NAMESPACE}"
echo "  • View Helm releases: helm list -n ${NAMESPACE}"
echo "  • Access Grafana: http://localhost:3001 (admin/\${GRAFANA_ADMIN_PASSWORD})"
echo "  • Access Prometheus: http://localhost:9090"
echo "  • Access Frontend: http://localhost:3000"
echo "  • Access API Gateway: http://localhost:5000"

print_status "📚 Documentation:"
echo "  • API Documentation: http://localhost:5000/swagger"
echo "  • Platform README: ./README.md"
echo "  • Kubernetes manifests: ./k8s/"
echo "  • Helm chart: ./helm/hudur/"

echo
print_success "✅ Build and deployment script completed successfully!"

