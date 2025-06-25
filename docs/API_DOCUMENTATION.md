# Hudur Platform - Complete API Documentation

## Overview

Hudur is a comprehensive, enterprise-grade attendance and workforce management platform built with modern microservices architecture. This documentation provides detailed information about all API endpoints, authentication, and integration capabilities.

## Base URLs

- **Development**: `http://localhost:5000`
- **Production**: `https://api.hudur.sa`
- **Staging**: `https://staging-api.hudur.sa`

## Authentication

All API endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Authentication Endpoints

#### POST /api/auth/login
Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "tenantSubdomain": "company"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "refresh-token-here",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "Employee"
  },
  "expiresAt": "2024-07-01T12:00:00Z"
}
```

#### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "firstName": "Jane",
  "lastName": "Smith",
  "tenantSubdomain": "company"
}
```

#### POST /api/auth/refresh
Refresh an expired JWT token.

**Request Body:**
```json
{
  "refreshToken": "refresh-token-here"
}
```

#### POST /api/auth/logout
Logout and invalidate tokens.

**Request Body:**
```json
{
  "refreshToken": "refresh-token-here"
}
```

## Attendance Management

### Attendance Endpoints

#### POST /api/attendance/checkin
Record employee check-in.

**Request Body:**
```json
{
  "userId": "user-id",
  "checkInTime": "2024-07-01T09:00:00Z",
  "location": {
    "latitude": 40.7128,
    "longitude": -74.0060
  },
  "method": "GPS",
  "deviceInfo": {
    "deviceId": "device-123",
    "platform": "iOS",
    "version": "17.0"
  }
}
```

**Response:**
```json
{
  "success": true,
  "attendanceId": "attendance-record-id",
  "checkInTime": "2024-07-01T09:00:00Z",
  "status": "Checked In",
  "location": {
    "latitude": 40.7128,
    "longitude": -74.0060,
    "address": "123 Main St, New York, NY"
  }
}
```

#### POST /api/attendance/checkout
Record employee check-out.

**Request Body:**
```json
{
  "userId": "user-id",
  "checkOutTime": "2024-07-01T17:00:00Z",
  "location": {
    "latitude": 40.7128,
    "longitude": -74.0060
  }
}
```

#### GET /api/attendance/history/{userId}
Get attendance history for a user.

