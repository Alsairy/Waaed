import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { LoadingState } from '../ui/error-display'
import { advancedAnalyticsService, ChartData, ChartConfiguration } from '../../services/advancedAnalyticsService'
import { handleApiError } from '../../utils/error-handler'
import { 
  BarChart3, 
  PieChart, 
  LineChart, 
  TrendingUp, 
  Download, 
  Settings,
  RefreshCw,
  Filter
} from 'lucide-react'

interface DataVisualizationProps {
  tenantId: string
  dateRange: {
    fromDate: string
    toDate: string
  }
}

const DataVisualization: React.FC<DataVisualizationProps> = ({ tenantId, dateRange }) => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedChart, setSelectedChart] = useState<string>('attendance-trends')
  const [chartData, setChartData] = useState<ChartData | null>(null)
  const [chartConfigs] = useState<Record<string, ChartConfiguration>>({
    'attendance-trends': {
      chartType: 'line',
      dataSource: 'AttendanceRecords',
      filters: { dateRange: 'last30days' },
      groupBy: ['date'],
      aggregations: { count: 'attendance' },
      timeRange: 'daily'
    },
    'department-performance': {
      chartType: 'bar',
      dataSource: 'AttendanceRecords',
      filters: { includeInactive: false },
      groupBy: ['department'],
      aggregations: { avg: 'hoursWorked', count: 'attendance' },
      timeRange: 'monthly'
    },
    'productivity-metrics': {
      chartType: 'pie',
      dataSource: 'AttendanceRecords',
      filters: { dateRange: 'lastQuarter' },
      groupBy: ['status'],
      aggregations: { count: 'records' },
      timeRange: 'quarterly'
    },
    'leave-analysis': {
      chartType: 'bar',
      dataSource: 'LeaveManagement',
      filters: { approved: true },
      groupBy: ['leaveType', 'month'],
      aggregations: { count: 'requests', sum: 'days' },
      timeRange: 'monthly'
    }
  })

  useEffect(() => {
    loadChartData()
  }, [selectedChart, tenantId, dateRange])

  const loadChartData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const config = chartConfigs[selectedChart]
      if (!config) return

      const updatedConfig = {
        ...config,
        filters: {
          ...config.filters,
          fromDate: dateRange.fromDate,
          toDate: dateRange.toDate,
          tenantId
        }
      }

      const data = await advancedAnalyticsService.generateChartData(updatedConfig)
      setChartData(data)
    } catch (err) {
      const errorMessage = handleApiError(err)
      setError(typeof errorMessage === 'string' ? errorMessage : errorMessage.message)
    } finally {
      setLoading(false)
    }
  }

  const getChartIcon = (chartType: string) => {
    switch (chartType) {
      case 'bar': return <BarChart3 className="h-4 w-4" />
      case 'pie': return <PieChart className="h-4 w-4" />
      case 'line': return <LineChart className="h-4 w-4" />
      default: return <TrendingUp className="h-4 w-4" />
    }
  }

  const getChartTitle = (chartKey: string) => {
    switch (chartKey) {
      case 'attendance-trends': return 'Attendance Trends'
      case 'department-performance': return 'Department Performance'
      case 'productivity-metrics': return 'Productivity Metrics'
      case 'leave-analysis': return 'Leave Analysis'
      default: return 'Chart'
    }
  }

  const renderChart = () => {
    if (!chartData) return null

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-900">{chartData.chartType.toUpperCase()} Chart</h4>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              {chartData.datasets.length} dataset{chartData.datasets.length !== 1 ? 's' : ''}
            </Badge>
            <Button size="sm" variant="ghost">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Chart Labels */}
        <div className="flex flex-wrap gap-2 mb-4">
          {chartData.labels.map((label, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {label}
            </Badge>
          ))}
        </div>

        {/* Chart Data Visualization */}
        <div className="space-y-3">
          {chartData.datasets.map((dataset, datasetIndex) => (
            <div key={datasetIndex} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{dataset.label}</span>
                <span className="text-xs text-gray-500">
                  Total: {dataset.data.reduce((sum, val) => sum + val, 0)}
                </span>
              </div>
              
              {/* Simple bar representation */}
              <div className="space-y-1">
                {dataset.data.map((value, index) => {
                  const maxValue = Math.max(...dataset.data)
                  const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0
                  
                  return (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="text-xs text-gray-600 w-20 truncate">
                        {chartData.labels[index]}
                      </span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-900 w-12 text-right">
                        {value}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Chart Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
          {chartData.datasets.map((dataset, index) => {
            const total = dataset.data.reduce((sum, val) => sum + val, 0)
            const average = dataset.data.length > 0 ? total / dataset.data.length : 0
            const max = Math.max(...dataset.data)

            return (
              <div key={index} className="text-center">
                <p className="text-xs text-gray-600">Dataset {index + 1}</p>
                <div className="space-y-1 mt-1">
                  <div className="text-xs">
                    <span className="text-gray-500">Avg:</span>
                    <span className="font-medium ml-1">{average.toFixed(1)}</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-gray-500">Max:</span>
                    <span className="font-medium ml-1">{max}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
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
      <LoadingState isLoading={false} error={error} onRetry={loadChartData}>
        <div />
      </LoadingState>
    )
  }

  return (
    <div className="space-y-6">
      {/* Chart Selection */}
      <div className="flex flex-wrap gap-2">
        {Object.keys(chartConfigs).map((chartKey) => (
          <Button
            key={chartKey}
            variant={selectedChart === chartKey ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedChart(chartKey)}
            className="flex items-center space-x-2"
          >
            {getChartIcon(chartConfigs[chartKey].chartType)}
            <span>{getChartTitle(chartKey)}</span>
          </Button>
        ))}
      </div>

      {/* Chart Display */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              {getChartIcon(chartConfigs[selectedChart]?.chartType || 'bar')}
              <span className="ml-2">{getChartTitle(selectedChart)}</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button size="sm" variant="ghost" onClick={loadChartData}>
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {chartData ? renderChart() : (
            <div className="text-center py-8">
              <BarChart3 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-4">No chart data available</p>
              <Button onClick={loadChartData} variant="outline">
                Load Chart Data
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Chart Configuration */}
      {selectedChart && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-4 w-4 mr-2" />
              Chart Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Chart Type</label>
                <p className="text-sm text-gray-600 capitalize">
                  {chartConfigs[selectedChart]?.chartType}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Data Source</label>
                <p className="text-sm text-gray-600">
                  {chartConfigs[selectedChart]?.dataSource}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Time Range</label>
                <p className="text-sm text-gray-600 capitalize">
                  {chartConfigs[selectedChart]?.timeRange}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Group By</label>
                <p className="text-sm text-gray-600">
                  {chartConfigs[selectedChart]?.groupBy.join(', ')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default DataVisualization
export { DataVisualization }
