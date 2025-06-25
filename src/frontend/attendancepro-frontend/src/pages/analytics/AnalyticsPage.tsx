import React, { useState, useEffect } from 'react'
import { TrendingUp, Activity, AlertTriangle, RefreshCw, Calendar, Users, Brain } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, AreaChart, Area, PieChart as RechartsPieChart, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'
import { toast } from 'sonner'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Alert, AlertDescription } from '../../components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Progress } from '../../components/ui/progress'
import analyticsService, { AnalyticsOverview, AttendanceTrend, DepartmentAnalytics, PredictiveInsight, AnomalyDetection } from '../../services/analyticsService'



interface WorkforceInsight {
  id: string
  metric: string
  value: number
  trend: 'up' | 'down' | 'stable'
  change: number
  description: string
  category: 'engagement' | 'productivity' | 'satisfaction' | 'retention'
}

interface AttendancePattern {
  id: string
  pattern: string
  frequency: number
  impact: 'positive' | 'negative' | 'neutral'
  description: string
  affectedEmployees: number
  recommendation: string
}

interface WorkforcePrediction {
  id: string
  type: 'attendance' | 'turnover' | 'productivity' | 'engagement'
  prediction: string
  confidence: number
  timeframe: string
  impact: 'high' | 'medium' | 'low'
  factors: string[]
}

