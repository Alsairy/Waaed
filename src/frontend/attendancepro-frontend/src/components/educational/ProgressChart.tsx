import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { TrendingUp, TrendingDown, Target, Calendar, Award } from 'lucide-react'

interface ProgressDataPoint {
  date: string
  value: number
  label?: string
}

interface ProgressChartProps {
  title: string
  data: ProgressDataPoint[]
  type: 'line' | 'bar' | 'progress'
  target?: number
  currentValue?: number
  trend?: 'up' | 'down' | 'stable'
  period?: string
  unit?: string
  showTarget?: boolean
  className?: string
}

const ProgressChart: React.FC<ProgressChartProps> = ({
  title,
  data,
  type = 'line',
  target,
  currentValue,
  trend,
  period = 'This Month',
  unit = '%',
  showTarget = true,
  className = ''
}) => {
  const maxValue = Math.max(...data.map(d => d.value), target || 0)
  const minValue = Math.min(...data.map(d => d.value), 0)
  const range = maxValue - minValue || 1

  const getTrendColor = (trend?: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'down':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'stable':
        return 'text-gray-600 bg-gray-50 border-gray-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4" />
      case 'down':
        return <TrendingDown className="h-4 w-4" />
      default:
        return <Target className="h-4 w-4" />
    }
  }

  const renderLineChart = () => {
    const points = data.map((point, index) => {
      const x = (index / (data.length - 1)) * 100
      const y = 100 - ((point.value - minValue) / range) * 100
      return `${x},${y}`
    }).join(' ')

    return (
      <div className="relative h-32 w-full">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f3f4f6" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />
          
          {/* Target line */}
          {target && showTarget && (
            <line
              x1="0"
              y1={100 - ((target - minValue) / range) * 100}
              x2="100"
              y2={100 - ((target - minValue) / range) * 100}
              stroke="#ef4444"
              strokeWidth="1"
              strokeDasharray="2,2"
            />
          )}
          
          {/* Progress line */}
          <polyline
            fill="none"
            stroke="#005F96"
            strokeWidth="2"
            points={points}
          />
          
          {/* Data points */}
          {data.map((point, index) => {
            const x = (index / (data.length - 1)) * 100
            const y = 100 - ((point.value - minValue) / range) * 100
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="2"
                fill="#005F96"
                className="hover:r-3 transition-all duration-200"
              />
            )
          })}
        </svg>
        
        {/* Data labels */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500 mt-2">
          {data.map((point, index) => (
            <span key={index} className="text-center">
              {new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          ))}
        </div>
      </div>
    )
  }

  const renderBarChart = () => {
    return (
      <div className="space-y-2">
        {data.slice(-5).map((point, index) => {
          const percentage = ((point.value - minValue) / range) * 100
          return (
            <div key={index} className="flex items-center gap-3">
              <div className="w-16 text-xs text-gray-600 text-right">
                {point.label || new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
              <div className="flex-1 bg-gray-200 rounded-full h-4 relative">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-4 rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
                {target && showTarget && (
                  <div
                    className="absolute top-0 h-4 w-0.5 bg-red-500"
                    style={{ left: `${((target - minValue) / range) * 100}%` }}
                  />
                )}
              </div>
              <div className="w-12 text-xs text-gray-900 font-medium text-right">
                {point.value}{unit}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  const renderProgressRing = () => {
    const current = currentValue || data[data.length - 1]?.value || 0
    const percentage = target ? (current / target) * 100 : current
    const circumference = 2 * Math.PI * 45
    const strokeDasharray = circumference
    const strokeDashoffset = circumference - (percentage / 100) * circumference

    return (
      <div className="flex items-center justify-center">
        <div className="relative w-32 h-32">
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="#e5e7eb"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="#005F96"
              strokeWidth="8"
              fill="none"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {Math.round(percentage)}%
              </div>
              <div className="text-xs text-gray-600">
                {current}{unit}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card className={`hover:shadow-lg transition-shadow duration-200 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
              {title}
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>{period}</span>
            </div>
          </div>
          {trend && (
            <Badge className={getTrendColor(trend)}>
              {getTrendIcon(trend)}
              <span className="ml-1 capitalize">{trend}</span>
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Current Value Display */}
          {currentValue !== undefined && (
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center text-blue-700">
                <Award className="h-5 w-5 mr-2" />
                <span className="font-medium">Current</span>
              </div>
              <span className="text-xl font-bold text-blue-900">
                {currentValue}{unit}
              </span>
            </div>
          )}

          {/* Target Display */}
          {target && showTarget && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center text-gray-600">
                <Target className="h-4 w-4 mr-2" />
                <span>Target</span>
              </div>
              <span className="font-medium text-gray-900">
                {target}{unit}
              </span>
            </div>
          )}

          {/* Chart Rendering */}
          <div className="mt-4">
            {type === 'line' && renderLineChart()}
            {type === 'bar' && renderBarChart()}
            {type === 'progress' && renderProgressRing()}
          </div>

          {/* Summary Stats */}
          {data.length > 0 && (
            <div className="grid grid-cols-3 gap-4 pt-3 border-t border-gray-100">
              <div className="text-center">
                <div className="text-sm font-medium text-gray-900">
                  {Math.max(...data.map(d => d.value))}{unit}
                </div>
                <div className="text-xs text-gray-600">Highest</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-gray-900">
                  {(data.reduce((sum, d) => sum + d.value, 0) / data.length).toFixed(1)}{unit}
                </div>
                <div className="text-xs text-gray-600">Average</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-gray-900">
                  {Math.min(...data.map(d => d.value))}{unit}
                </div>
                <div className="text-xs text-gray-600">Lowest</div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default ProgressChart
