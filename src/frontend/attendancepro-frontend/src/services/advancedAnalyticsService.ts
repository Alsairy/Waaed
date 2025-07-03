import axios, { AxiosResponse } from 'axios'

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api'

interface AnalyticsOverview {
  totalEmployees: number
  attendanceRate: number
  averageHoursWorked: number
  lateArrivals: number
  earlyDepartures: number
  totalWorkingDays: number
  presentDays: number
  absentDays: number
}

interface AttendanceTrend {
  date: string
  attendanceCount: number
  averageCheckInTime: number
  averageHoursWorked: number
}

interface ProductivityMetric {
  department: string
  averageHoursWorked: number
  attendanceRate: number
  punctualityScore: number
  overTimeHours: number
}

interface DepartmentAnalytics {
  department: string
  totalEmployees: number
  attendanceRecords: number
  averageHoursWorked: number
  leaveRequests: number
}

interface AttendancePrediction {
  date: string
  predictedAttendance: number
  confidenceLevel: number
}

interface AbsenteeismRisk {
  userId: string
  userName: string
  department: string
  riskScore: number
  riskLevel: string
  attendanceRate: number
  recentLateArrivals: number
  recentLeaveRequests: number
  recommendations: string[]
}

interface TurnoverRisk {
  userId: string
  userName: string
  department: string
  tenureMonths: number
  riskScore: number
  riskLevel: string
  attendanceVariability: number
  recentLeaveFrequency: number
  recentOvertimeHours: number
  recommendations: string[]
}

interface WorkforceCapacityForecast {
  tenantId: string
  forecastPeriod: number
  totalEmployees: number
  dailyForecasts: DailyCapacityForecast[]
  averageCapacityUtilization: number
  peakCapacityDate: string
  lowCapacityDate: string
}

interface DailyCapacityForecast {
  date: string
  totalEmployees: number
  predictedAttendance: number
  scheduledLeave: number
  availableCapacity: number
  capacityUtilization: number
  capacityStatus: string
}

interface AttendanceAnomaly {
  id: string
  userId: string
  userName: string
  date: string
  anomalyType: string
  severity: string
  description: string
  expectedValue: number
  actualValue: number
  confidence: number
}

interface LocationAnomaly {
  id: string
  userId: string
  userName: string
  date: string
  location: string
  anomalyType: string
  severity: string
  description: string
  confidence: number
}

interface TimeAnomaly {
  id: string
  userId: string
  userName: string
  date: string
  anomalyType: string
  severity: string
  description: string
  expectedTime: string
  actualTime: string
  confidence: number
}

interface WorkforceHealthScore {
  overallScore: number
  attendanceScore: number
  engagementScore: number
  productivityScore: number
  wellnessScore: number
  trends: HealthScoreTrend[]
  recommendations: string[]
}

interface HealthScoreTrend {
  date: string
  score: number
  category: string
}

interface EngagementInsight {
  category: string
  score: number
  trend: string
  insights: string[]
  recommendations: string[]
}

interface PerformanceCorrelation {
  factor1: string
  factor2: string
  correlationCoefficient: number
  significance: string
  insights: string[]
}

interface WorkLifeBalanceInsight {
  overallBalance: number
  overtimeFrequency: number
  leaveUtilization: number
  workloadDistribution: number
  stressIndicators: string[]
  recommendations: string[]
}

interface CustomReport {
  id: string
  tenantId: string
  userId: string
  name: string
  description: string
  reportType: string
  dataSources: string[]
  filters: Record<string, unknown>
  columns: ReportColumn[]
  grouping: Record<string, unknown>
  sorting: Record<string, unknown>
  formatting: Record<string, unknown>
  isPublic: boolean
  createdAt: string
  updatedAt: string
  data?: Record<string, unknown>[]
  executedAt?: string
  rowCount?: number
}

interface ReportColumn {
  name: string
  sourceField: string
  displayName: string
  dataType: string
  format?: string
  aggregation?: string
}

interface ReportTemplate {
  id: string
  name: string
  description: string
  category: string
  dataSources: string[]
  defaultFilters: Record<string, unknown>
  previewImageUrl: string
}

interface Dashboard {
  id: string
  tenantId: string
  userId: string
  name: string
  description: string
  layout: Record<string, unknown>
  widgets: Widget[]
  isPublic: boolean
  refreshInterval: number
  createdAt: string
  updatedAt: string
}

interface Widget {
  id: string
  type: string
  title: string
  configuration: Record<string, unknown>
  position: WidgetPosition
  size: WidgetSize
}

interface WidgetPosition {
  x: number
  y: number
}

interface WidgetSize {
  width: number
  height: number
}

interface ChartData {
  labels: string[]
  datasets: ChartDataset[]
  chartType: string
  options: Record<string, unknown>
}

interface ChartDataset {
  label: string
  data: number[]
  backgroundColor?: string[]
  borderColor?: string[]
  borderWidth?: number
}

