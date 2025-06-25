# Hudur Platform API Documentation

## Overview

Hudur is a comprehensive enterprise workforce management platform that provides advanced attendance tracking, leave management, analytics, and compliance features. This document outlines the complete API reference for all microservices.

## Base URL
```
https://api.hudur.sa/api
```

## Authentication

All API endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Core Services

### Authentication Service
**Base Path:** `/auth`

#### Endpoints

**POST /auth/login**
- Description: Authenticate user and receive JWT token
- Request Body:
```json
{
  "email": "user@company.com",
  "password": "securepassword",
  "tenantId": "tenant-uuid"
}
```
- Response:
```json
{
  "token": "jwt-token",
  "refreshToken": "refresh-token",
  "user": {
    "id": "user-uuid",
    "email": "user@company.com",
    "role": "admin|manager|employee"
  }
}
```

**POST /auth/register**
- Description: Register new user account
- Request Body:
```json
{
  "email": "user@company.com",
  "password": "securepassword",
  "firstName": "John",
  "lastName": "Doe",
  "tenantId": "tenant-uuid"
}
```

**POST /auth/refresh**
- Description: Refresh JWT token using refresh token
- Request Body:
```json
{
  "refreshToken": "refresh-token"
}
```

**POST /auth/two-factor/enable**
- Description: Enable two-factor authentication
- Request Body:
```json
{
  "phoneNumber": "+1234567890"
}
```

### Attendance Service
**Base Path:** `/attendance`

#### Endpoints

**POST /attendance/check-in**
- Description: Record employee check-in
- Request Body:
```json
{
  "location": {
    "latitude": 40.7128,
    "longitude": -74.0060
  },
  "method": "gps|beacon|face|manual",
  "biometricData": "base64-encoded-data"
}
```

**POST /attendance/check-out**
- Description: Record employee check-out
- Request Body:
```json
{
  "location": {
    "latitude": 40.7128,
    "longitude": -74.0060
  },
  "method": "gps|beacon|face|manual"
}
```

**GET /attendance/records**
- Description: Get attendance records with filtering
- Query Parameters:
  - `startDate`: ISO date string
  - `endDate`: ISO date string
  - `userId`: User ID (optional)
  - `page`: Page number
  - `limit`: Records per page

### Face Recognition Service
**Base Path:** `/face-recognition`

#### Endpoints

**POST /face-recognition/enroll**
- Description: Enroll user's face for biometric authentication
- Request Body:
```json
{
  "userId": "user-uuid",
  "faceImages": ["base64-image1", "base64-image2"],
  "encryptionEnabled": true
}
```

**POST /face-recognition/verify**
- Description: Verify user identity using face recognition
- Request Body:
```json
{
  "userId": "user-uuid",
  "faceImage": "base64-image",
  "confidenceThreshold": 0.85
}
```

### Leave Management Service
**Base Path:** `/leave`

#### Endpoints

**POST /leave/request**
- Description: Submit leave request
- Request Body:
```json
{
  "startDate": "2024-01-15",
  "endDate": "2024-01-17",
  "leaveType": "vacation|sick|personal",
  "reason": "Family vacation",
  "attachments": ["document-uuid"]
}
```

**GET /leave/requests**
- Description: Get leave requests (filtered by role)
- Query Parameters:
  - `status`: pending|approved|rejected
  - `userId`: User ID (for managers/admins)
  - `page`: Page number
  - `limit`: Records per page

**PUT /leave/requests/{id}/approve**
- Description: Approve leave request (managers/admins only)
- Request Body:
```json
{
  "comments": "Approved for vacation"
}
```

### Analytics Service
**Base Path:** `/analytics`

#### Endpoints

**GET /analytics/dashboard**
- Description: Get dashboard analytics data
- Query Parameters:
  - `period`: daily|weekly|monthly|yearly
  - `departmentId`: Department ID (optional)

**GET /analytics/attendance-patterns**
- Description: Get attendance pattern analysis
- Response:
```json
{
  "patterns": [
    {
      "pattern": "late_arrival",
      "frequency": 15,
      "users": ["user-uuid1", "user-uuid2"]
    }
  ],
  "insights": ["Peak attendance at 9:00 AM"]
}
```

**GET /analytics/productivity-metrics**
- Description: Get workforce productivity metrics
- Response:
```json
{
  "overallProductivity": 87.5,
  "departmentMetrics": [
    {
      "department": "Engineering",
      "productivity": 92.1,
      "trends": "increasing"
    }
  ]
}
```

### User Management Service
**Base Path:** `/users`

#### Endpoints

**GET /users**
- Description: Get all users (admin only)
- Query Parameters:
  - `role`: admin|manager|employee
  - `department`: Department name
  - `status`: active|inactive
  - `page`: Page number
  - `limit`: Records per page

