import axios, { AxiosResponse } from 'axios'

const API_BASE_URL = (import.meta.env?.VITE_API_BASE_URL as string) || 'http://staging-api.waaed.sa/api'

interface Student {
  id: string
  firstName: string
  lastName: string
  email: string
  phoneNumber?: string
  dateOfBirth: string
  gender: string
  address?: string
  guardianName?: string
  guardianPhone?: string
  guardianEmail?: string
  enrollmentDate: string
  studentId: string
  grade?: string
  section?: string
  status: string
  enrollmentStatus: 'active' | 'inactive' | 'graduated' | 'transferred'
  profilePictureUrl?: string
  emergencyContact?: string
  medicalInfo?: string
  createdAt: string
  updatedAt?: string
}

interface StudentDto {
  firstName: string
  lastName: string
  email: string
  phoneNumber?: string
  dateOfBirth: string
  gender: string
  address?: string
  guardianName?: string
  guardianPhone?: string
  guardianEmail?: string
  studentId: string
  grade?: string
  section?: string
  emergencyContact?: string
  medicalInfo?: string
}

interface Enrollment {
  id: string
  studentId: string
  courseId: string
  enrollmentDate: string
  status: string
  grade?: string
  credits?: number
}

interface EnrollmentDto {
  studentId: string
  courseId: string
  enrollmentDate: string
  status: string
}

class SISService {
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

  async getStudents(): Promise<Student[]> {
    try {
      const response: AxiosResponse<{data: Student[]}> = await this.api.get('/sis/students')
      return response.data.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to fetch students')
    }
  }

  async getStudent(id: string): Promise<Student> {
    try {
      const response: AxiosResponse<{data: Student}> = await this.api.get(`/sis/students/${id}`)
      return response.data.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to fetch student')
    }
  }

  async createStudent(studentData: StudentDto): Promise<Student> {
    try {
      const response: AxiosResponse<{data: Student}> = await this.api.post('/sis/students', studentData)
      return response.data.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to create student')
    }
  }

  async updateStudent(id: string, studentData: StudentDto): Promise<void> {
    try {
      await this.api.put(`/sis/students/${id}`, studentData)
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to update student')
    }
  }

  async deleteStudent(id: string): Promise<void> {
    try {
      await this.api.delete(`/sis/students/${id}`)
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to delete student')
    }
  }

  async getEnrollments(studentId?: string): Promise<Enrollment[]> {
    try {
      const url = studentId ? `/sis/enrollments?studentId=${studentId}` : '/sis/enrollments'
      const response: AxiosResponse<{data: Enrollment[]}> = await this.api.get(url)
      return response.data.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to fetch enrollments')
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

  async deleteEnrollment(id: string): Promise<void> {
    try {
      await this.api.delete(`/sis/enrollments/${id}`)
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to delete enrollment')
    }
  }

  async getStudentsByGrade(grade: string): Promise<Student[]> {
    try {
      const response: AxiosResponse<{data: Student[]}> = await this.api.get(`/sis/students?grade=${grade}`)
      return response.data.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to fetch students by grade')
    }
  }

  async getStudentsBySection(section: string): Promise<Student[]> {
    try {
      const response: AxiosResponse<{data: Student[]}> = await this.api.get(`/sis/students?section=${section}`)
      return response.data.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to fetch students by section')
    }
  }

  async searchStudents(query: string): Promise<Student[]> {
    try {
      const response: AxiosResponse<{data: Student[]}> = await this.api.get(`/sis/students/search?q=${encodeURIComponent(query)}`)
      return response.data.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to search students')
    }
  }
}

export const sisService = new SISService()
export type { SISService, Student, StudentDto, Enrollment, EnrollmentDto }
