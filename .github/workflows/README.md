# Waaed Platform CI/CD Workflows

This directory contains comprehensive GitHub Actions workflows for the Waaed unified education platform. The CI/CD implementation follows industry best practices with advanced features for security, performance, and reliability.

## 🚀 Overview

The Waaed platform uses a sophisticated CI/CD pipeline that supports:
- **Multi-environment deployments** (Development, Staging, Production)
- **Microservices architecture** with independent service deployments
- **Security-first approach** with comprehensive scanning and compliance
- **Performance optimization** through parallel builds and intelligent caching
- **Advanced monitoring** and alerting across all environments
- **Automated testing** including unit, integration, and end-to-end tests

## 📋 Workflow Files

### Core CI/CD Pipeline
- **[ci-cd-pipeline.yml](./ci-cd-pipeline.yml)** - Main CI/CD pipeline orchestrating builds, tests, and deployments
- **[testing.yml](./testing.yml)** - Comprehensive testing workflow with coverage reporting
- **[security.yml](./security.yml)** - Security scanning and vulnerability assessment
- **[code-quality.yml](./code-quality.yml)** - Code quality checks, linting, and static analysis

### Build and Deployment
- **[docker-build.yml](./docker-build.yml)** - Docker image building with multi-stage optimization
- **[deploy-dev.yml](./deploy-dev.yml)** - Development environment deployment
- **[deploy-staging.yml](./deploy-staging.yml)** - Staging environment deployment
- **[deploy-production.yml](./deploy-production.yml)** - Production environment deployment with approval gates

### Infrastructure and Operations
- **[infrastructure.yml](./infrastructure.yml)** - Infrastructure as Code deployment and management
- **[database.yml](./database.yml)** - Database migration and schema management
- **[monitoring.yml](./monitoring.yml)** - Monitoring, alerting, and health checks
- **[release.yml](./release.yml)** - Automated release management and versioning

### Utility Workflows
- **[workflow-dispatch.yml](./workflow-dispatch.yml)** - Manual workflow triggers and operations
- **[status-badges.yml](./status-badges.yml)** - Status badge generation and updates

## 🏗️ Architecture

### Microservices Structure
The platform consists of the following microservices:

#### Core Services
- **API Gateway** - Central entry point and routing
- **Authentication Service** - User authentication and authorization
- **Attendance Service** - Attendance tracking and management
- **Face Recognition Service** - Biometric authentication
- **Leave Management Service** - Leave requests and approvals
- **Notifications Service** - Multi-channel notifications
- **Webhooks Service** - External integrations
- **Integrations Service** - Third-party system integrations

#### Educational Modules
- **LMS Service** - Learning Management System
- **Finance Service** - Financial management and fee collection
- **HR Service** - Human resources management
- **Library Service** - Library catalog and circulation
- **Inventory Service** - Asset and inventory management
- **Polls Service** - Surveys and polling system
- **Blogs Service** - Content management and blogging
- **Tasks Service** - Task and project management

#### Frontend Applications
- **Unified Education Frontend** - Main React/TypeScript application

### Deployment Environments

#### Development Environment
- **Purpose**: Feature development and testing
- **Deployment**: Automatic on `develop` branch
- **Database**: SQLite for rapid development
- **Monitoring**: Basic health checks
- **Access**: Internal development team

#### Staging Environment
- **Purpose**: Pre-production testing and validation
- **Deployment**: Automatic on `main` branch
- **Database**: PostgreSQL with production-like data
- **Monitoring**: Full monitoring stack
- **Access**: QA team and stakeholders

#### Production Environment
- **Purpose**: Live system serving end users
- **Deployment**: Manual approval required
- **Database**: PostgreSQL with high availability
- **Monitoring**: Comprehensive monitoring and alerting
- **Access**: Production support team

## 🔧 Workflow Triggers

### Automatic Triggers
- **Push to `main`**: Triggers staging deployment
- **Push to `develop`**: Triggers development deployment
- **Pull Request**: Runs tests and security scans
- **Schedule**: Nightly security scans and health checks

### Manual Triggers
- **Production Deployment**: Manual approval workflow
- **Infrastructure Updates**: Manual infrastructure changes
- **Database Migrations**: Manual migration execution
- **Emergency Rollbacks**: Quick rollback procedures

## 🛡️ Security Features

### Static Application Security Testing (SAST)
- **CodeQL Analysis**: GitHub's semantic code analysis
- **SonarCloud**: Code quality and security analysis
- **ESLint Security**: JavaScript/TypeScript security linting
- **Bandit**: Python security analysis

### Dependency Scanning
- **Dependabot**: Automated dependency updates
- **npm audit**: Node.js dependency vulnerability scanning
- **NuGet Security Audit**: .NET dependency scanning
- **License Compliance**: Open source license verification

