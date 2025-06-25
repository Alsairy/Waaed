import React, { useState, useEffect } from 'react'
import { Calendar, Clock, Users, AlertTriangle, Plus, Edit, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Alert, AlertDescription } from '../../components/ui/alert'
import { toast } from 'sonner'

interface Shift {
  id: string
  name: string
  startTime: string
  endTime: string
  department: string
  location: string
  maxEmployees: number
  minEmployees: number
  type: 'Regular' | 'Overtime' | 'Night' | 'Weekend' | 'Holiday'
  status: 'Active' | 'Inactive' | 'Draft'
}

interface ShiftAssignment {
  id: string
  shiftId: string
  shiftName: string
  userId: string
  userName: string
  scheduledDate: string
  status: 'Scheduled' | 'InProgress' | 'Completed' | 'Cancelled' | 'NoShow'
  department: string
  location: string
}

interface ShiftConflict {
  id: string
  userId: string
  userName: string
  type: 'OverlappingShifts' | 'InsufficientRestTime' | 'MaxHoursExceeded'
  description: string
  severity: 'Low' | 'Medium' | 'High' | 'Critical'
  status: 'Open' | 'Resolved' | 'Ignored'
}

interface SwapRequest {
  id: string
  requesterId: string
  requesterName: string
  originalAssignmentId: string
  targetUserId?: string
  targetUserName?: string
  reason: string
  status: 'Pending' | 'Accepted' | 'Rejected' | 'Approved'
  requestedDate: string
}

