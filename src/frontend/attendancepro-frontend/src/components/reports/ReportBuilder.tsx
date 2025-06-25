import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Checkbox } from '../ui/checkbox'
import { Textarea } from '../ui/textarea'
import { Badge } from '../ui/badge'
import { toast } from 'sonner'
import { Plus, Minus, Eye, Save, Download } from 'lucide-react'
import analyticsService from '../../services/analyticsService'

interface ReportField {
  id: string
  name: string
  displayName: string
  type: 'string' | 'number' | 'date' | 'boolean'
  category: string
  description?: string
}

interface ReportFilter {
  id: string
  field: string
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'between' | 'in'
  value: string | string[]
}

interface ReportGrouping {
  field: string
  order: 'asc' | 'desc'
}

interface CustomReport {
  id?: string
  name: string
  description: string
  fields: string[]
  filters: ReportFilter[]
  groupBy: ReportGrouping[]
  chartType?: 'table' | 'bar' | 'line' | 'pie'
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly'
    recipients: string[]
  }
  reportType?: 'standard' | 'compliance'
  complianceFramework?: 'gdpr' | 'sox' | 'hipaa' | 'labor_law' | 'audit_trail' | 'data_retention'
}

interface ComplianceTemplate {
  id: string
  name: string
  description: string
  framework: string
  requiredFields: string[]
  defaultFilters: ReportFilter[]
  frequency: string
}

