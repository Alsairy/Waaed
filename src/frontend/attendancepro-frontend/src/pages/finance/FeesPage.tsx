import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Input } from '../../components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Progress } from '../../components/ui/progress'
import { 
  DollarSign, 
  Search, 
  Plus, 
  Filter, 
  Download, 
  Eye,
  Edit,
  Clock,
  AlertCircle,
  CheckCircle,
  FileText,
  Settings,
  Mail,
  Calculator,
  TrendingUp,
  Receipt
} from 'lucide-react'
import { toast } from 'sonner'

interface FeeStructure {
  id: string
  name: string
  description: string
  category: 'tuition' | 'registration' | 'library' | 'lab' | 'transportation' | 'activity' | 'exam' | 'other'
  amount: number
  currency: string
  frequency: 'one_time' | 'monthly' | 'quarterly' | 'semester' | 'annual'
  grade: string
  isActive: boolean
  dueDate?: string
  lateFee?: number
  discountEligible: boolean
  createdDate: string
  lastModified: string
}

interface StudentFee {
  id: string
  studentId: string
  studentName: string
  grade: string
  feeStructureId: string
  feeName: string
  amount: number
  dueDate: string
  status: 'pending' | 'paid' | 'overdue' | 'waived' | 'partial'
  paidAmount: number
  remainingAmount: number
  paymentDate?: string
  lateFee: number
  discountApplied: number
  notes?: string
}

interface FeeFilters {
  category: string
  grade: string
  status: string
  searchTerm: string
}

interface FeeStats {
  totalFees: number
  activeFees: number
  totalRevenue: number
  pendingAmount: number
  overdueAmount: number
}

