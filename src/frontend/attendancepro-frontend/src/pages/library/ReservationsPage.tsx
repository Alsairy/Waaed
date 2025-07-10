import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Input } from '../../components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Progress } from '../../components/ui/progress'
import { 
  BookOpen, 
  Search, 
  Filter, 
  Download, 
  Eye,
  Edit,
  Clock,
  AlertCircle,
  CheckCircle,
  Settings,
  Mail,
  Bookmark,
  X,
  Check,
  UserCheck,
  BookCheck,
  CalendarDays
} from 'lucide-react'
import { toast } from 'sonner'

interface Reservation {
  id: string
  studentId: string
  studentName: string
  grade: string
  bookId: string
  bookTitle: string
  bookAuthor: string
  isbn: string
  reservationDate: string
  expiryDate: string
  status: 'active' | 'expired' | 'fulfilled' | 'cancelled'
  priority: number
  queuePosition: number
  totalInQueue: number
  notificationSent: boolean
  notes?: string
  reservedBy: string
  fulfilledDate?: string
  cancelledDate?: string
  cancelReason?: string
}

interface ReservationFilters {
  status: string
  grade: string
  priority: string
  searchTerm: string
}

interface ReservationStats {
  totalReservations: number
  activeReservations: number
  expiredReservations: number
  fulfilledToday: number
  averageWaitTime: number
}

interface QuickReservation {
  studentId: string
  bookId: string
}

