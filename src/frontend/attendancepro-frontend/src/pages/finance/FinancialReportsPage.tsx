import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Input } from '../../components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Progress } from '../../components/ui/progress'
import { 
  Search, 
  Plus, 
  Filter, 
  Download, 
  Eye,
  Edit,
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle,
  FileText,
  Settings,
  Mail,
  Calculator,
  TrendingUp,
  TrendingDown,
  PieChart,
  LineChart
} from 'lucide-react'
import { toast } from 'sonner'

interface FinancialReport {
  id: string
  name: string
  type: 'revenue' | 'expense' | 'balance_sheet' | 'cash_flow' | 'budget' | 'collection'
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  startDate: string
  endDate: string
  status: 'draft' | 'published' | 'archived'
  createdBy: string
  createdDate: string
  lastModified: string
  data: ReportData
}

interface ReportData {
  totalRevenue: number
  totalExpenses: number
  netIncome: number
  collectionRate: number
  outstandingAmount: number
  categories: CategoryData[]
  trends: TrendData[]
}

interface CategoryData {
  category: string
  amount: number
  percentage: number
  change: number
}

interface TrendData {
  period: string
  revenue: number
  expenses: number
  netIncome: number
}

interface ReportFilters {
  type: string
  period: string
  status: string
  searchTerm: string
}

interface FinancialSummary {
  totalRevenue: number
  totalExpenses: number
  netIncome: number
  profitMargin: number
  collectionRate: number
  outstandingAmount: number
}

