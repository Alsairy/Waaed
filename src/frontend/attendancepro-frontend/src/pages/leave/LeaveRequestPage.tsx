import React, { useState, useEffect } from 'react'
import { Upload, FileText, Clock, User, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { Alert, AlertDescription } from '../../components/ui/alert'
import { Badge } from '../../components/ui/badge'
import leaveManagementService, { LeaveType, LeaveRequest, LeaveBalance } from '../../services/leaveManagementService'

const LeaveRequestPage: React.FC = () => {
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([])
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  
  const [formData, setFormData] = useState({
    leaveTypeId: '',
    startDate: '',
    endDate: '',
    reason: '',
    emergencyContact: '',
    emergencyPhone: '',
    handoverNotes: '',
  })

  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      setIsLoading(true)
      const [typesData, balancesData] = await Promise.all([
        leaveManagementService.getLeaveTypes(),
        leaveManagementService.getLeaveBalance()
      ])
      setLeaveTypes(typesData)
      setLeaveBalances(balancesData)
    } catch (error: any) {
      toast.error(error.message || 'Failed to load leave data')
    } finally {
      setIsLoading(false)
    }
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.leaveTypeId) {
      errors.leaveTypeId = 'Please select a leave type'
    }

    if (!formData.startDate) {
      errors.startDate = 'Start date is required'
    }

    if (!formData.endDate) {
      errors.endDate = 'End date is required'
    }

    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate)
      const endDate = new Date(formData.endDate)
      
      if (startDate > endDate) {
        errors.endDate = 'End date must be after start date'
      }

      if (startDate < new Date()) {
        errors.startDate = 'Start date cannot be in the past'
      }
    }

    if (!formData.reason.trim()) {
      errors.reason = 'Reason is required'
    }

    if (formData.reason.trim().length < 10) {
      errors.reason = 'Reason must be at least 10 characters'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const calculateLeaveDays = (): number => {
    if (!formData.startDate || !formData.endDate) return 0
    
    const startDate = new Date(formData.startDate)
    const endDate = new Date(formData.endDate)
    const timeDiff = endDate.getTime() - startDate.getTime()
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1
    
    return daysDiff > 0 ? daysDiff : 0
  }

  const getAvailableBalance = (): number => {
    if (!formData.leaveTypeId) return 0
    
    const balance = leaveBalances.find(b => b.leaveTypeId === formData.leaveTypeId)
    return balance ? balance.remaining : 0
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    const validFiles = files.filter(file => {
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
      const maxSize = 5 * 1024 * 1024 // 5MB
      
      if (!validTypes.includes(file.type)) {
        toast.error(`${file.name}: Only PDF and image files are allowed`)
        return false
      }
      
      if (file.size > maxSize) {
        toast.error(`${file.name}: File size must be less than 5MB`)
        return false
      }
      
      return true
    })
    
    setSelectedFiles(prev => [...prev, ...validFiles])
  }

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    
    if (!validateForm()) {
      toast.error('Please fix the form errors')
      return
    }

    const leaveDays = calculateLeaveDays()
    const availableBalance = getAvailableBalance()
    
    if (leaveDays > availableBalance) {
      toast.error(`Insufficient leave balance. You have ${availableBalance} days available.`)
      return
    }

    try {
      setIsSubmitting(true)
      
      const leaveRequest: Omit<LeaveRequest, 'id' | 'userId' | 'status' | 'submittedAt' | 'approvals'> = {
        leaveTypeId: formData.leaveTypeId,
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: formData.reason,
        totalDays: calculateLeaveDays(),
        isEmergency: formData.emergencyContact ? true : false,
        emergencyContact: formData.emergencyContact,
        emergencyReason: formData.emergencyContact || '',
        attachments: selectedFiles.map(file => file.name)
      }

      await leaveManagementService.createLeaveRequest({
        leaveTypeId: leaveRequest.leaveTypeId,
        startDate: leaveRequest.startDate,
        endDate: leaveRequest.endDate,
        reason: leaveRequest.reason,
        isEmergency: leaveRequest.isEmergency,
        emergencyContact: leaveRequest.emergencyContact,
        emergencyReason: leaveRequest.emergencyReason,
        attachments: selectedFiles
      })
      
      toast.success('Leave request submitted successfully!')
      
      setFormData({
        leaveTypeId: '',
        startDate: '',
        endDate: '',
        reason: '',
        emergencyContact: '',
        emergencyPhone: '',
        handoverNotes: '',
      })
      setSelectedFiles([])
      setFormErrors({})
      
      await loadInitialData()
      
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit leave request')
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedLeaveType = leaveTypes.find(type => type.id === formData.leaveTypeId)
  const leaveDays = calculateLeaveDays()
  const availableBalance = getAvailableBalance()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading leave request form...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Request Leave</h1>
          <p className="text-muted-foreground">Submit a new leave request for approval</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Leave Request Form
              </CardTitle>
              <CardDescription>
                Fill out the form below to submit your leave request
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="leaveType">Leave Type *</Label>
                    <Select
                      value={formData.leaveTypeId}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, leaveTypeId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select leave type" />
                      </SelectTrigger>
                      <SelectContent>
                        {leaveTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            <div className="flex items-center justify-between w-full">
                              <span>{type.name}</span>
                              <Badge variant="outline" className="ml-2">
                                {type.maxDaysPerYear} days/year
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formErrors.leaveTypeId && (
                      <p className="text-sm text-red-600">{formErrors.leaveTypeId}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Available Balance</Label>
                    <div className="p-3 bg-muted rounded-md">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span className="font-medium">{availableBalance} days</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                      min={new Date().toISOString().split('T')[0]}
                    />
                    {formErrors.startDate && (
                      <p className="text-sm text-red-600">{formErrors.startDate}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date *</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                      min={formData.startDate || new Date().toISOString().split('T')[0]}
                    />
                    {formErrors.endDate && (
                      <p className="text-sm text-red-600">{formErrors.endDate}</p>
                    )}
                  </div>
                </div>

                {leaveDays > 0 && (
                  <Alert className={leaveDays > availableBalance ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
                    {leaveDays > availableBalance ? (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    ) : (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                    <AlertDescription className={leaveDays > availableBalance ? 'text-red-700' : 'text-green-700'}>
                      {leaveDays > availableBalance 
                        ? `Insufficient balance: You're requesting ${leaveDays} days but only have ${availableBalance} days available.`
                        : `You're requesting ${leaveDays} day(s). ${availableBalance - leaveDays} days will remain.`
                      }
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="reason">Reason for Leave *</Label>
                  <Textarea
                    id="reason"
                    placeholder="Please provide a detailed reason for your leave request..."
                    value={formData.reason}
                    onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                    rows={4}
                  />
                  {formErrors.reason && (
                    <p className="text-sm text-red-600">{formErrors.reason}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContact">Emergency Contact</Label>
                    <Input
                      id="emergencyContact"
                      placeholder="Contact person name"
                      value={formData.emergencyContact}
                      onChange={(e) => setFormData(prev => ({ ...prev, emergencyContact: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergencyPhone">Emergency Phone</Label>
                    <Input
                      id="emergencyPhone"
                      placeholder="Contact phone number"
                      value={formData.emergencyPhone}
                      onChange={(e) => setFormData(prev => ({ ...prev, emergencyPhone: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="handoverNotes">Handover Notes</Label>
                  <Textarea
                    id="handoverNotes"
                    placeholder="Any important information for colleagues covering your responsibilities..."
                    value={formData.handoverNotes}
                    onChange={(e) => setFormData(prev => ({ ...prev, handoverNotes: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div className="space-y-4">
                  <Label>Supporting Documents</Label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                    <div className="text-center">
                      <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                      <div className="mt-4">
                        <Label htmlFor="file-upload" className="cursor-pointer">
                          <span className="mt-2 block text-sm font-medium text-gray-900">
                            Upload supporting documents
                          </span>
                          <span className="mt-1 block text-sm text-muted-foreground">
                            PDF, JPG, PNG up to 5MB each
                          </span>
                        </Label>
                        <Input
                          id="file-upload"
                          type="file"
                          multiple
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </div>
                    </div>
                  </div>

                  {selectedFiles.length > 0 && (
                    <div className="space-y-2">
                      <Label>Selected Files:</Label>
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            <span className="text-sm">{file.name}</span>
                            <span className="text-xs text-muted-foreground">
                              ({(file.size / 1024 / 1024).toFixed(2)} MB)
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting || leaveDays > availableBalance}
                    className="flex-1"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Leave Request'
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setFormData({
                        leaveTypeId: '',
                        startDate: '',
                        endDate: '',
                        reason: '',
                        emergencyContact: '',
                        emergencyPhone: '',
                        handoverNotes: '',
                      })
                      setSelectedFiles([])
                      setFormErrors({})
                    }}
                  >
                    Reset
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Leave Balances
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {leaveBalances.map((balance, index) => {
                const leaveType = leaveTypes.find(type => type.id === balance.leaveTypeId)
                return (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">{leaveType?.name}</span>
                      <Badge variant="outline">
                        {balance.remaining}/{balance.totalAllowed}
                      </Badge>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${(balance.remaining / balance.totalAllowed) * 100}%`
                        }}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {balance.used} used • {balance.remaining} available
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          {selectedLeaveType && (
            <Card>
              <CardHeader>
                <CardTitle>Leave Type Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <span className="font-medium">Name:</span> {selectedLeaveType.name}
                </div>
                <div>
                  <span className="font-medium">Max Days/Year:</span> {selectedLeaveType.maxDaysPerYear}
                </div>
                <div>
                  <span className="font-medium">Requires Approval:</span>{' '}
                  {selectedLeaveType.requiresApproval ? 'Yes' : 'No'}
                </div>
                {selectedLeaveType.description && (
                  <div>
                    <span className="font-medium">Description:</span>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedLeaveType.description}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default LeaveRequestPage