const FeesPage: React.FC = () => {
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([])
  const [studentFees, setStudentFees] = useState<StudentFee[]>([])
  const [feeStats, setFeeStats] = useState<FeeStats>({
    totalFees: 0,
    activeFees: 0,
    totalRevenue: 0,
    pendingAmount: 0,
    overdueAmount: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('structures')
  const [filters, setFilters] = useState<FeeFilters>({
    category: '',
    grade: '',
    status: '',
    searchTerm: ''
  })

  useEffect(() => {
    loadFeesData()
  }, [])

  const loadFeesData = async () => {
    try {
      setIsLoading(true)
      
      const mockFeeStructures: FeeStructure[] = [
        {
          id: '1',
          name: 'Tuition Fee - Grade 11',
          description: 'Annual tuition fee for Grade 11 students',
          category: 'tuition',
          amount: 15000,
          currency: 'SAR',
          frequency: 'annual',
          grade: '11',
          isActive: true,
          dueDate: '2024-09-01',
          lateFee: 500,
          discountEligible: true,
          createdDate: '2024-01-15',
          lastModified: '2024-01-20'
        },
        {
          id: '2',
          name: 'Registration Fee',
          description: 'One-time registration fee for new students',
          category: 'registration',
          amount: 1000,
          currency: 'SAR',
          frequency: 'one_time',
          grade: 'all',
          isActive: true,
          lateFee: 100,
          discountEligible: false,
          createdDate: '2024-01-15',
          lastModified: '2024-01-15'
        },
        {
          id: '3',
          name: 'Library Fee',
          description: 'Annual library access and maintenance fee',
          category: 'library',
          amount: 500,
          currency: 'SAR',
          frequency: 'annual',
          grade: 'all',
          isActive: true,
          dueDate: '2024-09-01',
          lateFee: 50,
          discountEligible: true,
          createdDate: '2024-01-15',
          lastModified: '2024-01-15'
        },
        {
          id: '4',
          name: 'Lab Fee - Science',
          description: 'Laboratory equipment and materials fee',
          category: 'lab',
          amount: 800,
          currency: 'SAR',
          frequency: 'semester',
          grade: '11',
          isActive: true,
          dueDate: '2024-09-01',
          lateFee: 80,
          discountEligible: true,
          createdDate: '2024-01-15',
          lastModified: '2024-01-15'
        },
        {
          id: '5',
          name: 'Transportation Fee',
          description: 'Monthly school bus transportation fee',
          category: 'transportation',
          amount: 300,
          currency: 'SAR',
          frequency: 'monthly',
          grade: 'all',
          isActive: true,
          lateFee: 30,
          discountEligible: false,
          createdDate: '2024-01-15',
          lastModified: '2024-01-15'
        }
      ]

      const mockStudentFees: StudentFee[] = [
        {
          id: '1',
          studentId: 'STU001',
          studentName: 'Ahmed Al-Rashid',
          grade: '11',
          feeStructureId: '1',
          feeName: 'Tuition Fee - Grade 11',
          amount: 15000,
          dueDate: '2024-09-01',
          status: 'paid',
          paidAmount: 15000,
          remainingAmount: 0,
          paymentDate: '2024-08-25',
          lateFee: 0,
          discountApplied: 0
        },
        {
          id: '2',
          studentId: 'STU002',
          studentName: 'Layla Mahmoud',
          grade: '11',
          feeStructureId: '1',
          feeName: 'Tuition Fee - Grade 11',
          amount: 15000,
          dueDate: '2024-09-01',
          status: 'partial',
          paidAmount: 10000,
          remainingAmount: 5000,
          paymentDate: '2024-08-20',
          lateFee: 0,
          discountApplied: 0
        },
        {
          id: '3',
          studentId: 'STU003',
          studentName: 'Omar Hassan',
          grade: '11',
          feeStructureId: '1',
          feeName: 'Tuition Fee - Grade 11',
          amount: 15000,
          dueDate: '2024-09-01',
          status: 'overdue',
          paidAmount: 0,
          remainingAmount: 15500,
          lateFee: 500,
          discountApplied: 0,
          notes: 'Payment overdue by 30 days'
        },
        {
          id: '4',
          studentId: 'STU001',
          studentName: 'Ahmed Al-Rashid',
          grade: '11',
          feeStructureId: '3',
          feeName: 'Library Fee',
          amount: 500,
          dueDate: '2024-09-01',
          status: 'paid',
          paidAmount: 500,
          remainingAmount: 0,
          paymentDate: '2024-08-25',
          lateFee: 0,
          discountApplied: 0
        },
        {
          id: '5',
          studentId: 'STU002',
          studentName: 'Layla Mahmoud',
          grade: '11',
          feeStructureId: '5',
          feeName: 'Transportation Fee',
          amount: 300,
          dueDate: '2024-02-01',
          status: 'pending',
          paidAmount: 0,
          remainingAmount: 300,
          lateFee: 0,
          discountApplied: 0
        }
      ]

      setFeeStructures(mockFeeStructures)
      setStudentFees(mockStudentFees)

      const stats: FeeStats = {
        totalFees: mockFeeStructures.length,
        activeFees: mockFeeStructures.filter(f => f.isActive).length,
        totalRevenue: mockStudentFees.filter(f => f.status === 'paid').reduce((sum, f) => sum + f.paidAmount, 0),
        pendingAmount: mockStudentFees.filter(f => f.status === 'pending' || f.status === 'partial').reduce((sum, f) => sum + f.remainingAmount, 0),
        overdueAmount: mockStudentFees.filter(f => f.status === 'overdue').reduce((sum, f) => sum + f.remainingAmount, 0)
      }
      setFeeStats(stats)

    } catch (error) {
      console.error('Error loading fees data:', error)
      toast.error('Failed to load fees data')
    } finally {
      setIsLoading(false)
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'tuition': return 'bg-blue-100 text-blue-800'
      case 'registration': return 'bg-green-100 text-green-800'
      case 'library': return 'bg-purple-100 text-purple-800'
      case 'lab': return 'bg-orange-100 text-orange-800'
      case 'transportation': return 'bg-yellow-100 text-yellow-800'
      case 'activity': return 'bg-pink-100 text-pink-800'
      case 'exam': return 'bg-red-100 text-red-800'
      case 'other': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'overdue': return 'bg-red-100 text-red-800'
      case 'partial': return 'bg-orange-100 text-orange-800'
      case 'waived': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case 'one_time': return 'bg-gray-100 text-gray-800'
      case 'monthly': return 'bg-blue-100 text-blue-800'
      case 'quarterly': return 'bg-green-100 text-green-800'
      case 'semester': return 'bg-orange-100 text-orange-800'
      case 'annual': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatCurrency = (amount: number, currency: string = 'SAR') => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount)
  }

  const handleFeeAction = async (action: 'create' | 'edit' | 'delete' | 'activate' | 'deactivate') => {
    try {
      switch (action) {
        case 'create':
          toast.success('Fee structure created successfully')
          break
        case 'edit':
          toast.success('Fee structure updated successfully')
          break
        case 'delete':
          toast.success('Fee structure deleted successfully')
          break
        case 'activate':
          toast.success('Fee structure activated successfully')
          break
        case 'deactivate':
          toast.success('Fee structure deactivated successfully')
          break
      }
      loadFeesData()
    } catch (error) {
      toast.error(`Failed to ${action} fee structure`)
    }
  }

  const handleBulkAction = async (action: 'export' | 'import' | 'send_reminders') => {
    try {
      switch (action) {
        case 'export':
          toast.success('Fee data exported successfully')
          break
        case 'import':
          toast.success('Fee data imported successfully')
          break
        case 'send_reminders':
          toast.success('Payment reminders sent successfully')
          break
      }
    } catch (error) {
      toast.error(`Failed to ${action}`)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: '#005F96' }}>
            Fee Management
          </h1>
          <p className="text-muted-foreground">
            Manage fee structures, track payments, and generate financial reports
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={() => handleBulkAction('export')}>
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
          <Button style={{ backgroundColor: '#36BA91' }} onClick={() => handleFeeAction('create')}>
            <Plus className="mr-2 h-4 w-4" />
            Create Fee
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Fees</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: '#005F96' }}>
              {feeStats.totalFees}
            </div>
            <p className="text-xs text-muted-foreground">
              Fee structures
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Fees</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: '#36BA91' }}>
              {feeStats.activeFees}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: '#36BA91' }}>
              {formatCurrency(feeStats.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Collected payments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: '#F39C12' }}>
              {formatCurrency(feeStats.pendingAmount)}
            </div>
            <p className="text-xs text-muted-foreground">
              Awaiting payment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Amount</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: '#E74C3C' }}>
              {formatCurrency(feeStats.overdueAmount)}
            </div>
            <p className="text-xs text-muted-foreground">
              Past due date
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="structures">Fee Structures</TabsTrigger>
          <TabsTrigger value="student_fees">Student Fees</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="structures" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="mr-2 h-5 w-5" style={{ color: '#005F96' }} />
                Filter Fee Structures
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search fees..."
                    value={filters.searchTerm}
                    onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                    className="pl-10"
                  />
                </div>
                
                <select
                  value={filters.category}
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                >
                  <option value="">All Categories</option>
                  <option value="tuition">Tuition</option>
                  <option value="registration">Registration</option>
                  <option value="library">Library</option>
                  <option value="lab">Laboratory</option>
                  <option value="transportation">Transportation</option>
                  <option value="activity">Activity</option>
                  <option value="exam">Examination</option>
                  <option value="other">Other</option>
                </select>

                <select
                  value={filters.grade}
                  onChange={(e) => setFilters(prev => ({ ...prev, grade: e.target.value }))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                >
                  <option value="">All Grades</option>
                  <option value="all">All Grades</option>
                  <option value="9">Grade 9</option>
                  <option value="10">Grade 10</option>
                  <option value="11">Grade 11</option>
                  <option value="12">Grade 12</option>
                </select>

                <Button variant="outline" onClick={() => setFilters({ category: '', grade: '', status: '', searchTerm: '' })}>
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Fee Structures List */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-muted-foreground">Loading fee structures...</p>
              </div>
            ) : (
              feeStructures.map((fee) => (
                <Card key={fee.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <CardTitle className="text-lg">{fee.name}</CardTitle>
                          <Badge className={getCategoryColor(fee.category)}>
                            {fee.category}
                          </Badge>
                          <Badge className={getFrequencyColor(fee.frequency)}>
                            {fee.frequency.replace('_', ' ')}
                          </Badge>
                          <Badge className={fee.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {fee.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <CardDescription className="mt-1">
                          {fee.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-5 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Amount</span>
                        <p className="font-medium text-lg" style={{ color: '#36BA91' }}>
                          {formatCurrency(fee.amount, fee.currency)}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Grade</span>
                        <p className="font-medium">{fee.grade === 'all' ? 'All Grades' : `Grade ${fee.grade}`}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Due Date</span>
                        <p className="font-medium">{fee.dueDate ? new Date(fee.dueDate).toLocaleDateString() : 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Late Fee</span>
                        <p className="font-medium">{fee.lateFee ? formatCurrency(fee.lateFee, fee.currency) : 'None'}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Discount Eligible</span>
                        <p className="font-medium">{fee.discountEligible ? 'Yes' : 'No'}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="mr-1 h-3 w-3" />
                          View Details
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleFeeAction('edit')}>
                          <Edit className="mr-1 h-3 w-3" />
                          Edit
                        </Button>
                        <Button size="sm" variant="outline">
                          <Receipt className="mr-1 h-3 w-3" />
                          Generate Bills
                        </Button>
                      </div>
                      <div className="flex items-center space-x-2">
                        {fee.isActive ? (
                          <Button size="sm" variant="outline" onClick={() => handleFeeAction('deactivate')}>
                            Deactivate
                          </Button>
                        ) : (
                          <Button size="sm" onClick={() => handleFeeAction('activate')} style={{ backgroundColor: '#36BA91' }}>
                            Activate
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          <Settings className="mr-1 h-3 w-3" />
                          Settings
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}

            {feeStructures.length === 0 && !isLoading && (
              <div className="text-center py-8 text-muted-foreground">
                <DollarSign className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>No fee structures found</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="student_fees" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Student Fee Status</h3>
            <div className="flex items-center space-x-2">
              <Button size="sm" variant="outline" onClick={() => handleBulkAction('send_reminders')}>
                <Mail className="mr-1 h-3 w-3" />
                Send Reminders
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleBulkAction('export')}>
                <Download className="mr-1 h-3 w-3" />
                Export Report
              </Button>
            </div>
          </div>
          
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {studentFees.map((studentFee) => (
                  <div key={studentFee.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{studentFee.studentName}</h4>
                        <Badge className="bg-blue-100 text-blue-800">
                          Grade {studentFee.grade}
                        </Badge>
                        <Badge className={getStatusColor(studentFee.status)}>
                          {studentFee.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{studentFee.feeName}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                        <span>Due: {new Date(studentFee.dueDate).toLocaleDateString()}</span>
                        {studentFee.paymentDate && (
                          <span>Paid: {new Date(studentFee.paymentDate).toLocaleDateString()}</span>
                        )}
                        {studentFee.lateFee > 0 && (
                          <span className="text-red-600">Late Fee: {formatCurrency(studentFee.lateFee)}</span>
                        )}
                      </div>
                      {studentFee.notes && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Note: {studentFee.notes}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold" style={{ color: '#005F96' }}>
                        {formatCurrency(studentFee.amount)}
                      </div>
                      {studentFee.status === 'partial' && (
                        <div className="text-sm text-muted-foreground">
                          Paid: {formatCurrency(studentFee.paidAmount)}
                          <br />
                          Remaining: {formatCurrency(studentFee.remainingAmount)}
                        </div>
                      )}
                      {studentFee.status === 'paid' && (
                        <div className="text-sm text-green-600">
                          Fully Paid
                        </div>
                      )}
                      {studentFee.status === 'overdue' && (
                        <div className="text-sm text-red-600">
                          Overdue: {formatCurrency(studentFee.remainingAmount)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Payment Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calculator className="mr-2 h-5 w-5" style={{ color: '#36BA91' }} />
                  Payment Status Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {['paid', 'pending', 'partial', 'overdue', 'waived'].map((status) => {
                    const count = studentFees.filter(f => f.status === status).length
                    const percentage = (count / (studentFees.length || 1)) * 100
                    const amount = studentFees.filter(f => f.status === status).reduce((sum, f) => sum + f.amount, 0)
                    return (
                      <div key={status} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(status)}>
                            {status}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-2">
                            <Progress value={percentage} className="w-20" />
                            <span className="text-sm font-medium w-16">{count} ({percentage.toFixed(1)}%)</span>
                          </div>
                          <p className="text-xs text-muted-foreground">{formatCurrency(amount)}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Fee Category Revenue */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5" style={{ color: '#F39C12' }} />
                  Revenue by Category
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {['tuition', 'registration', 'library', 'lab', 'transportation'].map((category) => {
                    const categoryFees = studentFees.filter(f => 
                      feeStructures.find(fs => fs.id === f.feeStructureId)?.category === category
                    )
                    const revenue = categoryFees.filter(f => f.status === 'paid').reduce((sum, f) => sum + f.paidAmount, 0)
                    const totalPossible = categoryFees.reduce((sum, f) => sum + f.amount, 0)
                    const percentage = totalPossible > 0 ? (revenue / totalPossible) * 100 : 0
                    return (
                      <div key={category} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge className={getCategoryColor(category)}>
                            {category}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-medium">{formatCurrency(revenue)}</span>
                          <div className="flex items-center space-x-2">
                            <Progress value={percentage} className="w-20" />
                            <span className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Financial Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Financial Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold" style={{ color: '#36BA91' }}>
                    {studentFees.filter(f => f.status === 'paid').length}
                  </div>
                  <p className="text-sm text-muted-foreground">Paid Fees</p>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(studentFees.filter(f => f.status === 'paid').reduce((sum, f) => sum + f.paidAmount, 0))}
                  </p>
                </div>
                <div>
                  <div className="text-2xl font-bold" style={{ color: '#F39C12' }}>
                    {studentFees.filter(f => f.status === 'pending').length}
                  </div>
                  <p className="text-sm text-muted-foreground">Pending Payments</p>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(studentFees.filter(f => f.status === 'pending').reduce((sum, f) => sum + f.remainingAmount, 0))}
                  </p>
                </div>
                <div>
                  <div className="text-2xl font-bold" style={{ color: '#E74C3C' }}>
                    {studentFees.filter(f => f.status === 'overdue').length}
                  </div>
                  <p className="text-sm text-muted-foreground">Overdue Payments</p>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(studentFees.filter(f => f.status === 'overdue').reduce((sum, f) => sum + f.remainingAmount, 0))}
                  </p>
                </div>
                <div>
                  <div className="text-2xl font-bold" style={{ color: '#005F96' }}>
                    {((studentFees.filter(f => f.status === 'paid').length / (studentFees.length || 1)) * 100).toFixed(1)}%
                  </div>
                  <p className="text-sm text-muted-foreground">Collection Rate</p>
                  <p className="text-xs text-muted-foreground">Payment Success</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default FeesPage
