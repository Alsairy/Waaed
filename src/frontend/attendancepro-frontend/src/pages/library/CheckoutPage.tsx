import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Input } from '../../components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { 
  BookOpen, 
  Search, 
  Filter, 
  Download, 
  Eye,
  Edit,
  Users,
  AlertCircle,
  FileText,
  Settings,
  Mail,
  RotateCcw,
  QrCode,
  Scan,
  UserCheck,
  BookCheck
} from 'lucide-react'
import { Progress } from '../../components/ui/progress'
import { toast } from 'sonner'

interface CheckoutRecord {
  id: string
  studentId: string
  studentName: string
  grade: string
  bookId: string
  bookTitle: string
  bookAuthor: string
  isbn: string
  checkoutDate: string
  dueDate: string
  returnDate?: string
  status: 'checked_out' | 'overdue' | 'returned' | 'lost' | 'damaged'
  renewalCount: number
  maxRenewals: number
  fineAmount: number
  notes?: string
  checkedOutBy: string
  returnedBy?: string
}

interface CheckoutFilters {
  status: string
  grade: string
  dateRange: string
  searchTerm: string
}

interface CheckoutStats {
  totalCheckouts: number
  activeCheckouts: number
  overdueCheckouts: number
  returnedToday: number
  totalFines: number
}

interface QuickCheckout {
  studentId: string
  bookId: string
}