**Query Parameters:**
- `fromDate`: Start date (ISO 8601)
- `toDate`: End date (ISO 8601)
- `page`: Page number (default: 1)
- `pageSize`: Records per page (default: 50)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "attendance-id",
      "checkInTime": "2024-07-01T09:00:00Z",
      "checkOutTime": "2024-07-01T17:00:00Z",
      "totalHours": 8.0,
      "status": "Complete",
      "location": {
        "checkIn": "Office Location",
        "checkOut": "Office Location"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 50,
    "totalRecords": 100,
    "totalPages": 2
  }
}
```

#### GET /api/attendance/status/{userId}
Get current attendance status for a user.

**Response:**
```json
{
  "success": true,
  "status": "Checked In",
  "currentSession": {
    "checkInTime": "2024-07-01T09:00:00Z",
    "duration": "02:30:00",
    "location": "Main Office"
  }
}
```

## Face Recognition

### Face Recognition Endpoints

#### POST /api/face-recognition/enroll
Enroll a user's face for recognition.

**Request Body:**
```json
{
  "userId": "user-id",
  "imageData": "base64-encoded-image-data",
  "imageFormat": "jpeg"
}
```

**Response:**
```json
{
  "success": true,
  "templateId": "face-template-id",
  "quality": 0.95,
  "message": "Face enrolled successfully"
}
```

#### POST /api/face-recognition/verify
Verify a face against enrolled templates.

**Request Body:**
```json
{
  "imageData": "base64-encoded-image-data",
  "imageFormat": "jpeg",
  "threshold": 0.8
}
```

**Response:**
```json
{
  "success": true,
  "isMatch": true,
  "userId": "matched-user-id",
  "confidence": 0.92,
  "user": {
    "id": "user-id",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com"
  }
}
```

#### DELETE /api/face-recognition/template/{userId}
Delete a user's face template.

**Response:**
```json
{
  "success": true,
  "message": "Face template deleted successfully"
}
```

## Leave Management

### Leave Management Endpoints

#### POST /api/leave/submit
Submit a leave request.

**Request Body:**
```json
{
  "userId": "user-id",
  "leaveType": "Annual",
  "startDate": "2024-07-15",
  "endDate": "2024-07-19",
  "reason": "Family vacation",
  "attachments": [
    {
      "fileName": "medical-certificate.pdf",
      "fileData": "base64-encoded-file-data"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "requestId": "leave-request-id",
  "status": "Pending",
  "submittedAt": "2024-07-01T10:00:00Z"
}
```

#### GET /api/leave/requests/{userId}
Get leave requests for a user.

**Query Parameters:**
- `status`: Filter by status (Pending, Approved, Rejected)
- `year`: Filter by year
- `page`: Page number
- `pageSize`: Records per page

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "request-id",
      "leaveType": "Annual",
      "startDate": "2024-07-15",
      "endDate": "2024-07-19",
      "days": 5,
      "status": "Approved",
      "reason": "Family vacation",
      "submittedAt": "2024-07-01T10:00:00Z",
      "approvedAt": "2024-07-02T14:00:00Z",
      "approvedBy": "Manager Name"
    }
  ]
}
```

#### POST /api/leave/approve
Approve or reject a leave request.

**Request Body:**
```json
{
  "requestId": "leave-request-id",
  "status": "Approved",
  "comments": "Approved for family vacation",
  "approvedBy": "manager-user-id"
}
```

#### GET /api/leave/balance/{userId}
Get leave balance for a user.

**Response:**
```json
{
  "success": true,
  "balances": [
    {
      "leaveType": "Annual",
      "allocated": 25,
      "used": 10,
      "remaining": 15,
      "pending": 5
    },
    {
      "leaveType": "Sick",
      "allocated": 10,
      "used": 2,
      "remaining": 8,
      "pending": 0
    }
  ]
}
```

## User Management

### User Management Endpoints

#### GET /api/users
Get list of users (Admin only).

**Query Parameters:**
- `search`: Search by name or email
- `department`: Filter by department
- `role`: Filter by role
- `status`: Filter by status (Active, Inactive)
- `page`: Page number
- `pageSize`: Records per page

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "user-id",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "role": "Employee",
      "department": "Engineering",
      "status": "Active",
      "lastLogin": "2024-07-01T09:00:00Z"
    }
  ]
}
```

#### POST /api/users
Create a new user (Admin only).

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane.smith@example.com",
  "role": "Employee",
  "department": "Marketing",
  "phoneNumber": "+1234567890",
  "hireDate": "2024-07-01"
}
```

