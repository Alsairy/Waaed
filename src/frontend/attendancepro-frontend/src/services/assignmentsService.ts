import axios, { AxiosResponse } from 'axios'

const API_BASE_URL = (import.meta.env?.VITE_API_BASE_URL as string) || 'http://localhost:5000/api'

interface Assignment {
  id: string
  courseId: string
  courseName?: string
  title: string
  description: string
  instructions?: string
  dueDate: string
  maxPoints: number
  type: string
  status: string
  attachments?: AssignmentAttachment[]
  rubric?: AssignmentRubric
  allowLateSubmission: boolean
  lateSubmissionPenalty?: number
  createdAt: string
  updatedAt?: string
}

interface AssignmentDto {
  courseId: string
  title: string
  description: string
  instructions?: string
  dueDate: string
  maxPoints: number
  type: string
  attachments?: AssignmentAttachmentDto[]
  allowLateSubmission: boolean
  lateSubmissionPenalty?: number
}

interface AssignmentAttachment {
  id: string
  assignmentId: string
  fileName: string
  fileUrl: string
  fileSize: number
  uploadedAt: string
}

interface AssignmentAttachmentDto {
  fileName: string
  fileUrl: string
  fileSize: number
}

interface AssignmentRubric {
  id: string
  assignmentId: string
  criteria: RubricCriterion[]
  totalPoints: number
}

interface RubricCriterion {
  id: string
  name: string
  description: string
  maxPoints: number
  levels: RubricLevel[]
}

interface RubricLevel {
  id: string
  name: string
  description: string
  points: number
}

interface Submission {
  id: string
  assignmentId: string
  studentId: string
  studentName?: string
  content: string
  attachments?: SubmissionAttachment[]
  submittedAt: string
  isLate: boolean
  grade?: number
  feedback?: string
  status: string
  gradedAt?: string
  gradedBy?: string
}

interface SubmissionDto {
  assignmentId: string
  studentId: string
  content: string
  attachments?: SubmissionAttachmentDto[]
}

interface SubmissionAttachment {
  id: string
  submissionId: string
  fileName: string
  fileUrl: string
  fileSize: number
  uploadedAt: string
}

interface SubmissionAttachmentDto {
  fileName: string
  fileUrl: string
  fileSize: number
}

interface GradeSubmissionDto {
  submissionId: string
  grade: number
  feedback?: string
}

class AssignmentsService {
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

  async getAssignments(courseId?: string, studentId?: string): Promise<Assignment[]> {
    try {
      const params = new URLSearchParams()
      if (courseId) params.append('courseId', courseId)
      if (studentId) params.append('studentId', studentId)
      
      const url = `/lms/assignments${params.toString() ? '?' + params.toString() : ''}`
      const response: AxiosResponse<{data: Assignment[]}> = await this.api.get(url)
      return response.data.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to fetch assignments')
    }
  }

  async getAssignment(id: string): Promise<Assignment> {
    try {
      const response: AxiosResponse<{data: Assignment}> = await this.api.get(`/lms/assignments/${id}`)
      return response.data.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to fetch assignment')
    }
  }

  async createAssignment(assignmentData: AssignmentDto): Promise<Assignment> {
    try {
      const response: AxiosResponse<{data: Assignment}> = await this.api.post('/lms/assignments', assignmentData)
      return response.data.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to create assignment')
    }
  }

  async updateAssignment(id: string, assignmentData: Partial<AssignmentDto>): Promise<void> {
    try {
      await this.api.put(`/lms/assignments/${id}`, assignmentData)
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to update assignment')
    }
  }

  async deleteAssignment(id: string): Promise<void> {
    try {
      await this.api.delete(`/lms/assignments/${id}`)
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to delete assignment')
    }
  }

  async getSubmissions(assignmentId: string, studentId?: string): Promise<Submission[]> {
    try {
      const url = studentId 
        ? `/lms/assignments/${assignmentId}/submissions?studentId=${studentId}`
        : `/lms/assignments/${assignmentId}/submissions`
      const response: AxiosResponse<{data: Submission[]}> = await this.api.get(url)
      return response.data.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to fetch submissions')
    }
  }

