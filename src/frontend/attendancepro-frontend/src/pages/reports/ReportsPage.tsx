import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Badge } from '../../components/ui/badge'
import { toast } from 'sonner'
import { Download, FileText, Settings, Play, Pause, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import analyticsService from '../../services/analyticsService'

interface Report {
  id: string
  name: string
  type: string
  description: string
  status: 'completed' | 'running' | 'scheduled' | 'failed'
  createdAt: string
  lastRun?: string
  nextRun?: string
  format: 'pdf' | 'excel' | 'csv'
  size?: string
  downloadUrl?: string
}

interface ReportTemplate {
  id: string
  name: string
  description: string
  category: string
  fields: string[]
}

interface ScheduledReport {
  id: string
  reportId: string
  reportName: string
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly'
  nextRun: string
  recipients: string[]
  format: 'pdf' | 'excel' | 'csv'
  isActive: boolean
}

const ReportsPage: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([])
  const [templates, setTemplates] = useState<ReportTemplate[]>([])
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [reportName, setReportName] = useState('')
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'excel' | 'csv'>('pdf')
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({})
  const [customFields, setCustomFields] = useState<string[]>([])

  useEffect(() => {
    loadReportsData()
  }, [])

  const loadReportsData = async () => {
    try {
      setIsLoading(true)
      
      const [overview, departments] = await Promise.all([
        analyticsService.getOverview(),
        analyticsService.getDepartmentAnalytics()
      ])

      const generatedReports: Report[] = [
        {
          id: '1',
          name: 'Current Attendance Overview',
          type: 'attendance',
          description: `Attendance overview with ${overview.totalEmployees} employees`,
          status: 'completed',
          createdAt: new Date().toISOString(),
          lastRun: new Date().toISOString(),
          format: 'pdf',
          size: '1.2 MB',
          downloadUrl: '#'
        },
        {
          id: '2',
          name: 'Department Analytics Summary',
          type: 'analytics',
          description: `Analytics for ${departments.length} departments`,
          status: 'completed',
          createdAt: new Date().toISOString(),
          lastRun: new Date().toISOString(),
          format: 'excel',
          size: '2.1 MB',
          downloadUrl: '#'
        }
      ]

      const mockTemplates: ReportTemplate[] = [
        {
          id: 'attendance-summary',
          name: 'Attendance Summary',
          description: 'Basic attendance metrics and trends',
          category: 'Attendance',
          fields: ['employee_name', 'check_in_time', 'check_out_time', 'hours_worked', 'late_arrivals']
        },
        {
          id: 'productivity-analysis',
          name: 'Productivity Analysis',
          description: 'Employee and department productivity metrics',
          category: 'Analytics',
          fields: ['department', 'productivity_score', 'efficiency_rating', 'task_completion']
        },
        {
          id: 'leave-usage',
          name: 'Leave Usage Report',
          description: 'Leave balances and usage patterns',
          category: 'Leave Management',
          fields: ['employee_name', 'leave_type', 'days_taken', 'remaining_balance', 'approval_status']
        }
      ]

      const mockScheduledReports: ScheduledReport[] = [
        {
          id: '1',
          reportId: 'attendance-summary',
          reportName: 'Weekly Attendance Summary',
          frequency: 'weekly',
          nextRun: '2024-06-24T09:00:00Z',
          recipients: ['hr@company.com', 'manager@company.com'],
          format: 'pdf',
          isActive: true
        },
        {
          id: '2',
          reportId: 'productivity-analysis',
          reportName: 'Monthly Productivity Report',
          frequency: 'monthly',
          nextRun: '2024-07-01T08:00:00Z',
          recipients: ['ceo@company.com'],
          format: 'excel',
          isActive: true
        }
      ]

      setReports(generatedReports)
      setTemplates(mockTemplates)
      setScheduledReports(mockScheduledReports)
    } catch (error) {
      console.error('Error loading reports data:', error)
      toast.error('Failed to load reports data')
    } finally {
      setIsLoading(false)
    }
  }

  const generateReport = async () => {
    if (!selectedTemplate || !reportName) {
      toast.error('Please select a template and enter a report name')
      return
    }

    try {
      setIsLoading(true)
      


      const newReport: Report = {
        id: Date.now().toString(),
        name: reportName,
        type: templates.find(t => t.id === selectedTemplate)?.category.toLowerCase() || 'custom',
        description: `Generated report: ${reportName}`,
        status: 'running',
        createdAt: new Date().toISOString(),
        format: selectedFormat
      }

      setReports(prev => [newReport, ...prev])
      toast.success('Report generation started')
      
      setTimeout(() => {
        setReports(prev => prev.map(r => 
          r.id === newReport.id 
            ? { ...r, status: 'completed', size: '1.8 MB', downloadUrl: `/api/reports/${r.id}/download` }
            : r
        ))
        toast.success('Report generated successfully')
      }, 3000)

    } catch (error) {
      console.error('Error generating report:', error)
      toast.error('Failed to generate report')
    } finally {
      setIsLoading(false)
    }
  }

  const downloadReport = async (report: Report) => {
    try {
      if (report.downloadUrl && report.downloadUrl !== '#') {
        const link = document.createElement('a')
        link.href = report.downloadUrl
        link.download = `${report.name}.${report.format}`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        toast.success('Download started')
      } else {
        toast.error('Download URL not available')
      }
    } catch (error) {
      console.error('Error downloading report:', error)
      toast.error('Failed to download report')
    }
  }

  const deleteReport = async (reportId: string) => {
    try {
      setReports(prev => prev.filter(r => r.id !== reportId))
      toast.success('Report deleted successfully')
    } catch (error) {
      console.error('Error deleting report:', error)
      toast.error('Failed to delete report')
    }
  }

  const toggleScheduledReport = async (scheduleId: string) => {
    try {
      setScheduledReports(prev => prev.map(sr => 
        sr.id === scheduleId ? { ...sr, isActive: !sr.isActive } : sr
      ))
      toast.success('Schedule updated successfully')
    } catch (error) {
      console.error('Error updating schedule:', error)
      toast.error('Failed to update schedule')
    }
  }

  const getStatusColor = (status: Report['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'running': return 'bg-blue-100 text-blue-800'
      case 'scheduled': return 'bg-yellow-100 text-yellow-800'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600">Generate, schedule, and manage your reports</p>
        </div>
      </div>

      <Tabs defaultValue="generate" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="generate">Generate Report</TabsTrigger>
          <TabsTrigger value="history">Report History</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Generate New Report</CardTitle>
              <CardDescription>Create a custom report using our templates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="template">Report Template</Label>
                    <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a template" />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.map(template => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name} - {template.category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="reportName">Report Name</Label>
                    <Input
                      id="reportName"
                      value={reportName}
                      onChange={(e) => setReportName(e.target.value)}
                      placeholder="Enter report name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="format">Export Format</Label>
                    <Select value={selectedFormat} onValueChange={(value: 'pdf' | 'excel' | 'csv') => setSelectedFormat(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="excel">Excel</SelectItem>
                        <SelectItem value="csv">CSV</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Date Range</Label>
                    <div className="flex space-x-2">
                      <div className="w-full">
                        <Label htmlFor="fromDate" className="text-sm">From Date</Label>
                        <Input
                          id="fromDate"
                          type="date"
                          value={dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : ''}
                          onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value ? new Date(e.target.value) : undefined }))}
                          className="w-full"
                        />
                      </div>
                      <div className="w-full">
                        <Label htmlFor="toDate" className="text-sm">To Date</Label>
                        <Input
                          id="toDate"
                          type="date"
                          value={dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : ''}
                          onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value ? new Date(e.target.value) : undefined }))}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>

                  {selectedTemplate && (
                    <div>
                      <Label>Available Fields</Label>
                      <div className="mt-2 space-y-2">
                        {templates.find(t => t.id === selectedTemplate)?.fields.map(field => (
                          <div key={field} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={field}
                              checked={customFields.includes(field)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setCustomFields(prev => [...prev, field])
                                } else {
                                  setCustomFields(prev => prev.filter(f => f !== field))
                                }
                              }}
                              className="rounded border-gray-300"
                            />
                            <Label htmlFor={field} className="text-sm">
                              {field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <Button onClick={generateReport} disabled={isLoading} className="w-full">
                <FileText className="mr-2 h-4 w-4" />
                Generate Report
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Report History</CardTitle>
              <CardDescription>View and download your generated reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reports.map(report => (
                  <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-medium">{report.name}</h3>
                        <Badge className={getStatusColor(report.status)}>
                          {report.status}
                        </Badge>
                        <Badge variant="outline">{report.format.toUpperCase()}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span>Created: {format(new Date(report.createdAt), 'PPp')}</span>
                        {report.lastRun && <span>Last run: {format(new Date(report.lastRun), 'PPp')}</span>}
                        {report.size && <span>Size: {report.size}</span>}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {report.status === 'completed' && report.downloadUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadReport(report)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteReport(report.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Reports</CardTitle>
              <CardDescription>Manage your automated report schedules</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {scheduledReports.map(schedule => (
                  <div key={schedule.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-medium">{schedule.reportName}</h3>
                        <Badge variant="outline">{schedule.frequency}</Badge>
                        <Badge variant="outline">{schedule.format.toUpperCase()}</Badge>
                        <Badge className={schedule.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {schedule.isActive ? 'Active' : 'Paused'}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span>Next run: {format(new Date(schedule.nextRun), 'PPp')}</span>
                        <span>Recipients: {schedule.recipients.join(', ')}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleScheduledReport(schedule.id)}
                      >
                        {schedule.isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
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

export default ReportsPage
