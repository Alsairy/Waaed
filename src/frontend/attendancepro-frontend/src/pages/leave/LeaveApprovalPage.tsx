import React, { useState, useEffect } from 'react'
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  FileText, 
  Search,
  Eye,
  Loader2
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { Badge } from '../../components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Checkbox } from '../../components/ui/checkbox'
import leaveManagementService, { LeaveRequest, LeaveType, ApprovalRequest } from '../../services/leaveManagementService'

const LeaveApprovalPage: React.FC = () => {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedRequests, setSelectedRequests] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  
  const [approvalDialog, setApprovalDialog] = useState<{
    open: boolean
    request: LeaveRequest | null
    action: 'approve' | 'reject' | null
  }>({
    open: false,
    request: null,
    action: null
  })
  
  const [approvalComment, setApprovalComment] = useState('')
  const [isSubmittingApproval, setIsSubmittingApproval] = useState(false)
  
  const [detailsDialog, setDetailsDialog] = useState<{
    open: boolean
    request: LeaveRequest | null
  }>({
    open: false,
    request: null
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const [requestsData, typesData] = await Promise.all([
        leaveManagementService.getLeaveRequests('pending'),
        leaveManagementService.getLeaveTypes()
      ])
      setLeaveRequests(requestsData)
      setLeaveTypes(typesData)
    } catch (error: any) {
      toast.error(error.message || 'Failed to load approval data')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredRequests = leaveRequests.filter(request => {
    const matchesSearch = 
      request.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.reason.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter
    const matchesType = typeFilter === 'all' || request.leaveTypeId === typeFilter
    
    return matchesSearch && matchesStatus && matchesType
  })

  const handleApprovalAction = (request: LeaveRequest, action: 'approve' | 'reject') => {
    setApprovalDialog({
      open: true,
      request,
      action
    })
    setApprovalComment('')
  }

  const submitApproval = async () => {
    if (!approvalDialog.request || !approvalDialog.action || !approvalDialog.request.id) return

    try {
      setIsSubmittingApproval(true)
      
      const approval: ApprovalRequest = {
        requestId: approvalDialog.request.id,
        action: approvalDialog.action,
        comments: approvalComment
      }

      if (approvalDialog.action === 'approve') {
        await leaveManagementService.approveLeaveRequest(approval)
      } else {
        await leaveManagementService.rejectLeaveRequest(approval)
      }
      
      toast.success(`Leave request ${approvalDialog.action}d successfully`)
      
      setApprovalDialog({ open: false, request: null, action: null })
      setApprovalComment('')
      
      await loadData()
      
    } catch (error: any) {
      toast.error(error.message || 'Failed to process approval')
    } finally {
      setIsSubmittingApproval(false)
    }
  }

  const handleBulkApproval = async (action: 'approve' | 'reject') => {
    if (selectedRequests.length === 0) {
      toast.error('Please select requests to process')
      return
    }

    try {
      setIsLoading(true)
      
      if (action === 'approve') {
        await leaveManagementService.bulkApproveRequests(selectedRequests, 'Bulk approved')
      } else {
        for (const requestId of selectedRequests) {
          await leaveManagementService.rejectLeaveRequest({
            requestId,
            action: 'reject',
            comments: 'Bulk rejected'
          })
        }
      }
      
      toast.success(`${selectedRequests.length} requests ${action}d successfully`)
      setSelectedRequests([])
      
      await loadData()
      
    } catch (error: any) {
      toast.error(error.message || 'Failed to process bulk approval')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleRequestSelection = (requestId: string) => {
    setSelectedRequests(prev => 
      prev.includes(requestId)
        ? prev.filter(id => id !== requestId)
        : [...prev, requestId]
    )
  }

  const toggleSelectAll = () => {
    if (selectedRequests.length === filteredRequests.length) {
      setSelectedRequests([])
    } else {
      setSelectedRequests(filteredRequests.map(req => req.id || '').filter(id => id))
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
          <Clock className="w-3 h-3 mr-1" />
          Pending
        </Badge>
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <CheckCircle className="w-3 h-3 mr-1" />
          Approved
        </Badge>
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          <XCircle className="w-3 h-3 mr-1" />
          Rejected
        </Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading approval dashboard...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Leave Approvals</h1>
          <p className="text-muted-foreground">Review and approve leave requests</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleBulkApproval('approve')}
            disabled={selectedRequests.length === 0}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Bulk Approve ({selectedRequests.length})
          </Button>
          <Button
            variant="outline"
            onClick={() => handleBulkApproval('reject')}
            disabled={selectedRequests.length === 0}
          >
            <XCircle className="w-4 h-4 mr-2" />
            Bulk Reject ({selectedRequests.length})
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Approval Dashboard</CardTitle>
          <CardDescription>
            Manage leave requests requiring your approval
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending" className="space-y-4">
            <TabsList>
              <TabsTrigger value="pending">Pending ({leaveRequests.filter(r => r.status === 'pending').length})</TabsTrigger>
              <TabsTrigger value="approved">Approved ({leaveRequests.filter(r => r.status === 'approved').length})</TabsTrigger>
              <TabsTrigger value="rejected">Rejected ({leaveRequests.filter(r => r.status === 'rejected').length})</TabsTrigger>
              <TabsTrigger value="all">All Requests ({leaveRequests.length})</TabsTrigger>
            </TabsList>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search by employee or reason..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {leaveTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <TabsContent value="pending" className="space-y-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedRequests.length === filteredRequests.filter(r => r.status === 'pending').length}
                          onCheckedChange={toggleSelectAll}
                        />
                      </TableHead>
                      <TableHead>Employee</TableHead>
                      <TableHead>Leave Type</TableHead>
                      <TableHead>Dates</TableHead>
                      <TableHead>Days</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRequests.filter(r => r.status === 'pending').map((request) => {
                      const leaveType = leaveTypes.find(type => type.id === request.leaveTypeId)
                      
                      return (
                        <TableRow key={request.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedRequests.includes(request.id || '')}
                              onCheckedChange={() => toggleRequestSelection(request.id || '')}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4" />
                              <span className="font-medium">{request.userId}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{leaveType?.name}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{formatDate(request.startDate)} - {formatDate(request.endDate)}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{request.totalDays} days</Badge>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(request.status)}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(request.requestedAt || '')}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setDetailsDialog({ open: true, request })}
                              >
                                <Eye className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleApprovalAction(request, 'approve')}
                                className="text-green-600 hover:text-green-700"
                              >
                                <CheckCircle className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleApprovalAction(request, 'reject')}
                                className="text-red-600 hover:text-red-700"
                              >
                                <XCircle className="w-3 h-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="approved" className="space-y-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Leave Type</TableHead>
                      <TableHead>Dates</TableHead>
                      <TableHead>Days</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Approved</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRequests.filter(r => r.status === 'approved').map((request) => {
                      const leaveType = leaveTypes.find(type => type.id === request.leaveTypeId)
                      
                      return (
                        <TableRow key={request.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4" />
                              <span className="font-medium">{request.userId}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{leaveType?.name}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{formatDate(request.startDate)} - {formatDate(request.endDate)}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{request.totalDays} days</Badge>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(request.status)}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(request.approvedAt || '')}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDetailsDialog({ open: true, request })}
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="rejected" className="space-y-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Leave Type</TableHead>
                      <TableHead>Dates</TableHead>
                      <TableHead>Days</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Rejected</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRequests.filter(r => r.status === 'rejected').map((request) => {
                      const leaveType = leaveTypes.find(type => type.id === request.leaveTypeId)
                      
                      return (
                        <TableRow key={request.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4" />
                              <span className="font-medium">{request.userId}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{leaveType?.name}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{formatDate(request.startDate)} - {formatDate(request.endDate)}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{request.totalDays} days</Badge>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(request.status)}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(request.rejectedAt || '')}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDetailsDialog({ open: true, request })}
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="all" className="space-y-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Leave Type</TableHead>
                      <TableHead>Dates</TableHead>
                      <TableHead>Days</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRequests.map((request) => {
                      const leaveType = leaveTypes.find(type => type.id === request.leaveTypeId)
                      
                      return (
                        <TableRow key={request.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4" />
                              <span className="font-medium">{request.userId}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{leaveType?.name}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{formatDate(request.startDate)} - {formatDate(request.endDate)}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{request.totalDays} days</Badge>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(request.status)}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(request.requestedAt || '')}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setDetailsDialog({ open: true, request })}
                              >
                                <Eye className="w-3 h-3" />
                              </Button>
                              {request.status === 'pending' && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleApprovalAction(request, 'approve')}
                                    className="text-green-600 hover:text-green-700"
                                  >
                                    <CheckCircle className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleApprovalAction(request, 'reject')}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <XCircle className="w-3 h-3" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Approval Dialog */}
      <Dialog open={approvalDialog.open} onOpenChange={(open) => 
        setApprovalDialog({ ...approvalDialog, open })
      }>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {approvalDialog.action === 'approve' ? 'Approve' : 'Reject'} Leave Request
            </DialogTitle>
            <DialogDescription>
              {approvalDialog.request && (
                <>
                  Employee: {approvalDialog.request.userId}<br />
                  Dates: {formatDate(approvalDialog.request.startDate)} - {formatDate(approvalDialog.request.endDate)}<br />
                  Days: {approvalDialog.request.totalDays}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="approval-comment">
                {approvalDialog.action === 'approve' ? 'Approval' : 'Rejection'} Comments
              </Label>
              <Textarea
                id="approval-comment"
                placeholder={`Add ${approvalDialog.action === 'approve' ? 'approval' : 'rejection'} comments...`}
                value={approvalComment}
                onChange={(e) => setApprovalComment(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setApprovalDialog({ open: false, request: null, action: null })}
            >
              Cancel
            </Button>
            <Button
              onClick={submitApproval}
              disabled={isSubmittingApproval}
              className={approvalDialog.action === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
            >
              {isSubmittingApproval ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                `${approvalDialog.action === 'approve' ? 'Approve' : 'Reject'} Request`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={detailsDialog.open} onOpenChange={(open) => 
        setDetailsDialog({ ...detailsDialog, open })
      }>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Leave Request Details</DialogTitle>
          </DialogHeader>
          {detailsDialog.request && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Employee</Label>
                  <p className="text-sm text-muted-foreground">{detailsDialog.request.userId}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Leave Type</Label>
                  <p className="text-sm text-muted-foreground">
                    {leaveTypes.find(type => type.id === detailsDialog.request?.leaveTypeId)?.name}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Start Date</Label>
                  <p className="text-sm text-muted-foreground">{formatDate(detailsDialog.request.startDate)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">End Date</Label>
                  <p className="text-sm text-muted-foreground">{formatDate(detailsDialog.request.endDate)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Total Days</Label>
                  <p className="text-sm text-muted-foreground">{detailsDialog.request.totalDays} days</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="mt-1">
                    {getStatusBadge(detailsDialog.request.status)}
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Reason</Label>
                <p className="text-sm text-muted-foreground mt-1 p-3 bg-muted rounded-md">
                  {detailsDialog.request.reason}
                </p>
              </div>

              {detailsDialog.request.emergencyContact && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Emergency Contact</Label>
                    <p className="text-sm text-muted-foreground">{detailsDialog.request.emergencyContact}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Emergency Reason</Label>
                    <p className="text-sm text-muted-foreground">{detailsDialog.request.emergencyReason}</p>
                  </div>
                </div>
              )}

              {detailsDialog.request.attachments && detailsDialog.request.attachments.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Attachments</Label>
                  <div className="mt-2 space-y-2">
                    {detailsDialog.request.attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          <span className="text-sm">{attachment}</span>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDetailsDialog({ open: false, request: null })}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default LeaveApprovalPage
