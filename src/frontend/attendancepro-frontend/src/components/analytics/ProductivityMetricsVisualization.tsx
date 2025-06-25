import React, { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, ScatterChart, Scatter, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'
import { TrendingUp, Users, Clock, Target, Award, Filter } from 'lucide-react'
import { toast } from 'sonner'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { ProductivityMetric } from '../../services/analyticsService'

interface ProductivityTrend {
  date: string
  averageProductivity: number
  attendanceRate: number
  hoursWorked: number
}

interface DepartmentProductivity {
  department: string
  averageScore: number
  topPerformer: string
  improvement: number
  employeeCount: number
}

interface ProductivityCorrelation {
  factor: string
  correlation: number
  impact: 'positive' | 'negative' | 'neutral'
  description: string
}

const ProductivityMetricsVisualization: React.FC = () => {
  const [metrics, setMetrics] = useState<ProductivityMetric[]>([])
  const [trends, setTrends] = useState<ProductivityTrend[]>([])
  const [departmentData, setDepartmentData] = useState<DepartmentProductivity[]>([])
  const [correlations, setCorrelations] = useState<ProductivityCorrelation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all')
  const [timeRange, setTimeRange] = useState<string>('30')

  useEffect(() => {
    loadProductivityData()
  }, [selectedDepartment, timeRange])

  const loadProductivityData = async () => {
    try {
      setIsLoading(true)
      


      const mockMetrics: ProductivityMetric[] = [
        {
          userId: '1',
          userName: 'John Smith',
          department: 'Engineering',
          averageHours: 8.5,
          attendanceRate: 0.95,
          punctualityScore: 92,
          productivityScore: 88,
          lastUpdated: new Date().toISOString()
        },
        {
          userId: '2',
          userName: 'Sarah Johnson',
          department: 'Marketing',
          averageHours: 8.2,
          attendanceRate: 0.98,
          punctualityScore: 96,
          productivityScore: 94,
          lastUpdated: new Date().toISOString()
        },
        {
          userId: '3',
          userName: 'Mike Davis',
          department: 'Sales',
          averageHours: 8.8,
          attendanceRate: 0.92,
          punctualityScore: 85,
          productivityScore: 82,
          lastUpdated: new Date().toISOString()
        },
        {
          userId: '4',
          userName: 'Emily Chen',
          department: 'Engineering',
          averageHours: 8.3,
          attendanceRate: 0.97,
          punctualityScore: 94,
          productivityScore: 91,
          lastUpdated: new Date().toISOString()
        }
      ]

      const mockTrends: ProductivityTrend[] = [
        { date: '2024-06-01', averageProductivity: 85, attendanceRate: 94, hoursWorked: 8.2 },
        { date: '2024-06-08', averageProductivity: 87, attendanceRate: 96, hoursWorked: 8.4 },
        { date: '2024-06-15', averageProductivity: 89, attendanceRate: 95, hoursWorked: 8.3 },
        { date: '2024-06-22', averageProductivity: 88, attendanceRate: 97, hoursWorked: 8.5 }
      ]

      const mockDepartmentData: DepartmentProductivity[] = [
        { department: 'Engineering', averageScore: 89, topPerformer: 'Emily Chen', improvement: 5, employeeCount: 25 },
        { department: 'Marketing', averageScore: 92, topPerformer: 'Sarah Johnson', improvement: 8, employeeCount: 15 },
        { department: 'Sales', averageScore: 84, topPerformer: 'Mike Davis', improvement: -2, employeeCount: 20 },
        { department: 'HR', averageScore: 87, topPerformer: 'Lisa Wang', improvement: 3, employeeCount: 8 }
      ]

      const mockCorrelations: ProductivityCorrelation[] = [
        { factor: 'Attendance Rate', correlation: 0.85, impact: 'positive', description: 'Strong positive correlation with productivity' },
        { factor: 'Working Hours', correlation: 0.45, impact: 'positive', description: 'Moderate positive correlation up to 8.5 hours' },
        { factor: 'Remote Work Days', correlation: 0.12, impact: 'neutral', description: 'Minimal impact on overall productivity' },
        { factor: 'Overtime Hours', correlation: -0.32, impact: 'negative', description: 'Excessive overtime reduces efficiency' }
      ]

      setMetrics(mockMetrics)
      setTrends(mockTrends)
      setDepartmentData(mockDepartmentData)
      setCorrelations(mockCorrelations)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load productivity data'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }



  const getImpactColor = (impact: string): string => {
    switch (impact) {
      case 'positive': return 'text-green-600'
      case 'negative': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const radarData = departmentData.map(dept => ({
    department: dept.department,
    productivity: dept.averageScore,
    attendance: 95, // Mock data
    punctuality: 90, // Mock data
    collaboration: 85 // Mock data
  }))

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <span className="text-sm font-medium">Filters:</span>
        </div>
        <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            <SelectItem value="engineering">Engineering</SelectItem>
            <SelectItem value="marketing">Marketing</SelectItem>
            <SelectItem value="sales">Sales</SelectItem>
            <SelectItem value="hr">HR</SelectItem>
          </SelectContent>
        </Select>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">7 days</SelectItem>
            <SelectItem value="30">30 days</SelectItem>
            <SelectItem value="90">90 days</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={loadProductivityData}>
          <TrendingUp className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Productivity</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.length > 0 ? Math.round(metrics.reduce((sum, m) => sum + m.productivityScore, 0) / metrics.length) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Across all employees
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Performer</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.length > 0 ? metrics.reduce((prev, current) => prev.productivityScore > current.productivityScore ? prev : current).userName : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.length > 0 ? `${Math.max(...metrics.map(m => m.productivityScore))}% productivity` : 'No data'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.length > 0 ? (metrics.reduce((sum, m) => sum + m.averageHours, 0) / metrics.length).toFixed(1) : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Per employee per day
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Size</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.length}</div>
            <p className="text-xs text-muted-foreground">
              Active employees
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Productivity Trends</CardTitle>
            <CardDescription>Weekly productivity and attendance correlation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={formatDate} />
                  <YAxis />
                  <Tooltip labelFormatter={(value) => `Week of ${formatDate(value as string)}`} />
                  <Legend />
                  <Line type="monotone" dataKey="averageProductivity" stroke="#8884d8" strokeWidth={2} name="Productivity %" />
                  <Line type="monotone" dataKey="attendanceRate" stroke="#82ca9d" strokeWidth={2} name="Attendance %" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Department Comparison</CardTitle>
            <CardDescription>Average productivity scores by department</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="department" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="averageScore" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Individual Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Individual Performance Metrics</CardTitle>
          <CardDescription>Detailed breakdown of employee productivity scores</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart data={metrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="attendanceRate" tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} name="Attendance Rate" />
                <YAxis dataKey="productivityScore" name="Productivity Score" />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'attendanceRate' ? `${(value as number * 100).toFixed(1)}%` : value,
                    name === 'attendanceRate' ? 'Attendance Rate' : 'Productivity Score'
                  ]}
                />
                <Scatter dataKey="productivityScore" fill="#8884d8" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Department Radar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Department Performance Radar</CardTitle>
          <CardDescription>Multi-dimensional performance comparison across departments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="department" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar name="Productivity" dataKey="productivity" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                <Radar name="Attendance" dataKey="attendance" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                <Radar name="Punctuality" dataKey="punctuality" stroke="#ffc658" fill="#ffc658" fillOpacity={0.6} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Productivity Correlations */}
      <Card>
        <CardHeader>
          <CardTitle>Productivity Correlations</CardTitle>
          <CardDescription>Factors that influence employee productivity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {correlations.map((correlation, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{correlation.factor}</span>
                    <Badge variant={correlation.impact === 'positive' ? 'default' : correlation.impact === 'negative' ? 'destructive' : 'secondary'}>
                      {correlation.impact}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{correlation.description}</p>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${getImpactColor(correlation.impact)}`}>
                    {correlation.correlation > 0 ? '+' : ''}{(correlation.correlation * 100).toFixed(0)}%
                  </div>
                  <p className="text-xs text-muted-foreground">correlation</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ProductivityMetricsVisualization
