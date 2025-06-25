import React, { useState, useEffect } from 'react'
import { Heart, TrendingUp, AlertTriangle, Target } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line } from 'recharts'
import { toast } from 'sonner'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Progress } from '../ui/progress'


interface WorkforceHealthScore {
  overallScore: number
  attendanceScore: number
  engagementScore: number
  productivityScore: number
  wellnessScore: number
  riskFactors: string[]
  recommendations: string[]
  trends: {
    date: string
    score: number
  }[]
}

interface EngagementInsight {
  category: string
  score: number
  trend: 'up' | 'down' | 'stable'
  factors: string[]
  impact: 'high' | 'medium' | 'low'
}



const WorkforceHealthDashboard: React.FC = () => {
  const [healthScore, setHealthScore] = useState<WorkforceHealthScore | null>(null)
  const [engagementInsights, setEngagementInsights] = useState<EngagementInsight[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadWorkforceHealthData()
  }, [])

  const loadWorkforceHealthData = async () => {
    try {
      setIsLoading(true)
      
      const mockHealthScore: WorkforceHealthScore = {
        overallScore: 87,
        attendanceScore: 92,
        engagementScore: 78,
        productivityScore: 89,
        wellnessScore: 85,
        riskFactors: [
          'Increased overtime hours in Engineering',
          'Lower engagement scores in Sales team',
          'Rising stress indicators in Q4'
        ],
        recommendations: [
          'Implement flexible working hours for Engineering team',
          'Conduct team building activities for Sales department',
          'Introduce wellness programs and stress management workshops'
        ],
        trends: [
          { date: '2024-01', score: 82 },
          { date: '2024-02', score: 84 },
          { date: '2024-03', score: 86 },
          { date: '2024-04', score: 87 },
          { date: '2024-05', score: 89 },
          { date: '2024-06', score: 87 }
        ]
      }

      const mockEngagementInsights: EngagementInsight[] = [
        {
          category: 'Work-Life Balance',
          score: 78,
          trend: 'down',
          factors: ['Increased overtime', 'Weekend work'],
          impact: 'high'
        },
        {
          category: 'Team Collaboration',
          score: 85,
          trend: 'up',
          factors: ['New collaboration tools', 'Team meetings'],
          impact: 'medium'
        },
        {
          category: 'Career Development',
          score: 72,
          trend: 'stable',
          factors: ['Training programs', 'Mentorship'],
          impact: 'medium'
        },
        {
          category: 'Recognition',
          score: 91,
          trend: 'up',
          factors: ['Employee awards', 'Peer recognition'],
          impact: 'low'
        }
      ]

      setHealthScore(mockHealthScore)
      setEngagementInsights(mockEngagementInsights)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load workforce health data'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'text-green-600'
    if (score >= 75) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 90) return 'default'
    if (score >= 75) return 'secondary'
    return 'destructive'
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'down': return <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />
      default: return <Target className="h-4 w-4 text-gray-600" />
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

  if (!healthScore) return null

  const scoreData = [
    { name: 'Attendance', value: healthScore.attendanceScore, color: '#0088FE' },
    { name: 'Engagement', value: healthScore.engagementScore, color: '#00C49F' },
    { name: 'Productivity', value: healthScore.productivityScore, color: '#FFBB28' },
    { name: 'Wellness', value: healthScore.wellnessScore, color: '#FF8042' }
  ]

  return (
    <div className="space-y-6">
      {/* Overall Health Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            Workforce Health Score
          </CardTitle>
          <CardDescription>
            Comprehensive assessment of organizational health and employee wellbeing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="text-center">
              <div className={`text-4xl font-bold ${getScoreColor(healthScore.overallScore)}`}>
                {healthScore.overallScore}
              </div>
              <p className="text-sm text-muted-foreground">Overall Score</p>
            </div>
            <div className="flex-1 ml-8">
              <div className="grid grid-cols-2 gap-4">
                {scoreData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <span className="text-sm">{item.name}</span>
                    <Badge variant={getScoreBadgeVariant(item.value)}>
                      {item.value}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={healthScore.trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[70, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#8884d8" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Score Breakdown */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Health Score Breakdown</CardTitle>
            <CardDescription>Individual component scores</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={scoreData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {scoreData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Engagement Insights</CardTitle>
            <CardDescription>Key factors affecting employee engagement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {engagementInsights.map((insight, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{insight.category}</span>
                      {getTrendIcon(insight.trend)}
                      <Badge variant={insight.impact === 'high' ? 'destructive' : insight.impact === 'medium' ? 'default' : 'secondary'}>
                        {insight.impact} impact
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={insight.score} className="flex-1" />
                      <span className="text-sm font-medium">{insight.score}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {insight.factors.join(', ')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Factors and Recommendations */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Risk Factors
            </CardTitle>
            <CardDescription>Areas requiring immediate attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {healthScore.riskFactors.map((risk, index) => (
                <div key={index} className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{risk}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-500" />
              Recommendations
            </CardTitle>
            <CardDescription>Suggested actions to improve workforce health</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {healthScore.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <Target className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{recommendation}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default WorkforceHealthDashboard
