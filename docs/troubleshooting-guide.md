# Troubleshooting Guide

## Database Connection Issues

### Diagnostic Steps

Check if the database password is set in your environment:
```bash
grep DB_PASSWORD .env.production
```

Check the SQL Server container logs:
```bash
docker-compose logs sql-server
```

Use the database connection helper script to test connectivity:
```bash
DB_PASSWORD=$DB_PASSWORD \
DB_NAME=Waaed \
scripts/check-db-connection.sh
```

### Common Issues

#### Authentication Service Startup Failures
- Check that JWT_SECRET_KEY is properly set
- Verify database connection string is correct
- Ensure SQL Server container is healthy

#### Database Connection Errors
- Verify DB_PASSWORD environment variable is set
- Check SQL Server container status
- Test connection using the helper script

## Program.cs Configuration

The authentication service Program.cs includes the following key components:

- JWT configuration reads from environment variables
- Database context registered with SQL Server  
- Dependency injection for authentication services
- Database migration with error handling
- Authentication services properly registered

**Last Updated**: July 15, 2025
