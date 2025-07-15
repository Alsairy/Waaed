# 🚀 Waaed - Unified Education Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![.NET](https://img.shields.io/badge/.NET-8.0-blue.svg)](https://dotnet.microsoft.com/)
[![Security Score](https://img.shields.io/badge/security-91%2F100-brightgreen.svg)](./SECURITY_VALIDATION_REPORT.md)
[![React](https://img.shields.io/badge/React-18.0-blue.svg)](https://reactjs.org/)
[![React Native](https://img.shields.io/badge/React%20Native-0.72-blue.svg)](https://reactnative.dev/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-Ready-blue.svg)](https://kubernetes.io/)
[![CI/CD](https://github.com/Alsairy/Waaed/workflows/CI%2FCD%20Pipeline/badge.svg)](https://github.com/Alsairy/Waaed/actions)
[![Build Status](https://github.com/Alsairy/Waaed/workflows/Build%20and%20Test/badge.svg)](https://github.com/Alsairy/Waaed/actions)
[![Security Scan](https://github.com/Alsairy/Waaed/workflows/Security%20Scan/badge.svg)](https://github.com/Alsairy/Waaed/actions)
[![Code Quality](https://github.com/Alsairy/Waaed/workflows/Code%20Quality/badge.svg)](https://github.com/Alsairy/Waaed/actions)

> **🌟 World-Class Unified Education Platform** - Complete educational management solution with AI-powered analytics, real-time collaboration, and comprehensive business intelligence for modern educational institutions.

## 📋 Table of Contents

- [🎯 Overview](#-overview)
- [✨ Key Features](#-key-features)
- [🏗️ Architecture](#️-architecture)
- [🚀 Quick Start](#-quick-start)
- [📱 Mobile Apps](#-mobile-apps)
- [🔧 Development](#-development)
- [🚀 Deployment](#-deployment)
- [⚙️ CI/CD Pipeline](#️-cicd-pipeline)
- [🔗 Integrations](#-integrations)
- [📊 Analytics](#-analytics)
- [🔒 Security](#-security)
- [📚 Documentation](#-documentation)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

## 🎯 Overview

Waaed is a **production-ready unified education platform** featuring cutting-edge technology, AI-powered analytics, and comprehensive business intelligence. Built with modern microservices architecture and designed for global scale.

### 🌟 **Why Waaed?**

- **🎓 Comprehensive Education Management**: Complete LMS, Finance, HR, Library, and more
- **🤖 AI-Powered**: Predictive analytics and anomaly detection
- **📊 Business Intelligence**: Real-time dashboards and custom reporting
- **🔄 Workflow Automation**: Visual workflow designer with business rules
- **💬 Real-Time Collaboration**: Chat, video, and team collaboration
- **🔗 Enterprise Integrations**: 9+ major platform integrations
- **📱 Mobile-First**: Native iOS/Android apps with offline support
- **⚡ High Performance**: Event sourcing, CQRS, advanced caching
- **🔒 Enterprise Security**: Multi-factor auth, RBAC, audit trails
- **🚀 Advanced CI/CD**: Automated testing, deployment, and monitoring

## ✨ Key Features

### 🎯 **Core Functionality**
- **Multi-Modal Attendance**: GPS, Face Recognition, BLE Beacons, Manual
- **Leave Management**: Comprehensive leave tracking and approval workflows
- **Time Tracking**: Precise time logging with geofencing
- **Shift Management**: Flexible scheduling and shift assignments
- **Reporting**: Advanced analytics and custom report generation

### 🤖 **AI & Analytics**
- **Predictive Analytics**: Attendance forecasting and trend analysis
- **Anomaly Detection**: Automatic identification of unusual patterns
- **Workforce Intelligence**: Employee engagement and performance insights
- **Risk Assessment**: Absenteeism and turnover prediction

### 🔄 **Workflow & Automation**
- **Visual Workflow Designer**: Drag-and-drop workflow creation
- **Business Rules Engine**: Dynamic rule creation and execution
- **Approval Workflows**: Multi-step approval processes
- **Event-Driven Automation**: Trigger-based process automation

### 💬 **Collaboration**
- **Team Chat**: Real-time messaging with channels and DMs
- **Video Conferencing**: WebRTC-based video calls
- **Screen Sharing**: Remote collaboration capabilities
- **Document Sharing**: Real-time document collaboration

## 🏗️ Architecture

### **Microservices Overview**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   API Gateway   │    │   Frontend      │    │   Mobile Apps   │
│   (Ocelot)      │    │   (React)       │    │ (React Native)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
    ┌────────────────────────────┼────────────────────────────┐
    │                            │                            │
┌───▼───┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
│ Auth  │ │Attendance│ │  Face   │ │  Leave  │ │Analytics│ │Workflow │
│Service│ │ Service │ │Recognition│ │ Mgmt    │ │Service  │ │ Engine  │
└───────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘
```

### **Technology Stack**

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | React 18 + TypeScript | Modern SPA with type safety |
| **Mobile** | React Native 0.72 | Cross-platform native apps |
| **Backend** | .NET 8 + C# | High-performance microservices |
| **Database** | PostgreSQL + Redis | Primary data + caching |
| **Message Queue** | RabbitMQ + MassTransit | Event-driven communication |
| **Caching** | Redis + Varnish + Nginx | Multi-layer performance optimization |
| **Container** | Docker + Kubernetes | Scalable deployment |
| **Monitoring** | Prometheus + Grafana | Comprehensive observability |

## 🚀 Quick Start

### **Prerequisites**
- Docker & Docker Compose
- .NET 8 SDK (for development)
- Node.js 18+ (for development)
- Git

### **1. Clone Repository**
```bash
git clone https://github.com/Alsairy/Waaed.git
cd Waaed
```

### **2. Environment Setup**
```bash
# Copy environment template
cp .env.example .env

# Update configuration (edit with your values)
nano .env
```

### **3. Quick Start with Docker**
```bash
# Start all services
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f
```

### **4. Access Applications**
- **Web App**: http://localhost:3000
- **API Gateway**: http://localhost:5000
- **API Docs**: http://localhost:5000/swagger
- **Monitoring**: http://localhost:3001

### **5. Default Login**
```
Email: admin@waaed.sa
Password: Admin123!
```

## 📱 Mobile Apps

### **Features**
- **Multi-Modal Authentication**: Face, fingerprint, GPS, BLE
- **Offline-First**: Work without internet connectivity
- **Real-Time Sync**: Automatic data synchronization
- **Camera Integration**: Face capture and recognition
- **Location Services**: GPS tracking with geofencing
- **Push Notifications**: Real-time alerts

### **Development Setup**
```bash
# Navigate to mobile app
cd src/mobile/AttendanceMobile

# Install dependencies
npm install

# iOS Development
npx react-native run-ios

# Android Development
npx react-native run-android
```

### **Supported Platforms**
- **iOS 12+**: Native iOS with Face ID integration
- **Android 8+**: Native Android with fingerprint auth

## 🔧 Development

### **Backend Development**
```bash
# Navigate to backend service
cd src/backend/services/Authentication/Waaed.Authentication.Api

# Restore packages
dotnet restore

# Run service
dotnet run

# Run tests
dotnet test
```

### **Frontend Development**
```bash
# Navigate to frontend
cd src/frontend/waaed-frontend

# Install dependencies
npm install

# Start development server
npm start

# Run tests
npm test

# Build for production
npm run build
```

### **Database Setup**
```bash
# Run migrations
dotnet ef database update

# Seed sample data
dotnet run --seed-data

# Test database connectivity
DB_PASSWORD=$DB_PASSWORD DB_NAME=Waaed scripts/check-db-connection.sh
```

## 🚀 Deployment

### **Docker Deployment**
```bash
# Build all images
./scripts/build-and-deploy.sh

# Deploy to production
docker-compose -f docker-compose.production.yml up -d
```

### **Kubernetes Deployment**
```bash
# Apply configurations
kubectl apply -f k8s/

# Check deployment
kubectl get pods -n waaed

# Access via port-forward
kubectl port-forward svc/frontend 3000:3000
```

### **Helm Deployment**
```bash
# Install with Helm
helm install waaed ./helm/waaed

# Upgrade
helm upgrade waaed ./helm/waaed

# Status
helm status waaed
```

## ⚙️ CI/CD Pipeline

### **Advanced CI/CD Features**
Waaed implements a world-class CI/CD pipeline with cutting-edge automation and monitoring:

- **🔄 Multi-Environment Deployments**: Automated deployments to Development, Staging, and Production
- **🛡️ Security-First Approach**: Comprehensive security scanning at every stage
- **⚡ Performance Optimization**: Parallel builds, intelligent caching, and artifact reuse
- **📊 Comprehensive Monitoring**: Real-time monitoring, alerting, and observability
- **🔒 Compliance Automation**: Automated compliance checks and reporting
- **🚨 Disaster Recovery**: Automated backup and restore procedures

### **Workflow Overview**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Code Push     │───▶│   CI Pipeline   │───▶│   Deployment    │
│   (GitHub)      │    │   (Testing)     │    │   (Multi-Env)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Security Scan   │    │ Quality Gates   │    │   Monitoring    │
│ (SAST/DAST)     │    │ (Coverage/Lint) │    │ (Prometheus)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **Pipeline Stages**

#### **1. Build & Test**
- **Parallel Builds**: All microservices build simultaneously
- **Unit Testing**: 80%+ code coverage requirement
- **Integration Testing**: End-to-end API testing
- **Performance Testing**: Load and stress testing

#### **2. Security & Quality**
- **SAST Analysis**: Static application security testing
- **Dependency Scanning**: Vulnerability assessment
- **Container Scanning**: Docker image security
- **Code Quality**: SonarCloud analysis with quality gates

#### **3. Deployment Strategies**
- **Development**: Rolling deployment on every push to `develop`
- **Staging**: Blue-green deployment on merge to `main`
- **Production**: Canary deployment with manual approval

#### **4. Monitoring & Observability**
- **Health Checks**: Automated service health monitoring
- **Performance Metrics**: Real-time performance tracking
- **Log Aggregation**: Centralized logging with ELK stack
- **Alerting**: Slack/email notifications for issues

### **Environment Configuration**

| Environment | Trigger | Strategy | Approval | Monitoring |
|-------------|---------|----------|----------|------------|
| **Development** | Push to `develop` | Rolling | Automatic | Basic |
| **Staging** | Merge to `main` | Blue-Green | Automatic | Full |
| **Production** | Manual trigger | Canary | Required | Enhanced |

### **Workflow Files**
Comprehensive CI/CD workflows located in `.github/workflows/`:

- **[ci-cd-pipeline.yml](.github/workflows/ci-cd-pipeline.yml)** - Main orchestration pipeline
- **[testing.yml](.github/workflows/testing.yml)** - Comprehensive testing suite
- **[security.yml](.github/workflows/security.yml)** - Security scanning and compliance
- **[docker-build.yml](.github/workflows/docker-build.yml)** - Container image building
- **[deploy-dev.yml](.github/workflows/deploy-dev.yml)** - Development deployment
- **[deploy-staging.yml](.github/workflows/deploy-staging.yml)** - Staging deployment
- **[deploy-production.yml](.github/workflows/deploy-production.yml)** - Production deployment
- **[monitoring.yml](.github/workflows/monitoring.yml)** - Monitoring and alerting
- **[database.yml](.github/workflows/database.yml)** - Database migrations

### **Secrets Management**
```bash
# Generate secure secrets for deployment
./scripts/generate-secrets.sh

# Secrets are automatically configured for:
# - Database connections
# - JWT tokens
# - External service APIs
# - Container registry access
```

### **Monitoring Dashboard**
Access comprehensive monitoring at:
- **Grafana**: http://localhost:3001 (Development)
- **Prometheus**: http://localhost:9090 (Metrics)
- **Application Logs**: Centralized via ELK stack

### **Deployment Commands**
```bash
# Manual production deployment
gh workflow run deploy-production.yml

# Check deployment status
gh run list --workflow=ci-cd-pipeline.yml

# View logs
gh run view <run-id> --log
```

## 🔗 Integrations

### **Supported Platforms**
| Platform | Features | Status |
|----------|----------|--------|
| **Microsoft 365** | SSO, Calendar, Teams, OneDrive | ✅ Complete |
| **Google Workspace** | SSO, Gmail, Calendar, Drive | ✅ Complete |
| **Salesforce** | CRM, Contacts, Opportunities | ✅ Complete |
| **Slack** | Messaging, Notifications | ✅ Complete |
| **Zoom** | Video Conferencing | ✅ Complete |
| **DocuSign** | E-Signatures | ✅ Complete |
| **Jira** | Project Management | ✅ Complete |
| **Tableau** | Data Visualization | ✅ Complete |
| **Power BI** | Business Intelligence | ✅ Complete |

## 📊 Analytics

### **AI-Powered Insights**
- **Attendance Forecasting**: Predict future attendance patterns
- **Anomaly Detection**: Identify unusual behavior automatically
- **Performance Analytics**: Employee engagement scoring
- **Risk Assessment**: Turnover and absenteeism prediction

### **Business Intelligence**
- **Real-Time Dashboards**: Live KPI monitoring
- **Custom Reports**: Drag-and-drop report builder
- **Data Export**: Excel, PDF, CSV formats
- **Scheduled Reports**: Automated report delivery

## 🔒 Security

### **Authentication & Authorization**
- **Multi-Factor Authentication**: SMS, Email, App-based 2FA
- **Single Sign-On**: Enterprise identity provider integration
- **Role-Based Access Control**: Granular permission management
- **Session Management**: Secure session handling

### **Data Protection**
- **Encryption**: AES-256 for data at rest and in transit
- **GDPR Compliance**: Data protection and privacy controls
- **Audit Trails**: Comprehensive activity logging
- **Vulnerability Scanning**: Regular security assessments

## 📚 Documentation

### **Available Documentation**
- **[API Documentation](docs/API_DOCUMENTATION.md)**: Complete REST API reference
- **[Deployment Guide](docs/DEPLOYMENT_GUIDE.md)**: Production deployment instructions
- **[User Manual](docs/USER_MANUAL.md)**: End-user documentation
- **[Testing Report](docs/TESTING_REPORT.md)**: Comprehensive testing validation
- **[Architecture Guide](docs/ARCHITECTURE.md)**: Technical architecture details

### **Interactive API Docs**
Visit http://localhost:5000/swagger for interactive API documentation with live testing capabilities.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### **Quick Contribution Steps**
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### **Development Guidelines**
- Follow existing code style and conventions
- Add tests for new functionality
- Update documentation for API changes
- Ensure all tests pass before submitting PR

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support & Community

### **Getting Help**
- **📖 Documentation**: Comprehensive guides and API reference
- **🐛 Issues**: [GitHub Issues](https://github.com/Alsairy/Waaed/issues) for bug reports
- **💬 Discussions**: [GitHub Discussions](https://github.com/Alsairy/Waaed/discussions) for Q&A
- **📧 Email**: support@waaed.sa for enterprise support

### **Community**
- **⭐ Star** this repository if you find it useful
- **🍴 Fork** to contribute or customize for your needs
- **📢 Share** with others who might benefit

---

## 🌟 **Ready to Transform Your Workforce Management?**

Waaed combines cutting-edge technology with enterprise-grade reliability to deliver a comprehensive educational management solution. Whether you're a startup or enterprise, Waaed scales with your needs.

**[Get Started Today →](docs/getting-started.md)**

---
![CodeRabbit Pull Request Reviews](https://img.shields.io/coderabbit/prs/github/Alsairy/AttendancePro?utm_source=oss&utm_medium=github&utm_campaign=Alsairy%2FAttendancePro&labelColor=171717&color=FF570A&link=https%3A%2F%2Fcoderabbit.ai&label=CodeRabbit+Reviews)

<div align="center">

**Built with ❤️ by the Waaed Team**

[Website](https://waaed.sa) • [Documentation](docs/) • [API Reference](docs/api/) • [Support](mailto:support@waaed.sa)

</div>

