from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import httpx
import asyncio
import logging
from typing import Dict, Any
import os
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Unified Education Platform - Backend Proxy",
    description="Proxy service for the Unified Education Platform backend services",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SERVICES = {
    "sis": os.getenv("SIS_SERVICE_URL", "http://localhost:5001"),
    "lms": os.getenv("LMS_SERVICE_URL", "http://localhost:5002"),
    "erp": os.getenv("ERP_SERVICE_URL", "http://localhost:5003"),
    "exams": os.getenv("EXAMS_SERVICE_URL", "http://localhost:5004"),
    "bpm": os.getenv("BPM_SERVICE_URL", "http://localhost:5005"),
    "analytics": os.getenv("ANALYTICS_SERVICE_URL", "http://localhost:5006"),
    "ai": os.getenv("AI_SERVICE_URL", "http://localhost:5007"),
    "admin": os.getenv("ADMIN_SERVICE_URL", "http://localhost:5008"),
    "integration": os.getenv("INTEGRATION_SERVICE_URL", "http://localhost:5009"),
}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "backend-proxy"}

@app.get("/api/status")
async def get_service_status():
    status = {}
    async with httpx.AsyncClient() as client:
        for service_name, service_url in SERVICES.items():
            try:
                response = await client.get(f"{service_url}/health", timeout=5.0)
                status[service_name] = {
                    "status": "healthy" if response.status_code == 200 else "unhealthy",
                    "url": service_url,
                    "response_time": response.elapsed.total_seconds()
                }
            except Exception as e:
                status[service_name] = {
                    "status": "unavailable",
                    "url": service_url,
                    "error": str(e)
                }
    return status

@app.api_route("/api/{service_name}/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def proxy_request(service_name: str, path: str, request: Request):
    if service_name not in SERVICES:
        raise HTTPException(status_code=404, detail=f"Service '{service_name}' not found")
    
    service_url = SERVICES[service_name]
    target_url = f"{service_url}/api/{path}"
    
    body = None
    if request.method in ["POST", "PUT", "PATCH"]:
        try:
            body = await request.body()
        except Exception:
            body = None
    
    headers = dict(request.headers)
    headers.pop("host", None)
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.request(
                method=request.method,
                url=target_url,
                headers=headers,
                content=body,
                params=dict(request.query_params),
                timeout=30.0
            )
            
            return Response(
                content=response.content,
                status_code=response.status_code,
                headers=dict(response.headers),
                media_type=response.headers.get("content-type")
            )
    except httpx.TimeoutException:
        logger.error(f"Timeout when calling {target_url}")
        raise HTTPException(status_code=504, detail="Service timeout")
    except httpx.ConnectError:
        logger.error(f"Connection error when calling {target_url}")
        raise HTTPException(status_code=503, detail="Service unavailable")
    except Exception as e:
        logger.error(f"Error proxying request to {target_url}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/api/sis/students")
async def get_students():
    return {
        "data": [
            {
                "id": "1",
                "name": "Ahmed Al-Rashid",
                "grade": "Grade 10",
                "section": "A",
                "status": "Active",
                "enrollment_date": "2024-09-01"
            },
            {
                "id": "2",
                "name": "Fatima Al-Zahra",
                "grade": "Grade 9",
                "section": "B",
                "status": "Active",
                "enrollment_date": "2024-09-01"
            }
        ],
        "total": 2,
        "page": 1,
        "per_page": 10
    }

@app.get("/api/lms/courses")
async def get_courses():
    return {
        "data": [
            {
                "id": "1",
                "title": "Mathematics - Grade 10",
                "instructor": "Dr. Sarah Ahmed",
                "students_enrolled": 25,
                "status": "Active",
                "start_date": "2024-09-01"
            },
            {
                "id": "2",
                "title": "Arabic Language - Grade 9",
                "instructor": "Prof. Mohammed Ali",
                "students_enrolled": 30,
                "status": "Active",
                "start_date": "2024-09-01"
            }
        ],
        "total": 2,
        "page": 1,
        "per_page": 10
    }

@app.get("/api/erp/employees")
async def get_employees():
    return {
        "data": [
            {
                "id": "1",
                "name": "Dr. Sarah Ahmed",
                "position": "Mathematics Teacher",
                "department": "Academic",
                "status": "Active",
                "hire_date": "2023-08-15"
            },
            {
                "id": "2",
                "name": "Prof. Mohammed Ali",
                "position": "Arabic Teacher",
                "department": "Academic",
                "status": "Active",
                "hire_date": "2022-09-01"
            }
        ],
        "total": 2,
        "page": 1,
        "per_page": 10
    }

@app.get("/api/exams/exams")
async def get_exams():
    return {
        "data": [
            {
                "id": "1",
                "title": "Mathematics Midterm",
                "grade": "Grade 10",
                "date": "2024-11-15",
                "duration": 120,
                "status": "Scheduled"
            },
            {
                "id": "2",
                "title": "Arabic Final Exam",
                "grade": "Grade 9",
                "date": "2024-12-20",
                "duration": 90,
                "status": "Scheduled"
            }
        ],
        "total": 2,
        "page": 1,
        "per_page": 10
    }

@app.get("/api/analytics/dashboards")
async def get_dashboards():
    return {
        "data": [
            {
                "id": "1",
                "name": "Student Performance Dashboard",
                "description": "Overview of student academic performance",
                "widgets": 6,
                "last_updated": "2024-06-25T10:30:00Z"
            },
            {
                "id": "2",
                "name": "Attendance Analytics",
                "description": "Student attendance tracking and analysis",
                "widgets": 4,
                "last_updated": "2024-06-25T09:15:00Z"
            }
        ],
        "total": 2,
        "page": 1,
        "per_page": 10
    }

@app.get("/api/ai/chat-sessions")
async def get_chat_sessions():
    return {
        "data": [
            {
                "id": "1",
                "user_id": "student_123",
                "topic": "Mathematics Help",
                "messages_count": 15,
                "status": "Active",
                "created_at": "2024-06-25T08:00:00Z"
            },
            {
                "id": "2",
                "user_id": "teacher_456",
                "topic": "Lesson Planning",
                "messages_count": 8,
                "status": "Completed",
                "created_at": "2024-06-24T14:30:00Z"
            }
        ],
        "total": 2,
        "page": 1,
        "per_page": 10
    }

@app.get("/api/bpm/workflows")
async def get_workflows():
    return {
        "data": [
            {
                "id": "1",
                "name": "Student Admission Process",
                "description": "Complete workflow for student admissions",
                "status": "Active",
                "instances": 12,
                "created_at": "2024-06-01T00:00:00Z"
            },
            {
                "id": "2",
                "name": "Employee Onboarding",
                "description": "New employee onboarding workflow",
                "status": "Active",
                "instances": 3,
                "created_at": "2024-05-15T00:00:00Z"
            }
        ],
        "total": 2,
        "page": 1,
        "per_page": 10
    }

@app.get("/api/admin/tenants")
async def get_tenants():
    return {
        "data": [
            {
                "id": "1",
                "name": "Al-Noor International School",
                "type": "K12_School",
                "status": "Active",
                "students_count": 1250,
                "created_at": "2024-01-15T00:00:00Z"
            },
            {
                "id": "2",
                "name": "King Fahd University",
                "type": "University",
                "status": "Active",
                "students_count": 15000,
                "created_at": "2024-02-01T00:00:00Z"
            }
        ],
        "total": 2,
        "page": 1,
        "per_page": 10
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
