# Workflow Templates and Reusable Actions

This directory contains reusable GitHub Actions composite actions and workflow templates for the Waaed platform.

## Composite Actions

### 1. Build .NET Service (`build-dotnet-service/action.yml`)
Builds a .NET microservice with caching, testing, and optimization.

**Usage:**
```yaml
- name: Build .NET Service
  uses: ./.github/workflows/templates/build-dotnet-service
  with:
    service-name: 'MyService'
    service-path: 'src/backend/services/MyService'
    dotnet-version: '8.0.x'
    configuration: 'Release'
    enable-tests: 'true'
    enable-sonar: 'false'
```

### 2. Build Frontend Application (`build-frontend/action.yml`)
Builds a React/TypeScript frontend application with optimization.

**Usage:**
```yaml
- name: Build Frontend Application
  uses: ./.github/workflows/templates/build-frontend
  with:
    app-name: 'MyApp'
    app-path: 'frontend/my-app'
    node-version: '18.x'
    package-manager: 'npm'
    build-command: 'build'
    enable-tests: 'true'
    enable-lint: 'true'
```

### 3. Run Comprehensive Tests (`run-tests/action.yml`)
Runs unit, integration, and end-to-end tests with coverage reporting.

**Usage:**
```yaml
- name: Run Comprehensive Tests
  uses: ./.github/workflows/templates/run-tests
  with:
    test-type: 'all'
    project-path: 'src/backend/services/MyService'
    dotnet-version: '8.0.x'
    coverage-threshold: '80'
    enable-mutation-testing: 'false'
    parallel-execution: 'true'
```

### 4. Deploy Service (`deploy-service/action.yml`)
Deploys a microservice to Kubernetes using Helm with advanced deployment strategies.

**Usage:**
```yaml
- name: Deploy Service
  uses: ./.github/workflows/templates/deploy-service
  with:
    service-name: 'MyService'
    environment: 'production'
    image-tag: 'v1.0.0'
    deployment-strategy: 'blue-green'
    namespace: 'waaed-prod'
    helm-chart-path: './helm/waaed'
    enable-health-checks: 'true'
    rollback-on-failure: 'true'
    wait-timeout: '600'
```

### 5. Security Scanning (`security-scan/action.yml`)
Performs comprehensive security scanning including SAST, dependency check, and container scanning.

**Usage:**
```yaml
- name: Run Security Scan
  uses: ./.github/workflows/templates/security-scan
  with:
    scan-type: 'all'
    project-path: 'src/backend/services/MyService'
    language: 'csharp'
    severity-threshold: 'medium'
    fail-on-findings: 'true'
    docker-image: 'myservice:latest'
```

## Workflow Templates

### 1. New Service Template (`new-service-template.yml`)
Complete CI/CD workflow template for new .NET microservices.

**Features:**
- Automated building and testing using composite actions
- Security scanning
- Docker image building
- Multi-environment deployment (dev/staging/prod)
- Slack notifications

**To use this template:**
1. Copy `new-service-template.yml` to `.github/workflows/`
2. Rename the file to match your service (e.g., `my-service-ci-cd.yml`)
3. Replace `NEW_SERVICE_NAME` with your actual service name
4. Update the `SERVICE_PATH` to point to your service directory
5. Customize environment variables and deployment settings

### 2. New Frontend Template (`new-frontend-template.yml`)
Complete CI/CD workflow template for new frontend applications.

**Features:**
- Frontend building and testing using composite actions
- Security scanning for dependencies
- Docker image building with Nginx
- Multi-environment deployment
- Slack notifications

**To use this template:**
1. Copy `new-frontend-template.yml` to `.github/workflows/`
2. Rename the file to match your app (e.g., `my-app-ci-cd.yml`)
3. Replace `NEW_FRONTEND_NAME` with your actual app name
4. Update the `APP_PATH` to point to your app directory
5. Customize package manager and build settings

## Best Practices

### Composite Action Development
1. **Input Validation**: Always validate required inputs and provide sensible defaults
2. **Output Generation**: Provide meaningful outputs that can be used by calling workflows
3. **Error Handling**: Include proper error handling and cleanup steps
4. **Documentation**: Document all inputs, outputs, and usage examples
5. **Testing**: Test composite actions in isolation before using in workflows

### Workflow Template Usage
1. **Customization**: Always customize templates for your specific service/app needs
2. **Environment Variables**: Use environment variables for configuration that changes between services
3. **Secrets Management**: Use GitHub secrets for sensitive information
4. **Path Filters**: Use path filters to trigger workflows only when relevant files change
5. **Notifications**: Configure appropriate notification channels for your team

### Security Considerations
1. **Least Privilege**: Grant minimum necessary permissions to workflows
2. **Secret Rotation**: Regularly rotate secrets and tokens
3. **Dependency Scanning**: Always include dependency vulnerability scanning
4. **Container Scanning**: Scan Docker images for vulnerabilities
5. **Code Analysis**: Include static code analysis in your workflows

## Integration with Existing Workflows

These templates and composite actions are designed to integrate seamlessly with the existing Waaed platform CI/CD infrastructure:

- **Environment Protection**: Works with GitHub environment protection rules
- **Approval Gates**: Supports manual approval for production deployments
- **Monitoring**: Integrates with monitoring and alerting systems
- **Notifications**: Sends notifications to configured Slack channels
- **Artifact Management**: Properly handles build artifacts and Docker images

## Troubleshooting

### Common Issues
1. **Permission Errors**: Ensure the workflow has necessary permissions for the actions it performs
2. **Path Issues**: Verify that service/app paths are correct relative to repository root
3. **Secret Access**: Ensure required secrets are configured in repository/environment settings
4. **Dependency Conflicts**: Check for conflicting dependencies in composite actions

### Debugging Tips
1. **Enable Debug Logging**: Set `ACTIONS_STEP_DEBUG` secret to `true` for detailed logs
2. **Test Locally**: Use `act` or similar tools to test workflows locally
3. **Incremental Testing**: Test composite actions individually before using in full workflows
4. **Review Logs**: Always review workflow logs for detailed error information

## Contributing

When adding new composite actions or templates:

1. Follow the established naming conventions
2. Include comprehensive documentation
3. Add usage examples
4. Test thoroughly in different scenarios
5. Update this README with new additions
