import React, { useState, useEffect } from 'react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Label } from '../../components/ui/label'
import { Alert, AlertDescription } from '../../components/ui/alert'
import { Badge } from '../../components/ui/badge'
import { Separator } from '../../components/ui/separator'
import { 
  Clock, 
  User, 
  CheckCircle, 
  XCircle, 
  Activity,
  LogIn,
  LogOut,
  Loader2
} from 'lucide-react'
import { toast } from 'sonner'

interface Employee {
  id: string
  employeeId: string
  firstName: string
  lastName: string
  email: string
  department: string
  position: string
  isActive: boolean
}

interface KioskActivity {
  id: string
  employeeId: string
  employeeName: string
  action: string
  timestamp: string
  isSuccessful: boolean
}

interface KioskStatus {
  kioskId: string
  status: string
  lastActivity: string
  todayCheckIns: number
  todayCheckOuts: number
  isOnline: boolean
  version: string
}

const KioskAttendancePage: React.FC = () => {
  const [employeeId, setEmployeeId] = useState('')
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [kioskStatus, setKioskStatus] = useState<KioskStatus | null>(null)
  const [recentActivity, setRecentActivity] = useState<KioskActivity[]>([])
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    loadKioskStatus()
    loadRecentActivity()

    return () => clearInterval(timer)
  }, [])

  const loadKioskStatus = async () => {
    try {
      const token = localStorage.getItem('kiosk_token')
      const response = await fetch('/api/kiosk/status', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const status = await response.json()
        setKioskStatus(status)
      }
    } catch (err) {
      console.error('Error loading kiosk status:', err)
    }
  }

  const loadRecentActivity = async () => {
    try {
      const token = localStorage.getItem('kiosk_token')
      const response = await fetch('/api/kiosk/recent-activity?limit=5', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const activities = await response.json()
        setRecentActivity(activities)
      }
    } catch (err) {
      console.error('Error loading recent activity:', err)
    }
  }

  const lookupEmployee = async () => {
    if (!employeeId.trim()) {
      setError('Please enter an Employee ID')
      return
    }

    setIsLoading(true)
    setError(null)
    setEmployee(null)

    try {
      const token = localStorage.getItem('kiosk_token')
      const response = await fetch('/api/kiosk/employee-lookup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ employeeId })
      })

      if (response.ok) {
        const emp = await response.json()
        setEmployee(emp)
      } else if (response.status === 404) {
        setError('Employee not found')
      } else {
        setError('Error looking up employee')
      }
    } catch (err) {
      setError('Network error. Please try again.')
      console.error('Employee lookup error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAttendance = async (action: 'check-in' | 'check-out') => {
    if (!employee) return

    setIsLoading(true)

    try {
      const token = localStorage.getItem('kiosk_token')
      const response = await fetch(`/api/kiosk/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          employeeId: employee.id,
          location: {
            latitude: 0,
            longitude: 0,
            locationName: 'Kiosk Location'
          }
        })
      })

      if (response.ok) {
        await response.json()
        toast.success(`${action === 'check-in' ? 'Check-in' : 'Check-out'} successful`)
        
        setEmployee(null)
        setEmployeeId('')
        loadKioskStatus()
        loadRecentActivity()
      } else {
        const error = await response.json()
        toast.error(error.message || `${action} failed`)
      }
    } catch (err) {
      toast.error('Network error. Please try again.')
      console.error(`${action} error:`, err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      lookupEmployee()
    }
  }

  const resetForm = () => {
    setEmployeeId('')
    setEmployee(null)
    setError(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Attendance Kiosk</h1>
              <p className="text-gray-600 mt-1">
                {currentTime.toLocaleDateString()} - {currentTime.toLocaleTimeString()}
              </p>
            </div>
            {kioskStatus && (
              <div className="flex items-center space-x-4">
                <Badge variant={kioskStatus.isOnline ? "default" : "destructive"}>
                  {kioskStatus.isOnline ? 'Online' : 'Offline'}
                </Badge>
                <div className="text-right text-sm text-gray-600">
                  <div>Check-ins: {kioskStatus.todayCheckIns}</div>
                  <div>Check-outs: {kioskStatus.todayCheckOuts}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Attendance Panel */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  Employee Check-in/Check-out
                </CardTitle>
                <CardDescription>
                  Enter employee ID to process attendance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Employee Lookup */}
                <div className="space-y-4">
                  <div className="flex space-x-2">
                    <div className="flex-1">
                      <Label htmlFor="employeeId">Employee ID</Label>
                      <Input
                        id="employeeId"
                        type="text"
                        placeholder="Enter Employee ID or scan badge"
                        value={employeeId}
                        onChange={(e) => setEmployeeId(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="h-12 text-lg"
                        autoFocus
                      />
                    </div>
                    <div className="flex items-end">
                      <Button 
                        onClick={lookupEmployee}
                        disabled={isLoading || !employeeId.trim()}
                        className="h-12 px-6"
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Lookup'
                        )}
                      </Button>
                    </div>
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <XCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                </div>

                {/* Employee Details */}
                {employee && (
                  <div className="space-y-4">
                    <Separator />
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                          <span className="font-semibold text-green-800">Employee Found</span>
                        </div>
                        <Badge variant={employee.isActive ? "default" : "secondary"}>
                          {employee.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Name:</span>
                          <p className="text-lg">{employee.firstName} {employee.lastName}</p>
                        </div>
                        <div>
                          <span className="font-medium">Employee ID:</span>
                          <p className="text-lg">{employee.employeeId}</p>
                        </div>
                        <div>
                          <span className="font-medium">Department:</span>
                          <p>{employee.department}</p>
                        </div>
                        <div>
                          <span className="font-medium">Position:</span>
                          <p>{employee.position}</p>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-4">
                      <Button
                        onClick={() => handleAttendance('check-in')}
                        disabled={isLoading || !employee.isActive}
                        className="flex-1 h-16 text-lg bg-green-600 hover:bg-green-700"
                      >
                        <LogIn className="mr-2 h-6 w-6" />
                        Check In
                      </Button>
                      <Button
                        onClick={() => handleAttendance('check-out')}
                        disabled={isLoading || !employee.isActive}
                        variant="outline"
                        className="flex-1 h-16 text-lg border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="mr-2 h-6 w-6" />
                        Check Out
                      </Button>
                    </div>

                    <Button
                      onClick={resetForm}
                      variant="ghost"
                      className="w-full"
                    >
                      Start Over
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Kiosk Status */}
            {kioskStatus && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-sm">
                    <Activity className="mr-2 h-4 w-4" />
                    Kiosk Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <Badge variant="default">{kioskStatus.status}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Version:</span>
                    <span>{kioskStatus.version}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Today's Check-ins:</span>
                    <span className="font-semibold">{kioskStatus.todayCheckIns}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Today's Check-outs:</span>
                    <span className="font-semibold">{kioskStatus.todayCheckOuts}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-sm">
                  <Clock className="mr-2 h-4 w-4" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentActivity.length > 0 ? (
                  <div className="space-y-3">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between text-xs">
                        <div>
                          <p className="font-medium">{activity.employeeName}</p>
                          <p className="text-gray-500">{activity.action}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-500">
                            {new Date(activity.timestamp).toLocaleTimeString()}
                          </p>
                          {activity.isSuccessful ? (
                            <CheckCircle className="h-3 w-3 text-green-500 ml-auto" />
                          ) : (
                            <XCircle className="h-3 w-3 text-red-500 ml-auto" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No recent activity</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default KioskAttendancePage
