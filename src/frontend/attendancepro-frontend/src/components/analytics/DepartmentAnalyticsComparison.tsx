import React, { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'
import { Building2, Users, TrendingUp, Award, Filter, Download } from 'lucide-react'
import { toast } from 'sonner'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'


interface DepartmentComparison {
  departmentName: string
  attendanceRate: number
  averageHours: number
  productivityScore: number
  employeeCount: number
  lateArrivals: number
  earlyDepartures: number
  overtimeHours: number
  leaveRequests: number
  satisfaction: number
  turnoverRate: number
}

interface DepartmentTrend {
  month: string
  [key: string]: string | number
}

interface DepartmentRanking {
  department: string
  metric: string
  value: number
  rank: number
  change: number
  trend: 'up' | 'down' | 'stable'
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C']

const DepartmentAnalyticsComparison: React.FC = () => {
  const [departments, setDepartments] = useState<DepartmentComparison[]>([])
  const [trends, setTrends] = useState<DepartmentTrend[]>([])
  const [rankings, setRankings] = useState<DepartmentRanking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedMetric, setSelectedMetric] = useState<string>('attendanceRate')
  const [timeRange, setTimeRange] = useState<string>('6')
  const [comparisonType] = useState<string>('current')

  useEffect(() => {
    loadDepartmentData()
  }, [selectedMetric, timeRange, comparisonType])

  const loadDepartmentData = async () => {
    try {
      setIsLoading(true)
      


      const mockDepartments: DepartmentComparison[] = [
        {
          departmentName: 'Engineering',
          attendanceRate: 0.94,
          averageHours: 8.5,
          productivityScore: 89,
          employeeCount: 25,
          lateArrivals: 8,
          earlyDepartures: 3,
          overtimeHours: 45,
          leaveRequests: 12,
          satisfaction: 87,
          turnoverRate: 0.08
        },
        {
          departmentName: 'Marketing',
          attendanceRate: 0.96,
          averageHours: 8.2,
          productivityScore: 92,
          employeeCount: 15,
          lateArrivals: 4,
          earlyDepartures: 2,
          overtimeHours: 28,
          leaveRequests: 8,
          satisfaction: 91,
          turnoverRate: 0.12
        },
        {
          departmentName: 'Sales',
          attendanceRate: 0.91,
          averageHours: 8.8,
          productivityScore: 85,
          employeeCount: 20,
          lateArrivals: 12,
          earlyDepartures: 6,
          overtimeHours: 62,
          leaveRequests: 15,
          satisfaction: 82,
          turnoverRate: 0.15
        },
        {
          departmentName: 'HR',
          attendanceRate: 0.98,
          averageHours: 8.0,
          productivityScore: 88,
          employeeCount: 8,
          lateArrivals: 1,
          earlyDepartures: 1,
          overtimeHours: 12,
          leaveRequests: 5,
          satisfaction: 89,
          turnoverRate: 0.05
        },
        {
          departmentName: 'Finance',
          attendanceRate: 0.95,
          averageHours: 8.3,
          productivityScore: 90,
          employeeCount: 12,
          lateArrivals: 3,
          earlyDepartures: 2,
          overtimeHours: 35,
          leaveRequests: 7,
          satisfaction: 86,
          turnoverRate: 0.10
        }
      ]

      const mockTrends: DepartmentTrend[] = [
        { month: 'Jan', Engineering: 92, Marketing: 94, Sales: 88, HR: 96, Finance: 93 },
        { month: 'Feb', Engineering: 93, Marketing: 95, Sales: 89, HR: 97, Finance: 94 },
        { month: 'Mar', Engineering: 94, Marketing: 96, Sales: 90, HR: 98, Finance: 95 },
        { month: 'Apr', Engineering: 94, Marketing: 96, Sales: 91, HR: 98, Finance: 95 },
        { month: 'May', Engineering: 94, Marketing: 96, Sales: 91, HR: 98, Finance: 95 },
        { month: 'Jun', Engineering: 94, Marketing: 96, Sales: 91, HR: 98, Finance: 95 }
      ]

      const mockRankings: DepartmentRanking[] = [
        { department: 'HR', metric: 'Attendance Rate', value: 98, rank: 1, change: 0, trend: 'stable' },
        { department: 'Marketing', metric: 'Attendance Rate', value: 96, rank: 2, change: 1, trend: 'up' },
        { department: 'Finance', metric: 'Attendance Rate', value: 95, rank: 3, change: 0, trend: 'stable' },
        { department: 'Engineering', metric: 'Attendance Rate', value: 94, rank: 4, change: -1, trend: 'down' },
        { department: 'Sales', metric: 'Attendance Rate', value: 91, rank: 5, change: 0, trend: 'stable' }
      ]

      setDepartments(mockDepartments)
      setTrends(mockTrends)
      setRankings(mockRankings)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load department analytics'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const getMetricValue = (dept: DepartmentComparison, metric: string): number => {
    switch (metric) {
      case 'attendanceRate': return dept.attendanceRate * 100
      case 'productivityScore': return dept.productivityScore
      case 'averageHours': return dept.averageHours
      case 'satisfaction': return dept.satisfaction
      case 'turnoverRate': return dept.turnoverRate * 100
      default: return 0
    }
  }

  const getMetricLabel = (metric: string): string => {
    switch (metric) {
      case 'attendanceRate': return 'Attendance Rate (%)'
      case 'productivityScore': return 'Productivity Score'
      case 'averageHours': return 'Average Hours'
      case 'satisfaction': return 'Satisfaction Score'
      case 'turnoverRate': return 'Turnover Rate (%)'
      default: return metric
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'down': return <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />
      default: return <div className="h-4 w-4 bg-gray-400 rounded-full" />
    }
  }

  const exportData = () => {
    const csvContent = departments.map(dept => 
      `${dept.departmentName},${dept.attendanceRate},${dept.productivityScore},${dept.employeeCount}`
    ).join('\n')
    
    const blob = new Blob([`Department,Attendance Rate,Productivity Score,Employee Count\n${csvContent}`], 
      { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'department-analytics.csv'
    a.click()
    window.URL.revokeObjectURL(url)
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

  const radarData = departments.map(dept => ({
    department: dept.departmentName.substring(0, 3),
    attendance: dept.attendanceRate * 100,
    productivity: dept.productivityScore,
    satisfaction: dept.satisfaction,
    hours: (dept.averageHours / 10) * 100
  }))

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <span className="text-sm font-medium">Filters:</span>
          </div>
          <Select value={selectedMetric} onValueChange={setSelectedMetric}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select metric" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="attendanceRate">Attendance Rate</SelectItem>
              <SelectItem value="productivityScore">Productivity Score</SelectItem>
              <SelectItem value="averageHours">Average Hours</SelectItem>
              <SelectItem value="satisfaction">Satisfaction</SelectItem>
              <SelectItem value="turnoverRate">Turnover Rate</SelectItem>
            </SelectContent>
          </Select>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">3 months</SelectItem>
              <SelectItem value="6">6 months</SelectItem>
              <SelectItem value="12">12 months</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={exportData}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={loadDepartmentData}>
            <TrendingUp className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Departments</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{departments.length}</div>
            <p className="text-xs text-muted-foreground">
              Active departments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {departments.reduce((sum, dept) => sum + dept.employeeCount, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all departments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Best Performer</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {departments.reduce((prev, current) => 
                getMetricValue(prev, selectedMetric) > getMetricValue(current, selectedMetric) ? prev : current
              ).departmentName}
            </div>
            <p className="text-xs text-muted-foreground">
              {getMetricLabel(selectedMetric)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(departments.reduce((sum, dept) => sum + getMetricValue(dept, selectedMetric), 0) / departments.length).toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">
              {getMetricLabel(selectedMetric)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics */}
      <Tabs defaultValue="comparison" className="space-y-6">
        <TabsList>
          <TabsTrigger value="comparison">Department Comparison</TabsTrigger>
          <TabsTrigger value="trends">Trends Analysis</TabsTrigger>
          <TabsTrigger value="rankings">Rankings</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
        </TabsList>

        <TabsContent value="comparison" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Department Comparison - {getMetricLabel(selectedMetric)}</CardTitle>
                <CardDescription>Current performance across departments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={departments}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="departmentName" />
                      <YAxis />
                      <Tooltip />
                      <Bar 
                        dataKey={selectedMetric} 
                        fill="#8884d8"
                        name={getMetricLabel(selectedMetric)}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Employee Distribution</CardTitle>
                <CardDescription>Number of employees per department</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={departments}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ departmentName, employeeCount }) => `${departmentName}: ${employeeCount}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="employeeCount"
                      >
                        {departments.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Department Trends Over Time</CardTitle>
              <CardDescription>Attendance rate trends by department</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {departments.map((dept, index) => (
                      <Line 
                        key={dept.departmentName}
                        type="monotone" 
                        dataKey={dept.departmentName} 
                        stroke={COLORS[index % COLORS.length]} 
                        strokeWidth={2}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rankings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Department Rankings</CardTitle>
              <CardDescription>Performance rankings by selected metric</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rankings.map((ranking, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-bold">
                        {ranking.rank}
                      </div>
                      <div>
                        <h4 className="font-medium">{ranking.department}</h4>
                        <p className="text-sm text-muted-foreground">{ranking.metric}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold">{ranking.value}%</span>
                      {getTrendIcon(ranking.trend)}
                      {ranking.change !== 0 && (
                        <Badge variant={ranking.change > 0 ? 'default' : 'destructive'}>
                          {ranking.change > 0 ? '+' : ''}{ranking.change}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Multi-Dimensional Performance Overview</CardTitle>
              <CardDescription>Radar chart showing all key metrics by department</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="department" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar name="Attendance" dataKey="attendance" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                    <Radar name="Productivity" dataKey="productivity" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                    <Radar name="Satisfaction" dataKey="satisfaction" stroke="#ffc658" fill="#ffc658" fillOpacity={0.6} />
                    <Radar name="Hours" dataKey="hours" stroke="#ff7300" fill="#ff7300" fillOpacity={0.6} />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default DepartmentAnalyticsComparison