const ReservationsPage: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [reservationStats, setReservationStats] = useState<ReservationStats>({
    totalReservations: 0,
    activeReservations: 0,
    expiredReservations: 0,
    fulfilledToday: 0,
    averageWaitTime: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('reservations')
  const [filters, setFilters] = useState<ReservationFilters>({
    status: '',
    grade: '',
    priority: '',
    searchTerm: ''
  })
  const [quickReservation, setQuickReservation] = useState<QuickReservation>({
    studentId: '',
    bookId: ''
  })

  useEffect(() => {
    loadReservationData()
  }, [])

  const loadReservationData = async () => {
    try {
      setIsLoading(true)
      
      const mockReservations: Reservation[] = [
        {
          id: '1',
          studentId: 'STU001',
          studentName: 'Ahmed Al-Rashid',
          grade: '11',
          bookId: 'BOOK001',
          bookTitle: 'Advanced Mathematics for Engineers',
          bookAuthor: 'Dr. Ahmed Hassan',
          isbn: '978-0123456789',
          reservationDate: '2024-01-20T10:30:00',
          expiryDate: '2024-02-20T23:59:59',
          status: 'active',
          priority: 1,
          queuePosition: 1,
          totalInQueue: 3,
          notificationSent: false,
          reservedBy: 'Student Portal'
        },
        {
          id: '2',
          studentId: 'STU002',
          studentName: 'Layla Mahmoud',
          grade: '11',
          bookId: 'BOOK002',
          bookTitle: 'الفيزياء الحديثة',
          bookAuthor: 'د. سارة محمد',
          isbn: '978-0987654321',
          reservationDate: '2024-01-15T14:20:00',
          expiryDate: '2024-02-15T23:59:59',
          status: 'fulfilled',
          priority: 1,
          queuePosition: 1,
          totalInQueue: 1,
          notificationSent: true,
          fulfilledDate: '2024-01-25T09:15:00',
          reservedBy: 'Librarian'
        },
        {
          id: '3',
          studentId: 'STU003',
          studentName: 'Omar Hassan',
          grade: '10',
          bookId: 'BOOK003',
          bookTitle: 'Computer Science Fundamentals',
          bookAuthor: 'Prof. Jennifer Smith',
          isbn: '978-0456789123',
          reservationDate: '2024-01-10T09:15:00',
          expiryDate: '2024-02-10T23:59:59',
          status: 'expired',
          priority: 2,
          queuePosition: 2,
          totalInQueue: 4,
          notificationSent: true,
          notes: 'Student did not respond to notification',
          reservedBy: 'Student Portal'
        },
        {
          id: '4',
          studentId: 'STU004',
          studentName: 'Fatima Al-Zahra',
          grade: '12',
          bookId: 'BOOK004',
          bookTitle: 'English Literature Classics',
          bookAuthor: 'Various Authors',
          isbn: '978-0789123456',
          reservationDate: '2024-01-25T11:00:00',
          expiryDate: '2024-02-25T23:59:59',
          status: 'active',
          priority: 2,
          queuePosition: 2,
          totalInQueue: 3,
          notificationSent: false,
          reservedBy: 'Student Portal'
        },
        {
          id: '5',
          studentId: 'STU005',
          studentName: 'Khalid Al-Mansouri',
          grade: '11',
          bookId: 'BOOK005',
          bookTitle: 'Introduction to Chemistry',
          bookAuthor: 'Dr. Omar Al-Rashid',
          isbn: '978-0321654987',
          reservationDate: '2024-01-30T13:30:00',
          expiryDate: '2024-03-01T23:59:59',
          status: 'active',
          priority: 3,
          queuePosition: 3,
          totalInQueue: 3,
          notificationSent: false,
          reservedBy: 'Student Portal'
        },
        {
          id: '6',
          studentId: 'STU006',
          studentName: 'Noor Al-Hashimi',
          grade: '10',
          bookId: 'BOOK006',
          bookTitle: 'History of Islamic Civilization',
          bookAuthor: 'Prof. Fatima Al-Zahra',
          isbn: '978-0654321987',
          reservationDate: '2024-01-12T15:20:00',
          expiryDate: '2024-02-12T23:59:59',
          status: 'cancelled',
          priority: 1,
          queuePosition: 1,
          totalInQueue: 2,
          notificationSent: false,
          cancelledDate: '2024-01-18T10:00:00',
          cancelReason: 'Student no longer needs the book',
          reservedBy: 'Student Portal'
        }
      ]

      setReservations(mockReservations)

      const today = new Date().toDateString()
      const stats: ReservationStats = {
        totalReservations: mockReservations.length,
        activeReservations: mockReservations.filter(r => r.status === 'active').length,
        expiredReservations: mockReservations.filter(r => r.status === 'expired').length,
        fulfilledToday: mockReservations.filter(r => r.fulfilledDate && new Date(r.fulfilledDate).toDateString() === today).length,
        averageWaitTime: 5.2 // Mock average wait time in days
      }
      setReservationStats(stats)

    } catch (error) {
      console.error('Error loading reservation data:', error)
      toast.error('Failed to load reservation data')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'expired': return 'bg-red-100 text-red-800'
      case 'fulfilled': return 'bg-blue-100 text-blue-800'
      case 'cancelled': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return 'bg-red-100 text-red-800'
      case 2: return 'bg-orange-100 text-orange-800'
      case 3: return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 1: return 'High'
      case 2: return 'Medium'
      case 3: return 'Low'
      default: return 'Normal'
    }
  }

  const getDaysUntilExpiry = (expiryDate: string) => {
    const expiry = new Date(expiryDate)
    const today = new Date()
    const diffTime = expiry.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const handleReservationAction = async (action: 'reserve' | 'fulfill' | 'cancel' | 'extend' | 'notify') => {
    try {
      switch (action) {
        case 'reserve':
          if (!quickReservation.studentId || !quickReservation.bookId) {
            toast.error('Please enter both Student ID and Book ID')
            return
          }
          toast.success('Book reserved successfully')
          setQuickReservation({ studentId: '', bookId: '' })
          break
        case 'fulfill':
          toast.success('Reservation fulfilled successfully')
          break
        case 'cancel':
          toast.success('Reservation cancelled successfully')
          break
        case 'extend':
          toast.success('Reservation extended successfully')
          break
        case 'notify':
          toast.success('Notification sent successfully')
          break
      }
      loadReservationData()
    } catch (error) {
      console.error('Reservation action error:', error)
      toast.error(`Failed to ${action} reservation`)
    }
  }

  const handleBulkAction = async (action: 'export' | 'send_notifications' | 'cleanup_expired') => {
    try {
      switch (action) {
        case 'export':
          toast.success('Reservation data exported successfully')
          break
        case 'send_notifications':
          toast.success('Notifications sent successfully')
          break
        case 'cleanup_expired':
          toast.success('Expired reservations cleaned up successfully')
          break
      }
    } catch (error) {
      console.error('Bulk action error:', error)
      toast.error(`Failed to ${action}`)
    }
  }

  const filteredReservations = reservations.filter(reservation => {
    if (filters.status && reservation.status !== filters.status) return false
    if (filters.grade && reservation.grade !== filters.grade) return false
    if (filters.priority && reservation.priority.toString() !== filters.priority) return false
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase()
      return reservation.studentName.toLowerCase().includes(searchLower) ||
             reservation.bookTitle.toLowerCase().includes(searchLower) ||
             reservation.isbn.toLowerCase().includes(searchLower) ||
             reservation.studentId.toLowerCase().includes(searchLower)
    }
    return true
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: '#005F96' }}>
            Book Reservations
          </h1>
          <p className="text-muted-foreground">
            Manage book reservations, queue management, and notifications
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={() => handleBulkAction('export')}>
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
          <Button variant="outline" onClick={() => handleBulkAction('send_notifications')}>
            <Mail className="mr-2 h-4 w-4" />
            Send Notifications
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reservations</CardTitle>
            <Bookmark className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: '#005F96' }}>
              {reservationStats.totalReservations}
            </div>
            <p className="text-xs text-muted-foreground">
              All time records
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Reservations</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: '#36BA91' }}>
              {reservationStats.activeReservations}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently waiting
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired Reservations</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: '#E74C3C' }}>
              {reservationStats.expiredReservations}
            </div>
            <p className="text-xs text-muted-foreground">
              Need cleanup
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fulfilled Today</CardTitle>
            <BookCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: '#F39C12' }}>
              {reservationStats.fulfilledToday}
            </div>
            <p className="text-xs text-muted-foreground">
              Today's fulfillments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Wait Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: '#9B59B6' }}>
              {reservationStats.averageWaitTime} days
            </div>
            <p className="text-xs text-muted-foreground">
              Average wait
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="reservations">Reservation Queue</TabsTrigger>
          <TabsTrigger value="quick_reserve">Quick Reserve</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="reservations" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="mr-2 h-5 w-5" style={{ color: '#005F96' }} />
                Filter Reservations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-5">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search student, book, ISBN..."
                    value={filters.searchTerm}
                    onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                    className="pl-10"
                  />
                </div>
                
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="expired">Expired</option>
                  <option value="fulfilled">Fulfilled</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                <select
                  value={filters.grade}
                  onChange={(e) => setFilters(prev => ({ ...prev, grade: e.target.value }))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                >
                  <option value="">All Grades</option>
                  <option value="9">Grade 9</option>
                  <option value="10">Grade 10</option>
                  <option value="11">Grade 11</option>
                  <option value="12">Grade 12</option>
                </select>

                <select
                  value={filters.priority}
                  onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                >
                  <option value="">All Priorities</option>
                  <option value="1">High Priority</option>
                  <option value="2">Medium Priority</option>
                  <option value="3">Low Priority</option>
                </select>

                <Button variant="outline" onClick={() => setFilters({ status: '', grade: '', priority: '', searchTerm: '' })}>
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Reservation Queue List */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-muted-foreground">Loading reservations...</p>
              </div>
            ) : (
              filteredReservations.map((reservation) => (
                <Card key={reservation.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <CardTitle className="text-lg">{reservation.studentName}</CardTitle>
                          <Badge className="bg-blue-100 text-blue-800">
                            Grade {reservation.grade}
                          </Badge>
                          <Badge className={getStatusColor(reservation.status)}>
                            {reservation.status}
                          </Badge>
                          <Badge className={getPriorityColor(reservation.priority)}>
                            {getPriorityLabel(reservation.priority)} Priority
                          </Badge>
                          <Badge variant="outline">
                            Position {reservation.queuePosition}/{reservation.totalInQueue}
                          </Badge>
                        </div>
                        <CardDescription className="mt-1">
                          {reservation.bookTitle} by {reservation.bookAuthor}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        {reservation.status === 'active' && (
                          <div className="text-sm text-muted-foreground">
                            Expires: {formatDate(reservation.expiryDate)}
                            <br />
                            {getDaysUntilExpiry(reservation.expiryDate) > 0 ? (
                              <span className="text-green-600">
                                {getDaysUntilExpiry(reservation.expiryDate)} days remaining
                              </span>
                            ) : (
                              <span className="text-red-600">
                                Expired {Math.abs(getDaysUntilExpiry(reservation.expiryDate))} days ago
                              </span>
                            )}
                          </div>
                        )}
                        {reservation.status === 'fulfilled' && reservation.fulfilledDate && (
                          <div className="text-sm text-green-600">
                            Fulfilled: {formatDate(reservation.fulfilledDate)}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Student ID</span>
                        <p className="font-medium">{reservation.studentId}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">ISBN</span>
                        <p className="font-medium">{reservation.isbn}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Reserved Date</span>
                        <p className="font-medium">{formatDate(reservation.reservationDate)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Notification</span>
                        <p className="font-medium">
                          {reservation.notificationSent ? (
                            <span className="text-green-600">Sent</span>
                          ) : (
                            <span className="text-gray-600">Pending</span>
                          )}
                        </p>
                      </div>
                    </div>

                    {reservation.status === 'fulfilled' && reservation.fulfilledDate && (
                      <div className="p-3 bg-green-50 rounded-lg">
                        <p className="text-sm text-green-800">
                          <strong>Fulfilled:</strong> {formatDateTime(reservation.fulfilledDate)}
                        </p>
                      </div>
                    )}

                    {reservation.status === 'cancelled' && reservation.cancelledDate && (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-800">
                          <strong>Cancelled:</strong> {formatDateTime(reservation.cancelledDate)}
                          {reservation.cancelReason && (
                            <><br /><strong>Reason:</strong> {reservation.cancelReason}</>
                          )}
                        </p>
                      </div>
                    )}

                    {reservation.notes && (
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          <strong>Notes:</strong> {reservation.notes}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="mr-1 h-3 w-3" />
                          View Details
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="mr-1 h-3 w-3" />
                          Edit Reservation
                        </Button>
                        {reservation.status === 'active' && !reservation.notificationSent && (
                          <Button size="sm" variant="outline" onClick={() => handleReservationAction('notify')}>
                            <Mail className="mr-1 h-3 w-3" />
                            Send Notification
                          </Button>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {reservation.status === 'active' ? (
                          <>
                            <Button size="sm" onClick={() => handleReservationAction('fulfill')} style={{ backgroundColor: '#36BA91' }}>
                              <Check className="mr-1 h-3 w-3" />
                              Fulfill
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleReservationAction('extend')}>
                              <CalendarDays className="mr-1 h-3 w-3" />
                              Extend
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleReservationAction('cancel')}>
                              <X className="mr-1 h-3 w-3" />
                              Cancel
                            </Button>
                          </>
                        ) : reservation.status === 'expired' ? (
                          <Button size="sm" variant="outline" onClick={() => handleReservationAction('cancel')}>
                            <X className="mr-1 h-3 w-3" />
                            Remove
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}

            {filteredReservations.length === 0 && !isLoading && (
              <div className="text-center py-8 text-muted-foreground">
                <Bookmark className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>No reservations found</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="quick_reserve" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Quick Reservation Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bookmark className="mr-2 h-5 w-5" style={{ color: '#36BA91' }} />
                  Quick Reservation
                </CardTitle>
                <CardDescription>
                  Quickly reserve books for students
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Student ID</label>
                  <div className="relative">
                    <UserCheck className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Enter student ID"
                      value={quickReservation.studentId}
                      onChange={(e) => setQuickReservation(prev => ({ ...prev, studentId: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Book ID / ISBN</label>
                  <div className="relative">
                    <BookOpen className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Enter book ID or ISBN"
                      value={quickReservation.bookId}
                      onChange={(e) => setQuickReservation(prev => ({ ...prev, bookId: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>

                <Button 
                  onClick={() => handleReservationAction('reserve')} 
                  style={{ backgroundColor: '#36BA91' }}
                  className="w-full"
                >
                  <Bookmark className="mr-2 h-4 w-4" />
                  Create Reservation
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline" onClick={() => handleBulkAction('send_notifications')}>
                  <Mail className="mr-2 h-4 w-4" />
                  Send All Notifications
                </Button>
                <Button className="w-full justify-start" variant="outline" onClick={() => handleBulkAction('cleanup_expired')}>
                  <X className="mr-2 h-4 w-4" />
                  Cleanup Expired Reservations
                </Button>
                <Button className="w-full justify-start" variant="outline" onClick={() => handleBulkAction('export')}>
                  <Download className="mr-2 h-4 w-4" />
                  Export Reservation Report
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Settings className="mr-2 h-4 w-4" />
                  Reservation Settings
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Queue Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Current Queue Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {reservations.filter(r => r.status === 'active').slice(0, 5).map((reservation) => (
                  <div key={reservation.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-medium">
                        {reservation.queuePosition}
                      </div>
                      <div>
                        <p className="font-medium">{reservation.studentName}</p>
                        <p className="text-sm text-muted-foreground">{reservation.bookTitle}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getPriorityColor(reservation.priority)}>
                        {getPriorityLabel(reservation.priority)}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(reservation.reservationDate)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Reservation Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bookmark className="mr-2 h-5 w-5" style={{ color: '#36BA91' }} />
                  Reservation Status Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {['active', 'fulfilled', 'expired', 'cancelled'].map((status) => {
                    const count = reservations.filter(r => r.status === status).length
                    const percentage = (count / (reservations.length || 1)) * 100
                    return (
                      <div key={status} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(status)}>
                            {status}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Progress value={percentage} className="w-20" />
                          <span className="text-sm font-medium w-16">{count} ({percentage.toFixed(1)}%)</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Priority Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertCircle className="mr-2 h-5 w-5" style={{ color: '#F39C12' }} />
                  Priority Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {[1, 2, 3].map((priority) => {
                    const count = reservations.filter(r => r.priority === priority).length
                    const percentage = (count / (reservations.length || 1)) * 100
                    return (
                      <div key={priority} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge className={getPriorityColor(priority)}>
                            {getPriorityLabel(priority)} Priority
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Progress value={percentage} className="w-20" />
                          <span className="text-sm font-medium w-16">{count} ({percentage.toFixed(1)}%)</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Reservation Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold" style={{ color: '#36BA91' }}>
                    {reservations.filter(r => r.status === 'fulfilled').length}
                  </div>
                  <p className="text-sm text-muted-foreground">Fulfilled Reservations</p>
                  <p className="text-xs text-muted-foreground">
                    {((reservations.filter(r => r.status === 'fulfilled').length / (reservations.length || 1)) * 100).toFixed(1)}% success rate
                  </p>
                </div>
                <div>
                  <div className="text-2xl font-bold" style={{ color: '#E74C3C' }}>
                    {reservations.filter(r => r.status === 'expired').length}
                  </div>
                  <p className="text-sm text-muted-foreground">Expired Reservations</p>
                  <p className="text-xs text-muted-foreground">Need attention</p>
                </div>
                <div>
                  <div className="text-2xl font-bold" style={{ color: '#F39C12' }}>
                    {(reservations.reduce((sum, r) => sum + r.queuePosition, 0) / (reservations.length || 1)).toFixed(1)}
                  </div>
                  <p className="text-sm text-muted-foreground">Avg Queue Position</p>
                  <p className="text-xs text-muted-foreground">Per reservation</p>
                </div>
                <div>
                  <div className="text-2xl font-bold" style={{ color: '#005F96' }}>
                    {reservations.filter(r => r.notificationSent).length}
                  </div>
                  <p className="text-sm text-muted-foreground">Notifications Sent</p>
                  <p className="text-xs text-muted-foreground">Communication rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ReservationsPage
