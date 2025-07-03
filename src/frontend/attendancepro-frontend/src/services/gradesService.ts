import axios, { AxiosResponse } from 'axios'

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:5000/api'

interface Grade {
  id: string
  studentId: string
  studentName?: string
  courseId: string
  courseName?: string
  assignmentId?: string
  assignmentName?: string
  grade: number
  maxPoints: number
  percentage: number
  letterGrade: string
  gradePoints: number
  weight?: number
  category?: string
  comments?: string
  gradedAt: string
  gradedBy: string
  gradedByName?: string
  isExcused: boolean
  isDropped: boolean
}

interface GradeDto {
  studentId: string
  courseId: string
  assignmentId?: string
  grade: number
  maxPoints: number
  weight?: number
  category?: string
  comments?: string
  isExcused?: boolean
}

interface GradeCategory {
  id: string
  courseId: string
  name: string
  weight: number
  dropLowest?: number
  description?: string
  isActive: boolean
}

interface GradeCategoryDto {
  courseId: string
  name: string
  weight: number
  dropLowest?: number
  description?: string
}

interface GradeBook {
  courseId: string
  courseName: string
  students: GradeBookStudent[]
  assignments: GradeBookAssignment[]
  categories: GradeCategory[]
  gradingScale: GradingScale[]
}

interface GradeBookStudent {
  studentId: string
  studentName: string
  email: string
  grades: Grade[]
  courseGrade?: CourseGrade
}

interface GradeBookAssignment {
  assignmentId: string
  assignmentName: string
  maxPoints: number
  dueDate: string
  category?: string
  weight?: number
}

interface CourseGrade {
  studentId: string
  courseId: string
  currentGrade: number
  currentLetterGrade: string
  currentGradePoints: number
  finalGrade?: number
  finalLetterGrade?: string
  finalGradePoints?: number
  isComplete: boolean
  creditsEarned: number
  semester: string
  year: number
}

interface GradingScale {
  letterGrade: string
  minPercentage: number
  maxPercentage: number
  gradePoints: number
  description?: string
}

interface Transcript {
  studentId: string
  studentName: string
  studentEmail: string
  courses: TranscriptCourse[]
  cumulativeGPA: number
  totalCredits: number
  totalGradePoints: number
  academicStanding: string
  generatedAt: string
}

interface TranscriptCourse {
  courseId: string
  courseCode: string
  courseName: string
  credits: number
  semester: string
  year: number
  finalGrade: number
  letterGrade: string
  gradePoints: number
  isTransfer: boolean
}

interface GradeReport {
  studentId: string
  courseId: string
  reportType: string
  period: string
  grades: Grade[]
  summary: {
    totalAssignments: number
    completedAssignments: number
    averageGrade: number
    letterGrade: string
    trend: string
  }
  generatedAt: string
}

class GradesService {
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

  async getGrades(studentId?: string, courseId?: string, assignmentId?: string): Promise<Grade[]> {
    try {
      const params = new URLSearchParams()
      if (studentId) params.append('studentId', studentId)
      if (courseId) params.append('courseId', courseId)
      if (assignmentId) params.append('assignmentId', assignmentId)
      
      const url = `/lms/grades${params.toString() ? '?' + params.toString() : ''}`
      const response: AxiosResponse<{data: Grade[]}> = await this.api.get(url)
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch grades')
    }
  }