const AnalyticsPage: React.FC = () => {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null)
  const [trends, setTrends] = useState<AttendanceTrend[]>([])
  const [departments, setDepartments] = useState<DepartmentAnalytics[]>([])
  const [insights, setInsights] = useState<PredictiveInsight[]>([])
  const [anomalies, setAnomalies] = useState<AnomalyDetection[]>([])
  const [workforceInsights, setWorkforceInsights] = useState<WorkforceInsight[]>([])
  const [attendancePatterns, setAttendancePatterns] = useState<AttendancePattern[]>([])
  const [predictions, setPredictions] = useState<WorkforcePrediction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [activeTab, setActiveTab] = useState('overview')

  const loadAnalyticsData = async () => {
    try {
      setIsLoading(true)
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(endDate.getDate() - 30)

      const filter = {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      }

      const [overviewData, trendsData, departmentsData, insightsData, anomaliesData] = await Promise.all([
        analyticsService.getOverview(filter),
        analyticsService.getAttendanceTrends(filter),
        analyticsService.getDepartmentAnalytics(undefined, filter),
        analyticsService.getPredictiveInsights(undefined, 5),
        analyticsService.getAnomalies(false, undefined)
      ])

      setOverview(overviewData)
      setTrends(trendsData)
      setDepartments(departmentsData)
      setInsights(insightsData)
      setAnomalies(anomaliesData)

      generateWorkforceInsights()
      generateAttendancePatterns()
      generateWorkforcePredictions()
      
      setLastUpdated(new Date())
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      toast.error('Failed to load analytics data: ' + errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const generateWorkforceInsights = () => {
    const mockInsights: WorkforceInsight[] = [
      {
        id: '1',
        metric: 'Employee Engagement Score',
        value: 78,
        trend: 'up',
        change: 5.2,
        description: 'Overall engagement has improved significantly this quarter',
        category: 'engagement'
      },
      {
        id: '2',
        metric: 'Productivity Index',
        value: 85,
        trend: 'up',
        change: 3.1,
        description: 'Team productivity shows consistent upward trend',
        category: 'productivity'
      },
      {
        id: '3',
        metric: 'Employee Satisfaction',
        value: 82,
        trend: 'stable',
        change: 0.5,
        description: 'Satisfaction levels remain stable with slight improvement',
        category: 'satisfaction'
      },
      {
        id: '4',
        metric: 'Retention Rate',
        value: 94,
        trend: 'up',
        change: 2.3,
        description: 'Employee retention has improved with new initiatives',
        category: 'retention'
      }
    ]
    setWorkforceInsights(mockInsights)
  }

  const generateAttendancePatterns = () => {
    const mockPatterns: AttendancePattern[] = [
      {
        id: '1',
        pattern: 'Monday Morning Late Arrivals',
        frequency: 23,
        impact: 'negative',
        description: 'Consistent pattern of late arrivals on Monday mornings',
        affectedEmployees: 45,
        recommendation: 'Consider flexible start times or Monday motivation programs'
      },
      {
        id: '2',
        pattern: 'Friday Early Departures',
        frequency: 18,
        impact: 'neutral',
        description: 'Employees tend to leave early on Fridays',
        affectedEmployees: 32,
        recommendation: 'Implement flexible Friday schedules'
      },
      {
        id: '3',
        pattern: 'Post-Holiday Absenteeism',
        frequency: 35,
        impact: 'negative',
        description: 'Higher absence rates following public holidays',
        affectedEmployees: 67,
        recommendation: 'Plan for reduced capacity and consider wellness programs'
      },
      {
        id: '4',
        pattern: 'Weather-Related Absences',
        frequency: 12,
        impact: 'neutral',
        description: 'Attendance drops during severe weather conditions',
        affectedEmployees: 28,
        recommendation: 'Implement remote work policies for weather events'
      }
    ]
    setAttendancePatterns(mockPatterns)
  }

  const generateWorkforcePredictions = () => {
    const mockPredictions: WorkforcePrediction[] = [
      {
        id: '1',
        type: 'attendance',
        prediction: 'Attendance rate expected to increase by 3-5% next quarter',
        confidence: 87,
        timeframe: 'Next 3 months',
        impact: 'medium',
        factors: ['Seasonal trends', 'New wellness programs', 'Improved work-life balance']
      },
      {
        id: '2',
        type: 'turnover',
        prediction: 'Potential turnover risk in Engineering department',
        confidence: 72,
        timeframe: 'Next 6 months',
        impact: 'high',
        factors: ['Market competition', 'Workload increase', 'Limited career progression']
      },
      {
        id: '3',
        type: 'productivity',
        prediction: 'Team productivity likely to peak in Q2',
        confidence: 91,
        timeframe: 'Next 4 months',
        impact: 'high',
        factors: ['Project completion cycles', 'Team training completion', 'Process improvements']
      },
      {
        id: '4',
        type: 'engagement',
        prediction: 'Employee engagement scores trending upward',
        confidence: 83,
        timeframe: 'Next 2 months',
        impact: 'medium',
        factors: ['Recognition programs', 'Team building activities', 'Feedback implementation']
      }
    ]
    setPredictions(mockPredictions)
  }

  useEffect(() => {
    loadAnalyticsData()
  }, [])

  const formatPercentage = (value: number): string => {
    return `${(value * 100).toFixed(1)}%`
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const getInsightBadgeColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'destructive'
      case 'medium': return 'default'
      case 'low': return 'secondary'
      default: return 'outline'
    }
  }

  const getAnomalySeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600'
      case 'medium': return 'text-yellow-600'
      case 'low': return 'text-blue-600'
      default: return 'text-gray-600'
    }
  }

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return '↗️'
      case 'down': return '↘️'
      case 'stable': return '→'
      default: return '→'
    }
  }

  const getPredictionTypeIcon = (type: string) => {
    switch (type) {
      case 'attendance': return <Calendar className="h-4 w-4" />
      case 'turnover': return <Users className="h-4 w-4" />
      case 'productivity': return <TrendingUp className="h-4 w-4" />
      case 'engagement': return <Activity className="h-4 w-4" />
      default: return <Brain className="h-4 w-4" />
    }
  }

  const patternData = attendancePatterns.map((pattern) => ({
    name: pattern.pattern.split(' ').slice(0, 2).join(' '),
    frequency: pattern.frequency,
    employees: pattern.affectedEmployees
  }))

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
            <p className="text-muted-foreground">Loading insights and trends...</p>
          </div>
        </div>
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Advanced Analytics</h1>
          <p className="text-muted-foreground">
            AI-powered workforce insights, predictions, and pattern analysis
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </span>
          <Button variant="outline" size="sm" onClick={loadAnalyticsData} disabled={isLoading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="workforce">Workforce Insights</TabsTrigger>
          <TabsTrigger value="patterns">Attendance Patterns</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="anomalies">Anomalies</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview ? formatPercentage(overview.attendanceRate) : '--'}</div>
            <p className="text-xs text-muted-foreground">
              {overview ? `${overview.presentToday}/${overview.totalEmployees} present today` : 'Loading...'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Hours</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview ? overview.averageWorkingHours.toFixed(1) : '--'}</div>
            <p className="text-xs text-muted-foreground">
              Per employee per day
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Absent Today</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview ? overview.absentToday : '--'}</div>
            <p className="text-xs text-muted-foreground">
              {overview ? `${overview.lateToday} late arrivals` : 'Loading...'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leave Requests</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview ? overview.pendingLeaveRequests : '--'}</div>
            <p className="text-xs text-muted-foreground">
              {overview ? `${overview.upcomingLeaves} upcoming leaves` : 'Loading...'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Anomaly Alerts */}
      {anomalies.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span>{anomalies.length} anomalies detected requiring attention</span>
              <Badge variant="destructive">{anomalies.filter(a => a.severity === 'high').length} High Priority</Badge>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Attendance Trends</CardTitle>
            <CardDescription>Daily attendance patterns over the last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={formatDate} />
                  <YAxis />
                  <Tooltip labelFormatter={(value) => `Date: ${formatDate(value as string)}`} />
                  <Legend />
                  <Line type="monotone" dataKey="present" stroke="#22c55e" strokeWidth={2} name="Present" />
                  <Line type="monotone" dataKey="absent" stroke="#ef4444" strokeWidth={2} name="Absent" />
                  <Line type="monotone" dataKey="late" stroke="#f59e0b" strokeWidth={2} name="Late" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Department Breakdown</CardTitle>
            <CardDescription>Attendance rates by department</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departments}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="departmentName" />
                  <YAxis tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
                  <Tooltip formatter={(value: number) => [`${(value * 100).toFixed(1)}%`, 'Attendance Rate']} />
                  <Bar dataKey="attendanceRate" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Predictive Insights */}
      {insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Predictive Insights</CardTitle>
            <CardDescription>AI-powered recommendations and forecasts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {insights.map((insight, index) => (
                <div key={index} className="flex items-start justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">{insight.title}</h4>
                      <Badge variant={getInsightBadgeColor(insight.impact)}>{insight.impact} impact</Badge>
                      <Badge variant="outline">{(insight.confidence * 100).toFixed(0)}% confidence</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{insight.description}</p>
                    {insight.recommendedActions.length > 0 && (
                      <div className="text-xs">
                        <strong>Recommended actions:</strong>
                        <ul className="list-disc list-inside mt-1">
                          {insight.recommendedActions.slice(0, 2).map((action, i) => (
                            <li key={i}>{action}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

        </TabsContent>

        <TabsContent value="workforce" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {workforceInsights.map((insight) => (
              <Card key={insight.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{insight.metric}</CardTitle>
                  <span className="text-lg">{getTrendIcon(insight.trend)}</span>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{insight.value}%</div>
                  <div className="flex items-center gap-1 text-xs">
                    <span className={insight.trend === 'up' ? 'text-green-600' : insight.trend === 'down' ? 'text-red-600' : 'text-gray-600'}>
                      {insight.change > 0 ? '+' : ''}{insight.change}%
                    </span>
                    <span className="text-muted-foreground">vs last period</span>
                  </div>
                  <Progress value={insight.value} className="mt-2" />
                  <p className="text-xs text-muted-foreground mt-2">{insight.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Workforce Health Radar</CardTitle>
                <CardDescription>Multi-dimensional workforce analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={workforceInsights}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12 }} />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
                      <Radar name="Score" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} strokeWidth={2} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Engagement Trends</CardTitle>
                <CardDescription>Employee engagement over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tickFormatter={formatDate} />
                      <YAxis />
                      <Tooltip labelFormatter={(value) => `Date: ${formatDate(value as string)}`} />
                      <Area type="monotone" dataKey="present" stackId="1" stroke="#22c55e" fill="#22c55e" fillOpacity={0.6} />
                      <Area type="monotone" dataKey="late" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Pattern Frequency Analysis</CardTitle>
                <CardDescription>Most common attendance patterns identified</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={patternData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="frequency" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pattern Impact Distribution</CardTitle>
                <CardDescription>Impact categories of identified patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Tooltip />
                      <RechartsPieChart data={[
                        { name: 'Negative Impact', value: attendancePatterns.filter(p => p.impact === 'negative').length, color: '#ef4444' },
                        { name: 'Neutral Impact', value: attendancePatterns.filter(p => p.impact === 'neutral').length, color: '#6b7280' },
                        { name: 'Positive Impact', value: attendancePatterns.filter(p => p.impact === 'positive').length, color: '#22c55e' }
                      ]}>
                        {[
                          { name: 'Negative Impact', value: attendancePatterns.filter(p => p.impact === 'negative').length, color: '#ef4444' },
                          { name: 'Neutral Impact', value: attendancePatterns.filter(p => p.impact === 'neutral').length, color: '#6b7280' },
                          { name: 'Positive Impact', value: attendancePatterns.filter(p => p.impact === 'positive').length, color: '#22c55e' }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </RechartsPieChart>
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Detailed Pattern Analysis</CardTitle>
              <CardDescription>Comprehensive breakdown of attendance patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {attendancePatterns.map((pattern) => (
                  <div key={pattern.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium">{pattern.pattern}</h4>
                        <p className="text-sm text-muted-foreground">{pattern.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{pattern.frequency}% frequency</Badge>
                        <Badge variant={pattern.impact === 'positive' ? 'default' : pattern.impact === 'negative' ? 'destructive' : 'secondary'}>
                          {pattern.impact} impact
                        </Badge>
                      </div>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Affects {pattern.affectedEmployees} employees • </span>
                      <span className="font-medium">Recommendation:</span> {pattern.recommendation}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-6">
          <div className="grid gap-6">
            {predictions.map((prediction) => (
              <Card key={prediction.id}>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    {getPredictionTypeIcon(prediction.type)}
                    <CardTitle className="capitalize">{prediction.type} Prediction</CardTitle>
                    <Badge variant={prediction.impact === 'high' ? 'destructive' : prediction.impact === 'medium' ? 'default' : 'secondary'}>
                      {prediction.impact} impact
                    </Badge>
                  </div>
                  <CardDescription>{prediction.timeframe}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-lg font-medium">{prediction.prediction}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-sm text-muted-foreground">Confidence:</span>
                        <Progress value={prediction.confidence} className="flex-1 max-w-[200px]" />
                        <span className="text-sm font-medium">{prediction.confidence}%</span>
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium mb-2">Key Factors:</h5>
                      <div className="flex flex-wrap gap-2">
                        {prediction.factors.map((factor, index) => (
                          <Badge key={index} variant="outline">{factor}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="anomalies" className="space-y-6">
          {/* Anomaly Alerts */}
          {anomalies.length > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <span>{anomalies.length} anomalies detected requiring attention</span>
                  <Badge variant="destructive">{anomalies.filter(a => a.severity === 'high').length} High Priority</Badge>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Anomaly Detection */}
          {anomalies.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Anomaly Detection</CardTitle>
                <CardDescription>Unusual patterns and behaviors detected</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {anomalies.map((anomaly) => (
                    <div key={anomaly.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-sm font-medium ${getAnomalySeverityColor(anomaly.severity)}`}>
                            {anomaly.severity.toUpperCase()}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {new Date(anomaly.detectedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm">{anomaly.description}</p>
                        {anomaly.userName && (
                          <p className="text-xs text-muted-foreground">User: {anomaly.userName}</p>
                        )}
                      </div>
                      <Badge variant={anomaly.resolved ? 'secondary' : 'destructive'}>
                        {anomaly.resolved ? 'Resolved' : 'Active'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default AnalyticsPage
