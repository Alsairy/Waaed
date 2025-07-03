import axios, { AxiosResponse } from 'axios'

const API_BASE_URL = (import.meta.env?.VITE_API_BASE_URL as string) || 'http://localhost:5000/api'

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
  schedule?: CourseSchedule[]
  prerequisites?: string[]
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
  prerequisites?: string[]
}

interface CourseSchedule {
  id: string
  courseId: string
  dayOfWeek: string
  startTime: string
  endTime: string
  room?: string
  building?: string
}

interface CourseScheduleDto {
  courseId: string
  dayOfWeek: string
  startTime: string
  endTime: string
  room?: string
  building?: string
}

interface CourseEnrollment {
  id: string
  courseId: string
  studentId: string
  enrollmentDate: string
  status: string
  grade?: string
  finalGrade?: number
  credits: number
}

class CoursesService {
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

  async getCourses(semester?: string, year?: number, instructorId?: string): Promise<Course[]> {
    try {
      const params = new URLSearchParams()
      if (semester) params.append('semester', semester)
      if (year) params.append('year', year.toString())
      if (instructorId) params.append('instructorId', instructorId)
      
      const url = `/lms/courses${params.toString() ? '?' + params.toString() : ''}`
      const response: AxiosResponse<{data: Course[]}> = await this.api.get(url)
      return response.data.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to fetch courses')
    }
  }

  async getCourse(id: string): Promise<Course> {
    try {
      const response: AxiosResponse<{data: Course}> = await this.api.get(`/lms/courses/${id}`)
      return response.data.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to fetch course')
    }
  }

  async createCourse(courseData: CourseDto): Promise<Course> {
    try {
      const response: AxiosResponse<{data: Course}> = await this.api.post('/lms/courses', courseData)
      return response.data.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to create course')
    }
  }

  async updateCourse(id: string, courseData: Partial<CourseDto>): Promise<void> {
    try {
      await this.api.put(`/lms/courses/${id}`, courseData)
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to update course')
    }
  }

  async deleteCourse(id: string): Promise<void> {
    try {
      await this.api.delete(`/lms/courses/${id}`)
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to delete course')
    }
  }

  async getCourseSchedule(courseId: string): Promise<CourseSchedule[]> {
    try {
      const response: AxiosResponse<{data: CourseSchedule[]}> = await this.api.get(`/lms/courses/${courseId}/schedule`)
      return response.data.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to fetch course schedule')
    }
  }

  async createCourseSchedule(scheduleData: CourseScheduleDto): Promise<CourseSchedule> {
    try {
      const response: AxiosResponse<{data: CourseSchedule}> = await this.api.post('/lms/courses/schedule', scheduleData)
      return response.data.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to create course schedule')
    }
  }

  async updateCourseSchedule(id: string, scheduleData: Partial<CourseScheduleDto>): Promise<void> {
    try {
      await this.api.put(`/lms/courses/schedule/${id}`, scheduleData)
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to update course schedule')
    }
  }

  async deleteCourseSchedule(id: string): Promise<void> {
    try {
      await this.api.delete(`/lms/courses/schedule/${id}`)
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to delete course schedule')
    }
  }

  async getCourseEnrollments(courseId: string): Promise<CourseEnrollment[]> {
    try {
      const response: AxiosResponse<{data: CourseEnrollment[]}> = await this.api.get(`/lms/courses/${courseId}/enrollments`)
      return response.data.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to fetch course enrollments')
    }
  }

  async enrollStudent(courseId: string, studentId: string): Promise<CourseEnrollment> {
    try {
      const response: AxiosResponse<{data: CourseEnrollment}> = await this.api.post(`/lms/courses/${courseId}/enroll`, {
        studentId
      })
      return response.data.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to enroll student')
    }
  }

  async unenrollStudent(courseId: string, studentId: string): Promise<void> {
    try {
      await this.api.delete(`/lms/courses/${courseId}/enroll/${studentId}`)
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to unenroll student')
    }
  }

  async getCoursesByStudent(studentId: string): Promise<Course[]> {
    try {
      const response: AxiosResponse<{data: Course[]}> = await this.api.get(`/lms/courses?studentId=${studentId}`)
      return response.data.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to fetch student courses')
    }
  }

  async getCoursesByInstructor(instructorId: string): Promise<Course[]> {
    try {
      const response: AxiosResponse<{data: Course[]}> = await this.api.get(`/lms/courses?instructorId=${instructorId}`)
      return response.data.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to fetch instructor courses')
    }
  }

  async searchCourses(query: string): Promise<Course[]> {
    try {
      const response: AxiosResponse<{data: Course[]}> = await this.api.get(`/lms/courses/search?q=${encodeURIComponent(query)}`)
      return response.data.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to search courses')
    }
  }

  async getCourseStatistics(courseId: string): Promise<{
    totalStudents: number
    activeStudents: number
    completionRate: number
    averageGrade: number
    assignmentCount: number
    submissionRate: number
  }> {
    try {
      const response = await this.api.get(`/lms/courses/${courseId}/statistics`)
      return response.data.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to fetch course statistics')
    }
  }
}

export const coursesService = new CoursesService()
export type { CoursesService, Course, CourseDto, CourseSchedule, CourseScheduleDto, CourseEnrollment }
