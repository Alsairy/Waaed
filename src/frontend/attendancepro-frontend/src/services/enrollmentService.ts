import axios, { AxiosResponse } from 'axios'

const API_BASE_URL = (import.meta.env?.VITE_API_BASE_URL as string) || 'http://staging-api.waaed.sa/api'

interface Enrollment {
  id: string
  studentId: string
  studentName?: string
  courseId: string
  courseName?: string
  courseCode?: string
  enrollmentDate: string
  status: string
  grade?: string
  finalGrade?: number
  credits: number
  semester: string
  year: number
  enrollmentType: string
  waitlistPosition?: number
  dropDate?: string
  dropReason?: string
  createdAt: string
  updatedAt?: string
}

interface EnrollmentDto {
  studentId: string
  courseId: string
  enrollmentDate: string
  status: string
  enrollmentType: string
  semester: string
  year: number
}

interface EnrollmentRequest {
  id: string
  studentId: string
  studentName?: string
  courseId: string
  courseName?: string
  requestDate: string
  status: string
  priority: number
  reason?: string
  approvedBy?: string
  approvedAt?: string
  rejectedReason?: string
  createdAt: string
}

interface EnrollmentRequestDto {
  studentId: string
  courseId: string
  reason?: string
  priority?: number
}

interface Waitlist {
  id: string
  studentId: string
  studentName?: string
  courseId: string
  courseName?: string
  position: number
  addedDate: string
  status: string
  notificationSent: boolean
  expiryDate?: string
  createdAt: string
}

interface WaitlistDto {
  studentId: string
  courseId: string
}

interface EnrollmentPeriod {
  id: string
  name: string
  startDate: string
  endDate: string
  semester: string
  year: number
  isActive: boolean
  allowLateEnrollment: boolean
  lateEnrollmentFee?: number
  maxCredits: number
  minCredits: number
  description?: string
}

interface EnrollmentPeriodDto {
  name: string
  startDate: string
  endDate: string
  semester: string
  year: number
  allowLateEnrollment: boolean
  lateEnrollmentFee?: number
  maxCredits: number
  minCredits: number
  description?: string
}

interface EnrollmentSummary {
  studentId: string
  semester: string
  year: number
  totalCredits: number
  enrolledCourses: number
  completedCourses: number
  droppedCourses: number
  gpa: number
  academicStanding: string
}

interface CourseCapacity {
  courseId: string
  courseName?: string
  maxCapacity: number
  currentEnrollment: number
  availableSpots: number
  waitlistCount: number
  enrollmentRate: number
}

class EnrollmentService {
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

  async getEnrollments(studentId?: string, courseId?: string, semester?: string, year?: number): Promise<Enrollment[]> {
    try {
      const params = new URLSearchParams()
      if (studentId) params.append('studentId', studentId)
      if (courseId) params.append('courseId', courseId)
      if (semester) params.append('semester', semester)
      if (year) params.append('year', year.toString())
      
      const url = `/sis/enrollments${params.toString() ? '?' + params.toString() : ''}`
      const response: AxiosResponse<{data: Enrollment[]}> = await this.api.get(url)
      return response.data.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to fetch enrollments')
    }
  }

  async getEnrollment(id: string): Promise<Enrollment> {
    try {
      const response: AxiosResponse<{data: Enrollment}> = await this.api.get(`/sis/enrollments/${id}`)
      return response.data.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to fetch enrollment')
    }
  }

  async createEnrollment(enrollmentData: EnrollmentDto): Promise<Enrollment> {
    try {
      const response: AxiosResponse<{data: Enrollment}> = await this.api.post('/sis/enrollments', enrollmentData)
      return response.data.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to create enrollment')
    }
  }

  async updateEnrollment(id: string, enrollmentData: Partial<EnrollmentDto>): Promise<void> {
    try {
      await this.api.put(`/sis/enrollments/${id}`, enrollmentData)
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to update enrollment')
    }
  }

  async dropEnrollment(id: string, reason?: string): Promise<void> {
    try {
      await this.api.put(`/sis/enrollments/${id}/drop`, { reason })
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to drop enrollment')
    }
  }

  async getStudentEnrollments(studentId: string, semester?: string, year?: number): Promise<Enrollment[]> {
    try {
      const params = new URLSearchParams()
      if (semester) params.append('semester', semester)
      if (year) params.append('year', year.toString())
      
      const url = `/sis/students/${studentId}/enrollments${params.toString() ? '?' + params.toString() : ''}`
      const response: AxiosResponse<{data: Enrollment[]}> = await this.api.get(url)
      return response.data.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to fetch student enrollments')
    }
  }

  async getCourseEnrollments(courseId: string): Promise<Enrollment[]> {
    try {
      const response: AxiosResponse<{data: Enrollment[]}> = await this.api.get(`/sis/courses/${courseId}/enrollments`)
      return response.data.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to fetch course enrollments')
    }
  }

