import axios, { AxiosResponse } from 'axios'

const API_BASE_URL = (import.meta.env?.VITE_API_BASE_URL as string) || 'http://localhost:5000/api'

interface Book {
  id: string
  title: string
  author: string
  isbn: string
  publisher?: string
  publishedDate?: string
  category: string
  language: string
  totalCopies: number
  availableCopies: number
  location?: string
  description?: string
  coverImageUrl?: string
  status: string
  createdAt: string
  updatedAt?: string
}

interface BookDto {
  title: string
  author: string
  isbn: string
  publisher?: string
  publishedDate?: string
  category: string
  language: string
  totalCopies: number
  location?: string
  description?: string
  coverImageUrl?: string
}

interface Member {
  id: string
  studentId?: string
  employeeId?: string
  firstName: string
  lastName: string
  email: string
  phoneNumber?: string
  membershipType: string
  membershipDate: string
  expiryDate: string
  status: string
  maxBooksAllowed: number
  currentBooksIssued: number
  createdAt: string
  updatedAt?: string
}

interface MemberDto {
  studentId?: string
  employeeId?: string
  firstName: string
  lastName: string
  email: string
  phoneNumber?: string
  membershipType: string
  membershipDate: string
  expiryDate: string
  maxBooksAllowed: number
}

interface BookIssue {
  id: string
  bookId: string
  memberId: string
  issueDate: string
  dueDate: string
  returnDate?: string
  status: string
  renewalCount: number
  notes?: string
  issuedBy: string
  returnedBy?: string
  createdAt: string
  updatedAt?: string
}

interface BookIssueDto {
  bookId: string
  memberId: string
  dueDate: string
  notes?: string
}

interface BookReservation {
  id: string
  bookId: string
  memberId: string
  reservationDate: string
  expiryDate: string
  status: string
  notificationSent: boolean
  createdAt: string
  updatedAt?: string
}

interface BookReservationDto {
  bookId: string
  memberId: string
  expiryDate: string
}

interface Fine {
  id: string
  memberId: string
  bookIssueId: string
  amount: number
  reason: string
  fineDate: string
  paidDate?: string
  status: string
  waived: boolean
  waivedBy?: string
  waivedReason?: string
  createdAt: string
  updatedAt?: string
}

interface FineDto {
  memberId: string
  bookIssueId: string
  amount: number
  reason: string
  fineDate: string
}

interface LibraryReport {
  id: string
  title: string
  type: string
  period: string
  data: any
  generatedAt: string
  generatedBy: string
}

class LibraryService {
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

  async getBooks(category?: string, author?: string, available?: boolean): Promise<Book[]> {
    try {
      const params = new URLSearchParams()
      if (category) params.append('category', category)
      if (author) params.append('author', author)
      if (available !== undefined) params.append('available', available.toString())
      
      const url = `/library/books${params.toString() ? '?' + params.toString() : ''}`
      const response: AxiosResponse<{data: Book[]}> = await this.api.get(url)
      return response.data.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to fetch books')
    }
  }

  async getBook(id: string): Promise<Book> {
    try {
      const response: AxiosResponse<{data: Book}> = await this.api.get(`/library/books/${id}`)
      return response.data.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to fetch book')
    }
  }

  async createBook(bookData: BookDto): Promise<Book> {
    try {
      const response: AxiosResponse<{data: Book}> = await this.api.post('/library/books', bookData)
      return response.data.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to create book')
    }
  }

  async updateBook(id: string, bookData: Partial<BookDto>): Promise<void> {
    try {
      await this.api.put(`/library/books/${id}`, bookData)
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to update book')
    }
  }

  async deleteBook(id: string): Promise<void> {
    try {
      await this.api.delete(`/library/books/${id}`)
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to delete book')
    }
  }

  async searchBooks(query: string): Promise<Book[]> {
    try {
      const response: AxiosResponse<{data: Book[]}> = await this.api.get(`/library/books/search?q=${encodeURIComponent(query)}`)
      return response.data.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to search books')
    }
  }

  async getMembers(): Promise<Member[]> {
    try {
      const response: AxiosResponse<{data: Member[]}> = await this.api.get('/library/members')
      return response.data.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to fetch members')
    }
  }

  async getMember(id: string): Promise<Member> {
    try {
      const response: AxiosResponse<{data: Member}> = await this.api.get(`/library/members/${id}`)
      return response.data.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to fetch member')
    }
  }

  async createMember(memberData: MemberDto): Promise<Member> {
    try {
      const response: AxiosResponse<{data: Member}> = await this.api.post('/library/members', memberData)
      return response.data.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to create member')
    }
  }