#### PUT /api/users/{userId}
Update user information.

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "phoneNumber": "+1234567890",
  "department": "Marketing",
  "role": "Manager"
}
```

#### DELETE /api/users/{userId}
Deactivate a user (Admin only).

## Notifications

### Notification Endpoints

#### POST /api/notifications/email
Send email notification.

**Request Body:**
```json
{
  "to": ["user@example.com"],
  "cc": ["manager@example.com"],
  "subject": "Attendance Reminder",
  "body": "Please remember to check in today.",
  "isHtml": true,
  "attachments": [
    {
      "fileName": "policy.pdf",
      "fileData": "base64-encoded-data"
    }
  ]
}
```

#### POST /api/notifications/push
Send push notification.

**Request Body:**
```json
{
  "userIds": ["user-id-1", "user-id-2"],
  "title": "Attendance Reminder",
  "body": "Don't forget to check in today!",
  "data": {
    "type": "attendance",
    "action": "reminder"
  },
  "badge": 1,
  "sound": "default"
}
```

#### POST /api/notifications/sms
Send SMS notification.

**Request Body:**
```json
{
  "phoneNumbers": ["+1234567890"],
  "message": "Your leave request has been approved.",
  "senderId": "Hudur"
}
```

#### GET /api/notifications/preferences/{userId}
Get user notification preferences.

**Response:**
```json
{
  "success": true,
  "preferences": {
    "email": {
      "enabled": true,
      "attendanceReminders": true,
      "leaveUpdates": true,
      "systemAlerts": false
    },
    "push": {
      "enabled": true,
      "attendanceReminders": true,
      "leaveUpdates": true,
      "systemAlerts": true
    },
    "sms": {
      "enabled": false,
      "attendanceReminders": false,
      "leaveUpdates": true,
      "systemAlerts": false
    }
  }
}
```

## Reports and Analytics

### Reports Endpoints

#### GET /api/reports/attendance
Generate attendance report.

**Query Parameters:**
- `fromDate`: Start date (ISO 8601)
- `toDate`: End date (ISO 8601)
- `userIds`: Comma-separated user IDs
- `departments`: Comma-separated department names
- `format`: Response format (json, csv, pdf)

**Response:**
```json
{
  "success": true,
  "report": {
    "period": {
      "from": "2024-06-01",
      "to": "2024-06-30"
    },
    "summary": {
      "totalEmployees": 50,
      "averageHours": 8.2,
      "attendanceRate": 95.5,
      "lateArrivals": 12,
      "earlyDepartures": 8
    },
    "details": [
      {
        "userId": "user-id",
        "name": "John Doe",
        "department": "Engineering",
        "totalHours": 168.5,
        "workingDays": 22,
        "lateArrivals": 2,
        "attendanceRate": 100
      }
    ]
  }
}
```

#### GET /api/reports/leave
Generate leave report.

**Query Parameters:**
- `fromDate`: Start date
- `toDate`: End date
- `leaveTypes`: Comma-separated leave types
- `status`: Leave status filter
- `format`: Response format

#### GET /api/reports/dashboard
Get dashboard analytics.

**Response:**
```json
{
  "success": true,
  "analytics": {
    "today": {
      "totalEmployees": 50,
      "checkedIn": 45,
      "onLeave": 3,
      "absent": 2,
      "attendanceRate": 90
    },
    "thisWeek": {
      "averageAttendance": 92.5,
      "totalHours": 1680,
      "overtime": 45.5
    },
    "thisMonth": {
      "attendanceRate": 94.2,
      "leaveRequests": 15,
      "approvedLeaves": 12,
      "pendingLeaves": 3
    }
  }
}
```

## Webhooks

### Webhook Endpoints

#### POST /api/webhooks/subscribe
Subscribe to webhook events.

**Request Body:**
```json
{
  "url": "https://your-app.com/webhook",
  "events": ["attendance.checkin", "attendance.checkout", "leave.approved"],
  "secret": "your-webhook-secret",
  "active": true
}
```

#### GET /api/webhooks/subscriptions
Get webhook subscriptions.

#### PUT /api/webhooks/{subscriptionId}
Update webhook subscription.

#### DELETE /api/webhooks/{subscriptionId}
Delete webhook subscription.

### Webhook Events

#### attendance.checkin
Triggered when an employee checks in.

**Payload:**
```json
{
  "event": "attendance.checkin",
  "timestamp": "2024-07-01T09:00:00Z",
  "data": {
    "userId": "user-id",
    "attendanceId": "attendance-id",
    "checkInTime": "2024-07-01T09:00:00Z",
    "location": {
      "latitude": 40.7128,
      "longitude": -74.0060
    },
    "method": "GPS"
  }
}
```

#### leave.submitted
Triggered when a leave request is submitted.

**Payload:**
```json
{
  "event": "leave.submitted",
  "timestamp": "2024-07-01T10:00:00Z",
  "data": {
    "requestId": "leave-request-id",
    "userId": "user-id",
    "leaveType": "Annual",
    "startDate": "2024-07-15",
    "endDate": "2024-07-19",
    "status": "Pending"
  }
}
```

## Error Handling

All API endpoints return consistent error responses:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ]
  },
  "timestamp": "2024-07-01T10:00:00Z",
  "requestId": "req-12345"
}
```

### Common Error Codes

- `AUTHENTICATION_REQUIRED`: Missing or invalid authentication
- `AUTHORIZATION_FAILED`: Insufficient permissions
- `VALIDATION_ERROR`: Invalid input data
- `RESOURCE_NOT_FOUND`: Requested resource not found
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `INTERNAL_SERVER_ERROR`: Server error

## Rate Limiting

API requests are rate limited:

- **Authenticated requests**: 1000 requests per hour
- **Authentication endpoints**: 10 requests per minute
- **File uploads**: 50 requests per hour

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1625097600
```

## SDKs and Libraries

Official SDKs are available for:

- **JavaScript/Node.js**: `npm install hudur-sdk`
- **Python**: `pip install hudur-sdk`
- **C#/.NET**: `Install-Package Hudur.SDK`
- **Java**: Maven/Gradle dependency available
- **PHP**: Composer package available

## Support and Resources

- **Documentation**: https://docs.hudur.sa
- **API Status**: https://status.hudur.sa
- **Support**: support@hudur.sa
- **Community**: https://community.hudur.sa

## Changelog

### Version 1.0.0 (2024-07-01)
- Initial API release
- Authentication and user management
- Attendance tracking with GPS and face recognition
- Leave management system
- Notifications and webhooks
- Comprehensive reporting