const FinancialReportsPage: React.FC = () => {
  const [reports, setReports] = useState<FinancialReport[]>([])
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary>({
    totalRevenue: 0,
    totalExpenses: 0,
    netIncome: 0,
    profitMargin: 0,
    collectionRate: 0,
    outstandingAmount: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('reports')
  const [filters, setFilters] = useState<ReportFilters>({
    type: '',
    period: '',
    status: '',
    searchTerm: ''
  })

  useEffect(() => {
    loadFinancialReports()
  }, [])

  const loadFinancialReports = async () => {
    try {
      setIsLoading(true)
      
      const mockReports: FinancialReport[] = [
        {
          id: '1',
          name: 'Monthly Revenue Report - January 2024',
          type: 'revenue',
          period: 'monthly',
          startDate: '2024-01-01',
          endDate: '2024-01-31',
          status: 'published',
          createdBy: 'Finance Manager',
          createdDate: '2024-02-01',
          lastModified: '2024-02-01',
          data: {
            totalRevenue: 450000,
            totalExpenses: 320000,
            netIncome: 130000,
            collectionRate: 92.5,
            outstandingAmount: 35000,
            categories: [
              { category: 'Tuition Fees', amount: 350000, percentage: 77.8, change: 5.2 },
              { category: 'Registration Fees', amount: 45000, percentage: 10.0, change: 2.1 },
              { category: 'Library Fees', amount: 25000, percentage: 5.6, change: -1.2 },
              { category: 'Lab Fees', amount: 20000, percentage: 4.4, change: 3.8 },
              { category: 'Transportation', amount: 10000, percentage: 2.2, change: 1.5 }
            ],
            trends: [
              { period: 'Week 1', revenue: 110000, expenses: 80000, netIncome: 30000 },
              { period: 'Week 2', revenue: 115000, expenses: 82000, netIncome: 33000 },
              { period: 'Week 3', revenue: 108000, expenses: 78000, netIncome: 30000 },
              { period: 'Week 4', revenue: 117000, expenses: 80000, netIncome: 37000 }
            ]
          }
        },
        {
          id: '2',
          name: 'Quarterly Budget Analysis - Q1 2024',
          type: 'budget',
          period: 'quarterly',
          startDate: '2024-01-01',
          endDate: '2024-03-31',
          status: 'published',
          createdBy: 'Finance Manager',
          createdDate: '2024-04-01',
          lastModified: '2024-04-01',
          data: {
            totalRevenue: 1200000,
            totalExpenses: 950000,
            netIncome: 250000,
            collectionRate: 89.2,
            outstandingAmount: 125000,
            categories: [
              { category: 'Tuition Revenue', amount: 950000, percentage: 79.2, change: 8.5 },
              { category: 'Other Fees', amount: 250000, percentage: 20.8, change: 3.2 }
            ],
            trends: [
              { period: 'January', revenue: 450000, expenses: 320000, netIncome: 130000 },
              { period: 'February', revenue: 380000, expenses: 310000, netIncome: 70000 },
              { period: 'March', revenue: 370000, expenses: 320000, netIncome: 50000 }
            ]
          }
        }
      ]

      setReports(mockReports)

      const summary: FinancialSummary = {
        totalRevenue: mockReports.reduce((sum, r) => sum + r.data.totalRevenue, 0),
        totalExpenses: mockReports.reduce((sum, r) => sum + r.data.totalExpenses, 0),
        netIncome: mockReports.reduce((sum, r) => sum + r.data.netIncome, 0),
        profitMargin: 0,
        collectionRate: mockReports.reduce((sum, r) => sum + r.data.collectionRate, 0) / mockReports.length,
        outstandingAmount: mockReports.reduce((sum, r) => sum + r.data.outstandingAmount, 0)
      }
      summary.profitMargin = summary.totalRevenue > 0 ? (summary.netIncome / summary.totalRevenue) * 100 : 0
      setFinancialSummary(summary)

    } catch (error) {
      console.error('Error loading financial reports:', error)
      toast.error('Failed to load financial reports')
    } finally {
      setIsLoading(false)
    }
  }

  const getReportTypeColor = (type: string) => {
    switch (type) {
      case 'revenue': return 'bg-green-100 text-green-800'
      case 'expense': return 'bg-red-100 text-red-800'
      case 'balance_sheet': return 'bg-blue-100 text-blue-800'
      case 'cash_flow': return 'bg-purple-100 text-purple-800'
      case 'budget': return 'bg-orange-100 text-orange-800'
      case 'collection': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800'
      case 'draft': return 'bg-yellow-100 text-yellow-800'
      case 'archived': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPeriodColor = (period: string) => {
    switch (period) {
      case 'daily': return 'bg-blue-100 text-blue-800'
      case 'weekly': return 'bg-green-100 text-green-800'
      case 'monthly': return 'bg-orange-100 text-orange-800'
      case 'quarterly': return 'bg-purple-100 text-purple-800'
      case 'yearly': return 'bg-red-100 text-red-800'
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

  const handleReportAction = async (action: 'create' | 'edit' | 'delete' | 'publish' | 'archive') => {
    try {
      switch (action) {
        case 'create':
          toast.success('Report created successfully')
          break
        case 'edit':
          toast.success('Report updated successfully')
          break
        case 'delete':
          toast.success('Report deleted successfully')
          break
        case 'publish':
          toast.success('Report published successfully')
          break
        case 'archive':
          toast.success('Report archived successfully')
          break
      }
      loadFinancialReports()
    } catch (error) {
      console.error('Report action error:', error)
      toast.error(`Failed to ${action} report`)
    }
  }

  const handleBulkAction = async (action: 'export' | 'import' | 'schedule' | 'email') => {
    try {
      switch (action) {
        case 'export':
          toast.success('Reports exported successfully')
          break
        case 'import':
          toast.success('Reports imported successfully')
          break
        case 'schedule':
          toast.success('Report scheduling configured')
          break
        case 'email':
          toast.success('Reports emailed successfully')
          break
      }
    } catch (error) {
      console.error('Bulk action error:', error)
      toast.error(`Failed to ${action} reports`)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: '#005F96' }}>
            Financial Reports
          </h1>
          <p className="text-muted-foreground">
            Generate comprehensive financial reports and analytics
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={() => handleBulkAction('export')}>
            <Download className="mr-2 h-4 w-4" />
            Export All
          </Button>
          <Button style={{ backgroundColor: '#36BA91' }} onClick={() => handleReportAction('create')}>
            <Plus className="mr-2 h-4 w-4" />
            Create Report
          </Button>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid gap-4 md:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: '#36BA91' }}>
              {formatCurrency(financialSummary.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              All revenue streams
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: '#E74C3C' }}>
              {formatCurrency(financialSummary.totalExpenses)}
            </div>
            <p className="text-xs text-muted-foreground">
              Operating expenses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Income</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: financialSummary.netIncome >= 0 ? '#36BA91' : '#E74C3C' }}>
              {formatCurrency(financialSummary.netIncome)}
            </div>
            <p className="text-xs text-muted-foreground">
              Profit/Loss
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: financialSummary.profitMargin >= 0 ? '#36BA91' : '#E74C3C' }}>
              {financialSummary.profitMargin.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Revenue efficiency
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: '#F39C12' }}>
              {financialSummary.collectionRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Payment success
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: '#E74C3C' }}>
              {formatCurrency(financialSummary.outstandingAmount)}
            </div>
            <p className="text-xs text-muted-foreground">
              Pending collection
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="mr-2 h-5 w-5" style={{ color: '#005F96' }} />
                Filter Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-5">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search reports..."
                    value={filters.searchTerm}
                    onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                    className="pl-10"
                  />
                </div>
                
                <select
                  value={filters.type}
                  onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                >
                  <option value="">All Types</option>
                  <option value="revenue">Revenue</option>
                  <option value="expense">Expense</option>
                  <option value="balance_sheet">Balance Sheet</option>
                  <option value="cash_flow">Cash Flow</option>
                  <option value="budget">Budget</option>
                  <option value="collection">Collection</option>
                </select>

                <select
                  value={filters.period}
                  onChange={(e) => setFilters(prev => ({ ...prev, period: e.target.value }))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                >
                  <option value="">All Periods</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>

                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                >
                  <option value="">All Status</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>

                <Button variant="outline" onClick={() => setFilters({ type: '', period: '', status: '', searchTerm: '' })}>
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Reports List */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-muted-foreground">Loading financial reports...</p>
              </div>
            ) : (
              reports.map((report) => (
                <Card key={report.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <CardTitle className="text-lg">{report.name}</CardTitle>
                          <Badge className={getReportTypeColor(report.type)}>
                            {report.type.replace('_', ' ')}
                          </Badge>
                          <Badge className={getPeriodColor(report.period)}>
                            {report.period}
                          </Badge>
                          <Badge className={getStatusColor(report.status)}>
                            {report.status}
                          </Badge>
                        </div>
                        <CardDescription className="mt-1">
                          {new Date(report.startDate).toLocaleDateString()} - {new Date(report.endDate).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold" style={{ color: '#36BA91' }}>
                          {formatCurrency(report.data.totalRevenue)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Total Revenue
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Net Income</span>
                        <p className="font-medium" style={{ color: report.data.netIncome >= 0 ? '#36BA91' : '#E74C3C' }}>
                          {formatCurrency(report.data.netIncome)}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Collection Rate</span>
                        <p className="font-medium">{report.data.collectionRate.toFixed(1)}%</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Outstanding</span>
                        <p className="font-medium text-orange-600">{formatCurrency(report.data.outstandingAmount)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Created By</span>
                        <p className="font-medium">{report.createdBy}</p>
                      </div>
                    </div>

                    {report.data.categories.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Revenue Breakdown</h4>
                        <div className="space-y-2">
                          {report.data.categories.slice(0, 3).map((category, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <span className="text-sm">{category.category}</span>
                              <div className="flex items-center space-x-2">
                                <Progress value={category.percentage} className="w-16" />
                                <span className="text-sm font-medium w-20">{formatCurrency(category.amount)}</span>
                                <span className={`text-xs ${category.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {category.change >= 0 ? '+' : ''}{category.change.toFixed(1)}%
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="mr-1 h-3 w-3" />
                          View Report
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleReportAction('edit')}>
                          <Edit className="mr-1 h-3 w-3" />
                          Edit
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="mr-1 h-3 w-3" />
                          Export
                        </Button>
                      </div>
                      <div className="flex items-center space-x-2">
                        {report.status === 'draft' && (
                          <Button size="sm" onClick={() => handleReportAction('publish')} style={{ backgroundColor: '#36BA91' }}>
                            Publish
                          </Button>
                        )}
                        {report.status === 'published' && (
                          <Button size="sm" variant="outline" onClick={() => handleReportAction('archive')}>
                            Archive
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

            {reports.length === 0 && !isLoading && (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>No financial reports found</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Revenue vs Expenses Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <LineChart className="mr-2 h-5 w-5" style={{ color: '#36BA91' }} />
                  Revenue vs Expenses Trend
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {reports[0]?.data.trends.map((trend, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{trend.period}</span>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm text-green-600">{formatCurrency(trend.revenue)}</p>
                          <p className="text-xs text-muted-foreground">Revenue</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-red-600">{formatCurrency(trend.expenses)}</p>
                          <p className="text-xs text-muted-foreground">Expenses</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium" style={{ color: trend.netIncome >= 0 ? '#36BA91' : '#E74C3C' }}>
                            {formatCurrency(trend.netIncome)}
                          </p>
                          <p className="text-xs text-muted-foreground">Net</p>
                        </div>
                      </div>
                    </div>
                  )) || <p className="text-muted-foreground">No trend data available</p>}
                </div>
              </CardContent>
            </Card>

            {/* Report Type Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="mr-2 h-5 w-5" style={{ color: '#F39C12' }} />
                  Report Type Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {['revenue', 'budget', 'collection', 'expense', 'cash_flow'].map((type) => {
                    const count = reports.filter(r => r.type === type).length
                    const percentage = (count / (reports.length || 1)) * 100
                    return (
                      <div key={type} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge className={getReportTypeColor(type)}>
                            {type.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Progress value={percentage} className="w-20" />
                          <span className="text-sm font-medium w-12">{count} ({percentage.toFixed(1)}%)</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Financial Performance Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Financial Performance Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold" style={{ color: '#36BA91' }}>
                    {reports.filter(r => r.data.netIncome > 0).length}
                  </div>
                  <p className="text-sm text-muted-foreground">Profitable Periods</p>
                  <p className="text-xs text-muted-foreground">Positive net income</p>
                </div>
                <div>
                  <div className="text-2xl font-bold" style={{ color: '#F39C12' }}>
                    {reports.filter(r => r.data.collectionRate >= 90).length}
                  </div>
                  <p className="text-sm text-muted-foreground">High Collection</p>
                  <p className="text-xs text-muted-foreground">≥90% collection rate</p>
                </div>
                <div>
                  <div className="text-2xl font-bold" style={{ color: '#E74C3C' }}>
                    {reports.filter(r => r.data.outstandingAmount > 50000).length}
                  </div>
                  <p className="text-sm text-muted-foreground">High Outstanding</p>
                  <p className="text-xs text-muted-foreground">&gt;50K outstanding</p>
                </div>
                <div>
                  <div className="text-2xl font-bold" style={{ color: '#005F96' }}>
                    {reports.filter(r => r.status === 'published').length}
                  </div>
                  <p className="text-sm text-muted-foreground">Published Reports</p>
                  <p className="text-xs text-muted-foreground">Available reports</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline" onClick={() => handleReportAction('create')}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Report
                </Button>
                <Button className="w-full justify-start" variant="outline" onClick={() => handleBulkAction('schedule')}>
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule Reports
                </Button>
                <Button className="w-full justify-start" variant="outline" onClick={() => handleBulkAction('email')}>
                  <Mail className="mr-2 h-4 w-4" />
                  Email Reports
                </Button>
                <Button className="w-full justify-start" variant="outline" onClick={() => handleBulkAction('export')}>
                  <Download className="mr-2 h-4 w-4" />
                  Export All Data
                </Button>
              </CardContent>
            </Card>

            {/* Recent Reports */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Reports</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {reports.slice(0, 3).map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <p className="font-medium text-sm">{report.name}</p>
                      <p className="text-xs text-muted-foreground">{new Date(report.createdDate).toLocaleDateString()}</p>
                    </div>
                    <Badge className={getStatusColor(report.status)}>
                      {report.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Key Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Key Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Average Profit Margin</span>
                  <span className="font-medium">{financialSummary.profitMargin.toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Collection Efficiency</span>
                  <span className="font-medium">{financialSummary.collectionRate.toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Reports</span>
                  <span className="font-medium">{reports.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Published Reports</span>
                  <span className="font-medium">{reports.filter(r => r.status === 'published').length}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default FinancialReportsPage