  async getSubmission(id: string): Promise<Submission> {
    try {
      const response: AxiosResponse<{data: Submission}> = await this.api.get(`/lms/submissions/${id}`)
      return response.data.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to fetch submission')
    }
  }

  async createSubmission(submissionData: SubmissionDto): Promise<Submission> {
    try {
      const response: AxiosResponse<{data: Submission}> = await this.api.post('/lms/submissions', submissionData)
      return response.data.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to create submission')
    }
  }

  async updateSubmission(id: string, submissionData: Partial<SubmissionDto>): Promise<void> {
    try {
      await this.api.put(`/lms/submissions/${id}`, submissionData)
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to update submission')
    }
  }

  async gradeSubmission(gradeData: GradeSubmissionDto): Promise<void> {
    try {
      await this.api.put(`/lms/submissions/${gradeData.submissionId}/grade`, {
        grade: gradeData.grade,
        feedback: gradeData.feedback
      })
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to grade submission')
    }
  }

  async getStudentSubmissions(studentId: string, courseId?: string): Promise<Submission[]> {
    try {
      const url = courseId 
        ? `/lms/submissions?studentId=${studentId}&courseId=${courseId}`
        : `/lms/submissions?studentId=${studentId}`
      const response: AxiosResponse<{data: Submission[]}> = await this.api.get(url)
      return response.data.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to fetch student submissions')
    }
  }

  async getUpcomingAssignments(studentId: string, days?: number): Promise<Assignment[]> {
    try {
      const params = new URLSearchParams()
      params.append('studentId', studentId)
      if (days) params.append('days', days.toString())
      
      const response: AxiosResponse<{data: Assignment[]}> = await this.api.get(`/lms/assignments/upcoming?${params.toString()}`)
      return response.data.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to fetch upcoming assignments')
    }
  }

  async getOverdueAssignments(studentId: string): Promise<Assignment[]> {
    try {
      const response: AxiosResponse<{data: Assignment[]}> = await this.api.get(`/lms/assignments/overdue?studentId=${studentId}`)
      return response.data.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to fetch overdue assignments')
    }
  }

  async getAssignmentStatistics(assignmentId: string): Promise<{
    totalSubmissions: number
    gradedSubmissions: number
    averageGrade: number
    submissionRate: number
    lateSubmissions: number
    onTimeSubmissions: number
  }> {
    try {
      const response = await this.api.get(`/lms/assignments/${assignmentId}/statistics`)
      return response.data.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to fetch assignment statistics')
    }
  }

  async duplicateAssignment(assignmentId: string, newCourseId?: string): Promise<Assignment> {
    try {
      const response: AxiosResponse<{data: Assignment}> = await this.api.post(`/lms/assignments/${assignmentId}/duplicate`, {
        newCourseId
      })
      return response.data.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to duplicate assignment')
    }
  }

  async uploadAssignmentFile(assignmentId: string, file: File): Promise<AssignmentAttachment> {
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response: AxiosResponse<{data: AssignmentAttachment}> = await this.api.post(
        `/lms/assignments/${assignmentId}/attachments`, 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )
      return response.data.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to upload assignment file')
    }
  }

  async uploadSubmissionFile(submissionId: string, file: File): Promise<SubmissionAttachment> {
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response: AxiosResponse<{data: SubmissionAttachment}> = await this.api.post(
        `/lms/submissions/${submissionId}/attachments`, 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )
      return response.data.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to upload submission file')
    }
  }
}

export const assignmentsService = new AssignmentsService()
export type { 
  AssignmentsService, 
  Assignment, 
  AssignmentDto, 
  AssignmentAttachment, 
  AssignmentRubric, 
  RubricCriterion, 
  RubricLevel,
  Submission, 
  SubmissionDto, 
  SubmissionAttachment, 
  GradeSubmissionDto 
}
