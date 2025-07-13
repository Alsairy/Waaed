import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Input } from '../../components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Progress } from '../../components/ui/progress'
import { 
  CreditCard, 
  Search, 
  Plus, 
  Filter, 
  Download, 
  Eye,
  Edit,
  Clock,
  DollarSign,
  AlertCircle,
  FileText,
  Settings,
  Mail,
  Calculator,
  TrendingUp,
  Receipt,
  Banknote,
  Wallet
} from 'lucide-react'
import { toast } from 'sonner'

interface Payment {
  id: string
  studentId: string
  studentName: string
  grade: string
  feeId: string
  feeName: string
  amount: number
  paymentDate: string
  paymentMethod: 'cash' | 'card' | 'bank_transfer' | 'online' | 'check'
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled'
  transactionId?: string
  referenceNumber: string
  notes?: string
  processedBy: string
  receiptUrl?: string
}

interface PaymentPlan {
  id: string
  studentId: string
  studentName: string
  totalAmount: number
  paidAmount: number
  remainingAmount: number
  installments: PaymentInstallment[]
  status: 'active' | 'completed' | 'defaulted' | 'cancelled'
  createdDate: string
  dueDate: string
}

interface PaymentInstallment {
  id: string
  installmentNumber: number
  amount: number
  dueDate: string
  paidDate?: string
  status: 'pending' | 'paid' | 'overdue' | 'waived'
  lateFee: number
}

interface PaymentFilters {
  method: string
  status: string
  dateRange: string
  searchTerm: string
}

interface PaymentStats {
  totalPayments: number
  totalAmount: number
  pendingPayments: number
  failedPayments: number
  refundedAmount: number
}

const PaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([])
  const [paymentPlans, setPaymentPlans] = useState<PaymentPlan[]>([])
  const [paymentStats, setPaymentStats] = useState<PaymentStats>({
    totalPayments: 0,
    totalAmount: 0,
    pendingPayments: 0,
    failedPayments: 0,
    refundedAmount: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('payments')
  const [filters, setFilters] = useState<PaymentFilters>({
    method: '',
    status: '',
    dateRange: '',
    searchTerm: ''
  })

  useEffect(() => {
    loadPaymentsData()
  }, [])

  const loadPaymentsData = async () => {
    try {
      setIsLoading(true)
      
      const mockPayments: Payment[] = [
        {
          id: '1',
          studentId: 'STU001',
          studentName: 'Ahmed Al-Rashid',
          grade: '11',
          feeId: 'FEE001',
          feeName: 'Tuition Fee - Grade 11',
          amount: 15000,
          paymentDate: '2024-08-25T10:30:00',
          paymentMethod: 'bank_transfer',
          status: 'completed',
          transactionId: 'TXN001234567',
          referenceNumber: 'REF-2024-001',
          processedBy: 'Finance Officer',
          receiptUrl: '/receipts/receipt-001.pdf'
        },
        {
          id: '2',
          studentId: 'STU002',
          studentName: 'Layla Mahmoud',
          grade: '11',
          feeId: 'FEE001',
          feeName: 'Tuition Fee - Grade 11',
          amount: 10000,
          paymentDate: '2024-08-20T14:15:00',
          paymentMethod: 'card',
          status: 'completed',
          transactionId: 'TXN001234568',
          referenceNumber: 'REF-2024-002',
          processedBy: 'Finance Officer',
          notes: 'Partial payment - installment 1 of 2'
        },
        {
          id: '3',
          studentId: 'STU003',
          studentName: 'Omar Hassan',
          grade: '11',
          feeId: 'FEE002',
          feeName: 'Library Fee',
          amount: 500,
          paymentDate: '2024-09-01T09:00:00',
          paymentMethod: 'cash',
          status: 'pending',
          referenceNumber: 'REF-2024-003',
          processedBy: 'Finance Officer'
        },
        {
          id: '4',
          studentId: 'STU004',
          studentName: 'Fatima Al-Zahra',
          grade: '10',
          feeId: 'FEE003',
          feeName: 'Transportation Fee',
          amount: 300,
          paymentDate: '2024-08-30T16:45:00',
          paymentMethod: 'online',
          status: 'failed',
          transactionId: 'TXN001234569',
          referenceNumber: 'REF-2024-004',
          processedBy: 'System',
          notes: 'Payment failed due to insufficient funds'
        },
        {
          id: '5',
          studentId: 'STU001',
          studentName: 'Ahmed Al-Rashid',
          grade: '11',
          feeId: 'FEE004',
          feeName: 'Lab Fee - Science',
          amount: 800,
          paymentDate: '2024-08-28T11:20:00',
          paymentMethod: 'check',
          status: 'completed',
          referenceNumber: 'REF-2024-005',
          processedBy: 'Finance Officer'
        }
      ]

      const mockPaymentPlans: PaymentPlan[] = [
        {
          id: '1',
          studentId: 'STU002',
          studentName: 'Layla Mahmoud',
          totalAmount: 15000,
          paidAmount: 10000,
          remainingAmount: 5000,
          status: 'active',
          createdDate: '2024-08-01',
          dueDate: '2024-12-01',
          installments: [
            {
              id: '1',
              installmentNumber: 1,
              amount: 10000,
              dueDate: '2024-08-20',
              paidDate: '2024-08-20',
              status: 'paid',
              lateFee: 0
            },
            {
              id: '2',
              installmentNumber: 2,
              amount: 5000,
              dueDate: '2024-12-01',
              status: 'pending',
              lateFee: 0
            }
          ]
        },
        {
          id: '2',
          studentId: 'STU005',
          studentName: 'Khalid Al-Mansouri',
          totalAmount: 12000,
          paidAmount: 4000,
          remainingAmount: 8000,
          status: 'active',
          createdDate: '2024-07-15',
          dueDate: '2024-11-15',
          installments: [
            {
              id: '3',
              installmentNumber: 1,
              amount: 4000,
              dueDate: '2024-07-30',
              paidDate: '2024-07-30',
              status: 'paid',
              lateFee: 0
            },
            {
              id: '4',
              installmentNumber: 2,
              amount: 4000,
              dueDate: '2024-09-30',
              status: 'overdue',
              lateFee: 200
            },
            {
              id: '5',
              installmentNumber: 3,
              amount: 4000,
              dueDate: '2024-11-15',
              status: 'pending',
              lateFee: 0
            }
          ]
        }
      ]

      setPayments(mockPayments)
      setPaymentPlans(mockPaymentPlans)

      const stats: PaymentStats = {
        totalPayments: mockPayments.length,
        totalAmount: mockPayments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0),
        pendingPayments: mockPayments.filter(p => p.status === 'pending').length,
        failedPayments: mockPayments.filter(p => p.status === 'failed').length,
        refundedAmount: mockPayments.filter(p => p.status === 'refunded').reduce((sum, p) => sum + p.amount, 0)
      }
      setPaymentStats(stats)

    } catch (error) {
      console.error('Error loading payments data:', error)
      toast.error('Failed to load payments data')
    } finally {
      setIsLoading(false)
    }
  }

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case 'cash': return 'bg-green-100 text-green-800'
      case 'card': return 'bg-blue-100 text-blue-800'
      case 'bank_transfer': return 'bg-purple-100 text-purple-800'
      case 'online': return 'bg-orange-100 text-orange-800'
      case 'check': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'failed': return 'bg-red-100 text-red-800'
      case 'refunded': return 'bg-blue-100 text-blue-800'
      case 'cancelled': return 'bg-gray-100 text-gray-800'
      case 'paid': return 'bg-green-100 text-green-800'
      case 'overdue': return 'bg-red-100 text-red-800'
      case 'waived': return 'bg-blue-100 text-blue-800'
      case 'active': return 'bg-green-100 text-green-800'
      case 'defaulted': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'cash': return <Banknote className="h-4 w-4" />
      case 'card': return <CreditCard className="h-4 w-4" />
      case 'bank_transfer': return <Wallet className="h-4 w-4" />
      case 'online': return <DollarSign className="h-4 w-4" />
      case 'check': return <FileText className="h-4 w-4" />
      default: return <DollarSign className="h-4 w-4" />
    }
  }

  const formatCurrency = (amount: number, currency: string = 'SAR') => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount)
  }

  const handlePaymentAction = async (action: 'process' | 'refund' | 'cancel' | 'retry') => {
    try {
      switch (action) {
        case 'process':
          toast.success('Payment processed successfully')
          break
        case 'refund':
          toast.success('Payment refunded successfully')
          break
        case 'cancel':
          toast.success('Payment cancelled successfully')
          break
        case 'retry':
          toast.success('Payment retry initiated')
          break
      }
      loadPaymentsData()
    } catch (error) {
      console.error('Payment action error:', error)
      toast.error(`Failed to ${action} payment`)
    }
  }

  const handleBulkAction = async (action: 'export' | 'import' | 'send_receipts' | 'reconcile') => {
    try {
      switch (action) {
        case 'export':
          toast.success('Payment data exported successfully')
          break
        case 'import':
          toast.success('Payment data imported successfully')
          break
        case 'send_receipts':
          toast.success('Receipts sent successfully')
          break
        case 'reconcile':
          toast.success('Payment reconciliation completed')
          break
      }
    } catch (error) {
      console.error('Bulk payment action error:', error)
      toast.error(`Failed to ${action}`)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: '#005F96' }}>
            Payment Management
          </h1>
          <p className="text-muted-foreground">
            Process payments, manage payment plans, and track financial transactions
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={() => handleBulkAction('export')}>
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
          <Button style={{ backgroundColor: '#36BA91' }}>
            <Plus className="mr-2 h-4 w-4" />
            Process Payment
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: '#005F96' }}>
              {paymentStats.totalPayments}
            </div>
            <p className="text-xs text-muted-foreground">
              Payment transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: '#36BA91' }}>
              {formatCurrency(paymentStats.totalAmount)}
            </div>
            <p className="text-xs text-muted-foreground">
              Successfully collected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: '#F39C12' }}>
              {paymentStats.pendingPayments}
            </div>
            <p className="text-xs text-muted-foreground">
              Awaiting processing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Payments</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: '#E74C3C' }}>
              {paymentStats.failedPayments}
            </div>
            <p className="text-xs text-muted-foreground">
              Need attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Refunded Amount</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: '#E74C3C' }}>
              {formatCurrency(paymentStats.refundedAmount)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total refunds
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="payments">Payment History</TabsTrigger>
          <TabsTrigger value="plans">Payment Plans</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="payments" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="mr-2 h-5 w-5" style={{ color: '#005F96' }} />
                Filter Payments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-5">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search payments..."
                    value={filters.searchTerm}
                    onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                    className="pl-10"
                  />
                </div>
                
                <select
                  value={filters.method}
                  onChange={(e) => setFilters(prev => ({ ...prev, method: e.target.value }))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                >
                  <option value="">All Methods</option>
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="online">Online</option>
                  <option value="check">Check</option>
                </select>

                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                >
                  <option value="">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                  <option value="cancelled">Cancelled</option>
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
                  <option value="quarter">This Quarter</option>
                </select>

                <Button variant="outline" onClick={() => setFilters({ method: '', status: '', dateRange: '', searchTerm: '' })}>
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Payment History List */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-muted-foreground">Loading payment history...</p>
              </div>
            ) : (
              payments.map((payment) => (
                <Card key={payment.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <CardTitle className="text-lg">{payment.studentName}</CardTitle>
                          <Badge className="bg-blue-100 text-blue-800">
                            Grade {payment.grade}
                          </Badge>
                          <Badge className={getPaymentMethodColor(payment.paymentMethod)}>
                            <div className="flex items-center space-x-1">
                              {getPaymentMethodIcon(payment.paymentMethod)}
                              <span>{payment.paymentMethod.replace('_', ' ')}</span>
                            </div>
                          </Badge>
                          <Badge className={getStatusColor(payment.status)}>
                            {payment.status}
                          </Badge>
                        </div>
                        <CardDescription className="mt-1">
                          {payment.feeName} - {payment.referenceNumber}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold" style={{ color: '#36BA91' }}>
                          {formatCurrency(payment.amount)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(payment.paymentDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Transaction ID</span>
                        <p className="font-medium">{payment.transactionId || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Processed By</span>
                        <p className="font-medium">{payment.processedBy}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Payment Time</span>
                        <p className="font-medium">{new Date(payment.paymentDate).toLocaleTimeString()}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Receipt</span>
                        <p className="font-medium">{payment.receiptUrl ? 'Available' : 'Pending'}</p>
                      </div>
                    </div>

                    {payment.notes && (
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          <strong>Notes:</strong> {payment.notes}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="mr-1 h-3 w-3" />
                          View Details
                        </Button>
                        {payment.receiptUrl && (
                          <Button size="sm" variant="outline">
                            <Receipt className="mr-1 h-3 w-3" />
                            Download Receipt
                          </Button>
                        )}
                        {payment.status === 'pending' && (
                          <Button size="sm" onClick={() => handlePaymentAction('process')} style={{ backgroundColor: '#36BA91' }}>
                            Process Payment
                          </Button>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {payment.status === 'completed' && (
                          <Button size="sm" variant="outline" onClick={() => handlePaymentAction('refund')}>
                            Refund
                          </Button>
                        )}
                        {payment.status === 'failed' && (
                          <Button size="sm" variant="outline" onClick={() => handlePaymentAction('retry')}>
                            Retry Payment
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          <Settings className="mr-1 h-3 w-3" />
                          Actions
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}

            {payments.length === 0 && !isLoading && (
              <div className="text-center py-8 text-muted-foreground">
                <CreditCard className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>No payments found</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="plans" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Payment Plans</h3>
            <div className="flex items-center space-x-2">
              <Button size="sm" variant="outline" onClick={() => handleBulkAction('reconcile')}>
                <Calculator className="mr-1 h-3 w-3" />
                Reconcile Plans
              </Button>
              <Button size="sm" style={{ backgroundColor: '#36BA91' }}>
                <Plus className="mr-1 h-3 w-3" />
                Create Plan
              </Button>
            </div>
          </div>
          
          <div className="space-y-4">
            {paymentPlans.map((plan) => (
              <Card key={plan.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <CardTitle className="text-lg">{plan.studentName}</CardTitle>
                        <Badge className={getStatusColor(plan.status)}>
                          {plan.status}
                        </Badge>
                      </div>
                      <CardDescription className="mt-1">
                        Payment Plan - {plan.installments.length} installments
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold" style={{ color: '#005F96' }}>
                        {formatCurrency(plan.totalAmount)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Total Amount
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Paid Amount</span>
                      <p className="font-medium text-green-600">{formatCurrency(plan.paidAmount)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Remaining Amount</span>
                      <p className="font-medium text-orange-600">{formatCurrency(plan.remainingAmount)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Progress</span>
                      <div className="flex items-center space-x-2 mt-1">
                        <Progress value={(plan.paidAmount / plan.totalAmount) * 100} className="flex-1" />
                        <span className="text-sm font-medium">{((plan.paidAmount / plan.totalAmount) * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Installments</h4>
                    <div className="space-y-2">
                      {plan.installments.map((installment) => (
                        <div key={installment.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-medium">
                              {installment.installmentNumber}
                            </div>
                            <div>
                              <p className="font-medium">{formatCurrency(installment.amount)}</p>
                              <p className="text-sm text-muted-foreground">
                                Due: {new Date(installment.dueDate).toLocaleDateString()}
                                {installment.paidDate && (
                                  <span> • Paid: {new Date(installment.paidDate).toLocaleDateString()}</span>
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={getStatusColor(installment.status)}>
                              {installment.status}
                            </Badge>
                            {installment.lateFee > 0 && (
                              <Badge className="bg-red-100 text-red-800">
                                Late Fee: {formatCurrency(installment.lateFee)}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline">
                        <Eye className="mr-1 h-3 w-3" />
                        View Details
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="mr-1 h-3 w-3" />
                        Modify Plan
                      </Button>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline">
                        <Mail className="mr-1 h-3 w-3" />
                        Send Reminder
                      </Button>
                      <Button size="sm" variant="outline">
                        <Settings className="mr-1 h-3 w-3" />
                        Actions
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Payment Method Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="mr-2 h-5 w-5" style={{ color: '#36BA91' }} />
                  Payment Method Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {['cash', 'card', 'bank_transfer', 'online', 'check'].map((method) => {
                    const count = payments.filter(p => p.paymentMethod === method).length
                    const percentage = (count / (payments.length || 1)) * 100
                    const amount = payments.filter(p => p.paymentMethod === method && p.status === 'completed').reduce((sum, p) => sum + p.amount, 0)
                    return (
                      <div key={method} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getPaymentMethodIcon(method)}
                          <Badge className={getPaymentMethodColor(method)}>
                            {method.replace('_', ' ')}
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

            {/* Payment Status Analytics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5" style={{ color: '#F39C12' }} />
                  Payment Status Analytics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {['completed', 'pending', 'failed', 'refunded', 'cancelled'].map((status) => {
                    const count = payments.filter(p => p.status === status).length
                    const percentage = (count / (payments.length || 1)) * 100
                    const amount = payments.filter(p => p.status === status).reduce((sum, p) => sum + p.amount, 0)
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
          </div>

          {/* Financial Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold" style={{ color: '#36BA91' }}>
                    {payments.filter(p => p.status === 'completed').length}
                  </div>
                  <p className="text-sm text-muted-foreground">Successful Payments</p>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0))}
                  </p>
                </div>
                <div>
                  <div className="text-2xl font-bold" style={{ color: '#F39C12' }}>
                    {payments.filter(p => p.status === 'pending').length}
                  </div>
                  <p className="text-sm text-muted-foreground">Pending Payments</p>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0))}
                  </p>
                </div>
                <div>
                  <div className="text-2xl font-bold" style={{ color: '#E74C3C' }}>
                    {payments.filter(p => p.status === 'failed').length}
                  </div>
                  <p className="text-sm text-muted-foreground">Failed Payments</p>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(payments.filter(p => p.status === 'failed').reduce((sum, p) => sum + p.amount, 0))}
                  </p>
                </div>
                <div>
                  <div className="text-2xl font-bold" style={{ color: '#005F96' }}>
                    {((payments.filter(p => p.status === 'completed').length / (payments.length || 1)) * 100).toFixed(1)}%
                  </div>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                  <p className="text-xs text-muted-foreground">Payment Processing</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default PaymentsPage
