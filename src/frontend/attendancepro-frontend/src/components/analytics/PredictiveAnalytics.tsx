import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { LoadingState } from '../ui/error-display'
import { advancedAnalyticsService, AttendancePrediction, AbsenteeismRisk, TurnoverRisk, WorkforceCapacityForecast, AttendanceAnomaly } from '../../services/advancedAnalyticsService'
import { handleApiError } from '../../utils/error-handler'
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Users, 
  Calendar, 
  Target,
  Eye,
  RefreshCw,
  Download
} from 'lucide-react'

interface PredictiveAnalyticsProps {
  tenantId: string
}

const PredictiveAnalytics: React.FC<PredictiveAnalyticsProps> = ({ tenantId }) => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'predictions' | 'risks' | 'anomalies' | 'capacity'>('predictions')
  
  const [attendancePredictions, setAttendancePredictions] = useState<AttendancePrediction[]>([])
  const [absenteeismRisks, setAbsenteeismRisks] = useState<AbsenteeismRisk[]>([])
  const [turnoverRisks, setTurnoverRisks] = useState<TurnoverRisk[]>([])
  const [capacityForecast, setCapacityForecast] = useState<WorkforceCapacityForecast | null>(null)
  const [attendanceAnomalies, setAttendanceAnomalies] = useState<AttendanceAnomaly[]>([])

  useEffect(() => {
    loadPredictiveData()
  }, [tenantId])

  const loadPredictiveData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [predictions, absenteeism, turnover, capacity, anomalies] = await Promise.all([
        advancedAnalyticsService.predictAttendance(tenantId, 14),
        advancedAnalyticsService.getAbsenteeismRisk(tenantId),
        advancedAnalyticsService.getTurnoverRisk(tenantId),
        advancedAnalyticsService.getCapacityForecast(tenantId, 14),
        advancedAnalyticsService.getAttendanceAnomalies(
          tenantId, 
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          new Date().toISOString().split('T')[0]
        )
      ])

      setAttendancePredictions(predictions)
      setAbsenteeismRisks(absenteeism)
      setTurnoverRisks(turnover)
      setCapacityForecast(capacity)
      setAttendanceAnomalies(anomalies)
    } catch (err) {
      const errorMessage = handleApiError(err)
      setError(typeof errorMessage === 'string' ? errorMessage : errorMessage.message)
    } finally {
      setLoading(false)
    }
  }

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
      case 'high':
      case 'critical':
        return 'bg-red-50 text-red-800 border-red-200'
      case 'medium':
      case 'moderate':
        return 'bg-yellow-50 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-green-50 text-green-800 border-green-200'
      default:
        return 'bg-gray-50 text-gray-800 border-gray-200'
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600'
    if (confidence >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const renderAttendancePredictions = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {attendancePredictions.slice(0, 6).map((prediction, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">
                  {new Date(prediction.date).toLocaleDateString()}
                </span>
                <Badge className={`text-xs ${getConfidenceColor(prediction.confidenceLevel)}`}>
                  {prediction.confidenceLevel.toFixed(0)}% confidence
                </Badge>
              </div>
              
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-600" />
                <span className="text-lg font-bold text-gray-900">
                  {prediction.predictedAttendance}
                </span>
                <span className="text-sm text-gray-600">predicted</span>
              </div>
              
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${prediction.confidenceLevel}%` }}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {attendancePredictions.length > 6 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Extended Forecast</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {attendancePredictions.slice(6).map((prediction, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <span className="text-sm text-gray-600">
                    {new Date(prediction.date).toLocaleDateString()}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{prediction.predictedAttendance}</span>
                    <Badge variant="outline" className="text-xs">
                      {prediction.confidenceLevel.toFixed(0)}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )

  const renderRiskAnalysis = () => (
    <div className="space-y-6">
      {/* Absenteeism Risk */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-orange-600" />
            Absenteeism Risk Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {absenteeismRisks.slice(0, 5).map((risk, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{risk.userName}</h4>
                  <p className="text-sm text-gray-600">{risk.department}</p>
                  <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                    <span>{risk.attendanceRate}% attendance</span>
                    <span>{risk.recentLateArrivals} late arrivals</span>
                    <span>{risk.recentLeaveRequests} leave requests</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getRiskColor(risk.riskLevel)}>
                    {risk.riskLevel}
                  </Badge>
                  <span className="text-sm font-medium">
                    {(risk.riskScore * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Turnover Risk */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingDown className="h-5 w-5 mr-2 text-red-600" />
            Turnover Risk Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {turnoverRisks.slice(0, 5).map((risk, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{risk.userName}</h4>
                  <p className="text-sm text-gray-600">{risk.department}</p>
                  <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                    <span>{risk.tenureMonths} months tenure</span>
                    <span>{risk.recentOvertimeHours}h overtime</span>
                    <span>{risk.recentLeaveFrequency} leave frequency</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getRiskColor(risk.riskLevel)}>
                    {risk.riskLevel}
                  </Badge>
                  <span className="text-sm font-medium">
                    {(risk.riskScore * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderAnomalyDetection = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Eye className="h-5 w-5 mr-2 text-purple-600" />
          Attendance Anomalies
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {attendanceAnomalies.slice(0, 10).map((anomaly, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{anomaly.userName}</h4>
                <p className="text-sm text-gray-600">{anomaly.description}</p>
                <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                  <span>{new Date(anomaly.date).toLocaleDateString()}</span>
                  <span>Expected: {anomaly.expectedValue}</span>
                  <span>Actual: {anomaly.actualValue}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className={getRiskColor(anomaly.severity)}>
                  {anomaly.severity}
                </Badge>
                <span className={`text-sm font-medium ${getConfidenceColor(anomaly.confidence)}`}>
                  {anomaly.confidence.toFixed(0)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )

  const renderCapacityForecast = () => {
    if (!capacityForecast) return null

    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Employees</p>
                  <p className="text-2xl font-bold text-gray-900">{capacityForecast.totalEmployees}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Capacity</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {capacityForecast.averageCapacityUtilization.toFixed(1)}%
                  </p>
                </div>
                <Target className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Forecast Period</p>
                  <p className="text-2xl font-bold text-gray-900">{capacityForecast.forecastPeriod} days</p>
                </div>
                <Calendar className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Daily Forecasts */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Capacity Forecast</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {capacityForecast.dailyForecasts.map((forecast, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <span className="font-medium text-gray-900">
                        {new Date(forecast.date).toLocaleDateString()}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {forecast.capacityStatus}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                      <span>Predicted: {forecast.predictedAttendance}</span>
                      <span>Leave: {forecast.scheduledLeave}</span>
                      <span>Available: {forecast.availableCapacity}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-gray-900">
                      {forecast.capacityUtilization.toFixed(1)}%
                    </span>
                    <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className={`h-2 rounded-full ${
                          forecast.capacityUtilization >= 90 ? 'bg-red-500' :
                          forecast.capacityUtilization >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(forecast.capacityUtilization, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
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
      <LoadingState isLoading={false} error={error} onRetry={loadPredictiveData}>
        <div />
      </LoadingState>
    )
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={activeTab === 'predictions' ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTab('predictions')}
          className="flex items-center space-x-2"
        >
          <TrendingUp className="h-4 w-4" />
          <span>Predictions</span>
        </Button>
        <Button
          variant={activeTab === 'risks' ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTab('risks')}
          className="flex items-center space-x-2"
        >
          <AlertTriangle className="h-4 w-4" />
          <span>Risk Analysis</span>
        </Button>
        <Button
          variant={activeTab === 'anomalies' ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTab('anomalies')}
          className="flex items-center space-x-2"
        >
          <Eye className="h-4 w-4" />
          <span>Anomalies</span>
        </Button>
        <Button
          variant={activeTab === 'capacity' ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTab('capacity')}
          className="flex items-center space-x-2"
        >
          <Users className="h-4 w-4" />
          <span>Capacity</span>
        </Button>
      </div>

      {/* Tab Content */}
      <div className="min-h-96">
        {activeTab === 'predictions' && renderAttendancePredictions()}
        {activeTab === 'risks' && renderRiskAnalysis()}
        {activeTab === 'anomalies' && renderAnomalyDetection()}
        {activeTab === 'capacity' && renderCapacityForecast()}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t">
        <div className="flex items-center space-x-2">
          <Button size="sm" variant="ghost" onClick={loadPredictiveData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
          <Button size="sm" variant="ghost">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
        <Badge variant="outline" className="text-xs">
          Last updated: {new Date().toLocaleTimeString()}
        </Badge>
      </div>
    </div>
  )
}

export default PredictiveAnalytics
export { PredictiveAnalytics }
