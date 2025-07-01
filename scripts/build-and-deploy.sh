#!/bin/bash

# Waaed Platform Build and Deploy Script
# This script builds all Docker images and deploys the platform

set -e

echo "🚀 Starting Waaed Platform Build and Deploy Process..."

if [ -n "${GITHUB_ACTIONS}" ]; then
    echo "🔧 Running in GitHub Actions CI/CD environment"
    CI_MODE=true
    INTERACTIVE=false
else
    echo "🔧 Running in local development environment"
    CI_MODE=false
    INTERACTIVE=true
fi

# Configuration with CI/CD support
REGISTRY="${DOCKER_REGISTRY:-waaed}"
VERSION="${IMAGE_TAG:-${GITHUB_SHA:-1.0.0}}"
NAMESPACE="${KUBERNETES_NAMESPACE:-waaed}"
ENVIRONMENT="${DEPLOYMENT_ENVIRONMENT:-development}"

if [ "$CI_MODE" = true ]; then
    REGISTRY="${REGISTRY,,}"  # Convert to lowercase for container registries
    if [ -n "${GITHUB_REF_NAME}" ]; then
        VERSION="${GITHUB_REF_NAME}-${GITHUB_SHA:0:8}"
    fi
fi

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

# Function to build Docker image with CI/CD support
build_image() {
    local service_name=$1
    local dockerfile_path=$2
    local image_name="${REGISTRY}/${service_name}:${VERSION}"
    
    print_status "Building ${service_name} image..."
    
    local build_args=""
    if [ "$CI_MODE" = true ]; then
        build_args="--build-arg BUILDKIT_INLINE_CACHE=1"
        if [ -n "${GITHUB_TOKEN}" ]; then
            build_args="${build_args} --build-arg GITHUB_TOKEN=${GITHUB_TOKEN}"
        fi
    fi
    
    if docker build ${build_args} -t "${image_name}" -f "${dockerfile_path}" .; then
        print_success "Successfully built ${image_name}"
        
        # Tag as latest only if not in CI or if main branch
        if [ "$CI_MODE" = false ] || [ "${GITHUB_REF_NAME}" = "main" ]; then
            docker tag "${image_name}" "${REGISTRY}/${service_name}:latest"
            print_success "Tagged ${image_name} as latest"
        fi
        
        if [ "$CI_MODE" = true ] && [ -n "${GITHUB_OUTPUT}" ]; then
            echo "${service_name}_image=${image_name}" >> "${GITHUB_OUTPUT}"
        fi
    else
        print_error "Failed to build ${image_name}"
        exit 1
    fi
}

# Function to push Docker image with CI/CD support
push_image() {
    local service_name=$1
    local image_name="${REGISTRY}/${service_name}:${VERSION}"
    
    print_status "Pushing ${service_name} image..."
    
    if [ "$CI_MODE" = true ]; then
        if docker push "${image_name}"; then
            print_success "Successfully pushed ${image_name}"
            
            if [ "${GITHUB_REF_NAME}" = "main" ]; then
                docker push "${REGISTRY}/${service_name}:latest"
                print_success "Successfully pushed ${REGISTRY}/${service_name}:latest"
            fi
        else
            print_error "Failed to push ${image_name}"
            exit 1
        fi
    else
        if docker push "${image_name}" && docker push "${REGISTRY}/${service_name}:latest"; then
            print_success "Successfully pushed ${image_name}"
        else
            print_warning "Failed to push ${image_name} (registry might not be configured)"
        fi
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

build_image "lms-service" "src/backend/services/LMS/Dockerfile"
build_image "finance-service" "src/backend/services/Finance/Dockerfile"
build_image "hr-service" "src/backend/services/HR/Dockerfile"
build_image "library-service" "src/backend/services/Library/Dockerfile"
build_image "inventory-service" "src/backend/services/Inventory/Dockerfile"
build_image "polls-service" "src/backend/services/Polls/Dockerfile"
build_image "blogs-service" "src/backend/services/Blogs/Dockerfile"
build_image "tasks-service" "src/backend/services/Tasks/Dockerfile"

print_status "Building frontend..."
build_image "frontend" "frontend/unified-education-frontend/Dockerfile"

print_success "All images built successfully!"

if [ "$CI_MODE" = true ]; then
    # In CI mode, always push images
    print_status "Pushing images to registry (CI mode)..."
    
    push_image "api-gateway"
    push_image "authentication-service"
    push_image "attendance-service"
    push_image "face-recognition-service"
    push_image "leave-management-service"
    push_image "notifications-service"
    push_image "webhooks-service"
    push_image "integrations-service"
    
    push_image "lms-service"
    push_image "finance-service"
    push_image "hr-service"
    push_image "library-service"
    push_image "inventory-service"
    push_image "polls-service"
    push_image "blogs-service"
    push_image "tasks-service"
    
    push_image "frontend"
    
    print_success "All images pushed successfully!"
elif [ "$INTERACTIVE" = true ]; then
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
        
        push_image "lms-service"
        push_image "finance-service"
        push_image "hr-service"
        push_image "library-service"
        push_image "inventory-service"
        push_image "polls-service"
        push_image "blogs-service"
        push_image "tasks-service"
        
        push_image "frontend"
        
        print_success "All images pushed successfully!"
    fi
fi

if [ "$CI_MODE" = true ]; then
    print_status "Deployment method determined by CI/CD environment: ${DEPLOYMENT_METHOD:-helm}"
    DEPLOYMENT_METHOD="${DEPLOYMENT_METHOD:-helm}"
    
    case $DEPLOYMENT_METHOD in
        "docker-compose")
            REPLY=1
            ;;
        "kubernetes")
            REPLY=2
            ;;
        "helm")
            REPLY=3
            ;;
        *)
            REPLY=4
            ;;
    esac
