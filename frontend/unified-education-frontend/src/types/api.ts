export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  grade: string;
  section: string;
  status: string;
  enrollmentDate: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  status: string;
  startDate: string;
  endDate: string;
}

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  position: string;
  status: string;
  hireDate: string;
}

export interface Exam {
  id: string;
  title: string;
  description: string;
  subject: string;
  duration: number;
  status: string;
  scheduledDate: string;
}

export interface Metric {
  id: string;
  name: string;
  value: number;
  unit: string;
  category: string;
  timestamp: string;
}

export interface Dashboard {
  id: string;
  name: string;
  description: string;
  widgets: Widget[];
  createdAt: string;
}

export interface Widget {
  id: string;
  type: string;
  title: string;
  data: any;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: string;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  status: string;
  steps: WorkflowStep[];
  createdAt: string;
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: string;
  status: string;
  order: number;
}

export interface Tenant {
  id: string;
  name: string;
  domain: string;
  status: string;
  plan: string;
  createdAt: string;
}