const CheckoutPage: React.FC = () => {
  const [checkouts, setCheckouts] = useState<CheckoutRecord[]>([])
  const [checkoutStats, setCheckoutStats] = useState<CheckoutStats>({
    totalCheckouts: 0,
    activeCheckouts: 0,
    overdueCheckouts: 0,
    returnedToday: 0,
    totalFines: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('checkouts')
  const [filters, setFilters] = useState<CheckoutFilters>({
    status: '',
    grade: '',
    dateRange: '',
    searchTerm: ''
  })
  const [quickCheckout, setQuickCheckout] = useState<QuickCheckout>({
    studentId: '',
    bookId: ''
  })

  useEffect(() => {
    loadCheckoutData()
  }, [])

  const loadCheckoutData = async () => {
    try {
      setIsLoading(true)
      
      const mockCheckouts: CheckoutRecord[] = [
        {
          id: '1',
          studentId: 'STU001',
          studentName: 'Ahmed Al-Rashid',
          grade: '11',
          bookId: 'BOOK001',
          bookTitle: 'Advanced Mathematics for Engineers',
          bookAuthor: 'Dr. Ahmed Hassan',
          isbn: '978-0123456789',
          checkoutDate: '2024-01-15T10:30:00',
          dueDate: '2024-02-15T23:59:59',
          status: 'checked_out',
          renewalCount: 0,
          maxRenewals: 2,
          fineAmount: 0,
          checkedOutBy: 'Librarian'
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
          checkoutDate: '2024-01-10T14:20:00',
          dueDate: '2024-02-10T23:59:59',
          status: 'overdue',
          renewalCount: 1,
          maxRenewals: 2,
          fineAmount: 15.50,
          notes: 'Student notified about overdue status',
          checkedOutBy: 'Librarian'
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
          checkoutDate: '2024-01-20T09:15:00',
          dueDate: '2024-02-20T23:59:59',
          returnDate: '2024-02-18T16:45:00',
          status: 'returned',
          renewalCount: 0,
          maxRenewals: 2,
          fineAmount: 0,
          checkedOutBy: 'Librarian',
          returnedBy: 'Librarian'
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
          checkoutDate: '2024-01-25T11:00:00',
          dueDate: '2024-02-25T23:59:59',
          status: 'checked_out',
          renewalCount: 1,
          maxRenewals: 2,
          fineAmount: 0,
          checkedOutBy: 'Librarian'
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
          checkoutDate: '2024-01-05T13:30:00',
          dueDate: '2024-02-05T23:59:59',
          status: 'overdue',
          renewalCount: 2,
          maxRenewals: 2,
          fineAmount: 25.00,
          notes: 'Maximum renewals reached',
          checkedOutBy: 'Librarian'
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
          checkoutDate: '2024-02-01T15:20:00',
          dueDate: '2024-03-01T23:59:59',
          returnDate: '2024-02-01T17:30:00',
          status: 'returned',
          renewalCount: 0,
          maxRenewals: 2,
          fineAmount: 0,
          checkedOutBy: 'Librarian',
          returnedBy: 'Librarian',
          notes: 'Returned same day'
        }
      ]

      setCheckouts(mockCheckouts)

      const today = new Date().toDateString()
      const stats: CheckoutStats = {
        totalCheckouts: mockCheckouts.length,
        activeCheckouts: mockCheckouts.filter(c => c.status === 'checked_out' || c.status === 'overdue').length,
        overdueCheckouts: mockCheckouts.filter(c => c.status === 'overdue').length,
        returnedToday: mockCheckouts.filter(c => c.returnDate && new Date(c.returnDate).toDateString() === today).length,
        totalFines: mockCheckouts.reduce((sum, c) => sum + c.fineAmount, 0)
      }
      setCheckoutStats(stats)

    } catch (error) {
      console.error('Error loading checkout data:', error)
      toast.error('Failed to load checkout data')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'checked_out': return 'bg-blue-100 text-blue-800'
      case 'overdue': return 'bg-red-100 text-red-800'
      case 'returned': return 'bg-green-100 text-green-800'
      case 'lost': return 'bg-gray-100 text-gray-800'
      case 'damaged': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate)
    const today = new Date()
    const diffTime = due.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const handleCheckoutAction = async (action: 'checkout' | 'return' | 'renew' | 'mark_lost' | 'mark_damaged') => {
    try {
      switch (action) {
        case 'checkout':
          if (!quickCheckout.studentId || !quickCheckout.bookId) {
            toast.error('Please enter both Student ID and Book ID')
            return
          }
          toast.success('Book checked out successfully')
          setQuickCheckout({ studentId: '', bookId: '' })
          break
        case 'return':
          toast.success('Book returned successfully')
          break
        case 'renew':
          toast.success('Book renewed successfully')
          break
        case 'mark_lost':
          toast.success('Book marked as lost')
          break
        case 'mark_damaged':
          toast.success('Book marked as damaged')
          break
      }
      loadCheckoutData()
    } catch (error) {
      console.error('Checkout action error:', error)
      toast.error(`Failed to ${action} book`)
    }
  }

  const handleBulkAction = async (action: 'export' | 'send_reminders' | 'bulk_return') => {
    try {
      switch (action) {
        case 'export':
          toast.success('Checkout data exported successfully')
          break
        case 'send_reminders':
          toast.success('Overdue reminders sent successfully')
          break
        case 'bulk_return':
          toast.success('Bulk return processed successfully')
          break
      }
    } catch (error) {
      console.error('Bulk action error:', error)
      toast.error(`Failed to ${action}`)
    }
  }

  const filteredCheckouts = checkouts.filter(checkout => {
    if (filters.status && checkout.status !== filters.status) return false
    if (filters.grade && checkout.grade !== filters.grade) return false
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase()
      return checkout.studentName.toLowerCase().includes(searchLower) ||
             checkout.bookTitle.toLowerCase().includes(searchLower) ||
             checkout.isbn.toLowerCase().includes(searchLower) ||
             checkout.studentId.toLowerCase().includes(searchLower)
    }
    return true
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: '#005F96' }}>
            Book Checkout Management
          </h1>
          <p className="text-muted-foreground">
            Manage book checkouts, returns, and track overdue items
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={() => handleBulkAction('export')}>
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
          <Button variant="outline" onClick={() => handleBulkAction('send_reminders')}>
            <Mail className="mr-2 h-4 w-4" />
            Send Reminders
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Checkouts</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: '#005F96' }}>
              {checkoutStats.totalCheckouts}
            </div>
            <p className="text-xs text-muted-foreground">
              All time records
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Checkouts</CardTitle>
            <BookCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: '#36BA91' }}>
              {checkoutStats.activeCheckouts}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently borrowed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Books</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: '#E74C3C' }}>
              {checkoutStats.overdueCheckouts}
            </div>
            <p className="text-xs text-muted-foreground">
              Need attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Returned Today</CardTitle>
            <RotateCcw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: '#F39C12' }}>
              {checkoutStats.returnedToday}
            </div>
            <p className="text-xs text-muted-foreground">
              Today's returns
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Fines</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: '#E74C3C' }}>
              {checkoutStats.totalFines.toFixed(2)} SAR
            </div>
            <p className="text-xs text-muted-foreground">
              Outstanding fines
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="checkouts">Checkout Records</TabsTrigger>
          <TabsTrigger value="quick_checkout">Quick Checkout</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="checkouts" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="mr-2 h-5 w-5" style={{ color: '#005F96' }} />
                Filter Checkout Records
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
                  <option value="checked_out">Checked Out</option>
                  <option value="overdue">Overdue</option>
                  <option value="returned">Returned</option>
                  <option value="lost">Lost</option>
                  <option value="damaged">Damaged</option>
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
                  value={filters.dateRange}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                >
                  <option value="">All Dates</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="overdue">Overdue Only</option>
                </select>

                <Button variant="outline" onClick={() => setFilters({ status: '', grade: '', dateRange: '', searchTerm: '' })}>
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Checkout Records List */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-muted-foreground">Loading checkout records...</p>
              </div>
            ) : (
              filteredCheckouts.map((checkout) => (
                <Card key={checkout.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <CardTitle className="text-lg">{checkout.studentName}</CardTitle>
                          <Badge className="bg-blue-100 text-blue-800">
                            Grade {checkout.grade}
                          </Badge>
                          <Badge className={getStatusColor(checkout.status)}>
                            {checkout.status.replace('_', ' ')}
                          </Badge>
                          {checkout.status === 'overdue' && (
                            <Badge className="bg-red-100 text-red-800">
                              {Math.abs(getDaysUntilDue(checkout.dueDate))} days overdue
                            </Badge>
                          )}
                        </div>
                        <CardDescription className="mt-1">
                          {checkout.bookTitle} by {checkout.bookAuthor}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        {checkout.fineAmount > 0 && (
                          <div className="text-lg font-bold text-red-600">
                            {checkout.fineAmount.toFixed(2)} SAR Fine
                          </div>
                        )}
                        {checkout.status === 'checked_out' && (
                          <div className="text-sm text-muted-foreground">
                            Due: {formatDate(checkout.dueDate)}
                            <br />
                            {getDaysUntilDue(checkout.dueDate) > 0 ? (
                              <span className="text-green-600">
                                {getDaysUntilDue(checkout.dueDate)} days remaining
                              </span>
                            ) : (
                              <span className="text-red-600">
                                {Math.abs(getDaysUntilDue(checkout.dueDate))} days overdue
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Student ID</span>
                        <p className="font-medium">{checkout.studentId}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">ISBN</span>
                        <p className="font-medium">{checkout.isbn}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Checkout Date</span>
                        <p className="font-medium">{formatDate(checkout.checkoutDate)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Renewals</span>
                        <p className="font-medium">{checkout.renewalCount}/{checkout.maxRenewals}</p>
                      </div>
                    </div>

                    {checkout.returnDate && (
                      <div className="p-3 bg-green-50 rounded-lg">
                        <p className="text-sm text-green-800">
                          <strong>Returned:</strong> {formatDateTime(checkout.returnDate)}
                          {checkout.returnedBy && ` by ${checkout.returnedBy}`}
                        </p>
                      </div>
                    )}

                    {checkout.notes && (
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          <strong>Notes:</strong> {checkout.notes}
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
                          Edit Record
                        </Button>
                        {checkout.status === 'overdue' && (
                          <Button size="sm" variant="outline">
                            <Mail className="mr-1 h-3 w-3" />
                            Send Reminder
                          </Button>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {checkout.status === 'checked_out' || checkout.status === 'overdue' ? (
                          <>
                            <Button size="sm" onClick={() => handleCheckoutAction('return')} style={{ backgroundColor: '#36BA91' }}>
                              <RotateCcw className="mr-1 h-3 w-3" />
                              Return Book
                            </Button>
                            {checkout.renewalCount < checkout.maxRenewals && (
                              <Button size="sm" variant="outline" onClick={() => handleCheckoutAction('renew')}>
                                Renew
                              </Button>
                            )}
                          </>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <Button size="sm" variant="outline" onClick={() => handleCheckoutAction('mark_lost')}>
                              Mark Lost
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleCheckoutAction('mark_damaged')}>
                              Mark Damaged
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}

            {filteredCheckouts.length === 0 && !isLoading && (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>No checkout records found</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="quick_checkout" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Quick Checkout Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookCheck className="mr-2 h-5 w-5" style={{ color: '#36BA91' }} />
                  Quick Checkout
                </CardTitle>
                <CardDescription>
                  Quickly checkout books using student and book IDs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Student ID</label>
                  <div className="relative">
                    <UserCheck className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Enter student ID or scan card"
                      value={quickCheckout.studentId}
                      onChange={(e) => setQuickCheckout(prev => ({ ...prev, studentId: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Book ID / ISBN</label>
                  <div className="relative">
                    <QrCode className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Enter book ID, ISBN, or scan barcode"
                      value={quickCheckout.bookId}
                      onChange={(e) => setQuickCheckout(prev => ({ ...prev, bookId: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button 
                    onClick={() => handleCheckoutAction('checkout')} 
                    style={{ backgroundColor: '#36BA91' }}
                    className="flex-1"
                  >
                    <BookCheck className="mr-2 h-4 w-4" />
                    Checkout Book
                  </Button>
                  <Button variant="outline" size="icon">
                    <Scan className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline" onClick={() => handleBulkAction('bulk_return')}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Bulk Return Books
                </Button>
                <Button className="w-full justify-start" variant="outline" onClick={() => handleBulkAction('send_reminders')}>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Overdue Reminders
                </Button>
                <Button className="w-full justify-start" variant="outline" onClick={() => handleBulkAction('export')}>
                  <Download className="mr-2 h-4 w-4" />
                  Export Checkout Report
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Settings className="mr-2 h-4 w-4" />
                  Checkout Settings
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Checkout Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {checkouts.slice(0, 5).map((checkout) => (
                  <div key={checkout.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <BookOpen className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{checkout.studentName}</p>
                        <p className="text-sm text-muted-foreground">{checkout.bookTitle}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(checkout.status)}>
                        {checkout.status.replace('_', ' ')}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(checkout.checkoutDate)}
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
            {/* Checkout Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookCheck className="mr-2 h-5 w-5" style={{ color: '#36BA91' }} />
                  Checkout Status Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {['checked_out', 'overdue', 'returned', 'lost', 'damaged'].map((status) => {
                    const count = checkouts.filter(c => c.status === status).length
                    const percentage = (count / (checkouts.length || 1)) * 100
                    return (
                      <div key={status} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(status)}>
                            {status.replace('_', ' ')}
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

            {/* Grade Level Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5" style={{ color: '#F39C12' }} />
                  Checkouts by Grade Level
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {['9', '10', '11', '12'].map((grade) => {
                    const count = checkouts.filter(c => c.grade === grade).length
                    const percentage = (count / (checkouts.length || 1)) * 100
                    return (
                      <div key={grade} className="flex items-center justify-between">
                        <span className="text-sm font-medium">Grade {grade}</span>
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
              <CardTitle>Checkout Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold" style={{ color: '#36BA91' }}>
                    {checkouts.filter(c => c.status === 'returned').length}
                  </div>
                  <p className="text-sm text-muted-foreground">Books Returned</p>
                  <p className="text-xs text-muted-foreground">
                    {((checkouts.filter(c => c.status === 'returned').length / (checkouts.length || 1)) * 100).toFixed(1)}% return rate
                  </p>
                </div>
                <div>
                  <div className="text-2xl font-bold" style={{ color: '#E74C3C' }}>
                    {checkouts.filter(c => c.status === 'overdue').length}
                  </div>
                  <p className="text-sm text-muted-foreground">Overdue Books</p>
                  <p className="text-xs text-muted-foreground">
                    {checkouts.reduce((sum, c) => sum + c.fineAmount, 0).toFixed(2)} SAR in fines
                  </p>
                </div>
                <div>
                  <div className="text-2xl font-bold" style={{ color: '#F39C12' }}>
                    {(checkouts.reduce((sum, c) => sum + c.renewalCount, 0) / (checkouts.length || 1)).toFixed(1)}
                  </div>
                  <p className="text-sm text-muted-foreground">Avg Renewals</p>
                  <p className="text-xs text-muted-foreground">Per checkout</p>
                </div>
                <div>
                  <div className="text-2xl font-bold" style={{ color: '#005F96' }}>
                    {checkouts.filter(c => c.status === 'checked_out' || c.status === 'overdue').length}
                  </div>
                  <p className="text-sm text-muted-foreground">Active Checkouts</p>
                  <p className="text-xs text-muted-foreground">Currently borrowed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default CheckoutPage