interface ChartConfiguration {
  chartType: string
  dataSource: string
  filters: Record<string, unknown>
  groupBy: string[]
  aggregations: Record<string, string>
  timeRange: string
}

interface KPI {
  id: string
  name: string
  value: number
  target: number
  unit: string
  trend: string
  changePercentage: number
  status: string
  description: string
  category: string
}

interface KPITrend {
  date: string
  value: number
  target: number
}

interface CreateReportRequest {
  tenantId: string
  userId: string
  name: string
  description: string
  reportType: string
  dataSources: string[]
  filters: Record<string, unknown>
  columns: ReportColumn[]
  grouping: Record<string, unknown>
  sorting: Record<string, unknown>
  formatting: Record<string, unknown>
  isPublic: boolean
}

interface CreateDashboardRequest {
  tenantId: string
  userId: string
  name: string
  description: string
  layout: Record<string, unknown>
  widgets: Widget[]
  isPublic: boolean
  refreshInterval: number
}

class AdvancedAnalyticsService {
  private api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  constructor() {
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('accessToken')
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }
    )
  }

  async getAnalyticsOverview(tenantId: string, fromDate: string, toDate: string): Promise<AnalyticsOverview> {
    try {
      const response: AxiosResponse<AnalyticsOverview> = await this.api.get('/analytics/overview', {
        params: { tenantId, fromDate, toDate }
      })
      return response.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to fetch analytics overview')
    }
  }

  async getAttendanceTrends(tenantId: string, days: number = 30): Promise<AttendanceTrend[]> {
    try {
      const response: AxiosResponse<AttendanceTrend[]> = await this.api.get('/analytics/trends', {
        params: { tenantId, days }
      })
      return response.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to fetch attendance trends')
    }
  }

  async getProductivityMetrics(tenantId: string, fromDate: string, toDate: string): Promise<ProductivityMetric[]> {
    try {
      const response: AxiosResponse<ProductivityMetric[]> = await this.api.get('/analytics/productivity', {
        params: { tenantId, fromDate, toDate }
      })
      return response.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to fetch productivity metrics')
    }
  }

  async getDepartmentAnalytics(tenantId: string, fromDate: string, toDate: string): Promise<DepartmentAnalytics[]> {
    try {
      const response: AxiosResponse<DepartmentAnalytics[]> = await this.api.get('/analytics/departments', {
        params: { tenantId, fromDate, toDate }
      })
      return response.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to fetch department analytics')
    }
  }

  async predictAttendance(tenantId: string, futureDays: number = 7): Promise<AttendancePrediction[]> {
    try {
      const response: AxiosResponse<AttendancePrediction[]> = await this.api.get('/predictiveanalytics/attendance-prediction', {
        params: { tenantId, futureDays }
      })
      return response.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to predict attendance')
    }
  }

  async getAbsenteeismRisk(tenantId: string): Promise<AbsenteeismRisk[]> {
    try {
      const response: AxiosResponse<AbsenteeismRisk[]> = await this.api.get('/predictiveanalytics/absenteeism-risk', {
        params: { tenantId }
      })
      return response.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to fetch absenteeism risk')
    }
  }

  async getTurnoverRisk(tenantId: string): Promise<TurnoverRisk[]> {
    try {
      const response: AxiosResponse<TurnoverRisk[]> = await this.api.get('/predictiveanalytics/turnover-risk', {
        params: { tenantId }
      })
      return response.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to fetch turnover risk')
    }
  }

  async getCapacityForecast(tenantId: string, futureDays: number = 14): Promise<WorkforceCapacityForecast> {
    try {
      const response: AxiosResponse<WorkforceCapacityForecast> = await this.api.get('/predictiveanalytics/capacity-forecast', {
        params: { tenantId, futureDays }
      })
      return response.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to fetch capacity forecast')
    }
  }

  async getAttendanceAnomalies(tenantId: string, fromDate: string, toDate: string): Promise<AttendanceAnomaly[]> {
    try {
      const response: AxiosResponse<AttendanceAnomaly[]> = await this.api.get('/anomalydetection/attendance-anomalies', {
        params: { tenantId, fromDate, toDate }
      })
      return response.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to fetch attendance anomalies')
    }
  }

  async getLocationAnomalies(tenantId: string, fromDate: string, toDate: string): Promise<LocationAnomaly[]> {
    try {
      const response: AxiosResponse<LocationAnomaly[]> = await this.api.get('/anomalydetection/location-anomalies', {
        params: { tenantId, fromDate, toDate }
      })
      return response.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to fetch location anomalies')
    }
  }

  async getTimeAnomalies(tenantId: string, fromDate: string, toDate: string): Promise<TimeAnomaly[]> {
    try {
      const response: AxiosResponse<TimeAnomaly[]> = await this.api.get('/anomalydetection/time-anomalies', {
        params: { tenantId, fromDate, toDate }
      })
      return response.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to fetch time anomalies')
    }
  }

  async getWorkforceHealthScore(tenantId: string): Promise<WorkforceHealthScore> {
    try {
      const response: AxiosResponse<WorkforceHealthScore> = await this.api.get('/workforceinsights/health-score', {
        params: { tenantId }
      })
      return response.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to fetch workforce health score')
    }
  }

  async getEngagementInsights(tenantId: string): Promise<EngagementInsight[]> {
    try {
      const response: AxiosResponse<EngagementInsight[]> = await this.api.get('/workforceinsights/engagement-insights', {
        params: { tenantId }
      })
      return response.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to fetch engagement insights')
    }
  }

  async getPerformanceCorrelations(tenantId: string): Promise<PerformanceCorrelation[]> {
    try {
      const response: AxiosResponse<PerformanceCorrelation[]> = await this.api.get('/workforceinsights/performance-correlations', {
        params: { tenantId }
      })
      return response.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to fetch performance correlations')
    }
  }

  async getWorkLifeBalanceInsights(tenantId: string): Promise<WorkLifeBalanceInsight> {
    try {
      const response: AxiosResponse<WorkLifeBalanceInsight> = await this.api.get('/workforceinsights/work-life-balance', {
        params: { tenantId }
      })
      return response.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to fetch work-life balance insights')
    }
  }

  async createCustomReport(request: CreateReportRequest): Promise<CustomReport> {
    try {
      const response: AxiosResponse<CustomReport> = await this.api.post('/reportbuilder/reports', request)
      return response.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to create custom report')
    }
  }

  async getReportTemplates(tenantId: string): Promise<ReportTemplate[]> {
    try {
      const response: AxiosResponse<ReportTemplate[]> = await this.api.get('/reportbuilder/templates', {
        params: { tenantId }
      })
      return response.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to fetch report templates')
    }
  }

  async executeReport(reportId: string, parameters: Record<string, unknown> = {}): Promise<CustomReport> {
    try {
      const response: AxiosResponse<CustomReport> = await this.api.post(`/reportbuilder/reports/${reportId}/execute`, parameters)
      return response.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to execute report')
    }
  }

  async getUserReports(tenantId: string, userId: string): Promise<CustomReport[]> {
    try {
      const response: AxiosResponse<CustomReport[]> = await this.api.get('/reportbuilder/reports', {
        params: { tenantId, userId }
      })
      return response.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to fetch user reports')
    }
  }

  async createDashboard(request: CreateDashboardRequest): Promise<Dashboard> {
    try {
      const response: AxiosResponse<Dashboard> = await this.api.post('/dashboard/dashboards', request)
      return response.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to create dashboard')
    }
  }

  async getUserDashboards(tenantId: string, userId: string): Promise<Dashboard[]> {
    try {
      const response: AxiosResponse<Dashboard[]> = await this.api.get('/dashboard/dashboards', {
        params: { tenantId, userId }
      })
      return response.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to fetch user dashboards')
    }
  }

  async getDashboard(dashboardId: string): Promise<Dashboard> {
    try {
      const response: AxiosResponse<Dashboard> = await this.api.get(`/dashboard/dashboards/${dashboardId}`)
      return response.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to fetch dashboard')
    }
  }

  async generateChartData(config: ChartConfiguration): Promise<ChartData> {
    try {
      const response: AxiosResponse<ChartData> = await this.api.post('/datavisualization/chart-data', config)
      return response.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to generate chart data')
    }
  }

  async getKPIs(tenantId: string, fromDate: string, toDate: string): Promise<KPI[]> {
    try {
      const response: AxiosResponse<KPI[]> = await this.api.get('/kpi/kpis', {
        params: { tenantId, fromDate, toDate }
      })
      return response.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to fetch KPIs')
    }
  }

  async getKPITrends(tenantId: string, kpiType: string, days: number = 30): Promise<KPITrend[]> {
    try {
      const response: AxiosResponse<KPITrend[]> = await this.api.get('/kpi/trends', {
        params: { tenantId, kpiType, days }
      })
      return response.data
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to fetch KPI trends')
    }
  }
}

export const advancedAnalyticsService = new AdvancedAnalyticsService()
export type {
  AdvancedAnalyticsService,
  AnalyticsOverview,
  AttendanceTrend,
  ProductivityMetric,
  DepartmentAnalytics,
  AttendancePrediction,
  AbsenteeismRisk,
  TurnoverRisk,
  WorkforceCapacityForecast,
  AttendanceAnomaly,
  LocationAnomaly,
  TimeAnomaly,
  WorkforceHealthScore,
  EngagementInsight,
  PerformanceCorrelation,
  WorkLifeBalanceInsight,
  CustomReport,
  ReportTemplate,
  Dashboard,
  Widget,
  ChartData,
  ChartConfiguration,
  KPI,
  KPITrend,
  CreateReportRequest,
  CreateDashboardRequest
}