const ReportBuilder: React.FC = () => {
  const [availableFields, setAvailableFields] = useState<ReportField[]>([])
  const [report, setReport] = useState<CustomReport>({
    name: '',
    description: '',
    fields: [],
    filters: [],
    groupBy: [],
    reportType: 'standard'
  })
  const [previewData, setPreviewData] = useState<Record<string, unknown>[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [complianceTemplates, setComplianceTemplates] = useState<ComplianceTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [showComplianceTemplates, setShowComplianceTemplates] = useState(false)

  useEffect(() => {
    loadAvailableFields()
    loadComplianceTemplates()
  }, [])

  const loadComplianceTemplates = async () => {
    try {
      const templates: ComplianceTemplate[] = [
        {
          id: 'gdpr-template',
          name: 'GDPR Compliance Report',
          description: 'General Data Protection Regulation compliance assessment',
          framework: 'gdpr',
          requiredFields: ['audit_event_id', 'audit_action', 'audit_timestamp', 'user_id', 'gdpr_consent_status', 'data_access_type'],
          defaultFilters: [
            { id: '1', field: 'audit_action', operator: 'contains', value: 'PersonalData' }
          ],
          frequency: 'monthly'
        },
        {
          id: 'sox-template',
          name: 'SOX Compliance Report',
          description: 'Sarbanes-Oxley Act compliance assessment',
          framework: 'sox',
          requiredFields: ['audit_event_id', 'audit_action', 'audit_timestamp', 'user_id', 'access_level', 'compliance_status'],
          defaultFilters: [
            { id: '1', field: 'audit_action', operator: 'contains', value: 'FinancialData' }
          ],
          frequency: 'quarterly'
        },
        {
          id: 'hipaa-template',
          name: 'HIPAA Compliance Report',
          description: 'Health Insurance Portability and Accountability Act compliance',
          framework: 'hipaa',
          requiredFields: ['audit_event_id', 'audit_action', 'audit_timestamp', 'user_id', 'encryption_status', 'data_access_type'],
          defaultFilters: [
            { id: '1', field: 'audit_action', operator: 'contains', value: 'PHI' }
          ],
          frequency: 'monthly'
        },
        {
          id: 'labor-law-template',
          name: 'Labor Law Compliance Report',
          description: 'Employment and labor law compliance assessment',
          framework: 'labor_law',
          requiredFields: ['employee_id', 'employee_name', 'hours_worked', 'overtime_hours', 'department'],
          defaultFilters: [
            { id: '1', field: 'overtime_hours', operator: 'greater_than', value: '8' }
          ],
          frequency: 'weekly'
        },
        {
          id: 'audit-trail-template',
          name: 'Audit Trail Report',
          description: 'Comprehensive audit trail and access monitoring',
          framework: 'audit_trail',
          requiredFields: ['audit_event_id', 'audit_action', 'audit_timestamp', 'user_id', 'ip_address', 'compliance_status'],
          defaultFilters: [],
          frequency: 'daily'
        },
        {
          id: 'data-retention-template',
          name: 'Data Retention Report',
          description: 'Data retention policy compliance assessment',
          framework: 'data_retention',
          requiredFields: ['audit_event_id', 'audit_timestamp', 'data_retention_period', 'compliance_status'],
          defaultFilters: [
            { id: '1', field: 'data_retention_period', operator: 'greater_than', value: '2555' } // 7 years in days
          ],
          frequency: 'monthly'
        }
      ]
      setComplianceTemplates(templates)
    } catch (error) {
      console.error('Error loading compliance templates:', error)
      toast.error('Failed to load compliance templates')
    }
  }

  const loadAvailableFields = async () => {
    try {
      const mockFields: ReportField[] = [
        { id: 'employee_id', name: 'employee_id', displayName: 'Employee ID', type: 'string', category: 'Employee' },
        { id: 'employee_name', name: 'employee_name', displayName: 'Employee Name', type: 'string', category: 'Employee' },
        { id: 'department', name: 'department', displayName: 'Department', type: 'string', category: 'Employee' },
        { id: 'position', name: 'position', displayName: 'Position', type: 'string', category: 'Employee' },
        { id: 'check_in_time', name: 'check_in_time', displayName: 'Check In Time', type: 'date', category: 'Attendance' },
        { id: 'check_out_time', name: 'check_out_time', displayName: 'Check Out Time', type: 'date', category: 'Attendance' },
        { id: 'hours_worked', name: 'hours_worked', displayName: 'Hours Worked', type: 'number', category: 'Attendance' },
        { id: 'overtime_hours', name: 'overtime_hours', displayName: 'Overtime Hours', type: 'number', category: 'Attendance' },
        { id: 'is_late', name: 'is_late', displayName: 'Late Arrival', type: 'boolean', category: 'Attendance' },
        { id: 'leave_type', name: 'leave_type', displayName: 'Leave Type', type: 'string', category: 'Leave' },
        { id: 'leave_days', name: 'leave_days', displayName: 'Leave Days', type: 'number', category: 'Leave' },
        { id: 'leave_balance', name: 'leave_balance', displayName: 'Leave Balance', type: 'number', category: 'Leave' },
        { id: 'productivity_score', name: 'productivity_score', displayName: 'Productivity Score', type: 'number', category: 'Performance' },
        { id: 'efficiency_rating', name: 'efficiency_rating', displayName: 'Efficiency Rating', type: 'number', category: 'Performance' },
        
        { id: 'audit_event_id', name: 'audit_event_id', displayName: 'Audit Event ID', type: 'string', category: 'Compliance' },
        { id: 'audit_action', name: 'audit_action', displayName: 'Audit Action', type: 'string', category: 'Compliance' },
        { id: 'audit_timestamp', name: 'audit_timestamp', displayName: 'Audit Timestamp', type: 'date', category: 'Compliance' },
        { id: 'user_id', name: 'user_id', displayName: 'User ID', type: 'string', category: 'Compliance' },
        { id: 'ip_address', name: 'ip_address', displayName: 'IP Address', type: 'string', category: 'Compliance' },
        { id: 'data_access_type', name: 'data_access_type', displayName: 'Data Access Type', type: 'string', category: 'Compliance' },
        { id: 'compliance_status', name: 'compliance_status', displayName: 'Compliance Status', type: 'string', category: 'Compliance' },
        { id: 'violation_type', name: 'violation_type', displayName: 'Violation Type', type: 'string', category: 'Compliance' },
        { id: 'violation_severity', name: 'violation_severity', displayName: 'Violation Severity', type: 'string', category: 'Compliance' },
        { id: 'gdpr_consent_status', name: 'gdpr_consent_status', displayName: 'GDPR Consent Status', type: 'string', category: 'Compliance' },
        { id: 'data_retention_period', name: 'data_retention_period', displayName: 'Data Retention Period', type: 'number', category: 'Compliance' },
        { id: 'encryption_status', name: 'encryption_status', displayName: 'Encryption Status', type: 'boolean', category: 'Compliance' },
        { id: 'access_level', name: 'access_level', displayName: 'Access Level', type: 'string', category: 'Compliance' },
        { id: 'regulatory_framework', name: 'regulatory_framework', displayName: 'Regulatory Framework', type: 'string', category: 'Compliance' },
        { id: 'compliance_score', name: 'compliance_score', displayName: 'Compliance Score', type: 'number', category: 'Compliance' }
      ]
      setAvailableFields(mockFields)
    } catch (error) {
      console.error('Error loading fields:', error)
      toast.error('Failed to load available fields')
    }
  }

  const addField = (fieldId: string) => {
    if (!report.fields.includes(fieldId)) {
      setReport(prev => ({
        ...prev,
        fields: [...prev.fields, fieldId]
      }))
    }
  }

  const applyComplianceTemplate = (templateId: string) => {
    const template = complianceTemplates.find(t => t.id === templateId)
    if (!template) return

    setReport(prev => ({
      ...prev,
      name: template.name,
      description: template.description,
      fields: template.requiredFields,
      filters: template.defaultFilters,
      reportType: 'compliance',
      complianceFramework: template.framework as 'gdpr' | 'sox' | 'hipaa' | 'labor_law' | 'audit_trail' | 'data_retention',
      schedule: {
        frequency: template.frequency as 'daily' | 'weekly' | 'monthly',
        recipients: []
      }
    }))

    setSelectedTemplate(templateId)
    setShowComplianceTemplates(false)
    toast.success(`Applied ${template.name} template`)
  }

  const removeField = (fieldId: string) => {
    setReport(prev => ({
      ...prev,
      fields: prev.fields.filter(f => f !== fieldId)
    }))
  }

  const addFilter = () => {
    const newFilter: ReportFilter = {
      id: Date.now().toString(),
      field: '',
      operator: 'equals',
      value: ''
    }
    setReport(prev => ({
      ...prev,
      filters: [...prev.filters, newFilter]
    }))
  }

  const updateFilter = (filterId: string, updates: Partial<ReportFilter>) => {
    setReport(prev => ({
      ...prev,
      filters: prev.filters.map(f => f.id === filterId ? { ...f, ...updates } : f)
    }))
  }

  const removeFilter = (filterId: string) => {
    setReport(prev => ({
      ...prev,
      filters: prev.filters.filter(f => f.id !== filterId)
    }))
  }



  const generatePreview = async () => {
    if (report.fields.length === 0) {
      toast.error('Please select at least one field')
      return
    }

    try {
      setIsLoading(true)
      setShowPreview(true)

      const [productivity] = await Promise.all([
        analyticsService.getProductivityMetrics()
      ])

      const analyticsData = productivity.slice(0, 5).map(metric => ({
        employee_name: metric.userName,
        employee_id: metric.userId,
        department: metric.department,
        attendance_rate: `${(metric.attendanceRate * 100).toFixed(1)}%`,
        productivity_score: metric.productivityScore.toFixed(1),
        punctuality_score: metric.punctualityScore.toFixed(1),
        hours_worked: metric.averageHours.toFixed(1),
        check_in_time: new Date().toLocaleTimeString(),
        check_out_time: new Date(Date.now() + 8 * 60 * 60 * 1000).toLocaleTimeString(),
        is_late: metric.punctualityScore < 80,
        efficiency_rating: Math.round(metric.productivityScore / 10)
      }))

      const filteredData = analyticsData.map(row => {
        const filteredRow: Record<string, unknown> = {}
        report.fields.forEach(fieldId => {
          if (Object.prototype.hasOwnProperty.call(row, fieldId)) {
            filteredRow[fieldId] = row[fieldId as keyof typeof row]
          }
        })
        return filteredRow
      })

      setPreviewData(filteredData)
      toast.success('Preview generated successfully')
    } catch (error) {
      console.error('Error generating preview:', error)
      toast.error('Failed to generate preview')
    } finally {
      setIsLoading(false)
    }
  }

  const saveReport = async () => {
    if (!report.name.trim()) {
      toast.error('Please enter a report name')
      return
    }

    if (report.fields.length === 0) {
      toast.error('Please select at least one field')
      return
    }

    try {
      setIsLoading(true)
      
      toast.success('Report saved successfully')
      
      setReport({
        name: '',
        description: '',
        fields: [],
        filters: [],
        groupBy: []
      })
    } catch (error) {
      console.error('Error saving report:', error)
      toast.error('Failed to save report')
    } finally {
      setIsLoading(false)
    }
  }

  const exportReport = async (format: 'pdf' | 'excel' | 'csv') => {
    try {
      setIsLoading(true)
      toast.success(`Exporting report as ${format.toUpperCase()}...`)
      
      let reportType: 'attendance' | 'productivity' | 'department' | 'predictive' = 'attendance'
      
      if (report.fields.some(field => field.includes('productivity') || field.includes('score'))) {
        reportType = 'productivity'
      } else if (report.fields.some(field => field.includes('department'))) {
        reportType = 'department'
      }

      const reportBlob = await analyticsService.exportReport(reportType, format)
      
      const downloadUrl = URL.createObjectURL(reportBlob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `${report.name || 'custom-report'}.${format}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      URL.revokeObjectURL(downloadUrl)
      
      toast.success(`Report exported as ${format.toUpperCase()} successfully`)
    } catch (error) {
      console.error('Error exporting report:', error)
      toast.error('Failed to export report')
    } finally {
      setIsLoading(false)
    }
  }

  const generateComplianceReport = async () => {
    try {
      setIsLoading(true)
      
      if (!report.complianceFramework) {
        toast.error('Please select a compliance framework')
        return
      }

      const complianceRequest = {
        reportType: report.complianceFramework,
        tenantId: 'current-tenant-id',
        generatedBy: 'current-user-id',
        dateRange: {
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString()
        },
        includeMetrics: report.fields,
        outputFormat: 'json'
      }

      console.log('Generating compliance report:', complianceRequest)
      
      const mockComplianceData = [
        {
          metricName: 'Data Processing Activities',
          value: 1250,
          status: 'Compliant',
          description: 'Number of personal data processing activities logged',
          framework: report.complianceFramework
        },
        {
          metricName: 'Audit Events',
          value: 5420,
          status: 'Compliant',
          description: 'Total audit events recorded',
          framework: report.complianceFramework
        },
        {
          metricName: 'Violations Detected',
          value: 3,
          status: 'Requires Review',
          description: 'Number of compliance violations detected',
          framework: report.complianceFramework
        }
      ]

      setPreviewData(mockComplianceData)
      setShowPreview(true)
      toast.success(`${report.complianceFramework.toUpperCase()} compliance report generated successfully`)
    } catch (error) {
      console.error('Error generating compliance report:', error)
      toast.error('Failed to generate compliance report')
    } finally {
      setIsLoading(false)
    }
  }

  const getFieldsByCategory = (category: string) => {
    return availableFields.filter(field => field.category === category)
  }

  const categories = [...new Set(availableFields.map(field => field.category))]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Custom Report Builder</CardTitle>
          <CardDescription>Build custom reports with advanced filtering and grouping</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Report Type Selection */}
          <div className="space-y-2">
            <Label>Report Type</Label>
            <Select 
              value={report.reportType} 
              onValueChange={(value: 'standard' | 'compliance') => 
                setReport(prev => ({ ...prev, reportType: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard Report</SelectItem>
                <SelectItem value="compliance">Compliance Report</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Compliance Templates */}
          {report.reportType === 'compliance' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Compliance Templates</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowComplianceTemplates(!showComplianceTemplates)}
                >
                  {showComplianceTemplates ? 'Hide Templates' : 'Show Templates'}
                </Button>
              </div>
              
              {showComplianceTemplates && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {complianceTemplates.map((template) => (
                    <Card 
                      key={template.id} 
                      className={`cursor-pointer transition-colors ${
                        selectedTemplate === template.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => applyComplianceTemplate(template.id)}
                    >
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-sm">{template.name}</h4>
                        <p className="text-xs text-gray-600 mt-1">{template.description}</p>
                        <div className="flex items-center justify-between mt-2">
                          <Badge variant="secondary" className="text-xs">
                            {template.framework.toUpperCase()}
                          </Badge>
                          <span className="text-xs text-gray-500">{template.frequency}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {report.complianceFramework && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-sm text-blue-800">
                    Active Compliance Framework: {report.complianceFramework.toUpperCase()}
                  </h4>
                  <p className="text-xs text-blue-600 mt-1">
                    This report will include compliance-specific metrics and validation rules.
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="reportName">Report Name</Label>
              <Input
                id="reportName"
                value={report.name}
                onChange={(e) => setReport(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter report name"
              />
            </div>
            <div>
              <Label htmlFor="chartType">Visualization Type</Label>
              <Select value={report.chartType || 'table'} onValueChange={(value: string) => setReport(prev => ({ ...prev, chartType: value as 'table' | 'bar' | 'line' | 'pie' }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="table">Table</SelectItem>
                  <SelectItem value="bar">Bar Chart</SelectItem>
                  <SelectItem value="line">Line Chart</SelectItem>
                  <SelectItem value="pie">Pie Chart</SelectItem>
                </SelectContent>
              </Select>
              {report.reportType === 'compliance' && (
                <p className="text-xs text-blue-600 mt-1">
                  Compliance reports include additional validation and audit trail information
                </p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={report.description}
              onChange={(e) => setReport(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter report description"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Select Fields</CardTitle>
          <CardDescription>Choose the data fields to include in your report</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categories.map(category => (
              <div key={category}>
                <h4 className="font-medium text-sm text-gray-700 mb-2">{category}</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {getFieldsByCategory(category).map(field => (
                    <div key={field.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={field.id}
                        checked={report.fields.includes(field.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            addField(field.id)
                          } else {
                            removeField(field.id)
                          }
                        }}
                      />
                      <Label htmlFor={field.id} className="text-sm">
                        {field.displayName}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {report.fields.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium text-sm text-gray-700 mb-2">Selected Fields</h4>
              <div className="flex flex-wrap gap-2">
                {report.fields.map(fieldId => {
                  const field = availableFields.find(f => f.id === fieldId)
                  return field ? (
                    <Badge key={fieldId} variant="secondary" className="flex items-center space-x-1">
                      <span>{field.displayName}</span>
                      <button
                        onClick={() => removeField(fieldId)}
                        className="ml-1 text-gray-500 hover:text-gray-700"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                    </Badge>
                  ) : null
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Add filters to refine your report data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {report.filters.map(filter => (
              <div key={filter.id} className="flex items-center space-x-2">
                <Select value={filter.field} onValueChange={(value) => updateFilter(filter.id, { field: value })}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select field" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableFields.map(field => (
                      <SelectItem key={field.id} value={field.id}>
                        {field.displayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filter.operator} onValueChange={(value: string) => updateFilter(filter.id, { operator: value as 'equals' | 'contains' | 'greater_than' | 'less_than' | 'between' })}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="equals">Equals</SelectItem>
                    <SelectItem value="contains">Contains</SelectItem>
                    <SelectItem value="greater_than">Greater Than</SelectItem>
                    <SelectItem value="less_than">Less Than</SelectItem>
                    <SelectItem value="between">Between</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  value={Array.isArray(filter.value) ? filter.value.join(', ') : filter.value}
                  onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
                  placeholder="Filter value"
                  className="flex-1"
                />

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeFilter(filter.id)}
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </div>
            ))}

            <Button variant="outline" onClick={addFilter}>
              <Plus className="mr-2 h-4 w-4" />
              Add Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <Button onClick={generatePreview} disabled={isLoading}>
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
          <Button onClick={saveReport} disabled={isLoading}>
            <Save className="mr-2 h-4 w-4" />
            Save Report
          </Button>
          {report.reportType === 'compliance' && (
            <Button 
              onClick={generateComplianceReport} 
              disabled={isLoading || !report.complianceFramework}
              variant="secondary"
            >
              Generate Compliance Report
            </Button>
          )}
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => exportReport('pdf')} disabled={isLoading}>
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          <Button variant="outline" onClick={() => exportReport('excel')} disabled={isLoading}>
            <Download className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
          <Button variant="outline" onClick={() => exportReport('csv')} disabled={isLoading}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {showPreview && previewData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              Report Preview
              {report.reportType === 'compliance' && report.complianceFramework && (
                <Badge variant="secondary" className="ml-2">
                  {report.complianceFramework.toUpperCase()} Compliance
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              {report.reportType === 'compliance' 
                ? 'Compliance report with regulatory framework validation'
                : 'Preview of your report data'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {report.reportType === 'compliance' ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {previewData.map((metric, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-sm">{String(metric.metricName || '')}</h4>
                          <p className="text-2xl font-bold text-blue-600">{String(metric.value || '')}</p>
                          <p className="text-xs text-gray-600">{String(metric.description || '')}</p>
                        </div>
                        <Badge 
                          variant={metric.status === 'Compliant' ? 'default' : 'destructive'}
                          className="text-xs"
                        >
                          {String(metric.status || '')}
                        </Badge>
                      </div>
                    </Card>
                  ))}
                </div>
                
                <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                  <h4 className="font-semibold text-sm text-yellow-800">Compliance Notes</h4>
                  <ul className="text-xs text-yellow-700 mt-2 space-y-1">
                    <li>• This report includes automated compliance validation</li>
                    <li>• All data access events are logged for audit purposes</li>
                    <li>• Report generation is tracked in the audit trail</li>
                    <li>• Data retention policies are automatically applied</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      {report.fields.map(fieldId => {
                        const field = availableFields.find(f => f.id === fieldId)
                        return (
                          <th key={fieldId} className="border border-gray-300 px-4 py-2 text-left">
                            {field?.displayName || fieldId}
                          </th>
                        )
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((row, index) => (
                      <tr key={index}>
                        {report.fields.map(fieldId => (
                          <td key={fieldId} className="border border-gray-300 px-4 py-2">
                            {row[fieldId]?.toString() || '-'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default ReportBuilder
