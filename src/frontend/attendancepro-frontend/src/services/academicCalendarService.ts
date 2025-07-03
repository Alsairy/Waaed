import axios, { AxiosResponse } from 'axios'

const API_BASE_URL = (import.meta.env?.VITE_API_BASE_URL as string) || 'http://localhost:5010/api'

interface AcademicEvent {
  id: string
  title: string
  description?: string
  type: string
  startDate: string
  endDate: string
  isAllDay: boolean
  location?: string
  isRecurring: boolean
  recurrencePattern?: string
  priority: string
  status: string
  color?: string
  academicYearId?: string
  academicYearName?: string
  semesterId?: string
  semesterName?: string
  createdBy: string
  createdAt: string
  updatedAt?: string
}

interface AcademicEventDto {
  title: string
  description?: string
  type: string
  startDate: string
  endDate: string
  isAllDay: boolean
  location?: string
  isRecurring: boolean
  recurrencePattern?: string
  priority: string
  status: string
  color?: string
  academicYearId?: string
  semesterId?: string
}

interface AcademicYear {
  id: string
  name: string
  startDate: string
  endDate: string
  isActive: boolean
  description?: string
  semesters?: Semester[]
  academicEvents?: AcademicEvent[]
  holidays?: Holiday[]
  createdAt: string
  updatedAt?: string
}

interface AcademicYearDto {
  name: string
  startDate: string
  endDate: string
  isActive: boolean
  description?: string
}

interface Semester {
  id: string
  name: string
  type: string
  startDate: string
  endDate: string
  academicYearId: string
  academicYearName?: string
  isActive: boolean
  academicEvents?: AcademicEvent[]
  createdAt: string
  updatedAt?: string
}

interface SemesterDto {
  name: string
  type: string
  startDate: string
  endDate: string
  academicYearId: string
  isActive: boolean
}

interface AcademicTerm {
  id: string
  name: string
  type: string
  startDate: string
  endDate: string
  year: number
  isActive: boolean
  registrationStartDate?: string
  registrationEndDate?: string
  withdrawalDeadline?: string
  finalExamStartDate?: string
  finalExamEndDate?: string
  gradeSubmissionDeadline?: string
  description?: string
  createdAt: string
  updatedAt?: string
}

interface AcademicTermDto {
  name: string
  type: string
  startDate: string
  endDate: string
  year: number
  registrationStartDate?: string
  registrationEndDate?: string
  withdrawalDeadline?: string
  finalExamStartDate?: string
  finalExamEndDate?: string
  gradeSubmissionDeadline?: string
  description?: string
}

interface Holiday {
  id: string
  name: string
  date: string
  description?: string
  type: string
  isRecurring: boolean
  isObserved: boolean
  academicYearId?: string
  academicYearName?: string
  createdAt: string
  updatedAt?: string
}

interface HolidayDto {
  name: string
  date: string
  description?: string
  type: string
  isRecurring: boolean
  isObserved: boolean
  academicYearId?: string
}

interface ExamSchedule {
  id: string
  courseId: string
  courseName?: string
  courseCode?: string
  examType: string
  examDate: string
  startTime: string
  endTime: string
  location?: string
  duration: number
  instructions?: string
  materials?: string[]
  invigilators?: string[]
  students?: string[]
  status: string
  createdAt: string
  updatedAt?: string
}

interface ExamScheduleDto {
  courseId: string
  examType: string
  examDate: string
  startTime: string
  endTime: string
  location?: string
  duration: number
  instructions?: string
  materials?: string[]
  invigilators?: string[]
}

interface ClassSchedule {
  id: string
  courseId: string
  courseName?: string
  courseCode?: string
  dayOfWeek: number
  startTime: string
  endTime: string
  location?: string
  instructorId: string
  instructorName?: string
  semester: string
  year: number
  isActive: boolean
  createdAt: string
  updatedAt?: string
}

