# 🔧 Waaed Platform - CI/CD Troubleshooting Guide

## Overview
This guide provides comprehensive troubleshooting procedures for the Waaed platform's CI/CD pipeline, covering common issues, diagnostic steps, and resolution strategies.

## Table of Contents
- [Pipeline Failures](#pipeline-failures)
- [Build Issues](#build-issues)
- [Test Failures](#test-failures)
- [Security Scan Issues](#security-scan-issues)
- [Deployment Problems](#deployment-problems)
- [Infrastructure Issues](#infrastructure-issues)
- [Performance Problems](#performance-problems)
- [Monitoring and Alerting](#monitoring-and-alerting)

## Pipeline Failures

### Workflow Not Triggering

#### Symptoms
- GitHub Actions workflow doesn't start after push/PR
- No workflow runs visible in Actions tab

#### Diagnostic Steps
```bash
# Check workflow file syntax
yamllint .github/workflows/*.yml

# Verify workflow triggers
cat .github/workflows/ci-cd-pipeline.yml | grep -A 10 "on:"

# Check repository settings
gh repo view --json defaultBranch,visibility
```

#### Common Causes & Solutions

1. **Incorrect Branch Names**
```yaml
# ❌ Wrong
on:
  push:
    branches: [ master ]  # Should be 'main'

# ✅ Correct
on:
  push:
    branches: [ main, develop ]
```

2. **Path Filters Too Restrictive**
```yaml
# ❌ Too restrictive
on:
  push:
    paths: [ 'src/specific-service/**' ]

# ✅ Better
on:
  push:
    paths: [ 'src/**', '.github/workflows/**' ]
```

3. **Workflow File Location**
```bash
# Ensure workflows are in correct location
ls -la .github/workflows/
# Files must be in .github/workflows/ directory
```

### Workflow Permissions Issues

#### Symptoms
- "Permission denied" errors in workflow logs
- Unable to push to registry or deploy

#### Diagnostic Steps
```bash
# Check repository permissions
gh api repos/:owner/:repo/actions/permissions

# Verify GITHUB_TOKEN permissions
gh api repos/:owner/:repo/actions/permissions/access
```

#### Solutions
```yaml
# Add explicit permissions to workflow
permissions:
  contents: read
  packages: write
  deployments: write
  id-token: write
```

## Build Issues

### .NET Build Failures

#### Symptoms
- Compilation errors in CI but not locally
- Missing dependencies or packages

#### Diagnostic Steps
```bash
# Check .NET version consistency
grep -r "TargetFramework" src/**/*.csproj
grep -r "dotnet-version" .github/workflows/*.yml

# Verify package references
find src/ -name "*.csproj" -exec grep -l "PackageReference" {} \;
```

#### Common Solutions

1. **Version Mismatch**
```yaml
# Ensure consistent .NET version
- name: Setup .NET
  uses: actions/setup-dotnet@v3
  with:
    dotnet-version: '8.0.x'  # Match project files
```

2. **Missing NuGet Packages**
```bash
# Add explicit restore step
- name: Restore dependencies
  run: dotnet restore --verbosity normal
```

3. **Build Configuration Issues**
```bash
# Use explicit configuration
- name: Build
  run: dotnet build --configuration Release --no-restore
```

### Frontend Build Failures

#### Symptoms
- Node.js/npm build errors
- Missing dependencies or version conflicts

#### Diagnostic Steps
```bash
# Check Node.js version requirements
cat frontend/*/package.json | grep -A 5 "engines"
cat .github/workflows/*.yml | grep -A 5 "node-version"

# Verify package-lock.json consistency
npm ls --depth=0
```

#### Common Solutions

1. **Node.js Version Mismatch**
```yaml
- name: Setup Node.js
  uses: actions/setup-node@v3
  with:
    node-version: '18.x'  # Match local development
    cache: 'npm'
```

2. **Dependency Issues**
```bash
# Clear cache and reinstall
- name: Clean install
  run: |
    rm -rf node_modules package-lock.json
    npm install
```

### Docker Build Issues

#### Symptoms
- Docker build failures in CI
- Image size too large
- Layer caching not working

#### Diagnostic Steps
```bash
# Check Dockerfile syntax
docker build --dry-run -f Dockerfile .

# Verify base image availability
docker pull mcr.microsoft.com/dotnet/aspnet:8.0

# Check build context size
du -sh . --exclude=.git
```

#### Common Solutions

1. **Multi-stage Build Optimization**
```dockerfile
# Use multi-stage builds
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY *.csproj .
RUN dotnet restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /src/out .
```

2. **Build Context Optimization**
```dockerignore
# Add .dockerignore
node_modules
.git
*.md
tests/
docs/
```

## Test Failures

### Unit Test Issues

#### Symptoms
- Tests pass locally but fail in CI
- Flaky test results
- Test timeouts

#### Diagnostic Steps
```bash
# Run tests with verbose output
dotnet test --verbosity detailed --logger trx

# Check test parallelization
grep -r "ParallelizationMode" tests/
```

#### Common Solutions

1. **Environment Dependencies**
```csharp
// Use test-specific configuration
[Fact]
public void TestMethod()
{
    var config = new ConfigurationBuilder()
        .AddInMemoryCollection(new Dictionary<string, string>
        {
            ["ConnectionString"] = "InMemoryDatabase"
        })
        .Build();
}
```

2. **Timing Issues**
```csharp
// Add proper waits for async operations
await Task.Delay(100); // Instead of Thread.Sleep
```

### Integration Test Failures

#### Symptoms
- Database connection failures
- Service dependency issues
- Network timeouts

#### Diagnostic Steps
```bash
# Check test database setup
docker ps | grep test-db
docker logs test-db

# Verify service health
curl -f http://localhost:8080/health
```

#### Solutions

1. **Test Database Setup**
```yaml
services:
  test-db:
    image: postgres:13
    env:
      POSTGRES_PASSWORD: test
    options: >-
      --health-cmd pg_isready
      --health-interval 10s
      --health-timeout 5s
      --health-retries 5
```

2. **Service Dependencies**
```bash
# Wait for services to be ready
- name: Wait for services
  run: |
    timeout 60 bash -c 'until curl -f http://localhost:8080/health; do sleep 2; done'
```

## Security Scan Issues

### Vulnerability Scan Failures

#### Symptoms
- High/critical vulnerabilities detected
- False positive security alerts
- Scan timeouts

#### Diagnostic Steps
```bash
# Check vulnerability details
gh api repos/:owner/:repo/security-advisories

# Review dependency tree
npm audit --audit-level high
dotnet list package --vulnerable
```

#### Solutions

1. **Update Dependencies**
```bash
# Update vulnerable packages
npm update
dotnet add package <PackageName> --version <LatestVersion>
```

2. **Suppress False Positives**
```yaml
# Add to security workflow
- name: Security Scan
  uses: securecodewarrior/github-action-add-sarif@v1
  with:
    sarif-file: security-scan.sarif
    suppress-rules: 'CWE-79,CWE-89'  # Suppress specific rules
```

### Container Security Issues

#### Symptoms
- Base image vulnerabilities
- Exposed secrets in images
- Insecure configurations

#### Solutions

1. **Use Minimal Base Images**
```dockerfile
# Use distroless or alpine images
FROM mcr.microsoft.com/dotnet/aspnet:8.0-alpine
```

2. **Multi-stage Builds**
```dockerfile
# Don't include build tools in final image
FROM sdk AS build
FROM runtime AS final
COPY --from=build /app .
```

## Deployment Problems

### Kubernetes Deployment Issues

#### Symptoms
- Pods stuck in pending state
- Image pull errors
- Resource constraints

#### Diagnostic Steps
```bash
# Check pod status
kubectl describe pods -n waaed-prod

# Check events
kubectl get events -n waaed-prod --sort-by='.lastTimestamp'

# Check resource usage
kubectl top nodes
kubectl top pods -n waaed-prod
```

#### Solutions

1. **Resource Constraints**
```yaml
# Adjust resource requests/limits
resources:
  requests:
    memory: "256Mi"
    cpu: "250m"
  limits:
    memory: "512Mi"
    cpu: "500m"
```

2. **Image Pull Issues**
```bash
# Check image registry access
kubectl create secret docker-registry regcred \
  --docker-server=ghcr.io \
  --docker-username=$GITHUB_ACTOR \
  --docker-password=$GITHUB_TOKEN
```

### Helm Deployment Failures

#### Symptoms
- Chart validation errors
- Template rendering issues
- Release conflicts

#### Diagnostic Steps
```bash
# Validate chart
helm lint ./helm/waaed

# Test template rendering
helm template waaed ./helm/waaed --debug

# Check release status
helm status waaed -n waaed-prod
```

#### Solutions

1. **Chart Validation**
```bash
# Fix chart issues
helm lint ./helm/waaed --strict
```

2. **Template Debugging**
```yaml
# Add debug information
{{- if .Values.debug }}
# Debug: {{ .Values | toYaml | nindent 2 }}
{{- end }}
```

## Infrastructure Issues

### Cloud Provider Problems

#### Symptoms
- Authentication failures
- Resource quota exceeded
- Network connectivity issues

#### Diagnostic Steps
```bash
# Check cloud provider authentication
az account show  # Azure
aws sts get-caller-identity  # AWS

# Check quotas
az vm list-usage --location eastus
aws service-quotas list-service-quotas --service-code ec2
```

#### Solutions

1. **Authentication Issues**
```yaml
# Use proper authentication method
- name: Azure Login
  uses: azure/login@v1
  with:
    creds: ${{ secrets.AZURE_CREDENTIALS }}
```

2. **Quota Management**
```bash
# Request quota increase
az support tickets create \
  --ticket-name "Increase VM quota" \
  --issue-type "quota"
```

### Network Configuration Issues

#### Symptoms
- Service discovery failures
- Load balancer issues
- DNS resolution problems

#### Diagnostic Steps
```bash
# Check service endpoints
kubectl get endpoints -n waaed-prod

# Test DNS resolution
nslookup waaed.com
dig @8.8.8.8 waaed.com

# Check ingress configuration
kubectl describe ingress -n waaed-prod
```

#### Solutions

1. **Service Configuration**
```yaml
# Ensure proper service configuration
apiVersion: v1
kind: Service
metadata:
  name: frontend
spec:
  selector:
    app: frontend
  ports:
  - port: 80
    targetPort: 3000
```

2. **Ingress Setup**
```yaml
# Configure ingress properly
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: waaed-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  rules:
  - host: waaed.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend
            port:
              number: 80
```

## Performance Problems

### Build Performance Issues

#### Symptoms
- Long build times
- Excessive resource usage
- Cache misses

#### Solutions

1. **Optimize Docker Builds**
```yaml
- name: Build Docker image
  uses: docker/build-push-action@v4
  with:
    context: .
    cache-from: type=gha
    cache-to: type=gha,mode=max
```

2. **Parallel Builds**
```yaml
strategy:
  matrix:
    service: [frontend, api-gateway, lms, finance]
  max-parallel: 4
```

### Runtime Performance Issues

#### Symptoms
- High response times
- Memory leaks
- CPU spikes

#### Diagnostic Steps
```bash
# Check application metrics
kubectl top pods -n waaed-prod

# Monitor resource usage
kubectl exec -it <pod-name> -- top
kubectl exec -it <pod-name> -- free -h
```

#### Solutions

1. **Resource Optimization**
```yaml
# Adjust resource limits
resources:
  requests:
    memory: "512Mi"
    cpu: "500m"
  limits:
    memory: "1Gi"
    cpu: "1000m"
```

2. **Horizontal Pod Autoscaling**
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: frontend-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: frontend
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

## Monitoring and Alerting

### Missing Metrics

#### Symptoms
- No data in Grafana dashboards
- Prometheus targets down
- Alert rules not firing

#### Diagnostic Steps
```bash
# Check Prometheus targets
kubectl port-forward svc/prometheus 9090:9090 -n monitoring
# Open http://localhost:9090/targets

# Check metric endpoints
curl http://localhost:8080/metrics
```

#### Solutions

1. **Metric Endpoint Configuration**
```csharp
// Add metrics endpoint to .NET services
app.UseRouting();
app.UseEndpoints(endpoints =>
{
    endpoints.MapMetrics();
    endpoints.MapControllers();
});
```

2. **ServiceMonitor Configuration**
```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: waaed-metrics
spec:
  selector:
    matchLabels:
      app: waaed
  endpoints:
  - port: metrics
    path: /metrics
```

### Alert Configuration Issues

#### Symptoms
- Alerts not firing when they should
- Too many false positive alerts
- Missing alert notifications

#### Solutions

1. **Alert Rule Tuning**
```yaml
# Adjust alert thresholds
- alert: HighErrorRate
  expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
  for: 2m  # Wait 2 minutes before firing
  labels:
    severity: warning
```

2. **Notification Configuration**
```yaml
# Configure alert manager
route:
  group_by: ['alertname']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 1h
  receiver: 'web.hook'
receivers:
- name: 'web.hook'
  slack_configs:
  - api_url: 'SLACK_WEBHOOK_URL'
    channel: '#alerts'
```

## Emergency Procedures

### Complete System Failure

1. **Immediate Actions**
```bash
# Enable maintenance mode
kubectl apply -f k8s/maintenance-mode.yaml

# Scale down all services
kubectl scale deployment --all --replicas=0 -n waaed-prod
```

2. **Communication**
```bash
# Update status page
curl -X POST https://api.statuspage.io/v1/pages/PAGE_ID/incidents

# Notify team
curl -X POST -H 'Content-type: application/json' \
  --data '{"text":"🚨 EMERGENCY: System failure"}' \
  $SLACK_WEBHOOK_URL
```

3. **Recovery**
```bash
# Restore from backup
./scripts/restore.sh --environment=production

# Verify and scale up
kubectl scale deployment --all --replicas=3 -n waaed-prod
```

## Contact Information

### Escalation Path
1. **Level 1**: On-call Engineer
2. **Level 2**: Team Lead
3. **Level 3**: Engineering Manager
4. **Level 4**: CTO

### Emergency Contacts
- **On-call**: +1-XXX-XXX-XXXX
- **DevOps Team**: devops@waaed.com
- **Emergency Hotline**: +1-XXX-XXX-XXXX

---

**Last Updated**: $(date)
**Version**: 1.0
**Maintained by**: DevOps Team