### Container Security
- **Trivy**: Container image vulnerability scanning
- **Docker Bench**: Docker security best practices
- **Image Signing**: Container image signing and verification
- **Registry Security**: Secure container registry access

### Infrastructure Security
- **Terraform Security**: Infrastructure as Code security scanning
- **Kubernetes Security**: Pod security policies and network policies
- **Secret Management**: Secure secret storage and rotation
- **Access Control**: Role-based access control (RBAC)

## 📊 Testing Strategy

### Unit Testing
- **Coverage Threshold**: 80% minimum code coverage
- **Frameworks**: xUnit (.NET), Jest (JavaScript/TypeScript)
- **Mocking**: Comprehensive mocking for external dependencies
- **Parallel Execution**: Tests run in parallel for faster feedback

### Integration Testing
- **Database Testing**: Real database integration tests
- **API Testing**: End-to-end API testing
- **Service Communication**: Inter-service communication testing
- **External Integrations**: Third-party service integration testing

### End-to-End Testing
- **Browser Testing**: Selenium-based UI testing
- **User Workflows**: Complete user journey testing
- **Cross-browser**: Testing across multiple browsers
- **Mobile Testing**: Responsive design testing

### Performance Testing
- **Load Testing**: Application performance under load
- **Stress Testing**: System behavior under extreme conditions
- **Scalability Testing**: Auto-scaling validation
- **Database Performance**: Query optimization and indexing

## 🚀 Deployment Strategies

### Rolling Deployment
- **Default Strategy**: Zero-downtime deployments
- **Health Checks**: Continuous health monitoring during deployment
- **Rollback**: Automatic rollback on health check failures
- **Traffic Shifting**: Gradual traffic migration to new instances

### Blue-Green Deployment
- **Staging Environment**: Complete environment duplication
- **Traffic Switch**: Instant traffic switching
- **Rollback**: Immediate rollback capability
- **Testing**: Full testing in production-like environment

### Canary Deployment
- **Production Environment**: Gradual rollout to subset of users
- **Monitoring**: Enhanced monitoring during canary phase
- **Metrics**: Success metrics validation
- **Automatic Promotion**: Automatic promotion based on metrics

## 📈 Monitoring and Observability

### Application Monitoring
- **Prometheus**: Metrics collection and storage
- **Grafana**: Visualization and dashboards
- **Jaeger**: Distributed tracing
- **ELK Stack**: Centralized logging

### Infrastructure Monitoring
- **Node Exporter**: System metrics collection
- **Kubernetes Metrics**: Cluster and pod monitoring
- **Network Monitoring**: Network performance and security
- **Storage Monitoring**: Persistent volume monitoring

### Alerting
- **Slack Integration**: Real-time notifications
- **Email Alerts**: Critical issue notifications
- **PagerDuty**: On-call escalation
- **Custom Webhooks**: Integration with external systems

### Health Checks
- **Liveness Probes**: Application health verification
- **Readiness Probes**: Service readiness validation
- **Startup Probes**: Application startup monitoring
- **Custom Health Endpoints**: Business logic health checks

## 🔄 Release Management

### Semantic Versioning
- **Version Format**: MAJOR.MINOR.PATCH
- **Automatic Versioning**: Based on commit messages
- **Release Notes**: Automated changelog generation
- **Tag Management**: Git tag creation and management

### Release Artifacts
- **Docker Images**: Multi-architecture container images
- **Helm Charts**: Kubernetes deployment packages
- **Documentation**: Updated documentation packages
- **Migration Scripts**: Database migration artifacts

### Release Approval
- **Staging Validation**: Mandatory staging environment testing
- **Security Review**: Security team approval for production
- **Change Management**: Change request documentation
- **Rollback Plan**: Documented rollback procedures

## 🛠️ Development Workflow

### Branch Strategy
- **Main Branch**: Production-ready code
- **Develop Branch**: Integration branch for features
- **Feature Branches**: Individual feature development
- **Hotfix Branches**: Critical production fixes

### Pull Request Process
- **Code Review**: Mandatory peer review
- **Automated Testing**: All tests must pass
- **Security Scanning**: Security checks must pass
- **Documentation**: Documentation updates required

### Continuous Integration
- **Build Validation**: Code compilation and build
- **Test Execution**: Comprehensive test suite
- **Quality Gates**: Code quality thresholds
- **Security Checks**: Vulnerability scanning

## 📚 Reusable Components

### Composite Actions
Located in `.github/workflows/templates/`:

- **[build-dotnet-service](./templates/build-dotnet-service/action.yml)** - .NET service building
- **[build-frontend](./templates/build-frontend/action.yml)** - Frontend application building
- **[run-tests](./templates/run-tests/action.yml)** - Comprehensive testing
- **[deploy-service](./templates/deploy-service/action.yml)** - Service deployment
- **[security-scan](./templates/security-scan/action.yml)** - Security scanning