  async getGrade(id: string): Promise<Grade> {
    try {
      const response: AxiosResponse<{data: Grade}> = await this.api.get(`/lms/grades/${id}`)
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch grade')
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

  async deleteGrade(id: string): Promise<void> {
    try {
      await this.api.delete(`/lms/grades/${id}`)
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete grade')
    }
  }

  async getGradeBook(courseId: string): Promise<GradeBook> {
    try {
      const response: AxiosResponse<{data: GradeBook}> = await this.api.get(`/lms/courses/${courseId}/gradebook`)
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch grade book')
    }
  }

  async getStudentGrades(studentId: string, courseId?: string): Promise<Grade[]> {
    try {
      const url = courseId 
        ? `/lms/grades?studentId=${studentId}&courseId=${courseId}`
        : `/lms/grades?studentId=${studentId}`
      const response: AxiosResponse<{data: Grade[]}> = await this.api.get(url)
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch student grades')
    }
  }

  async getCourseGrades(courseId: string): Promise<Grade[]> {
    try {
      const response: AxiosResponse<{data: Grade[]}> = await this.api.get(`/lms/grades?courseId=${courseId}`)
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch course grades')
    }
  }

  async getGradeCategories(courseId: string): Promise<GradeCategory[]> {
    try {
      const response: AxiosResponse<{data: GradeCategory[]}> = await this.api.get(`/lms/courses/${courseId}/grade-categories`)
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch grade categories')
    }
  }

  async createGradeCategory(categoryData: GradeCategoryDto): Promise<GradeCategory> {
    try {
      const response: AxiosResponse<{data: GradeCategory}> = await this.api.post('/lms/grade-categories', categoryData)
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create grade category')
    }
  }

  async updateGradeCategory(id: string, categoryData: Partial<GradeCategoryDto>): Promise<void> {
    try {
      await this.api.put(`/lms/grade-categories/${id}`, categoryData)
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update grade category')
    }
  }

  async getCourseGrade(studentId: string, courseId: string): Promise<CourseGrade> {
    try {
      const response: AxiosResponse<{data: CourseGrade}> = await this.api.get(`/lms/courses/${courseId}/students/${studentId}/grade`)
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch course grade')
    }
  }

  async calculateCourseGrade(studentId: string, courseId: string): Promise<CourseGrade> {
    try {
      const response: AxiosResponse<{data: CourseGrade}> = await this.api.post(`/lms/courses/${courseId}/students/${studentId}/calculate-grade`)
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to calculate course grade')
    }
  }

  async getTranscript(studentId: string): Promise<Transcript> {
    try {
      const response: AxiosResponse<{data: Transcript}> = await this.api.get(`/lms/students/${studentId}/transcript`)
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch transcript')
    }
  }

  async generateTranscript(studentId: string, includeInProgress?: boolean): Promise<Transcript> {
    try {
      const params = includeInProgress ? '?includeInProgress=true' : ''
      const response: AxiosResponse<{data: Transcript}> = await this.api.post(`/lms/students/${studentId}/transcript/generate${params}`)
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to generate transcript')
    }
  }

  async getGradeReport(studentId: string, courseId: string, reportType: string, period: string): Promise<GradeReport> {
    try {
      const response: AxiosResponse<{data: GradeReport}> = await this.api.get(
        `/lms/students/${studentId}/courses/${courseId}/grade-report?type=${reportType}&period=${period}`
      )
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch grade report')
    }
  }

  async getGradingScale(courseId: string): Promise<GradingScale[]> {
    try {
      const response: AxiosResponse<{data: GradingScale[]}> = await this.api.get(`/lms/courses/${courseId}/grading-scale`)
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch grading scale')
    }
  }

  async updateGradingScale(courseId: string, gradingScale: GradingScale[]): Promise<void> {
    try {
      await this.api.put(`/lms/courses/${courseId}/grading-scale`, { gradingScale })
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update grading scale')
    }
  }

  async bulkUpdateGrades(grades: Partial<GradeDto>[]): Promise<void> {
    try {
      await this.api.put('/lms/grades/bulk', { grades })
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to bulk update grades')
    }
  }

  async excuseGrade(gradeId: string, reason?: string): Promise<void> {
    try {
      await this.api.put(`/lms/grades/${gradeId}/excuse`, { reason })
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to excuse grade')
    }
  }

  async dropGrade(gradeId: string, reason?: string): Promise<void> {
    try {
      await this.api.put(`/lms/grades/${gradeId}/drop`, { reason })
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to drop grade')
    }
  }

  async getGradeStatistics(courseId: string): Promise<{
    averageGrade: number
    medianGrade: number
    highestGrade: number
    lowestGrade: number
    passingRate: number
    gradeDistribution: { [key: string]: number }
  }> {
    try {
      const response = await this.api.get(`/lms/courses/${courseId}/grade-statistics`)
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch grade statistics')
    }
  }
}

export const gradesService = new GradesService()
export type { 
  GradesService, 
  Grade, 
  GradeDto, 
  GradeCategory, 
  GradeCategoryDto, 
  GradeBook, 
  GradeBookStudent, 
  GradeBookAssignment, 
  CourseGrade, 
  GradingScale, 
  Transcript, 
  TranscriptCourse, 
  GradeReport 
}