elif [ "$INTERACTIVE" = true ]; then
    echo
    print_status "Choose deployment method:"
    echo "1) Docker Compose (Local/Development)"
    echo "2) Kubernetes (Production)"
    echo "3) Helm Chart (Production with Helm)"
    echo "4) Skip deployment"

    read -p "Enter your choice (1-4): " -n 1 -r
    echo
fi

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
        
        # Apply monitoring based on environment
        if [ "$CI_MODE" = true ]; then
            if [ "${DEPLOY_MONITORING:-false}" = "true" ]; then
                kubectl apply -f k8s/monitoring/
                print_success "Monitoring stack deployed!"
            fi
        elif [ "$INTERACTIVE" = true ]; then
            read -p "Do you want to deploy monitoring stack? (y/N): " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                kubectl apply -f k8s/monitoring/
                print_success "Monitoring stack deployed!"
            fi
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
        
        # Install or upgrade the Helm chart with CI/CD support
        helm_args="--namespace ${NAMESPACE} --create-namespace --set image.tag=${VERSION}"
        
        if [ "$CI_MODE" = true ]; then
            helm_args="${helm_args} --set environment=${ENVIRONMENT}"
            helm_args="${helm_args} --set ci.enabled=true"
            helm_args="${helm_args} --set ci.buildNumber=${GITHUB_RUN_NUMBER:-0}"
            helm_args="${helm_args} --set ci.commitSha=${GITHUB_SHA:-unknown}"
            
            if [ -n "${DATABASE_URL}" ]; then
                helm_args="${helm_args} --set database.connectionString=${DATABASE_URL}"
            fi
            if [ -n "${REDIS_URL}" ]; then
                helm_args="${helm_args} --set redis.connectionString=${REDIS_URL}"
            fi
        fi
        
        helm upgrade --install waaed ./helm/waaed ${helm_args}
        
        print_success "Helm deployment completed!"
        print_status "You can check the deployment status with:"
        echo "  helm status waaed -n ${NAMESPACE}"
        echo "  kubectl get pods -n ${NAMESPACE}"
        
        if [ "$CI_MODE" = true ] && [ -n "${GITHUB_OUTPUT}" ]; then
            echo "deployment_status=success" >> "${GITHUB_OUTPUT}"
            echo "deployment_namespace=${NAMESPACE}" >> "${GITHUB_OUTPUT}"
            echo "deployment_environment=${ENVIRONMENT}" >> "${GITHUB_OUTPUT}"
        fi
        ;;
    4)
        print_status "Skipping deployment."
        ;;
    *)
        print_warning "Invalid choice. Skipping deployment."
        ;;
esac

print_success "🎉 Waaed Platform build process completed!"

# Display useful information
echo
print_status "📋 Useful Commands:"
echo "  • View Docker images: docker images | grep waaed"
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
echo "  • Helm chart: ./helm/waaed/"

# CI/CD specific information
if [ "$CI_MODE" = true ]; then
    echo
    print_status "🔧 CI/CD Information:"
    echo "  • Environment: ${ENVIRONMENT}"
    echo "  • Version: ${VERSION}"
    echo "  • Registry: ${REGISTRY}"
    echo "  • Namespace: ${NAMESPACE}"
    if [ -n "${GITHUB_RUN_ID}" ]; then
        echo "  • GitHub Run: https://github.com/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID}"
    fi
fi

echo
print_success "✅ Build and deployment script completed successfully!"