### Workflow Templates
- **[new-service-template.yml](./templates/new-service-template.yml)** - Template for new microservices
- **[new-frontend-template.yml](./templates/new-frontend-template.yml)** - Template for new frontend applications

## 🔧 Configuration

### Environment Variables
Key environment variables used across workflows:

#### Build Configuration
- `DOTNET_VERSION`: .NET version (default: 8.0.x)
- `NODE_VERSION`: Node.js version (default: 18.x)
- `DOCKER_REGISTRY`: Container registry URL
- `IMAGE_TAG`: Docker image tag

#### Deployment Configuration
- `DEPLOYMENT_ENVIRONMENT`: Target environment
- `KUBERNETES_NAMESPACE`: Kubernetes namespace
- `HELM_CHART_PATH`: Helm chart location
- `DEPLOYMENT_STRATEGY`: Deployment strategy

#### Security Configuration
- `SECURITY_SCAN_ENABLED`: Enable security scanning
- `VULNERABILITY_THRESHOLD`: Security vulnerability threshold
- `COMPLIANCE_CHECKS`: Enable compliance validation

### Secrets Management
Required secrets in GitHub repository:

#### Container Registry
- `DOCKER_USERNAME`: Docker registry username
- `DOCKER_PASSWORD`: Docker registry password
- `GITHUB_TOKEN`: GitHub container registry access

#### Cloud Provider
- `AZURE_CREDENTIALS`: Azure service principal
- `AWS_ACCESS_KEY_ID`: AWS access key
- `AWS_SECRET_ACCESS_KEY`: AWS secret key

#### Database
- `DATABASE_URL`: Production database connection
- `REDIS_URL`: Redis cache connection
- `BACKUP_STORAGE_KEY`: Backup storage access

#### External Services
- `SLACK_WEBHOOK_URL`: Slack notifications
- `SONAR_TOKEN`: SonarCloud analysis
- `SNYK_TOKEN`: Snyk security scanning

## 🚨 Troubleshooting

### Common Issues

#### Build Failures
1. **Dependency Issues**: Check package.json and .csproj files
2. **Version Conflicts**: Verify .NET and Node.js versions
3. **Missing Secrets**: Ensure all required secrets are configured
4. **Resource Limits**: Check runner resource allocation

#### Deployment Failures
1. **Health Check Failures**: Review application logs
2. **Resource Constraints**: Check Kubernetes resource limits
3. **Network Issues**: Verify service connectivity
4. **Configuration Errors**: Validate environment variables

#### Security Scan Failures
1. **Vulnerability Threshold**: Review security findings
2. **False Positives**: Configure security scan exceptions
3. **Dependency Updates**: Update vulnerable dependencies
4. **Code Issues**: Fix identified security vulnerabilities

### Debugging Steps

#### Workflow Debugging
1. Enable debug logging: Set `ACTIONS_STEP_DEBUG` secret to `true`
2. Review workflow logs in GitHub Actions
3. Check individual step outputs
4. Validate environment variables and secrets

#### Application Debugging
1. Check application logs in monitoring system
2. Review health check endpoints
3. Validate database connectivity
4. Check external service integrations

#### Infrastructure Debugging
1. Review Kubernetes events and logs
2. Check resource utilization
3. Validate network policies
4. Review infrastructure as code changes

## 📞 Support

### Documentation
- **Platform Documentation**: [README.md](../../README.md)
- **API Documentation**: Available at `/swagger` endpoint
- **Deployment Guides**: Located in `docs/` directory
- **Troubleshooting**: This document and issue tracker

### Contact
- **Development Team**: Create issue in GitHub repository
- **DevOps Team**: Slack channel #devops
- **Security Team**: Slack channel #security
- **On-call Support**: PagerDuty escalation

### Contributing
1. Fork the repository
2. Create feature branch
3. Follow coding standards
4. Add comprehensive tests
5. Update documentation
6. Submit pull request

## 🔄 Continuous Improvement

### Metrics and KPIs
- **Deployment Frequency**: Daily deployment capability
- **Lead Time**: Feature to production time
- **Mean Time to Recovery**: Incident resolution time
- **Change Failure Rate**: Deployment success rate

### Feedback Loop
- **Retrospectives**: Regular team retrospectives
- **Metrics Review**: Weekly metrics analysis
- **Process Improvement**: Continuous process refinement
- **Tool Evaluation**: Regular tool and technology assessment

### Future Enhancements
- **GitOps Implementation**: ArgoCD for deployment management
- **Service Mesh**: Istio for advanced traffic management
- **Chaos Engineering**: Automated resilience testing
- **AI/ML Integration**: Intelligent monitoring and alerting

---

*This documentation is maintained by the Waaed DevOps team and updated with each release.*
