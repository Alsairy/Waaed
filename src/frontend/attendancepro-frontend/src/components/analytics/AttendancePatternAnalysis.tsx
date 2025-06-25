import React, { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { Clock, Calendar, TrendingUp, AlertTriangle, Users, Filter } from 'lucide-react'
import { toast } from 'sonner'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'



interface TimePattern {
  hour: number
  checkIns: number
  checkOuts: number
  averageHour: number
}

interface WeeklyPattern {
  dayOfWeek: string
  averageCheckIn: string
  averageCheckOut: string
  attendanceRate: number
  lateRate: number
  earlyDepartureRate: number
}

interface SeasonalPattern {
  month: string
  attendanceRate: number
  averageHours: number
  lateArrivals: number
  productivity: number
}

interface AnomalyPattern {
  id: string
  date: string
  type: 'unusual_hours' | 'late_pattern' | 'absence_pattern' | 'overtime_pattern'
  description: string
  severity: 'low' | 'medium' | 'high'
  affectedUsers: number
  department?: string
}

const AttendancePatternAnalysis: React.FC = () => {
  const [timePatterns, setTimePatterns] = useState<TimePattern[]>([])
  const [weeklyPatterns, setWeeklyPatterns] = useState<WeeklyPattern[]>([])
  const [seasonalPatterns, setSeasonalPatterns] = useState<SeasonalPattern[]>([])
  const [anomalies, setAnomalies] = useState<AnomalyPattern[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all')
  const [timeRange, setTimeRange] = useState<string>('30')

  useEffect(() => {
    loadPatternData()
  }, [selectedDepartment, timeRange])

  const loadPatternData = async () => {
    try {
      setIsLoading(true)
      
      const mockTimePatterns: TimePattern[] = [
        { hour: 7, checkIns: 5, checkOuts: 0, averageHour: 7.2 },
        { hour: 8, checkIns: 25, checkOuts: 2, averageHour: 8.3 },
        { hour: 9, checkIns: 45, checkOuts: 5, averageHour: 9.1 },
        { hour: 10, checkIns: 15, checkOuts: 3, averageHour: 10.2 },
        { hour: 11, checkIns: 8, checkOuts: 1, averageHour: 11.1 },
        { hour: 12, checkIns: 3, checkOuts: 8, averageHour: 12.0 },
        { hour: 13, checkIns: 2, checkOuts: 12, averageHour: 13.2 },
        { hour: 14, checkIns: 1, checkOuts: 5, averageHour: 14.1 },
        { hour: 15, checkIns: 0, checkOuts: 8, averageHour: 15.3 },
        { hour: 16, checkIns: 0, checkOuts: 15, averageHour: 16.2 },
        { hour: 17, checkIns: 0, checkOuts: 35, averageHour: 17.1 },
        { hour: 18, checkIns: 0, checkOuts: 25, averageHour: 18.0 },
        { hour: 19, checkIns: 0, checkOuts: 8, averageHour: 19.2 }
      ]

      const mockWeeklyPatterns: WeeklyPattern[] = [
        { dayOfWeek: 'Monday', averageCheckIn: '08:45', averageCheckOut: '17:15', attendanceRate: 0.92, lateRate: 0.15, earlyDepartureRate: 0.08 },
        { dayOfWeek: 'Tuesday', averageCheckIn: '08:35', averageCheckOut: '17:20', attendanceRate: 0.95, lateRate: 0.12, earlyDepartureRate: 0.06 },
        { dayOfWeek: 'Wednesday', averageCheckIn: '08:40', averageCheckOut: '17:18', attendanceRate: 0.96, lateRate: 0.10, earlyDepartureRate: 0.05 },
        { dayOfWeek: 'Thursday', averageCheckIn: '08:42', averageCheckOut: '17:22', attendanceRate: 0.94, lateRate: 0.11, earlyDepartureRate: 0.07 },
        { dayOfWeek: 'Friday', averageCheckIn: '08:50', averageCheckOut: '16:45', attendanceRate: 0.89, lateRate: 0.18, earlyDepartureRate: 0.25 }
      ]

      const mockSeasonalPatterns: SeasonalPattern[] = [
        { month: 'Jan', attendanceRate: 0.91, averageHours: 8.2, lateArrivals: 15, productivity: 85 },
        { month: 'Feb', attendanceRate: 0.93, averageHours: 8.3, lateArrivals: 12, productivity: 87 },
        { month: 'Mar', attendanceRate: 0.95, averageHours: 8.4, lateArrivals: 10, productivity: 89 },
        { month: 'Apr', attendanceRate: 0.94, averageHours: 8.3, lateArrivals: 11, productivity: 88 },
        { month: 'May', attendanceRate: 0.96, averageHours: 8.5, lateArrivals: 8, productivity: 91 },
        { month: 'Jun', attendanceRate: 0.94, averageHours: 8.2, lateArrivals: 13, productivity: 87 }
      ]

      const mockAnomalies: AnomalyPattern[] = [
        {
          id: '1',
          date: '2024-06-18',
          type: 'unusual_hours',
          description: 'Significant increase in overtime hours in Engineering department',
          severity: 'high',
          affectedUsers: 8,
          department: 'Engineering'
        },
        {
          id: '2',
          date: '2024-06-17',
          type: 'late_pattern',
          description: 'Unusual pattern of late arrivals on Monday mornings',
          severity: 'medium',
          affectedUsers: 12
        },
        {
          id: '3',
          date: '2024-06-16',
          type: 'absence_pattern',
          description: 'Higher than normal absence rate in Sales department',
          severity: 'medium',
          affectedUsers: 5,
          department: 'Sales'
        }
      ]

      setTimePatterns(mockTimePatterns)
      setWeeklyPatterns(mockWeeklyPatterns)
      setSeasonalPatterns(mockSeasonalPatterns)
      setAnomalies(mockAnomalies)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load pattern analysis'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const getAnomalySeverityColor = (severity: string): string => {
    switch (severity) {
      case 'high': return 'text-red-600'
      case 'medium': return 'text-yellow-600'
      case 'low': return 'text-blue-600'
      default: return 'text-gray-600'
    }
  }

  const getAnomalyTypeLabel = (type: string): string => {
    switch (type) {
      case 'unusual_hours': return 'Unusual Hours'
      case 'late_pattern': return 'Late Pattern'
      case 'absence_pattern': return 'Absence Pattern'
      case 'overtime_pattern': return 'Overtime Pattern'
      default: return type
    }
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

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between">
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
        </div>
        <Button variant="outline" size="sm" onClick={loadPatternData}>
          <TrendingUp className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Peak Check-in Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {timePatterns.length > 0 ? 
                `${timePatterns.reduce((prev, current) => prev.checkIns > current.checkIns ? prev : current).hour}:00` : 
                '--'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Most common arrival time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Best Attendance Day</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {weeklyPatterns.length > 0 ? 
                weeklyPatterns.reduce((prev, current) => prev.attendanceRate > current.attendanceRate ? prev : current).dayOfWeek :
                '--'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Highest attendance rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pattern Anomalies</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{anomalies.length}</div>
            <p className="text-xs text-muted-foreground">
              {anomalies.filter(a => a.severity === 'high').length} high priority
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Late Rate</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {weeklyPatterns.length > 0 ? 
                `${(weeklyPatterns.reduce((sum, day) => sum + day.lateRate, 0) / weeklyPatterns.length * 100).toFixed(1)}%` :
                '--'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Across all days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pattern Analysis */}
      <Tabs defaultValue="hourly" className="space-y-6">
        <TabsList>
          <TabsTrigger value="hourly">Hourly Patterns</TabsTrigger>
          <TabsTrigger value="weekly">Weekly Patterns</TabsTrigger>
          <TabsTrigger value="seasonal">Seasonal Trends</TabsTrigger>
          <TabsTrigger value="anomalies">Anomalies</TabsTrigger>
        </TabsList>

        <TabsContent value="hourly" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Hourly Check-in/Check-out Patterns</CardTitle>
              <CardDescription>Distribution of attendance events throughout the day</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={timePatterns}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" tickFormatter={(value) => `${value}:00`} />
                    <YAxis />
                    <Tooltip labelFormatter={(value) => `${value}:00`} />
                    <Legend />
                    <Bar dataKey="checkIns" fill="#8884d8" name="Check-ins" />
                    <Bar dataKey="checkOuts" fill="#82ca9d" name="Check-outs" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weekly" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Attendance Patterns</CardTitle>
                <CardDescription>Attendance rates by day of week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyPatterns}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="dayOfWeek" />
                      <YAxis tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
                      <Tooltip formatter={(value: number) => [`${(value * 100).toFixed(1)}%`, 'Attendance Rate']} />
                      <Bar dataKey="attendanceRate" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Late Arrival Patterns</CardTitle>
                <CardDescription>Late arrival rates by day of week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weeklyPatterns}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="dayOfWeek" />
                      <YAxis tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
                      <Tooltip formatter={(value: number) => [`${(value * 100).toFixed(1)}%`, 'Late Rate']} />
                      <Line type="monotone" dataKey="lateRate" stroke="#ff7300" strokeWidth={2} />
                      <Line type="monotone" dataKey="earlyDepartureRate" stroke="#ff0000" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="seasonal" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Seasonal Attendance Trends</CardTitle>
              <CardDescription>Monthly patterns and seasonal variations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={seasonalPatterns}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="attendanceRate" stroke="#8884d8" strokeWidth={2} name="Attendance Rate" />
                    <Line type="monotone" dataKey="averageHours" stroke="#82ca9d" strokeWidth={2} name="Average Hours" />
                    <Line type="monotone" dataKey="productivity" stroke="#ffc658" strokeWidth={2} name="Productivity" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="anomalies" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pattern Anomalies</CardTitle>
              <CardDescription>Unusual patterns and behaviors detected</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {anomalies.map((anomaly, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={anomaly.severity === 'high' ? 'destructive' : anomaly.severity === 'medium' ? 'default' : 'secondary'}>
                          {anomaly.severity}
                        </Badge>
                        <span className="font-medium">{getAnomalyTypeLabel(anomaly.type)}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{anomaly.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Date: {new Date(anomaly.date).toLocaleDateString()}</span>
                        <span>Affected: {anomaly.affectedUsers} users</span>
                        {anomaly.department && <span>Department: {anomaly.department}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className={`h-5 w-5 ${getAnomalySeverityColor(anomaly.severity)}`} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default AttendancePatternAnalysis
