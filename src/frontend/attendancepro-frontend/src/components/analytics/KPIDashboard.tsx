import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { LoadingState } from '../ui/error-display'
import { advancedAnalyticsService, KPI, KPITrend } from '../../services/advancedAnalyticsService'
import { handleApiError } from '../../utils/error-handler'
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Activity, 
  Users, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Minus
} from 'lucide-react'

interface KPIDashboardProps {
  tenantId: string
  dateRange: {
    fromDate: string
    toDate: string
  }
}

const KPIDashboard: React.FC<KPIDashboardProps> = ({ tenantId, dateRange }) => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [kpis, setKpis] = useState<KPI[]>([])
  const [selectedKPI, setSelectedKPI] = useState<string | null>(null)
  const [kpiTrends, setKpiTrends] = useState<KPITrend[]>([])

  useEffect(() => {
    loadKPIs()
  }, [tenantId, dateRange])

  useEffect(() => {
    if (selectedKPI) {
      loadKPITrends(selectedKPI)
    }
  }, [selectedKPI])

  const loadKPIs = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await advancedAnalyticsService.getKPIs(tenantId, dateRange.fromDate, dateRange.toDate)
      setKpis(data)
    } catch (err) {
      const errorMessage = handleApiError(err)
      setError(typeof errorMessage === 'string' ? errorMessage : errorMessage.message)
    } finally {
      setLoading(false)
    }
  }

  const loadKPITrends = async (kpiType: string) => {
    try {
      const trends = await advancedAnalyticsService.getKPITrends(tenantId, kpiType, 30)
      setKpiTrends(trends)
    } catch (err) {
      console.error('Failed to load KPI trends:', err)
    }
  }

  const getKPIIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'attendance': return <Users className="h-5 w-5" />
      case 'productivity': return <TrendingUp className="h-5 w-5" />
      case 'performance': return <Target className="h-5 w-5" />
      case 'engagement': return <Activity className="h-5 w-5" />
      case 'time': return <Clock className="h-5 w-5" />
      default: return <Target className="h-5 w-5" />
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'good':
      case 'excellent':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'warning':
      case 'needs attention':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'critical':
      case 'poor':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Minus className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'good':
      case 'excellent':
        return 'bg-green-50 text-green-800 border-green-200'
      case 'warning':
      case 'needs attention':
        return 'bg-yellow-50 text-yellow-800 border-yellow-200'
      case 'critical':
      case 'poor':
        return 'bg-red-50 text-red-800 border-red-200'
      default:
        return 'bg-gray-50 text-gray-800 border-gray-200'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend.toLowerCase()) {
      case 'up':
      case 'increasing':
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'down':
      case 'decreasing':
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <Minus className="h-4 w-4 text-gray-600" />
    }
  }

  const formatValue = (value: number, unit: string) => {
    if (unit === '%') {
      return `${value.toFixed(1)}%`
    }
    if (unit === 'hours' || unit === 'h') {
      return `${value.toFixed(1)}h`
    }
    if (unit === 'days' || unit === 'd') {
      return `${value.toFixed(0)}d`
    }
    return `${value.toFixed(0)}${unit ? ` ${unit}` : ''}`
  }

  const groupKPIsByCategory = () => {
    const grouped = kpis.reduce((acc, kpi) => {
      if (!acc[kpi.category]) {
        acc[kpi.category] = []
      }
      acc[kpi.category].push(kpi)
      return acc
    }, {} as Record<string, KPI[]>)
    return grouped
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
      <LoadingState isLoading={false} error={error} onRetry={loadKPIs}>
        <div />
      </LoadingState>
    )
  }

  const groupedKPIs = groupKPIsByCategory()

  return (
    <div className="space-y-6">
      {/* KPI Categories */}
      {Object.entries(groupedKPIs).map(([category, categoryKPIs]) => (
        <div key={category} className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            {getKPIIcon(category)}
            <span className="ml-2 capitalize">{category} KPIs</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryKPIs.map((kpi) => (
              <Card 
                key={kpi.id} 
                className={`hover:shadow-lg transition-shadow cursor-pointer ${
                  selectedKPI === kpi.name ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setSelectedKPI(selectedKPI === kpi.name ? null : kpi.name)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      {kpi.name}
                    </CardTitle>
                    {getStatusIcon(kpi.status)}
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {/* Value and Target */}
                    <div className="flex items-baseline justify-between">
                      <span className="text-2xl font-bold text-gray-900">
                        {formatValue(kpi.value, kpi.unit)}
                      </span>
                      <span className="text-sm text-gray-500">
                        Target: {formatValue(kpi.target, kpi.unit)}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          kpi.value >= kpi.target ? 'bg-green-500' : 
                          kpi.value >= kpi.target * 0.8 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min((kpi.value / kpi.target) * 100, 100)}%` }}
                      />
                    </div>

                    {/* Status and Trend */}
                    <div className="flex items-center justify-between">
                      <Badge className={`text-xs ${getStatusColor(kpi.status)}`}>
                        {kpi.status}
                      </Badge>
                      <div className="flex items-center space-x-1">
                        {getTrendIcon(kpi.trend)}
                        <span className={`text-xs font-medium ${
                          kpi.changePercentage > 0 ? 'text-green-600' : 
                          kpi.changePercentage < 0 ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {kpi.changePercentage > 0 ? '+' : ''}{kpi.changePercentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    {kpi.description && (
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {kpi.description}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {/* KPI Trends */}
      {selectedKPI && kpiTrends.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{selectedKPI} - 30 Day Trend</span>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setSelectedKPI(null)}
              >
                Close
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {kpiTrends.slice(-10).map((trend, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="text-sm text-gray-600">
                    {new Date(trend.date).toLocaleDateString()}
                  </span>
                  <div className="flex items-center space-x-4">
                    <span className="font-medium">
                      {formatValue(trend.value, kpis.find(k => k.name === selectedKPI)?.unit || '')}
                    </span>
                    <span className="text-sm text-gray-500">
                      Target: {formatValue(trend.target, kpis.find(k => k.name === selectedKPI)?.unit || '')}
                    </span>
                    <div className={`w-3 h-3 rounded-full ${
                      trend.value >= trend.target ? 'bg-green-500' : 
                      trend.value >= trend.target * 0.8 ? 'bg-yellow-500' : 'bg-red-500'
                    }`} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {kpis.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Target className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4">No KPIs available for the selected period</p>
            <Button onClick={loadKPIs} variant="outline">
              Refresh KPIs
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default KPIDashboard
export { KPIDashboard }