  async getEnrollmentRequests(studentId?: string, courseId?: string, status?: string): Promise<EnrollmentRequest[]> {
    try {
      const params = new URLSearchParams()
      if (studentId) params.append('studentId', studentId)
      if (courseId) params.append('courseId', courseId)
      if (status) params.append('status', status)
      
      const url = `/sis/enrollment-requests${params.toString() ? '?' + params.toString() : ''}`
      const response: AxiosResponse<{data: EnrollmentRequest[]}> = await this.api.get(url)
      return response.data.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to fetch enrollment requests')
    }
  }

  async createEnrollmentRequest(requestData: EnrollmentRequestDto): Promise<EnrollmentRequest> {
    try {
      const response: AxiosResponse<{data: EnrollmentRequest}> = await this.api.post('/sis/enrollment-requests', requestData)
      return response.data.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to create enrollment request')
    }
  }

  async approveEnrollmentRequest(requestId: string): Promise<void> {
    try {
      await this.api.put(`/sis/enrollment-requests/${requestId}/approve`)
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to approve enrollment request')
    }
  }

  async rejectEnrollmentRequest(requestId: string, reason: string): Promise<void> {
    try {
      await this.api.put(`/sis/enrollment-requests/${requestId}/reject`, { reason })
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to reject enrollment request')
    }
  }

  async getWaitlist(courseId: string): Promise<Waitlist[]> {
    try {
      const response: AxiosResponse<{data: Waitlist[]}> = await this.api.get(`/sis/courses/${courseId}/waitlist`)
      return response.data.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to fetch waitlist')
    }
  }

  async addToWaitlist(waitlistData: WaitlistDto): Promise<Waitlist> {
    try {
      const response: AxiosResponse<{data: Waitlist}> = await this.api.post('/sis/waitlist', waitlistData)
      return response.data.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to add to waitlist')
    }
  }

  async removeFromWaitlist(waitlistId: string): Promise<void> {
    try {
      await this.api.delete(`/sis/waitlist/${waitlistId}`)
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to remove from waitlist')
    }
  }

  async getEnrollmentPeriods(): Promise<EnrollmentPeriod[]> {
    try {
      const response: AxiosResponse<{data: EnrollmentPeriod[]}> = await this.api.get('/sis/enrollment-periods')
      return response.data.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to fetch enrollment periods')
    }
  }

  async getActiveEnrollmentPeriod(): Promise<EnrollmentPeriod | null> {
    try {
      const response: AxiosResponse<{data: EnrollmentPeriod}> = await this.api.get('/sis/enrollment-periods/active')
      return response.data.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { status?: number; data?: { message?: string } } }
      if (errorObj.response?.status === 404) {
        return null
      }
      throw new Error(errorObj.response?.data?.message || 'Failed to fetch active enrollment period')
    }
  }

  async createEnrollmentPeriod(periodData: EnrollmentPeriodDto): Promise<EnrollmentPeriod> {
    try {
      const response: AxiosResponse<{data: EnrollmentPeriod}> = await this.api.post('/sis/enrollment-periods', periodData)
      return response.data.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to create enrollment period')
    }
  }

  async updateEnrollmentPeriod(id: string, periodData: Partial<EnrollmentPeriodDto>): Promise<void> {
    try {
      await this.api.put(`/sis/enrollment-periods/${id}`, periodData)
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to update enrollment period')
    }
  }

  async getEnrollmentSummary(studentId: string, semester: string, year: number): Promise<EnrollmentSummary> {
    try {
      const response: AxiosResponse<{data: EnrollmentSummary}> = await this.api.get(
        `/sis/students/${studentId}/enrollment-summary?semester=${semester}&year=${year}`
      )
      return response.data.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to fetch enrollment summary')
    }
  }

  async getCourseCapacity(courseId: string): Promise<CourseCapacity> {
    try {
      const response: AxiosResponse<{data: CourseCapacity}> = await this.api.get(`/sis/courses/${courseId}/capacity`)
      return response.data.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to fetch course capacity')
    }
  }

  async bulkEnroll(enrollments: EnrollmentDto[]): Promise<Enrollment[]> {
    try {
      const response: AxiosResponse<{data: Enrollment[]}> = await this.api.post('/sis/enrollments/bulk', { enrollments })
      return response.data.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to bulk enroll students')
    }
  }

  async validateEnrollment(studentId: string, courseId: string): Promise<{
    isValid: boolean
    errors: string[]
    warnings: string[]
  }> {
    try {
      const response = await this.api.post('/sis/enrollments/validate', { studentId, courseId })
      return response.data.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to validate enrollment')
    }
  }

  async getEnrollmentStatistics(semester: string, year: number): Promise<{
    totalEnrollments: number
    activeEnrollments: number
    droppedEnrollments: number
    waitlistTotal: number
    enrollmentRate: number
    dropRate: number
  }> {
    try {
      const response = await this.api.get(`/sis/enrollments/statistics?semester=${semester}&year=${year}`)
      return response.data.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to fetch enrollment statistics')
    }
  }
}

export const enrollmentService = new EnrollmentService()
export type { 
  EnrollmentService, 
  Enrollment, 
  EnrollmentDto, 
  EnrollmentRequest, 
  EnrollmentRequestDto, 
  Waitlist, 
  WaitlistDto, 
  EnrollmentPeriod, 
  EnrollmentPeriodDto, 
  EnrollmentSummary, 
  CourseCapacity 
}
