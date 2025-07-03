import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { LoadingState } from '../../components/ui/error-display'
import KPIDashboard from '../../components/analytics/KPIDashboard'
import DataVisualization from '../../components/analytics/DataVisualization'
import PredictiveAnalytics from '../../components/analytics/PredictiveAnalytics'
import { advancedAnalyticsService, AnalyticsOverview, AttendanceTrend, ProductivityMetric, DepartmentAnalytics } from '../../services/advancedAnalyticsService'
import { handleApiError } from '../../utils/error-handler'
import { 
  Users, 
  Clock, 
  AlertTriangle, 
  BarChart3, 
  PieChart, 
  Activity,
  Target,
  Brain,
  Zap
} from 'lucide-react'

const AdvancedAnalyticsPage: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [dateRange, setDateRange] = useState({
    fromDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    toDate: new Date().toISOString().split('T')[0]
  })

  const [analyticsOverview, setAnalyticsOverview] = useState<AnalyticsOverview | null>(null)
  const [attendanceTrends, setAttendanceTrends] = useState<AttendanceTrend[]>([])
  const [productivityMetrics, setProductivityMetrics] = useState<ProductivityMetric[]>([])
  const [departmentAnalytics, setDepartmentAnalytics] = useState<DepartmentAnalytics[]>([])

  const tenantId = localStorage.getItem('tenantId') || ''

  useEffect(() => {
    loadAnalyticsData()
  }, [dateRange])

  const loadAnalyticsData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [overview, trends, productivity, departments] = await Promise.all([
        advancedAnalyticsService.getAnalyticsOverview(tenantId, dateRange.fromDate, dateRange.toDate),
        advancedAnalyticsService.getAttendanceTrends(tenantId, 30),
        advancedAnalyticsService.getProductivityMetrics(tenantId, dateRange.fromDate, dateRange.toDate),
        advancedAnalyticsService.getDepartmentAnalytics(tenantId, dateRange.fromDate, dateRange.toDate)
      ])

      setAnalyticsOverview(overview)
      setAttendanceTrends(trends)
      setProductivityMetrics(productivity)
      setDepartmentAnalytics(departments)
    } catch (err) {
      const errorMessage = handleApiError(err)
      setError(typeof errorMessage === 'string' ? errorMessage : errorMessage.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDateRangeChange = (field: 'fromDate' | 'toDate', value: string) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }))
  }


  const getMetricColor = (value: number, target: number) => {
    const percentage = (value / target) * 100
    if (percentage >= 90) return 'text-green-600'
    if (percentage >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const renderOverviewCards = () => {
    if (!analyticsOverview) return null

    const cards = [
      {
        title: 'Total Employees',
        value: analyticsOverview.totalEmployees,
        icon: <Users className="h-5 w-5" />,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50'
      },
      {
        title: 'Attendance Rate',
        value: `${analyticsOverview.attendanceRate}%`,
        icon: <Target className="h-5 w-5" />,
        color: getMetricColor(analyticsOverview.attendanceRate, 95),
        bgColor: analyticsOverview.attendanceRate >= 90 ? 'bg-green-50' : 'bg-red-50'
      },
      {
        title: 'Avg Hours Worked',
        value: `${analyticsOverview.averageHoursWorked}h`,
        icon: <Clock className="h-5 w-5" />,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50'
      },
      {
        title: 'Late Arrivals',
        value: analyticsOverview.lateArrivals,
        icon: <AlertTriangle className="h-5 w-5" />,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50'
      }
    ]

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
                  <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
                </div>
                <div className={`p-3 rounded-full ${card.bgColor}`}>
                  {card.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const renderDepartmentAnalytics = () => {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Department Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {departmentAnalytics.map((dept, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{dept.department}</h4>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                    <span>{dept.totalEmployees} employees</span>
                    <span>{dept.attendanceRecords} records</span>
                    <span>{dept.averageHoursWorked.toFixed(1)}h avg</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">
                    {dept.leaveRequests} leave requests
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <LoadingState isLoading={true} error={null} onRetry={() => {}}>
        <div />
      </LoadingState>
    )
  }

  if (error) {
    return (
      <LoadingState isLoading={false} error={error} onRetry={loadAnalyticsData}>
        <div />
      </LoadingState>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Brain className="h-6 w-6 mr-2" style={{ color: '#005F96' }} />
            Advanced Analytics
          </h1>
          <p className="text-gray-600 mt-1">
            Comprehensive insights and predictive analytics for workforce management
          </p>
        </div>
        
        <div className="flex items-center space-x-4 mt-4 sm:mt-0">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">From:</label>
            <input
              type="date"
              value={dateRange.fromDate}
              onChange={(e) => handleDateRangeChange('fromDate', e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">To:</label>
            <input
              type="date"
              value={dateRange.toDate}
              onChange={(e) => handleDateRangeChange('toDate', e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <Button onClick={loadAnalyticsData} size="sm">
            Refresh
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      {renderOverviewCards()}

      {/* Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center">
            <Activity className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="kpis" className="flex items-center">
            <Target className="h-4 w-4 mr-2" />
            KPIs
          </TabsTrigger>
          <TabsTrigger value="visualization" className="flex items-center">
            <PieChart className="h-4 w-4 mr-2" />
            Charts
          </TabsTrigger>
          <TabsTrigger value="predictive" className="flex items-center">
            <Zap className="h-4 w-4 mr-2" />
            Predictive
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center">
            <BarChart3 className="h-4 w-4 mr-2" />
            Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {renderDepartmentAnalytics()}
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Attendance Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {attendanceTrends.slice(0, 5).map((trend, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        {new Date(trend.date).toLocaleDateString()}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{trend.attendanceCount}</span>
                        <Badge variant="outline" className="text-xs">
                          {trend.averageHoursWorked.toFixed(1)}h
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Productivity Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {productivityMetrics.slice(0, 5).map((metric, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{metric.department}</span>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant={metric.punctualityScore >= 80 ? "default" : "destructive"}
                          className="text-xs"
                        >
                          {metric.punctualityScore.toFixed(0)}% punctual
                        </Badge>
                        <span className="text-sm font-medium">
                          {metric.averageHoursWorked.toFixed(1)}h
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="kpis">
          <KPIDashboard tenantId={tenantId} dateRange={dateRange} />
        </TabsContent>

        <TabsContent value="visualization">
          <DataVisualization tenantId={tenantId} dateRange={dateRange} />
        </TabsContent>

        <TabsContent value="predictive">
          <PredictiveAnalytics tenantId={tenantId} />
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Custom Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 mb-4">Custom report builder coming soon</p>
                <Button variant="outline">
                  Create Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default AdvancedAnalyticsPage
