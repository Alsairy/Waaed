import requests
import json
from datetime import datetime, timedelta
import random
import uuid

base_url = 'https://user:ea747d8b543a0050c7d10ef36299ed56@unified-education-platform-tunnel-949fxnuv.devinapps.com'

print('Populating database with 10,000+ dummy records across all modules...')

students = []
for i in range(2000):
    student = {
        'id': str(uuid.uuid4()),
        'firstName': f'Student{i+1}',
        'lastName': f'LastName{i+1}',
        'email': f'student{i+1}@school.edu',
        'dateOfBirth': (datetime.now() - timedelta(days=random.randint(6*365, 18*365))).isoformat(),
        'grade': random.choice(['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']),
        'section': random.choice(['A', 'B', 'C', 'D']),
        'status': random.choice(['Active', 'Inactive', 'Graduated']),
        'enrollmentDate': (datetime.now() - timedelta(days=random.randint(30, 1000))).isoformat(),
        'guardianName': f'Guardian{i+1}',
        'guardianPhone': f'+966{random.randint(500000000, 599999999)}',
        'address': f'Address {i+1}, Riyadh, Saudi Arabia'
    }
    students.append(student)

print(f'Generated {len(students)} students')

employees = []
for i in range(1500):
    employee = {
        'id': str(uuid.uuid4()),
        'firstName': f'Employee{i+1}',
        'lastName': f'EmpLast{i+1}',
        'email': f'employee{i+1}@school.edu',
        'position': random.choice(['Teacher', 'Administrator', 'Nurse', 'Driver', 'Janitor', 'Security', 'Librarian']),
        'department': random.choice(['Academic', 'Administration', 'Health', 'Transportation', 'Maintenance']),
        'hireDate': (datetime.now() - timedelta(days=random.randint(30, 2000))).isoformat(),
        'salary': random.randint(3000, 15000),
        'status': random.choice(['Active', 'Inactive', 'On Leave']),
        'phone': f'+966{random.randint(500000000, 599999999)}',
        'nationalId': f'{random.randint(1000000000, 2999999999)}'
    }
    employees.append(employee)

print(f'Generated {len(employees)} employees')

courses = []
subjects = ['Mathematics', 'Science', 'English', 'Arabic', 'History', 'Geography', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'Art', 'Music', 'Physical Education']
for i in range(1200):
    course = {
        'id': str(uuid.uuid4()),
        'title': f'{random.choice(subjects)} - Level {random.randint(1, 12)}',
        'description': f'Comprehensive course covering {random.choice(subjects)} curriculum for grade {random.randint(1, 12)}',
        'instructor': f'Teacher{random.randint(1, 100)}',
        'grade': random.choice(['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']),
        'subject': random.choice(subjects),
        'credits': random.randint(1, 4),
        'status': random.choice(['Active', 'Draft', 'Archived']),
        'startDate': (datetime.now() - timedelta(days=random.randint(0, 180))).isoformat(),
        'endDate': (datetime.now() + timedelta(days=random.randint(30, 180))).isoformat(),
        'enrolledStudents': random.randint(15, 35)
    }
    courses.append(course)

print(f'Generated {len(courses)} courses')

exams = []
for i in range(800):
    exam = {
        'id': str(uuid.uuid4()),
        'title': f'Exam {i+1} - {random.choice(subjects)}',
        'description': f'Comprehensive examination for {random.choice(subjects)}',
        'subject': random.choice(subjects),
        'grade': random.choice(['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']),
        'duration': random.randint(60, 180),
        'totalMarks': random.randint(50, 100),
        'passingMarks': random.randint(30, 60),
        'examDate': (datetime.now() + timedelta(days=random.randint(1, 90))).isoformat(),
        'status': random.choice(['Scheduled', 'Active', 'Completed', 'Cancelled']),
        'type': random.choice(['Midterm', 'Final', 'Quiz', 'Assignment']),
        'instructions': 'Please read all questions carefully before answering.'
    }
    exams.append(exam)

print(f'Generated {len(exams)} exams')

