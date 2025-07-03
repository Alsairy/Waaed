import axios, { AxiosResponse } from 'axios'

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:5000/api'

interface Course {
  id: string
  title: string
  description: string
  code: string
  credits: number
  instructorId: string
  instructorName?: string
  semester: string
  year: number
  status: string
  startDate: string
  endDate: string
  maxStudents?: number
  enrolledStudents?: number
  syllabus?: string
  createdAt: string
  updatedAt?: string
}

interface CourseDto {
  title: string
  description: string
  code: string
  credits: number
  instructorId: string
  semester: string
  year: number
  startDate: string
  endDate: string
  maxStudents?: number
  syllabus?: string
}

interface Assignment {
  id: string
  courseId: string
  title: string
  description: string
  dueDate: string
  maxPoints: number
  type: string
  status: string
  instructions?: string
  attachments?: string[]
  createdAt: string
  updatedAt?: string
}

interface AssignmentDto {
  courseId: string
  title: string
  description: string
  dueDate: string
  maxPoints: number
  type: string
  instructions?: string
  attachments?: string[]
}

interface Submission {
  id: string
  assignmentId: string
  studentId: string
  content: string
  attachments?: string[]
  submittedAt: string
  grade?: number
  feedback?: string
  status: string
}

interface SubmissionDto {
  assignmentId: string
  studentId: string
  content: string
  attachments?: string[]
}

interface Grade {
  id: string
  studentId: string
  courseId: string
  assignmentId?: string
  grade: number
  maxPoints: number
  percentage: number
  letterGrade: string
  comments?: string
  gradedAt: string
  gradedBy: string
}

interface GradeDto {
  studentId: string
  courseId: string
  assignmentId?: string
  grade: number
  maxPoints: number
  comments?: string
}

class LMSService {
  private api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  constructor() {
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('accessToken')
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }
    )
  }

  async getCourses(): Promise<Course[]> {
    try {
      const response: AxiosResponse<{data: Course[]}> = await this.api.get('/lms/courses')
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch courses')
    }
  }

  async getCourse(id: string): Promise<Course> {
    try {
      const response: AxiosResponse<{data: Course}> = await this.api.get(`/lms/courses/${id}`)
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch course')
    }
  }

  async createCourse(courseData: CourseDto): Promise<Course> {
    try {
      const response: AxiosResponse<{data: Course}> = await this.api.post('/lms/courses', courseData)
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create course')
    }
  }

  async updateCourse(id: string, courseData: Partial<CourseDto>): Promise<void> {
    try {
      await this.api.put(`/lms/courses/${id}`, courseData)
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update course')
    }
  }

  async deleteCourse(id: string): Promise<void> {
    try {
      await this.api.delete(`/lms/courses/${id}`)
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete course')
    }
  }

  async getAssignments(courseId?: string): Promise<Assignment[]> {
    try {
      const url = courseId ? `/lms/assignments?courseId=${courseId}` : '/lms/assignments'
      const response: AxiosResponse<{data: Assignment[]}> = await this.api.get(url)
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch assignments')
    }
  }

  async getAssignment(id: string): Promise<Assignment> {
    try {
      const response: AxiosResponse<{data: Assignment}> = await this.api.get(`/lms/assignments/${id}`)
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch assignment')
    }
  }

  async createAssignment(assignmentData: AssignmentDto): Promise<Assignment> {
    try {
      const response: AxiosResponse<{data: Assignment}> = await this.api.post('/lms/assignments', assignmentData)
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create assignment')
    }
  }

  async updateAssignment(id: string, assignmentData: Partial<AssignmentDto>): Promise<void> {
    try {
      await this.api.put(`/lms/assignments/${id}`, assignmentData)
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update assignment')
    }
  }

  async deleteAssignment(id: string): Promise<void> {
    try {
      await this.api.delete(`/lms/assignments/${id}`)
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete assignment')
    }
  }

  async getSubmissions(assignmentId: string, studentId?: string): Promise<Submission[]> {
    try {
      const url = studentId 
        ? `/lms/submissions?assignmentId=${assignmentId}&studentId=${studentId}`
        : `/lms/submissions?assignmentId=${assignmentId}`
      const response: AxiosResponse<{data: Submission[]}> = await this.api.get(url)
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch submissions')
    }
  }

  async createSubmission(submissionData: SubmissionDto): Promise<Submission> {
    try {
      const response: AxiosResponse<{data: Submission}> = await this.api.post('/lms/submissions', submissionData)
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create submission')
    }
  }

  async updateSubmission(id: string, submissionData: Partial<SubmissionDto>): Promise<void> {
    try {
      await this.api.put(`/lms/submissions/${id}`, submissionData)
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update submission')
    }
  }

  async getGrades(studentId?: string, courseId?: string): Promise<Grade[]> {
    try {
      const params = new URLSearchParams()
      if (studentId) params.append('studentId', studentId)
      if (courseId) params.append('courseId', courseId)
      
      const url = `/lms/grades${params.toString() ? '?' + params.toString() : ''}`
      const response: AxiosResponse<{data: Grade[]}> = await this.api.get(url)
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch grades')
    }
  }

  async createGrade(gradeData: GradeDto): Promise<Grade> {
    try {
      const response: AxiosResponse<{data: Grade}> = await this.api.post('/lms/grades', gradeData)
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create grade')
    }
  }

  async updateGrade(id: string, gradeData: Partial<GradeDto>): Promise<void> {
    try {
      await this.api.put(`/lms/grades/${id}`, gradeData)
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update grade')
    }
  }

  async getCoursesByInstructor(instructorId: string): Promise<Course[]> {
    try {
      const response: AxiosResponse<{data: Course[]}> = await this.api.get(`/lms/courses?instructorId=${instructorId}`)
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch instructor courses')
    }
  }

  async getCoursesByStudent(studentId: string): Promise<Course[]> {
    try {
      const response: AxiosResponse<{data: Course[]}> = await this.api.get(`/lms/courses?studentId=${studentId}`)
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch student courses')
    }
  }
}

export const lmsService = new LMSService()
export type { LMSService, Course, CourseDto, Assignment, AssignmentDto, Submission, SubmissionDto, Grade, GradeDto }