**POST /users**
- Description: Create new user (admin only)
- Request Body:
```json
{
  "email": "newuser@company.com",
  "firstName": "Jane",
  "lastName": "Smith",
  "role": "employee",
  "department": "Marketing",
  "permissions": ["attendance.view", "leave.request"]
}
```

**PUT /users/{id}**
- Description: Update user information
- Request Body:
```json
{
  "firstName": "Jane",
  "lastName": "Smith-Johnson",
  "role": "manager",
  "department": "Marketing"
}
```

**DELETE /users/{id}**
- Description: Deactivate user account (admin only)

### Tenant Management Service
**Base Path:** `/tenants`

#### Endpoints

**GET /tenants**
- Description: Get all tenants (super admin only)

**POST /tenants**
- Description: Create new tenant (super admin only)
- Request Body:
```json
{
  "name": "Acme Corporation",
  "domain": "acme.com",
  "settings": {
    "workingHours": "09:00-17:00",
    "timezone": "America/New_York",
    "features": ["face_recognition", "geofencing"]
  }
}
```

**PUT /tenants/{id}/settings**
- Description: Update tenant settings
- Request Body:
```json
{
  "workingHours": "08:00-16:00",
  "timezone": "America/Los_Angeles",
  "branding": {
    "logo": "logo-url",
    "primaryColor": "#1f2937"
  }
}
```

### Webhooks Service
**Base Path:** `/webhooks`

#### Endpoints

**GET /webhooks/subscriptions**
- Description: Get webhook subscriptions
- Response:
```json
{
  "subscriptions": [
    {
      "id": "webhook-uuid",
      "url": "https://client.com/webhook",
      "events": ["attendance.checked_in", "leave.approved"],
      "status": "active"
    }
  ]
}
```

**POST /webhooks/subscriptions**
- Description: Create webhook subscription
- Request Body:
```json
{
  "url": "https://client.com/webhook",
  "events": ["attendance.checked_in", "attendance.checked_out"],
  "secret": "webhook-secret"
}
```

**POST /webhooks/test**
- Description: Test webhook endpoint
- Request Body:
```json
{
  "url": "https://client.com/webhook",
  "event": "test.ping"
}
```

### Compliance Service
**Base Path:** `/compliance`

#### Endpoints

**GET /compliance/dashboard**
- Description: Get compliance dashboard data
- Query Parameters:
  - `region`: US|EU|APAC
  - `standard`: GDPR|CCPA|SOX

**GET /compliance/violations**
- Description: Get compliance violations
- Response:
```json
{
  "violations": [
    {
      "type": "data_retention",
      "severity": "medium",
      "description": "Data older than retention policy",
      "affectedRecords": 150
    }
  ]
}
```

**POST /compliance/reports/generate**
- Description: Generate compliance report
- Request Body:
```json
{
  "type": "audit|privacy|security",
  "period": "monthly",
  "format": "pdf|excel"
}
```

## Workflow Services

### Workflow Engine Service
**Base Path:** `/workflow`

#### Endpoints

**GET /workflow/templates**
- Description: Get workflow templates

**POST /workflow/instances**
- Description: Create workflow instance
- Request Body:
```json
{
  "templateId": "template-uuid",
  "parameters": {
    "approver": "manager-uuid",
    "threshold": 1000
  }
}
```

**GET /workflow/instances/{id}/status**
- Description: Get workflow instance status

### Voice Recognition Service
**Base Path:** `/voice`

#### Endpoints

**POST /voice/commands**
- Description: Process voice command
- Request Body:
```json
{
  "audioData": "base64-audio",
  "language": "en-US",
  "context": "attendance"
}
```

**GET /voice/commands/history**
- Description: Get voice command history

## Error Responses

All endpoints return standardized error responses:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

## Rate Limiting

API requests are rate limited:
- Standard users: 1000 requests/hour
- Premium users: 5000 requests/hour
- Enterprise users: 10000 requests/hour

## Webhooks

Hudur supports real-time webhooks for the following events:

### Attendance Events
- `attendance.checked_in`
- `attendance.checked_out`
- `attendance.late_arrival`
- `attendance.early_departure`

### Leave Events
- `leave.requested`
- `leave.approved`
- `leave.rejected`
- `leave.cancelled`

### User Events
- `user.created`
- `user.updated`
- `user.deactivated`

### Compliance Events
- `compliance.violation_detected`
- `compliance.report_generated`

## SDK Support

Official SDKs are available for:
- JavaScript/TypeScript
- Python
- C#/.NET
- Java
- PHP

## Support

For API support, contact: api-support@hudur.sa

---

© 2024 Hudur Platform. All rights reserved.