interface ClassScheduleDto {
  courseId: string
  dayOfWeek: number
  startTime: string
  endTime: string
  location?: string
  instructorId: string
  semester: string
  year: number
}

interface CalendarView {
  events: AcademicEvent[]
  academicYears: AcademicYear[]
  semesters: Semester[]
  holidays: Holiday[]
  examSchedules: ExamSchedule[]
  classSchedules: ClassSchedule[]
  startDate: string
  endDate: string
}

class AcademicCalendarService {
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

  async getAcademicYears(): Promise<AcademicYear[]> {
    try {
      const response: AxiosResponse<AcademicYear[]> = await this.api.get('/academic-years')
      return response.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to fetch academic years')
    }
  }

  async getAcademicYear(id: string): Promise<AcademicYear> {
    try {
      const response: AxiosResponse<AcademicYear> = await this.api.get(`/academic-years/${id}`)
      return response.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to fetch academic year')
    }
  }

  async createAcademicYear(yearData: AcademicYearDto): Promise<AcademicYear> {
    try {
      const response: AxiosResponse<AcademicYear> = await this.api.post('/academic-years', yearData)
      return response.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to create academic year')
    }
  }

  async updateAcademicYear(id: string, yearData: Partial<AcademicYearDto>): Promise<void> {
    try {
      await this.api.put(`/academic-years/${id}`, yearData)
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to update academic year')
    }
  }

  async deleteAcademicYear(id: string): Promise<void> {
    try {
      await this.api.delete(`/academic-years/${id}`)
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to delete academic year')
    }
  }

  async getSemesters(academicYearId?: string): Promise<Semester[]> {
    try {
      const params = new URLSearchParams()
      if (academicYearId) params.append('academicYearId', academicYearId)
      
      const url = `/semesters${params.toString() ? '?' + params.toString() : ''}`
      const response: AxiosResponse<Semester[]> = await this.api.get(url)
      return response.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to fetch semesters')
    }
  }

  async getSemester(id: string): Promise<Semester> {
    try {
      const response: AxiosResponse<Semester> = await this.api.get(`/semesters/${id}`)
      return response.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to fetch semester')
    }
  }

  async createSemester(semesterData: SemesterDto): Promise<Semester> {
    try {
      const response: AxiosResponse<Semester> = await this.api.post('/semesters', semesterData)
      return response.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to create semester')
    }
  }

  async updateSemester(id: string, semesterData: Partial<SemesterDto>): Promise<void> {
    try {
      await this.api.put(`/semesters/${id}`, semesterData)
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to update semester')
    }
  }

  async deleteSemester(id: string): Promise<void> {
    try {
      await this.api.delete(`/semesters/${id}`)
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to delete semester')
    }
  }

