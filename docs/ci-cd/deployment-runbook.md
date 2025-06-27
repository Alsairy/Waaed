# 🚀 Waaed Platform - Deployment Runbook

## Overview
This runbook provides step-by-step instructions for deploying the Waaed platform across different environments using our advanced CI/CD pipeline.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Environment Overview](#environment-overview)
- [Deployment Procedures](#deployment-procedures)
- [Rollback Procedures](#rollback-procedures)
- [Health Checks](#health-checks)
- [Troubleshooting](#troubleshooting)
- [Emergency Procedures](#emergency-procedures)

## Prerequisites

### Required Tools
- GitHub CLI (`gh`) - for workflow management
- Docker - for local testing
- kubectl - for Kubernetes operations
- Helm - for chart deployments
- Azure CLI / AWS CLI - for cloud resources

### Required Access
- GitHub repository write access
- Kubernetes cluster access (dev/staging/prod)
- Container registry access (ghcr.io)
- Cloud provider access (Azure/AWS)
- Monitoring systems access (Grafana/Prometheus)

### Environment Variables
```bash
# GitHub
GITHUB_TOKEN=<your_github_token>

# Kubernetes
KUBECONFIG=<path_to_kubeconfig>

# Container Registry
REGISTRY_USERNAME=<username>
REGISTRY_PASSWORD=<password>

# Cloud Provider
AZURE_CLIENT_ID=<client_id>
AZURE_CLIENT_SECRET=<client_secret>
AZURE_TENANT_ID=<tenant_id>
```

## Environment Overview

### Development Environment
- **Trigger**: Automatic on push to `develop` branch
- **Strategy**: Rolling deployment
- **Approval**: None required
- **Monitoring**: Basic health checks
- **URL**: https://dev.waaed.com

### Staging Environment
- **Trigger**: Automatic on merge to `main` branch
- **Strategy**: Blue-green deployment
- **Approval**: None required
- **Monitoring**: Full monitoring suite
- **URL**: https://staging.waaed.com

### Production Environment
- **Trigger**: Manual workflow dispatch
- **Strategy**: Canary deployment
- **Approval**: Required (2 approvers)
- **Monitoring**: Enhanced monitoring with alerting
- **URL**: https://waaed.com

## Deployment Procedures

### 1. Development Deployment

#### Automatic Deployment
Development deployments happen automatically when code is pushed to the `develop` branch.

```bash
# Check deployment status
gh run list --workflow=deploy-dev.yml --limit=5

# View specific deployment logs
gh run view <run-id> --log
```

#### Manual Development Deployment
```bash
# Trigger manual deployment
gh workflow run deploy-dev.yml

# Monitor deployment
gh run watch
```

### 2. Staging Deployment

#### Automatic Deployment
Staging deployments happen automatically when PRs are merged to the `main` branch.

```bash
# Check staging deployment status
gh run list --workflow=deploy-staging.yml --limit=5

# View deployment details
gh run view <run-id>
```

#### Manual Staging Deployment
```bash
# Trigger manual staging deployment
gh workflow run deploy-staging.yml

# Check blue-green deployment status
kubectl get deployments -n waaed-staging
kubectl get services -n waaed-staging
```

### 3. Production Deployment

#### Pre-deployment Checklist
- [ ] All staging tests pass
- [ ] Security scans complete with no critical issues
- [ ] Performance tests meet SLA requirements
- [ ] Database migrations tested in staging
- [ ] Rollback plan prepared
- [ ] Monitoring alerts configured
- [ ] Team notified of deployment window

#### Production Deployment Steps

1. **Initiate Deployment**
```bash
# Trigger production deployment
gh workflow run deploy-production.yml \
  --field environment=production \
  --field deployment_strategy=canary
```

2. **Monitor Canary Deployment**
```bash
# Check canary deployment status
kubectl get deployments -n waaed-prod
kubectl get pods -n waaed-prod -l version=canary

# Monitor canary metrics
kubectl port-forward svc/grafana 3000:3000 -n monitoring
# Open http://localhost:3000 and check canary dashboard
```

3. **Validate Canary Health**
```bash
# Run health checks
curl -f https://waaed.com/health
curl -f https://waaed.com/api/health

# Check application metrics
kubectl top pods -n waaed-prod
```

4. **Promote Canary (if healthy)**
```bash
# Promote canary to full deployment
gh workflow run deploy-production.yml \
  --field environment=production \
  --field deployment_strategy=promote_canary
```

5. **Post-deployment Verification**
```bash
# Verify all services are running
kubectl get pods -n waaed-prod
kubectl get services -n waaed-prod

# Check application logs
kubectl logs -f deployment/frontend -n waaed-prod
kubectl logs -f deployment/api-gateway -n waaed-prod
```

## Rollback Procedures

### Automatic Rollback
Our CI/CD pipeline includes automatic rollback triggers:
- Health check failures for 5+ minutes
- Error rate > 5% for 3+ minutes
- Response time > 2s for 5+ minutes

### Manual Rollback

#### Quick Rollback (Kubernetes)
```bash
# Rollback to previous version
kubectl rollout undo deployment/frontend -n waaed-prod
kubectl rollout undo deployment/api-gateway -n waaed-prod

# Check rollback status
kubectl rollout status deployment/frontend -n waaed-prod
```

#### Full Rollback (Helm)
```bash
# List helm releases
helm list -n waaed-prod

# Rollback to previous release
helm rollback waaed -n waaed-prod

# Verify rollback
helm status waaed -n waaed-prod
```

#### Database Rollback
```bash
# Run database rollback migration
kubectl exec -it deployment/api-gateway -n waaed-prod -- \
  dotnet ef database update <previous_migration>
```

## Health Checks

### Application Health Endpoints
```bash
# Frontend health
curl -f https://waaed.com/health

# API Gateway health
curl -f https://waaed.com/api/health

# Individual service health
curl -f https://waaed.com/api/lms/health
curl -f https://waaed.com/api/finance/health
curl -f https://waaed.com/api/hr/health
```

### Infrastructure Health
```bash
# Kubernetes cluster health
kubectl get nodes
kubectl get pods --all-namespaces

# Database connectivity
kubectl exec -it deployment/api-gateway -n waaed-prod -- \
  dotnet ef database update --dry-run

# Redis connectivity
kubectl exec -it deployment/redis -n waaed-prod -- redis-cli ping
```

### Monitoring Dashboards
- **Grafana**: https://monitoring.waaed.com/grafana
- **Prometheus**: https://monitoring.waaed.com/prometheus
- **Application Insights**: https://portal.azure.com

## Troubleshooting

### Common Issues

#### 1. Deployment Stuck in Pending
```bash
# Check pod status
kubectl describe pods -n waaed-prod

# Check resource constraints
kubectl top nodes
kubectl describe nodes

# Check image pull issues
kubectl get events -n waaed-prod --sort-by='.lastTimestamp'
```

#### 2. Service Unavailable
```bash
# Check service endpoints
kubectl get endpoints -n waaed-prod

# Check ingress configuration
kubectl describe ingress -n waaed-prod

# Check DNS resolution
nslookup waaed.com
```

#### 3. Database Connection Issues
```bash
# Check database pod status
kubectl get pods -n waaed-prod -l app=database

# Check database logs
kubectl logs -f deployment/database -n waaed-prod

# Test database connectivity
kubectl exec -it deployment/api-gateway -n waaed-prod -- \
  dotnet ef database update --dry-run
```

#### 4. High Memory/CPU Usage
```bash
# Check resource usage
kubectl top pods -n waaed-prod
kubectl top nodes

# Scale deployment if needed
kubectl scale deployment frontend --replicas=5 -n waaed-prod

# Check for memory leaks
kubectl exec -it <pod-name> -n waaed-prod -- top
```

### Log Analysis
```bash
# Aggregate logs from all pods
kubectl logs -f -l app=frontend -n waaed-prod

# Search for errors
kubectl logs -f deployment/api-gateway -n waaed-prod | grep ERROR

# Export logs for analysis
kubectl logs deployment/frontend -n waaed-prod --since=1h > frontend-logs.txt
```

## Emergency Procedures

### Critical System Failure

1. **Immediate Response**
```bash
# Scale down to prevent further damage
kubectl scale deployment --all --replicas=0 -n waaed-prod

# Enable maintenance mode
kubectl apply -f k8s/maintenance-mode.yaml
```

2. **Incident Communication**
```bash
# Post to status page
curl -X POST https://api.statuspage.io/v1/pages/PAGE_ID/incidents \
  -H "Authorization: OAuth TOKEN" \
  -d "incident[name]=Critical System Failure" \
  -d "incident[status]=investigating"

# Notify team via Slack
curl -X POST -H 'Content-type: application/json' \
  --data '{"text":"🚨 CRITICAL: Production system failure detected"}' \
  $SLACK_WEBHOOK_URL
```

3. **Recovery Steps**
```bash
# Restore from backup
./scripts/restore.sh --environment=production --backup-id=<latest>

# Verify restoration
curl -f https://waaed.com/health

# Scale services back up
kubectl scale deployment --all --replicas=3 -n waaed-prod
```

### Security Incident

1. **Immediate Isolation**
```bash
# Block external traffic
kubectl patch ingress waaed-ingress -n waaed-prod \
  -p '{"spec":{"rules":[]}}'

# Scale down affected services
kubectl scale deployment <affected-service> --replicas=0 -n waaed-prod
```

2. **Investigation**
```bash
# Export logs for forensics
kubectl logs --all-containers=true --since=24h -n waaed-prod > security-incident-logs.txt

# Check for suspicious activity
grep -i "unauthorized\|breach\|attack" security-incident-logs.txt
```

3. **Recovery**
```bash
# Apply security patches
gh workflow run security.yml --field emergency_patch=true

# Rotate secrets
./scripts/generate-secrets.sh --rotate-all

# Restore services
kubectl scale deployment --all --replicas=3 -n waaed-prod
```

## Monitoring and Alerting

### Key Metrics to Monitor
- **Response Time**: < 500ms (95th percentile)
- **Error Rate**: < 1%
- **Availability**: > 99.9%
- **CPU Usage**: < 70%
- **Memory Usage**: < 80%
- **Disk Usage**: < 85%

### Alert Escalation
1. **Level 1**: Automated recovery attempts
2. **Level 2**: On-call engineer notification
3. **Level 3**: Team lead escalation
4. **Level 4**: Management escalation

### Contact Information
- **On-call Engineer**: +1-XXX-XXX-XXXX
- **Team Lead**: +1-XXX-XXX-XXXX
- **DevOps Team**: devops@waaed.com
- **Emergency Hotline**: +1-XXX-XXX-XXXX

## Post-Deployment Tasks

### Verification Checklist
- [ ] All services healthy and responding
- [ ] Database migrations completed successfully
- [ ] Monitoring alerts configured and working
- [ ] Performance metrics within acceptable ranges
- [ ] Security scans show no new vulnerabilities
- [ ] User acceptance testing completed
- [ ] Documentation updated
- [ ] Team notified of successful deployment

### Cleanup Tasks
```bash
# Clean up old container images
docker system prune -f

# Remove old Kubernetes resources
kubectl delete pods --field-selector=status.phase=Succeeded -n waaed-prod

# Archive old logs
kubectl logs deployment/frontend -n waaed-prod --since=24h > logs/$(date +%Y%m%d)-frontend.log
```

---

**Last Updated**: $(date)
**Version**: 1.0
**Maintained by**: DevOps Team