  async updateMember(id: string, memberData: Partial<MemberDto>): Promise<void> {
    try {
      await this.api.put(`/library/members/${id}`, memberData)
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to update member')
    }
  }

  async getBookIssues(memberId?: string, bookId?: string): Promise<BookIssue[]> {
    try {
      const params = new URLSearchParams()
      if (memberId) params.append('memberId', memberId)
      if (bookId) params.append('bookId', bookId)
      
      const url = `/library/bookissues${params.toString() ? '?' + params.toString() : ''}`
      const response: AxiosResponse<{data: BookIssue[]}> = await this.api.get(url)
      return response.data.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to fetch book issues')
    }
  }

  async issueBook(issueData: BookIssueDto): Promise<BookIssue> {
    try {
      const response: AxiosResponse<{data: BookIssue}> = await this.api.post('/library/bookissues', issueData)
      return response.data.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to issue book')
    }
  }

  async returnBook(issueId: string, notes?: string): Promise<void> {
    try {
      await this.api.put(`/library/bookissues/${issueId}/return`, { notes })
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to return book')
    }
  }

  async renewBook(issueId: string, newDueDate: string): Promise<void> {
    try {
      await this.api.put(`/library/bookissues/${issueId}/renew`, { newDueDate })
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to renew book')
    }
  }

  async getBookReservations(memberId?: string, bookId?: string): Promise<BookReservation[]> {
    try {
      const params = new URLSearchParams()
      if (memberId) params.append('memberId', memberId)
      if (bookId) params.append('bookId', bookId)
      
      const url = `/library/bookreservations${params.toString() ? '?' + params.toString() : ''}`
      const response: AxiosResponse<{data: BookReservation[]}> = await this.api.get(url)
      return response.data.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to fetch book reservations')
    }
  }

  async createReservation(reservationData: BookReservationDto): Promise<BookReservation> {
    try {
      const response: AxiosResponse<{data: BookReservation}> = await this.api.post('/library/bookreservations', reservationData)
      return response.data.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to create reservation')
    }
  }

  async cancelReservation(id: string): Promise<void> {
    try {
      await this.api.delete(`/library/bookreservations/${id}`)
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to cancel reservation')
    }
  }

  async getFines(memberId?: string): Promise<Fine[]> {
    try {
      const url = memberId ? `/library/fines?memberId=${memberId}` : '/library/fines'
      const response: AxiosResponse<{data: Fine[]}> = await this.api.get(url)
      return response.data.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to fetch fines')
    }
  }

  async createFine(fineData: FineDto): Promise<Fine> {
    try {
      const response: AxiosResponse<{data: Fine}> = await this.api.post('/library/fines', fineData)
      return response.data.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to create fine')
    }
  }

  async payFine(fineId: string): Promise<void> {
    try {
      await this.api.put(`/library/fines/${fineId}/pay`)
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to pay fine')
    }
  }

  async waiveFine(fineId: string, reason: string): Promise<void> {
    try {
      await this.api.put(`/library/fines/${fineId}/waive`, { reason })
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to waive fine')
    }
  }

  async getLibraryReports(type?: string, period?: string): Promise<LibraryReport[]> {
    try {
      const params = new URLSearchParams()
      if (type) params.append('type', type)
      if (period) params.append('period', period)
      
      const url = `/library/reports${params.toString() ? '?' + params.toString() : ''}`
      const response: AxiosResponse<{data: LibraryReport[]}> = await this.api.get(url)
      return response.data.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to fetch library reports')
    }
  }

  async generateLibraryReport(type: string, period: string, parameters?: Record<string, unknown>): Promise<LibraryReport> {
    try {
      const response: AxiosResponse<{data: LibraryReport}> = await this.api.post('/library/reports', {
        type,
        period,
        parameters
      })
      return response.data.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to generate library report')
    }
  }

  async getCirculationStats(): Promise<{
    totalBooks: number
    availableBooks: number
    issuedBooks: number
    overdueBooks: number
    reservedBooks: number
    totalMembers: number
    activeMembers: number
  }> {
    try {
      const response = await this.api.get('/library/circulation/stats')
      return response.data.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to fetch circulation stats')
    }
  }
}

export const libraryService = new LibraryService()
export type { 
  LibraryService, 
  Book, 
  BookDto, 
  Member, 
  MemberDto, 
  BookIssue, 
  BookIssueDto, 
  BookReservation, 
  BookReservationDto, 
  Fine, 
  FineDto, 
  LibraryReport 
}