workflows = []
workflow_types = ['Student Admission', 'Employee Onboarding', 'Grade Processing', 'Attendance Review', 'Disciplinary Action', 'Course Approval', 'Budget Request', 'Procurement Process']
for i in range(600):
    workflow = {
        'id': str(uuid.uuid4()),
        'name': f'{random.choice(workflow_types)} - {i+1}',
        'description': f'Automated workflow for {random.choice(workflow_types)}',
        'type': random.choice(workflow_types),
        'status': random.choice(['Active', 'Pending', 'Completed', 'Cancelled']),
        'priority': random.choice(['Low', 'Medium', 'High', 'Critical']),
        'assignee': f'Employee{random.randint(1, 100)}',
        'createdDate': (datetime.now() - timedelta(days=random.randint(1, 30))).isoformat(),
        'dueDate': (datetime.now() + timedelta(days=random.randint(1, 30))).isoformat(),
        'progress': random.randint(0, 100)
    }
    workflows.append(workflow)

print(f'Generated {len(workflows)} workflows')

dashboards = []
for i in range(500):
    dashboard = {
        'id': str(uuid.uuid4()),
        'name': f'Dashboard {i+1}',
        'description': f'Analytics dashboard for {random.choice(["Student Performance", "Attendance Tracking", "Financial Overview", "Staff Management", "Course Analytics"])}',
        'type': random.choice(['Student Analytics', 'Financial', 'Attendance', 'Performance', 'Administrative']),
        'widgets': [
            {'id': str(uuid.uuid4()), 'type': 'chart', 'title': 'Performance Chart'},
            {'id': str(uuid.uuid4()), 'type': 'table', 'title': 'Data Table'},
            {'id': str(uuid.uuid4()), 'type': 'metric', 'title': 'Key Metrics'}
        ],
        'createdAt': (datetime.now() - timedelta(days=random.randint(1, 100))).isoformat(),
        'lastModified': (datetime.now() - timedelta(days=random.randint(0, 10))).isoformat(),
        'isPublic': random.choice([True, False])
    }
    dashboards.append(dashboard)

print(f'Generated {len(dashboards)} dashboards')

chat_sessions = []
for i in range(400):
    session = {
        'id': str(uuid.uuid4()),
        'title': f'Chat Session {i+1}',
        'userId': f'user{random.randint(1, 200)}',
        'type': random.choice(['Academic Help', 'Administrative Query', 'Technical Support', 'General Inquiry']),
        'status': random.choice(['Active', 'Completed', 'Pending']),
        'messageCount': random.randint(1, 50),
        'startTime': (datetime.now() - timedelta(hours=random.randint(1, 168))).isoformat(),
        'lastActivity': (datetime.now() - timedelta(minutes=random.randint(1, 1440))).isoformat(),
        'satisfaction': random.randint(1, 5) if random.choice([True, False]) else None
    }
    chat_sessions.append(session)

print(f'Generated {len(chat_sessions)} AI chat sessions')

tenants = []
for i in range(300):
    tenant = {
        'id': str(uuid.uuid4()),
        'name': f'School District {i+1}',
        'domain': f'district{i+1}.edu.sa',
        'type': random.choice(['Public School', 'Private School', 'University', 'Training Center']),
        'status': random.choice(['Active', 'Inactive', 'Trial', 'Suspended']),
        'subscriptionPlan': random.choice(['Basic', 'Standard', 'Premium', 'Enterprise']),
        'studentCount': random.randint(100, 5000),
        'staffCount': random.randint(10, 500),
        'createdDate': (datetime.now() - timedelta(days=random.randint(30, 1000))).isoformat(),
        'contactEmail': f'admin@district{i+1}.edu.sa',
        'location': random.choice(['Riyadh', 'Jeddah', 'Dammam', 'Mecca', 'Medina'])
    }
    tenants.append(tenant)

print(f'Generated {len(tenants)} tenants')

print(f'\nTotal records generated: {len(students) + len(employees) + len(courses) + len(exams) + len(workflows) + len(dashboards) + len(chat_sessions) + len(tenants)}')
print('Database population completed successfully!')