  async getAcademicEvents(startDate?: string, endDate?: string, eventType?: string): Promise<AcademicEvent[]> {
    try {
      const params = new URLSearchParams()
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)
      if (eventType) params.append('type', eventType)
      
      const url = `/academic-events${params.toString() ? '?' + params.toString() : ''}`
      const response: AxiosResponse<AcademicEvent[]> = await this.api.get(url)
      return response.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to fetch academic events')
    }
  }

  async getAcademicEvent(id: string): Promise<AcademicEvent> {
    try {
      const response: AxiosResponse<AcademicEvent> = await this.api.get(`/academic-events/${id}`)
      return response.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to fetch academic event')
    }
  }

  async createAcademicEvent(eventData: AcademicEventDto): Promise<AcademicEvent> {
    try {
      const response: AxiosResponse<AcademicEvent> = await this.api.post('/academic-events', eventData)
      return response.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to create academic event')
    }
  }

  async updateAcademicEvent(id: string, eventData: Partial<AcademicEventDto>): Promise<void> {
    try {
      await this.api.put(`/academic-events/${id}`, eventData)
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to update academic event')
    }
  }

  async deleteAcademicEvent(id: string): Promise<void> {
    try {
      await this.api.delete(`/academic-events/${id}`)
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to delete academic event')
    }
  }

  async getAcademicTerms(year?: number): Promise<AcademicTerm[]> {
    try {
      const url = year ? `/sis/academic-terms?year=${year}` : '/sis/academic-terms'
      const response: AxiosResponse<{data: AcademicTerm[]}> = await this.api.get(url)
      return response.data.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to fetch academic terms')
    }
  }

  async getAcademicTerm(id: string): Promise<AcademicTerm> {
    try {
      const response: AxiosResponse<{data: AcademicTerm}> = await this.api.get(`/sis/academic-terms/${id}`)
      return response.data.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to fetch academic term')
    }
  }

  async getCurrentAcademicTerm(): Promise<AcademicTerm | null> {
    try {
      const response: AxiosResponse<{data: AcademicTerm}> = await this.api.get('/sis/academic-terms/current')
      return response.data.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { status?: number; data?: { message?: string } } }
      if (errorObj.response?.status === 404) {
        return null
      }
      throw new Error(errorObj.response?.data?.message || 'Failed to fetch current academic term')
    }
  }

  async createAcademicTerm(termData: AcademicTermDto): Promise<AcademicTerm> {
    try {
      const response: AxiosResponse<{data: AcademicTerm}> = await this.api.post('/sis/academic-terms', termData)
      return response.data.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to create academic term')
    }
  }

  async updateAcademicTerm(id: string, termData: Partial<AcademicTermDto>): Promise<void> {
    try {
      await this.api.put(`/sis/academic-terms/${id}`, termData)
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to update academic term')
    }
  }

  async getHolidays(startDate?: string, endDate?: string): Promise<Holiday[]> {
    try {
      const params = new URLSearchParams()
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)
      
      const url = `/holidays${params.toString() ? '?' + params.toString() : ''}`
      const response: AxiosResponse<Holiday[]> = await this.api.get(url)
      return response.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to fetch holidays')
    }
  }

  async createHoliday(holidayData: HolidayDto): Promise<Holiday> {
    try {
      const response: AxiosResponse<Holiday> = await this.api.post('/holidays', holidayData)
      return response.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to create holiday')
    }
  }

  async updateHoliday(id: string, holidayData: Partial<HolidayDto>): Promise<void> {
    try {
      await this.api.put(`/holidays/${id}`, holidayData)
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to update holiday')
    }
  }

  async getExamSchedules(courseId?: string, examType?: string, startDate?: string, endDate?: string): Promise<ExamSchedule[]> {
    try {
      const params = new URLSearchParams()
      if (courseId) params.append('courseId', courseId)
      if (examType) params.append('examType', examType)
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)
      
      const url = `/sis/exam-schedules${params.toString() ? '?' + params.toString() : ''}`
      const response: AxiosResponse<{data: ExamSchedule[]}> = await this.api.get(url)
      return response.data.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to fetch exam schedules')
    }
  }

  async createExamSchedule(examData: ExamScheduleDto): Promise<ExamSchedule> {
    try {
      const response: AxiosResponse<{data: ExamSchedule}> = await this.api.post('/sis/exam-schedules', examData)
      return response.data.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to create exam schedule')
    }
  }

  async updateExamSchedule(id: string, examData: Partial<ExamScheduleDto>): Promise<void> {
    try {
      await this.api.put(`/sis/exam-schedules/${id}`, examData)
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to update exam schedule')
    }
  }

  async getClassSchedules(courseId?: string, instructorId?: string, semester?: string, year?: number): Promise<ClassSchedule[]> {
    try {
      const params = new URLSearchParams()
      if (courseId) params.append('courseId', courseId)
      if (instructorId) params.append('instructorId', instructorId)
      if (semester) params.append('semester', semester)
      if (year) params.append('year', year.toString())
      
      const url = `/sis/class-schedules${params.toString() ? '?' + params.toString() : ''}`
      const response: AxiosResponse<{data: ClassSchedule[]}> = await this.api.get(url)
      return response.data.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to fetch class schedules')
    }
  }

  async createClassSchedule(scheduleData: ClassScheduleDto): Promise<ClassSchedule> {
    try {
      const response: AxiosResponse<{data: ClassSchedule}> = await this.api.post('/sis/class-schedules', scheduleData)
      return response.data.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to create class schedule')
    }
  }

  async updateClassSchedule(id: string, scheduleData: Partial<ClassScheduleDto>): Promise<void> {
    try {
      await this.api.put(`/sis/class-schedules/${id}`, scheduleData)
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to update class schedule')
    }
  }

  async getStudentSchedule(studentId: string, semester: string, year: number): Promise<ClassSchedule[]> {
    try {
      const response: AxiosResponse<{data: ClassSchedule[]}> = await this.api.get(
        `/sis/students/${studentId}/schedule?semester=${semester}&year=${year}`
      )
      return response.data.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to fetch student schedule')
    }
  }

  async getInstructorSchedule(instructorId: string, semester: string, year: number): Promise<ClassSchedule[]> {
    try {
      const response: AxiosResponse<{data: ClassSchedule[]}> = await this.api.get(
        `/sis/instructors/${instructorId}/schedule?semester=${semester}&year=${year}`
      )
      return response.data.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to fetch instructor schedule')
    }
  }

  async getCalendarView(startDate: string, endDate: string, userId?: string, userType?: string): Promise<CalendarView> {
    try {
      const params = new URLSearchParams()
      params.append('startDate', startDate)
      params.append('endDate', endDate)
      if (userId) params.append('userId', userId)
      if (userType) params.append('userType', userType)
      
      const response: AxiosResponse<{data: CalendarView}> = await this.api.get(`/sis/calendar?${params.toString()}`)
      return response.data.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to fetch calendar view')
    }
  }

  async getUpcomingEvents(userId: string, userType: string, days?: number): Promise<AcademicEvent[]> {
    try {
      const params = new URLSearchParams()
      params.append('userId', userId)
      params.append('userType', userType)
      if (days) params.append('days', days.toString())
      
      const response: AxiosResponse<{data: AcademicEvent[]}> = await this.api.get(`/sis/calendar/upcoming?${params.toString()}`)
      return response.data.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to fetch upcoming events')
    }
  }

  async getEventTypes(): Promise<string[]> {
    try {
      const response: AxiosResponse<{data: string[]}> = await this.api.get('/sis/academic-events/types')
      return response.data.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to fetch event types')
    }
  }

  async importCalendar(calendarData: any, format: 'ics' | 'csv'): Promise<{
    imported: number
    errors: string[]
  }> {
    try {
      const response = await this.api.post('/sis/calendar/import', {
        data: calendarData,
        format
      })
      return response.data.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to import calendar')
    }
  }

  async exportCalendar(startDate: string, endDate: string, format: 'ics' | 'csv', userId?: string): Promise<string> {
    try {
      const params = new URLSearchParams()
      params.append('startDate', startDate)
      params.append('endDate', endDate)
      params.append('format', format)
      if (userId) params.append('userId', userId)
      
      const response = await this.api.get(`/sis/calendar/export?${params.toString()}`)
      return response.data.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to export calendar')
    }
  }
}

export const academicCalendarService = new AcademicCalendarService()
export type { 
  AcademicCalendarService, 
  AcademicEvent, 
  AcademicEventDto, 
  AcademicYear,
  AcademicYearDto,
  Semester,
  SemesterDto,
  AcademicTerm, 
  AcademicTermDto, 
  Holiday, 
  HolidayDto, 
  ExamSchedule, 
  ExamScheduleDto, 
  ClassSchedule, 
  ClassScheduleDto, 
  CalendarView 
}