const ShiftSchedulingPage: React.FC = () => {
  const [shifts, setShifts] = useState<Shift[]>([])
  const [assignments, setAssignments] = useState<ShiftAssignment[]>([])
  const [conflicts, setConflicts] = useState<ShiftConflict[]>([])
  const [swapRequests, setSwapRequests] = useState<SwapRequest[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('schedule')

  useEffect(() => {
    loadScheduleData()
  }, [selectedDate])

  const loadScheduleData = async () => {
    setIsLoading(true)
    try {
      await Promise.all([
        loadShifts(),
        loadAssignments(),
        loadConflicts(),
        loadSwapRequests()
      ])
    } catch (error) {
      console.error('Error loading schedule data:', error)
      toast.error('Failed to load schedule data')
    } finally {
      setIsLoading(false)
    }
  }

  const loadShifts = async () => {
    try {
      const response = await fetch(`/api/shiftscheduling/shifts?tenantId=tenant1`)
      if (response.ok) {
        const data = await response.json()
        setShifts(data)
      }
    } catch (error) {
      console.error('Error loading shifts:', error)
    }
  }

  const loadAssignments = async () => {
    try {
      const startDate = selectedDate
      const endDate = selectedDate
      const response = await fetch(`/api/shiftscheduling/assignments?tenantId=tenant1&startDate=${startDate}&endDate=${endDate}`)
      if (response.ok) {
        const data = await response.json()
        setAssignments(data)
      }
    } catch (error) {
      console.error('Error loading assignments:', error)
    }
  }

  const loadConflicts = async () => {
    try {
      const response = await fetch(`/api/shiftscheduling/conflicts?tenantId=tenant1&status=Open`)
      if (response.ok) {
        const data = await response.json()
        setConflicts(data)
      }
    } catch (error) {
      console.error('Error loading conflicts:', error)
    }
  }

  const loadSwapRequests = async () => {
    try {
      const response = await fetch(`/api/shiftscheduling/swap-requests?tenantId=tenant1&status=Pending`)
      if (response.ok) {
        const data = await response.json()
        setSwapRequests(data)
      }
    } catch (error) {
      console.error('Error loading swap requests:', error)
    }
  }

  const handleCreateShift = async (shiftData: Partial<Shift>) => {
    try {
      const response = await fetch('/api/shiftscheduling/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: 'tenant1',
          ...shiftData,
          effectiveFrom: new Date().toISOString(),
        })
      })

      if (response.ok) {
        toast.success('Shift created successfully')
        loadShifts()
      } else {
        toast.error('Failed to create shift')
      }
    } catch (error) {
      console.error('Error creating shift:', error)
      toast.error('Error creating shift')
    }
  }

  const handleAssignShift = async (shiftId: string, userId: string) => {
    try {
      const response = await fetch('/api/shiftscheduling/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: 'tenant1',
          shiftId,
          userId,
          scheduledDate: selectedDate,
          assignedBy: 'current-user-id'
        })
      })

      if (response.ok) {
        toast.success('Shift assigned successfully')
        loadAssignments()
        loadConflicts()
      } else {
        toast.error('Failed to assign shift')
      }
    } catch (error) {
      console.error('Error assigning shift:', error)
      toast.error('Error assigning shift')
    }
  }

  const handleProcessSwapRequest = async (requestId: string, status: 'Accepted' | 'Rejected') => {
    try {
      const response = await fetch(`/api/shiftscheduling/swap-requests/${requestId}/process`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          processedBy: 'current-user-id',
          status,
          notes: status === 'Rejected' ? 'Request denied by manager' : 'Request approved'
        })
      })

      if (response.ok) {
        toast.success(`Swap request ${status.toLowerCase()}`)
        loadSwapRequests()
        loadAssignments()
      } else {
        toast.error('Failed to process swap request')
      }
    } catch (error) {
      console.error('Error processing swap request:', error)
      toast.error('Error processing swap request')
    }
  }

  const handleResolveConflict = async (conflictId: string) => {
    try {
      const response = await fetch(`/api/shiftscheduling/conflicts/${conflictId}/resolve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resolvedBy: 'current-user-id',
          status: 'Resolved',
          resolutionNotes: 'Conflict resolved by manager'
        })
      })

      if (response.ok) {
        toast.success('Conflict resolved')
        loadConflicts()
      } else {
        toast.error('Failed to resolve conflict')
      }
    } catch (error) {
      console.error('Error resolving conflict:', error)
      toast.error('Error resolving conflict')
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Active':
      case 'Scheduled':
      case 'Completed':
      case 'Accepted':
      case 'Approved':
        return 'default'
      case 'InProgress':
        return 'secondary'
      case 'Pending':
        return 'outline'
      case 'Cancelled':
      case 'NoShow':
      case 'Rejected':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const getSeverityBadgeVariant = (severity: string) => {
    switch (severity) {
      case 'Low':
        return 'outline'
      case 'Medium':
        return 'secondary'
      case 'High':
        return 'default'
      case 'Critical':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Shift Scheduling</h1>
          <p className="text-muted-foreground">Manage shifts, assignments, and scheduling conflicts</p>
        </div>
        <div className="flex gap-2">
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-auto"
          />
          <CreateShiftDialog onCreateShift={handleCreateShift} />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="shifts">Shifts</TabsTrigger>
          <TabsTrigger value="conflicts">Conflicts ({conflicts.length})</TabsTrigger>
          <TabsTrigger value="swaps">Swap Requests ({swapRequests.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Daily Schedule - {new Date(selectedDate).toLocaleDateString()}
              </CardTitle>
              <CardDescription>
                View and manage shift assignments for the selected date
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Loading schedule...</div>
              ) : assignments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No shifts scheduled for this date
                </div>
              ) : (
                <div className="space-y-4">
                  {assignments.map((assignment) => (
                    <div key={assignment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{assignment.shiftName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{assignment.userName}</span>
                        </div>
                        <Badge variant="outline">{assignment.department}</Badge>
                        <Badge variant="outline">{assignment.location}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusBadgeVariant(assignment.status)}>
                          {assignment.status}
                        </Badge>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shifts" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {shifts.map((shift) => (
              <Card key={shift.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {shift.name}
                    <Badge variant={getStatusBadgeVariant(shift.status)}>
                      {shift.status}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    {shift.startTime} - {shift.endTime}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Department:</span>
                    <span>{shift.department}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Location:</span>
                    <span>{shift.location}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Capacity:</span>
                    <span>{shift.minEmployees}-{shift.maxEmployees} employees</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Type:</span>
                    <Badge variant="outline">{shift.type}</Badge>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <AssignShiftDialog 
                      shift={shift} 
                      onAssignShift={(userId) => handleAssignShift(shift.id, userId)} 
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="conflicts" className="space-y-4">
          {conflicts.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium">No Conflicts</h3>
                <p className="text-muted-foreground">All shifts are properly scheduled without conflicts</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {conflicts.map((conflict) => (
                <Alert key={conflict.id} className="border-l-4 border-l-orange-500">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{conflict.userName}</div>
                      <div className="text-sm text-muted-foreground">{conflict.description}</div>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline">{conflict.type}</Badge>
                        <Badge variant={getSeverityBadgeVariant(conflict.severity)}>
                          {conflict.severity}
                        </Badge>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleResolveConflict(conflict.id)}
                    >
                      Resolve
                    </Button>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="swaps" className="space-y-4">
          {swapRequests.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium">No Pending Requests</h3>
                <p className="text-muted-foreground">All swap requests have been processed</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {swapRequests.map((request) => (
                <Card key={request.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Swap Request from {request.requesterName}
                      <Badge variant={getStatusBadgeVariant(request.status)}>
                        {request.status}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Requested on {new Date(request.requestedDate).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Reason:</Label>
                      <p className="text-sm text-muted-foreground mt-1">{request.reason}</p>
                    </div>
                    {request.targetUserName && (
                      <div>
                        <Label className="text-sm font-medium">Target Employee:</Label>
                        <p className="text-sm text-muted-foreground mt-1">{request.targetUserName}</p>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button 
                        variant="default" 
                        size="sm"
                        onClick={() => handleProcessSwapRequest(request.id, 'Accepted')}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleProcessSwapRequest(request.id, 'Rejected')}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

const CreateShiftDialog: React.FC<{ onCreateShift: (data: Partial<Shift>) => void }> = ({ onCreateShift }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    startTime: '',
    endTime: '',
    department: '',
    location: '',
    maxEmployees: 1,
    minEmployees: 1,
    type: 'Regular' as const
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onCreateShift(formData)
    setIsOpen(false)
    setFormData({
      name: '',
      startTime: '',
      endTime: '',
      department: '',
      location: '',
      maxEmployees: 1,
      minEmployees: 1,
      type: 'Regular'
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Shift
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Shift</DialogTitle>
          <DialogDescription>
            Define a new shift template for scheduling
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Shift Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="type">Type</Label>
              <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Regular">Regular</SelectItem>
                  <SelectItem value="Overtime">Overtime</SelectItem>
                  <SelectItem value="Night">Night</SelectItem>
                  <SelectItem value="Weekend">Weekend</SelectItem>
                  <SelectItem value="Holiday">Holiday</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="minEmployees">Min Employees</Label>
              <Input
                id="minEmployees"
                type="number"
                min="1"
                value={formData.minEmployees}
                onChange={(e) => setFormData({ ...formData, minEmployees: parseInt(e.target.value) })}
                required
              />
            </div>
            <div>
              <Label htmlFor="maxEmployees">Max Employees</Label>
              <Input
                id="maxEmployees"
                type="number"
                min="1"
                value={formData.maxEmployees}
                onChange={(e) => setFormData({ ...formData, maxEmployees: parseInt(e.target.value) })}
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Shift</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

const AssignShiftDialog: React.FC<{ shift: Shift; onAssignShift: (userId: string) => void }> = ({ shift, onAssignShift }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedUserId) {
      onAssignShift(selectedUserId)
      setIsOpen(false)
      setSelectedUserId('')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm" className="flex-1">
          <Users className="h-4 w-4 mr-1" />
          Assign
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign Shift: {shift.name}</DialogTitle>
          <DialogDescription>
            Select an employee to assign to this shift
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="employee">Employee</Label>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger>
                <SelectValue placeholder="Select an employee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user1">John Doe</SelectItem>
                <SelectItem value="user2">Jane Smith</SelectItem>
                <SelectItem value="user3">Mike Johnson</SelectItem>
                <SelectItem value="user4">Sarah Wilson</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!selectedUserId}>
              Assign Shift
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default ShiftSchedulingPage
