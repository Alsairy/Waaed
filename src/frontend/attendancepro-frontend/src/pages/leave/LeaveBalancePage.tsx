import React, { useState, useEffect } from 'react'
import { 
  Calendar, 
  Clock, 
  TrendingUp, 
  FileText, 
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { Badge } from '../../components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Progress } from '../../components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Alert, AlertDescription } from '../../components/ui/alert'
import leaveManagementService, { 
  LeaveBalance, 
  LeaveType, 
  LeaveRequest, 
  LeaveCalendarEvent 
} from '../../services/leaveManagementService'

const LeaveBalancePage: React.FC = () => {
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([])
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([])
  const [leaveHistory, setLeaveHistory] = useState<LeaveRequest[]>([])
  const [leaveCalendar, setLeaveCalendar] = useState<LeaveCalendarEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)

  useEffect(() => {
    loadData()
  }, [selectedYear, selectedMonth])

  const loadData = async () => {
    try {
      setIsLoading(true)
      
      const startDate = new Date(selectedYear, selectedMonth - 1, 1)
      const endDate = new Date(selectedYear, selectedMonth, 0)
      
      const [balancesData, typesData, historyData, calendarData] = await Promise.all([
        leaveManagementService.getLeaveBalance(),
        leaveManagementService.getLeaveTypes(),
        leaveManagementService.getLeaveRequests(),
        leaveManagementService.getLeaveCalendar(startDate.toISOString(), endDate.toISOString())
      ])
      
      setLeaveBalances(balancesData)
      setLeaveTypes(typesData)
      setLeaveHistory(historyData)
      setLeaveCalendar(calendarData)
    } catch (error: any) {
      toast.error(error.message || 'Failed to load leave data')
    } finally {
      setIsLoading(false)
    }
  }

  const refreshData = async () => {
    await loadData()
    toast.success('Leave data refreshed')
  }

  const calculateUsagePercentage = (used: number, total: number): number => {
    return total > 0 ? (used / total) * 100 : 0
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
          <AlertCircle className="w-3 h-3 mr-1" />
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

  const calculateLeaveDays = (startDate: string, endDate: string): number => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const timeDiff = end.getTime() - start.getTime()
    return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1
  }

  const getTotalAvailableDays = (): number => {
    return leaveBalances.reduce((total, balance) => total + balance.remaining, 0)
  }

  const getTotalUsedDays = (): number => {
    return leaveBalances.reduce((total, balance) => total + balance.used, 0)
  }

  const getUpcomingLeave = (): LeaveRequest[] => {
    const today = new Date()
    return leaveHistory
      .filter(request => 
        request.status === 'approved' && 
        new Date(request.startDate) > today
      )
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
      .slice(0, 5)
  }

  const getRecentLeave = (): LeaveRequest[] => {
    return leaveHistory
      .sort((a, b) => new Date(b.requestedAt || '').getTime() - new Date(a.requestedAt || '').getTime())
      .slice(0, 10)
  }

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i)
  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading leave balance data...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Leave Balance</h1>
          <p className="text-muted-foreground">Track your leave balances and history</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refreshData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <FileText className="w-4 h-4 mr-2" />
            Request Leave
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Available</p>
                <p className="text-2xl font-bold">{getTotalAvailableDays()}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <Clock className="w-4 h-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Used</p>
                <p className="text-2xl font-bold">{getTotalUsedDays()}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-full">
                <TrendingUp className="w-4 h-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Requests</p>
                <p className="text-2xl font-bold">
                  {leaveHistory.filter(r => r.status === 'pending').length}
                </p>
              </div>
              <div className="p-2 bg-yellow-100 rounded-full">
                <AlertCircle className="w-4 h-4 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Upcoming Leave</p>
                <p className="text-2xl font-bold">{getUpcomingLeave().length}</p>
              </div>
              <div className="p-2 bg-purple-100 rounded-full">
                <Calendar className="w-4 h-4 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="balances" className="space-y-4">
        <TabsList>
          <TabsTrigger value="balances">Leave Balances</TabsTrigger>
          <TabsTrigger value="history">Leave History</TabsTrigger>
          <TabsTrigger value="calendar">Leave Calendar</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming Leave</TabsTrigger>
        </TabsList>

        <TabsContent value="balances" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Current Leave Balances</CardTitle>
              <CardDescription>
                Your available leave days by type for the current year
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {leaveBalances.map((balance, index) => {
                  const leaveType = leaveTypes.find(type => type.id === balance.leaveTypeId)
                  const usagePercentage = calculateUsagePercentage(balance.used, balance.totalAllowed)
                  
                  return (
                    <div key={index} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{leaveType?.name || balance.leaveTypeName}</h3>
                          <p className="text-sm text-muted-foreground">
                            {balance.used} used • {balance.remaining} available • {balance.totalAllowed} total
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold">
                            {balance.remaining}/{balance.totalAllowed}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {usagePercentage.toFixed(0)}% used
                          </div>
                        </div>
                      </div>
                      
                      <Progress 
                        value={usagePercentage} 
                        className="h-2"
                      />
                      
                      {usagePercentage >= 90 && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            You've used {usagePercentage.toFixed(0)}% of your {leaveType?.name} allocation.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Leave History</CardTitle>
              <CardDescription>
                Your recent leave requests and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Leave Type</TableHead>
                      <TableHead>Dates</TableHead>
                      <TableHead>Days</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Reason</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getRecentLeave().map((request) => {
                      const leaveType = leaveTypes.find(type => type.id === request.leaveTypeId)
                      const leaveDays = calculateLeaveDays(request.startDate, request.endDate)
                      
                      return (
                        <TableRow key={request.id}>
                          <TableCell>
                            <Badge variant="outline">{leaveType?.name}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {formatDate(request.startDate)} - {formatDate(request.endDate)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{leaveDays} days</Badge>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(request.status)}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(request.requestedAt || '')}
                          </TableCell>
                          <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                            {request.reason}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Leave Calendar</CardTitle>
                  <CardDescription>
                    View leave schedule for the selected month
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((month) => (
                        <SelectItem key={month.value} value={month.value.toString()}>
                          {month.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leaveCalendar.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">No Leave Scheduled</h3>
                    <p className="text-muted-foreground">
                      No leave requests found for {months.find(m => m.value === selectedMonth)?.label} {selectedYear}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {leaveCalendar.map((entry, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full bg-blue-500" />
                          <div>
                            <div className="font-medium">{entry.userName}</div>
                            <div className="text-sm text-muted-foreground">
                              {entry.leaveType} • {formatDate(entry.start)} - {formatDate(entry.end)}
                            </div>
                          </div>
                        </div>
                        <Badge variant="outline">{entry.title}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Leave</CardTitle>
              <CardDescription>
                Your approved leave requests coming up
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getUpcomingLeave().length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">No Upcoming Leave</h3>
                    <p className="text-muted-foreground">
                      You don't have any approved leave requests scheduled
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {getUpcomingLeave().map((request) => {
                      const leaveType = leaveTypes.find(type => type.id === request.leaveTypeId)
                      const leaveDays = calculateLeaveDays(request.startDate, request.endDate)
                      const daysUntil = Math.ceil(
                        (new Date(request.startDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24)
                      )
                      
                      return (
                        <div key={request.id} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{leaveType?.name}</Badge>
                              <Badge variant="secondary">{leaveDays} days</Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil} days`}
                            </div>
                          </div>
                          <div className="text-sm">
                            <div className="font-medium">
                              {formatDate(request.startDate)} - {formatDate(request.endDate)}
                            </div>
                            <div className="text-muted-foreground mt-1">
                              {request.reason}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default LeaveBalancePage
